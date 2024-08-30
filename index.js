console.log("working. . . ");

const canvas = document.querySelector("canvas");
const view = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    view.translate(canvas.width / 2, canvas.height / 2);
    view.scale(1, -1);

    view.lineWidth = 5;
    view.lineJoin = "round";
    view.strokeStyle = "black";
    
}

resize();
addEventListener("resize", resize);

//#region Pointer Lock
canvas.addEventListener("click", togglePointerLock);
document.addEventListener("pointerlockchange", onLockChange);
async function togglePointerLock() {
    if (!document.pointerLockElement) {
        await canvas.requestPointerLock({
        unadjustedMovement: true,
    });
    } else {
        await document.exitPointerLock();
    }
}
function onLockChange() {
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
document.addEventListener("wheel", async e => {
    if(e.deltaY) camera.position.y += -e.deltaY / 20; // camera.moveUp(-e.deltaY / 20);
    //if(e.deltaX) camera.moveRight(e.deltaX / 100);
});
//#endregion


addEventListener("keydown", keyDown);
function keyDown(e) {
    //console.log(e);
    Keyboard.keys[e.code] = true;
}
addEventListener("keyup", keyUp);
function keyUp(e) {
    Keyboard.keys[e.code] = false;
}
class Keyboard {
    static keys = [];
    static isPressed(code) {
        if (Keyboard.keys[code] === undefined) return false;
        else return Keyboard.keys[code];
    }
}
// view.beginPath();
// view.moveTo(0, 0);
// view.lineTo(100, 100);
// view.stroke();
function dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}
function crossProduct(v1, v2) {
    const cp = { x: v1.y * v2.z - v1.z * v2.y, y: v1.z * v2.x - v1.x * v2.z, z: v1.x * v2.y - v1.y * v2.x };
    const nv = normalizeVector(cp);
    return nv;
}
function normalizeVector(v) {
    const length = Math.sqrt(v.x **2 + v.y ** 2 + v.z **2);
    return { x: v.x / length, y: v.y / length, z: v.z /length };
}
function subtractVector(v1, v2) { // return v1 -> v2
    return { x: v2.x-v1.x, y: v2.y-v1.y, z: v2.z-v1.z };
}

