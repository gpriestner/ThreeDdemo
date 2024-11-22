console.log("working. . . ");
// const canvas = document.createElement("canvas"); // document.querySelector("canvas");
// document.body.appendChild(canvas);
// const view = canvas.getContext("2d");
// canvas.view = view;

// let camera;

// const canvas2 = document.createElement("canvas");
// canvas2.style.position = "fixed";
// //canvas2.style.left = "1000px";
// document.body.appendChild(canvas2);
// canvas2.view = canvas2.getContext("2d");

const testImage = new Image();
testImage.src = "res/profile.png";
//#region Game Input
class KeyState {
  isPressed;
  isReleased;
  constructor(isPressed, isReleased) {
    this.isPressed = isPressed;
    this.isReleased = isReleased;
  }
}
class Keyboard {
  static Keyboard = (() => {
    addEventListener("keydown", Keyboard.keyDown);
    addEventListener("keyup", Keyboard.keyUp);
  })();
  static state = {};
  static keyDown(event) {
    //console.log(event);
    const state = Keyboard.state[event.code];
    if (state === undefined)
      Keyboard.state[event.code] = new KeyState(true, true);
    else state.isPressed = true;
  }
  static keyUp(event) {
    //console.log(event);
    const state = Keyboard.state[event.code];
    state.isPressed = false;
    state.isReleased = true;
  }
  static isDown(key) {
    // returns true while the key is in the down position
    const state = Keyboard.state[key];
    if (state === undefined) return false;
    else return state.isPressed;
  }
  static isPressed(key) {
    // returns true only once when first depressed
    // must be released and re-pressed before returning true again
    const state = Keyboard.state[key];
    if (state === undefined) return false;

    if (state.isPressed && state.isReleased) {
      state.isReleased = false;
      return true;
    } else return false;
  }
}
class Mouse {
  static RightDown = false;
  static MiddleDown = false;
  static LeftDown = false;
  static #Mouse = (() => {
    addEventListener("mousedown", (e) => {
      if (e.button == 0) Mouse.LeftDown = true;
      if (e.button == 1) togglePointerLock();
      if (e.button == 2) Mouse.RightDown = true;
    });
    addEventListener("mouseup", (e) => {
      if (e.button == 0) Mouse.LeftDown = false;
      if (e.button == 1) Mouse.MiddleDown = false;
      if (e.button == 2) Mouse.RightDown = false;
    });
  })();
}
class GameInput {
  static get Forward() { return Keyboard.isDown("KeyW") /*|| Mouse.LeftDown*/; }
  static get Left() { return Keyboard.isDown("KeyA"); }
  static get Right() { return Keyboard.isDown("KeyD"); }
  static get TurnLeft() { return Keyboard.isDown("ArrowLeft"); }
  static get TurnRight() { return Keyboard.isDown("ArrowRight"); }
  static get Back() { return Keyboard.isDown("KeyS") || Mouse.RightDown; }
  static get Up() { return Keyboard.isDown("ArrowUp"); }
  static get Down() { return Keyboard.isDown("ArrowDown"); }
  static get Reset() { return Keyboard.isPressed("KeyR"); }
  static get Fire() { return Keyboard.isPressed("Space"); }
  static get North() { return Keyboard.isDown("KeyQ"); }
  static get South() { return Keyboard.isDown("KeyZ"); }
  static get Control() { return Keyboard.isPressed("ControlLeft"); }
  static get Camera1() { return Keyboard.isPressed("Digit1"); }
  static get Camera2() { return Keyboard.isPressed("Digit2"); }
  static get ShiftLeft() { return Keyboard.isDown("ShiftLeft"); }
  static get PitchUp() { return Keyboard.isDown("KeyE"); }
  static get PitchDown() { return Keyboard.isDown("KeyC"); }
  static get Look() { return Keyboard.isPressed("KeyL"); }
  static get OpenFile() { return Keyboard.isPressed("KeyO"); }
}
//#endregion
//#region Resize handler
function resize() {
  console.log("ERROR: do NOT call resize");
  return;
  canvas.width = window.innerWidth / 2;
  canvas.height = window.innerHeight;
  setupView(canvas);

  //canvas2.style.border = "red 2px solid";
  canvas2.style.left = Math.floor(window.innerWidth / 2) + "px";
  canvas2.width = window.innerWidth / 2;
  canvas2.height = window.innerHeight;
  setupView(canvas2);
}
function resetCameras() {
  console.assert(Camera.Active, "There is no active camera");
  setupCamera(Camera.Active);
  setupCamera(camera2);
}
const shadowOffset = 1;
function setupCamera(camera) {
  console.assert(camera.view, "Camera MUST have a view");
  console.assert(camera.canvas, "Camera MUST have a canvas");
  camera.canvas.width = window.innerWidth / 2;
  camera.canvas.height = window.innerHeight;
  if (camera.id == 2) camera.canvas.style.left = window.innerWidth / 2 + "px";
  camera.view.translate(camera.canvas.width / 2, camera.canvas.height / 2);
  camera.view.scale(1, -1);
  camera.view.lineWidth = 1;
  camera.view.strokeStyle = "black";
  camera.view.lineWidth = 4;
  camera.view.lineJoin = "bevel";
  camera.view.shadowOffsetX = shadowOffset;
  camera.view.shadowOffsetY = shadowOffset;
  camera.view.font = "18px Arial";
}
function setupView(canvas) { // NOT used
  canvas.view.translate(canvas.width / 2, canvas.height / 2);
  canvas.view.scale(1, -1);
  canvas.view.lineWidth = 1;
  canvas.view.strokeStyle = "black";
  canvas.view.lineWidth = 4;
  canvas.view.lineJoin = "bevel";
  canvas.view.shadowOffsetX = shadowOffset;
  canvas.view.shadowOffsetY = shadowOffset;
  canvas.view.font = "18px Arial";
}
//resize();
//addEventListener("resize", resize);
addEventListener("resize", resetCameras);
//#endregion
//#region Pointer Lock
document.addEventListener("pointerlockchange", onLockChange); 
// canvas.addEventListener("click", async e => {
//     if (e.button == 0) {
//         console.log("Click");
//         console.log(e);
//         if (!document.pointerLockElement) {
//             await canvas.requestPointerLock({
//             unadjustedMovement: true,
//         });
//         } else {
//             await document.exitPointerLock();
//         }
//     }
//   }
// );
async function togglePointerLock() {
  //console.log("Toggle");
  if (!document.pointerLockElement) {
    await Camera.Active.canvas.requestPointerLock({
      unadjustedMovement: true,
    });
  } else {
    await document.exitPointerLock();
  }
}
function onLockChange() {
  if (document.pointerLockElement === Camera.Active.canvas)
    document.addEventListener("mousemove", updatePosition);
  else document.removeEventListener("mousemove", updatePosition);
}
function updatePosition(e) {
  const dx = -e.movementX * 1.3;
  const dy = -e.movementY * 1.3;
  Camera.Active.canvas.backgroundPosition.x += dx;
  Camera.Active.canvas.backgroundPosition.y += dy;
  Camera.Active.canvas.style.backgroundPositionX = `${Camera.Active.canvas.backgroundPosition.x}px`;

  Camera.Active.rotation.x -= e.movementY / 1000; // look up/down
  if (Camera.Active.rotation.x < -Math.PI / 2) Camera.Active.rotation.x = -Math.PI / 2;
  else if (Camera.Active.rotation.x > Math.PI / 2) Camera.Active.rotation.x = Math.PI / 2;
  else Camera.Active.canvas.style.backgroundPositionY = `${Camera.Active.canvas.backgroundPosition.y}px`;

  Camera.Active.rotation.y += e.movementX / 1000; // look left/right

  // spotlight1.direction.x += e.movementX / 1000;
  // spotlight1.direction.y -= e.movementY / 1000;

  // if (Camera.Active.rotation.x > Math.PI) Camera.Active.rotation.x -= Math.PI * 2;
  // if (Camera.Active.rotation.x < -Math.PI) Camera.Active.rotation.x += Math.PI * 2;
  if (Camera.Active.rotation.y > Math.PI) Camera.Active.rotation.y -= Math.PI * 2;
  if (Camera.Active.rotation.y < -Math.PI) Camera.Active.rotation.y += Math.PI * 2;
}
document.addEventListener("wheel", async (e) => {
  if (e.deltaY) Camera.Active.moveUp(-e.deltaY / 20);
  if (e.deltaX) Camera.Active.moveRight(e.deltaX / 100);
});
//#endregion
//#region Utility Functions
function dotProduct(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}
function crossProduct(v1, v2) {
  const cp = {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x,
  };
  const nv = normaliseVector(cp);
  return nv;
}
function normaliseVector(v) {
  const l = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
  return { x: v.x / l, y: v.y / l, z: v.z / l };
}
function multiplyVector(v, f) {
  return { x: v.x * f, y: v.y * f, z: v.z * f };
}
function reverseVector(v) {
  return multiplyVector(v, -1);
}
function addVector(v1, v2) {
  return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z };
}
function subtractVector(v1, v2) {
  // vector is v1 -> v2
  return { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
}
function subtractVector2d(v1, v2) {
  // v1 -> v2
  return { x: v2.x - v1.x, y: v2.y - v1.y };
}
function centroid(verts) {
  let x = 0,
    y = 0,
    z = 0;
  for (const a of verts) {
    x += a.x;
    y += a.y;
    z += a.z;
  }
  x /= verts.length;
  y /= verts.length;
  z /= verts.length;
  return { x, y, z };
}
function centroid2d(face) {
  const x = face.reduce((a, b) => a + b.xy.x, 0) / face.length;
  const y = face.reduce((a, b) => a + b.xy.y, 0) / face.length;
  return { x, y };
}
function drawSkew(image, p1, p2, p3, p4) {
  if (p1 && p2 && p3 && p4) {
    const w = image.naturalWidth;
    const h = image.naturalHeight;
    const a = -w * h;
    if (a == 0) return;
    const m = {};

    m.m11 = (h * (p1.x - p2.x)) / a;
    m.m12 = (h * (p1.y - p2.y)) / a;
    m.m21 = (w * (p2.x - p3.x)) / a;
    m.m22 = (w * (p2.y - p3.y)) / a;
    drawTransform(image, m, p1, p2, p3);

    m.m11 = (h * (p4.x - p3.x)) / a;
    m.m12 = (h * (p4.y - p3.y)) / a;
    m.m21 = (w * (p1.x - p4.x)) / a;
    m.m22 = (w * (p1.y - p4.y)) / a;
    drawTransform(image, m, p1, p3, p4);
  }
}
function drawTransform(image, m, p1, p2, p3) {
  view.save();
  view.beginPath();
  moveTo(p1);
  lineTo(p2);
  lineTo(p3);
  view.closePath();
  view.clip();
  view.transform(m.m11, m.m12, m.m21, m.m22, p1.x, p1.y);
  view.drawImage(image, 0, 0);
  view.restore();
}
function moveTo(p, o = 0) {
  if (p) view.moveTo(p.x + o, p.y + o);
}
function lineTo(p, o = 0) {
  if (p) view.lineTo(p.x + o, p.y + o);
}
function addColorPoint(p, center, face) {
  const d = dist2d(p.xy, center);
  const grad = view.createRadialGradient(p.xy.x, p.xy.y, 0, p.xy.x, p.xy.y, d);
  grad.addColorStop(0, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},1)`);
  grad.addColorStop(1, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0)`);
  view.fillStyle = grad;
  fillRect(face);
}
function shadeFace(face) {
  const center = centroid2d(face);
  view.globalCompositeOperation = "lighten";
  for (p of face) addColorPoint(p, center, face);
  view.globalCompositeOperation = "source-over";
}
function fillRect(face) {
  view.beginPath();
  moveTo(face[face.length - 1].xy);
  for (const p of face) lineTo(p.xy);
  moveTo(face[face.length - 1].xy, 1);
  for (const p of face) lineTo(p.xy, 1);
  view.fill();
}
function dist2d(p1, p2, factor = 1.5) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2) * factor;
}
function dist3d(p1, p2) {
  return Math.sqrt(
    (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2
  );
}
function length(v) {
  return Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
}
function clamp(v, min = 0, max = 1) {
  if (v >= min && v <= max) return v;
  return Math.max(Math.min(v, max), min);
}
function rotatePointAroundVector(point, vector, angle) {
  // Normalize the axis vector
  const length = Math.sqrt(
    vector.x * vector.x + vector.y * vector.y + vector.z * vector.z
  );
  const normalizedAxis = {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length,
  };

  // Calculate the quaternion components
  const halfAngle = angle / 2;
  const cos = Math.cos(halfAngle);
  const sin = Math.sin(halfAngle);
  const qw = cos;
  const qx = sin * normalizedAxis.x;
  const qy = sin * normalizedAxis.y;
  const qz = sin * normalizedAxis.z;

  const x =
    (qw * qw + qx * qx - qy * qy - qz * qz) * point.x +
    2 * (qx * qy - qw * qz) * point.y +
    2 * (qx * qz + qw * qy) * point.z;

  const y =
    2 * (qx * qy + qw * qz) * point.x +
    (qw * qw - qx * qx + qy * qy - qz * qz) * point.y +
    2 * (qy * qz - qw * qx) * point.z;

  const z =
    2 * (qx * qz - qw * qy) * point.x +
    2 * (qy * qz + qw * qx) * point.y +
    (qw * qw - qx * qx - qy * qy + qz * qz) * point.z;

  return { x, y, z };
}
function rotatePointAroundUnitVector(point, vector, angle) {
  // 'vector' argument must already be a unit vector (otherwise use rotatePointAroundVector)
  // Calculate the quaternion components
  const halfAngle = angle / 2;
  const cos = Math.cos(halfAngle);
  const sin = Math.sin(halfAngle);
  const qw = cos;
  const qx = sin * vector.x;
  const qy = sin * vector.y;
  const qz = sin * vector.z;

  const x =
    (qw * qw + qx * qx - qy * qy - qz * qz) * point.x +
    2 * (qx * qy - qw * qz) * point.y +
    2 * (qx * qz + qw * qy) * point.z;

  const y =
    2 * (qx * qy + qw * qz) * point.x +
    (qw * qw - qx * qx + qy * qy - qz * qz) * point.y +
    2 * (qy * qz - qw * qx) * point.z;

  const z =
    2 * (qx * qz - qw * qy) * point.x +
    2 * (qy * qz + qw * qx) * point.y +
    (qw * qw - qx * qx - qy * qy + qz * qz) * point.z;

  return { x, y, z };
}
const rndColor = () => [
  Math.random() * 255,
  Math.random() * 255,
  Math.random() * 255,
];
function colorToArray(color) {
  const oldStyle = Camera.Active.view.fillStyle;
  Camera.Active.view.fillStyle = color;
  const c = Camera.Active.view.fillStyle;
  Camera.Active.view.fillStyle = oldStyle;
  return [
    parseInt("0x" + c[1] + c[2]),
    parseInt("0x" + c[3] + c[4]),
    parseInt("0x" + c[5] + c[6]),
  ];
}
function arrayToColor(a) {
  return `rgb(${a[0]},${a[1]},${a[2]})`;
}
function arrayToColorA(a) {
  return `rgba(${a[0]},${a[1]},${a[2]},${a[3]})`;
}
function toDegrees(r) {
  return r * 180 / Math.PI;
}
//#endregion
//#region Game classes
class Pt {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}
class GameSettings {
  doubleDraw = false;
  showCrossHair = true;
  selectFace = true;
  crossHairRadius = 20;
  flyMode = true;
  #debugColor = [255, 255, 255];
  get debugColor() { return this.#debugColor; }
  set debugColor(c) {
    this.#debugColor = c;
    this.textColor = arrayToColor(c);
  }
  textColor = "white";
  animate = true;
}
const gameSettings = new GameSettings();
class GameObject {
  // #position = {};
  // get position() {
  //     if (this.parent) return this.parent.position;
  //     return this.#position;
  // }
  // set position(o) {
  //     if (!this.parent) Object.assign(this.#position, o);
  // }
  rotation = { x: 0, y: 0, z: 0 };
  auto = { x: 0, y: 0, z: 0 };
  constructor(x = 0, y = 0, z = 0, s = 1, sx = 1, sy = 1, sz = 1) {
    this.position = { x, y, z };
    this.scale = s;
    // if (this.model)  // model does NOT exist in the super
    //   for (const p of this.model) {
    //     p.x *= sx;
    //     p.y *= sy;
    //     p.z *= sz;
    //     p.parent = this;
    // }
  }
  update() {
    if (this.auto?.x) this.rotation.x += this.auto.x;
    if (this.auto?.y) this.rotation.y += this.auto.y;
    if (this.auto?.z) this.rotation.z += this.auto.z;

    if (this.facePoints) this.facePoints = null;

    if (this.model) {
      this.points = [];
      for (const p of this.model) {
        const lp = this.toLocalPoint(p);
        const wp = this.toWorldPoint(lp);
        this.points.push({ lp, wp, id: p.id });
      }
    }
  }
  draw(camera) {
    //if (camera === this) return;
    const points = [];
    for (const p of this.model) {
      const lp = this.toLocalPoint(p);
      const wp = this.toWorldPoint(lp); // lp
      const cp = this.toCameraPoint(wp, camera);
      const xy = this.toXyPoint(cp, camera);
      points.push({ wp, cp, xy, id: p.id });
    }

    camera.points = [];
    for (const p of this.points) {
      const wp = { x: p.wp.x, y: p.wp.y, z: p.wp.z };
      const cp = this.toCameraPoint(p.wp, camera);
      const xy = this.toXyPoint(cp, camera);
      camera.points.push({ wp, cp, xy, id: p.id });
    }

    // sort faces so furthest away are draw first - only needed for concave objects
    if (this.concave) {
      for(const f of this.faces) {
        const facePoints = f.getFacePoints(points);
        let dist = 0;
        for (const fp of facePoints) {
          dist += fp.xy?.z ?? 0;
        }
        dist = dist / facePoints.length;
        f.distanceFromCamera = dist;
      }
      this.faces.sort((a, b) => b.distanceFromCamera - a.distanceFromCamera);
    }

    for (const f of this.faces)
      f.draw(this.position, points, this.color, camera);
  }
  toLocalPoint(p) {
    if (!this.rotation) return;
    if (this instanceof Camera) return this.toCameraLocalPoint(p);
    let r = p;
    for (const a of "yxz")
      if (this.rotation[a]) r = this.rotate(r, this.rotation, a);
    return r;
  }
  toWorldPoint(p) {
    const wp = {
      x: this.position.x + p.x * this.scale,
      y: this.position.y + p.y * this.scale,
      z: this.position.z + p.z * this.scale,
    };
    return wp;
  }
  toCameraPoint(p, camera) {
    const cp = subtractVector(camera.position, p);
    const l = length(cp);
    if (l > camera.max) return null;
    const cv = normaliseVector(cp);
    const dp = dotProduct(cv, camera.direction);
    if (dp < 0 /*camera.fov*/) return null;
    const ry = this.rotate(cp, camera.rotation, "y");
    const rx = this.rotate(ry, camera.rotation, "x");
    rx.d = l;
    return rx;
  }
  toXyPoint(p, camera) {
    //if (p == null || p.z == 0) return null;
    if (!p?.z) return null;
    const xy = { x: (p.x / p.z) * camera.canvas.width, y: (p.y / p.z) * camera.canvas.width, z: p.d };
    return xy;
  }
  rotate(p, rotation, axis = "y") {
    const angle = rotation[axis];
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    switch (axis) {
      case "x":
        return { x: p.x, y: p.y * cos - p.z * sin, z: p.y * sin + p.z * cos };
      case "y":
        return { x: p.x * cos - p.z * sin, y: p.y, z: p.x * sin + p.z * cos };
      case "z":
        return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos, z: p.z };
    }
  }
  toCameraLocalPoint(p) {
    // let r = p;
    // for (const a of "yxz")
    //   if (this.rotation[a]) r = this.cameraRotate(r, this.rotation, a);
    // return r;
    
    // rotate p around y
    const cosY = Math.cos(-this.rotation.y);
    const sinY = Math.sin(-this.rotation.y);
    const ry = { x: p.x * cosY - p.z * sinY, y: p.y, z: p.x * sinY + p.z * cosY };

    // calculate pitch vector
    const rightVector = { x: 1, y: 0, z: 0 };
    const pitchVector = { x: rightVector.x * cosY - rightVector.z * sinY, y: rightVector.y, z: rightVector.x * sinY + rightVector.z * cosY };


    // rotate ry around 'x' (local x-axis)
    const rx = this.rotateUV(ry, pitchVector, -this.rotation.x);

    // there is NO rotate around z for cameras
    // if (this.rotation.z) {
    //   const localZ = { x: 0, y: 0, z: 1 };
    //   const rz = this.rotateUV(rx, 0, -this.rotation.z);
    //   return rz;
    // }

    return rx;
  }
  cameraRotate(p, rotation, axis = "y") {
    const angle = -rotation[axis];
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    switch (axis) {
      case "x":
        return { x: p.x, y: p.y * cos - p.z * sin, z: p.y * sin + p.z * cos };
      case "y":
        return { x: p.x * cos - p.z * sin, y: p.y, z: p.x * sin + p.z * cos };
      case "z":
        return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos, z: p.z };
    }
  }
  rotateX(p, angle) { 
    const cos = Math.cos(angle); const sin = Math.sin(angle);
    return { x: p.x, y: p.y * cos - p.z * sin, z: p.y * sin + p.z * cos };
  }
  rotateY(p, angle) { 
    const cos = Math.cos(angle); const sin = Math.sin(angle);
    return { x: p.x * cos - p.z * sin, y: p.y, z: p.x * sin + p.z * cos };
  }
  rotateZ(p, angle) { 
    const cos = Math.cos(angle); const sin = Math.sin(angle);
    return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos, z: p.z }; 
  }
  rotateV(p, v, a) {
    return rotatePointAroundVector(p, v, a);
  }
  rotateUV(p, v, a) {
    return rotatePointAroundUnitVector(p, v, a);
  }
  distance(camera) {
    let dx, dy, dz;
    if (this.parent) {
      const lp = this.toLocalPoint(this.parentOffset);
      const wp = this.toWorldPoint(lp);
      dx = (wp.x - camera.position.x) ** 2;
      dy = (wp.y - camera.position.y) ** 2;
      dz = (wp.z - camera.position.z) ** 2;
    } else {
      dx = (this.position.x - camera.position.x) ** 2;
      dy = (this.position.y - camera.position.y) ** 2;
      dz = (this.position.z - camera.position.z) ** 2;
    }
    return Math.sqrt(dx + dy + dz);
  }
  connect(o) {
    if (!this.children) this.children = [];
    this.children.push(o);
    o.setParent(this);
  }
  setParent(parent) {
    this.parentOffset = subtractVector(parent.position, this.position);
    this.parent = parent;
    this.position = parent.position;
    this.rotation = parent.rotation;
    for (let i = 0; i < this.model.length; ++i)
      this.model[i] = addVector(this.model[i], this.parentOffset);
  }
  moveTo(p, camera) { if (p) camera.view.moveTo(p.x, p.y); }
  lineTo(p, camera) { if (p) camera.view.lineTo(p.x, p.y); }
  dot(p, camera) { if (p) camera.view.fillRect(p.x - 2, p.y - 2, 4, 4); }
  text(t, p, camera) {
    camera.view.fillStyle = gameSettings.textColor; // "lime";
    //view.font = "18px Arial";
    if (t && p) camera.view.fillText(t, p.x, p.y);
  }
}
class MultiFace extends GameObject {
  model = [
    new Pt(-1, 1, 0),
    new Pt(1, 1, 0),
    new Pt(1, -1, 0),
    new Pt(-1, 1, 0),
  ];
  constructor(x, y, z) {
    super();
    this.position = { x, y, z };
    this.normal = { x: 0, y: 0, z: -1 };
  }
  draw(camera) {
    for (const x = 0; x < 10; ++x) {}
  }
}
class TerrainPoint {
  #x; #y; #z; #radius;
  constructor(x, y, z, r = 10) {
    this.#x = x; // x coord of point
    this.#y = y; // strength of point - how much the y coord is pulled/pushed up/down
    this.#z = z; // z coord of point
    this.#radius = r; // area size affected by the terrain point
  }
  get x() { return this.#x; }
  get y() { return this.#y; }
  get z() { return this.#z; }
  get radius() { return this.#radius; }
  set x(v) { this.#x = v; this?.parent.init(); }
  set y(v) { this.#y = v; this?.parent.init(); }
  set z(v) { this.#z = v; this?.parent.init(); }
  set radius(v) { this.#radius = v; this?.parent.init(); }
  effect(p) {
    const dist = Math.sqrt((this.#x - p.x) ** 2 + (this.#z - p.z) ** 2);
    if (dist < 0.1) p.y += this.#y;
    else if (dist <= this.#radius) {
      p.y += this.#y * (1 - dist / this.#radius)
    }
  }
}
class Plane extends GameObject {
  concave = true;
  terrainPoints = [];
  constructor(size, divs, y, colorA, colorB) {
    super();
    this.size = size;
    this.divs = divs;
    this.start = -this.size / 2;
    this.end = -this.start;
    this.step = this.size / this.divs;
    this.y = y;
    this.colorA = colorA;
    this.colorB = colorB;

    this.init();
  }
  init() {
    this.model = [];
    for (let x = 0; x <= this.divs; ++x) {
      for (let z = 0; z <= this.divs; ++z) {
        this.model.push({
          x: x * this.step + this.start,
          y: this.y, //: y + Math.random() * 5,
          z: z * this.step + this.start,
        });
      }
    }
    this.model[18].y = 1;

    // let c = 0;
    // for(const m of this.model) m.id = c++;

    for(const tp of this.terrainPoints) for (const p of this.model) tp.effect(p);

    this.faces = [];
    for (let x = 0; x < this.divs; ++x) {
      for (let z = 0; z < this.divs; ++z) {
        const i1 = z * (this.divs + 1) + x;
        const i2 = i1 + 1;
        const i3 = i1 + this.divs + 1;
        const i4 = i3 + 1;

        const color = x % 2 ^ z % 2 ? this.colorA : this.colorB;
        const face1 = new Face([i1, i2, i3]);
        const face2 = new Face([i2, i4, i3]);
        face1.color = color;
        face2.color = color;

        this.faces.push(face1);
        this.faces.push(face2);
      }
    }
  }
  height(p) {
    // only calculate height within the area of the plane (outside = zero)
    if (p.x < this.start || p.x >= this.end || p.z < this.start || p.z >= this.end) return 0;

    // reverse precise x,z coords to model elements

    const rxn = (p.x - this.start) / this.step;
    const rxi = Math.floor(rxn);
    const rxf = rxn - rxi;

    const rzn = (p.z - this.start) / this.step;
    const rzi = Math.floor(rzn);
    const rzf = rzn - rzi;

    const ri = rxi * (this.divs + 1) + rzi;

    const position = this.model[ri];
    const north = this.model[ri + 1];
    const east = this.model[ri + this.divs + 1];
    const northeast = this.model[ri + this.divs + 2];


    // if x,z EXACTLY matches a point in the model, return the height of that point
    if (rxf === 0 && rzf === 0) return position.y;

    // if(rzp === 0) {} // lerp between 2 points
    // if(rxp === 0) {} // lerp between 2 points

    // decide which triangle in the quad is relavent
    let height;
    if (rxf + rzf > 1) {
      // position is over northeast corner (2,4,3)
      height = northeast.y;
      height += (north.y - northeast.y) * (1 - rzf);
      height += (east.y - northeast.y) * (1 - rxf);
    }
    else {
      // position is over southwest corner (1,2,3)
      height = position.y;
      height += (north.y - position.y) * rzf;
      height += (east.y - position.y) * rxf;
    }

    return height;
  }
  addTerrainPoint(tp) { 
    this.terrainPoints.push(tp);
    tp.parent = this;
  }
  // draw(camera) {
  //   const points = [];
  //   for (const point of this.model) {
  //     const wp = point;
  //     const cp = this.toCameraPoint(wp, camera);
  //     const xy = this.toXyPoint(cp, camera);
  //     points.push({ wp, cp, xy });
  //   }
  //   for (const f of this.faces) f.fill(points, f.color, camera);
  //   //for(const f of this.faces) f.draw(null, points, [128,128,128], camera);
  // }
}
class Face extends GameObject {
  static count = 0;
  static sides = ["Front", "Back", "Top", "Bottom", "Left", "Right"];
  verts = [];
  //facePoints = [];
  constructor(indexes, doubleSided = false) {
    super();
    this.doubleSided = doubleSided;
    this.id = Face.count++;
    for (const a of indexes) this.verts.push(a);
  }
  getFacePoints(points) {
      const localPoints = [];
      for (const i of this.verts) localPoints.push(points[i]);
      return localPoints;
  }
  center(points) {
    let x = 0,
      y = 0,
      z = 0;
    for (const p of points)
      if (p) {
        x += p.wp.x;
        y += p.wp.y;
        z += p.wp.z;
      }
    const c = {
      x: x / points.length,
      y: y / points.length,
      z: z / points.length,
    };
    return c;
  }
  draw(parentPosition, points, color, camera) {
    if (this.color) color = this.color;
    //if (points.length !== camera.points.length) return;
    //console.assert(points.length === camera.points.length, "Bad points");
    const fp = this.getFacePoints(points);

    // calculate 2 face vectors to describe the plane of the face
    const faceEdge1 = subtractVector(fp[1].wp, fp[0].wp);
    const faceEdge2 = subtractVector(fp[2].wp, fp[0].wp);

    // calculate if face is visible
    let faceNormal = crossProduct(faceEdge1, faceEdge2);
    //const cent = this.center(fp);
    const cameraVector = normaliseVector(
      subtractVector(fp[0].wp, camera.position)
    );
    let visible = dotProduct(cameraVector, faceNormal) > 0;

    if (!visible && this.doubleSided) {
      visible = true;
      faceNormal = reverseVector(faceNormal);
    }

    if (visible) {
      //for (const p of fp) p.normal = normaliseVector(subtractVector(parentPosition, p.wp));
      //for (const p of fp) this.calcColorPoint(p, color, scene.lights);

      for (const light of scene.lights) {
        const lightVector = subtractVector(fp[0].wp, light.position);
        const normalisedLightVector = normaliseVector(lightVector);
        const dpLight = dotProduct(normalisedLightVector, faceNormal);

        if (dpLight > 0) color = this.blendColors(color, light, dpLight * 0.66);
      }

      //is current face facing the spotlight?
      // const facingSpot = dotProduct(spotlight1.direction, faceNormal);
      // if (facingSpot < 0) {
      //     //const center = centroid(wp);
      //     const spotlightVector = normaliseVector(subtractVector(spotlight1.position, fp[0].wp));
      //     // how similar is the spotlight -> face vector compared to the spotlight's direction vector?
      //     const dpSpotlight = dotProduct(spotlightVector, spotlight1.direction);
      //     if (1 - dpSpotlight < spotlight1.dpVariance) {
      //         const blendColor = spotlight1.colorA;

      //         const newRed = red * spotlight1.strength * -facingSpot;
      //         if (newRed > red) {
      //             red = newRed;
      //             if (red > 255) red = 255;
      //         }

      //         const newGreen = green * spotlight1.strength * -facingSpot;
      //         if (newGreen > green) {
      //             green = newGreen;
      //             if (green > 255) green = 255;
      //         }

      //         const newBlue = blue * spotlight1.strength * -facingSpot;
      //         if (newBlue > blue) {
      //             blue = newBlue;
      //             if (blue > 255) blue = 255;
      //         }

      //         //col = "yellow";
      //     }
      // }

      //shadeFace(fp);

      let strColor = this.toRGB(color);
      camera.view.fillStyle = strColor;
      camera.view.shadowColor = camera.view.fillStyle;
      camera.view.strokeStyle = strColor;
      this.drawFace(fp, camera);
      camera.view.shadowColor = "rgba(0,0,0,0)";
      for (const p of fp) if (p.id && p.xy) this.text(p.id, p.xy, camera);

      //drawSkew(testImage, xy[0], xy[1], xy[2], xy[3]);

      // const camVectorAB = subtractVector(fp[1], fp[0]);
      // const camVectorAC = subtractVector(fp[2], fp[0]);
      // const camNormal = crossProduct(camVectorAB, camVectorAC);
      // this.showNormals(fp, camNormal, camera);
    }
  }
  fill(points, color, camera) { // called when drawing Plane
    const fp = this.getFacePoints(points);
    let c = 0;
    for (const p of fp) if (!p.xy) return;
    let col = this.toRGB(color);
    camera.view.fillStyle = col;
    camera.view.shadowColor = col;
    camera.view.strokeStyle = col;
    this.drawFace(fp, camera);
    //this.text(this.id, fp[1].xy, camera);
  }
  blendColors(color, light, strength = 0.5) {
    strength = clamp(strength);
    const dr = (light.color[0] - color[0]) * strength;
    const dg = (light.color[1] - color[1]) * strength;
    const db = (light.color[2] - color[2]) * strength;
    return [color[0] + dr, color[1] + dg, color[2] + db];
  }
  toRGB(color) {
    return `rgb(${color[0]},${color[1]},${color[2]})`;
  }
  calcColorPoint(point, color, lightSources) {
    let red = 0,
      green = 0,
      blue = 0;
    for (const lightSource of lightSources) {
      const lightVector = subtractVector(point.wp, lightSource.position);
      const normalisedLightVector = normaliseVector(lightVector);
      let dpLight = dotProduct(normalisedLightVector, point.normal);
      const ambientLightLevel = 0.33;
      if (dpLight < ambientLightLevel) dpLight = ambientLightLevel;
      red += color.r * dpLight; // * lightSource.red;
      green += color.g * dpLight; // * lightSource.green;
      blue += color.b * dpLight; // * lightSource.blue;
    }
    point.color = [red, green, blue];
  }
  equalToOne(value, variance) {
    const diff = 1 - value;
    return diff < variance;
  }
  drawFace(points, camera) {
    camera.view.beginPath();
    this.drawLines(points, camera);
    camera.view.fill();

    if (
      gameSettings.selectFace &&
      camera.view.isPointInPath(camera.canvas.width / 2, camera.canvas.height / 2)
    ) {
      const oldStroke = camera.view.strokeStyle;
      camera.view.strokeStyle = "red";
      camera.view.stroke();
      camera.view.strokeStyle = oldStroke;
    }
  }
  drawLines(points, camera) {
    this.moveTo(points[points.length - 1].xy, camera);
    for (const p of points) this.lineTo(p.xy, camera);
  }
  showNormals(cp, camNormal, camera) {
    const center = centroid(cp);
    const cpCenter = this.toXyPoint(center);
    const normalEnd = addVector(center, camNormal);
    const cpNormalEnd = this.toXyPoint(normalEnd);
    camera.view.strokeStyle = "yellow";
    camera.view.beginPath();
    this.moveTo(cpCenter, camera);
    this.lineTo(cpNormalEnd, camera);
    camera.view.stroke();
  }
  get side() {
    return Face.sides[this.id];
  }
}
class Sphere extends GameObject {
  color = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
  model = [new Pt(0, 1, 0)];
  constructor(x, y, z, h = 16, v = h * 2, sx = 1, sy = 1, sz = 1) {
    super();
    this.position = { x, y, z };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = 1;
    this.dotSize = 2;
    const np = this.model[0];
    const sp = reverseVector(np);
    const stepH = Math.PI / h;
    const stepV = (Math.PI * 2) / v;
    for (let i = 1; i < h; i++)
      for (let j = 0; j < v; j++) {
        const phi = i * stepH;
        const theta = j * stepV;
        const x = Math.sin(phi) * Math.cos(theta);
        const z = Math.sin(phi) * Math.sin(theta);
        const y = Math.cos(phi);
        this.model.push(new Pt(x, y, z));
      }
    this.model.push(sp);

    // scale object in x, y, z directions
    for (const p of this.model) {
      p.x *= sx;
      p.y *= sy;
      p.z *= sz;
    }

    this.faces = [];

    // LAYER 0 (TOP): populate (v) faces around north pole (3 verts each)
    for (let i = 2; i <= v; ++i) {
      this.faces.push(new Face([0, i, i - 1]));
    }
    this.faces.push(new Face([0, 1, v]));

    // Populate middle layers (each face has 4 verts)
    for (let j = 0; j < h - 2; ++j) {
      for (let i = v * j + 1; i < v * (j + 1); ++i) {
        this.faces.push(new Face([i, i + 1, i + v + 1, i + v]));
      }
      this.faces.push(
        new Face([v * (j + 1), v * j + 1, v * (j + 1) + 1, v * (j + 2)])
      );
    }
    /*
        // LAYER 1
        for (let i = v*0+1; i < v*1; ++i) {
            this.faces.push(new Face(i, i + 1, i + v + 1, i + v));
        }
        this.faces.push(new Face(v*1, v*0+1, v*1+1, v*2));
        // LAYER 2
        for (let i = v*1 + 1; i < v*2; ++i) {
            this.faces.push(new Face(i, i+1, i+v+1, i+v));
        }
        this.faces.push(new Face(v*2, v*1+1, v*2+1, v*3));
        // LAYER 3
        for (let i = v*2+1; i < v*3; ++i) {
            this.faces.push(new Face(i, i+1, i+v+1, i+v));
        }
        this.faces.push(new Face(v*3, v*2+1, v*3+1, v*4));
        // LAYER 4
        for (let i = v*3+1; i < v*4; ++i) {
            this.faces.push(new Face(i, i+1, i+v+1, i+v));
        }
        this.faces.push(new Face(v*4, v*3+1, v*4+1, v*5));
        // LAYER 5
        for (let i = v*4+1; i < v*5; ++i) {
            this.faces.push(new Face(i, i+1, i+v+1, i+v));
        }
        this.faces.push(new Face(v*5, v*4+1, v*5+1, v*6));
        // LAYER 6
        for (let i = v*5+1; i < v*6; ++i) {
            this.faces.push(new Face(i, i+1, i+v+1, i+v));
        }
        this.faces.push(new Face(v*6, v*5+1, v*6+1, v*7));
*/
    // LAST LAYER (BOTTOM): populate (v) faces around south pole (3 verts)
    for (let i = (h - 2) * v + 1; i < (h - 2) * v + 1 + v; ++i) {
      this.faces.push(new Face([i, i + 1, (h - 1) * v + 1]));
    }
    this.faces.push(new Face([(h - 1) * v, (h - 2) * v + 1, (h - 1) * v + 1])); // south pole point
  }
  setPixel(p, camera) {
    if (p)
      camera.view.fillRect(
        p.x - this.dotSize / 2,
        p.y - this.dotSize / 2,
        this.dotSize,
        this.dotSize
      );
  }
  text(t, p, camera) {
    camera.view.font = "18px Arial";
    camera.view.fillText(t, p.x, p.y);
  }
}
class SimpleSphere extends GameObject {
  radius = 1;
  color = [255, 0, 0];
  factor = 1;
  model = [new Pt(-1, 0, 0)];
  #direction = { x: 0, y: 0, z: 1 };
  get direction() {
    return this.#direction;
  }
  set direction(d) {
    Object.assign(this.#direction, d);
  }
  draw(camera) {
    if (this.direction && this.speed)
      Object.assign(
        this.position,
        addVector(this.position, multiplyVector(this.direction, this.speed))
      );

    const unitVector2 = this.model[0];
    const unitvectorSphereCentreToCamera = normaliseVector(
      subtractVector(this.position, camera.position)
    );
    const camCenter = this.toCameraPoint(this.position, camera);
    const xySphereCenter = this.toXyPoint(camCenter, camera);
    const unitvectorToEdge = crossProduct(
      unitvectorSphereCentreToCamera,
      unitVector2
    );
    const vectorToEdge = multiplyVector(unitvectorToEdge, this.radius);
    const worldpointEdge = addVector(this.position, vectorToEdge);
    const camEdge = this.toCameraPoint(worldpointEdge, camera);
    const xySphereEdge = this.toXyPoint(camEdge, camera);

    if (xySphereCenter && xySphereEdge) {
      const xyRadius = Math.sqrt(
        (xySphereCenter.x - xySphereEdge.x) ** 2 +
          (xySphereCenter.y - xySphereEdge.y) ** 2
      );
      if (xyRadius > 1) {
        camera.view.fillStyle = arrayToColor(this.color);
        camera.view.beginPath();
        camera.view.arc(xySphereCenter.x, xySphereCenter.y, xyRadius, 0, Math.PI * 2);
        camera.view.fill();

        camera.view.globalCompositeOperation = "hard-light";
        //const light = scene.lights[0];
        for (const light of scene.lights) {
          const lightVector = normaliseVector(
            subtractVector(this.position, light.position)
          );
          const midVector = normaliseVector(
            addVector(lightVector, unitvectorSphereCentreToCamera)
          );
          const distance = dist3d(this.position, light.position);
          const mv = multiplyVector(midVector, this.radius);
          const av = addVector(this.position, mv);
          const cp = this.toCameraPoint(av, camera);
          const xySpecularCenter = this.toXyPoint(cp, camera);
          if (xySpecularCenter) {
            camera.view.save();
            camera.view.clip();
            const grad = camera.view.createRadialGradient(
              xySpecularCenter.x,
              xySpecularCenter.y,
              xyRadius / distance,
              xySpecularCenter.x,
              xySpecularCenter.y,
              xyRadius * 2
            );
            grad.addColorStop(0, arrayToColor(light.color));
            //grad.addColorStop(0, `rgba(${light.color[0]},${light.color[1]},${light.color[2]},0.5)`);
            grad.addColorStop(1, "rgba(255,255,255,0)");
            camera.view.fillStyle = grad;
            camera.view.fillRect(
              xySpecularCenter.x - xyRadius * 2,
              xySpecularCenter.y - xyRadius * 2,
              xyRadius * 4,
              xyRadius * 4
            );
            camera.view.restore();
          }
        }
        camera.view.globalCompositeOperation = "source-over";
      }
    }
  }
}
class Cylinder extends GameObject {
  color = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
  model = [new Pt(0, 1, 0), new Pt(0, 1, 1)];
  constructor(
    x,
    y,
    z,
    sc = 1,
    s = 6,
    sx = 1,
    sy = 1,
    sz = 1,
    northScale = 1,
    southScale = 1
  ) {
    super();
    this.position = { x, y, z };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = sc;
    const np = this.model[0];
    const sp = reverseVector(np);
    const step = (Math.PI * 2) / s;

    for (let i = 1; i < s; ++i) {
      // 11 iterations
      const newPoint = this.rotate(this.model[1], { y: i * step });
      this.model.push(newPoint);
    }

    for (let i = 1; i <= s; ++i) {
      // 12 iterations
      this.model.push(new Pt(this.model[i].x, -1, this.model[i].z));
    }
    this.model.push(sp);

    //for (let i = 0; i < this.model.length; ++ i) this.model[i].id = i;

    for (const p of this.model) {
      p.x *= sx;
      p.y *= sy;
      p.z *= sz;
    }
    np.y *= northScale;
    sp.y *= southScale;
    if (northScale < 1 || southScale < 1) this.concave = true;

    this.faces = [];
    // populate top faces (triangles)
    for (let i = 2; i <= s; ++i) this.faces.push(new Face([0, i, i - 1]));
    this.faces.push(new Face([0, 1, s]));

    // populate bottom faces (triangles)
    const spi = s * 2 + 1; // south pole index
    for (let i = s + 1; i <= s * 2 - 1; ++i)
      this.faces.push(new Face([spi, i, i + 1]));
    this.faces.push(new Face([spi, spi - 1, s + 1]));

    // populate side faces (squares)
    for (let i = 1; i < s; ++i)
      this.faces.push(new Face([i, i + 1, i + s + 1, i + s]));
    this.faces.push(new Face([s, 1, s + 1, s * 2]));
  }
  text(t, p, camera) {
    camera.view.fillStyle = "red";
    camera.view.font = "18px Arial";
    if (p) camera.view.fillText(t, p.x, p.y);
  }
}
class Cube extends GameObject {
  color = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
  model = [
    new Pt(-1, 1, -1), // 0 top-left front
    new Pt(1, 1, -1), // 1 top-right front
    new Pt(1, -1, -1), // 2 bottom-right front
    new Pt(-1, -1, -1), // 3 bottom-left front
    new Pt(-1, 1, 1), // 4 top-left back
    new Pt(1, 1, 1), // 5 top-right back
    new Pt(1, -1, 1), // 6 bottom-right back
    new Pt(-1, -1, 1), // 7 bottom-left back
  ];
  faces = [
    new Face([0, 1, 2, 3]), // front
    new Face([5, 4, 7, 6]), // back
    new Face([4, 5, 1, 0]), // top
    new Face([3, 2, 6, 7]), // bottom
    new Face([4, 0, 3, 7]), // left
    new Face([1, 5, 6, 2]), // right
  ];
  constructor(x, y, z, sx = 1, sy = sx, sz = sy) {
    super();
    x ??= Math.random() * 50 - 25;
    y ??= Math.random() * 50 - 25;
    z ??= Math.random() * 190 + 10;
    for (const p of this.model) {
      p.x *= sx;
      p.y *= sy;
      p.z *= sz;
    }
    this.position = { x, y, z };
    this.rotation = { x: 0, y: 0, z: 0 };
    const maxRotate = 0.05;
    const maxOffset = maxRotate / 2;
    //this.auto = { /*x: Math.random() * maxRotate - maxOffset,*/ y: Math.random() * maxRotate - maxOffset/*, z: Math.random() * maxRotate - maxOffset*/ };
    this.auto = { x: 0, y: 0.01, z: 0 };
  }
}
class Pyramid extends GameObject {
  color = rndColor();
  model = [
    new Pt(0, 1, 0),
    new Pt(1, 0, 1),
    new Pt(1, 0, -1),
    new Pt(-1, 0, -1),
    new Pt(-1, 0, 1),
  ];
  faces = [
    new Face([0, 1, 2]),
    new Face([0, 2, 3]),
    new Face([0, 3, 4]),
    new Face([0, 4, 1]),
    new Face([4, 3, 2, 1]),
  ];
  constructor(x, y, z, s = 1, sx = 1, sy = 1, sz = 1) {
    super(x, y, z, s);
    for (const p of this.model) {
      p.x *= sx;
      p.y *= sy;
      p.z *= sz;
    }
  }
}
class Cone extends GameObject {
  color = rndColor();
  model = [ new Pt(0, 0, 0), new Pt(0, 1, 0), new Pt(1, 1, 0) ];
  constructor(x, y, z, s = 1, sx = 1, sy = 1, sz = 1, segs = 3) {
    super(x, y, z, s);
    const np = this.model[1];
    const start = this.model[2];
    const step = Math.PI * 2 / segs;
    for(let i = 1; i < segs; ++i) {
      const newPt = this.rotateY(start, i * step);
      this.model.push(newPt);
    }

    for (const p of this.model) { p.x *= sx; p.y *= sy; p.z *= sz; }

    this.faces = [];
    for(let i = 2; i < 1 + segs; ++i) {
      this.faces.push(new Face([0, i, i + 1]));
      this.faces.push(new Face([1, i + 1, i]));
    }
    this.faces.push(new Face([0, segs + 1, 2]));
    this.faces.push(new Face([1, 2, segs + 1]));
  }
  update() {
    const height = plane.height(this.position);
    this.position.y = height;
    super.update();
  }
}
class Wedge extends GameObject {
  color = rndColor();
  model = [
    new Pt(-1, 0, -1),
    new Pt(1, 0, -1),
    new Pt(1, 0, 1),
    new Pt(-1, 0, 1),
    new Pt(-1, 1, 1),
    new Pt(-1, 1, -1),
  ];
  faces = [
    new Face([0, 1, 2, 3]),
    new Face([0, 3, 4, 5]),
    new Face([1, 5, 4, 2]),
    new Face([0, 5, 1]),
    new Face([3, 2, 4]),
  ];
}
class Triangle extends GameObject {
  color = [255, 255, 0];
  model = [new Pt(-1, -1, 0), new Pt(1, -1, 0), new Pt(1, 1, 0)];
  faces = [new Face([0, 1, 2], true)];
}
class Torus extends GameObject {
    concave = true;
    color = rndColor();
    constructor(x, y, z, rT = 1, rC = 0.5, segT = 8, segC = 8) {
        super(x, y, z);
        this.init(rT, rC, segT, segC);
        this._lod = segT;
    }
    init(rT, rC, segT, segC) {
        // consider a torus as a cylinder evenly curved around so the ends meet up
        const stepRC = Math.PI * 2 / segC; // step around axis of cylinder
        const stepRT = Math.PI * 2 / segT; // step around axis of torus (line thru centre of hole)
        const np = { x: 0, y: rC, z: 0 };

        const points = [];
        this.model = [];
        this.faces = [];

        // calculate first circle/slice around surface of torus
        for (let i = 0; i < segC; i++) {
          const angleRC = i * stepRC;
          const rp = this.rotateZ(np, angleRC);
          rp.x += rT; // move (translate) point to the 'right' by the radius of the torus
          points.push(rp);
          this.model.push(rp);
        }

        // rotate first slice around a circle to calculate all torus surface points
        for (let i = 1; i < segT; i++) {
          for (const p of points) {
            const rp = this.rotateY(p, stepRT * i);
            this.model.push(rp);
          }
        }

        // calculate all faces of the torus
        for (let i = 0; i < segT; i++) {
          for (let j = 0; j < segC; j++) {
            const slice = i * segT;
            const a = j + slice;
            const b = ((j + 1) % segC) + slice;
            const c = ((segC + (( j + 1) % segC)) + slice) % (segC * segT);
            const d = (segC + j + slice) % (segC * segT);
            this.faces.push(new Face([a, b, c, d]));
          }
        }

        // give each model point an id for debugging if needed
        //for (let i = 0; i < this.model.length; ++i) this.model[i].id = i;
    }
    set lod(v) {
      v = Math.floor(v);
      this._lod = v;
      if (v > 2 && v <=64) this.init(1, 0.5, v, v);
    }
    get lod() { return this._lod; }
}
class FileObject extends GameObject {
  color = rndColor();
  constructor(x, y, z, s, model, faces) {
    super(x, y, z, s);
    this.model = [];
    for(const m of model) this.model.push(new Pt(m[0], m[1], m[2]));
    this.faces = [];
    for(const f of faces) this.faces.push(new Face(f));
  }
}
function distSquared(p1, p2) {
  return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2;
}
class PointLight extends GameObject {
  radius = 1000;
  angle = 0;
  color = [255, 255, 255];
  count = 0;
  constructor(x = 0, y = 0, z = 20, d = 1) {
    super();
    this.position = { x, y, z };
    this.direction = d;
  }
  setColor(value) {
    this.el.style.color = value;
    const col = window.getComputedStyle(this.el).color;
    this.color = col
      .substring(4, col.length - 1)
      .split(", ")
      .map(Number);
  }
  get red() {
    return this.color[0] / 255;
  }
  get green() {
    return this.color[1] / 255;
  }
  get blue() {
    return this.color[2] / 255;
  }
  draw(camera) {
    this.angle = 0.01;
    const sin = Math.sin(++this.count * (Math.PI / 45));
    //console.log(sin.toFixed(3));
    this.position.y += sin / 5;
    Object.assign(
      this.position,
      this.rotate(this.position, { y: this.angle * this.direction }, "y")
    );

    const position = this.toXyPoint(this.toCameraPoint(this.position, camera), camera);
    //const circ  = this.toXyPoint(this.toCameraPoint({x: this.position.x + this.radius, y: this.position.y, z: this.position.z }, camera));
    if (position) {
      const d = dist3d(this.position, camera.position);
      const radius = this.radius / d;
      if (radius > 0) {
        const oldStyle = camera.view.fillStyle;
        const grad = camera.view.createRadialGradient(
          position.x,
          position.y,
          radius / 2,
          position.x,
          position.y,
          radius
        );
        grad.addColorStop(
          0,
          `rgba(${this.color[0]},${this.color[1]},${this.color[2]}, 0.7)`
        );
        grad.addColorStop(1, "rgba(0,0,0,0)");
        camera.view.fillStyle = grad;
        camera.view.fillRect(
          position.x - radius,
          position.y - radius,
          radius * 2,
          radius * 2
        );
        camera.view.fillStyle = oldStyle;
      }
    }
  }
}
class SpotLight extends GameObject {
  radius = 0.5;
  angle = (Math.PI * 2) / 40;
  dpVariance = 0.01;
  colorA = [255, 255, 255, 0.5];
  strength = 1.5;
  get color() {
    return `rgba(${this.colorA[0]},${this.colorA[1]},${this.colorA[2]},${this.colorA[3]})`;
  }
  model = new Pt(0, 0, 1);
  constructor(x, y, z) {
    super();
    this.position = { x, y, z };
    this.direction = { x: 0, y: 0, z: 1 };
    this.rotation = { x: 0, y: 0, z: 0 };
  }
  draw(camera) {
    const xyCenter = this.toXyPoint(this.toCameraPoint(this.position, camera));
    const xyEdge = this.toXyPoint(
      this.toCameraPoint(
        {
          x: this.position.x + this.radius,
          y: this.position.y,
          z: this.position.z,
        },
        camera
      )
    );
    const lp = this.toLocalPoint(this.model);
    const wp = this.toWorldPoint(lp);
    const cp = this.toCameraPoint(wp, camera);
    const xy = this.toXyPoint(cp);
    if (xyCenter && xyEdge) {
      const radius = xyEdge.x - xyCenter.x;
      if (radius > 0) {
        const oldStyle = camera.view.fillStyle;
        camera.view.fillStyle = this.color;
        camera.view.arc(xyCenter.x, xyCenter.y, radius, 0, Math.PI * 2);
        camera.view.fill();
        camera.view.fillStyle = oldStyle;
      }
      camera.view.lineWidth = 5;
      const oldStroke = camera.view.strokeStyle;
      camera.view.strokeStyle = this.color;
      camera.view.beginPath();
      this.moveTo(xyCenter);
      this.lineTo(xy);
      camera.view.stroke();
      camera.view.strokeStyle = oldStroke;
      camera.view.lineWidth = 1;
    }
  }
}
class Particle {
  color = [255, 255, 0, 1];
  size = 8;
  direction = { x: 0, y: 1, z: 0 };
  speed = 0.01;
  fadeOut = 0.2;
  constructor(pos, col = [255, 255, 255, 1], lifetime, direction, spread) {
    this.lifetime = this.ttl = lifetime;
    this.position = { x: pos.x, y: pos.y, z: pos.z };
    this.color = [250, 125, 0, 1];
    const variance = 100;
    const varRed = Math.random() * variance - variance / 2;
    this.color[0] = this.color[0] += varRed;
    this.color[0] = this.clamp(this.color[0], 0, 255);

    const varGreen = Math.random() * variance - variance / 2;
    this.color[1] = this.color[1] += varGreen;
    this.color[1] = this.clamp(this.color[1], 0, 255);

    const varBlue = Math.random() * variance - variance / 2;
    this.color[2] = this.color[2] += varBlue;
    this.color[2] = this.clamp(this.color[2], 0, 255);

    Object.assign(this.direction, direction);
    if (spread) {
      const varX = this.rnd(-spread, spread);
      this.direction.x += varX;
      const varZ = this.rnd(-spread, spread);
      this.direction.z += varZ;
    }
  }
  rnd(min, max) {
    return Math.random() * (max - min) + min;
  }
  clamp(v, l, u) {
    if (v < l) return l;
    if (v > u) return u;
    return v;
  }
  draw(camera) {
    if (this.ttl > 0) {
      this.ttl -= 1;
      this.direction.y += this.parent.gravity;
      Object.assign(
        this.position,
        addVector(this.position, multiplyVector(this.direction, this.speed))
      );
      if (this.position.y < -10) {
        this.position.y = -10;
        this.direction.y = -this.direction.y * 0.95;
      }
      const xy = this.toXyPoint(this.toCameraPoint(this.position, camera), camera);
      if (xy) {
        const fadePoint = this.lifetime * this.fadeOut;
        this.color[3] = this.ttl < fadePoint ? this.ttl / fadePoint : 1;
        const color = arrayToColorA(this.color);
        const oldFillStyle = camera.view.fillStyle;
        //camera.view.fillStyle = color;
        //view.fillRect(xy.x, xy.y, this.size, this.size);

        // view.beginPath();
        // view.arc(xy.x, xy.y, this.size, 0, Math.PI * 2);
        // view.fill();

        const grad = camera.view.createRadialGradient(
          xy.x,
          xy.y,
          0,
          xy.x,
          xy.y,
          this.size
        );
        grad.addColorStop(0, color);
        const colorStop = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},0)`;
        grad.addColorStop(1, colorStop);
        camera.view.fillStyle = grad;
        camera.view.fillRect(
          xy.x - this.size,
          xy.y - this.size,
          this.size * 2,
          this.size * 2
        );

        camera.view.fillStyle = oldFillStyle;
      }
    }
  }
  toCameraPoint(p, camera) {
    const cp = subtractVector(camera.position, p);
    const l = length(cp);
    if (l > camera.max) return null;
    const cv = normaliseVector(cp);
    const dp = dotProduct(cv, camera.direction);
    if (dp < 0 /*camera.fov*/) return null;
    const ry = this.rotate(cp, camera.rotation, "y");
    const rx = this.rotate(ry, camera.rotation, "x");
    return rx;
  }
  toXyPoint(p, camera) {
    if (p == null || p.z == 0) return null;
    if (p == null || p.z == 0) return null;
    const xy = { x: (p.x / p.z) * camera.canvas.width, y: (p.y / p.z) * camera.canvas.width };
    return xy;
  }
  rotate(p, rotation, axis = "y") {
    const angle = rotation[axis] ?? rotation;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    switch (axis) {
      case "x":
        return { x: p.x, y: p.y * cos - p.z * sin, z: p.y * sin + p.z * cos };
      case "y":
        return { x: p.x * cos - p.z * sin, y: p.y, z: p.x * sin + p.z * cos };
      case "z":
        return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos, z: p.z };
    }
  }
}
class ParticleEmitter {
  rate = 0.5;
  color = [255, 255, 0, 1];
  size = 1;
  varSize = 0;
  shape = 1;
  direction = { x: 0, y: 1, z: 0 };
  speed = 0.3;
  spread = 0.5;
  ttl = 300;
  gravity = -0.005;
  particles = [];
  active = true;
  constructor(x, y, z) {
    this.position = { x, y, z };
  }
  draw(camera) {
    if (this.active) {
      if (this.rate > 1) {
        for (let i = 0; i < this.rate; ++i) {
          this.particles.push(this.newParticle());
        }
      } else {
        if (Math.random() < this.rate) this.particles.push(this.newParticle());
      }

      const oldFillStyle = camera.view.fillStyle;
      for (const p of this.particles) p.draw(camera);
      camera.view.fillStyle = oldFillStyle;
      if (this.particles.length > 1000)
        this.particles = this.particles.filter((p) => p.ttl > 0);
    }
  }
  distance(camera) {
    return Math.sqrt(
      (this.position.x - camera.position.x) ** 2 +
        (this.position.y - camera.position.y) ** 2 +
        (this.position.z - camera.position.z) ** 2
    );
  }
  newParticle() {
    const p = new Particle(
      this.position,
      this.color,
      this.ttl,
      this.direction,
      this.spread
    );
    p.parent = this;
    //p.direction = { x: Math.random() * 2 - 1, y: Math.random() * 2, z: Math.random() * 2 - 1 };
    p.speed = Math.random() * this.speed;
    return p;
  }
}
class Rotation {
  #x = 0;
  #y = 0;
  ttl = 0;
  #dirty = false;
  #direction = { x: 0, y: 0, z: 1 };
  get x() {
    return this.#x;
  }
  get y() {
    return this.#y;
  }
  set x(value) {
    this.#x = value;
    this.#dirty = true;
  }
  set y(value) {
    this.#y = value;
    this.#dirty = true;
  }
  get heading() {
    return { x: -Math.sin(-this.#y), y: 0, z: Math.cos(-this.#y) };
  }
  get pitchVector() {
    return { x: Math.cos(-this.#y), y: 0, z: Math.sin(-this.#y) };
    //return { x: Math.cos(-this.#y), y: 0, z: Math.sin(-this.#y) };
  }
  get direction() {
    if (this.#dirty) {
      const cosY = Math.cos(-this.#y);
      const sinY = Math.sin(-this.#y);
      const heading = { x: -sinY, y: 0, z: cosY };
      const pitchVector = { x: cosY, y: 0, z: sinY };
      Object.assign(
        this.#direction,
        rotatePointAroundUnitVector(heading, pitchVector, -this.#x)
      );
      this.#dirty = false;
    }
    return this.#direction;
  }
  animate(nx, ny) {
    const steps = 100;
    this.dx = (nx - this.#x) / steps ;
    this.dy = (ny - this.#y) / steps;
    this.ttl = steps;
  }
  update() {
    if (this.ttl > 0) {
      this.ttl -= 1;
      this.#x += this.dx;
      this.#y += this.dy;
      this.#dirty = true;
    }
  }
}
class Camera extends GameObject {
  concave = true;
  model = [ new Pt(0, 0, 0), new Pt(-1, 1, 3), new Pt(1, 1, 3), new Pt(1, -1, 3), new Pt(-1, -1, 3) ];
  faces = [ new Face([0, 1, 2], true), new Face([0, 2, 3], true), new Face([0, 3, 4], true), new Face([0, 4, 1], true) ];
  forwardVector = { x: 0, y: 0, z: 1 };
  rightVector = { x: 1, y: 0, z: 0 };
  upVector = { x: 0, y: 1, z: 0 };
  rotation = new Rotation(); // { x: 0, y: 0 };
  // rotation = { x: 0, y: 0 };
  zoom = 1; 
  max = 500;
  min = 1;
  fov = 0;
  static #nextId = 0;
  static Active = null;
  static Cameras = [];
  static get Count() { return Camera.Cameras.length; }
  constructor(x = 0, y = 0, z = 0, s = 1, sx = 1, sy = 1, sz = 1) {
    super(x, y, z, s);
    Camera.Cameras.push(this);
    this.canvas = document.createElement("canvas");
    this.canvas.backgroundPosition = { x: 0, y: 0 };
    this.canvas.camera = this; 
    document.body.appendChild(this.canvas);
    this.view = this.canvas.getContext("2d");

    this.id = ++Camera.#nextId;
    for (const p of this.model) {
      p.x *= sx;
      p.y *= sy;
      p.z *= sz;
      p.parent = this;
    }
    //for(let i = 0; i < this.model.length; ++i) this.model[i].id = i;
  }
  lookAt(go) {
    // calc vector from camera to game object
    const vector = subtractVector(this.position, go.position);
    const unitVector = normaliseVector(vector);

    // calc y angle of object to camera
    const angleY = Math.atan2(unitVector.z, unitVector.x);
    const adjustedY = -(angleY - Math.PI / 2);

    // calc x angle
    const ry = this.rotateY(unitVector, adjustedY);
    const angleX = Math.atan2(ry.z, ry.y);
    const adjustedX = -(angleX - Math.PI / 2);

    this.rotation.animate(adjustedX, adjustedY);
  }
  get heading() {
    return {
      x: -Math.sin(-this.rotation.y),
      y: 0,
      z: Math.cos(-this.rotation.y),
    };
  }
  get pitchVector() {
    return {
      x: Math.cos(-this.rotation.y),
      y: 0,
      z: Math.sin(-this.rotation.y),
    };
  }
  get direction() {
    //const heading = this.rotate(this.forwardVector, this.rotation, "y");
    //const pitchVector = this.rotate(this.rightVector, this.rotation, "y");
    //const direction = rotatePointAroundUnitVector(this.heading, pitchVector, -this.rotation.x);
    //const direction = rotatePointAroundUnitVector(this.heading, this.pitchVector, -this.rotation.x);
    //return direction;
    // const ry = this.rotate(this.model, this.rotation, "y");
    // const rx = this.rotate(ry, this.rotation, "x");
    // return rx;

    return this.rotation.direction;
  }
  get rightDirection() {
    //const rightPoint = this.rotate(this.rightVector, this.rotation, "y");
    const rightPoint = this.rotation.pitchVector;
    return rightPoint;
  }
  moveForward(dist) {
    const moveVector = multiplyVector(this.direction, dist);
    const newPosition = addVector(this.position, moveVector);
    Object.assign(this.position, newPosition);
  }
  moveBack(dist) {
    this.moveForward(-dist);
  }
  moveRight(dist) {
    //const forwardVector = this.direction;
    const rightVector = this.rightDirection; // { x: forwardVector.z, y: forwardVector.y, z: -forwardVector.x };
    const moveVector = multiplyVector(rightVector, dist);
    Object.assign(this.position, addVector(this.position, moveVector));
  }
  moveLeft(dist) {
    this.moveRight(-dist);
  }
  moveNorth(dist) {
    const moveVector = multiplyVector(this.heading, dist);
    Object.assign(this.position, addVector(this.position, moveVector));
  }
  moveUp(dist = 1) {
    this.position.y += 0.1 * dist;
  }
  moveDown(dist = 1) {
    this.moveUp(-dist);
  }
  turnRight() {
    this.rotation.y += 0.01;
    this.canvas.backgroundPosition.x -= 13;
    this.canvas.style.backgroundPositionX = `${this.canvas.backgroundPosition.x}px`;
  }
  turnLeft() {
    this.rotation.y -= 0.01;
    this.canvas.backgroundPosition.x += 13;
    this.canvas.style.backgroundPositionX = `${this.canvas.backgroundPosition.x}px`;
  }
  pitchUp(a) {
    this.canvas.backgroundPosition.y -= a * 1330;

    // clamp camera pitch between directly up and directly down
    if (this.rotation.x < -Math.PI / 2) this.rotation.x = -Math.PI / 2;
    else if (this.rotation.x > Math.PI / 2) this.rotation.x = Math.PI / 2;
    else this.canvas.style.backgroundPositionY = `${this.canvas.backgroundPosition.y}px`;

    this.rotation.x -= a;
  }
  pitchDown(a) {
    this.pitchUp(-a);
  }
  reset() {
    this.position.x = 0;
    this.position.y = 0;
    this.position.z = 0;
    this.rotation.x = 0;
    this.rotation.y = 0;
  }
  cameraRotate(p, rotation, axis) {
    //if (p.parent != this) return super.rotate(p, rotation, axis);
    const angle = -rotation[axis];
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    switch (axis) {
      case "x":
        return { x: p.x, y: p.y * cos - p.z * sin, z: p.y * sin + p.z * cos };
      case "y":
        return { x: p.x * cos - p.z * sin, y: p.y, z: p.x * sin + p.z * cos };
      case "z":
        return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos, z: p.z };
    }
  }
  update() {
    super.update();
    this.rotation.update();
  }
}
class Scene {
  constructor(plane = null) {
    this.plane = plane;
    this.reset();
  }
  reset() {
    this.objects = [];
    this.lights = [];
  }
  add(o) {
    this.objects.push(o);
  }
  addLight(l) {
    this.lights.push(l);
    this.add(l);
  }
  update() {
    this.plane.update();
    for (const o of this.objects) if (o.update) o.update();
  }
  draw(camera) {
    if (gameSettings.animate) {
      const w = camera.canvas.width;
      const h = camera.canvas.height;
      camera.view.clearRect(-w / 2, -h / 2, w, h);
      if (this.plane) this.plane.draw(camera);
      this.distance(camera);
      this.sort(camera);
      for (const o of this.filter(camera)) if(o !== camera) o.draw(camera);
    }
  }
  distance(camera) { for(const o of this.objects) o.dfc = o.distance(camera); }
  sort(camera) { this.objects.sort((a, b) => b.dfc - a.dfc); }
  filter(camera) { return this.objects.filter(o => o.dfc < camera.max); }
}
//#endregion
//#region Define objects
const tp1 = new TerrainPoint(80, 130, 20, 50);
const lightSource1 = new PointLight(0, 25, 20);
lightSource1.color = [255, 255, 0];
const lightSource2 = new PointLight(0, 5, -100, -1);
lightSource2.color = [255, 69, 0];
//const spotlight1 = new SpotLight(0, 0, 10);

const camera1 = new Camera(0, 1, 0);
camera1.color = [255, 0, 0, 0.5];
const camera2 = new Camera(12, 2, -80);
camera2.color = [0, 0, 255, 0.5];
Camera.Active = camera1;

const cone1 = new Cone(2, 2, 2, 1, 0.2, 2, 0.2, 16);

const pyramid4 = new Pyramid(12, -10, -80, 1, 1, 12);

const peg = new ParticleEmitter(0, -9, 70);
const pyramid2 = new Pyramid(0, -10, 70);
const cube = new Cube(-5, 0, 0, 1, 10, 0.1);
const sphere = new Sphere(0, 0, 40, 4, 32, 4, 0.5);
sphere.auto.x = 0.02;
const cylinder = new Cylinder(-10, 0, 10, 1, 6, 3, 0.5, 6, 5, 1);
cylinder.auto.y = 0.03;
const pyramid = new Pyramid(-8, -10, -50, 1, 1, 10);
const wedge = new Wedge(-3, 0, 0, 1, 1, 1);
const sphere2 = new Sphere(50, 50, 20, 16);
//const sphere3 = new Sphere(20, 0, 20, 16);
const tri1 = new Triangle(0, 0, -50);
const simple = new SimpleSphere(5, 0, 20);

const pyramid3 = new Pyramid(0, -10, 100, 1, 1, 1);
const torus = new Torus(0, 0, 100, 5, 2, 5, 5);
torus.auto.y = 0.01;
//torus.auto.z = 0.01;
//#endregion
//#region DatGui
const gui = new dat.GUI();
gui.add(torus, "lod", 3, 32).name("Torus Detail");
gui.addColor(gameSettings, "debugColor").name("Debug Color");

if (tp1) {
  const terrainFolder = gui.addFolder("Terrain Point");
  terrainFolder.add(tp1, "x", 0, 100).step(1);
  terrainFolder.add(tp1, "y", -100, 130).step(1);
  terrainFolder.add(tp1, "z", 0, 100).step(1);
  terrainFolder.add(tp1, "radius", 1, 100).step(1);
}

if (cone1) {
  const coneFolder = gui.addFolder("Cone");
  coneFolder.add(cone1.position, "x", -4, 4).step(0.1);
  coneFolder.add(cone1.position, "z", -4, 4).step(0.1);
}

const cubeFolder = gui.addFolder("Cube");
cubeFolder.add(cube, "scale", 1, 25).name("Scale");
const cubePosition = cubeFolder.addFolder("Position");
cubePosition.add(cube.position, "x", -20, 20);
cubePosition.add(cube.position, "y", -20, 20);
cubePosition.add(cube.position, "z", 10, 200);
const cubeRotation = cubeFolder.addFolder("Rotation");
cubeRotation.add(cube.rotation, "x", -Math.PI, Math.PI);
cubeRotation.add(cube.rotation, "y", -Math.PI, Math.PI);
cubeRotation.add(cube.rotation, "z", -Math.PI, Math.PI);

const sphereFolder = gui.addFolder("Sphere");
sphereFolder.add(sphere, "scale", 1, 25).name("Scale");
sphereFolder.addColor(sphere, "color").name("Colour");
const spherePosition = sphereFolder.addFolder("Position");
spherePosition.add(sphere.position, "x", -20, 20);
spherePosition.add(sphere.position, "y", -20, 20);
spherePosition.add(sphere.position, "z", 10, 200);
const sphereRotation = sphereFolder.addFolder("Rotation");
sphereRotation.add(sphere.rotation, "x", -Math.PI, Math.PI);
sphereRotation.add(sphere.rotation, "y", -Math.PI, Math.PI);
sphereRotation.add(sphere.rotation, "z", -Math.PI, Math.PI);

// const light = gui.addFolder("Light Source");
// light.add(spotlight1.position, "x", -40, 40);
// light.add(spotlight1.position, "y", -40, 40);
// light.add(spotlight1.position, "z", -100, 250);
// light.addColor(spotlight1, "colorA").name("Colour");
// light.add(spotlight1, "dpVariance", 0, 0.1);
// light.add(spotlight1, "strength", 0, 10);
const cam = gui.addFolder("Camera");
cam.add(Camera.Active, "max", 0, 1000);
cam.add(Camera.Active, "min", 0, 25);
cam.add(Camera.Active, "fov", -1, 1);
const camRotation = cam.addFolder("Rotation");
const camPosition = cam.addFolder("Position");
camRotation.add(Camera.Active.rotation, "x", -1.5, 1.5).step(0.001).listen();
camRotation.add(Camera.Active.rotation, "y", -1.5, 1.5).step(0.001).listen();
camPosition.add(Camera.Active.position, "x", -100, 100).listen();
camPosition.add(Camera.Active.position, "y", -100, 100).listen();
camPosition.add(Camera.Active.position, "z", -100, 100).listen();
gui.add(gameSettings, "animate");
gui.add(gameSettings, "doubleDraw").name("Wireframe");
gui.add(gameSettings, "showCrossHair").name("Crosshair");
gui.add(simple, "radius", 0, 5);
gui.add(peg, "gravity", -0.1, 0);
gui.add(peg, "speed", 0, 1);
//#endregion
//#region Setup scene
const plane = new Plane(400, 50, -10, [128, 128, 128], [192, 192, 192]);
//const plane = new Plane(8, 4, 0, [128, 128, 128], [192, 192, 192]);
plane.addTerrainPoint(tp1);
plane.init();
const scene = new Scene(plane);

scene.add(camera1);
scene.add(camera2);
// scene.add(pyramid4);

// scene.add(cube);
// scene.add(sphere);
// scene.add(cylinder);
// scene.add(pyramid);
// scene.add(wedge);
// scene.add(sphere2);
// // // //scene.add(sphere3);

scene.addLight(lightSource1);
scene.addLight(lightSource2);

// scene.add(tri1);
// scene.add(simple);
// scene.add(peg);
// scene.add(pyramid2);

// scene.add(pyramid3);
// scene.add(torus);
// scene.add(peg);
// scene.add(pyramid2);

scene.add(cone1);
//scene.add(spotlight1);

//for(let i = 0; i < 100; ++i) scene.add(new Cube());
//#endregion
//#region Connect objects
cube.connect(wedge);
//#endregion
//#region Animate
let delta = 0.1;
function animate() {
  //#region Game Input
  if (GameInput.Control) delta = (delta == 0.1) ? 1: 0.1;
  if (GameInput.Forward) Camera.Active.moveForward(delta);
  if (GameInput.Back) Camera.Active.moveBack(delta);
  if (GameInput.Right) Camera.Active.moveRight(delta);
  if (GameInput.Left) Camera.Active.moveLeft(delta);
  if (GameInput.TurnRight) { Camera.Active.turnRight(); }
  if (GameInput.TurnLeft) { Camera.Active.turnLeft(); }
  if (GameInput.Up) Camera.Active.moveUp(delta * 10);
  if (GameInput.Down) Camera.Active.moveDown(delta * 10);
  if (GameInput.Reset) Camera.Active.reset();
  if (GameInput.North) Camera.Active.moveNorth(delta);
  if (GameInput.South) Camera.Active.moveNorth(-delta);
  if (GameInput.Camera1) Camera.Active = camera1;
  if (GameInput.Camera2) Camera.Active = camera2;
  if (GameInput.PitchUp) Camera.Active.pitchUp(0.005);
  if (GameInput.PitchDown) Camera.Active.pitchDown(0.005);
  if (GameInput.Look) Camera.Active.lookAt(torus);
  if (GameInput.OpenFile) openFile();
  if (GameInput.Fire) {
    const bullet = new SimpleSphere(
      Camera.Active.position.x,
      Camera.Active.position.y,
      Camera.Active.position.z
    );
    bullet.direction = Camera.Active.direction;
    bullet.speed = 1;
    bullet.scale = 0.2;
    scene.add(bullet);
  }
  //#endregion
  scene.update();
  scene.draw(camera1);
  scene.draw(camera2);
  if (gameSettings.showCrossHair) {
    const oldStroke = Camera.Active.view.strokeStyle;
    const oldLineWidth = Camera.Active.view.lineWidth;
    Camera.Active.view.lineWidth = 2;
    Camera.Active.view.beginPath();
    Camera.Active.view.strokeStyle = "white";
    Camera.Active.view.arc(0, 0, gameSettings.crossHairRadius - 2, 0, Math.PI * 2);
    Camera.Active.view.stroke();
    Camera.Active.view.strokeStyle = "black";
    Camera.Active.view.beginPath();
    Camera.Active.view.arc(0, 0, gameSettings.crossHairRadius, 0, Math.PI * 2);
    Camera.Active.view.stroke();
    Camera.Active.view.lineWidth = oldLineWidth;
    Camera.Active.view.strokeStyle = oldStroke;
  }
  requestAnimationFrame(animate);
}
async function pickSingleFile() {
  [fileHandle] = await window.showOpenFilePicker();
  return await fileHandle.getFile();
}
async function readFile(file) {
  const text = await file.text();
  const lines = text.split("\n");
  const verts = lines.filter(l => l[0] == 'v').map(v => v.split(' ').filter((_, i) => i > 0).map(Number));
  const faces = lines.filter(l => l[0] == 'f').map(v => v.split(' ').filter((_, i) => i > 0).map(v => Number(v) - 1));
  console.log(verts);
  console.log(faces);
  const fo = new FileObject(0, 0, 20, 1, verts, faces);
  fo.concave = true;
  const lightSource1 = new PointLight(0, 25, 20);
  lightSource1.color = [255, 255, 0];
  scene.reset();
  scene.add(fo);
  scene.addLight(lightSource1);
  return text;
}
async function openFile() {
  pickSingleFile().then(readFile).then(console.log).catch(console.error);
}
//resize();
resetCameras();
requestAnimationFrame(animate);
//#endregion
