// speedOptions.js

interface SpeedOptions {
  [key: string]: { velocityX: number; velocityY: number };
}

const speedOptions : SpeedOptions = {
  slow: { velocityX: 0.5, velocityY: 1.5 },
  medium: { velocityX: 1, velocityY: 2 },
  fast: { velocityX: 2, velocityY: 3 }
};

export default speedOptions;