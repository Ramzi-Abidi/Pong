// speedOptions.js

interface SpeedProp {
    [key: string]: { velocityX: number; velocityY: number };
}

const speedOptions: SpeedProp = {
    slow: { velocityX: 3.5, velocityY: 2 },
    medium: { velocityX: 3.75, velocityY: 2.25 },
    fast: { velocityX: 4, velocityY: 3.25 },
};

export { speedOptions };

interface PointsProp {
    [key: number]: { points: number };
}

const pointsOptions: PointsProp = {
    5: { points: 5 },
    10: { points: 10 },
    15: { points: 15 },
};

export { pointsOptions };
