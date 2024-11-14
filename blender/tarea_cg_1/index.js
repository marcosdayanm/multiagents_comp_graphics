import fs from "fs";

import { parseArgv } from "./parseArgv.js";
// import { generateFormOnText } from "./generateFormOnText.js";
import { generateFormOnText } from "./generateFormOnTextWithNormals.js";

const { numSides, radius, thickness } = parseArgv();

const objText = generateFormOnText(numSides, radius, thickness);

// Guardar el archivo OBJ
fs.writeFileSync("wheel.obj", objText);
console.log("Archivo OBJ generado: wheel.obj");
