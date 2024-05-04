// speedOptions.js

interface SpeedProp {
    [key: string]: { velocityX: number; velocityY: number };
}

const speedOptions: SpeedProp = {
    slow: { velocityX: 2.5, velocityY: 1 },
    medium: { velocityX: 2.75, velocityY: 1.25 },
    fast: { velocityX: 3, velocityY: 2.25 },
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
