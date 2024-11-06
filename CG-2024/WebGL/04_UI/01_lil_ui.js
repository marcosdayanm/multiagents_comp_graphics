/*
 * Script to draw a complex shape in 2D
 *
 * Gilberto Echeverria
 * 2024-07-12
 */

"use strict";

import * as twgl from "twgl-base.js";
import { shapeF } from "../00_common/shapes.js";
import { m3 } from "../libs/libs2D.js";
import GUI from "lil-gui";

// Define the shader code, using GLSL 3.00

const vsGLSL = `#version 300 es
in vec2 a_position;

uniform vec2 u_resolution;
uniform mat3 u_transforms;

void main() {

    // Apply translation to the coordinates
    vec2 position = (u_transforms * vec3(a_position, 1)).xy;

    // Convert the position from pixels to 0.0 - 1.0, most recent position
    vec2 zeroToOne = position / u_resolution;

    // Convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // Convert from 0->2 to -1->1 (clip space)
    vec2 clipSpace = zeroToTwo - 1.0;

    // Invert Y axis
    //gl_Position = vec4(clipSpace[0], clipSpace[1] * -1.0, 0, 1);
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

const fsGLSL = `#version 300 es
precision highp float;

uniform vec4 u_color;

out vec4 outColor;

void main() {
    outColor = u_color;
}
`;

const objects = {
  model: {
    transforms: {
      t: {
        x: 0,
        y: 0,
        z: 0,
      },
      // rotación en radianes
      rr: {
        x: 0,
        y: 0,
        z: 0,
      },
      // escala
      s: {
        x: 1,
        y: 1,
        z: 1,
      },
    },
    // RGB
    color: [1, 0.3, 0.7, 1],
  },
};

function main() {
  const canvas = document.querySelector("canvas");
  const gl = canvas.getContext("webgl2");
  twgl.resizeCanvasToDisplaySize(gl.canvas);

  setupUI(gl);

  const programInfo = twgl.createProgramInfo(gl, [vsGLSL, fsGLSL]);

  const arrays = shapeF();

  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

  const vao = twgl.createVAOFromBufferInfo(gl, programInfo, bufferInfo);

  drawScene(gl, vao, programInfo, bufferInfo);
}

// Function to do the actual display of the objects
function drawScene(gl, vao, programInfo, bufferInfo) {
  twgl.resizeCanvasToDisplaySize(gl.canvas);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Translation units
  let translation = [
    objects.model.transforms.t.x,
    objects.model.transforms.t.y,
  ];

  // Rotation
  let angle_degrees = 30;
  let angle_radians = (objects.model.transforms.rr.z * Math.PI) / 180;
  let scale = [objects.model.transforms.s.x, objects.model.transforms.s.y]; // Scale the x and y axis

  // Create matrices for the transformations
  const rotMat = m3.rotation(angle_radians);
  const scaMat = m3.scale(scale);
  const traMat = m3.translation(translation);

  let transforms = m3.identity();
  // Scale
  transforms = m3.multiply(scaMat, transforms);
  // Rotate
  transforms = m3.multiply(rotMat, transforms);
  // Translate
  transforms = m3.multiply(traMat, transforms);

  let uniforms = {
    u_resolution: [gl.canvas.width, gl.canvas.height],
    u_transforms: transforms,
    u_color: objects.model.color,
  };

  gl.useProgram(programInfo.program);

  twgl.setUniforms(programInfo, uniforms);

  // console.log(vao);

  gl.bindVertexArray(vao);

  twgl.drawBufferInfo(gl, bufferInfo);

  requestAnimationFrame(() => drawScene(gl, vao, programInfo, bufferInfo));
}

function setupUI(gl) {
  const gui = new GUI();
  const traFolder = gui.addFolder("Translation");
  traFolder.add(objects.model.transforms.t, "x", 0, gl.canvas.width);
  traFolder.add(objects.model.transforms.t, "y", 0, gl.canvas.height);

  const rotFolder = gui.addFolder("Rotation");
  rotFolder.add(objects.model.transforms.rr, "z", 0, 360);

  const scaFolder = gui.addFolder("Scale");
  scaFolder.add(objects.model.transforms.s, "x", 0, 6);
  scaFolder.add(objects.model.transforms.s, "y", 0, 4);

  gui.addColor(objects.model, "color");
}

main();
