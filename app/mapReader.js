const xmlStr = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0" version="26.2.14">
  <diagram name="Page-1" id="oaiojxD-bhNCNoSCnSg8">
    <mxGraphModel dx="2540" dy="921" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="jW96_MvzYQ0nQ_D2zLdU-1" value="" style="endArrow=none;html=1;rounded=0;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="-200" y="360" as="sourcePoint" />
            <mxPoint x="440" y="360" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="jW96_MvzYQ0nQ_D2zLdU-2" value="" style="endArrow=none;html=1;rounded=0;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="-200" y="360" as="sourcePoint" />
            <mxPoint x="-201" y="40" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="jW96_MvzYQ0nQ_D2zLdU-4" value="" style="endArrow=none;html=1;rounded=0;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="-80" y="280" as="sourcePoint" />
            <mxPoint x="160" y="200" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="jW96_MvzYQ0nQ_D2zLdU-5" value="" style="endArrow=none;html=1;rounded=0;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="-200" y="410" as="sourcePoint" />
            <mxPoint x="1100" y="410" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="jW96_MvzYQ0nQ_D2zLdU-6" value="" style="endArrow=none;html=1;rounded=0;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="600" y="360" as="sourcePoint" />
            <mxPoint x="600" y="40" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="jW96_MvzYQ0nQ_D2zLdU-7" value="" style="endArrow=none;html=1;rounded=0;" edge="1" parent="1">
          <mxGeometry width="50" height="50" relative="1" as="geometry">
            <mxPoint x="-200" y="40" as="sourcePoint" />
            <mxPoint x="600" y="40" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="jW96_MvzYQ0nQ_D2zLdU-10" value="" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="990" y="90" width="80" height="250" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>

`;

export function readMap() {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, "application/xml");

    const walls = [];

    [...doc.getElementsByTagName('mxGeometry')].forEach(geometry => {
        const wall = [];
        const mxPoints = [...geometry.getElementsByTagName('mxPoint')];
        if (mxPoints.length > 0) {
            wall.push(...readLine(mxPoints));
            walls.push(wall);
        } else {
            walls.push(...readBox(geometry));
        }
    })

    console.log(walls);
    return walls;
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

function readLine(mxPoints) {
    return mxPoints.map(point => {
        return {
            x: parseFloat(point.getAttribute('x')),
            y: 0 - parseFloat(point.getAttribute('y')),
        };
    });
}

