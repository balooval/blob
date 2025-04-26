import {
    BufferAttribute,
    BufferGeometry,
    Mesh,
    MeshBasicMaterial,
    MeshPhysicalMaterial
} from "../../vendor/three.module.js";
import * as Render from '../render3d.js';
import * as ImageLoader from '../ImageLoader.js';

const TYPE_WOODEN_BOX = 'TYPE_WOODEN_BOX';
const TYPE_WALL_TILE = 'TYPE_WALL_TILE';
const sideMaterial = new MeshBasicMaterial({color: '#ffffff'});
const woodenBoxMaterial = new MeshBasicMaterial({color: '#ffffff'});
const tilesMaterial = new MeshBasicMaterial({color: '#ffffff'});

const colorsTypes = {
    '#f8cecc': TYPE_WOODEN_BOX,
    '#dae8fc': TYPE_WALL_TILE,
};

const typesProps = {
    TYPE_WOODEN_BOX: {
        zPosFront: 4,
        zPosBack: -20,
        frontMaterial: woodenBoxMaterial,
        sideMaterial: woodenBoxMaterial,
    },
    TYPE_WALL_TILE: {
        zPosFront: 6,
        zPosBack: -50,
        frontMaterial: tilesMaterial,
        sideMaterial: sideMaterial,
    },
};

export function getColorType(color) {
    return colorsTypes[color];
}

export function buildBlocksMesh(blocksObjects) {
    sideMaterial.map = ImageLoader.get('side');
    woodenBoxMaterial.map = ImageLoader.get('wodden-box');
    tilesMaterial.map = ImageLoader.get('tiles');

    const blocsByType = blocksObjects.reduce((res, block) => {
        res[block.type] = res[block.type] ?? [];
        res[block.type].push(block);
        return res;
    }, {});
    
    
    for (const type in blocsByType) {
        const mesh = buildMeshType(type, blocsByType[type]);
        Render.add(mesh);
    }
}

function buildMeshType(type, blocks) {
    const typeProp = typesProps[type];
    
    let facesIndex = 0;
    let groupIndex = 0;
    const faces = [];
    const positions = [];
    const uvValues = [];
    const facesGroups = [];

    blocks.forEach(block => {

        block.points.forEach(point => {
            positions.push(
                point.x,
                point.y,
                typeProp.zPosFront,
            );
        });

        const pointsLength = block.points.length;

        for (let i = 0; i < pointsLength; i ++) {
            const nextIndex = (i + 1) % pointsLength;
            positions.push(
                block.points[i].x,
                block.points[i].y,
                typeProp.zPosFront,

                block.points[i].x,
                block.points[i].y,
                typeProp.zPosBack,

                block.points[nextIndex].x,
                block.points[nextIndex].y,
                typeProp.zPosFront,

                block.points[nextIndex].x,
                block.points[nextIndex].y,
                typeProp.zPosBack,
            );
        }

        const uvHor = block.width / 100;
        const uvVert = block.height / 100;
        const maxUvVert = 0.99;

        uvValues.push(
            // FACE
            0, 0,
            uvHor, 0,
            uvHor, uvVert,
            0, uvVert,

            // BORDERS
            0, 0,
            0, maxUvVert,
            uvHor, 0,
            uvHor, maxUvVert,

            0, 0,
            0, maxUvVert,
            uvVert, 0,
            uvVert, maxUvVert,

            0, 0,
            0, maxUvVert,
            uvHor, 0,
            uvHor, maxUvVert,

            0, 0,
            0, maxUvVert,
            uvVert, 0,
            uvVert, maxUvVert,
        );

        faces.push(
            facesIndex + 3,
            facesIndex + 1,
            facesIndex + 0,

            facesIndex + 3,
            facesIndex + 2,
            facesIndex + 1,

            // TOP
            facesIndex + 4,
            facesIndex + 7,
            facesIndex + 5,

            facesIndex + 4,
            facesIndex + 6,
            facesIndex + 7,

            
            // BOTTOM
            facesIndex + 8,
            facesIndex + 10,
            facesIndex + 9,
            
            facesIndex + 9,
            facesIndex + 10,
            facesIndex + 11,
            
            // RIGHT
            facesIndex + 12,
            facesIndex + 14,
            facesIndex + 13,
            
            facesIndex + 13,
            facesIndex + 14,
            facesIndex + 15,
            
            // LEFT
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