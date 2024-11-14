export function generateFormOnText(numVertices, radius, thickness) {
  const verticesPerWheel = numVertices + 1;
  const angleStep = 360 / numVertices;
  const posVertices = [];
  const negVertices = [];
  const wheelTriangles = [];

  const posCenter = thickness / 2;
  const negCenter = -thickness / 2;

  posVertices.push([0, 0, posCenter]);
  negVertices.push([0, 0, negCenter]);

  // Calcular los vértices de los rines
  for (let i = 0; i < numVertices; i++) {
    const angleRad = (i * angleStep * Math.PI) / 180;

    const x = radius * Math.cos(angleRad);
    const y = radius * Math.sin(angleRad);
    posVertices.push([x, y, posCenter]);
    negVertices.push([x, y, negCenter]);
  }

  const vertices = posVertices.concat(negVertices);

  // Unir los vértices del rin positivo
  for (let i = 2; i <= numVertices; i++) {
    wheelTriangles.push([1, i, i + 1]);
  }
  wheelTriangles.push([1, numVertices + 1, 2]);

  // Unir los vértices del rin negativo (invertir orden de vértices)
  const negCenterIndex = verticesPerWheel + 1;
  for (let i = verticesPerWheel + 2; i <= verticesPerWheel * 2 - 1; i++) {
    wheelTriangles.push([negCenterIndex, i + 1, i]);
  }
  wheelTriangles.push([
    negCenterIndex,
    verticesPerWheel + 2,
    verticesPerWheel * 2,
  ]);

  // // Unir los vértices de la cama de la llanta (dejamos esta parte como estaba)
  // for (let i = 2; i <= numVertices; i++) {
  //   wheelTriangles.push([i, i + verticesPerWheel, i + 1]);
  //   wheelTriangles.push([
  //     i + 1,
  //     i + verticesPerWheel,
  //     i + verticesPerWheel + 1,
  //   ]);
  // }
  // wheelTriangles.push([numVertices + 1, verticesPerWheel * 2, 2]);
  // wheelTriangles.push([2, verticesPerWheel * 2, verticesPerWheel + 2]);

  // unir los vértices de la cama de la llanta
  for (let i = 2; i < verticesPerWheel; i++) {
    wheelTriangles.push([i, i + verticesPerWheel, i + 1]);
    wheelTriangles.push([
      verticesPerWheel + i,
      verticesPerWheel + i + 1,
      i + 1,
    ]);
  }
  wheelTriangles.push([verticesPerWheel, verticesPerWheel * 2, 2]);
  wheelTriangles.push([verticesPerWheel * 2, verticesPerWheel + 2, 2]);

  // Generar el contenido OBJ con vértices y normales
  let objText = "";
  for (const vertex of vertices) {
    objText += `v ${vertex[0]} ${vertex[1]} ${vertex[2]}\n`;
  }

  // Función para calcular la normal de un triángulo
  function calculateNormal(v1, v2, v3) {
    const ax = v2[0] - v1[0];
    const ay = v2[1] - v1[1];
    const az = v2[2] - v1[2];
    const bx = v3[0] - v1[0];
    const by = v3[1] - v1[1];
    const bz = v3[2] - v1[2];

    const nx = ay * bz - az * by;
    const ny = az * bx - ax * bz;
    const nz = ax * by - ay * bx;

    const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
    return [nx / length, ny / length, nz / length];
  }

  // Generar los triángulos y sus normales
  let normalIndex = 1;
  for (const triangle of wheelTriangles) {
    const v1 = vertices[triangle[0] - 1];
    const v2 = vertices[triangle[1] - 1];
    const v3 = vertices[triangle[2] - 1];

    // Calcular la normal del triángulo
    const normal = calculateNormal(v1, v2, v3);

    // Añadir la normal al archivo OBJ
    objText += `vn ${normal[0]} ${normal[1]} ${normal[2]}\n`;

    // Añadir la cara usando la normal
    objText += `f ${triangle[0]}//${normalIndex} ${triangle[1]}//${normalIndex} ${triangle[2]}//${normalIndex}\n`;
    normalIndex++;
  }

  return objText;
}
