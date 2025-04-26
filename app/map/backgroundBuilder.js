import {
    BufferAttribute,
    BufferGeometry,
    Mesh,
    MeshBasicMaterial,
    MeshPhysicalMaterial
} from "../../vendor/three.module.js";
import * as Render from '../render3d.js';
import * as ImageLoader from '../ImageLoader.js';

const TYPE_A = 'TYPE_A';
const TYPE_LAB_A = 'TYPE_LAB_A';
const TYPE_LAB_B = 'TYPE_LAB_B';
const backgroundMaterial = new MeshBasicMaterial({color: '#909090'});
const labAMaterial = new MeshBasicMaterial({color: '#ffffff'});
const labBMaterial = new MeshBasicMaterial({color: '#ffffff'});

const typesProps = {
    TYPE_A: {
        zPosBack: -50,
        frontMaterial: backgroundMaterial,
        scaleX: 300,
        scaleY: 300,
    },
    TYPE_LAB_A: {
        zPosBack: -50,
        frontMaterial: labAMaterial,
        scaleX: 500,
        scaleY: 300,
    },
    TYPE_LAB_B: {
        zPosBack: -50,
        frontMaterial: labBMaterial,
        scaleX: 500,
        scaleY: 300,
    },
};

const colorsTypes = {
    '#f5f5f5': TYPE_A,
    '#60a917': TYPE_LAB_A,
    '#d5e8d4': TYPE_LAB_B,
};

export function getColorType(color) {
    // console.log(color);
    
    return colorsTypes[color];
}

export function buildBackgroundMesh(backgrounds) {
    backgroundMaterial.map = ImageLoader.get('background');
    labBMaterial.map = ImageLoader.get('scifi-lab');
    labAMaterial.map = ImageLoader.get('background-labo-a');

    const backgroundsByType = backgrounds.reduce((res, background) => {
        res[background.type] = res[background.type] ?? [];
        res[background.type].push(background);
        return res;
    }, {});

    for (const type in backgroundsByType) {
        const mesh = buildMeshType(type, backgroundsByType[type]);
        Render.add(mesh);
    }
}

export function buildMeshType(type, backgrounds) {
    const typeProp = typesProps[type];

    let facesIndex = 0;
    const faces = [];
    const positions = [];
    const uvValues = [];

    backgrounds.forEach(background => {
        positions.push(
            background.x,
            background.y,
            typeProp.zPosBack,

            background.x + background.width,
            background.y,
            typeProp.zPosBack,

            background.x + background.width,
            background.y + background.height,
            typeProp.zPosBack,

            background.x,
            background.y + background.height,
            typeProp.zPosBack,
        );

        const uvHor = background.width / typeProp.scaleX;
        const uvVert = background.height / typeProp.scaleY;

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

    return new Mesh(geometry, typeProp.frontMaterial);
}
