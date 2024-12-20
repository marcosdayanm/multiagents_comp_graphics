"use strict";

import * as twgl from "twgl-base.js";
import GUI from "lil-gui";
import { v3, m4 } from "../libs/starter_3D_lib";
import { parseOBJFromFile } from "./objectLoader.js";

// Read the whole input file as a string
// https://vitejs.dev/guide/assets.html#importing-asset-as-string
// Define the shader code, using GLSL 3.00
import vsGLSL from "./../assets/shaders/vs_phong.glsl?raw";
import fsGLSL from "./../assets/shaders/fs_phong.glsl?raw";
import { cubeFaceColors } from "../00_common/shapes";

const pivot = {
  t: {
    x: 0,
    y: 0,
    z: 0,
  },
};

// Variables used for the object, and coltrolled from the UI
const object = {
  model: {
    ambientColor: [0.3, 0.6, 0.6, 1.0],
    diffuseColor: [0.3, 0.6, 0.6, 1.0],
    specularColor: [0.3, 0.6, 0.6, 1.0],
    shininess: 60.0,
  },
  transforms: {
    // Translation
    t: {
      x: 0,
      y: 0,
      z: 0,
    },
    // Rotation in degrees
    rd: {
      x: 0,
      y: 0,
      z: 0,
    },
    // Rotation in radians
    rr: {
      x: 0,
      y: 0,
      z: 0,
    },
    // Scale
    s: {
      x: 1.2,
      y: 1.2,
      z: 1.2,
    },
    s_all: 1.2,
  },
};

const settings = {
  // Speed in degrees
  rotationSpeed: {
    x: 0,
    y: 30,
    z: 0,
  },
  cameraPosition: {
    x: 0,
    y: 0,
    z: 10,
  },
  lightPosition: {
    x: 10,
    y: 10,
    z: 10,
  },
  ambientColor: [0.5, 0.5, 0.5, 1.0],
  diffuseColor: [0.5, 0.5, 0.5, 1.0],
  specularColor: [0.5, 0.5, 0.5, 1.0],
};

const duration = 1000; // ms
let then = 0;

let arrays = undefined;
let pivotArrays = undefined;
let programInfo = undefined;
let vao = undefined;
let pivotVao = undefined;
let bufferInfo = undefined;
let pivotBufferInfo = undefined;

function setupWorldView(gl) {
  // Field of view of 60 degrees, in radians
  const fov = (60 * Math.PI) / 180;
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

  // Matrices for the world view
  const projectionMatrix = m4.perspective(fov, aspect, 1, 200);

  const cameraPosition = [
    settings.cameraPosition.x,
    settings.cameraPosition.y,
    settings.cameraPosition.z,
  ];
  const target = [0, 0, 0];
  const up = [0, 1, 0];
  const cameraMatrix = m4.lookAt(cameraPosition, target, up);

  const viewMatrix = m4.inverse(cameraMatrix);

  const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
  return viewProjectionMatrix;
}

