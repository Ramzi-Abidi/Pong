import { SpeedOption, TableTennisBall, TableTennisPaddle } from "./types";

export const TABLE_TENNIS_CONFIG = {
    BOARD_WIDTH: 340,
    BOARD_HEIGHT: 540,
    PADDLE_RADIUS: 20,
    BALL_RADIUS: 8,
    HANDLE_LENGTH: 42,
    RAIL_INSET: 8,
    HIT_WINDOW_MS: 200,
    SERVE_DELAY_MS: 800,
    SWING_OFFSET: 6,
} as const;

export const TABLE_TENNIS_COLORS = {
    PAGE: "#FFE56B",
    TABLE: "#FF8A70",
    BORDER: "#111111",
    NET: "#FFFFFF",
    CENTER_LINE: "rgba(255, 255, 255, 0.45)",
    SCORE: "rgba(255, 255, 255, 0.95)",
    BALL: "#FFFFFF",
} as const;

export const TABLE_TENNIS_SPEED: Record<
    SpeedOption,
    { ball: number; ai: number }
> = {
    [SpeedOption.SLOW]: { ball: 3.0, ai: 2.2 },
    [SpeedOption.MEDIUM]: { ball: 3.8, ai: 2.8 },
    [SpeedOption.FAST]: { ball: 5.0, ai: 3.6 },
};

export const clamp = (value: number, min: number, max: number) => {
    return Math.min(max, Math.max(min, value));
};

export const circlesOverlap = (
    ax: number,
    ay: number,
    ar: number,
    bx: number,
    by: number,
    br: number,
): boolean => {
    const dx = ax - bx;
    const dy = ay - by;
    const reach = ar + br;
    return dx * dx + dy * dy <= reach * reach;
};

export const getNetY = (): number => TABLE_TENNIS_CONFIG.BOARD_HEIGHT / 2;

export const clampPlayerPaddle = (paddle: TableTennisPaddle): void => {
    const { BOARD_WIDTH, BOARD_HEIGHT, PADDLE_RADIUS, RAIL_INSET } =
        TABLE_TENNIS_CONFIG;
    const netY = getNetY();

    paddle.x = clamp(
        paddle.x,
        PADDLE_RADIUS + RAIL_INSET,
        BOARD_WIDTH - PADDLE_RADIUS - RAIL_INSET,
    );
    paddle.y = clamp(
        paddle.y,
        netY + PADDLE_RADIUS + 10,
        BOARD_HEIGHT - TABLE_TENNIS_CONFIG.HANDLE_LENGTH - 8,
    );
};

export const clampAiPaddle = (paddle: TableTennisPaddle): void => {
    const { BOARD_WIDTH, PADDLE_RADIUS, RAIL_INSET } = TABLE_TENNIS_CONFIG;
    const netY = getNetY();

    paddle.x = clamp(
        paddle.x,
        PADDLE_RADIUS + RAIL_INSET,
        BOARD_WIDTH - PADDLE_RADIUS - RAIL_INSET,
    );
    paddle.y = clamp(
        paddle.y,
        PADDLE_RADIUS + RAIL_INSET,
        netY - PADDLE_RADIUS - 10,
    );
};

export const applyTableTennisHit = (
    ball: TableTennisBall,
    paddle: TableTennisPaddle,
    toward: "up" | "down",
    ballSpeed: number,
): void => {
    const offset = (ball.x - paddle.x) / paddle.radius;
    const maxVx = ballSpeed * 0.9;

    ball.vx = clamp(offset * ballSpeed * 0.65 + paddle.vx * 0.45, -maxVx, maxVx);
    ball.vy = toward === "up" ? -ballSpeed : ballSpeed;

    if (toward === "up" && paddle.vy < 0) {
        ball.vy -= Math.min(2.2, Math.abs(paddle.vy) * 0.35);
    } else if (toward === "down" && paddle.vy > 0) {
        ball.vy += Math.min(2.2, Math.abs(paddle.vy) * 0.35);
    }

    // Nudge the ball off the paddle so it cannot stick for a second hit
    const push = paddle.radius + ball.radius + 1;
    if (toward === "up") {
        ball.y = Math.min(ball.y, paddle.y - push);
    } else {
        ball.y = Math.max(ball.y, paddle.y + push);
    }
};

export const createPlayerPaddle = (): TableTennisPaddle => ({
    x: TABLE_TENNIS_CONFIG.BOARD_WIDTH / 2,
    y: TABLE_TENNIS_CONFIG.BOARD_HEIGHT - 90,
    radius: TABLE_TENNIS_CONFIG.PADDLE_RADIUS,
    vx: 0,
    vy: 0,
});

export const createAiPaddle = (): TableTennisPaddle => ({
    x: TABLE_TENNIS_CONFIG.BOARD_WIDTH / 2,
    y: 48,
    radius: TABLE_TENNIS_CONFIG.PADDLE_RADIUS,
    vx: 0,
    vy: 0,
});

export const createTableTennisBall = (): TableTennisBall => ({
    x: TABLE_TENNIS_CONFIG.BOARD_WIDTH / 2,
    y: TABLE_TENNIS_CONFIG.BOARD_HEIGHT / 2,
    radius: TABLE_TENNIS_CONFIG.BALL_RADIUS,
    vx: 0,
    vy: 0,
});
