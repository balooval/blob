import * as Utils from './utils.js';

let canvas;
let mainContext;

let blobCanvas;
let blobContext;

const bgColor = '#222';

export function init(canvasId) {
    canvas = document.getElementById(canvasId);
    mainContext = canvas.getContext('2d');
    blobCanvas = new OffscreenCanvas(canvas.width, canvas.height);
    blobContext = blobCanvas.getContext('2d');
    clear();
}

export function clear() {
    blobContext.clearRect(0, 0, 800, 600);
    mainContext.clearRect(0, 0, 800, 600);
    mainContext.fillStyle = bgColor;
    mainContext.fillRect(0, 0, 800, 600);
}

export function drawSplats(splats) {
    splats.forEach(splat => {
        drawCircle(
            mainContext,
            splat.x,
            splat.y,
            splat.size,
            `rgba(${splat.color}, ${splat.alpha})`
        );
    });
}

export function drawStains(stains) {
    stains.forEach(stain => {
        drawCircle(
            mainContext,
            stain.x,
            stain.y,
            stain.size,
            `rgba(${stain.color}, ${stain.alpha})`
        );
    });
}

export function drawWall(wall) {
    mainContext.strokeStyle  = '#888'
    mainContext.lineWidth = 10;
    mainContext.beginPath();
    mainContext.moveTo(wall.positions[0].x, wall.positions[0].y)
    mainContext.lineTo(wall.positions[1].x, wall.positions[1].y)
    mainContext.stroke();
}

export function drawBlob(blob) {
    // blobContext.fillStyle = '#F00';
    // blobContext.beginPath();
    // blobContext.arc(blob.posX, blob.posY, blob.size / 2, 0, Math.PI * 2);
    // blobContext.closePath();
    // blobContext.fill();
    blob.arms.map(renderBlobArm);
    
    mainContext.drawImage(blobCanvas, 0, 0);
}

function renderBlobArm(arm) {

    arm.segments.forEach((segment, i) => {
        const darkness = 1 - (i * 0.1);
        const rgb = Utils.hslToRgb(arm.hsl[0], arm.hsl[1] + i * 2, arm.hsl[2]);
        drawLine(blobContext, segment.start, segment.end, `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`, segment.width);
    });

    if (arm.eyeClosed === false) {
        const eyeIndex = Math.min(arm.segments.length - 1, 1);

        drawCircle(
            blobContext,
            arm.segments[eyeIndex].end.x,
            arm.segments[eyeIndex].end.y,
            arm.segments[eyeIndex].width * 0.2,
            `rgb(200, 100, 100)`
        );

        drawCircle(
            blobContext,
            arm.segments[eyeIndex].end.x + arm.direction[0],
            arm.segments[eyeIndex].end.y + arm.direction[1],
            arm.segments[eyeIndex].width * 0.1,
            `rgb(0, 0, 0)`
        );
    }

    // const viewLine = arm.getViewSegment();
    // drawLine(blobContext, viewLine[0], viewLine[1], 'rgb(200, 200, 0)', 2);

    const hookColor = Utils.hslToRgb(arm.hsl[0], arm.hsl[1], arm.hsl[2]);
    // const hookColor = 'rgb(0, 0, 255)';
    const segmentA = arm.segments[arm.segments.length - 2];
    const segmentB = arm.segments[arm.segments.length - 1];
    arm.hooks.forEach(hook => {
        const middle = Utils.lerpPoint([segmentB.start.x, segmentB.start.y], hook, 0.3)
        drawLine(blobContext, segmentA.start, {x:middle[0], y:middle[1]}, hookColor, segmentA.width);
        drawLine(blobContext, {x:middle[0], y:middle[1]}, {x:hook[0], y:hook[1]}, hookColor, segmentB.width);
        // drawLine(blobContext, lastSegment.start, {x:hook[0], y:hook[1]}, hookColor, 1);
    });
}

function drawLine(context, start, end, color, width) {
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(start.x, start.y)
    context.lineTo(end.x, end.y)
    context.stroke();
}

function drawCircle(context, posX, posY, radius, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(posX, posY, radius, 0, Math.PI * 2);
    context.closePath();
    context.fill();
}