// Function to do the actual display of the objects
function drawScene(gl) {
  // Compute time elapsed since last frame
  let now = Date.now();
  let deltaTime = now - then;
  const fract = deltaTime / duration;
  then = now;

  twgl.resizeCanvasToDisplaySize(gl.canvas);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 1);
  // esta linea comentada es para que lo que dibujes después se vea,
  // gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // tell webgl to cull faces
  gl.enable(gl.CULL_FACE);

  // All objects will use the same program and vertices
  gl.useProgram(programInfo.program);

  const viewProjectionMatrix = setupWorldView(gl);

  // Convert the global transform values into twgl vectors
  let v3_trans = v3.create(
    object.transforms.t.x,
    object.transforms.t.y,
    object.transforms.t.z
  );
  let v3_scale = v3.create(
    object.transforms.s.x,
    object.transforms.s.y,
    object.transforms.s.z
  );

  // Variable with the position of the light
  let v3_lightPosition = v3.create(
    settings.lightPosition.x,
    settings.lightPosition.y,
    settings.lightPosition.z
  );
  let v3_cameraPosition = v3.create(
    settings.cameraPosition.x,
    settings.cameraPosition.y,
    settings.cameraPosition.z
  );

  let globalUniforms = {
    u_viewWorldPosition: v3_cameraPosition,
    u_lightWorldPosition: v3_lightPosition,
    u_ambientLight: settings.ambientColor,
    u_diffuseLight: settings.diffuseColor,
    u_specularLight: settings.specularColor,
  };
  twgl.setUniforms(programInfo, globalUniforms);

  const traMat = m4.translation(v3_trans);
  const pivotTranslationToOrigin = m4.translation([
    -pivot.t.x,
    -pivot.t.y,
    -pivot.t.z,
  ]);
  const pivotTranslationBack = m4.translation([
    pivot.t.x,
    pivot.t.y,
    pivot.t.z,
  ]);
  const rotXMat = m4.rotationX(object.transforms.rr.x);
  const rotYMat = m4.rotationY(object.transforms.rr.y);
  const rotZMat = m4.rotationZ(object.transforms.rr.z);
  const scaMat = m4.scale(v3_scale);

  // --- DIBUJAR EL CUBO ---
  let world = m4.identity();
  world = m4.multiply(traMat, world);
  world = m4.multiply(pivotTranslationToOrigin, world);
  world = m4.multiply(rotXMat, world);
  world = m4.multiply(rotYMat, world);
  world = m4.multiply(rotZMat, world);
  world = m4.multiply(pivotTranslationBack, world);
  world = m4.multiply(scaMat, world);

  let worldViewProjection = m4.multiply(viewProjectionMatrix, world);
  let transformsInverseTranspose = m4.transpose(m4.inverse(world));

  let modelUniforms = {
    u_transforms: worldViewProjection,
    u_world: world,
    u_worldInverseTransform: transformsInverseTranspose,
    u_worldViewProjection: worldViewProjection,
    u_ambientColor: object.model.ambientColor,
    u_diffuseColor: object.model.diffuseColor,
    u_specularColor: object.model.specularColor,
    u_shininess: object.model.shininess,
  };

  twgl.setUniforms(programInfo, modelUniforms);

  gl.bindVertexArray(vao);
  twgl.drawBufferInfo(gl, bufferInfo);

  // --- DIBUJAR EL PIVOTE ---

  let pivotWorld = m4.translation([pivot.t.x, pivot.t.y, pivot.t.z]);
  let pivotWorldViewProjection = m4.multiply(viewProjectionMatrix, pivotWorld);
  let pivotTransformsInverseTranspose = m4.transpose(m4.inverse(pivotWorld));

  let pivotUniforms = {
    u_transforms: pivotWorldViewProjection,
    u_world: pivotWorld,
    u_worldInverseTransform: pivotTransformsInverseTranspose,
    u_worldViewProjection: pivotWorldViewProjection,
    u_ambientColor: [1, 0, 0, 1], // Color rojo
    u_diffuseColor: [1, 0, 0, 1],
    u_specularColor: [1, 0, 0, 1],
    u_shininess: 10.0,
  };

  twgl.setUniforms(programInfo, pivotUniforms);

  // Vincula el VAO y dibuja el pivote
  gl.bindVertexArray(pivotVao);
  twgl.drawBufferInfo(gl, pivotBufferInfo);

  requestAnimationFrame(() => drawScene(gl));
}

