from mesa.visualization import CanvasGrid, ChartModule, PieChartModule
from mesa.visualization import ModularServer
from mesa.visualization import Slider

from model import LifeGameGrid


# The colors of the portrayal will depend on the life_cell's condition.
# COLORS = {"Alive": "#FFFFFF", "Dead": "#000000"}
COLORS = {"Alive": "#000000", "Dead": "#FFFFFF"}

# The portrayal is a dictionary that is used by the visualization server to
# generate a visualization of the given agent.
def life_game_portrayal(life_cell):
    if life_cell is None:
        return
    portrayal = {"Shape": "rect", "w": 1, "h": 1, "Filled": "true", "Layer": 0}
    (x, y) = life_cell.pos
    portrayal["x"] = x
    portrayal["y"] = y
    portrayal["Color"] = COLORS["Alive" if life_cell.condition == True else "Dead"]

    return portrayal

# The canvas element will be 500x500 pixels, with each cell being 5x5 pixels.
# The portrayal method will fill each cell with a representation of the life_cell
# that is in that cell.
canvas_element = CanvasGrid(life_game_portrayal, 50, 50, 500, 500)

# The chart will plot the number of each type of life_cell over time.
life_cell_chart = ChartModule(
    [{"Label": label, "Color": color} for label, color in COLORS.items()]
)

# The pie chart will plot the number of each type of life_cell at the current step.
pie_chart = PieChartModule(
    [{"Label": label, "Color": color} for label, color in COLORS.items()]
)

# The model parameters will be set by sliders controlling the initial density
model_params = {
    "height": 50,
    "width": 50,
    "density": Slider("Life Cell Density", 0.65, 0.02, 1.0, 0.01),
    "simulation_mode": Slider("Simulation Mode", 1, 1, 2, 1),
}

# The modular server is a special visualization server that allows multiple
# elements to be displayed simultaneously, and for each of them to be updated
# when the user interacts with them.
# server = ModularServer(
#     LifeGameGrid, [canvas_element, life_cell_chart, pie_chart], "Life Game", model_params
# )
server = ModularServer(
    LifeGameGrid, [canvas_element, life_cell_chart, pie_chart], "Life Game", model_params
)

server.launch()