import Bbox from './bbox.js';

const cellSize = 200;
const cells = [];
let mapBbox;

export function buildGrid(walls) {
    mapBbox = getMapBBox(walls);
    createCells(walls);
}

export function getWallsForBbox(bbox) {
    return [...new Set(
        cells
        .filter(cell => cell.bbox.intersectBBox(bbox))
        .map(cell => cell.walls)
        .flat()
    )];
}

function createCells(walls) {
    const horCount = Math.ceil(mapBbox.width / cellSize);
    const vertCount = Math.ceil(mapBbox.height / cellSize);

    for (let x = 0; x < horCount; x ++) {
        for (let y = 0; y < vertCount; y ++) {
            const cell = new Cell(mapBbox.left + x * cellSize, mapBbox.bottom + y * cellSize);
            cell.addWalls(walls);
            cells.push(cell);
        }
    }
}

function getMapBBox(walls) {
    const bbox = new Bbox(9999, -9999, 9999, -9999);
    walls.forEach(wall => bbox.resize(wall.bbox));

    return bbox;
}

class Cell {
    constructor(x, y) {
        this.bbox = new Bbox(x, x + cellSize, y, y + cellSize);
        this.walls = [];
    }

    addWalls(walls) {
        this.walls = walls.filter(wall => this.bbox.intersectBBox(wall.bbox));
    }
}