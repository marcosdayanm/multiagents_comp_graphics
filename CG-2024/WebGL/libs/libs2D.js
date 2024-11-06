// /*
// Library with vector and matrix functions for 3D transformations

// Marcos Dayan
// 2024-11-04
// */

// "use strict";

// const v2 = {
//   create: (x, y) => {
//     let v = new Float32Array(2);
//     v[0] = x;
//     v[1] = y;
//     return v;
//   },
// };

// const m3 = {
//   identity: () => {
//     // prettier-ignore
//     return new Float32Array([
//             1, 0, 0,
//             0, 1, 0,
//             0, 0, 1
//         ]);
//   },
//   translation: (v) => {
//     // prettier-ignore
//     return [ // quedó volteado por el tema de WebGL que trabaja por columnas, es transpuestos
//         1, 0, 0,
//         0, 1, 0,
//         v[0], v[1], 1
//     ]
//   },
//   scale: (v) => {
//     // prettier-ignore
//     return [
//         v[0], 0, 0,
//         0, v[1], 0,
//         0, 0, 1
//     ]
//   },
//   rotation: (angleInRadians) => {
//     const c = Math.cos(angleInRadians);
//     const s = Math.sin(angleInRadians);
//     // prettier-ignore
//     return [
//         c, s, 0,
//        -s, c, 0,
//         0, 0, 1
//     ]
//   },
//   // multiply: (m1, m2) => {
//   //   // prettier-ignore
//   //   let res = [0, 0, 0,
//   //              0, 0, 0,
//   //              0, 0, 0];

//   //   for (let i = 0; i < 3; i++) {
//   //     for (let j = 0; j < 3; j++) {
//   //       res[i * 3 + j] =
//   //         m1[i * 3 + 0] * m2[0 * 3 + j] +
//   //         m1[i * 3 + 1] * m2[1 * 3 + j] +
//   //         m1[i * 3 + 2] * m2[2 * 3 + j];
//   //     }
//   //   }

//   //   for (let i = 0; i < res.length; i++) {
//   //     if ((i + 1) % 3 == 0 && i != 0) {
//   //       console.log(res[i]);
//   //     } else {
//   //       // process.stdout.write(res[i] + ", ");
//   //       console.log(res[i]);
//   //     }
//   //   }
//   // },
//   multiply: function (ma, mb) {
//     //Get individual values of the matrices
//     const ma00 = ma[0 * 3 + 0];
//     const ma01 = ma[0 * 3 + 1];
//     const ma02 = ma[0 * 3 + 2];
//     const ma10 = ma[1 * 3 + 0];
//     const ma11 = ma[1 * 3 + 1];
//     const ma12 = ma[1 * 3 + 2];
//     const ma20 = ma[2 * 3 + 0];
//     const ma21 = ma[2 * 3 + 1];
//     const ma22 = ma[2 * 3 + 2];
//     //Second matrix
//     const mb00 = mb[0 * 3 + 0];
//     const mb01 = mb[0 * 3 + 1];
//     const mb02 = mb[0 * 3 + 2];
//     const mb10 = mb[1 * 3 + 0];
//     const mb11 = mb[1 * 3 + 1];
//     const mb12 = mb[1 * 3 + 2];
//     const mb20 = mb[2 * 3 + 0];
//     const mb21 = mb[2 * 3 + 1];
//     const mb22 = mb[2 * 3 + 2];
//     //Result matrix
//     return [
//       ma00 * mb00 + ma01 * mb10 + ma02 * mb20,
//       ma00 * mb01 + ma01 * mb11 + ma02 * mb21,
//       ma00 * mb02 + ma01 * mb12 + ma02 * mb22,
//       ma10 * mb00 + ma11 * mb10 + ma12 * mb20,
//       ma10 * mb01 + ma11 * mb11 + ma12 * mb21,
//       ma10 * mb02 + ma11 * mb12 + ma12 * mb22,
//       ma20 * mb00 + ma21 * mb10 + ma22 * mb20,
//       ma20 * mb01 + ma21 * mb11 + ma22 * mb21,
//       ma20 * mb02 + ma21 * mb12 + ma22 * mb22,
//     ];
//   },
// };

// // prettier-ignore
// const m1 = [2,  3,  1,
//             4,  0, -1,
//             5,  2,  2];

// // prettier-ignore
// const m2 = [1,  2,  3,
//             0, -1,  4,
//             5,  6,  0];

// m3.multiply(m1, m2);

// export { v2, m3 };

/*
 * Functions for 2D transformations
 *
 * Gilberto Echeverria
 * 2024-11-04
 */

const v2 = {
  create: function (px, py) {
    let v = new Float32Array(2);
    v[0] = px;
    v[1] = py;
    return v;
  },
};

const m3 = {
  identity: function () {
    let m = new Float32Array(9);
    m[0] = 1;
    m[1] = 0;
    m[2] = 0;
    m[3] = 0;
    m[4] = 1;
    m[5] = 0;
    m[6] = 0;
    m[7] = 0;
    m[8] = 1;
    return m;
  },

  scale: function (vs) {
    return [vs[0], 0, 0, 0, vs[1], 0, 0, 0, 1];
  },

  translation: function (vt) {
    return [1, 0, 0, 0, 1, 0, vt[0], vt[1], 1];
  },

  rotation: function (angleRadians) {
    const c = Math.cos(angleRadians);
    const s = Math.sin(angleRadians);
    return [c, s, 0, -s, c, 0, 0, 0, 1];
  },

  multiply: function (ma, mb) {
    // Get individual elements of the matrices
    const ma00 = ma[0 * 3 + 0];
    const ma01 = ma[0 * 3 + 1];
    const ma02 = ma[0 * 3 + 2];
    const ma10 = ma[1 * 3 + 0];
    const ma11 = ma[1 * 3 + 1];
    const ma12 = ma[1 * 3 + 2];
    const ma20 = ma[2 * 3 + 0];
    const ma21 = ma[2 * 3 + 1];
    const ma22 = ma[2 * 3 + 2];

    const mb00 = mb[0 * 3 + 0];
    const mb01 = mb[0 * 3 + 1];
    const mb02 = mb[0 * 3 + 2];
    const mb10 = mb[1 * 3 + 0];
    const mb11 = mb[1 * 3 + 1];
    const mb12 = mb[1 * 3 + 2];
    const mb20 = mb[2 * 3 + 0];
    const mb21 = mb[2 * 3 + 1];
    const mb22 = mb[2 * 3 + 2];

    return [
      ma00 * mb00 + ma10 * mb01 + ma20 * mb02,
      ma01 * mb00 + ma11 * mb01 + ma21 * mb02,
      ma02 * mb00 + ma12 * mb01 + ma22 * mb02,
      ma00 * mb10 + ma10 * mb11 + ma20 * mb12,
      ma01 * mb10 + ma11 * mb11 + ma21 * mb12,
      ma02 * mb10 + ma12 * mb11 + ma22 * mb12,
      ma00 * mb20 + ma10 * mb21 + ma20 * mb22,
      ma01 * mb20 + ma11 * mb21 + ma21 * mb22,
      ma02 * mb20 + ma12 * mb21 + ma22 * mb22,
    ];
  },
};

export { v2, m3 };
