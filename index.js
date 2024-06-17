console.log("working. . . ");
const canvas = document.querySelector("canvas");
const view = canvas.getContext("2d");
const testImage = new Image();
testImage.src = 'res/profile.png';
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
      const state = Keyboard.state[event.code];
      if (state === undefined)
        Keyboard.state[event.code] = new KeyState(true, true);
      else state.isPressed = true;
    }
    static keyUp(event) {
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
  class GameInput {
    static get isForward() {
      return Keyboard.isDown("KeyW");
    }
    static get isLeft() {
      return Keyboard.isDown("KeyA");
    }
    static get isRight() {
      return Keyboard.isDown("KeyD");
    }
    static get isBack() {
      return Keyboard.isDown("KeyS");
    }
    static get isUp() {
        return Keyboard.isDown("ArrowUp");
    }
    static get isDown() {
        return Keyboard.isDown("ArrowDown");
    }
    static get isReset() { return Keyboard.isPressed("KeyR"); }
  }
//#endregion
//#region Resize handler
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    view.translate(canvas.width / 2, canvas.height / 2);
    view.scale(1, -1);

    view.lineWidth = 2;
    view.strokeStyle = "black";
    view.lineJoin = "bevel";
}
resize();
addEventListener("resize", resize);
//#endregion
//#region Pointer Lock
document.addEventListener("pointerlockchange", lockChange);
canvas.addEventListener("click", async () => {
    if (!document.pointerLockElement) {
      await canvas.requestPointerLock({
        unadjustedMovement: true,
      });
    } else {
        await document.exitPointerLock();
    }
  });
  function lockChange() {
    if (document.pointerLockElement === canvas) document.addEventListener("mousemove", updatePosition);
    else document.removeEventListener("mousemove", updatePosition);
  }
  function updatePosition(e) {
    camera.rotation.x -= e.movementY / 1000; // look up/down
    camera.rotation.y += e.movementX / 1000; // look left/right

    if (camera.rotation.x > Math.PI) camera.rotation.x -= Math.PI * 2;
    if (camera.rotation.x < -Math.PI) camera.rotation.x += Math.PI * 2;
    if (camera.rotation.y > Math.PI) camera.rotation.y -= Math.PI * 2;
    if (camera.rotation.y < -Math.PI) camera.rotation.y += Math.PI * 2;
  }