class Pt {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
class Face {
    i = [];
    constructor() { for (const i of arguments) { this.i.push(i); } }
    draw(wPoints, xYpoints, color) {
        const faceWorldPoints = [];
        for (const i of this.i) faceWorldPoints.push(wPoints[i]);
        const faceXyPoints = [];
        for (const i of this.i) faceXyPoints.push(xYpoints[i]);

        // calculate 2 face vectors
        const vectorAB = subtractVector(faceWorldPoints[1], faceWorldPoints[0]);
        const vectorAC = subtractVector(faceWorldPoints[2], faceWorldPoints[0]);

        const normalVector = crossProduct(vectorAB, vectorAC);
        const cameraVector = subtractVector(camera.position, faceWorldPoints[0]);
        const normalizedCameraVector = normalizeVector(cameraVector);
        const dp = dotProduct(normalVector, normalizedCameraVector);
        const visible = dp < 0;
        
        if(visible) {
            //let r = color[0], g = color[1], b = color[2];
            const lightVector = subtractVector(wPoints[0], light.position);
            const lightUnitVector = normalizeVector(lightVector);
            let dpLight = dotProduct(normalVector, lightUnitVector);

            const ambientLightLevel = 0.35;
            if (dpLight < ambientLightLevel) dpLight = ambientLightLevel;
            let r = color[0] * dpLight * (light.color[0] / 255);
            if (r > 255) r = 255;
            let g = color[1] * dpLight * (light.color[1] / 255);
            if (g > 255) g = 255;
            let b = color[2] * dpLight * (light.color[2] / 255);
            if (b > 255) b = 255;

            view.fillStyle = `rgb(${r},${g},${b})`;
            view.lineWidth = 5;
            view.beginPath();
            this.moveTo(faceXyPoints[0]);
            this.lineTo(faceXyPoints[1]);
            this.lineTo(faceXyPoints[2]);
            this.lineTo(faceXyPoints[3]);
            this.lineTo(faceXyPoints[0]);
            view.fill();
            //view.stroke();
        }
    }
    moveTo(p) { view.moveTo(p.x, p.y); }
    lineTo(p) { view.lineTo(p.x, p.y); }
}
class GameObject {
    toLocalPoint(p) {
        const r1 = this.rotate(p, this.rotation, "x");
        const r2 = this.rotate(r1, this.rotation, "y");
        const r3 = this.rotate(r2, this.rotation, "z");
        return r3;
    }
    toWorldPoint(p, camera) {
        const wp = { 
            x: this.position.x - camera.position.x + p.x * this.scale, 
            y: this.position.y - camera.position.y + p.y * this.scale, 
            z: this.position.z - camera.position.z + p.z * this.scale, 
        };
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
          p.z != 0 ? 
          {
            x: p.x / p.z * canvas.width, 
            y: p.y / p.z * canvas.width 
        } : null;
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
}
class Cube extends GameObject {
    color = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
    model = [
        new Pt(-1, 1, -1), 
        new Pt(1, 1, -1), 
        new Pt(1, -1, -1), 
        new Pt(-1, -1, -1),
        new Pt(-1, 1, 1), 
        new Pt(1, 1, 1), 
        new Pt(1, -1, 1), 
        new Pt(-1, -1, 1)
    ]
    faces = [
        new Face(0,1,2,3), // front
        new Face(5,4,7,6), // back
        new Face(4,5,1,0), // top
        new Face(3,2,6,7), // bottom
        new Face(4,0,3,7), // left
        new Face(1,5,6,2), // right
    ]
    constructor(x, y, z, s = 1) {
        super();
        this.scale = s;
        this.position = { x, y, z };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.rdx = Math.random () * 0.06 - 0.03;
        this.rdy = Math.random () * 0.06 - 0.03;
    }
    draw(camera) {
        this.rotation.x += this.rdx;
        this.rotation.y += this.rdy;
    
        const points = [], wPoints = [], xYpoints = [];
        for (let i = 0; i < this.model.length; ++i) {
            const lp = this.toLocalPoint(this.model[i])
            const wp = this.toWorldPoint(lp, camera);
            wPoints.push(wp);
            const cp = this.toCameraPoint(wp, camera);
            const xy = this.toXyPoint(cp);
            xYpoints.push(xy);
        }

        for (const f of this.faces) f.draw(wPoints, xYpoints, this.color);

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
    }
}
class PointLight extends GameObject {
    color = [255, 255, 255];
    raduis = 400;
    scale = 1;
    constructor(x, y, z) {
        super();
        this.position = { x, y, z };
    }
    draw(camera) {
        const wp = this.toWorldPoint(this.position, camera);
        const cp = this.toCameraPoint(wp, camera);
        const xy = this.toXyPoint(cp);
        if (xy) {
            const dist = Math.sqrt(this.position.x ** 2 + this.position.y **2 + this.position.z ** 2);
            const radius = this.raduis / dist;
            view.fillStyle = `rgb(${this.color[0]},${this.color[1]},${this.color[2]})`;
            view.beginPath();
            view.arc(xy.x, xy.y, radius, 0, Math.PI * 2);
            view.fill();
        }
    }
}
class Scene {
    objects = [];
    add(o) { this.objects.push(o); }
    draw(camera) { 
        view.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
        for (const o of this.objects) o.draw(camera); 
    }
}
class Camera {
    constructor(x, y, z) {
        this.position = { x, y, z };
        this.rotation = { x: 0, y: 0 };
    }
}
const cube = new Cube(0, 0, 20, 2);
const cube2 = new Cube(5, 5, 20, 2);
const light = new PointLight(5, 5, 1);
const camera = new Camera(0, 0, 0);

const scene = new Scene();
scene.add(light);
scene.add(cube);
//scene.add(cube2);

for (let i = 0; i < 100; ++i) {
    const x = Math.random() * 40;
    const y = Math.random() * 40;
    const z = Math.random();
    const c = new Cube(x - 20, y - 20, z * 50 + 10);
    scene.add(c);
}

//#region DatGui
const gui = new dat.GUI();
gui.add(cube, "scale", 0.5, 10);
gui.addColor(cube, "color");
const cubePosition = gui.addFolder("Position");
cubePosition.add(cube.position, "x", -20, 20);
cubePosition.add(cube.position, "y", -20, 20);
cubePosition.add(cube.position, "z", 10, 200);
const cubeRotation = gui.addFolder("Rotation");
cubeRotation.add(cube.rotation, "x", -20, 20);
cubeRotation.add(cube.rotation, "y", -20, 20);
cubeRotation.add(cube.rotation, "z", 10, 200);
const lightFolder = gui.addFolder("Light");
lightFolder.addColor(light, "color");
lightFolder.add(light.position, "x", -10, 10);
lightFolder.add(light.position, "y", -10, 10);
lightFolder.add(light.position, "z", 1, 50);
const cameraFolder = gui.addFolder("Camera");
const cameraPosition = cameraFolder.addFolder("Position");
cameraPosition.add(camera.position, "x", -20, 20);
cameraPosition.add(camera.position, "y", -20, 20);
cameraPosition.add(camera.position, "z", -100, 100);
const cameraRotation = cameraFolder.addFolder("Rotation");
cameraRotation.add(camera.rotation, "x", -Math.PI, Math.PI);
cameraRotation.add(camera.rotation, "y", -Math.PI, Math.PI);
//#endregion
function animate() {
    if (Keyboard.isPressed("KeyA")) camera.position.x -= 0.2;
    if (Keyboard.isPressed("KeyD")) camera.position.x += 0.2;
    if (Keyboard.isPressed("KeyW")) camera.position.z += 0.2;
    if (Keyboard.isPressed("KeyS")) camera.position.z -= 0.2;
    if (Keyboard.isPressed("ArrowUp")) camera.position.y += 0.2;
    if (Keyboard.isPressed("ArrowDown")) camera.position.y -= 0.2;
    scene.draw(camera);
    requestAnimationFrame(animate);
}

animate();