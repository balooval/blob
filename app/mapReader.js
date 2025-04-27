import * as Utils from './utils.js';


export function readMap(mapFileContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(mapFileContent, "application/xml");

    const datas = {
      walls: [],
      backgrounds: [],
      blocks: [],
      playerPosition: [0, -100],
    };

    [...doc.getElementsByTagName('mxCell')].forEach(cell => {
        const geometry = [...cell.getElementsByTagName('mxGeometry')].pop();
        if (!geometry) {
          return;
        }
        const wall = [];
        // const mxPoints = [...geometry.getElementsByTagName('mxPoint')];
        const mxPoints = readLinePoints(geometry);
        const shape = getStyleValue(cell, 'shape') ?? 'none';

        if (shape === 'umlActor') {
          datas.playerPosition[0] = Utils.lerpFloat(parseFloat(geometry.getAttribute('x')), parseFloat(geometry.getAttribute('x')) + parseFloat(geometry.getAttribute('width')), 0.5);
          datas.playerPosition[1] = 0 - Utils.lerpFloat(parseFloat(geometry.getAttribute('y')), parseFloat(geometry.getAttribute('y')) + parseFloat(geometry.getAttribute('height')), 0.5);
          return;
        }
        
        const color = getStyleValue(cell, 'fillColor') ?? 'none';
        
        if (mxPoints.length > 0) {
            // console.log(color);
            readLine(mxPoints).forEach(wall => {
              wall.color = color;
              datas.walls.push(wall);
            });
            
        } else {
          const hasWalls = getStyleValue(cell, 'strokeColor') !== 'none';
          const rotation = getStyleValue(cell, 'rotation') ?? 0;
          
          if (hasWalls === true) {
            const block = readBox(geometry, rotation);
            block.color = color;
            datas.blocks.push(block);
          } else {
            const background = readBackground(geometry);
            background.color = color;
            datas.backgrounds.push(background);
          }
        }
    })

    // debugger

    return datas;
}

function readLinePoints(geometry) {
  const mxPoints = [...geometry.getElementsByTagName('mxPoint')];
  
  
  if (mxPoints.length === 0) {
    return [];
  }
  const first = mxPoints.shift();
  const last = mxPoints.shift();

  const res = [
    first,
    ...mxPoints,
    last,
  ];

  return res;
}

function getStyleValue(element, prop) {
  const style = element.getAttribute('style');
  const parts = style.split(';');
  const props = parts.reduce((res, part) => {
    const pair = part.split('=');
    res[pair[0]] = pair[1];
    return res;
  }, {});

  return props[prop] ?? null;
}

function readBox(geometry, rotation) {
    const angle = Utils.radians(rotation) * -1;

    const x = parseFloat(geometry.getAttribute('x'));
    const y = 0 - parseFloat(geometry.getAttribute('y'));
    const width = parseFloat(geometry.getAttribute('width'));
    const height = parseFloat(geometry.getAttribute('height'));
    const centerX = Utils.lerpFloat(x, x + width, 0.5);
    const centerY = Utils.lerpFloat(y, y - height, 0.5);
    const marginHor = width / 2;
    const marginVert = height / 2;
    
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    // const borderAngle = wall.angle * -1;
    const topLeftX = Math.round(centerX - (cos * marginHor) - (sin * marginVert));
    const topLeftY = Math.round(centerY - (sin * marginHor) + (cos * marginVert));
    const topRightX = Math.round(centerX + (cos * marginHor) - (sin * marginVert));
    const topRightY = Math.round(centerY + (sin * marginHor) + (cos * marginVert));
    const bottomLeftX = Math.round(centerX - (cos * marginHor) + (sin * marginVert));
    const bottomLeftY = Math.round(centerY - (sin * marginHor) - (cos * marginVert));
    const bottomRightX = Math.round(centerX + (cos * marginHor) + (sin * marginVert));
    const bottomRightY = Math.round(centerY + (sin * marginHor) - (cos * marginVert));
    return {
      width: width,
      height: height,
      positions: [
        [
            {
                x: topLeftX,
                y: topLeftY,
            },
            {
                x: topRightX,
                y: topRightY,
            },
        ],
        [
            {
                x: topRightX,
                y: topRightY,
            },
            {
                x: bottomRightX,
                y: bottomRightY,
            },
        ],
        [
            {
                x: bottomRightX,
                y: bottomRightY,
            },
            {
                x: bottomLeftX,
                y: bottomLeftY,
            },
        ],
        [
            {
                x: bottomLeftX,
                y: bottomLeftY,
            },
            {
                x: topLeftX,
                y: topLeftY,
            },
        ],
      ],
    };

    return [
        [
            {
                x: x,
                y: y,
            },
            {
                x: x + width,
                y: y,
            },
        ],
        [
            {
                x: x + width,
                y: y,
            },
            {
                x: x + width,
                y: y - height,
            },
        ],
        [
            {
                x: x + width,
                y: y - height,
            },
            {
                x: x,
                y: y - height,
            },
        ],
        [
            {
                x: x,
                y: y - height,
            },
            {
                x: x,
                y: y,
            },
        ]
    ];
}
function readBackground(geometry) {
    const x = parseFloat(geometry.getAttribute('x'));
    const y = 0 - parseFloat(geometry.getAttribute('y'));
    const width = parseFloat(geometry.getAttribute('width'));
    const height = parseFloat(geometry.getAttribute('height'));
    return {
      x: x,
      y: y - height,
      width: width,
      height: height,
    };
}

function readLine(mxPoints) {
  let previousPoint = mxPoints.shift();

  return mxPoints.map(nextPoint => {
    const currentPoint = previousPoint;
    previousPoint = nextPoint;
    return {
      positions: [
        {
          x: parseFloat(currentPoint.getAttribute('x')),
          y: 0 - parseFloat(currentPoint.getAttribute('y')),
        },
        {
          x: parseFloat(nextPoint.getAttribute('x')),
          y: 0 - parseFloat(nextPoint.getAttribute('y')),
        },
      ],
    };
    
  });
}

