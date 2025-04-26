
export function readMap(mapFileContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(mapFileContent, "application/xml");

    const datas = {
      walls: [],
      backgrounds: [],
      blocks: [],
    }
    const walls = [];

    [...doc.getElementsByTagName('mxCell')].forEach(cell => {
        const geometry = [...cell.getElementsByTagName('mxGeometry')].pop();
        if (!geometry) {
          return;
        }
        const wall = [];
        // const mxPoints = [...geometry.getElementsByTagName('mxPoint')];
        const mxPoints = readLinePoints(geometry);
        
        if (mxPoints.length > 0) {
            datas.walls.push(...readLine(mxPoints));
        } else {
          const hasWalls = getStyleValue(cell, 'strokeColor') !== 'none';
          const color = getStyleValue(cell, 'fillColor');
          
          if (hasWalls === true) {
            const block = {
              positions: readBox(geometry),
              color: color,
            };
            datas.blocks.push(block);
            // datas.walls.push(...readBox(geometry));
            // datas.backgrounds.push(readBackground(geometry));
          } else {
            datas.backgrounds.push(readBackground(geometry));
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

function readBox(geometry) {
    const x = parseFloat(geometry.getAttribute('x'));
    const y = 0 - parseFloat(geometry.getAttribute('y'));
    const width = parseFloat(geometry.getAttribute('width'));
    const height = parseFloat(geometry.getAttribute('height'));
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
    return [
      {
        x: parseFloat(currentPoint.getAttribute('x')),
        y: 0 - parseFloat(currentPoint.getAttribute('y')),
      },
      {
        x: parseFloat(nextPoint.getAttribute('x')),
        y: 0 - parseFloat(nextPoint.getAttribute('y')),
      },
    ];
    
});

  return mxPoints.map(point => {
      return {
          x: parseFloat(point.getAttribute('x')),
          y: 0 - parseFloat(point.getAttribute('y')),
      };
  });
}

