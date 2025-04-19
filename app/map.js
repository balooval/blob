export const walls = [];

const wallsPositions = [
    [
        {x: -250, y: -250},
        {x: 350, y: -200},
    ],
    [
        {x: 300, y: -300},
        {x: 300, y: 300},
    ],
    [
        {x: -300, y: -300},
        {x: -300, y: 150},
    ],
    [
        {x: -300, y: 150},
        {x: 200, y: 50},
    ],
    [
        {x: -400, y: 200},
        {x: 400, y: 200},
    ],
];

wallsPositions.forEach(wallPos => {
    const angle = Math.atan2(wallPos[1].y - wallPos[0].y, wallPos[1].x - wallPos[0].x);
    walls.push({
        angle: angle,
        direction: [Math.cos(angle), Math.sin(angle)],
        positions: wallPos
    });
});