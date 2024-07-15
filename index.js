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

    view.lineWidth = 1;
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
    const dx = -e.movementX * 2;
    const dy = -e.movementY * 2;
    xpos += dx;
    ypos += dy;
    document.body.style.backgroundPositionX = `${xpos}px`;
    document.body.style.backgroundPositionY = `${ypos}px`;

    camera.rotation.x -= e.movementY / 1000; // look up/down
    camera.rotation.y += e.movementX / 1000; // look left/right

    // spotlight1.direction.x += e.movementX / 1000;
    // spotlight1.direction.y -= e.movementY / 1000;

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
function reverseVector(v) {
    return multiplyVector(v, -1);
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
class GameSettings {
    doubleDraw = false;
}
const gameSettings = new GameSettings();
class GameObject {
    position = { x: 0, y: 0, z: 0 };
    rotation = { x: 0, y: 0, z: 0 };
    scale = 1;
    moveTo(p, o = 0) { if(p) view.moveTo(p.x + o, p.y + o); }
    lineTo(p, o = 0) { if(p) view.lineTo(p.x + o, p.y + o); }
    toLocalPoint(p) {
        let r = p;
        for (const a of 'xyz') if (this.rotation[a]) r = this.rotate(r, this.rotation, a); 
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
        const ry = this.rotate(cp, camera.rotation, "y");
        const rx = this.rotate(ry, camera.rotation, "x");
        return rx;
    }
    toXyPoint(p) {
        const xyp = 
          p.z >= 1 ? 
          {x: p.x / p.z * canvas.width, 
          y: p.y / p.z * canvas.width } : null;
        return xyp;
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
    distance(camera) {
        const dx = (this.position.x - camera.position.x) ** 2;
        const dy = (this.position.y - camera.position.y) ** 2;
        const dz = (this.position.z - camera.position.z) ** 2;
        return Math.sqrt(dx + dy + dz);
    }
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
class Face extends GameObject {
    static count = 0;
    static sides = ["Front", "Back", "Top", "Bottom", "Left", "Right"];
    verts = [];
    constructor() {
        super();
        this.id = Face.count++;
        for(const a of arguments) this.verts.push(a);
    }
    getFacePoints(points) {
        const localPoints = [];
        for (const i of this.verts) localPoints.push(points[i]);
        return localPoints;
    }
    draw(xyPoints, worldPoints, cameraPoints, color, camera) {
        const wp = this.getFacePoints(worldPoints);
        const xy = this.getFacePoints(xyPoints);

        // calculate 2 face vectors
        const faceEdge1 = subtractVector(wp[1], wp[0]);
        const faceEdge2 = subtractVector(wp[2], wp[0]);
        
        // calculate normal to face
        const faceNormal = crossProduct(faceEdge1, faceEdge2);
        const cameraVector = subtractVector(wp[0], camera.position);
        const normalisedCameraVector = normaliseVector(cameraVector);
        const dpCamera = dotProduct(normalisedCameraVector, faceNormal);
        const visible = dpCamera > 0;

        if (visible) {
            let red = 0, green = 0, blue = 0;
            for (const lightSource of scene.lights) {
                const lightVector = subtractVector(wp[0], lightSource.position);
                const normalisedLightVector = normaliseVector(lightVector);
                let dpLight = dotProduct(normalisedLightVector, faceNormal);
                const ambientLightLevel = 0.33;
                if (dpLight < ambientLightLevel) dpLight = ambientLightLevel;
                red += color.r * dpLight * lightSource.red;
                green += color.g * dpLight * lightSource.green;
                blue += color.b * dpLight * lightSource.blue;
            }

            // is current face facing the spotlight?
            const facingSpot = dotProduct(spotlight1.direction, faceNormal);
            if (facingSpot < 0) {
                //const center = centroid(wp);
                const spotlightVector = normaliseVector(subtractVector(spotlight1.position, wp[0]));
                // how similar is the spotlight -> face vector compared to the spotlight's direction vector?
                const dpSpotlight = dotProduct(spotlightVector, spotlight1.direction);
                if (1 - dpSpotlight < spotlight1.dpVariance) {
                    const blendColor = spotlight1.colorA;

                    const newRed = red * spotlight1.strength * -facingSpot;
                    if (newRed > red) {
                        red = newRed;
                        if (red > 255) red = 255;
                    }

                    const newGreen = green * spotlight1.strength * -facingSpot;
                    if (newGreen > green) {
                        green = newGreen;
                        if (green > 255) green = 255;
                    }

                    const newBlue = blue * spotlight1.strength * -facingSpot;
                    if (newBlue > blue) {
                        blue = newBlue;
                        if (blue > 255) blue = 255;
                    }

                    //col = "yellow";
                }
            }
            let col = `rgba(${red},${green},${blue},1)`;

            view.fillStyle = col;
            view.strokeStyle = col;
            this.drawFace(xy);

            //drawSkew(testImage, xy[0], xy[1], xy[2], xy[3]);

            // const cp = this.getFacePoints(cameraPoints);
            // const camVectorAB = subtractVector(cp[1], cp[0]);
            // const camVectorAC = subtractVector(cp[2], cp[0]);
            // const camNormal = crossProduct(camVectorAB, camVectorAC);
            // this.showNormals(cp, camNormal);
        }
    }
    equalToOne(value, variance) {
        const diff = 1 - value;
        return diff < variance;
    }
    drawFace(xy) {
        view.beginPath();
        this.drawLines(xy);
        //view.stroke();
        if (gameSettings.doubleDraw) this.drawLines(xy, 1);
        view.fill();
    }
    drawLines(xy, o = 0) {
        this.moveTo(xy[xy.length - 1], o);
        for(const p of xy) this.lineTo(p, o);
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
    color = { r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255 };
    //color = { r: 255, g: 255, b: 255 };
    verts = [ new Pt(0, 1, 0) ];
    constructor(x, y, z, h = 16, v = h * 2) {
        super();
        this.position = { x, y, z };
        this.rotation = { x: 0, y: 0, z: 0};
        this.scale = 4;
        this.dotSize = 2;
        const np = this.verts[0];
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
              this.verts.push(new Pt(x, y, z));
            }
        this.verts.push(sp);

        this.faces = [];

        // LAYER 0 (TOP): populate (v) faces around north pole (3 verts)
        for (let i = 2; i <= v; ++i) {
              this.faces.push(new Face(0, i, i - 1));
        }
        this.faces.push(new Face(0, 1, v));

        // Populate middle layers (each face has 4 verts)
        for (let j = 0; j < h-2; ++j) {
            for (let i = v*j+1; i < v*(j+1); ++i) {
                this.faces.push(new Face(i, i+1, i+v+1, i+v));
            }
            this.faces.push(new Face(v*(j+1), v*j+1, v*(j+1)+1, v*(j+2)));
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
            this.faces.push(new Face(i, i+1, (h-1)*v+1));
        }
        this.faces.push(new Face((h-1)*v, (h-2)*v+1, (h-1)*v+1));
}
    draw(camera) {
        view.fillStyle = "white";
        const worldPoints = [], cameraPoints = [], xyPoints = [];
        let c = 0;
        for(const p of this.verts) {
            //const lp = this.toLocalPoint(p);
            const wp = this.toWorldPoint(p); // lp
            const cp = this.toCameraPoint(wp, camera);
            const xy = this.toXyPoint(cp);
            worldPoints.push(wp);
            cameraPoints.push(cp);
            xyPoints.push(xy);
            //this.setPixel(xy);
            //this.text(c, xy);
            ++c;
        }
        for(const f of this.faces) f.draw(xyPoints, worldPoints, cameraPoints, this.color, camera);
    }
    setPixel(p) { if (p) view.fillRect(p.x - this.dotSize / 2, p.y - this.dotSize / 2, this.dotSize, this.dotSize); }
    text(t, p) {
        view.font = "18px Arial";
        view.fillText(t, p.x, p.y);
    }
}
class Cube extends GameObject {
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
              new Face(5,4,7,6), // back
              new Face(4,5,1,0), // top
              new Face(3,2,6,7), // bottom
              new Face(4,0,3,7), // left
              new Face(1,5,6,2)  // right
            ]
    constructor(x, y, z, s = 1) {
        super();
        x ??= Math.random() * 50 - 25;
        y ??= Math.random() * 50 - 25;
        z ??= Math.random() * 190 + 10
        this.scale = s;
        this.position = { x, y, z };
        this.rotation = { x: 0, y: 0, z: 0 };
        const maxRotate = 0.05;
        const maxOffset = maxRotate / 2;
        this.auto = { x: Math.random() * maxRotate - maxOffset, y: Math.random() * maxRotate - maxOffset, z: Math.random() * maxRotate - maxOffset };
    }
    draw(camera) {
        if (this.auto.x) this.rotation.x += this.auto.x;
        if (this.auto.y) this.rotation.y += this.auto.y;
        if (this.auto.z) this.rotation.z += this.auto.z;
        const worldPoints = [], cameraPoints = [], xyPoints = [];
        for (let i = 0; i < this.verts.length; ++i) {
            const lp = this.toLocalPoint(this.verts[i]);
            const wp = this.toWorldPoint(lp);
            const cp = this.toCameraPoint(wp, camera);
            const xyp = this.toXyPoint(cp);
            worldPoints.push(wp);
            cameraPoints.push(cp);
            xyPoints.push(xyp);
        }
        for(const f of this.faces) f.draw(xyPoints, worldPoints, cameraPoints, this.color, camera);
    }
}
class PointLight extends GameObject {
    radius = 1;
    angle = 0;
    color = [255, 255, 255];
    constructor(x = 0, y = 0, z = 20) {
        super();
        this.position = { x, y, z };
        // this.el = document.createElement("p");
        // this.el.style.color = "#00ff00";
        // this.el.style.display = "none";
        // document.body.appendChild(this.el);
        // console.log(this.color);
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
        Object.assign(this.position, this.rotate(this.position, {y:this.angle}, "y"));

        const center = this.toXyPoint(this.toCameraPoint(this.position, camera));
        const circ  = this.toXyPoint(this.toCameraPoint({x: this.position.x + this.radius, y: this.position.y, z: this.position.z }, camera));
        if (center && circ) {
            const radius = circ.x - center.x;
            if (radius > 0) {
                const oldStyle = view.fillStyle;
                const grad = view.createRadialGradient(center.x, center.y, radius / 2, center.x, center.y, radius);
                grad.addColorStop(0, `rgba(${this.color[0]},${this.color[1]},${this.color[2]}, 0.7)`);
                grad.addColorStop(1, "rgba(0,0,0,0)");
                view.fillStyle = grad;
                view.fillRect(center.x - radius, center.y - radius, radius * 2, radius * 2);
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
class Camera {
    model = { x: 0, y: 0, z: 1 };
    rotation = { x: 0, y: 0 };
    zoom = 1;
    constructor(x = 0, y = 0, z = 0) {
        this.position = { x, y, z };
    }
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
class Scene {
    animate = true;
    objects = [];
    lights = [];
    add(o) { this.objects.push(o); }
    addLight(l) { this.lights.push(l); this.add(l); }
    draw(camera) { if (this.animate) { for(const o of this.objects) o.draw(camera); }
    }
    sort() { this.objects.sort((a, b) => b.distance(camera) - a.distance(camera))}
    clear() { if (this.animate) view.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height); }
}

const lightSource = new PointLight(0, 0, 50);
const lightSource2 = new PointLight(0, 0, -50);
const spotlight1 = new SpotLight(0, 0, 10);
const camera = new Camera(0, 2, 0);
//const cube = new Cube(0, 0, 200, 1);
const sphere = new Sphere(0, 0, 20, 48);
//const sphere2 = new Sphere(20, 20, 20, 16);
//const sphere3 = new Sphere(20, 0, 20, 16);
const scene = new Scene();

//#region DatGui
const gui = new dat.GUI();

// const cubeFolder = gui.addFolder("Cube");
// cubeFolder.add(cube, "scale", 1, 25).name("Scale");
// const cubePosition = cubeFolder.addFolder("Position");
// cubePosition.add(cube.position, "x", -20, 20);
// cubePosition.add(cube.position, "y", -20, 20);
// cubePosition.add(cube.position, "z", 10, 200);
// const cubeRotation = cubeFolder.addFolder("Rotation");
// cubeRotation.add(cube.rotation, "x", -Math.PI, Math.PI);
// cubeRotation.add(cube.rotation, "y", -Math.PI, Math.PI);
// cubeRotation.add(cube.rotation, "z", -Math.PI, Math.PI);

const sphereFolder = gui.addFolder("Sphere");
sphereFolder.add(sphere, "scale", 1, 25).name("Scale");
const spherePosition = sphereFolder.addFolder("Position");
spherePosition.add(sphere.position, "x", -20, 20);
spherePosition.add(sphere.position, "y", -20, 20);
spherePosition.add(sphere.position, "z", 10, 200);
const sphereRotation = sphereFolder.addFolder("Rotation");
sphereRotation.add(sphere.rotation, "x", -Math.PI, Math.PI);
sphereRotation.add(sphere.rotation, "y", -Math.PI, Math.PI);
sphereRotation.add(sphere.rotation, "z", -Math.PI, Math.PI);

const light = gui.addFolder("Light Source");
light.add(spotlight1.position, "x", -40, 40);
light.add(spotlight1.position, "y", -40, 40);
light.add(spotlight1.position, "z", -100, 250);
light.addColor(spotlight1, "colorA").name("Colour");
light.add(spotlight1, "dpVariance", 0, 0.1);
light.add(spotlight1, "strength", 0, 10);
const cam = gui.addFolder("Camera");
const camRotation = cam.addFolder("Rotation");
const camPosition = cam.addFolder("Position");
camRotation.add(camera.rotation, "x", -1.5, 1.5).listen();
camRotation.add(camera.rotation, "y", -1.5, 1.5).listen();
camPosition.add(camera.position, "x", -100, 100).listen();
camPosition.add(camera.position, "y", -100, 100).listen();
camPosition.add(camera.position, "z", -100, 100).listen();
gui.add(scene, "animate");
gui.add(gameSettings, "doubleDraw").name("Wireframe");
//#endregion

//scene.add(cube);
scene.add(sphere);
//scene.add(sphere2);
//scene.add(sphere3);
scene.addLight(lightSource);
scene.addLight(lightSource2);
scene.add(spotlight1);
//for(let i = 0; i < 20; ++i) scene.add(new Cube());

function animate() {
    scene.sort();
    scene.clear();
    //#region Game Input
    if (GameInput.isForward) camera.moveForward(0.3);
    if (GameInput.isBack) camera.moveBack(0.3);
    if (GameInput.isRight) camera.moveRight(0.1);
    if (GameInput.isLeft) camera.moveLeft(0.1);
    if (GameInput.isUp) camera.moveUp(0.1);
    if (GameInput.isDown) camera.moveDown(0.1);
    if (GameInput.isReset) camera.reset();
    //#endregion
    
    sphere.rotation.x += 0.01;
    sphere.rotation.y += 0.01;
    scene.draw(camera);

    const showCenter = false;
        if (showCenter) {
        view.beginPath();
        view.arc(0, 0, 10, 0, Math.PI * 2);
        view.stroke();
    }

    requestAnimationFrame(animate);
}

animate();
