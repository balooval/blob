import { BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial } from "../vendor/three.module.js";
import * as Utils from './utils.js';
import * as MapPartition from './mapPartition.js';
import * as Render from './render3d.js';
import Bbox from './bbox.js';
import * as Debug from './debug.js';

export const walls = [];

export function init() {
    buildMesh();
    MapPartition.buildGrid(walls);
}

const wallsPositions = [
    [
        {x: -400, y: -300},
        {x: -400, y: 300},
    ],
    [
        {x: -400, y: -280},
        {x: 800, y: -250},
    ],
    [
        {x: 400, y: -200},
        {x: 400, y: 300},
    ],
    [
        {x: -300, y: -300},
        {x: -300, y: 230},
    ],
    [
        {x: -300, y: 220},
        {x: 300, y: 150},
    ],
    [
        {x: -400, y: 290},
        {x: 400, y: 290},
    ],
    [
        {x: -100, y: -100},
        {x: 410, y: -120},
    ],
    [
        {x: -180, y: -100},
        {x: -180, y: 52},
    ],
    [
        {x: -182, y: 50},
        {x: -80, y: 50},
    ],
];

wallsPositions.forEach(wallPos => {
    const angle = Math.atan2(wallPos[1].y - wallPos[0].y, wallPos[1].x - wallPos[0].x);
    walls.push({
        id: walls.length,
        angle: angle,
        direction: [Math.cos(angle), Math.sin(angle)],
        positions: wallPos,
        bbox: calcWallBBox(wallPos),
    });
});

export function getWallIntersectionForBbox(segmentToTest, bbox) {
    const wallsMatching = MapPartition.getWallsForBbox(bbox);

    return wallsMatching.map(wall => {
        const intersection = Utils.segmentIntersection(
            segmentToTest[0].x,
            segmentToTest[0].y,
            segmentToTest[1].x,
            segmentToTest[1].y,
            
            wall.positions[0].x,
            wall.positions[0].y,
            wall.positions[1].x,
            wall.positions[1].y,
        );

        if (intersection === null) {
            return null;
        }

        return {
            intersection: intersection,
            wall: wall,
            distance: Utils.distance(segmentToTest[0], intersection),
        }
    })
    .filter(hit => hit !== null)
    .sort((hitA, hitB) => Math.sign(hitA.distance - hitB.distance))
    .shift();
}

export function getWallIntersection(segmentToTest) {
    return walls.map(wall => {
        const intersection = Utils.segmentIntersection(
            segmentToTest[0].x,
            segmentToTest[0].y,
            segmentToTest[1].x,
            segmentToTest[1].y,
            
            wall.positions[0].x,
            wall.positions[0].y,
            wall.positions[1].x,
            wall.positions[1].y,
        );

        if (intersection === null) {
            return null;
        }

        return {
            intersection: intersection,
            wall: wall,
            distance: Utils.distance(segmentToTest[0], intersection),
        }
    })
    .filter(hit => hit !== null)
    .sort((hitA, hitB) => Math.sign(hitA.distance - hitB.distance))
    .shift();
}

function buildMesh() {
    let facesIndex = 0;
    const faces = [];
    const positions = [];
    const width = 7;
    const zPos = 0;

    walls.forEach(wallData => {
        const borderAngle = wallData.angle * -1// - Math.PI * 2;
        const offsetX = Math.sin(borderAngle) * width;
        const offsetY = Math.cos(borderAngle) * width;

        const startPos = wallData.positions[0];
        const endPos = wallData.positions[1];

        positions.push(
            startPos.x - offsetX,
            startPos.y - offsetY,
            zPos,

            startPos.x + offsetX,
            startPos.y + offsetY,
            zPos,

            endPos.x + offsetX,
            endPos.y + offsetY,
            zPos,

            endPos.x - offsetX,
            endPos.y - offsetY,
            zPos,
        );

        faces.push(
            facesIndex + 3,
            facesIndex + 1,
            facesIndex + 0,

            facesIndex + 3,
            facesIndex + 2,
            facesIndex + 1,
        );
        facesIndex += 4;
    });

    const vertices = new Float32Array(positions);
    const geometry = new BufferGeometry();
    geometry.setIndex(faces);
    geometry.setAttribute('position', new BufferAttribute(vertices, 3));

    const material = new MeshBasicMaterial({color: '#606060'});
    const wallsMesh = new Mesh(geometry, material);
    Render.add(wallsMesh);
}

function calcWallBBox(wallPos) {
    return new Bbox(
        Math.min(wallPos[0].x, wallPos[1].x),
        Math.max(wallPos[0].x, wallPos[1].x),
        Math.min(wallPos[0].y, wallPos[1].y),
        Math.max(wallPos[0].y, wallPos[1].y)
    );
}