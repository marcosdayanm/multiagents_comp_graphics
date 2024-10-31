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
        # self.pos = pos
        self.condition = condition()
        self._next_condition = self.condition

    def step(self):
        """
        Determines the next step of the LifeCell based on The Life Game Logic, checking the upper cells of the agent
        """

        neighbors = self.model.grid.get_neighbors(
            pos=self.pos,
            moore=True,
            radius=1,
            include_center=False
        )

        left = [neighbor for neighbor in neighbors if neighbor.pos == (self.pos[0] - 1, self.pos[1] + 1) or self.pos[1] == 49 and neighbor.pos == (self.pos[0] - 1, 0)]
        center = [neighbor for neighbor in neighbors if neighbor.pos == (self.pos[0], self.pos[1] + 1) or self.pos[1] == 49 and neighbor.pos == (self.pos[0], 0)]
        right = [neighbor for neighbor in neighbors if neighbor.pos == (self.pos[0] + 1, self.pos[1] + 1) or self.pos[1] == 49 and neighbor.pos == (self.pos[0] + 1, 0)]


        if len(left) == 1 and len(center) == 1 and len(right) == 1:
            l = int(left[0].condition)
            u = int(center[0].condition)
            r = int(right[0].condition)
            parents = f"{l}{u}{r}"

            if parents in ["111", "101", "010", "000"]:
                self._next_condition = False
            
            if parents in ["110", "100", "011", "001"]:
                self._next_condition = True
        
        else:
            self._next_condition = False if len(center) == 1 and (len(left) == 0 or len(right) == 0) else self.condition
    
    def advance(self):
        """
        Advance the model by one step.
        """
        self.condition = self._next_condition
