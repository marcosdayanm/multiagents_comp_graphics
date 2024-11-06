import random
import mesa
from mesa import Model, DataCollector
from mesa.space import SingleGrid
from mesa.time import SimultaneousActivation 

from agent import LifeCell

class LifeGameGrid(Model):
    """
        Simple Life Game Grid model.

        Attributes:
            height, width: Grid size.
            density: What fraction of grid cells have a tree in them.
    """

    def __init__(self, height=50, width=50, density=0.65, simulation_mode=1):
        """
        Create a new Life Game Grid model.
        
        Args:
            height, width: The size of the grid to model
            density: What fraction of grid cells are alive.
        """

        # Set up model objects
        # SimultaneousActivation is a Mesa object that runs all the agents at the same time. 
        # This is necessary in this model because the next state of each cell depends on the current state of all its neighbors -- before they've changed.
        # This activation method requires that all the agents have a step() and an advance() method. 
        # The step() method computes the next state of the agent, and the advance() method sets the state to the new computed state.
        super().__init__()
        self.schedule = SimultaneousActivation(self)
        self.grid = SingleGrid(height, width, torus=False if simulation_mode == 1 else True)
        self.current_step = 0
        self.simulation_mode = simulation_mode

        # A datacollector is a Mesa object for collecting data about the model.
        # We'll use it to count the number of trees in each condition each step.
        self.datacollector = DataCollector(
            {
                "Alive": lambda m: self.count_type(m, True),
                "Dead": lambda m: self.count_type(m, False),
            }
        )

        # Place a tree in each cell with Prob = density
        # coord_iter is an iterator that returns positions as well as cell contents.
        for contents, (x, y) in self.grid.coord_iter():
            # Create a Life Cell
            life_cell = LifeCell((x, y), self)
            
            if self.simulation_mode == 1:
                life_cell.condition = random.choices([True, False], weights=(density*100 , 100 - (density * 100)), k=1)[0] if y == 49 else False
            elif self.simulation_mode == 2:
                life_cell.condition = random.choices([True, False], weights=(density*100 , 100 - (density * 100)), k=1)[0]

            self.grid.place_agent(life_cell, (x, y))
            self.schedule.add(life_cell)

        self.running = True
        self.datacollector.collect(self)

    def step(self):
        """
        Have the scheduler advance each cell by one step
        """
        self.schedule.step()
        # collect data
        self.datacollector.collect(self)

        self.current_step += 1

        # Halt if no more alive cells or if the simulation gets finished
        if self.count_type(self, True) == 0 or (self.simulation_mode == 1 and self.current_step >= 49):
            self.running = False

    @staticmethod
    def count_type(model, life_cell_condition):
        """
        Helper method to count LifeCells in a given condition in a given model.
        """
        count = 0
        for tree in model.schedule.agents:
            if tree.condition == life_cell_condition:
                count += 1
        return count