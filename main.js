// based on https://codepen.io/tsuhre/details/xgmEPe
const ns = "http://www.w3.org/2000/svg";
const myCanvas = document.getElementById("svgCanvas");

const gridSize = 100;
const gridToPixelScale = 5;
let points = [];

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
