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
}

resize();
addEventListener("resize", resize);

// view.beginPath();
// view.moveTo(0, 0);
// view.lineTo(100, 100);
// view.stroke();

class Pt {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Cube {
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
    constructor(x, y, z, s = 1) {
        this.scale = s;
        this.position = { x, y, z };
        this.rotation = { x: 0, y: 0, z: 0 };
    }
    draw() {
        const points = [];
        for (let i = 0; i < this.model.length; ++i) {
            const lp = this.toLocalPoint(this.model[i])
            const wp = this.toWorldPoint(lp);
            const cp = this.toXyPoint(wp);
            points.push(cp);
        }

        view.beginPath();
        this.moveTo(points[0]);
        this.lineTo(points[1]);
        this.lineTo(points[2]);
        this.lineTo(points[3]);
        this.lineTo(points[0]);

        this.moveTo(points[4]);
        this.lineTo(points[5]);
        this.lineTo(points[6]);
        this.lineTo(points[7]);
        this.lineTo(points[4]);

        this.moveTo(points[0]);
        this.lineTo(points[4]);
        this.moveTo(points[1]);
        this.lineTo(points[5]);
        this.moveTo(points[2]);
        this.lineTo(points[6]);
        this.moveTo(points[3]);
        this.lineTo(points[7]);
        view.stroke();
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

const cube = new Cube(0, 0, 20, 4);
const gui = new dat.GUI();
gui.add(cube.position, "x", -20, 20);
gui.add(cube.position, "y", -20, 20);
gui.add(cube.position, "z", 10, 200);
gui.add(cube.rotation, "x", -20, 20);
gui.add(cube.rotation, "y", -20, 20);
gui.add(cube.rotation, "z", 10, 200);

function animate() {
    view.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    cube.rotation.z += 0.01;

    cube.draw();

    requestAnimationFrame(animate);
}

animate();