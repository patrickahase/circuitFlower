// based on https://codepen.io/tsuhre/details/xgmEPe
const ns = "http://www.w3.org/2000/svg";
const myCanvas = document.getElementById("svgCanvas");
const stepButton = document.getElementById("stepButton");

const colour1 = "black";
const colour2 = "white";

const gridWidth = 100;
const gridHeight = 100;
const gridSize = 2;
const gridScale = 5;
// points stores grid as x y based on scale
// pos stores centre position of point
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

// setup grid spaces : stored as points[x][y]
for (let i = 0; i < gridWidth / gridSize; i++) {
    points.push([]);
    for (let o = 0; o < gridHeight / gridSize; o++) {
        const cell = newCell(i * gridSize,o * gridSize);
        points[i].push(cell);
    }
}

// ok so we need to create a way to step each one at a time
// maybe also we want to make single path instead of a lot of lines

function plantSeed(startPoint){
    let startPos = points[startPoint[0]][startPoint[1]].pos
    let lineGroup = document.createElementNS(ns, "g");
    let startStud = createCircleStud(startPos);
    lineGroup.appendChild(startStud);
    myCanvas.appendChild(lineGroup);
    lines.push({
        shapeGroup: lineGroup,
        lastPoint: startPoint
    });
}

// generate start
for (let i = 0; i < startingSeeds; i++) {
    let randX = Math.floor(Math.random() * (gridWidth / gridSize));
    let randY = Math.floor(Math.random() * (gridHeight / gridSize));
    while(points[randX][randY].avail === false){
        randX = Math.floor(Math.random() * (gridWidth / gridSize));
        randY = Math.floor(Math.random() * (gridHeight / gridSize));
    }
    points[randX][randY].avail = false;
    plantSeed([randX, randY]);
}

function incrementLines(){
    for (let i = 0; i < lines.length; i++) {
        let nextPoint = newRandomPoint(lines[i].lastPoint);
        if(!nextPoint){
            let endStud = createCircleStud(findPosFromPoint(lines[i].lastPoint));
            lines[i].shapeGroup.appendChild(endStud);
            lines.splice(i, 1);
        } else {
            let newLine = document.createElementNS(ns, "line");
            let startPos = findPosFromPoint(lines[i].lastPoint);
            let nextPos = points[nextPoint[0]][nextPoint[1]].pos;
            newLine.setAttribute("x1", startPos[0]);
            newLine.setAttribute("y1", startPos[1]);
            newLine.setAttribute("x2", nextPos[0]);
            newLine.setAttribute("y2", nextPos[1]);
            newLine.setAttribute("stroke", "white");
            newLine.setAttribute("stroke-width", "0.2");
            lines[i].shapeGroup.prepend(newLine);
            lines[i].lastPoint = nextPoint;
            points[nextPoint[0]][nextPoint[1]].avail = false;
        }
    }
}
stepButton.addEventListener("click", incrementLines);

// gen to end
// while(lines.length > 0){
//     incrementLines();
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

//randomWalk([50, 50], 1000);

// is this needed?
function randomDirection(){
    return dirs[Math.floor(Math.random() * dirs.length)];
}

// this is written for random new point, rather than checking directed new point
function newRandomPoint(startPoint){
    let randomDirIndex = Math.floor(Math.random() * dirs.length);
    let newDirection = dirs[randomDirIndex];
    let newPoint = findPoint(startPoint, newDirection);
    // if selected point is not available
    if(points[newPoint[0]] === undefined
       || points[newPoint[0]][newPoint[1]] === undefined
       || !points[newPoint[0]][newPoint[1]].avail) {
            newPoint = null;
            let pointsToCheck = fanOut(randomDirIndex);
            for (let i = 0; i < pointsToCheck.length; i++) {
                let checkPoint = findPoint(startPoint, pointsToCheck[i]);
                if(points[checkPoint[0]] && points[checkPoint[0]][checkPoint[1]]
                    && points[checkPoint[0]][checkPoint[1]].avail){
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

function findPosFromPoint(point){
    return points[point[0]][point[1]].pos;
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

///////// create svg elements
function createCircleStud(pos){
    let circleStud = document.createElementNS(ns, "circle");
    circleStud.setAttribute("cx", pos[0]);
    circleStud.setAttribute("cy", pos[1]);
    circleStud.setAttribute("r", gridSize / 3);
    circleStud.setAttribute("fill", colour1);
    circleStud.setAttribute("stroke", colour2);
    circleStud.setAttribute("stroke-width", "0.2");
    return circleStud;
}