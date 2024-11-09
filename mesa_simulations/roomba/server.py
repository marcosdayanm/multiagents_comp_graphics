from model import RandomModel, ObstacleAgent, TrashAgent, ChargerAgent, FloorAgent
from mesa.visualization import CanvasGrid, BarChartModule, ChartModule
from mesa.visualization import ModularServer, Slider

import random

def agent_portrayal(agent):
    """
    This function receives an agent and returns a portrayal of it, differentiationg between the different types of agents
    """
    if agent is None: return
    
    portrayal = {"Shape": "circle",
                 "Filled": "true",
                 "Layer": 1,
                 "Color": agent.color,
                 "r": 0.7}

    if (isinstance(agent, ObstacleAgent)):
        portrayal["Layer"] = 1
        portrayal["r"] = 0.4

    if (isinstance(agent, ChargerAgent)):
        portrayal = {"Shape": "rect", "w": 0.9, "h": 0.9, "Filled": "false", "Layer": 0, "Color": agent.color}

    if (isinstance(agent, FloorAgent)):
        portrayal = {"Shape": "rect", "w": 0.9, "h": 0.9, "Filled": "false", "Layer": 0, "Color": agent.color}

    if (isinstance(agent, TrashAgent)):
        portrayal["Layer"] = 0
        portrayal["r"] = 0.2

    return portrayal


def get_charts(params):
    """
    This function returns the charts that will be displayed on the server
    """
    max_num_agents = 10
    hex_digits = [str(i) for i in range(10)] + ["A", "B", "C", "D", "E", "F"]
    random_color = lambda: "#" + "".join([hex_digits[random.randint(0, 15)] for i in range(6)])

    steps_chart = BarChartModule(
        [{"Label": f"Steps Agent {i}", "Color": random_color()} for i in range(max_num_agents)],
        data_collector_name='datacollector'
    )

    battery_chart = ChartModule(
        [{"Label": f"Battery Level Agent {i}", "Color": random_color()} for i in range(max_num_agents)],
        data_collector_name='datacollector'
    )

    known_chargers_chart = BarChartModule(
        [{"Label": f"Known Chargers Agent {i}", "Color": random_color()} for i in range(max_num_agents)],
        data_collector_name='datacollector'
    )

    trash_cleaned_chart = ChartModule(
    [{"Label": "Trash Cleaned (%) Through Step Number", "Color": "#FFDD00"}],
    data_collector_name='datacollector'
    )

    visited_cells_chart = ChartModule(
        [{"Label": "Visited Cells (%) Through Step Number", "Color": "#00AAFF"}],
        data_collector_name='datacollector'
    )

    return [battery_chart, trash_cleaned_chart, visited_cells_chart, known_chargers_chart, steps_chart]

model_params = {"N": Slider("Roomba number", 4, 1, 10, 1)
            , "max_steps": Slider("Max Steps", 500, 1, 1000, 1)
            , "obstacle_density": Slider("Obstacle Density", 0.1, 0.01, 0.3, 0.01)
            , "garbage_density": Slider("Garbage Density", 0.25, 0.01, 0.5, 0.01)
            , "width":20
            , "height":20
                }

grid = CanvasGrid(agent_portrayal, 20, 20, 500, 500)



view_elements = get_charts(model_params)

view_elements.insert(0, grid)


server = ModularServer(RandomModel
                        ,  view_elements
                        , "Roomba"
                        , model_params)
                       
server.port = 8521 # The default
server.launch()