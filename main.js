// based on https://codepen.io/tsuhre/details/xgmEPe
const ns = "http://www.w3.org/2000/svg";
const myCanvas = document.getElementById("svgCanvas");

const gridSize = 100;
const gridToPixelScale = 5;
let points = [];

const dirs = [
    [0, 1], //n
    [1, 1], //ne
    [1, 0], //e
    [1, -1], //se
    [0, -1], //s
    [-1, -1], //sw
    [-1, 0], //w
    [-1, 1], //nw
];

function newCell(x,y){
    return {
        pos: [x,y],
        avail: true
    }
}

/////////////////// init
myCanvas.setAttribute('width', gridSize * gridToPixelScale);
myCanvas.setAttribute('height', gridSize * gridToPixelScale);
myCanvas.setAttribute('viewBox', `0 0 ${gridSize} ${gridSize}`);

// setup grid spaces
for (let i = 0; i <= gridSize; i++) {
    points.push([]);
    for (let o = 0; o <= gridSize; o++) {
        points[i].push(newCell(i,o));
    }
}

/////////////////// random line
// mutating avail in array?
let newLine = document.createElementNS(ns, "polyline");
newLine.setAttribute("points", "10, 40 20, 60");
newLine.setAttribute("stroke", "white");
newLine.setAttribute("stroke-width", "1");
myCanvas.appendChild(newLine);

console.log(points);

function randomWalk(start, steps){
    // set up group
    let newLineGroup = document.createElementNS(ns, "g");
    newLineGroup.setAttribute("stroke", "white");
    newLineGroup.setAttribute("stroke-width", "0.1");
    let currentPoint = start;
    points[start[0]][start[1]].avail = false;
    for (let i = 0; i < steps; i++) {
        let newDirection = randomDirection();
        let nextPoint = [
            currentPoint[0] + newDirection[0],
            currentPoint[1] + newDirection[1]
        ];
        let newLine = document.createElementNS(ns, "line");
        newLine.setAttribute("x1", currentPoint[0]);
        newLine.setAttribute("y1", currentPoint[1]);
        newLine.setAttribute("x2", nextPoint[0]);
        newLine.setAttribute("y2", nextPoint[1]);
        newLineGroup.appendChild(newLine);
        points[nextPoint[0]][nextPoint[1]].avail = false;
        currentPoint = nextPoint;
    }
    myCanvas.appendChild(newLineGroup);
}

randomWalk([50, 50], 10);

function randomDirection(){
    return dirs[Math.floor(Math.random() * dirs.length)];
}