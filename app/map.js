import { BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial } from "../vendor/three.module.js";
import * as Utils from './utils.js';
import * as MapPartition from './mapPartition.js';
import * as Render from './render3d.js';
import Bbox from './bbox.js';
import * as MapReader from './mapReader.js';
import * as ImageLoader from './ImageLoader.js';
import * as Debug from './debug.js';

const wallsObjects = [];
const wallMaterial = new MeshBasicMaterial({color: '#ffffff'});

export function init() {
    wallMaterial.map = ImageLoader.get('wall');
    wallMaterial.needsUpdate = true;
    buildWalls();
    buildMesh();
    MapPartition.buildGrid(wallsObjects);
}

function buildWalls() {
    const wallsPositions = MapReader.readMap();

    wallsPositions.forEach(wallPos => {
        wallsObjects.push(new Wall(wallPos[0], wallPos[1]));
    });
}

export function getWallIntersectionForBbox(segmentToTest, bbox) {
    const wallsMatching = MapPartition.getWallsForBbox(bbox);

    return wallsMatching.map(wall => {
        const intersection = Utils.segmentIntersection(
            segmentToTest[0].x,
            segmentToTest[0].y,
            segmentToTest[1].x,
            segmentToTest[1].y,
            
            wall.startPos.x,
            wall.startPos.y,
            wall.endPos.x,
            wall.endPos.y,
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
    const uvValues = [];
    const width = 10;
    const zPos = 0;

    wallsObjects.forEach(wall => {
        const borderAngle = wall.angle * -1;
        const offsetX = Math.sin(borderAngle) * width;
        const offsetY = Math.cos(borderAngle) * width;

        positions.push(
            wall.startPos.x - offsetX,
            wall.startPos.y - offsetY,
            zPos,

            wall.startPos.x + offsetX,
            wall.startPos.y + offsetY,
            zPos,

            wall.endPos.x + offsetX,
            wall.endPos.y + offsetY,
            zPos,

            wall.endPos.x - offsetX,
            wall.endPos.y - offsetY,
            zPos,
        );

        const uvHor = 1;
        const uvVert = wall.length / 20;

        uvValues.push(
            0, 0,
            uvHor, 0,
            uvHor, uvVert,
            0, uvVert,
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
    const uvCoords = new Float32Array(uvValues);
    const geometry = new BufferGeometry();
    geometry.setIndex(faces);
    geometry.setAttribute('position', new BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new BufferAttribute(uvCoords, 2));

    const wallsMesh = new Mesh(geometry, wallMaterial);
    Render.add(wallsMesh);
}

class Wall {
    constructor(startPos, endPos) {
        this.startPos = startPos;
        this.endPos = endPos;
        this.length = Utils.distance(this.startPos, this.endPos);
        this.angle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x);
        this.direction = [
            Math.cos(this.angle),
            Math.sin(this.angle),
        ];
        this.bbox = new Bbox(
            Math.min(this.startPos.x, this.endPos.x),
            Math.max(this.startPos.x, this.endPos.x),
            Math.min(this.startPos.y, this.endPos.y),
            Math.max(this.startPos.y, this.endPos.y)
        );
    }
}