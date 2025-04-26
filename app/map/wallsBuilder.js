import {
    BufferAttribute,
    BufferGeometry,
    Mesh,
    MeshBasicMaterial,
    MeshPhysicalMaterial
} from "../../vendor/three.module.js";
import * as Render from '../render3d.js';
import * as ImageLoader from '../ImageLoader.js';

export const TYPE_WALL = 'TYPE_A';
export const TYPE_GRID = 'TYPE_GRID';
const wallMaterial = new MeshBasicMaterial({color: '#ffffff'});
const sideMaterial = new MeshBasicMaterial({color: '#ffffff'});
const gridMaterial = new MeshBasicMaterial({color: '#ffffff', transparent: true});

const colorsTypes = {
    'none': TYPE_WALL,
    '#d5e8d4': TYPE_GRID,
};

const typesProps = {
    TYPE_A: {
        zPosFront: 10,
        zPosBack: -50,
        frontMaterial: wallMaterial,
        sideMaterial: sideMaterial,
        scaleX: 10,
        scaleY: 20,
    },
    TYPE_GRID: {
        zPosFront: 8,
        zPosBack: -50,
        frontMaterial: gridMaterial,
        sideMaterial: gridMaterial,
        scaleX: 50,
        scaleY: 50,
    },
};

export function getColorType(color) {
    return colorsTypes[color];
}

export function buildWallsMesh(walls) {
    sideMaterial.map = ImageLoader.get('side');
    wallMaterial.map = ImageLoader.get('wall');
    gridMaterial.map = ImageLoader.get('grid');

    const wallsByType = walls.reduce((res, wall) => {
        res[wall.type] = res[wall.type] ?? [];
        res[wall.type].push(wall);
        return res;
    }, {});

    console.log(wallsByType);
    
    
    
    for (const type in wallsByType) {
        const mesh = buildMeshType(type, wallsByType[type]);
        Render.add(mesh);
    }
}

function buildMeshType(type, walls) {
    const typeProp = typesProps[type];

    let facesIndex = 0;
    const faces = [];
    const positions = [];
    const uvValues = [];
    const width = 10;

    const facesGroups = [];
    let groupIndex = 0;

    walls.forEach(wall => {
        const borderAngle = wall.angle * -1;
        const offsetX = Math.sin(borderAngle) * width;
        const offsetY = Math.cos(borderAngle) * width;

        positions.push(
            //FACE
            wall.startPos.x - offsetX,
            wall.startPos.y - offsetY,
            typeProp.zPosFront,

            wall.startPos.x + offsetX,
            wall.startPos.y + offsetY,
            typeProp.zPosFront,

            wall.endPos.x + offsetX,
            wall.endPos.y + offsetY,
            typeProp.zPosFront,

            wall.endPos.x - offsetX,
            wall.endPos.y - offsetY,
            typeProp.zPosFront,


            // BORDERS
            wall.startPos.x - offsetX,
            wall.startPos.y - offsetY,
            typeProp.zPosFront,

            wall.startPos.x - offsetX,
            wall.startPos.y - offsetY,
            typeProp.zPosBack,

            wall.startPos.x + offsetX,
            wall.startPos.y + offsetY,
            typeProp.zPosFront,

            wall.startPos.x + offsetX,
            wall.startPos.y + offsetY,
            typeProp.zPosBack,



            wall.startPos.x + offsetX,
            wall.startPos.y + offsetY,
            typeProp.zPosFront,

            wall.startPos.x + offsetX,
            wall.startPos.y + offsetY,
            typeProp.zPosBack,

            wall.endPos.x + offsetX,
            wall.endPos.y + offsetY,
            typeProp.zPosFront,

            wall.endPos.x + offsetX,
            wall.endPos.y + offsetY,
            typeProp.zPosBack,



            wall.endPos.x + offsetX,
            wall.endPos.y + offsetY,
            typeProp.zPosFront,

            wall.endPos.x + offsetX,
            wall.endPos.y + offsetY,
            typeProp.zPosBack,

            wall.endPos.x - offsetX,
            wall.endPos.y - offsetY,
            typeProp.zPosFront,

            wall.endPos.x - offsetX,
            wall.endPos.y - offsetY,
            typeProp.zPosBack,



            wall.endPos.x - offsetX,
            wall.endPos.y - offsetY,
            typeProp.zPosFront,

            wall.endPos.x - offsetX,
            wall.endPos.y - offsetY,
            typeProp.zPosBack,

            wall.startPos.x - offsetX,
            wall.startPos.y - offsetY,
            typeProp.zPosFront,

            wall.startPos.x - offsetX,
            wall.startPos.y - offsetY,
            typeProp.zPosBack,
        );

        const uvHor = width / typeProp.scaleX;
        const uvVert = wall.length / typeProp.scaleY;

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

        facesGroups.push({
            index: 0,
            start: groupIndex,
            count: 6,
        });

        facesGroups.push({
            index: 1,
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

    return new Mesh(geometry, [typeProp.frontMaterial, typeProp.sideMaterial]);
}