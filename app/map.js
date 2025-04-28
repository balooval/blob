import * as Utils from './utils.js';
import * as MapPartition from './mapPartition.js';
import Bbox from './bbox.js';
import * as MapReader from './mapReader.js';
import * as BlocksBuilder from './map/blocksBuilder.js';
import * as BackgroundBuilder from './map/backgroundBuilder.js';
import * as WallsBuilder from './map/wallsBuilder.js';
import * as Render from './render3d.js';
import * as Debug from './debug.js';

const wallsObjects = [];
const blocksObjects = [];
const backgrounds = [];
const fogZones = [];
let playerPosition = [0, -100];

let mapFileContent = '';


export function getStartPosition() {
  return playerPosition;
}

export function loadMap() {
    return fetch('./assets/map.drawio.xml')
    .then(response => response.text())
    .then(xmlString => mapFileContent = xmlString);
}

export function init() {
    BackgroundBuilder.init();
    buildWalls();
    WallsBuilder.buildWallsMesh(wallsObjects);
    BlocksBuilder.buildBlocksMesh(blocksObjects);
    BackgroundBuilder.buildBackgroundMesh(backgrounds);
    MapPartition.buildGrid([...wallsObjects, ...blocksObjects], fogZones);
}

function buildWalls() {
    const mapDatas = MapReader.readMap(mapFileContent);
    playerPosition = mapDatas.playerPosition;


    // mapDatas.fogZones.forEach(fogZoneData => {
    //     fogZones.push(new FogZone(fogZoneData));
    // });

    mapDatas.blocks.forEach(blockData => {
        blocksObjects.push(new Block(blockData));
    });

    mapDatas.walls.forEach(wallDatas => {
        wallsObjects.push(new Wall(wallDatas));
    });

    mapDatas.backgrounds.forEach(data => {
        backgrounds.push(new Background(data));
    });
}


export function getFogZoneIntersectionForBbox(bbox) {
    const fogZones = MapPartition.getFogZonesForBbox(bbox);

    return fogZones
    .filter(fogZone => fogZone.isOpaque === true)
    .filter(fogZone => fogZone.bbox.intersect(bbox));
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

class Wall {
    constructor(data) {
        this.type = WallsBuilder.getColorType(data.color);
        this.startPos = data.positions[0];
        this.endPos = data.positions[1];
        this.collisionSegments = [];

        if (this.type === WallsBuilder.TYPE_WALL) {
            this.collisionSegments.push(new CollisionSegment(this.startPos, this.endPos));
        }

        this.length = Utils.distance(this.startPos, this.endPos);
        this.angle = Math.atan2(this.endPos.y - this.startPos.y, this.endPos.x - this.startPos.x);
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
    constructor(data) {
        this.x = data.x;
        this.y = data.y;
        this.width = data.width;
        this.height = data.height;
        this.type = BackgroundBuilder.getColorType(data.color);
    }
}

class FogZone {
    constructor(data) {
        this.x = data.x;
        this.y = data.y;
        this.width = data.width;
        this.height = data.height;

        this.isOpaque = true;

        this.bbox = new Bbox(
            this.x,
            this.x + this.width,
            this.y,
            this.y + this.height,
        );

        this.mesh = BackgroundBuilder.buildMeshType(BackgroundBuilder.TYPE_DEBUG, [this]);
        Render.add(this.mesh);
    }
    
    dissolve() {
        this.isOpaque = false;
        Render.remove(this.mesh);
    }
}

class Block {
    constructor(blockDatas) {
        this.width = blockDatas.width;
        this.height = blockDatas.height;
        this.type = BlocksBuilder.getColorType(blockDatas.color);
        
        this.points = blockDatas.positions.map(coord => coord[0]);
        this.collisionSegments = blockDatas.positions.map(coord => new CollisionSegment(coord[0], coord[1]));

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