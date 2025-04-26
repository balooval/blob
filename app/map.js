import { BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial, MeshPhysicalMaterial } from "../vendor/three.module.js";
import * as Utils from './utils.js';
import * as MapPartition from './mapPartition.js';
import * as Render from './render3d.js';
import Bbox from './bbox.js';
import * as MapReader from './mapReader.js';
import * as ImageLoader from './ImageLoader.js';

const wallsObjects = [];
const blocksObjects = [];
const backgrounds = [];
const wallMaterial = new MeshPhysicalMaterial({color: '#ffffff'});
const woodenBoxMaterial = new MeshPhysicalMaterial({color: '#ffffff'});
const tilesMaterial = new MeshPhysicalMaterial({color: '#ffffff'});
const backgroundMaterial = new MeshPhysicalMaterial({color: '#909090'});
const colorToMaterialIndex = {
    '#f8cecc': 1, //woodenBoxMaterial
    '#dae8fc': 2, //tilesMaterial
};
let mapFileContent = '';

export function init() {
    wallMaterial.map = ImageLoader.get('wall');
    backgroundMaterial.map = ImageLoader.get('background');
    woodenBoxMaterial.map = ImageLoader.get('wodden-box');
    tilesMaterial.map = ImageLoader.get('tiles');
    wallMaterial.needsUpdate = true;
    buildWalls();
    buildWallsMesh();
    buildBlocksMesh();
    buildBackgroundMesh();
    MapPartition.buildGrid([...wallsObjects, ...blocksObjects]);
}

export function loadMap() {
    return fetch('./assets/map.drawio.xml')
    .then(response => response.text())
    .then(xmlString => mapFileContent = xmlString);
}

function buildWalls() {
    const mapDatas = MapReader.readMap(mapFileContent);

    mapDatas.blocks.forEach(blockData => {
        blocksObjects.push(new Block(blockData));
    });

    mapDatas.walls.forEach(wallPos => {
        wallsObjects.push(new Wall(wallPos[0], wallPos[1]));
    });

    mapDatas.backgrounds.forEach(data => {
        backgrounds.push(new Background(data.x, data.y, data.width, data.height));
    });
}

export function getWallIntersectionForBbox(segmentToTest, bbox) {
    const collisionSegments = MapPartition.getCollisionSegmentsForBbox(bbox);

    return collisionSegments.map(collisionSegment => {
        const intersection = Utils.segmentIntersection(
            segmentToTest[0].x,
            segmentToTest[0].y,
            segmentToTest[1].x,
            segmentToTest[1].y,
            
            collisionSegment.startPos.x,
            collisionSegment.startPos.y,
            collisionSegment.endPos.x,
            collisionSegment.endPos.y,
        );

        if (intersection === null) {
            return null;
        }

        return {
            intersection: intersection,
            wall: collisionSegment,
            distance: Utils.distance(segmentToTest[0], intersection),
        }
    })
    .filter(hit => hit !== null)
    .sort((hitA, hitB) => Math.sign(hitA.distance - hitB.distance))
    .shift();
}

export function getWallIntersectionToCircle(posX, posY, diameter, bbox) {
    const collisionSegments = MapPartition.getCollisionSegmentsForBbox(bbox);

    return collisionSegments.some(collisionSegment => {
        const distance = Utils.circleDistFromLineSeg(
            posX,
            posY,
            collisionSegment.startPos.x,
            collisionSegment.startPos.y,
            collisionSegment.endPos.x,
            collisionSegment.endPos.y,
        );

        if (distance > diameter) {
            return false;
        }

        return true;
    });
}

