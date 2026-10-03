import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import AudioComponent from "../components/Audio";
import backgroundMusic from "../assets/background-music.mp3";
import buttonClickSound from "../assets/button-click-sound.mp3";
import goalSound from "../assets/goal.mp3";
import hitSound from "../assets/Paddle Ball Hit Sound Effect HD.mp3";
import racketUrl from "../assets/table-tennis-racket.svg";
import { AUDIO_VOLUMES } from "../utils/constants";
import { pointsOptions } from "../utils/options";
import { useAppStore } from "../store/useAppStore";
import {
    applyTableTennisHit,
    circlesOverlap,
    clampAiPaddle,
    clampPlayerPaddle,
    createAiPaddle,
    createPlayerPaddle,
    createTableTennisBall,
    getNetY,
    TABLE_TENNIS_COLORS,
    TABLE_TENNIS_CONFIG,
    TABLE_TENNIS_SPEED,
} from "../utils/tableTennis";
import { score, TableTennisHitter } from "../utils/types";

const racketImage = new Image();
racketImage.src = racketUrl;

const TableTennisMode: React.FC = () => {
    const settings = useAppStore((state) => state.settings);
    const isSoundOn = useAppStore((state) => state.isSoundOn);
    const navigate = useNavigate();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const isPlayingRef = useRef(false);
    const isModalOpenRef = useRef(false);
    const isPointerDownRef = useRef(false);
    const swingUntilRef = useRef(0);
    const serveAtRef = useRef(0);
    const lastHitterRef = useRef<TableTennisHitter>(null);
    const playerNameRef = useRef("Player");

    const playerRef = useRef(createPlayerPaddle());
    const aiRef = useRef(createAiPaddle());
    const ballRef = useRef(createTableTennisBall());
    const scoreRef = useRef<score>({ 1: 0, 2: 0 });
    const winningNumberRef = useRef(pointsOptions[settings.pointOption].points);
    const speedOptionRef = useRef(settings.speedOption);

    const [isBlurry, setBlurry] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [playHit, setPlayHit] = useState(false);
    const [playGoal, setPlayGoal] = useState(false);
    const [isBackgroundMusicPlaying, setBackgroundMusicPlaying] = useState(false);

    const resetPaddles = useCallback((): void => {
        playerRef.current = createPlayerPaddle();
        aiRef.current = createAiPaddle();
    }, []);

    const resetScores = useCallback((): void => {
        scoreRef.current[1] = 0;
        scoreRef.current[2] = 0;
    }, []);

    const queueServe = useCallback((toward: "up" | "down"): void => {
        const ball = createTableTennisBall();
        ballRef.current = ball;
        lastHitterRef.current = null;
        serveAtRef.current = performance.now() + TABLE_TENNIS_CONFIG.SERVE_DELAY_MS;
        ballRef.current.vy = toward === "up" ? -1 : 1;
    }, []);

    const launchServe = useCallback((): void => {
        const speed = TABLE_TENNIS_SPEED[speedOptionRef.current].ball;
        const direction = ballRef.current.vy >= 0 ? 1 : -1;
        ballRef.current.x = TABLE_TENNIS_CONFIG.BOARD_WIDTH / 2;
        ballRef.current.y = TABLE_TENNIS_CONFIG.BOARD_HEIGHT / 2;
        ballRef.current.vx = (Math.random() - 0.5) * speed * 0.55;
        ballRef.current.vy = direction * speed;
        serveAtRef.current = 0;
    }, []);

    const win = useCallback(
        (winnerLabel: string): void => {
            isPlayingRef.current = false;
            setBlurry(true);
            setBackgroundMusicPlaying(false);
            isModalOpenRef.current = true;

            swal({
                title: `${winnerLabel} wins!`,
                text: "Ready for another rally?",
                buttons: {
                    home: "Go to Home",
                    star: "Star GitHub⭐",
                    play: "Play again",
                } as any,
                className: "btn",
            }).then((value) => {
                isModalOpenRef.current = false;
                if (value === "home") {
                    navigate("/");
                } else if (value === "play") {
                    resetScores();
                    resetPaddles();
                    queueServe("down");
                    setBlurry(false);
                    isPlayingRef.current = true;
                    setIsPaused(false);
                    setBackgroundMusicPlaying(true);
                } else {
                    window.open("https://github.com/Ramzi-Abidi/Pong", "_blank");
                    navigate("/");
                }
            });
        },
        [navigate, queueServe, resetPaddles, resetScores],
    );

    const pointerToCanvas = (
        event: React.PointerEvent<HTMLCanvasElement>,
    ): { x: number; y: number } => {
        const canvas = event.currentTarget;
        const rect = canvas.getBoundingClientRect();
        return {
            x: ((event.clientX - rect.left) * canvas.width) / rect.width,
            y: ((event.clientY - rect.top) * canvas.height) / rect.height,
        };
    };

    const movePlayerPaddle = (x: number, y: number): void => {
        const paddle = playerRef.current;
        paddle.vx = x - paddle.x;
        paddle.vy = y - paddle.y;
        paddle.x = x;
        paddle.y = y;
        clampPlayerPaddle(paddle);
    };

    const handlePointerDown = (
        event: React.PointerEvent<HTMLCanvasElement>,
    ): void => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        isPointerDownRef.current = true;
        swingUntilRef.current =
            performance.now() + TABLE_TENNIS_CONFIG.HIT_WINDOW_MS;
        const point = pointerToCanvas(event);
        movePlayerPaddle(point.x, point.y);
    };

    const handlePointerMove = (
        event: React.PointerEvent<HTMLCanvasElement>,
    ): void => {
        event.preventDefault();
        const point = pointerToCanvas(event);
        movePlayerPaddle(point.x, point.y);
    };

    const handlePointerUp = (
        event: React.PointerEvent<HTMLCanvasElement>,
    ): void => {
        event.preventDefault();
        isPointerDownRef.current = false;
        playerRef.current.vx = 0;
        playerRef.current.vy = 0;
    };

    const updateAi = (now: number): void => {
        const ai = aiRef.current;
        const ball = ballRef.current;
        const aiSpeed = TABLE_TENNIS_SPEED[speedOptionRef.current].ai;
        const comingTowardAi = ball.vy < 0;
        const aimJitter =
            speedOptionRef.current === "slow"
                ? 16
                : speedOptionRef.current === "medium"
                  ? 7
                  : 2;
        const targetX = comingTowardAi
            ? ball.x + Math.sin(now / 180) * aimJitter
            : TABLE_TENNIS_CONFIG.BOARD_WIDTH / 2;
        const targetY = comingTowardAi
            ? Math.max(ai.radius + 12, ball.y - 18)
            : 48;

        const dx = targetX - ai.x;
        const dy = targetY - ai.y;
        const distance = Math.hypot(dx, dy) || 1;
        const step = Math.min(aiSpeed, distance);
        ai.vx = (dx / distance) * step;
        ai.vy = (dy / distance) * step;
        ai.x += ai.vx;
        ai.y += ai.vy;
        clampAiPaddle(ai);
    };

    const drawPaddle = (
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        handleDir: "up" | "down",
        swinging: boolean,
    ): void => {
        const swingShift = swinging
            ? handleDir === "down"
                ? -TABLE_TENNIS_CONFIG.SWING_OFFSET
                : TABLE_TENNIS_CONFIG.SWING_OFFSET
            : 0;
        if (!racketImage.complete || racketImage.naturalWidth === 0) {
            return;
        }

        const { PADDLE_RADIUS, HANDLE_LENGTH } = TABLE_TENNIS_CONFIG;
        context.save();
        context.translate(x, y + swingShift);
        if (handleDir === "up") {
            context.rotate(Math.PI);
        }
        context.shadowColor = "rgba(0, 0, 0, 0.25)";
        context.shadowBlur = 3;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.drawImage(
            racketImage,
            -PADDLE_RADIUS,
            -PADDLE_RADIUS,
            PADDLE_RADIUS * 2,
            PADDLE_RADIUS + HANDLE_LENGTH,
        );
        context.restore();
    };

    const drawScene = (
        context: CanvasRenderingContext2D,
        playerSwinging: boolean,
        aiSwinging: boolean,
    ): void => {
        const { BOARD_WIDTH, BOARD_HEIGHT, BALL_RADIUS } = TABLE_TENNIS_CONFIG;
        const netY = getNetY();
        const player = playerRef.current;
        const ai = aiRef.current;
        const ball = ballRef.current;

        context.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
        context.fillStyle = TABLE_TENNIS_COLORS.TABLE;
        context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

        context.strokeStyle = TABLE_TENNIS_COLORS.CENTER_LINE;
        context.lineWidth = 2;
        context.setLineDash([6, 8]);
        context.beginPath();
        context.moveTo(BOARD_WIDTH / 2, 12);
        context.lineTo(BOARD_WIDTH / 2, BOARD_HEIGHT - 12);
        context.stroke();
        context.setLineDash([]);

        context.strokeStyle = TABLE_TENNIS_COLORS.NET;
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(0, netY);
        context.lineTo(BOARD_WIDTH, netY);
        context.stroke();

        context.fillStyle = TABLE_TENNIS_COLORS.SCORE;
        context.font = "bold 56px sans-serif";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(scoreRef.current[1].toString(), BOARD_WIDTH / 2, netY - 64);
        context.fillText(scoreRef.current[2].toString(), BOARD_WIDTH / 2, netY + 64);

        drawPaddle(
            context,
            ai.x,
            ai.y,
            "up",
            aiSwinging,
        );
        drawPaddle(
            context,
            player.x,
            player.y,
            "down",
            playerSwinging,
        );

        context.beginPath();
        context.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        context.fillStyle = TABLE_TENNIS_COLORS.BALL;
        context.fill();
        context.strokeStyle = TABLE_TENNIS_COLORS.BORDER;
        context.lineWidth = 1.5;
        context.stroke();
    };

    const animate = useCallback((): void => {
        animationFrameRef.current = requestAnimationFrame(animate);

        const context = contextRef.current;
        if (!context) {
            return;
        }

        const now = performance.now();
        const player = playerRef.current;
        const ai = aiRef.current;
        const ball = ballRef.current;
        const netY = getNetY();
        const speed = TABLE_TENNIS_SPEED[speedOptionRef.current].ball;
        const playerSwinging =
            isPointerDownRef.current || now < swingUntilRef.current;
        const distanceToAi = Math.hypot(ai.x - ball.x, ai.y - ball.y);
        const aiSwinging =
            ball.vy < 0 &&
            lastHitterRef.current !== "ai" &&
            distanceToAi < ai.radius + ball.radius + 16;

        if (!isPlayingRef.current) {
            drawScene(context, false, false);
            return;
        }

        updateAi(now);

        if (serveAtRef.current > 0) {
            if (now >= serveAtRef.current) {
                launchServe();
            }
        } else {
            const previousY = ball.y;
            ball.x += ball.vx;
            ball.y += ball.vy;

            if (ball.x - ball.radius < 0) {
                ball.x = ball.radius;
                ball.vx *= -1;
            } else if (ball.x + ball.radius > TABLE_TENNIS_CONFIG.BOARD_WIDTH) {
                ball.x = TABLE_TENNIS_CONFIG.BOARD_WIDTH - ball.radius;
                ball.vx *= -1;
            }

            if ((previousY - netY) * (ball.y - netY) <= 0) {
                lastHitterRef.current = null;
            }

            const playerCanHit = playerSwinging && lastHitterRef.current !== "player";
            if (
                playerCanHit &&
                circlesOverlap(
                    player.x,
                    player.y,
                    player.radius,
                    ball.x,
                    ball.y,
                    ball.radius,
                )
            ) {
                applyTableTennisHit(ball, player, "up", speed);
                lastHitterRef.current = "player";
                setPlayHit(true);
            }

            if (
                aiSwinging &&
                circlesOverlap(ai.x, ai.y, ai.radius, ball.x, ball.y, ball.radius)
            ) {
                applyTableTennisHit(ball, ai, "down", speed);
                lastHitterRef.current = "ai";
                setPlayHit(true);
            }

            if (ball.y + ball.radius < 0) {
                scoreRef.current[2] += 1;
                setPlayGoal(true);
                queueServe("up");
            } else if (ball.y - ball.radius > TABLE_TENNIS_CONFIG.BOARD_HEIGHT) {
                scoreRef.current[1] += 1;
                setPlayGoal(true);
                queueServe("down");
            }
        }

        drawScene(context, playerSwinging, aiSwinging);

        if (
            !isModalOpenRef.current &&
            scoreRef.current[1] >= winningNumberRef.current
        ) {
            win("Computer");
        } else if (
            !isModalOpenRef.current &&
            scoreRef.current[2] >= winningNumberRef.current
        ) {
            win(playerNameRef.current);
        }
    }, [launchServe, queueServe, win]);

    const togglePause = useCallback((): void => {
        if (isModalOpenRef.current) {
            return;
        }

        isPlayingRef.current = !isPlayingRef.current;
        setIsPaused((paused) => !paused);
        setBackgroundMusicPlaying((playing) => !playing);
    }, []);

    const enterPlayer = useCallback(async (): Promise<void> => {
        isModalOpenRef.current = true;

        const namePrompt: Record<string, unknown> = {
            title: "Your name?",
            text: "Press Esc or Enter to skip.",
            content: "input",
            buttons: {
                return: "Return to menu",
                ok: "Ok!",
            },
            className: "btn",
            closeOnEsc: true,
        };

        const name = await swal(namePrompt as Parameters<typeof swal>[0]);

        document.querySelector(".btn")?.remove();

        if (name === "return") {
            isModalOpenRef.current = false;
            navigate("/");
            return;
        }

        if (typeof name === "string" && name.trim() !== "") {
            playerNameRef.current = name.trim();
        }

        await swal({
            title: `Let's rally, ${playerNameRef.current}!`,
            text: `How to play

Drag your paddle around your half of the table.

Hold or repeatedly click the left mouse button (or Mac trackpad) to swing. You only return the ball if you swing when it reaches you.

First to ${winningNumberRef.current} points wins.`,
            button: {
                Text: "ok!",
                closeModal: true,
            },
            className: "btn",
            closeOnEsc: true,
        } as Parameters<typeof swal>[0]);

        document.querySelector(".btn")?.remove();

        isModalOpenRef.current = false;
        resetScores();
        resetPaddles();
        queueServe("down");
        setBlurry(false);
        setIsPaused(false);
        isPlayingRef.current = true;
        setBackgroundMusicPlaying(true);
    }, [navigate, queueServe, resetPaddles, resetScores]);

    useEffect(() => {
        winningNumberRef.current = pointsOptions[settings.pointOption].points;
        speedOptionRef.current = settings.speedOption;
    }, [settings.pointOption, settings.speedOption]);

    useEffect(() => {
        const handleVisibilityChange = (): void => {
            if (document.hidden && isPlayingRef.current && !isModalOpenRef.current) {
                isPlayingRef.current = false;
                setIsPaused(true);
                setBackgroundMusicPlaying(false);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === "p" || event.key === "Escape") {
                togglePause();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [togglePause]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        canvas.width = TABLE_TENNIS_CONFIG.BOARD_WIDTH;
        canvas.height = TABLE_TENNIS_CONFIG.BOARD_HEIGHT;
        contextRef.current = canvas.getContext("2d");
        if (!contextRef.current) {
            return;
        }

        drawScene(contextRef.current, false, false);
        enterPlayer();
        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [animate, enterPlayer]);

    const handleReturnToMenu = (): void => {
        isPlayingRef.current = false;
        isModalOpenRef.current = true;
        setBackgroundMusicPlaying(false);

        swal({
            title: "Want to exit the gameplay?",
            buttons: {
                cancel: true,
                confirm: "Yes",
            } as any,
            dangerMode: true,
        }).then((isConfirmed) => {
            isModalOpenRef.current = false;
            if (isConfirmed) {
                navigate("/");
            } else if (!isPaused) {
                isPlayingRef.current = true;
                setBackgroundMusicPlaying(true);
            }
        });
    };

    const playSound = (): void => {
        if (isSoundOn) {
            const audio = new Audio(buttonClickSound);
            audio.play();
        }
    };

    return (
        <section className={isBlurry ? "table-tennis-page blurry" : "table-tennis-page"}>
            <div className="options-container">
                <span className="playing-state"> Press p to pause game</span>
                <button
                    type="button"
                    onClick={() => {
                        handleReturnToMenu();
                        playSound();
                    }}
                    className="return-btn"
                >
                    Return to menu
                </button>
            </div>

            {isPaused ? (
                <h2 className="game-paused-info">
                    Game is paused, press p to resume!
                </h2>
            ) : null}

            <canvas
                ref={canvasRef}
                className="table-tennis-board"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            />

            {isSoundOn && playHit ? (
                <AudioComponent
                    onAudioEnd={() => setPlayHit(false)}
                    path={hitSound}
                    volume={AUDIO_VOLUMES.HIT}
                />
            ) : null}
            {isSoundOn && playGoal ? (
                <AudioComponent
                    onAudioEnd={() => setPlayGoal(false)}
                    path={goalSound}
                    volume={AUDIO_VOLUMES.GOAL}
                />
            ) : null}
            {isSoundOn && isBackgroundMusicPlaying ? (
                <AudioComponent
                    onAudioEnd={() => setBackgroundMusicPlaying(false)}
                    path={backgroundMusic}
                    volume={AUDIO_VOLUMES.BACKGROUND}
                />
            ) : null}
        </section>
    );
};

export default TableTennisMode;
