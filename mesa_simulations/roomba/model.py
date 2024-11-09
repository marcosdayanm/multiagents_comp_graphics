import mesa
from mesa import Model, agent
from mesa.time import RandomActivation
from mesa.space import MultiGrid
from mesa import DataCollector
from agent import ChargerAgent, RoombaAgent, ObstacleAgent, TrashAgent, FloorAgent
from scheduler import RandomActivationByTypeFiltered

class RandomModel(Model):
    """ 
    Creates a new model with Roomba agents.\n
    Each agent is responsible for: \n
    - Managing their charging level\n
    - Learning where are the chargers that they face in their cleaning routine\n
    - Going to the nearest charger they know once they start to run out of battery, calculating the euclidean distance among the chargers they know and the possible steps they can take\n
    - Deciding which one is the best move in each step, depending on if there is garbage, if they have visited the cell or not, or if there is a charger and they kind of need more battery\n
    - Deciding if is it worth to spend energy cleaning or if they need to save if so they do not run out of battery\n
    """
    def __init__(self, N, width, height, obstacle_density, garbage_density, max_steps):
        
        self.num_agents = N
        self.grid = MultiGrid(width,height,torus = False) 
        self.running = True 
        self.current_step = 1
        self.max_steps = max_steps
        self.schedule = RandomActivationByTypeFiltered(self)


        self.total_trash = 0
        self.cleaned_trash = 0
        self.total_cells = width * height
        self.visited_cells = set()
        self.total_charges = {i: 0 for i in range(N)}

        # Function to generate random positions
        pos_gen = lambda w, h: (self.random.randrange(w), self.random.randrange(h))

        # Add the agent to a random empty grid cell
        for i in range(self.num_agents):

            a = RoombaAgent(i+1000, self)
            c = ChargerAgent(i+1000, self)
            self.schedule.add(a)
            self.schedule.add(c)

            pos = pos_gen(self.grid.width, self.grid.height)

            while (not self.grid.is_cell_empty(pos)):
                pos = pos_gen(self.grid.width, self.grid.height)

            self.grid.place_agent(a, pos)
            self.grid.place_agent(c, pos)


        obstacles = [(x,y) for y in range(height) for x in range(width) if self.random.random() < obstacle_density and self.grid.is_cell_empty((x,y))]

        garbage = [(x,y) for y in range(height) for x in range(width) if self.random.random() < garbage_density and (y not in [0, height-1] and x not in [0, width - 1]) and self.grid.is_cell_empty((x,y))]

        # Add obstacles to the grid
        for pos in obstacles:
            if self.grid.is_cell_empty(pos):
                obs = ObstacleAgent(pos, self)
                self.grid.place_agent(obs, pos)
                self.total_cells -= 1

        for pos in garbage:
            if self.grid.is_cell_empty(pos):
                floor = FloorAgent(pos, self)
                trash = TrashAgent(pos, self)
                self.grid.place_agent(floor, pos)
                self.grid.place_agent(trash, pos)
                self.total_trash += 1

        
        for y in range(height):
            for x in range(width):
                if self.grid.is_cell_empty((x,y)):
                    floor = FloorAgent((x,y), self)
                    self.grid.place_agent(floor, (x,y))

        # Obtener los IDs de los agentes
        agent_ids = [a.unique_id - 1000 for a in self.schedule.agents if isinstance(a, RoombaAgent)]

        # Definir model_reporters con datos por agente
        model_reporters = {
            "Trash Cleaned (%) Through Step Number": lambda m: (m.cleaned_trash / m.total_trash) * 100 if m.total_trash > 0 else 0,
            "Visited Cells (%) Through Step Number": lambda m: (len(m.visited_cells) / m.total_cells) * 100
        }

        for aid in  agent_ids: # range(max_num_agents): 
            model_reporters[f"Steps Agent {aid}"] = (lambda m, aid=aid: next((a.steps_taken for a in m.schedule.agents if a.unique_id - 1000 == aid), 0))
            model_reporters[f"Battery Level Agent {aid}"] = (lambda m, aid=aid: next((a.battery_level for a in m.schedule.agents if a.unique_id - 1000 == aid), 0))
            model_reporters[f"Known Chargers Agent {aid}"] = (lambda m, aid=aid: next((len(a.charger_map) for a in m.schedule.agents if a.unique_id - 1000 == aid), 0))

        # Inicializar DataCollector con model_reporters
        self.datacollector = DataCollector(
            model_reporters=model_reporters
        )

        
        self.datacollector.collect(self)

    def step(self):
        '''Advance the model by one step.'''
        self.schedule.step()
        self.datacollector.collect(self)
        self.current_step += 1

        if self.current_step >= self.max_steps:
            self.running = False