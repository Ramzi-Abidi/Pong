import React, { useEffect, useRef, useState, useCallback } from "react";
import swal from "sweetalert";
import { ball, player, score } from "../utils/types";
import pongImage from "../assets/pong-header.png";
import hitSound from "../assets/Paddle Ball Hit Sound Effect HD.mp3";
import goalSound from "../assets/goal.mp3";
import buttonClickSound from "../assets/button-click-sound.mp3";
import { useNavigate } from "react-router-dom";
import AudioComponent from "../components/Audio";
import backgroundMusic from "../assets/background-music.mp3";
import { speedOptions, pointsOptions } from "../utils/options";
import { GAME_CONFIG, COLORS, AUDIO_VOLUMES } from "../utils/constants";
import { useAppStore } from "../store/useAppStore";

const SinglePlayerMode: React.FC = () => {
    const settings = useAppStore((state) => state.settings);
    const isSoundOn = useAppStore((state) => state.isSoundOn);
    const navigate = useNavigate();
    
    // Canvas ref for proper React DOM access
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    
    // Animation frame ref for proper cleanup
    const animationFrameRef = useRef<number | null>(null);
    
    // Game state refs (mutable values that persist across renders)
    const isPlayingRef = useRef(false);
    const player1Ref = useRef<player>({
        x: GAME_CONFIG.PLAYER_OFFSET,
        y: GAME_CONFIG.BOARD_HEIGHT / 2,
        width: GAME_CONFIG.PLAYER_WIDTH,
        height: GAME_CONFIG.PLAYER_HEIGHT,
        velocityY: 0,
        stopPlayer: false,
    });
    const player2Ref = useRef<player>({
        x: GAME_CONFIG.BOARD_WIDTH - GAME_CONFIG.PLAYER_WIDTH - GAME_CONFIG.PLAYER_OFFSET,
        y: GAME_CONFIG.BOARD_HEIGHT / 2,
        width: GAME_CONFIG.PLAYER_WIDTH,
        height: GAME_CONFIG.PLAYER_HEIGHT,
        velocityY: 0,
        stopPlayer: false,
    });
    const ballRef = useRef<ball>({
        x: GAME_CONFIG.BOARD_WIDTH / 2,
        y: GAME_CONFIG.BOARD_HEIGHT / 2,
        width: GAME_CONFIG.BALL_SIZE,
        height: GAME_CONFIG.BALL_SIZE,
        velocityX: speedOptions[settings.speedOption].velocityX,
        velocityY: speedOptions[settings.speedOption].velocityY,
    });
    const scoreRef = useRef<score>({ 1: 0, 2: 0 });
    const firstPlayerNameRef = useRef<string>("Player 1");
    const secondPlayerNameRef = useRef<string>("Player 2");
    
    // Ref to track if modal is open (replaces DOM queries)
    const isModalOpenRef = useRef(false);
    
    // React state for UI updates
    const [firstPlayerName, setFirstNamePlayer] = useState<string>("Player 1");
    const [winningNumber] = useState<number>(
        pointsOptions[settings.pointOption].points,
    );
    const [secondPlayerName] = useState<string>("Player 2");
    const [isBlurry, setBlurry] = useState(true);
    const [playHit, setPlayHit] = useState(false);
    const [playGoal, setPlayGoal] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isBackgroundMusicPlaying, setBackgroundMusicPlaying] =
        useState(false);
    const [timer, setTimer] = useState(0);
    
    const timerRef = useRef<number | null>(null);

    const startTimer = useCallback((): void => {
        timerRef.current = window.setInterval(() => {
            if (isPlayingRef.current) {
                setTimer((prevTimer) => prevTimer + 1);
            }
        }, 1000);
    }, []);

    const resetTimer = useCallback((): void => {
        setTimer(0);
        if (timerRef.current !== null) {
            clearInterval(timerRef.current);
        }
    }, []);

    const detectCollision = (a: player | ball, b: player | ball): boolean => {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    };

    const outOfBound = (y: number): boolean => {
        return y < 0 || y + GAME_CONFIG.PLAYER_HEIGHT > GAME_CONFIG.BOARD_HEIGHT;
    };

    const resetScores = useCallback((): void => {
        scoreRef.current[1] = 0;
        scoreRef.current[2] = 0;
    }, []);

    const resetBall = useCallback((direction: number): void => {
        ballRef.current = {
            x: GAME_CONFIG.BOARD_WIDTH / 2,
            y: GAME_CONFIG.BOARD_HEIGHT / 2,
            width: GAME_CONFIG.BALL_SIZE,
            height: GAME_CONFIG.BALL_SIZE,
            velocityX: direction,
            velocityY: ballRef.current.velocityY,
        };
    }, []);

    const win = useCallback((playerName: string): void => {
        isPlayingRef.current = false;
        setBlurry(true);
        resetScores();
        isModalOpenRef.current = true;

        alert(`Game over!`);
        swal({
            title: `Feedback!`,
            text: `Ready for another round? Click 'Play again' to dive back into the excitement! :))`,
            buttons: {
                home: "Go to Home",
                star: "Star GitHub⭐",
                play: "Play again",
            } as any,
            className: "btn",
        }).then((value) => {
            isModalOpenRef.current = false;
            console.log(value);
            if (value === "menu") {
                isPlayingRef.current = false;
                resetScores();
                enterPlayerNames();
            } else if (value === "home") {
                navigate("/");
            } else if (value === "play") {
                resetTimer();
                enterPlayerNames();
                startTimer();
            } else {
                window.open("https://github.com/Ramzi-Abidi/Pong", "_blank");
                navigate("/");
            }
        });
    }, [navigate, resetScores, resetTimer, startTimer]);

    const animate = useCallback((): void => {
        animationFrameRef.current = requestAnimationFrame(animate);
        
        if (!isPlayingRef.current || !contextRef.current || !canvasRef.current) {
            return;
        }
        
        setBackgroundMusicPlaying(true);
        const context = contextRef.current;
        const board = canvasRef.current;
        const player1 = player1Ref.current;
        const player2 = player2Ref.current;
        const currentBall = ballRef.current;

        // clearing the canvas
        context.clearRect(0, 0, GAME_CONFIG.BOARD_WIDTH, GAME_CONFIG.BOARD_HEIGHT);

        // moving the player 2 up and down
        if (!outOfBound(player2.y + player2.velocityY)) {
            if (player2.stopPlayer === false) {
                player2.y += player2.velocityY;
            }
        }

        context.fillRect(
            player2.x,
            player2.y,
            player2.width,
            player2.height,
        );

        context.fillStyle = COLORS.BALL;

        // changing the pos of the ball
        currentBall.x += currentBall.velocityX;
        currentBall.y += currentBall.velocityY;

        // moving the player 1 up and down following the ball position (AI)
        if (currentBall.y > player1.y) {
            player1.velocityY = GAME_CONFIG.AI_VELOCITY;
        } else if (currentBall.y < player1.y) {
            player1.velocityY = -GAME_CONFIG.AI_VELOCITY;
        }

        if (!outOfBound(player1.y + player1.velocityY)) {
            player1.y += player1.velocityY;
        }

        context.fillStyle = COLORS.PLAYER;
        context.fillRect(
            player1.x,
            player1.y,
            player1.width,
            player1.height,
        );

        context.fillStyle = COLORS.BALL;
        // recreating the ball
        context.fillRect(currentBall.x, currentBall.y, currentBall.width, currentBall.height);
        
        // changing the velocity/direction of the ball when it hits the top/bottom of boundaries
        if (currentBall.y <= 0 || currentBall.y + currentBall.height >= GAME_CONFIG.BOARD_HEIGHT) {
            currentBall.velocityY *= -1;
        }
        
        // detecting collision with player1 or with player2
        if (detectCollision(currentBall, player1)) {
            setPlayHit(true);
            if (currentBall.x <= player1.x + player1.width) {
                currentBall.velocityX *= -1;
            }
        } else if (detectCollision(currentBall, player2)) {
            setPlayHit(true);
            if (currentBall.x + GAME_CONFIG.BALL_SIZE >= player2.x) {
                currentBall.velocityX *= -1;
            }
        }

        // Scoring goal
        if (isPlayingRef.current) {
            if (currentBall.x < 0) {
                setPlayGoal(true);
                scoreRef.current[2] += 1;
                resetBall(speedOptions[settings.speedOption].velocityX);
            } else if (currentBall.x + GAME_CONFIG.BALL_SIZE > GAME_CONFIG.BOARD_WIDTH) {
                setPlayGoal(true);
                scoreRef.current[1] += 1;
                resetBall(speedOptions[settings.speedOption].velocityX);
            }
        }

        // score
        context.font = "45px sans-serif";
        context.fillText(scoreRef.current[1].toString(), GAME_CONFIG.BOARD_WIDTH / 5, 45);
        context.fillText(
            scoreRef.current[2].toString(),
            (GAME_CONFIG.BOARD_WIDTH * 4) / 5 - 45,
            45,
        );

        // drawing line
        context.fillStyle = COLORS.CENTER_LINE;
        context.fillRect(board.width / 2, 0, 5, board.height);

        // Winning
        if (
            scoreRef.current[1] >= winningNumber &&
            isPlayingRef.current === true &&
            !isModalOpenRef.current
        ) {
            isPlayingRef.current = false;
            win(firstPlayerNameRef.current);
        } else if (
            scoreRef.current[2] >= winningNumber &&
            isPlayingRef.current === true &&
            !isModalOpenRef.current
        ) {
            isPlayingRef.current = false;
            win(secondPlayerNameRef.current);
        }
    }, [resetBall, settings.speedOption, win, winningNumber]);

    const movePlayer = useCallback((e: KeyboardEvent): void => {
        const player2 = player2Ref.current;
        
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            player2.stopPlayer = false;
        }

        if (e.key === "ArrowUp") {
            player2.velocityY = -GAME_CONFIG.PLAYER_VELOCITY;
        } else if (e.key === "ArrowDown") {
            player2.velocityY = GAME_CONFIG.PLAYER_VELOCITY;
        }

        // to pause
        if (e.key === "p" || e.key === "Escape") {
            if (!isModalOpenRef.current) {
                isPlayingRef.current = !isPlayingRef.current;
                setIsPaused((isPaused) => !isPaused);
            }
        }
    }, []);

    const stopMovingPlayer = useCallback((e: KeyboardEvent): void => {
        if (e.key === "z" || e.key === "s") {
            player1Ref.current.stopPlayer = true;
        }

        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            player2Ref.current.stopPlayer = true;
        }
    }, []);

    const enterPlayerNames = useCallback(async (): Promise<void> => {
        isModalOpenRef.current = true;
        
        let obj: Record<string, unknown> = {
            title: "Player 1, your name ?",
            text: "If you're feeling mysterious, hit [ESC] or [Enter] to skip.",
            content: "input",
            buttons: {
                return: "Return to menu",
                ok: {
                    button: {
                        text: "Ok!",
                        closeModal: true,
                    },
                },
            },
            className: "btn",
            closeOnEsc: true,
        };

        const name = await swal(obj as Parameters<typeof swal>[0]);
        document.querySelector(".btn")?.remove();

        if (name === "return") {
            isModalOpenRef.current = false;
            navigate("/");
            return;
        }

        if (name !== null && typeof name === "string" && name.trim() !== "") {
            firstPlayerNameRef.current = name.trim();
            setFirstNamePlayer(name.trim());
            console.log(firstPlayerNameRef.current, name.trim());
        }

        const title: string =
            firstPlayerNameRef.current !== "" && firstPlayerNameRef.current !== null
                ? `${firstPlayerNameRef.current}`
                : "";

        obj = {
            title: `Let the fun flow, ${title}!`,
            text: `How to play ?

            ${firstPlayerNameRef.current}, use 'z' and 's' keys (Right paddle).
            
            You'll be playing against a BOT.
            
            Let the game begin by pressing [ESC] or [Enter]!

            Game is over when the score reaches 10.

            Prepare to face a tough BOT! Let's see how long you can stand against it.
            `,
            button: {
                Text: "ok!",
                closeModal: true,
            },
            className: "btn",
            closeOnEsc: true,
        };

        await swal(obj as Parameters<typeof swal>[0]);
        document.querySelector(".btn")?.remove();

        alert(`Once you click 'OK' your game will launch instantly! :))`);

        isModalOpenRef.current = false;
        isPlayingRef.current = true;

        startTimer();
        resetScores();
        setBlurry(false);
        isPlayingRef.current = true;
    }, [navigate, resetScores, startTimer]);

    useEffect(() => {
        const handleVisibilityChange = (): void => {
            if (document.hidden) {
                if (isPlayingRef.current === true && !isModalOpenRef.current) {
                    setBlurry(true);
                    isPlayingRef.current = false;
                    setIsPaused((isPaused) => !isPaused);
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        canvas.height = GAME_CONFIG.BOARD_HEIGHT;
        canvas.width = GAME_CONFIG.BOARD_WIDTH;
        contextRef.current = canvas.getContext("2d");
        
        if (!contextRef.current) return;
        
        // drawing the first player
        contextRef.current.fillStyle = COLORS.PLAYER;
        contextRef.current.fillRect(
            player1Ref.current.x,
            player1Ref.current.y,
            player1Ref.current.width,
            player1Ref.current.height
        );

        // entering names
        enterPlayerNames();

        // loop of game
        animationFrameRef.current = requestAnimationFrame(animate);
        window.addEventListener("keydown", movePlayer);
        window.addEventListener("keyup", stopMovingPlayer);

        return () => {
            resetTimer();
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            window.removeEventListener("keydown", movePlayer);
            window.removeEventListener("keyup", stopMovingPlayer);
        };
    }, [animate, enterPlayerNames, movePlayer, resetTimer, stopMovingPlayer]);

    const handleReturnToMenu = (): void => {
        isPlayingRef.current = false;
        isModalOpenRef.current = true;

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
                isPlayingRef.current = false;
                navigate("/");
            } else {
                isPlayingRef.current = true;
            }
        });
    };

    const playSound = (): void => {
        const audio = new Audio(buttonClickSound);

        if (isSoundOn) {
            audio.play();
        }
    };

    return (
        <section className={isBlurry === true ? "blurry" : ""}>
            <div className="title">
                <div className="timer">Time: {timer}s</div>
                <h3>pong game</h3>
                <div className="img-container">
                    <img src={pongImage} alt="Pong" className="pong-header" />
                </div>
            </div>
            <div className="options-container">
                <span className="playing-state"> Press p to pause game</span>
                <button
                    onClick={() => {
                        handleReturnToMenu();
                        playSound();
                    }}
                    className="return-btn"
                >
                    Return to menu
                </button>
            </div>

            {isPaused && (
                <h2 className="game-paused-info">
                    Game is paused, press p to resume!
                </h2>
            )}

            <div className="names">
                <span>{secondPlayerName}</span>
                <span className="label">VS</span>
                <span>{firstPlayerName}</span>
            </div>
            <canvas id="board" ref={canvasRef}></canvas>
            {isSoundOn && playHit && (
                <AudioComponent
                    onAudioEnd={() => setPlayHit(false)}
                    path={hitSound}
                    volume={AUDIO_VOLUMES.HIT}
                />
            )}
            {isSoundOn && playGoal && (
                <AudioComponent
                    onAudioEnd={() => setPlayGoal(false)}
                    path={goalSound}
                    volume={AUDIO_VOLUMES.GOAL}
                />
            )}
            {isSoundOn && isBackgroundMusicPlaying && (
                <AudioComponent
                    onAudioEnd={() => setBackgroundMusicPlaying(false)}
                    path={backgroundMusic}
                    volume={AUDIO_VOLUMES.BACKGROUND}
                />
            )}
        </section>
    );
};

export default SinglePlayerMode;
