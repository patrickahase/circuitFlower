// based on https://codepen.io/tsuhre/details/xgmEPe
const ns = "http://www.w3.org/2000/svg";
const myCanvas = document.getElementById("svgCanvas");
const stepButton = document.getElementById("stepButton");

const gridWidth = 100;
const gridHeight = 100;
const gridSize = 2;
const gridScale = 5;
let points = [];
let lines = [];
let startingSeeds = 10;

const dirs = [
    [0, 1], //n 6
    [1, 1], //ne 8
    [1, 0], //e 7
    [1, -1], //se 5
    [0, -1], //s 3
    [-1, -1], //sw 1
    [-1, 0], //w 2
    [-1, 1], //nw 4
];

function newCell(x,y){
    const offset = gridSize / 2;
    return {
        // pos is centre of grid cell
        pos: [x + offset,y + offset],
        avail: true
    }
}

/////////////////// init
myCanvas.setAttribute('width', gridWidth * gridScale);
myCanvas.setAttribute('height', gridHeight * gridScale);
myCanvas.setAttribute('viewBox', `0 0 ${gridWidth} ${gridHeight}`);

// setup grid spaces
for (let i = 0; i < gridWidth / gridSize; i++) {
    points.push([]);
    for (let o = 0; o < gridHeight / gridSize; o++) {
        const cell = newCell(i * gridSize,o * gridSize);
        points[i].push(cell);
        let gridCircle = document.createElementNS(ns, "circle");
        gridCircle.setAttribute("cx", cell.pos[0]);
        gridCircle.setAttribute("cy", cell.pos[1]);
        gridCircle.setAttribute("r", gridSize/3);
        gridCircle.setAttribute("stroke", "white");
        gridCircle.setAttribute("stroke-width", "0.2");
        myCanvas.appendChild(gridCircle);
    }
}

// ok so we need to create a way to step each one at a time
// maybe also we want to make single path instead of a lot of lines

function plantSeed(startPos){
    let lineGroup = document.createElementNS(ns, "g");
    let startCircle = document.createElementNS(ns, "circle");
    startCircle.setAttribute("cx", startPos[0]);
    startCircle.setAttribute("cy", startPos[1]);
    startCircle.setAttribute("r", 1);
    startCircle.setAttribute("stroke", "white");
    startCircle.setAttribute("stroke-width", "0.2");
    lineGroup.appendChild(startCircle);
    myCanvas.appendChild(lineGroup);
}



// for (let i = 0; i < startingSeeds; i++) {
//     plantSeed([Math.floor(Math.random() * gridSize), Math.floor(Math.random() * gridSize)]);
// }

/////////////////// random line
function randomWalk(start, steps){
    // set up group
    let newLineGroup = document.createElementNS(ns, "g");
    newLineGroup.setAttribute("stroke", "white");
    newLineGroup.setAttribute("stroke-width", "0.2");
    let currentPoint = start;
    points[start[0]][start[1]].avail = false;
    for (let i = 0; i < steps; i++) {
        let nextPoint = newRandomPoint(currentPoint);
        if(!nextPoint) {break}
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

randomWalk([50, 50], 1000);

// is this needed?
function randomDirection(){
    return dirs[Math.floor(Math.random() * dirs.length)];
}

// this is written for random new point, rather than checking directed new point
function newRandomPoint(startPoint){
    let randomDirIndex = Math.floor(Math.random() * dirs.length);
    let newDirection = dirs[randomDirIndex];
    //console.log(newDirection);
    //console.log(fanOut(randomDirIndex));
    let newPoint = findPoint(startPoint, newDirection);
    // if selected point is not available
    if(!points[newPoint[0]][newPoint[1]].avail || !newPoint){
        newPoint = null;
        let pointsToCheck = fanOut(randomDirIndex);
        for (let i = 0; i < pointsToCheck.length; i++) {
            let checkPoint = findPoint(startPoint, pointsToCheck[i]);
            if(points[checkPoint[0]][checkPoint[1]].avail){
                newPoint = checkPoint;
                break;
            }
        }
    }
    return newPoint;
}

function findPoint(startPoint, dir){
    return [
        startPoint[0] + dir[0],
        startPoint[1] + dir[1]
    ];
}

// adapted from Source - https://stackoverflow.com/a/19358740
// Posted by Stefan Seemayer, modified by community. See post 'Timeline' for change history
// Retrieved 2026-05-08, License - CC BY-SA 3.0

function fanOut(start){
    //let startDirection = (Math.floor(Math.random() * 2) * 2) - 1;
    // current always starts in one direction ^ above might be used to modulate?
    let order = [];
    let i;
    let len = dirs.length;
    for(i = 1; i <= (len/2) - 1; i++){
        order.push(dirs[((start + i) + len) % len]);
        order.push(dirs[((start - i) + len) % len]);
    }
    order.push(dirs[((start + i) + len) % len]);
    return order;
}
