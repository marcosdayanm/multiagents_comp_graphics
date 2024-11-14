// Función para leer el archivo .obj
export function parseOBJFromFile(filePath) {
  return fetch(filePath)
    .then((response) => response.text())
    .then((objString) => parseOBJ(objString));
}

// Función para parsear el archivo OBJ
function parseOBJ(objString) {
  const positions = [];
  const normals = [];
  const indices = [];
  const colors = [];

  const lines = objString.split("\n");

  // Definir un color predeterminado (blanco, por ejemplo)
  const defaultColor = [0.5, 0.0, 0.5]; // Color blanco RGB

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const type = parts[0];

    if (type === "v") {
      // Vértices
      positions.push(...parts.slice(1).map(Number));
      colors.push(...defaultColor); // Asignar color predeterminado a cada vértice
    } else if (type === "vn") {
      // Normales
      normals.push(...parts.slice(1).map(Number));
    } else if (type === "f") {
      // Caras
      for (const vertex of parts.slice(1)) {
        const vertexIndex = parseInt(vertex.split("/")[0], 10) - 1; // Solo índice de posición
        indices.push(vertexIndex);
      }
    }
  }

  return {
    a_position: {
      numComponents: 3,
      data: positions,
    },
    a_normal: {
      numComponents: 3,
      data: normals,
    },
    a_color: {
      numComponents: 3,
      data: colors,
    },
    indices: indices,
  };
}

const parsedOBJ = parseOBJFromFile("./wheel.obj");
console.log(parsedOBJ);
