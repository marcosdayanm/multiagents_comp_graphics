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

  // calcular los vértices de los rines
  for (let i = 0; i < numVertices; i++) {
    const angleRad = (i * angleStep * Math.PI) / 180;

    const x = radius * Math.cos(angleRad);
    const y = radius * Math.sin(angleRad);
    posVertices.push([x, y, posCenter]);
    negVertices.push([x, y, negCenter]);
  }

  const vertices = posVertices.concat(negVertices);

  // unir los vértices del rin positivo
  for (let i = 3; i <= verticesPerWheel; i++) {
    wheelTriangles.push([1, i - 1, i]);
  }
  wheelTriangles.push([1, verticesPerWheel, 2]);

  // unir los vértices del rin negativo
  for (let i = verticesPerWheel + 3; i <= verticesPerWheel * 2; i++) {
    wheelTriangles.push([verticesPerWheel + 1, i, i - 1]);
  }
  wheelTriangles.push([
    verticesPerWheel + 1,
    verticesPerWheel + 2,
    verticesPerWheel * 2,
  ]);

  // // unir los vértices de la cama de la llanta
  // for (let i = 2; i < verticesPerWheel; i++) {
  //   wheelTriangles.push([i, i + verticesPerWheel, i + 1]);
  //   wheelTriangles.push([
  //     verticesPerWheel + i,
  //     verticesPerWheel + i + 1,
  //     i + 1,
  //   ]);
  // }
  // wheelTriangles.push([verticesPerWheel, verticesPerWheel * 2, 2]);
  // wheelTriangles.push([verticesPerWheel * 2, verticesPerWheel + 2, 2]);

  // unir los vértices de la cama de la llanta
  for (let i = 2; i < verticesPerWheel; i++) {
    wheelTriangles.push([i, i + verticesPerWheel, i + 1]);
    wheelTriangles.push([
      i + 1,
      i + verticesPerWheel,
      i + verticesPerWheel + 1,
    ]);
  }
  // cerrar la cama de la llanta correctamente
  wheelTriangles.push([verticesPerWheel, verticesPerWheel * 2, 2]);
  wheelTriangles.push([2, verticesPerWheel * 2, verticesPerWheel + 2]);

  let objText = "";
  for (const vertex of vertices) {
    objText += `v ${vertex[0]} ${vertex[1]} ${vertex[2]}\n`;
  }

  for (const triangle of wheelTriangles) {
    objText += `f ${triangle[0]} ${triangle[1]} ${triangle[2]}\n`;
  }

  return objText;
}
