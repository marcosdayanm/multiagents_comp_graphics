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

    // return [
    //     1, 0, 0,
    //     0, 1, 0,
    //     0, 0, 1
    // ]
  },
  scale: function (vs) {
    return [vs[0], 0, 0, 0, vs[1], 0, 0, 0, 1];
  },
  translation: function (vt) {
    return [1, 0, 0, 0, 1, 0, vt[0], vt[1], 1];
  },

  rotation: function (angleRad) {
    let c = Math.cos(angleRad);
    let s = Math.sin(angleRad);
    return [c, s, 0, -s, c, 0, 0, 0, 1];
  },

  // Ahora vamos a multiplicar matrices
  multiply: function (ma, mb) {
    //Get individual values of the matrices
    const ma00 = ma[0 * 3 + 0];
    const ma01 = ma[0 * 3 + 1];
    const ma02 = ma[0 * 3 + 2];
    const ma10 = ma[1 * 3 + 0];
    const ma11 = ma[1 * 3 + 1];
    const ma12 = ma[1 * 3 + 2];
    const ma20 = ma[2 * 3 + 0];
    const ma21 = ma[2 * 3 + 1];
    const ma22 = ma[2 * 3 + 2];
    //Second matrix
    const mb00 = mb[0 * 3 + 0];
    const mb01 = mb[0 * 3 + 1];
    const mb02 = mb[0 * 3 + 2];
    const mb10 = mb[1 * 3 + 0];
    const mb11 = mb[1 * 3 + 1];
    const mb12 = mb[1 * 3 + 2];
    const mb20 = mb[2 * 3 + 0];
    const mb21 = mb[2 * 3 + 1];
    const mb22 = mb[2 * 3 + 2];
    //Result matrix
    return [
      ma00 * mb00 + ma01 * mb10 + ma02 * mb20,
      ma00 * mb01 + ma01 * mb11 + ma02 * mb21,
      ma00 * mb02 + ma01 * mb12 + ma02 * mb22,
      ma10 * mb00 + ma11 * mb10 + ma12 * mb20,
      ma10 * mb01 + ma11 * mb11 + ma12 * mb21,
      ma10 * mb02 + ma11 * mb12 + ma12 * mb22,
      ma20 * mb00 + ma21 * mb10 + ma22 * mb20,
      ma20 * mb01 + ma21 * mb11 + ma22 * mb21,
      ma20 * mb02 + ma21 * mb12 + ma22 * mb22,
    ];
  },
};

export { v2, m3 };

// const v2 = {
//   create: function (px, py) {
//     let v = new Float32Array(2);
//     v[0] = px;
//     v[1] = py;
//     return v;
//   },
// };

// const m3 = {
//   identity: function () {
//     let m = new Float32Array(9);

//     m[0] = 1;
//     m[1] = 0;
//     m[2] = 0;
//     m[3] = 0;
//     m[4] = 1;
//     m[5] = 0;
//     m[6] = 0;
//     m[7] = 0;
//     m[8] = 1;

//     return m
//   },

//   scale: function (vs) {
//     // Here the matrix is transposed too, but is the same as the identity matrix
//     let m = new Float32Array(9);

//     m[0] = vs[0];
//     m[1] = 0;
//     m[2] = 0;
//     m[3] = 0;
//     m[4] = vs[1];
//     m[5] = 0;
//     m[6] = 0;
//     m[7] = 0;
//     m[8] = 1;

//     return m;
//   },

//   translation: function (vt) {
//     // The shader requires to read the column first, then the row so the matrix is transposed
//     let m = new Float32Array(9);

//     m[0] = 1;
//     m[1] = 0;
//     m[2] = 0;
//     m[3] = 0;
//     m[4] = 1;
//     m[5] = 0;
//     m[6] = vt[0];
//     m[7] = vt[1];
//     m[8] = 1;

//     return m;
//   },

//   rotation: function (angleRadians) {
//     const c = Math.cos(angleRadians);
//     const s = Math.sin(angleRadians);

//     let m = new Float32Array(9);
//     // Here the matrix is transposed too
//     m[0] = c;
//     m[1] = s;
//     m[2] = 0;
//     m[3] = -s;
//     m[4] = c;
//     m[5] = 0;
//     m[6] = 0;
//     m[7] = 0;
//     m[8] = 1;

//     return m;
//   },

//   multiply: function (ma, mb) {
//     // Get the individual values of the matrix
//     const ma00 = ma[0 * 3 + 0];
//     const ma01 = ma[0 * 3 + 1];
//     const ma02 = ma[0 * 3 + 2];
//     const ma10 = ma[1 * 3 + 0];
//     const ma11 = ma[1 * 3 + 1];
//     const ma12 = ma[1 * 3 + 2];
//     const ma20 = ma[2 * 3 + 0];
//     const ma21 = ma[2 * 3 + 1];
//     const ma22 = ma[2 * 3 + 2];

//     const mb00 = mb[0 * 3 + 0];
//     const mb01 = mb[0 * 3 + 1];
//     const mb02 = mb[0 * 3 + 2];
//     const mb10 = mb[1 * 3 + 0];
//     const mb11 = mb[1 * 3 + 1];
//     const mb12 = mb[1 * 3 + 2];
//     const mb20 = mb[2 * 3 + 0];
//     const mb21 = mb[2 * 3 + 1];
//     const mb22 = mb[2 * 3 + 2];

//     let m = new Float32Array(9);

//     m[0] = ma00 * mb00 + ma10 * mb01 + ma20 * mb02;
//     m[1] = ma01 * mb00 + ma11 * mb01 * ma21 * mb02;
//     m[2] = ma02 * mb00 + ma12 * mb01 + ma22 * mb02;
//     m[3] = ma00 * mb10 + ma10 * mb11 + ma20 * mb12;
//     m[4] = ma01 * mb10 + ma11 * mb11 + ma21 * mb12;
//     m[5] = ma02 * mb10 + ma12 * mb11 + ma22 * mb12;
//     m[6] = ma00 * mb20 + ma10 * mb21 + ma20 * mb22;
//     m[7] = ma01 * mb20 + ma11 * mb21 + ma21 * mb22;
//     m[8] = ma02 * mb20 + ma12 * mb21 + ma22 * mb22;

//     return m;
//   },
// };

// export { v2, m3 };
