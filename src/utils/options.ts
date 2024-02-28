// speedOptions.js

interface SpeedProp {
  [key: string]: { velocityX: number; velocityY: number };
}

const speedOptions : SpeedProp = {
  slow: { velocityX: 0.5, velocityY: 1.5 },
  medium: { velocityX: 1, velocityY: 2 },
  fast: { velocityX: 2, velocityY: 3 }
};

export {speedOptions};

interface PointsProp {
  [key: number]: { points: number};
}

const pointsOptions : PointsProp = {
  5: { points: 5},
  10: { points: 10},
  15: { points: 15}
};

export { pointsOptions };

interface ThemeProp {
  [key: string]: {
    background: string,
    paddles: string,
    ball: string
  }
}

const themeOptions : ThemeProp = {
  'classic' : {
    background: '#008000',
    paddles: '#FFFFFF',
    ball: '#FFA500'
  },
  'neon' : {
    background: '#000000',
    paddles: '#00FFFF',
    ball: '#FF69B4'
  },
  'retro' : {
    background: '#FFFF00',
    paddles: '#FF0000',
    ball: '#0000FF'
  }
}

export {themeOptions}