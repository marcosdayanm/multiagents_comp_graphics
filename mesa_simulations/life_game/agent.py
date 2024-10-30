from mesa import Agent
import random

class LifeCell(Agent):
    """
        A LifeCell.
        
        Attributes:
            x, y: Grid coordinates
            condition: Can be True meaninf the LifeCell is alive, or False, meaning the LifeCell is dead
            unique_id: (x,y) tuple.

            unique_id isn't strictly necessary here, but it's good practice to give one to each agent anyway.
    """

    def __init__(self, pos, model, condition=lambda: random.choice([True, False])): # True = Alive, False = Dead
        """
        Create a new LifeCell.

        Args:
            pos: The LifeCell's coordinates on the grid.
            model: standard model reference for agent.
            condition: True or False, or randomly one of them
        """
        super().__init__(pos, model)
        self.pos = pos
        self.condition = condition
        self._next_condition = None

    def step(self):
        """
        Determines the next step of the LifeCell based on The Life Game Logic, checking the upper cells of the agent
        """

        neighbors = self.model.grid.get_neighborhood(
            pos=self.pos,
            moore=True,
            radius=1,
            include_center=False
        )

        filtered_neighbors = [neighbor.condition for neighbor in neighbors if neighbor.pos[1] > self.pos[1]]

        if len(filtered_neighbors) == 3:
            l, u, r = filtered_neighbors[0], filtered_neighbors[1], filtered_neighbors[2]

            # Dead
            #        111                   101                     010                000
            if (l and u and r) or (l and not u and r) or (not l and u and not r) or not (l and u and r):
                self._next_condition = False
            
            # Alive
            #         110                    100                     001                        001                       
            if (l and u and not r) or (l and not u and not r) or (not l and not u and r) or (not l and not u and r):
                self._next_condition = True
        

    
    def advance(self):
        """
        Advance the model by one step.
        """
        self.condition = self._next_condition