function buildWallsMesh() {
    let facesIndex = 0;
    const faces = [];
    const positions = [];
    const uvValues = [];
    const width = 10;
    const zPosFront = 10;
    const zPosBack = -50;

    wallsObjects.forEach(wall => {
        const borderAngle = wall.angle * -1;
        const offsetX = Math.sin(borderAngle) * width;
        const offsetY = Math.cos(borderAngle) * width;

        positions.push(
            //FACE
            wall.startPos.x - offsetX,
            wall.startPos.y - offsetY,
            zPosFront,

            wall.startPos.x + offsetX,
            wall.startPos.y + offsetY,
            zPosFront,

            wall.endPos.x + offsetX,
            wall.endPos.y + offsetY,
            zPosFront,

            wall.endPos.x - offsetX,
            wall.endPos.y - offsetY,
            zPosFront,


            // BORDERS
            wall.startPos.x - offsetX,
            wall.startPos.y - offsetY,
            zPosFront,

            wall.startPos.x - offsetX,
            wall.startPos.y - offsetY,
            zPosBack,

            wall.startPos.x + offsetX,
            wall.startPos.y + offsetY,
            zPosFront,

            wall.startPos.x + offsetX,
            wall.startPos.y + offsetY,
            zPosBack,



            wall.startPos.x + offsetX,
            wall.startPos.y + offsetY,
            zPosFront,

            wall.startPos.x + offsetX,
            wall.startPos.y + offsetY,
            zPosBack,

            wall.endPos.x + offsetX,
            wall.endPos.y + offsetY,
            zPosFront,

            wall.endPos.x + offsetX,
            wall.endPos.y + offsetY,
            zPosBack,



            wall.endPos.x + offsetX,
            wall.endPos.y + offsetY,
            zPosFront,

            wall.endPos.x + offsetX,
            wall.endPos.y + offsetY,
            zPosBack,

            wall.endPos.x - offsetX,
            wall.endPos.y - offsetY,
            zPosFront,

            wall.endPos.x - offsetX,
            wall.endPos.y - offsetY,
            zPosBack,



            wall.endPos.x - offsetX,
            wall.endPos.y - offsetY,
            zPosFront,

            wall.endPos.x - offsetX,
            wall.endPos.y - offsetY,
            zPosBack,

            wall.startPos.x - offsetX,
            wall.startPos.y - offsetY,
            zPosFront,

            wall.startPos.x - offsetX,
            wall.startPos.y - offsetY,
            zPosBack,
        );

        const uvHor = 0.5;
        const uvVert = wall.length / 20;

        uvValues.push(
            // FACE
            0, 0,
            uvHor, 0,
            uvHor, uvVert,
            0, uvVert,

            // BORDERS
            uvHor, 0,
            uvHor, 0.9,
            1, 0,
            1, 0.9,

            uvHor, 0,
            uvHor, 0.9,
            1, 0,
            1, 0.9,

            uvHor, 0,
            uvHor, 0.9,
            1, 0,
            1, 0.9,

            uvHor, 0,
            uvHor, 0.9,
            1, 0,
            1, 0.9,
        );

        faces.push(
            facesIndex + 3,
            facesIndex + 1,
            facesIndex + 0,

            facesIndex + 3,
            facesIndex + 2,
            facesIndex + 1,


            // TOP, OK
            facesIndex + 4,
            facesIndex + 7,
            facesIndex + 5,

            facesIndex + 4,
            facesIndex + 6,
            facesIndex + 7,

            
            // BOTTOM, OK
            facesIndex + 8,
            facesIndex + 10,
            facesIndex + 9,
            
            facesIndex + 9,
            facesIndex + 10,
            facesIndex + 11,
            
            // RIGHT, OK
            facesIndex + 12,
            facesIndex + 14,
            facesIndex + 13,
            
            facesIndex + 13,
            facesIndex + 14,
            facesIndex + 15,
            
            // LEFT, OK
            facesIndex + 17,
            facesIndex + 16,
            facesIndex + 19,

            facesIndex + 19,
            facesIndex + 16,
            facesIndex + 18,
        );

        facesIndex += 20;
    });

    const vertices = new Float32Array(positions);
    const uvCoords = new Float32Array(uvValues);
    const geometry = new BufferGeometry();
    geometry.setIndex(faces);
    geometry.setAttribute('position', new BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new BufferAttribute(uvCoords, 2));
    geometry.computeVertexNormals();

    const wallsMesh = new Mesh(geometry, wallMaterial);
    Render.add(wallsMesh);
}