function setupUI(gl) {
  // Create the UI elements for each value
  const gui = new GUI();

  const pivotFolder = gui.addFolder("Pivot:");
  const pivotPosFolder = pivotFolder.addFolder("Position:");
  pivotPosFolder.add(pivot.t, "x", -5, 5).decimals(2);
  pivotPosFolder.add(pivot.t, "y", -5, 5).decimals(2);
  pivotPosFolder.add(pivot.t, "z", -5, 5).decimals(2);

  // Model controllers
  const modelFolder = gui.addFolder("Model:");
  modelFolder.addColor(object.model, "ambientColor");
  modelFolder.addColor(object.model, "diffuseColor");
  modelFolder.addColor(object.model, "specularColor");
  modelFolder.add(object.model, "shininess", 0, 600).decimals(2);

  const transformsFolder = gui.addFolder("Transforms");
  const posFolder = transformsFolder.addFolder("Position:");
  posFolder.add(object.transforms.t, "x", -5, 5).decimals(2);
  posFolder.add(object.transforms.t, "y", -5, 5).decimals(2);
  posFolder.add(object.transforms.t, "z", -5, 5).decimals(2);
  const rotFolder = transformsFolder.addFolder("Rotation:");
  rotFolder
    .add(object.transforms.rd, "x", 0, 360)
    .decimals(2)
    .listen()
    .onChange((value) => {
      object.transforms.rd.x = value;
      object.transforms.rr.x = (object.transforms.rd.x * Math.PI) / 180;
    });
  rotFolder
    .add(object.transforms.rd, "y", 0, 360)
    .decimals(2)
    .listen()
    .onChange((value) => {
      object.transforms.rd.y = value;
      object.transforms.rr.y = (object.transforms.rd.y * Math.PI) / 180;
    });
  rotFolder
    .add(object.transforms.rd, "z", 0, 360)
    .decimals(2)
    .listen()
    .onChange((value) => {
      object.transforms.rd.z = value;
      object.transforms.rr.z = (object.transforms.rd.z * Math.PI) / 180;
    });
  const scaFolder = transformsFolder.addFolder("Scale:");
  scaFolder
    .add(object.transforms, "s_all", -5, 5)
    .decimals(2)
    .onChange((value) => {
      object.transforms.s.x = value;
      object.transforms.s.y = value;
      object.transforms.s.z = value;
    });
  scaFolder.add(object.transforms.s, "x", -5, 5).decimals(2).listen();
  scaFolder.add(object.transforms.s, "y", -5, 5).decimals(2).listen();
  scaFolder.add(object.transforms.s, "z", -5, 5).decimals(2).listen();

  // Settings for the animation
  const lightFolder = gui.addFolder("Light:");
  lightFolder.add(settings.lightPosition, "x", -20, 20).decimals(2);
  lightFolder.add(settings.lightPosition, "y", -20, 20).decimals(2);
  lightFolder.add(settings.lightPosition, "z", -20, 20).decimals(2);
  lightFolder.addColor(settings, "ambientColor");
  lightFolder.addColor(settings, "diffuseColor");
  lightFolder.addColor(settings, "specularColor");
}

function main() {
  const canvas = document.querySelector("canvas");
  const gl = canvas.getContext("webgl2");

  if (!gl) {
    console.error("WebGL2 not available");
    return;
  }

  setupUI(gl);

  programInfo = twgl.createProgramInfo(gl, [vsGLSL, fsGLSL]);

  parseOBJFromFile("./wheel.obj").then((parsedObjArrays) => {
    bufferInfo = twgl.createBufferInfoFromArrays(gl, parsedObjArrays);
    vao = twgl.createVAOFromBufferInfo(gl, programInfo, bufferInfo);

    pivotArrays = cubeFaceColors(0.2);
    pivotArrays.a_ambientColor = [1, 0, 0, 1]; // Color rojo
    pivotArrays.a_diffuseColor = [1, 0, 0, 1];
    pivotArrays.a_specularColor = [1, 0, 0, 1];
    pivotBufferInfo = twgl.createBufferInfoFromArrays(gl, pivotArrays);

    vao = twgl.createVAOFromBufferInfo(gl, programInfo, bufferInfo);
    pivotVao = twgl.createVAOFromBufferInfo(gl, programInfo, pivotBufferInfo);

    drawScene(gl);
  });
  // // Set the default shape to be used
  // arrays = cubeFaceColors(2); // cambiar esto por
  // // Configure the Phong colors
  // arrays.a_ambientColor = object.model.ambientColor;
  // arrays.a_diffuseColor = object.model.diffuseColor;
  // arrays.a_specularColor = object.model.specularColor;
  // bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

  // pivotArrays = cubeFaceColors(0.2);
  // pivotArrays.a_ambientColor = [1, 0, 0, 1]; // Color rojo
  // pivotArrays.a_diffuseColor = [1, 0, 0, 1];
  // pivotArrays.a_specularColor = [1, 0, 0, 1];
  // pivotBufferInfo = twgl.createBufferInfoFromArrays(gl, pivotArrays);

  // vao = twgl.createVAOFromBufferInfo(gl, programInfo, bufferInfo);
  // pivotVao = twgl.createVAOFromBufferInfo(gl, programInfo, pivotBufferInfo);

  // drawScene(gl);
}

main();