//#endregion
//#region Utility Functions
function dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}
function crossProduct(v1, v2) {
    const cp = { x: v1.y * v2.z - v1.z * v2.y, y: v1.z * v2.x - v1.x * v2.z, z: v1.x * v2.y - v1.y * v2.x };
    const nv = normaliseVector(cp);
    return nv;
}
function normaliseVector(v) {
    const l = Math.sqrt(v.x **2 + v.y ** 2 + v.z ** 2);
    return { x: v.x / l, y: v.y / l, z: v.z / l };
}
function multiplyVector(v, f) {
    return { x: v.x * f, y: v.y * f, z: v.z * f };
}
function addVector(v1, v2) {
    return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z };
}
function subtractVector(v1, v2) { // vector is v1 -> v2
    return { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
}
function centroid(verts) {
    let x = 0, y = 0, z = 0;
    for(const a of verts) { x += a.x; y += a.y; z += a.z; }
    x /= verts.length;
    y /= verts.length;
    z /= verts.length;
    return { x, y, z };
}
function drawSkew(image, p1, p2, p3, p4) {
    if(p1 && p2 && p3 && p4) {
        const w = image.naturalWidth;
        const h = image.naturalHeight;
        const a = -w * h;
        if (a == 0) return;
        const m = {};

        m.m11 = h * (p1.x  - p2.x) / a;
        m.m12 = h * (p1.y - p2.y) / a;
        m.m21 = w * (p2.x - p3.x) / a;
        m.m22 = w * (p2.y - p3.y) / a;
        drawTransform(image, m, p1, p2, p3);

        m.m11 = h * (p4.x - p3.x) / a;
        m.m12 = h * (p4.y - p3.y) / a;
        m.m21 = w * (p1.x - p4.x) / a;
        m.m22 = w * (p1.y - p4.y) / a;
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
function moveTo(p) { if(p) view.moveTo(p.x, p.y); }
function lineTo(p) { if(p) view.lineTo(p.x, p.y); }
//#endregion
class Pt {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
class Face {
    static count = 0;
    static sides = ["Front", "Back", "Top", "Bottom", "Left", "Right"];
    verts = [];
    constructor() {
        this.id = Face.count++;
         for(const a of arguments) this.verts.push(a);
    }
    draw(xyPoints, worldPoints, cameraPoints, color, camera) {
        // calculate normal to face
        const i0 = this.verts[0];
        const i1 = this.verts[1];
        const i2 = this.verts[2];
        const i3 = this.verts[3];

        const wp0 = worldPoints[i0];
        const wp1 = worldPoints[i1];
        const wp2 = worldPoints[i2];
        const wp3 = worldPoints[i3];

        const cp0 = cameraPoints[i0];
        const cp1 = cameraPoints[i1];
        const cp2 = cameraPoints[i2];
        const cp3 = cameraPoints[i3];

        
        const vectorAB = subtractVector(wp1, wp0);
        const vectorAC = subtractVector(wp2, wp0);
        const cVectorAB = subtractVector(cp1, cp0);
        const cVectorAC = subtractVector(cp2, cp0);
        
        const normal = crossProduct(vectorAB, vectorAC);
        //const normalisedNormalVector = normaliseVector(normal);
        const cNormal = crossProduct(cVectorAB, cVectorAC);

        const cameraPosition = camera.position; // new Pt(0, 0, 0);
        const cameraVector = subtractVector(wp0, cameraPosition);
        const normalisedCameraVector = normaliseVector(cameraVector);
        const dpCamera = dotProduct(normalisedCameraVector, normal);
        const visible = dpCamera > 0;

        if (visible) {

            const lightVector = subtractVector(wp0, lightSource.position);
            const normalisedLightVector = normaliseVector(lightVector);
            let dpLight = dotProduct(normalisedLightVector, normal);
            if (dpLight < 0.33) dpLight = 0.33;
            const red = color.r * dpLight * lightSource.red;
            const green = color.g * dpLight * lightSource.green;
            const blue = color.b * dpLight * lightSource.blue;
            const col = `rgb(${red},${green},${blue})`;

            view.fillStyle = col;
            view.beginPath();

            this.moveTo(xyPoints[this.verts[0]]);
            for (let i = 1; i < this.verts.length; ++ i) {
                this.lineTo(xyPoints[this.verts[i]]);
            } 
            this.lineTo(xyPoints[this.verts[0]]);
            view.fill();
  

            //drawSkew(testImage, xyPoints[i0], xyPoints[i1], xyPoints[i2], xyPoints[i3]);

            const center = centroid([cp0, cp1, cp2, cp3]);
            const cpCenter = this.toXyPoint(center);
            const normalEnd = addVector(center, cNormal);
            const cpNormalEnd = this.toXyPoint(normalEnd);
            view.strokeStyle = "yellow";
            view.beginPath();
            this.moveTo(cpCenter);
            this.lineTo(cpNormalEnd);
            view.stroke();
    

        }
    }
    moveTo(p) { if(p) view.moveTo(p.x, p.y); }
    lineTo(p) { if(p) view.lineTo(p.x, p.y); }
    get side() { return Face.sides[this.id]; }
    toXyPoint(p) {
        const xyp = 
          p.z > 0 ? 
          {x: p.x / p.z * canvas.width, 
          y: p.y / p.z * canvas.width } : null;
        return xyp;
    }
}
class Cube {
    color = { r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255 };
    //color = { r: 255, g: 255, b: 255 };
    verts = [
        new Pt(-1, 1, -1),  // 0 top-left front
        new Pt(1, 1, -1),   // 1 top-right front
        new Pt(1, -1, -1),  // 2 bottom-right front
        new Pt(-1, -1, -1), // 3 bottom-left front
        new Pt(-1, 1, 1),   // 4 top-left back
        new Pt(1, 1, 1),    // 5 top-right back
        new Pt(1, -1, 1),   // 6 bottom-right back
        new Pt(-1, -1, 1)   // 7 bottom-left back
    ]
    faces = [ new Face(0,1,2,3), // front
              //new Face(4,5,6,7), // back
              new Face(5,4,7,6), // back
              //new Face(0,1,5,4), // top
              new Face(4,5,1,0), // top
              //new Face(2,3,7,6), // bottom
              new Face(3,2,6,7), // bottom
              //new Face(0,3,7,4), // left
              new Face(4,0,3,7), // left
              //new Face(1,2,6,5)  // right
              new Face(1,5,6,2)  // right
            ]
    constructor(x, y, z, s = 1) {
        this.scale = s;
        x = Math.random() * 50 - 25;
        y = Math.random() * 50 - 25;
        z = Math.random() * 190 + 10
        this.position = { x, y, z };
        this.rotation = { x: 0, y: 0, z: 0 };
        const maxRotate = 0.03;
        const maxOffset = maxRotate / 2;
        this.auto = { x: Math.random() * maxRotate - maxOffset, y: Math.random() * maxRotate - maxOffset, z: Math.random() * maxRotate - maxOffset };
    }
    draw(camera) {
        if (this.auto.x) this.rotation.x += this.auto.x;
        if (this.auto.y) this.rotation.y += this.auto.y;
        if (this.auto.z) this.rotation.z += this.auto.z;
        const worldPoints = [];
        const cameraPoints = [];
        const xyPoints = [];
        for (let i = 0; i < this.verts.length; ++i) {
            const lp = this.toLocalPoint(this.verts[i]);
            const wp = this.toWorldPoint(lp);
            worldPoints.push(wp);
            const cp = this.toCameraPoint(wp, camera);
            cameraPoints.push(cp);
            const xyp = this.toXyPoint(cp);
            xyPoints.push(xyp);
        }

        // view.beginPath();
        // this.moveTo(points[0]);
        // this.lineTo(points[1]);
        // this.lineTo(points[2]);
        // this.lineTo(points[3]);
        // this.lineTo(points[0]);

        // this.moveTo(points[4]);
        // this.lineTo(points[5]);
        // this.lineTo(points[6]);
        // this.lineTo(points[7]);
        // this.lineTo(points[4]);

        // this.moveTo(points[0]);
        // this.lineTo(points[4]);
        // this.moveTo(points[1]);
        // this.lineTo(points[5]);
        // this.moveTo(points[2]);
        // this.lineTo(points[6]);
        // this.moveTo(points[3]);
        // this.lineTo(points[7]);
        // view.stroke();

        //view.beginPath();
        for(const f of this.faces) f.draw(xyPoints, worldPoints, cameraPoints, this.color, camera);
        //view.stroke(); 
    }
    toLocalPoint(p) {
        const r1 = this.rotate(p, this.rotation, "x");
        const r2 = this.rotate(r1, this.rotation, "y");
        const r3 = this.rotate(r2, this.rotation, "z");
        return r3;
     }
     toWorldPoint(p) {
        const wp = { x: this.position.x + p.x * this.scale, 
                     y: this.position.y + p.y * this.scale, 
                     z: this.position.z + p.z * this.scale };

        return wp;
    }
    toCameraPoint(p, camera) {
        const cp = subtractVector(camera.position, p);
        const ry = this.rotate(cp, camera.rotation, "y");
        const rx = this.rotate(ry, camera.rotation, "x");
        return rx;
    }
    toXyPoint(p) {
        const xyp = 
          p.z > 0 ? 
          {x: p.x / p.z * canvas.width, 
          y: p.y / p.z * canvas.width } : null;
        return xyp;
    }
    rotate(p, rotation, axis) {
        const angle = rotation[axis];
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        switch(axis) {
            case "x": return { x: p.x, y: p.y * cos - p.z * sin, z: p.y * sin + p.z * cos };
            case "y": return { x: p.x * cos - p.z * sin, y: p.y, z: p.x * sin + p.z * cos };
            case "z": return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos, z: p.z };
        }
    }
    moveTo(p) { view.moveTo(p.x, p.y); }
    lineTo(p) { view.lineTo(p.x, p.y); }
    distance(camera) {
        const dx = (this.position.x - camera.position.x) ** 2;
        const dy = (this.position.y - camera.position.y) ** 2;
        const dz = (this.position.z - camera.position.z) ** 2;
        return Math.sqrt(dx + dy + dz);
    }
}
class LightSource {
    position = { x: 0, y: 0, z: 20 };
    radius = 1;
    color = [255, 255, 255];
    constructor() {
        this.el = document.createElement("p");
        this.el.style.color = "#00ff00";
        this.el.style.display = "none";
        document.body.appendChild(this.el);
        console.log(this.color);
    }
    setColor(value) {
        this.el.style.color = value;
        const col = window.getComputedStyle(this.el).color;
        this.color = col.substring(4, col.length - 1).split(', ').map(Number);
    }
    get red() { return this.color[0] / 255; }
    get green() { return this.color[1] / 255; }
    get blue() { return this.color[2] / 255; }
    draw(camera) {
        const center = this.toXyPoint(this.toCameraPoint(this.position, camera));
        const circ  = this.toXyPoint(this.toCameraPoint({x: this.position.x + this.radius, y: this.position.y, z: this.position.z }, camera));
        if (center && circ) {
            const radius = circ.x - center.x;
            if (radius > 0) {
                const oldStyle = view.fillStyle;
                
                const grad = view.createRadialGradient(center.x, center.y, radius / 2, center.x, center.y, radius);
                grad.addColorStop(0, `rgba(${this.color[0]},${this.color[1]},${this.color[2]}, 0.9)`);
                grad.addColorStop(1, "rgba(0,0,0,0)");
                view.fillStyle = grad;
                view.fillRect(center.x - radius, center.y - radius, radius * 2, radius * 2);
                
                view.fillStyle = oldStyle;
            }
        }
    }
    rotate(p, rotation, axis) {
        const angle = rotation[axis];
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        switch(axis) {
            case "x": return { x: p.x, y: p.y * cos - p.z * sin, z: p.y * sin + p.z * cos };
            case "y": return { x: p.x * cos - p.z * sin, y: p.y, z: p.x * sin + p.z * cos };
            case "z": return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos, z: p.z };
        }
    }
    toCameraPoint(p, camera) {
        const cp = subtractVector(camera.position, p);
        const ry = this.rotate(cp, camera.rotation, "y");
        const rx = this.rotate(ry, camera.rotation, "x");
        return rx;
    }
    toXyPoint(p) {
        const xyp = 
          p.z > 1 ? 
          {x: p.x / p.z * canvas.width, 
          y: p.y / p.z * canvas.width } : null;
        return xyp;
    }
    distance(camera) {
        const dx = (this.position.x - camera.position.x) ** 2;
        const dy = (this.position.y - camera.position.y) ** 2;
        const dz = (this.position.z - camera.position.z) ** 2;
        return Math.sqrt(dx + dy + dz);
    }
}
class Camera {
    model = { x: 0, y: 0, z: 1 };
    rotation = { x: 0, y: 0 };
    position = { x: 0, y: 0, z: 0};
    zoom = 1;
    get direction() {
        const ry = this.rotate(this.model, this.rotation, "y");
        const rx = this.rotate(ry, this.rotation, "x");
        return rx;
    }
    moveForward(dist) {
        const moveVector = multiplyVector(this.direction, dist);
        const newPosition = addVector(this.position, moveVector);
        Object.assign(this.position, newPosition);
    }
    moveLeft(dist) {
        const forwardVector = this.direction;
        const leftVector = { x: -forwardVector.z, y: forwardVector.y, z: forwardVector.x };
        const moveVector = multiplyVector(leftVector, dist);
        Object.assign(this.position, addVector(this.position, moveVector));
    }
    moveRight(dist) {
        const forwardVector = this.direction;
        const rightVector = { x: forwardVector.z, y: forwardVector.y, z: -forwardVector.x };
        const moveVector = multiplyVector(rightVector, dist);
        Object.assign(this.position, addVector(this.position, moveVector));
    }
    moveBack(dist) {
        const backVector = multiplyVector(this.direction, -dist);
        const newPosition = addVector(this.position, backVector);
        Object.assign(this.position, newPosition);
    }
    moveUp(dist) {
        const forwardVector = this.direction;
        const upVector = { x: forwardVector.x, y: forwardVector.z, z: -forwardVector.y };
        const moveVector = multiplyVector(upVector, dist);
        Object.assign(this.position, addVector(this.position, moveVector));
    }
    moveDown(dist) {
        const forwardVector = this.direction;
        const downVector = { x: forwardVector.x, y: -forwardVector.z, z: forwardVector.y };
        const moveVector = multiplyVector(downVector, dist);
        Object.assign(this.position, addVector(this.position, moveVector));
    }
    reset() {
        this.position.x = 0;
        this.position.y = 0;
        this.position.z = 0;
        this.rotation.x = 0;
        this.rotation.y = 0;
    }
    rotate(p, rotation, axis) {
        const angle = -rotation[axis];
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        switch(axis) {
            case "x": return { x: p.x, y: p.y * cos - p.z * sin, z: p.y * sin + p.z * cos };
            case "y": return { x: p.x * cos - p.z * sin, y: p.y, z: p.x * sin + p.z * cos };
            case "z": return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos, z: p.z };
        }
    }
}

const lightSource = new LightSource();
const camera = new Camera();
const cube = new Cube(0, 0, 20, 4);

//#region DatGui
const gui = new dat.GUI();
const pos = gui.addFolder("Position");
pos.add(cube.position, "x", -20, 20);
pos.add(cube.position, "y", -20, 20);
pos.add(cube.position, "z", 10, 200);
const rot = gui.addFolder("Rotation");
rot.add(cube.rotation, "x", -Math.PI, Math.PI);
rot.add(cube.rotation, "y", -Math.PI, Math.PI);
rot.add(cube.rotation, "z", -Math.PI, Math.PI);
const light = gui.addFolder("Light Source");
light.add(lightSource.position, "x", -200, 200);
light.add(lightSource.position, "y", -200, 200);
light.add(lightSource.position, "z", -100, 250);
light.addColor(lightSource, "color").name("Colour");
const cam = gui.addFolder("Camera");
const camRotation = cam.addFolder("Rotation");
const camPosition = cam.addFolder("Position");
camRotation.add(camera.rotation, "x", -1.5, 1.5).listen();
camRotation.add(camera.rotation, "y", -1.5, 1.5).listen();
camPosition.add(camera.position, "x", -100, 100).listen();
camPosition.add(camera.position, "y", -100, 100).listen();
camPosition.add(camera.position, "z", -100, 100).listen();
//#endregion
class Scene {
    animate = true;
    objects = [];
    add(o) { this.objects.push(o); }
    draw(camera) { if (this.animate) for(const o of this.objects) o.draw(camera); }
    sort() { this.objects.sort((a, b) => b.position.z - a.position.z )}
}
const scene = new Scene();
gui.add(scene, "animate");
scene.add(cube);
scene.add(lightSource);
for(let i = 0; i < 100; ++i) scene.add(new Cube());

function animate() {
    scene.sort((a, b) => { b.distance(camera) - a.distance(camera()); } );
    if (scene.animate) view.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    //#region Game Input
    if (GameInput.isForward) camera.moveForward(0.3);
    if (GameInput.isBack) camera.moveBack(0.3);
    if (GameInput.isRight) camera.moveRight(0.1);
    if (GameInput.isLeft) camera.moveLeft(0.1);
    if (GameInput.isUp) camera.moveUp(0.1);
    if (GameInput.isDown) camera.moveDown(0.1);
    if (GameInput.isReset) camera.reset();
    //#endregion
    scene.draw(camera);

    view.beginPath();
    view.arc(0, 0, 10, 0, Math.PI * 2);
    view.stroke();

    requestAnimationFrame(animate);
}

animate();

//#region Test Area
function test() {
    const p = { x: 0, y: 0, z: 1 };
    const angle = -Math.PI /2; // 90 deg
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x: p.x * cos - p.z * sin, y: p.y, z: p.x * sin + p.z * cos };
}
//console.log(test());
//#endregion