function buildBlocksMesh() {
    let facesIndex = 0;
    let groupIndex = 0;
    const faces = [];
    const positions = [];
    const uvValues = [];
    const zPosFront = 5;
    const zPosBack = -50;

    const facesGroups = [];

    blocksObjects.forEach(block => {

        block.points.forEach(point => {
            positions.push(
                point.x,
                point.y,
                zPosFront,
            );
        });

        const pointsLength = block.points.length;
        for (let i = 0; i < pointsLength; i ++) {
            const nextIndex = (i + 1) % pointsLength;
            positions.push(
                block.points[i].x,
                block.points[i].y,
                zPosFront,

                block.points[i].x,
                block.points[i].y,
                zPosBack,

                block.points[nextIndex].x,
                block.points[nextIndex].y,
                zPosFront,

                block.points[nextIndex].x,
                block.points[nextIndex].y,
                zPosBack,
            );
        }

        const uvHor = block.bbox.width / 100;
        const uvVert = block.bbox.height / 100;

        uvValues.push(
            // FACE
            0, 0,
            uvHor, 0,
            uvHor, uvVert,
            0, uvVert,

            // BORDERS
            0.5, 0,
            0.5, 1,
            1, 0,
            1, 1,

            0.5, 0,
            0.5, 1,
            1, 0,
            1, 1,

            0.5, 0,
            0.5, 1,
            1, 0,
            1, 1,

            0.5, 0,
            0.5, 1,
            1, 0,
            1, 1,
        );

        faces.push(
            facesIndex + 3,
            facesIndex + 1,
            facesIndex + 0,

            facesIndex + 3,
            facesIndex + 2,
            facesIndex + 1,


            // TOP, OK
            facesIndex + 4,
            facesIndex + 7,
            facesIndex + 5,

            facesIndex + 4,
            facesIndex + 6,
            facesIndex + 7,

            
            // BOTTOM, OK
            facesIndex + 8,
            facesIndex + 10,
            facesIndex + 9,
            
            facesIndex + 9,
            facesIndex + 10,
            facesIndex + 11,
            
            // RIGHT, OK
            facesIndex + 12,
            facesIndex + 14,
            facesIndex + 13,
            
            facesIndex + 13,
            facesIndex + 14,
            facesIndex + 15,
            
            // LEFT, OK
            facesIndex + 17,
            facesIndex + 16,
            facesIndex + 19,

            facesIndex + 19,
            facesIndex + 16,
            facesIndex + 18,
        );

        facesGroups.push({
            index: colorToMaterialIndex[block.color],
            start: groupIndex,
            count: 6,
        });
        facesGroups.push({
            index: 0,
            start: groupIndex + 6,
            count: 24,
        });

        groupIndex += 30;
        facesIndex += 20;
    });


    const vertices = new Float32Array(positions);
    const uvCoords = new Float32Array(uvValues);
    const geometry = new BufferGeometry();
    geometry.setIndex(faces);
    geometry.setAttribute('position', new BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new BufferAttribute(uvCoords, 2));
    geometry.computeVertexNormals();

    facesGroups.forEach(group => {
        geometry.addGroup(group.start, group.count, group.index);
    });

    // const wallsMesh = new Mesh(geometry, woodenBoxMaterial);
    const wallsMesh = new Mesh(geometry, [wallMaterial, woodenBoxMaterial, tilesMaterial]);
    Render.add(wallsMesh);
}

function buildBackgroundMesh() {
    let facesIndex = 0;
    const faces = [];
    const positions = [];
    const uvValues = [];
    const zPos = -50;

    backgrounds.forEach(background => {
        positions.push(
            background.x,
            background.y,
            zPos,

            background.x + background.width,
            background.y,
            zPos,

            background.x + background.width,
            background.y + background.height,
            zPos,

            background.x,
            background.y + background.height,
            zPos,
        );

        const uvHor = background.width / 300;
        const uvVert = background.height / 300;

        uvValues.push(
            0, 0,
            uvHor, 0,
            uvHor, uvVert,
            0, uvVert,
        );

        faces.push(
            facesIndex + 3,
            facesIndex + 0,
            facesIndex + 1,

            facesIndex + 3,
            facesIndex + 1,
            facesIndex + 2,
        );
        facesIndex += 4;
    });

    const vertices = new Float32Array(positions);
    const uvCoords = new Float32Array(uvValues);
    const geometry = new BufferGeometry();
    geometry.setIndex(faces);
    geometry.setAttribute('position', new BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new BufferAttribute(uvCoords, 2));
    geometry.computeVertexNormals();

    const backgroundMesh = new Mesh(geometry, backgroundMaterial);
    Render.add(backgroundMesh);
}

class Wall {
    constructor(startPos, endPos) {
        this.startPos = startPos;
        this.endPos = endPos;
        this.collisionSegments = [
            new CollisionSegment(startPos, endPos),
        ];
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

    getCollisionSegments() {
        return this.collisionSegments;
    }
}

class Background {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

class Block {
    constructor(blockDatas) {
        this.color = blockDatas.color;
        this.points = blockDatas.positions.map(coord => coord[0]);
        this.collisionSegments = blockDatas.positions.map(coord => new CollisionSegment(coord[0], coord[1]));

        // const minX = 9999;
        const minX = this.points.reduce((min, point) => Math.min(min, point.x), 9999);
        const maxX = this.points.reduce((max, point) => Math.max(max, point.x), -9999);
        const minY = this.points.reduce((min, point) => Math.min(min, point.y), 9999);
        const maxY = this.points.reduce((max, point) => Math.max(max, point.y), -9999);
        
        this.bbox = new Bbox(
            minX,
            maxX,
            minY,
            maxY,
        );
    }

    getCollisionSegments() {
        return this.collisionSegments;
    }
}

class CollisionSegment {
    constructor(startPos, endPos) {
        this.startPos = startPos;
        this.endPos = endPos;
    }
}