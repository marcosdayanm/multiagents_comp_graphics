from mesa import Agent

class RoombaAgent(Agent):
    """
    Roomba Agent
    Attributes:
        color
        steps_taken
        battery_level
        is_charging
        target_coord
        charger_wait_next_move
        is_pathfinding_active
        obstacle_map
        trash_map
        charger_map
        visited_cells_map
        pause_by_charger_path
        charges_number
    """
    def __init__(self, unique_id, model):
        """
        Creates a new random agent.
        Args:
            unique_id: Unique agent identifier.
            model: Model where the agent is located.
        """
        super().__init__(unique_id, model)
        self.color = "green"
        self.steps_taken = 0
        self.battery_level = 100
        self.is_charging = False
        self.target_coord = None
        self.charger_wait_next_move = None
        self.is_pathfinding_active = False
        self.obstacle_map = set()
        self.trash_map = set()
        self.charger_map = set()
        self.visited_cells_map = set()
        self.pause_by_charger_path = []
        self.charges_number = 0

    
    def handle_current_cell(self):
        """
        This method decides how the agent should act in the cell it is based on the cell's conditions
        """
        cell_contents = self.model.grid.get_cell_list_contents(self.pos)
        is_charger_agent = any(isinstance(agent, ChargerAgent) for agent in cell_contents)
        trash_agents = [agent for agent in cell_contents if isinstance(agent, TrashAgent)]
        floor_agent = [agent for agent in cell_contents if isinstance(agent, FloorAgent)]

        if len(floor_agent) == 1:
            floor_agent[0].color = "#ffffff"


        if is_charger_agent and self.battery_level < 100:
            self.is_charging = True
            return False
        
        is_go_to_charger = self.is_go_to_charger()
        if not is_go_to_charger or (self.target_coord and is_go_to_charger and self.pathfinding_heuristic(self.pos, self.target_coord) < self.battery_level - 3): # revisar si aunque vaya al cargador si se encuentra con una basura la puede limpiar, por el tema de la batería
            for trash_agent in trash_agents:
                    if trash_agent in self.model.schedule.agents:  
                        self.model.schedule.remove(trash_agent)
                    if trash_agent in self.model.grid[self.pos]: 
                        self.model.grid.remove_agent(trash_agent)
                        self.trash_map.discard(self.pos)
                        self.battery_level -= 1
                        self.model.cleaned_trash += 1

        self.model.visited_cells.add(self.pos) # para las gráficas        
        return True
    

    def is_go_to_charger(self):
        """
        Flag function to determine if the agent should go to a charger
        """
        if self.battery_level > 25:
            return False
        return True

    def handle_charging_state(self) -> bool:
        """
        This method handles the charging state of the agent
        """
        if self.is_charging == False:
            return True
        elif self.battery_level == 100:
            self.is_charging = False
            return True
        elif self.battery_level >= 95:
            self.charges_number += 1
            self.model.total_charges[self.unique_id - 1000] = self.charges_number
            self.battery_level = 100
            return False
        else:
            self.battery_level += 5
            return False

    def check_battery_level(self) -> bool:
        """
        This method checks if the battery level is enough to continue, and changes the agent color based on it
        """
        if self.battery_level <=0:
            self.color = "red"
            return False
        elif self.battery_level <= 25:
            self.color = "#b58900" # dark yellow
        else:
            self.color = "green"
        
        return True
    

    def determine_nearest_charger(self):
        """
        This method determines the nearest charger to the agent based on the euclidean heuristic to then start to advance in that direction
        """
        list_charger_map = list(self.charger_map)
        closer_value = self.pathfinding_heuristic(self.pos, list_charger_map[0])
        closer = list_charger_map[0]
        for pos in self.charger_map:
            if self.pathfinding_heuristic(self.pos, pos) < closer_value:
                closer = pos

        return closer
    

    def is_charger_taken(self, pos):
        """
        This method chacks if the charger is taken by another roomba agent
        """
        cell_contents = self.model.grid.get_cell_list_contents(pos)
        is_charger_agent = any(isinstance(agent, ChargerAgent) for agent in cell_contents)
        is_roomba_agent = any(isinstance(agent, RoombaAgent) for agent in cell_contents)

        return is_charger_agent and is_roomba_agent


    def initialize_pathfinding(self, target_coord):
        """
        This helper function initializes the pathfinding algorithm variables and flags to find the path to the target
        """
        self.target_coord = target_coord
        self.pause_by_charger_path.append(self.pos)
        self.is_pathfinding_active = True

    def search_coord(self):
        """
        This method performs the pathfinding algorithm to find the path based on an heuristic, and moving to the most convenient cell
        """
        if not self.is_pathfinding_active:
            return self.pos

        all_neighbors = self.model.grid.get_neighborhood(
            self.pos,
            moore=True,
            include_center=False
        )

        valid_moves = []
        for cell in all_neighbors:
            cell_contents = self.model.grid.get_cell_list_contents(cell)
            if not any(isinstance(agent, ObstacleAgent) for agent in cell_contents):
                valid_moves.append(cell)

        if not valid_moves:
            return self.pos

        next_move = min(valid_moves, key=lambda cell: self.pathfinding_heuristic(cell, self.target_coord))
        if next_move == self.pos:
            self.is_pathfinding_active = False
            self.target_coord = None

        self.pause_by_charger_path.append(next_move)
        return next_move

    def pathfinding_heuristic(self, a, b):
        """
        Method to calculate the euclidean distance to compare between its options as an heuristic for the pathfinding algorithm
        """
        return abs(a[0] - b[0]) + abs(a[1] - b[1])


    def return_for_continuing_exploring(self):
        """
        It will reconstruct the path to continue exploring where it left off before the need of charging
        """
        return self.pause_by_charger_path.pop()
    
    def pull_information_from_another_roomba(self, roomba_agent):
        """
        In case there is another roomba in a neighbor cell, it will pull the information of the charger, trash, obstacle and visited cells maps
        """
        self.charger_map.update(roomba_agent.charger_map)
        self.trash_map.update(roomba_agent.trash_map)
        self.obstacle_map.update(roomba_agent.obstacle_map)
        self.visited_cells_map.update(roomba_agent.visited_cells_map)
        self.battery_level -= 1


    def determine_next_move(self) -> tuple[int, int]:
        """ 
        Collects information of the neighbor cells of the agent to take a decision for the next move for this and the future steps
        """
        all_neighbor_cells = self.model.grid.get_neighborhood(
            self.pos,
            moore=True, # 8 vecinos
            include_center=False
        )

        neighbor_cells = [
                        cell for cell in all_neighbor_cells 
                        if cell not in self.obstacle_map 
                        #   and cell not in self.visited_cells_map
                          ]

        temp_free_spaces = set()
        temp_trash_spaces = set()
        temp_obstacle_spaces = set()
        temp_charger_spaces = set()
        next_move = self.pos

        for cell in neighbor_cells:
            cell_contents = self.model.grid.get_cell_list_contents(cell)
            is_obstacle_agent = any(isinstance(agent, ObstacleAgent) for agent in cell_contents)
            if len(cell_contents) == 1 and not is_obstacle_agent:
                temp_free_spaces.add(cell)
            else:
                is_trash_agent = any(isinstance(agent, TrashAgent) for agent in cell_contents)
                is_charger_agent = any(isinstance(agent, ChargerAgent) for agent in cell_contents)

                if is_trash_agent: temp_trash_spaces.add(cell)
                if is_obstacle_agent: temp_obstacle_spaces.add(cell)
                if is_charger_agent: temp_charger_spaces.add(cell)

            # En caso de que haya una roomba en una celda adyacente, se jalará la información que haya recopilado la roomba para tomar mejores decisiones
            roomba_agent = [agent for agent in cell_contents if isinstance(agent, RoombaAgent)]
            if len(roomba_agent) == 1:
                self.pull_information_from_another_roomba(roomba_agent[0])

            new_free_spaces = temp_free_spaces - self.visited_cells_map

        if any(temp_charger_spaces) and self.battery_level < 60 and (self.model.current_step / self.model.max_steps < 0.9):
            next_move = self.random.choice(list(temp_charger_spaces))
            if self.is_charger_taken(next_move):
                next_move = self.pos
        elif any(temp_trash_spaces):
            next_move = self.random.choice(list(temp_trash_spaces))
            temp_trash_spaces.discard(next_move)
        elif any(new_free_spaces):
            next_move = self.random.choice(list(new_free_spaces))
        elif any(temp_free_spaces):
            next_move = self.random.choice(list(temp_free_spaces))

        self.charger_map.update(temp_charger_spaces)
        self.trash_map.update(temp_trash_spaces)
        self.obstacle_map.update(temp_obstacle_spaces)
        self.visited_cells_map.add(self.pos)

        return next_move
    

    def subsumption(self):
        """
        Administrates the agent's priorities based on the subsumption architecture
        """
        if not self.handle_charging_state(): # Regresa Flase si se está cargando
            return

        if not self.handle_current_cell(): # escoge la acción dependiendo el contenido de la celda en la que esté
            return

        if self.is_go_to_charger(): # si la batería es menor a 25 regresa True, se va a un cargador
            if not self.is_pathfinding_active:
                target = self.determine_nearest_charger()
                self.initialize_pathfinding(target)

            next_move = self.search_coord()

            if self.is_charger_taken(next_move):
                next_move = self.pos

        elif len(self.pause_by_charger_path) > 0:
            next_move = self.return_for_continuing_exploring()

        else: next_move = self.determine_next_move()
        
        if next_move != self.pos:
            self.steps_taken += 1
            self.battery_level -= 1
            self.model.grid.move_agent(self, next_move)


    def step(self):
        """ 
        Method that runs on each step of the model, in this case it will first check if the agent has enough battery to continue, then it will run the subsumption method
        """
        if not self.check_battery_level(): # se le acabó la batería
            return
        
        # Definir dónde está el cargador de donde sale
        if self.model.current_step == 1:
            self.charger_map.add(self.pos)
            self.visited_cells_map.add(self.pos)
        self.subsumption()

    

class ObstacleAgent(Agent):
    """
    Obstacle agent. Just to add obstacles to the grid.
    """
    def __init__(self, unique_id, model):
        super().__init__(unique_id, model)
        self.color = "gray"

    def step(self):
        pass  


class TrashAgent(Agent):
    """
    Trash agent. Just to add trash to the grid.
    """
    def __init__(self, unique_id, model):
        super().__init__(unique_id, model)
        self.color = "brown"

    def step(self):
        pass 


class ChargerAgent(Agent):
    """
    Charger agent.
    """
    def __init__(self, unique_id, model):
        super().__init__(unique_id, model)
        self.color = "blue"

    def step(self):
        pass 

class FloorAgent(Agent):
    """
    Floor agent.
    """
    def __init__(self, unique_id, model):
        super().__init__(unique_id, model)
        self.color = "#f2f2f2"

    def step(self):
        pass  