console.log("working. . . ");

const canvas = document.querySelector("canvas");
const view = canvas.getContext("2d");

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

// view.beginPath();
// view.moveTo(0, 0);
// view.lineTo(100, 100);
// view.stroke();

class Pt {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Face {
    verts = [];
    constructor() {
         for(const a of arguments) this.verts.push(a);
    }
    draw(points) {
        const verts = [];
        for(const v of this.verts) verts.push(points[v]);

        this.moveTo(verts[0]);
        for(let i = 1; i < verts.length; ++i) this.lineTo(verts[i]);
        this.lineTo(verts[0]);

        const centre = centroid(verts);
        const v1 = subtractVector(this.verts[1], this.verts[0]);
        const v2 = subtractVector(this.verts[2], this.verts[0]);
        const normal = normalVector(crossProduct(v1, v2));
        const outer = addVector(centre, multiplyVector(normal, 30));

        this.moveTo(centre);
        this.lineTo(outer);
    }
    moveTo(p) { view.moveTo(p.x, p.y); }
    lineTo(p) { view.lineTo(p.x, p.y); }
}
function dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}
function crossProduct(v1, v2) {
    return new Pt(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);
}
function normalVector(v) {
    const l = Math.sqrt(v.x **2 + v.y ** 2 + v.z ** 2);
    return { x: v.x / l, y: v.y / l, z: v.z / l };
}
function multiplyVector(v, f) {
    return { x: v.x * f, y: v.y * f, z: v.z * f };
}
function addVector(v1, v2) {
    return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z };
}
function subtractVector(v1, v2) {
    return { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
}
function centroid(verts) {
    let x = 0, y = 0, z = 0;
    for(const a of verts) { x += a.x; y += a.y; z += a.z; }
    x /= arguments.length;
    y /= arguments.length;
    z /= arguments.length;
    return { x, y, z };
}
class Cube {
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
              new Face(4,5,6,7), // back
              new Face(0,1,5,4), // top
              new Face(2,3,7,6), // bottom
              new Face(0,3,7,4), // left
              new Face(1,2,6,5)  // right
            ]
    constructor(x, y, z, s = 1) {
        this.scale = s;
        this.position = { x, y, z };
        this.rotation = { x: 0, y: 0, z: 0 };
    }
    draw() {
        const points = [];
        for (let i = 0; i < this.verts.length; ++i) {
            const lp = this.toLocalPoint(this.verts[i]);
            const wp = this.toWorldPoint(lp);
            const cp = this.toXyPoint(wp);
            points.push(cp);
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

        view.beginPath();
        for(const f of this.faces) f.draw(points);
        view.stroke(); 
    }
    rotate(p, axis) {
        const angle = this.rotation[axis];
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        switch(axis) {
            case "x": return { x: p.x, y: p.y * cos - p.z * sin, z: p.y * sin + p.z * cos };
            case "y": return { x: p.x * cos - p.z * sin, y: p.y, z: p.x * sin + p.z * cos };
            case "z": return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos, z: p.z };
        }
    }
    toLocalPoint(p) {
        const r1 = this.rotate(p, "x");
        const r2 = this.rotate(r1, "y");
        const r3 = this.rotate(r2, "z");
        return r3;
     }
     toWorldPoint(p) {
        const wp = { x: this.position.x + p.x * this.scale, 
            y: this.position.y + p.y * this.scale, 
            z: this.position.z + p.z * this.scale, };

        return wp;
    }
    toXyPoint(p) {
        const xyp = 
          p.z > 0 ? 
          {x: p.x / p.z * canvas.width, 
          y: p.y / p.z * canvas.width } : null;
        return xyp;
    }
    moveTo(p) { view.moveTo(p.x, p.y); }
    lineTo(p) { view.lineTo(p.x, p.y); }
}

const cube = new Cube(0, 0, 20, 4);
const gui = new dat.GUI();
const pos = gui.addFolder("Position");
pos.add(cube.position, "x", -20, 20);
pos.add(cube.position, "y", -20, 20);
pos.add(cube.position, "z", 10, 200);
const rot = gui.addFolder("Rotation");
rot.add(cube.rotation, "x", -Math.PI, Math.PI);
rot.add(cube.rotation, "y", -Math.PI, Math.PI);
rot.add(cube.rotation, "z", -Math.PI, Math.PI);

function animate() {
    view.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    cube.draw();

    requestAnimationFrame(animate);
}

animate();