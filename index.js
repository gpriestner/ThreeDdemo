console.log("working. . . ");
const canvas = document.querySelector("canvas");
const view = canvas.getContext("2d");
view.font = "28px Arial";
const testImage = new Image();
testImage.src = 'res/profile.png';
let xpos = 0;
let ypos = 0;
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
        canvas.addEventListener("mousedown", e => { 
            if (e.button == 0) Mouse.LeftDown = true;
            if (e.button == 1) togglePointerLock();
            if (e.button == 2) Mouse.RightDown = true;
            });
        canvas.addEventListener("mouseup", e => { 
            if(e.button == 0) Mouse.LeftDown = false; 
            if(e.button == 1) Mouse.MiddleDown = false; 
            if(e.button == 2) Mouse.RightDown = false; 
        });
    })();
}
class GameInput {
    static get isForward() {
        return Keyboard.isDown("KeyW") || Mouse.LeftDown;
    }
    static get isLeft() {
        return Keyboard.isDown("KeyA");
    }
    static get isRight() {
        return Keyboard.isDown("KeyD");
    }
    static get isTurnLeft() {
        return Keyboard.isDown("ArrowLeft");
        }
    static get isTurnRight() {
    return Keyboard.isDown("ArrowRight");
    }
    static get isBack() {
    return Keyboard.isDown("KeyS") || Mouse.RightDown;
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

    view.lineWidth = 1;
    view.strokeStyle = "black";
    view.lineWidth = 4;
    view.lineJoin = "bevel";
    view.shadowOffsetX = 1;
    view.shadowOffsetY = 1;
}
resize();
addEventListener("resize", resize);
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
    const dx = -e.movementX * 1.30;
    const dy = -e.movementY * 1.30;
    xpos += dx;
    ypos += dy;
    canvas.style.backgroundPositionX = `${xpos}px`;


    camera.rotation.x -= e.movementY / 1000; // look up/down
    if (camera.rotation.x < -Math.PI / 2) camera.rotation.x = -Math.PI / 2;
    else if (camera.rotation.x > Math.PI / 2) camera.rotation.x = Math.PI / 2;
    else canvas.style.backgroundPositionY = `${ypos}px`;
    camera.rotation.y += e.movementX / 1000; // look left/right

    // spotlight1.direction.x += e.movementX / 1000;
    // spotlight1.direction.y -= e.movementY / 1000;

