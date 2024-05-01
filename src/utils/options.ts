// speedOptions.js

interface SpeedProp {
    [key: string]: { velocityX: number; velocityY: number };
}

const speedOptions: SpeedProp = {
    slow: { velocityX: 0.5, velocityY: 1.5 },
    medium: { velocityX: 3, velocityY: 2 },
    fast: { velocityX: 2, velocityY: 3 },
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
