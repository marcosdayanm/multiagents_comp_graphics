from mesa import Model, agent
from mesa.time import RandomActivation
from mesa.space import MultiGrid
from mesa import DataCollector
from agent import RandomAgent, ObstacleAgent, TrashAgent

class RandomModel(Model):
    """ 
    Creates a new model with random agents.
    Args:
        N: Number of agents in the simulation
        height, width: The size of the grid to model
    """
    def __init__(self, N, width, height):
        self.num_agents = N
        # Multigrid is a special type of grid where each cell can contain multiple agents.
        self.grid = MultiGrid(width,height,torus = False) 

        # RandomActivation is a scheduler that activates each agent once per step, in random order.
        self.schedule = RandomActivation(self)
        
        self.running = True 

        self.datacollector = DataCollector( 
        agent_reporters={"Steps": lambda a: a.steps_taken if isinstance(a, RandomAgent) else 0})

        # Creates the border of the grid
        border = [(x,y) for y in range(height) for x in range(width) if y in [0, height-1] or x in [0, width - 1]]

        trashes = [(x,y) for y in range(height) for x in range(width) if self.random.random() < 0.05 and (y not in [0, height-1] and x not in [0, width - 1])]

        # Add obstacles to the grid
        for pos in border:
            obs = ObstacleAgent(pos, self)
            self.grid.place_agent(obs, pos)

        for pos in trashes:
            trash = TrashAgent(pos, self)
            self.grid.place_agent(trash, pos)

        # Function to generate random positions
        pos_gen = lambda w, h: (self.random.randrange(w), self.random.randrange(h))

        # Add the agent to a random empty grid cell
        for i in range(self.num_agents):

            a = RandomAgent(i+1000, self) 
            self.schedule.add(a)

            pos = pos_gen(self.grid.width, self.grid.height)

            while (not self.grid.is_cell_empty(pos)):
                pos = pos_gen(self.grid.width, self.grid.height)

            self.grid.place_agent(a, pos)
        
        self.datacollector.collect(self)

    def step(self):
        '''Advance the model by one step.'''
        self.schedule.step()
        self.datacollector.collect(self)