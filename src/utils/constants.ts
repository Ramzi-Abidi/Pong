export const GAME_CONFIG = {
    BOARD_WIDTH: 600,
    BOARD_HEIGHT: 400,
    PLAYER_WIDTH: 10,
    PLAYER_HEIGHT: 50,
    BALL_SIZE: 10,
    PLAYER_VELOCITY: 3,
    AI_VELOCITY: 2,
    PLAYER_OFFSET: 2,
} as const;

export const COLORS = {
    PLAYER: "skyBlue",
    BALL: "#fff",
    CENTER_LINE: "skyBlue",
    CENTER_LINE_MULTIPLAYER: "#15b7cd",
} as const;

export const AUDIO_VOLUMES = {
    HIT: 0.18,
    GOAL: 0.18,
    BACKGROUND: 0.02,
} as const;