    if (camera.rotation.x > Math.PI) camera.rotation.x -= Math.PI * 2;
    if (camera.rotation.x < -Math.PI) camera.rotation.x += Math.PI * 2;
    if (camera.rotation.y > Math.PI) camera.rotation.y -= Math.PI * 2;
    if (camera.rotation.y < -Math.PI) camera.rotation.y += Math.PI * 2;
}
document.addEventListener("wheel", async e => {
    if(e.deltaY) camera.moveUp(-e.deltaY / 20);
    if(e.deltaX) camera.moveRight(e.deltaX / 100);
});
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
function reverseVector(v) {
    return multiplyVector(v, -1);
}
function addVector(v1, v2) {
    return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z };
}
function subtractVector(v1, v2) { // vector is v1 -> v2
    return { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
}
function subtractVector2d(v1, v2) { // v1 -> v2
    return { x: v2.x - v1.x, y: v2.y - v1.y };
}
function centroid(verts) {
    let x = 0, y = 0, z = 0;
    for(const a of verts) { x += a.x; y += a.y; z += a.z; }
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
function moveTo(p, o = 0) { if(p) view.moveTo(p.x + o, p.y + o); }
function lineTo(p, o = 0) { if(p) view.lineTo(p.x + o, p.y + o); }
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
    for(p of face) addColorPoint(p, center, face);
    view.globalCompositeOperation = "source-over";
}
function fillRect(face) {
    view.beginPath();
    moveTo(face[face.length - 1].xy);
    for(const p of face) lineTo(p.xy);    
    moveTo(face[face.length - 1].xy, 1);
    for(const p of face) lineTo(p.xy, 1);    
    view.fill();
}
function dist2d(p1, p2, factor = 1.5) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2) * factor;
}
function dist3d(p1, p2) {
    return Math.sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2 + (p1.z-p2.z)**2);
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
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    const normalizedAxis = { x: vector.x / length, y: vector.y / length, z: vector.z / length };

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
const rndColor = () => [Math.random() * 255, Math.random() * 255, Math.random() * 255];
function colorToArray(color) {
    const oldStyle = view.fillStyle;
    view.fillStyle = color;
    const c = view.fillStyle;
    view.fillStyle = oldStyle;
    return [parseInt("0x"+c[1]+c[2]), parseInt("0x"+c[3]+c[4]), parseInt("0x"+c[5]+c[6])];
}
function arrayToColor(a) {
    return `rgb(${a[0]},${a[1]},${a[2]})`;
}
function arrayToColorA(a) {
    return `rgba(${a[0]},${a[1]},${a[2]},${a[3]})`;
}
//#endregion
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
    constructor(x = 0, y = 0, z = 0, s = 1, sx = 1, sy = 1, sz = 1) {
        this.position = { x, y, z };
        this.scale = s;
        if(this.model) for (const p of this.model) { p.x *= sx; p.y *= sy; p.z *= sz; p.parent = this; }
    }
    draw(camera) {
        if (this.auto?.x) this.rotation.x += this.auto.x;
        if (this.auto?.y) this.rotation.y += this.auto.y;
        if (this.auto?.z) this.rotation.z += this.auto.z;
        const points = [];
        for(const p of this.model) {
            const lp = this.toLocalPoint(p);
            const wp = this.toWorldPoint(lp); // lp
            const cp = this.toCameraPoint(wp, camera);
            const xy = this.toXyPoint(cp);
            points.push({ wp, cp, xy, id: p.id });
        }
        for(const f of this.faces) f.draw(this.position, points, this.color, camera);
    }
    toLocalPoint(p) {
        let r = p;
        for (const a of 'yxz') if (this.rotation[a]) r = this.rotate(r, this.rotation, a); 
        return r;
    }
    toWorldPoint(p) {
        const wp = { x: this.position.x + p.x * this.scale, 
                     y: this.position.y + p.y * this.scale, 
                     z: this.position.z + p.z * this.scale };
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
        return rx;
    }
    toXyPoint(p) {
        if (p == null || p.z == 0) return null;
        const xy = { x: p.x / p.z * canvas.width, y: p.y / p.z * canvas.width };
        return xy;
    }
    rotate(p, rotation, axis = "y") {
        const angle = rotation[axis];
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        switch(axis) {
            case "x": return { x: p.x, y: p.y * cos - p.z * sin, z: p.y * sin + p.z * cos };
            case "y": return { x: p.x * cos - p.z * sin, y: p.y, z: p.x * sin + p.z * cos };
            case "z": return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos, z: p.z };
        }
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
        for(let i = 0; i < this.model.length; ++i) this.model[i] = addVector(this.model[i], this.parentOffset);
    }
    moveTo(p, o = 0) { if(p) view.moveTo(p.x + o, p.y + o); }
    lineTo(p, o = 0) { if(p) view.lineTo(p.x + o, p.y + o); }
    dot(p) { if(p) view.fillRect(p.x-2, p.y-2, 4, 4); }
}
class MultiFace extends GameObject {
    model = [ new Pt(-1, 1, 0), new Pt(1, 1, 0), new Pt(1, -1, 0), new Pt(-1, 1, 0)];
    constructor(x, y, z) {
        super();
        this.position = {x, y, z};
        this.normal = {x: 0, y: 0, z: -1};
    }
    draw(camera) {
        for(const x = 0; x < 10; ++x) {

        }
    }
}
class Plane extends GameObject {
    constructor(size, divs, y, colorA, colorB) {
        super();
        const step = size / divs;
        const start = -size / 2;
        this.model = [];
        for (let x = 0; x <= divs; ++x) {
            for (let z = 0; z <= divs; ++z) {
                this.model.push({x: x * step + start, y/*: y + Math.random() * 5*/, z: z * step + start});
            }
        }
        this.faces = [];
        for (let x = 0; x < divs; ++x) {
            for (let z = 0; z < divs; ++z) {

                const i1 = z * (divs + 1) + x;
                const i2 = i1 + 1;
                const i3 = i1 + divs + 2;
                const i4 = i3 - 1; //  i1 + divs + 1;

                const face = new Face([i1, i2,  i3, i4]);
                face.color = x%2^z%2 ? colorA : colorB;
                this.faces.push(face);
            }
        }
    }
    draw(camera) {
        const points = [];
        for(const point of this.model) {
            const wp = point;
            const cp = this.toCameraPoint(wp, camera);
            const xy = this.toXyPoint(cp);
            points.push({ wp, cp, xy });
        }
        for(const f of this.faces) f.fill(points, f.color, camera);
        //for(const f of this.faces) f.draw(null, points, [128,128,128], camera);
    }
}
class Face extends GameObject {
    static count = 0;
    static sides = ["Front", "Back", "Top", "Bottom", "Left", "Right"];
    verts = [];
    constructor(indexes, doubleSided = false) {
        super();
        this.doubleSided = doubleSided;
        this.id = Face.count++;
        for(const a of indexes) this.verts.push(a);
    }
    getFacePoints(points) {
        const localPoints = [];
        for (const i of this.verts) localPoints.push(points[i]);
        return localPoints;
    }
    center(points) {
        let x = 0, y = 0, z = 0;
        for(const p of points) if (p) { x += p.wp.x; y += p.wp.y; z += p.wp.z }
        const c = { x: x / points.length, y: y / points.length, z: z / points.length };
        return c;
    }
    draw(parentPosition, points, color, camera) {
        const fp = this.getFacePoints(points);

        // calculate 2 face vectors to describe the plane of the face
        const faceEdge1 = subtractVector(fp[1].wp, fp[0].wp);
        const faceEdge2 = subtractVector(fp[2].wp, fp[0].wp);

        // calculate if face is visible
        let faceNormal = crossProduct(faceEdge1, faceEdge2);
        //const cent = this.center(fp);
        const cameraVector = normaliseVector(subtractVector(fp[0].wp, camera.position));
        let visible = dotProduct(cameraVector, faceNormal) > 0;

        if(!visible && this.doubleSided) {
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
            view.fillStyle = strColor;
            view.shadowColor = view.fillStyle;
            view.strokeStyle = strColor;
            this.drawFace(fp);
            view.shadowColor = 'rgba(0,0,0,0)';
            for (const p of fp) if (p.id && p.xy) this.text(p.id, p.xy);

            //drawSkew(testImage, xy[0], xy[1], xy[2], xy[3]);

            // const cp = this.getFacePoints(cameraPoints);
            // const camVectorAB = subtractVector(cp[1], cp[0]);
            // const camVectorAC = subtractVector(cp[2], cp[0]);
            // const camNormal = crossProduct(camVectorAB, camVectorAC);
            // this.showNormals(cp, camNormal);
        }
    }
    fill(points, color, camera) {
        const fp = this.getFacePoints(points);
        for(const p of fp) if (!p.xy) return;
        let col = this.toRGB(color);
        view.fillStyle = col;
        //view.shadowColor = view.fillStyle;
        view.strokeStyle = col;
        this.drawFace(fp);
        //this.text(this.id, fp[1].xy);
    }
    text(t, p) {
        view.fillStyle = "red";
        view.font = "18px Arial";
        if(p) view.fillText(t, p.x, p.y);
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
        let red = 0, green = 0, blue = 0;
        for (const lightSource of lightSources) {
            const lightVector = subtractVector(point.wp, lightSource.position);
            const normalisedLightVector = normaliseVector(lightVector);
            let dpLight = dotProduct(normalisedLightVector, point.normal);
            const ambientLightLevel = 0.33;
            if (dpLight < ambientLightLevel) dpLight = ambientLightLevel;
            red += color.r * dpLight;// * lightSource.red;
            green += color.g * dpLight;// * lightSource.green;
            blue += color.b * dpLight;// * lightSource.blue;
        }
        point.color = [red, green, blue];
    }
    equalToOne(value, variance) {
        const diff = 1 - value;
        return diff < variance;
    }
    drawFace(points) {
        view.beginPath();
        this.drawLines(points);
        //view.stroke();
        if (gameSettings.doubleDraw) this.drawLines(points, 1);
        view.fill();

        if (gameSettings.selectFace && view.isPointInPath(canvas.width / 2, canvas.height / 2)) {
            const oldStroke = view.strokeStyle;
            view.strokeStyle = "red";
            view.stroke();
            view.strokeStyle = oldStroke;
        }
    }
    drawLines(points, o = 0) {
        this.moveTo(points[points.length - 1].xy, o);
        for(const p of points) this.lineTo(p.xy, o);
    }
    showNormals(cp, camNormal) {
        const center = centroid(cp);
        const cpCenter = this.toXyPoint(center);
        const normalEnd = addVector(center, camNormal);
        const cpNormalEnd = this.toXyPoint(normalEnd);
        view.strokeStyle = "yellow";
        view.beginPath();
        this.moveTo(cpCenter);
        this.lineTo(cpNormalEnd);
        view.stroke();
    }
    get side() { return Face.sides[this.id]; }
}
class Sphere extends GameObject {
    color = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
    model = [ new Pt(0, 1, 0) ];
    constructor(x, y, z, h = 16, v = h * 2, sx = 1, sy = 1, sz = 1) {
        super();
        this.position = { x, y, z };
        this.rotation = { x: 0, y: 0, z: 0};
        this.scale = 1;
        this.dotSize = 2;
        const np = this.model[0];
        const sp = reverseVector(np);
        const stepH = Math.PI / h;
        const stepV = Math.PI * 2 / v;
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
        for (const p of this.model) { p.x *= sx; p.y *= sy; p.z *= sz; }

        this.faces = [];

        // LAYER 0 (TOP): populate (v) faces around north pole (3 verts each)
        for (let i = 2; i <= v; ++i) {
              this.faces.push(new Face([0, i, i - 1]));
        }
        this.faces.push(new Face([0, 1, v]));

        // Populate middle layers (each face has 4 verts)
        for (let j = 0; j < h-2; ++j) {
            for (let i = v*j+1; i < v*(j+1); ++i) {
                this.faces.push(new Face([i, i+1, i+v+1, i+v]));
            }
            this.faces.push(new Face([v*(j+1), v*j+1, v*(j+1)+1, v*(j+2)]));
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
        for (let i = (h-2)*v+1; i < (h-2)*v+1 + v; ++i) {
            this.faces.push(new Face([i, i+1, (h-1)*v+1]));
        }
        this.faces.push(new Face([(h-1)*v, (h-2)*v+1, (h-1)*v+1])); // south pole point
}
    draw(camera) {
        //view.fillStyle = "white";
        const points = [];
        let c = 0;
        for(const p of this.model) {
            //const lp = this.toLocalPoint(p);
            const wp = this.toWorldPoint(p); // lp
            const cp = this.toCameraPoint(wp, camera);
            const xy = this.toXyPoint(cp);
            points.push({ wp, cp, xy });
            ++c;
        }
        for(const f of this.faces) f.draw(this.position, points, this.color, camera);
    }
    setPixel(p) { if (p) view.fillRect(p.x - this.dotSize / 2, p.y - this.dotSize / 2, this.dotSize, this.dotSize); }
    text(t, p) {
        view.font = "18px Arial";
        view.fillText(t, p.x, p.y);
    }
}
class SimpleSphere extends GameObject {
    radius = 1.5;
    color = [255, 0, 0];
    factor = 1;
    model = [new Pt(-1, 0, 0)];
    draw(camera) {
        const unitVector2 = this.model[0];
        const unitvectorSphereCentreToCamera = normaliseVector(subtractVector(this.position, camera.position));
        const camCenter = this.toCameraPoint(this.position, camera);
        const xySphereCenter = this.toXyPoint(camCenter);
        const unitvectorToEdge = crossProduct(unitvectorSphereCentreToCamera, unitVector2);
        const vectorToEdge = multiplyVector(unitvectorToEdge, this.radius);
        const worldpointEdge = addVector(this.position, vectorToEdge);
        const camEdge = this.toCameraPoint(worldpointEdge, camera);
        const xySphereEdge = this.toXyPoint(camEdge);

        if (xySphereCenter && xySphereEdge) {
            const xyRadius = Math.sqrt((xySphereCenter.x - xySphereEdge.x) ** 2 + (xySphereCenter.y - xySphereEdge.y) ** 2);
            if (xyRadius > 1) {
                view.fillStyle = arrayToColor(this.color);
                view.beginPath();
                view.arc(xySphereCenter.x, xySphereCenter.y, xyRadius, 0, Math.PI * 2);
                view.fill();
                
                view.globalCompositeOperation = "hard-light";
                //const light = scene.lights[0];
                for (const light of scene.lights) {
                    const lightVector = normaliseVector(subtractVector(this.position, light.position));
                    const midVector = normaliseVector(addVector(lightVector, unitvectorSphereCentreToCamera));
                    const distance = dist3d(this.position, light.position);
                    const mv = multiplyVector(midVector, this.radius);
                    const av = addVector(this.position, mv);
                    const cp = this.toCameraPoint(av, camera);
                    const xySpecularCenter = this.toXyPoint(cp);
                    if(xySpecularCenter) {
                        view.save();
                        view.clip();
                        const grad = view.createRadialGradient(xySpecularCenter.x, xySpecularCenter.y, xyRadius / distance, xySpecularCenter.x, xySpecularCenter.y, xyRadius * 2);
                        grad.addColorStop(0, arrayToColor(light.color));
                        //grad.addColorStop(0, `rgba(${light.color[0]},${light.color[1]},${light.color[2]},0.5)`);
                        grad.addColorStop(1, 'rgba(255,255,255,0)');
                        view.fillStyle = grad;
                        view.fillRect(xySpecularCenter.x - xyRadius * 2, xySpecularCenter.y - xyRadius * 2, xyRadius * 4, xyRadius * 4);
                        view.restore();
                    }
                }
                view.globalCompositeOperation = "source-over";
            }
        }
    }
}
class Cylinder extends GameObject {
    color = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
    model = [ new Pt(0, 1, 0), new Pt(0, 1, 1) ];
    constructor(x, y, z, sc = 1, s = 6, sx = 1, sy = 1, sz = 1, northScale = 1, southScale = 1) {
        super();
        this.position = { x, y, z };
        this.rotation = { x: 0, y: 0, z: 0};
        this.scale = sc;
        const np = this.model[0];
        const sp = reverseVector(np);
        const step = Math.PI * 2 / s;

        for (let i = 1; i < s; ++i) { // 11 iterations
            const newPoint = this.rotate(this.model[1], { y: i * step });
            this.model.push(newPoint);
        }

        for (let i = 1; i <= s; ++i) { // 12 iterations
            this.model.push(new Pt(this.model[i].x, -1, this.model[i].z));
        }
        this.model.push(sp);

        //for (let i = 0; i < this.model.length; ++ i) this.model[i].id = i;

        for (const p of this.model) { p.x *= sx; p.y *= sy; p.z *= sz; }
        np.y *= northScale;
        sp.y *= southScale;

        this.faces = [];
        // populate top faces (triangles)
        for (let i = 2; i <= s; ++i) this.faces.push(new Face([0, i, i - 1]));
        this.faces.push(new Face([0, 1, s]));

        // populate bottom faces (triangles)
        const spi = s * 2 + 1; // south pole index
        for (let i = s + 1; i <= s * 2 - 1; ++i) this.faces.push(new Face([spi, i, i + 1]));
        this.faces.push(new Face([spi, spi - 1,  s + 1]));

        // populate side faces (squares)
        for (let i = 1; i < s; ++ i) this.faces.push(new Face([i, i + 1, i + s + 1, i + s]));
        this.faces.push(new Face([s, 1, s + 1, s * 2]));
    }
    draw(camera) {
        const points = [];
        for(const p of this.model) {
            //const lp = this.toLocalPoint(p);
            const wp = this.toWorldPoint(p); // lp
            const cp = this.toCameraPoint(wp, camera);
            const xy = this.toXyPoint(cp);
            points.push({ wp, cp, xy, id: p.id });
        }
        for(const f of this.faces) f.draw(this.position, points, this.color, camera);
    }
    text(t, p) {
        view.fillStyle = "red";
        view.font = "18px Arial";
        if(p) view.fillText(t, p.x, p.y);
    }
}
class Cube extends GameObject {
    color = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
    model = [
        new Pt(-1, 1, -1),  // 0 top-left front
        new Pt(1, 1, -1),   // 1 top-right front
        new Pt(1, -1, -1),  // 2 bottom-right front
        new Pt(-1, -1, -1), // 3 bottom-left front
        new Pt(-1, 1, 1),   // 4 top-left back
        new Pt(1, 1, 1),    // 5 top-right back
        new Pt(1, -1, 1),   // 6 bottom-right back
        new Pt(-1, -1, 1)   // 7 bottom-left back
    ]
    faces = [ new Face([0,1,2,3]), // front
              new Face([5,4,7,6]), // back
              new Face([4,5,1,0]), // top
              new Face([3,2,6,7]), // bottom
              new Face([4,0,3,7]), // left
              new Face([1,5,6,2])  // right
            ]
    constructor(x, y, z, sx = 1, sy = sx, sz = sy) {
        super();
        x ??= Math.random() * 50 - 25;
        y ??= Math.random() * 50 - 25;
        z ??= Math.random() * 190 + 10
        for(const p of this.model) { p.x *= sx; p.y *= sy; p.z *= sz; }
        this.position = { x, y, z };
        this.rotation = { x: 0, y: 0, z: 0 };
        const maxRotate = 0.05;
        const maxOffset = maxRotate / 2;
        //this.auto = { /*x: Math.random() * maxRotate - maxOffset,*/ y: Math.random() * maxRotate - maxOffset/*, z: Math.random() * maxRotate - maxOffset*/ };
        this.auto = { x: 0, y: 0.01, z: 0 };
    }
    // draw(camera) {
    //     if (this.auto?.x) this.rotation.x += this.auto.x;
    //     if (this.auto?.y) this.rotation.y += this.auto.y;
    //     if (this.auto?.z) this.rotation.z += this.auto.z;
    //     const points = [];
    //     for (let i = 0; i < this.model.length; ++i) {
    //         const lp = this.toLocalPoint(this.model[i]);
    //         const wp = this.toWorldPoint(lp);
    //         const cp = this.toCameraPoint(wp, camera);
    //         const xy = this.toXyPoint(cp);
    //         points.push({ wp, cp, xy });
    //     }
    //     for(const f of this.faces) f.draw(this.position, points, this.color, camera);
    // }
}
class Pyramid extends GameObject {
    color = rndColor();
    model = [ new Pt(0, 1, 0), new Pt(1, 0, 1), new Pt(1, 0, -1), new Pt(-1, 0, -1), new Pt(-1, 0, 1) ];
    faces = [new Face([0, 1, 2]), new Face([0, 2, 3]), new Face([0, 3, 4]), new Face([0, 4, 1]), new Face([4, 3, 2, 1])];
    constructor(x, y, z, s = 1, sx = 1, sy = 1, sz = 1) {
        super(x, y, z, s);
        for (const p of this.model) { p.x *= sx; p.y *= sy; p.z *= sz }
    }
}
class Wedge extends GameObject {
    color = rndColor();
    model = [new Pt(-1, 0, -1), new Pt(1, 0, -1), new Pt(1, 0, 1), new Pt(-1, 0, 1), new Pt(-1, 1, 1), new Pt(-1, 1, -1)];
    faces = [new Face([0,1,2,3]), new Face([0,3,4,5]), new Face([1,5,4,2]), new Face([0,5,1]), new Face([3,2,4])];
    constructor(x, y, z, s = 1, sx = 1, sy = 1, sz = 1) {
        super(x, y, z, s, sx, sy, sz);
        //for (const p of this.model) { p.x *= sx; p.y *= sy; p.z *= sz }
    }
}
class Triangle extends GameObject {
    model = [ new Pt(-1,-1,0), new Pt(1,-1,0), new Pt(1,1,0) ];
    faces = [ new Face([0,1,2], true) ];
    color = [255,255,0];
}
class PointLight extends GameObject {
    radius = 1000;
    angle = 0;
    color = [255, 255, 255];
    constructor(x = 0, y = 0, z = 20, d = 1) {
        super();
        this.position = { x, y, z };
        this.direction = d;
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
        this.angle = 0.01;
        Object.assign(this.position, this.rotate(this.position, {y:this.angle * this.direction}, "y"));

        const position = this.toXyPoint(this.toCameraPoint(this.position, camera));
        //const circ  = this.toXyPoint(this.toCameraPoint({x: this.position.x + this.radius, y: this.position.y, z: this.position.z }, camera));
        if (position) {
            const d = dist3d(this.position, camera.position);
            const radius = this.radius / d;
            if (radius > 0) {
                const oldStyle = view.fillStyle;
                const grad = view.createRadialGradient(position.x, position.y, radius / 2, position.x, position.y, radius);
                grad.addColorStop(0, `rgba(${this.color[0]},${this.color[1]},${this.color[2]}, 0.7)`);
                grad.addColorStop(1, "rgba(0,0,0,0)");
                view.fillStyle = grad;
                view.fillRect(position.x - radius, position.y - radius, radius * 2, radius * 2);
                view.fillStyle = oldStyle;
            }
        }
    }
}
class SpotLight extends GameObject {
    radius = 0.5;
    angle = Math.PI * 2 / 40;
    dpVariance = 0.01; 
    colorA = [255, 255, 255, 0.5];
    strength = 1.5;
    get color() { return `rgba(${this.colorA[0]},${this.colorA[1]},${this.colorA[2]},${this.colorA[3]})`; }
    model = new Pt(0, 0, 1);
    constructor(x, y, z) {
        super();
        this.position = {x, y, z};
        this.direction = {x: 0, y: 0, z: 1};
        this.rotation = {x: 0, y: 0, z: 0};
    }
    draw(camera) {
        const xyCenter = this.toXyPoint(this.toCameraPoint(this.position, camera));
        const xyEdge  = this.toXyPoint(this.toCameraPoint({x: this.position.x + this.radius, y: this.position.y, z: this.position.z }, camera));
        const lp = this.toLocalPoint(this.model);
        const wp = this.toWorldPoint(lp);
        const cp = this.toCameraPoint(wp, camera);
        const xy = this.toXyPoint(cp);
        if (xyCenter && xyEdge) {
            const radius = xyEdge.x - xyCenter.x;
            if (radius > 0) {
                const oldStyle = view.fillStyle;
                view.fillStyle = this.color;
                view.arc(xyCenter.x, xyCenter.y, radius, 0, Math.PI * 2);
                view.fill();
                view.fillStyle = oldStyle;
            }
            view.lineWidth = 5;
            const oldStroke = view.strokeStyle;
            view.strokeStyle = this.color;
            view.beginPath();
            this.moveTo(xyCenter);
            this.lineTo(xy);
            view.stroke();
            view.strokeStyle = oldStroke;
            view.lineWidth = 1;
        }

    }
}
class Particle {
    color = [255, 255, 0, 1];
    size = 5;
    direction = { x: 0, y: 1, z: 0 };
    speed = 0.01;
    gravity = -0.005;
    dy = 0;
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
            this.direction.y += this.gravity;
            Object.assign(this.position, addVector(this.position, multiplyVector(this.direction, this.speed)));
            if (this.position.y < -10) {
                this.position.y = -10;
                this.direction.y = -this.direction.y * 0.95;
            }
            const xy = this.toXyPoint(this.toCameraPoint(this.position, camera));
            if (xy) {
                const fadePoint = this.lifetime * this.fadeOut;
                this.color[3] = this.ttl < fadePoint ? this.ttl / fadePoint : 1;
                const color = arrayToColorA(this.color);
                const oldFillStyle = view.fillStyle;
                view.fillStyle = color;
                //view.fillRect(xy.x, xy.y, this.size, this.size);
                view.beginPath();
                view.arc(xy.x, xy.y, this.size, 0, Math.PI * 2);
                view.fill();
                view.fillStyle = oldFillStyle;
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
    toXyPoint(p) {
        if (p == null || p.z == 0) return null;
        const xy = { x: p.x / p.z * canvas.width, y: p.y / p.z * canvas.width };
        return xy;
    }
    rotate(p, rotation, axis = "y") {
        const angle = rotation[axis] ?? rotation;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        switch(axis) {
            case "x": return { x: p.x, y: p.y * cos - p.z * sin, z: p.y * sin + p.z * cos };
            case "y": return { x: p.x * cos - p.z * sin, y: p.y, z: p.x * sin + p.z * cos };
            case "z": return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos, z: p.z };
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
    speed = 0.05;
    spread = 0.5;
    ttl = 300;
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

            const oldFillStyle = view.fillStyle;
            for (const p of this.particles) p.draw(camera);
            view.fillStyle = oldFillStyle;
            if (this.particles.length > 1000) this.particles = this.particles.filter(p => p.ttl > 0);
        }
    }
    distance(camera) {
        return Math.sqrt((this.x - camera.x)**2 + (this.y - camera.y)**2 + (this.z - camera.z)**2);
    }
    newParticle() {
        const p = new Particle(this.position, this.color, this.ttl, this.direction, this.spread);
        //p.direction = { x: Math.random() * 2 - 1, y: Math.random() * 2, z: Math.random() * 2 - 1 };
        p.speed = Math.random() * 0.3;
        return p;
    }
}
class Rotation {
    #x = 0;
    #y = 0;
    #dirty = false;
    #direction = { x: 0, y: 0, z: 1 };
    get x() { return this.#x; }
    get y() { return this.#y; }
    set x(value) {
        this.#x = value;
        this.#dirty = true;
    }
    set y(value) {
        this.#y = value;
        this.#dirty = true;
    }
    get heading() { return { x: -Math.sin(-this.#y), y: 0, z: Math.cos(-this.#y) }; }
    get pitchVector() { return { x: Math.cos(-this.#y), y: 0, z: Math.sin(-this.#y) }; }
    get direction() {
        if (this.#dirty) {
            Object.assign(this.#direction, rotatePointAroundUnitVector(this.heading, this.pitchVector, -this.#x));
            this.#dirty = false;
        }
        return this.#direction;
    }
}
class Camera {
    forwardVector = { x: 0, y: 0, z: 1 };
    rightVector = { x: 1, y: 0, z: 0 };
    upVector = { x: 0, y: 1, z: 0 };
    rotation = new Rotation(); // { x: 0, y: 0 };
    zoom = 1;
    max = 500;
    min = 1;
    fov = 0;
    constructor(x = 0, y = 0, z = 0) {
        this.position = { x, y, z };
    }
    get heading() { return { x: -Math.sin(-this.rotation.y), y: 0, z: Math.cos(-this.rotation.y) }; }
    get pitchVector() { return { x: Math.cos(-this.rotation.y), y: 0, z: Math.sin(-this.rotation.y) }; }
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
        const rightPoint = this.rotate(this.rightVector, this.rotation, "y");
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
        // const forwardVector = this.direction;
        // const leftVector = { x: -forwardVector.z, y: forwardVector.y, z: forwardVector.x };
        // const moveVector = multiplyVector(leftVector, dist);
        // Object.assign(this.position, addVector(this.position, moveVector));
    }
    moveUp(dist = 1) {
        // const forwardVector = this.direction;
        // const upVector = { x: forwardVector.x, y: forwardVector.z, z: -forwardVector.y };
        // const moveVector = multiplyVector(upVector, dist);
        // Object.assign(this.position, addVector(this.position, moveVector));
        this.position.y += 0.1 * dist;
    }
    moveDown(dist = 1) {
        // const forwardVector = this.direction;
        // const downVector = { x: forwardVector.x, y: -forwardVector.z, z: forwardVector.y };
        // const moveVector = multiplyVector(downVector, dist);
        // Object.assign(this.position, addVector(this.position, moveVector));
        //this.position.y -= 0.1 * dist;
        this.moveUp(-dist);
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
class Scene {
    animate = true;
    objects = [];
    lights = [];
    constructor(plane = null) { this.plane = plane; }
    add(o) { this.objects.push(o); }
    addLight(l) { this.lights.push(l); this.add(l); }
    draw(camera) {
         if (this.animate) {
            view.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
            if (this.plane) this.plane.draw(camera);
            this.sort(camera);
            for(const o of this.objects) o.draw(camera); 
         }
    }
    sort(camera) { this.objects.sort((a, b) => b.distance(camera) - a.distance(camera))}
    clear() { if (this.animate) view.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height); }
}
//#region Define objects
const lightSource1 = new PointLight(0, 25, 20);
lightSource1.color = [255, 255, 0];
const lightSource2 = new PointLight(0, 5, -20, -1);
lightSource2.color = [0, 0, 255];
//const spotlight1 = new SpotLight(0, 0, 10);
const camera = new Camera(0, 0, 50);
const peg = new ParticleEmitter(0, -9, 70);
const pyramid2 = new Pyramid(0, -10, 70);
const cube = new Cube(-5, 0, 0, 1, 10, 0.1);
const sphere = new Sphere(0, 0, 40, 4, 32, 4, 0.5);
const cylinder = new Cylinder(-10, 0, 10, 1, 6, 3, 0.5, 6, 5, 1);
const pyramid = new Pyramid(0, -10, -50, 1, 1, 10);
const wedge = new Wedge(-3, 0, 0, 1, 1, 1);
const sphere2 = new Sphere(0, 0, 20, 16);
//const sphere3 = new Sphere(20, 0, 20, 16);
const tri1 = new Triangle(0, 0, -50);
const simple = new SimpleSphere(5, 0, 20);
//#endregion
const plane = new Plane(400, 50, -10, [128, 128, 128], [192, 192, 192]);
const scene = new Scene(plane);
//#region DatGui
const gui = new dat.GUI();

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
cam.add(camera, "max", 0, 1000);
cam.add(camera, "min", 0, 25);
cam.add(camera, "fov", -1, 1);
const camRotation = cam.addFolder("Rotation");
const camPosition = cam.addFolder("Position");
camRotation.add(camera.rotation, "x", -1.5, 1.5).listen();
camRotation.add(camera.rotation, "y", -1.5, 1.5).listen();
camPosition.add(camera.position, "x", -100, 100).listen();
camPosition.add(camera.position, "y", -100, 100).listen();
camPosition.add(camera.position, "z", -100, 100).listen();
gui.add(scene, "animate");
gui.add(gameSettings, "doubleDraw").name("Wireframe");
gui.add(gameSettings, "showCrossHair").name("Crosshair");
gui.add(simple, "radius", 0, 5);
//#endregion
//#region Setup scene
scene.add(cube);
scene.add(sphere);
scene.add(cylinder);
scene.add(pyramid);
scene.add(wedge);
scene.add(sphere2);
//scene.add(sphere3);
scene.addLight(lightSource1);
scene.addLight(lightSource2);
scene.add(tri1);
scene.add(simple);
scene.add(peg);
scene.add(pyramid2);
//scene.add(spotlight1);


//for(let i = 0; i < 100; ++i) scene.add(new Cube());
//#endregion
//#region Connect objects
cube.connect(wedge);
//#endregion
//#region Animate
function animate() {
    //#region Game Input
    const delta = 1;
    if (GameInput.isForward) camera.moveForward(delta);
    if (GameInput.isBack) camera.moveBack(delta);
    if (GameInput.isRight) camera.moveRight(delta);
    if (GameInput.isLeft) camera.moveLeft(delta);
    if (GameInput.isTurnRight) {
        camera.rotation.y += 0.01;
        xpos -= 25;
        canvas.style.backgroundPositionX = `${xpos}px`;
    }
    if (GameInput.isTurnLeft) {
        camera.rotation.y -= 0.01;
        xpos += 25;
        canvas.style.backgroundPositionX = `${xpos}px`;
    }
    if (GameInput.isUp) camera.moveUp(1);
    if (GameInput.isDown) camera.moveDown(1);
    if (GameInput.isReset) camera.reset();
    //#endregion
    scene.draw(camera);
    if (gameSettings.showCrossHair) {
        const oldStroke = view.strokeStyle;
        const oldLineWidth = view.lineWidth;
        view.lineWidth = 2;
        view.beginPath();
        view.strokeStyle = "white";
        view.arc(0, 0, gameSettings.crossHairRadius - 2, 0, Math.PI * 2);
        view.stroke();
        view.strokeStyle = "black";
        view.beginPath();
        view.arc(0, 0, gameSettings.crossHairRadius, 0, Math.PI * 2);
        view.stroke();
        view.lineWidth = oldLineWidth;
        view.strokeStyle = oldStroke;
    }
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
//#endregion