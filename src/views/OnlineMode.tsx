import React, { useEffect, useRef, useState, useCallback } from "react";
import swal from "sweetalert";
import { player, ball, score } from "../utils/types";
import pongImage from "../assets/pong-header.png";
import hitSound from "../assets/Paddle Ball Hit Sound Effect HD.mp3";
import goalSound from "../assets/goal.mp3";
import buttonClickSound from "../assets/button-click-sound.mp3";
import { useNavigate } from "react-router-dom";
import AudioComponent from "../components/Audio";
import backgroundMusic from "../assets/background-music.mp3";
import { GAME_CONFIG, COLORS, AUDIO_VOLUMES } from "../utils/constants";
import { socketService } from "../utils/socketService";
import { useAppStore } from "../store/useAppStore";

// Types from server
interface ServerPlayer {
    x: number;
    y: number;
    width: number;
    height: number;
    velocityY: number;
    stopPlayer: boolean;
}

interface ServerBall {
    x: number;
    y: number;
    width: number;
    height: number;
    velocityX: number;
    velocityY: number;
}

interface ServerGameState {
    player1: ServerPlayer;
    player2: ServerPlayer;
    ball: ServerBall;
    score: score;
    isPlaying: boolean;
    gameId: string;
}

interface PlayerInfo {
    name: string;
    playerNumber: 1 | 2;
    ready?: boolean;
}

const OnlineMode: React.FC = () => {
    const isSoundOn = useAppStore((state) => state.isSoundOn);
    const navigate = useNavigate();
    
    // Canvas ref for proper React DOM access
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    
    // Game state from server
    const serverGameStateRef = useRef<ServerGameState | null>(null);
    
    // Local player info
    const playerNumberRef = useRef<1 | 2 | null>(null);
    const roomCodeRef = useRef<string | null>(null);
    
    // React state for UI
    const [roomCode, setRoomCode] = useState<string>("");
    const [playerName, setPlayerName] = useState<string>("");
    const [opponentName, setOpponentName] = useState<string>("Waiting...");
    const [isBlurry, setBlurry] = useState<boolean>(true);
    const [playHit, setPlayHit] = useState<boolean>(false);
    const [playGoal, setPlayGoal] = useState<boolean>(false);
    const [connectionStatus, setConnectionStatus] = useState<string>("Connecting...");
    const [isBackgroundMusicPlaying, setBackgroundMusicPlaying] = useState<boolean>(false);
    const [localScore, setLocalScore] = useState<score>({ 1: 0, 2: 0 });

    // Audio setup
    const [backgroundAudio] = useState(new Audio(backgroundMusic));

    useEffect(() => {
        backgroundAudio.volume = isSoundOn ? AUDIO_VOLUMES.HIT : 0;
        
        if (isSoundOn && !isBlurry) {
            backgroundAudio.play().catch(e => console.log('Audio play failed:', e));
        } else {
            backgroundAudio.pause();
        }

        return () => {
            backgroundAudio.pause();
        };
    }, [isSoundOn, isBlurry, backgroundAudio]);

    // Socket setup
    useEffect(() => {
        const socket = socketService.connect();
        
        socket.on('connect', () => {
            setConnectionStatus("Connected");
            showJoinCreateMenu();
        });

        socket.on('disconnect', () => {
            setConnectionStatus("Disconnected");
            setBlurry(true);
            swal("Disconnected", "Lost connection to the server", "error").then(() => {
                navigate("/");
            });
        });

        socket.on('room_created', (data: { roomCode: string, playerNumber: 1 | 2 }) => {
            roomCodeRef.current = data.roomCode;
            setRoomCode(data.roomCode);
            playerNumberRef.current = data.playerNumber;
            
            swal({
                title: "Room Created!",
                text: `Share this code with your friend: ${data.roomCode}\n\nWaiting for them to join...`,
                buttons: { confirm: { text: "Copy Code & Wait", value: true } },
                closeOnClickOutside: false,
                closeOnEsc: false,
            }).then(() => {
                navigator.clipboard.writeText(data.roomCode);
            });
        });

        socket.on('room_joined', (data: { roomCode: string, playerNumber: 1 | 2 }) => {
            roomCodeRef.current = data.roomCode;
            setRoomCode(data.roomCode);
            playerNumberRef.current = data.playerNumber;
        });

        socket.on('player_joined', (data: { players: PlayerInfo[] }) => {
            const me = data.players.find(p => p.playerNumber === playerNumberRef.current);
            const opponent = data.players.find(p => p.playerNumber !== playerNumberRef.current);
            
            if (me) setPlayerName(me.name);
            if (opponent) setOpponentName(opponent.name);

            // If we have both players, show ready prompt
            if (data.players.length === 2) {
                swal({
                    title: "Opponent found!",
                    text: `${opponent?.name} has joined the room. Ready to play?`,
                    buttons: { confirm: { text: "I'm Ready!", value: true } },
                    closeOnClickOutside: false,
                    closeOnEsc: false,
                }).then(() => {
                    socket.emit('player_ready', { roomCode: roomCodeRef.current });
                    swal("Waiting", "Waiting for opponent to be ready...", "info");
                });
            }
        });

        socket.on('game_start', (data: { gameState: ServerGameState }) => {
            serverGameStateRef.current = data.gameState;
            setLocalScore(data.gameState.score);
            setBlurry(false);
            // @ts-ignore
            swal.close();
            setBackgroundMusicPlaying(true);
        });

        socket.on('game_state', (data: { gameState: ServerGameState }) => {
            serverGameStateRef.current = data.gameState;
            
            // Only update score state if it changed to avoid re-renders
            if (data.gameState.score[1] !== localScore[1] || data.gameState.score[2] !== localScore[2]) {
                setLocalScore({ ...data.gameState.score });
            }
        });

        socket.on('goal_scored', () => {
            setPlayGoal(true);
        });

        socket.on('game_over', (data: { winner: number, winnerName: string }) => {
            setBlurry(true);
            setBackgroundMusicPlaying(false);
            
            const isWinner = data.winner === playerNumberRef.current;
            const title = isWinner ? "You Won! 🎉" : "You Lost! 😢";
            
            swal({
                title,
                text: `${data.winnerName} wins the game!`,
                buttons: {
                    play: "Play Again",
                    home: "Return to Menu"
                } as any,
            }).then((value) => {
                if (value === "play") {
                    socket.emit('player_ready', { roomCode: roomCodeRef.current });
                    swal("Waiting", "Waiting for opponent...", "info");
                } else {
                    socketService.disconnect();
                    navigate("/");
                }
            });
        });

        socket.on('opponent_disconnected', () => {
            setBlurry(true);
            swal({
                title: "Opponent Disconnected",
                text: "The other player left the game.",
                buttons: { confirm: { text: "Return to Menu", value: true } },
            }).then(() => {
                socketService.disconnect();
                navigate("/");
            });
        });

        socket.on('error', (data: { message: string }) => {
            swal("Error", data.message, "error").then(() => {
                showJoinCreateMenu();
            });
        });

        return () => {
            socketService.disconnect();
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [navigate]);

    const showJoinCreateMenu = async () => {
        const choice = await swal({
            title: "Online Multiplayer",
            text: "Create a new room or join a friend?",
            buttons: {
                create: { text: "Create Room", value: "create" },
                join: { text: "Join Room", value: "join" },
                cancel: { text: "Back", value: "cancel" }
            } as any,
            closeOnClickOutside: false,
            closeOnEsc: false,
        });

        if (choice === "cancel") {
            socketService.disconnect();
            navigate("/");
            return;
        }

        const name = await swal({
            title: "Enter your name",
            content: "input" as any,
            buttons: { confirm: { text: "Next", value: true } },
            closeOnClickOutside: false,
            closeOnEsc: false,
        });

        if (!name) {
            showJoinCreateMenu();
            return;
        }

        setPlayerName(name);

        if (choice === "create") {
            socketService.getSocket()?.emit('create_room', { playerName: name });
        } else if (choice === "join") {
            const code = await swal({
                title: "Enter Room Code",
                content: "input" as any,
                buttons: { confirm: { text: "Join", value: true } },
                closeOnClickOutside: false,
                closeOnEsc: false,
            });

            if (!code) {
                showJoinCreateMenu();
                return;
            }

            socketService.getSocket()?.emit('join_room', { 
                roomCode: (code as string).toUpperCase(), 
                playerName: name 
            });
        }
    };

    // Render loop
    const render = useCallback(() => {
        animationFrameRef.current = requestAnimationFrame(render);
        
        const context = contextRef.current;
        const canvas = canvasRef.current;
        const gameState = serverGameStateRef.current;
        
        if (!context || !canvas || !gameState || !gameState.isPlaying) return;

        // Clear canvas
        context.clearRect(0, 0, GAME_CONFIG.BOARD_WIDTH, GAME_CONFIG.BOARD_HEIGHT);

        // Draw Player 1
        context.fillStyle = COLORS.PLAYER;
        context.fillRect(
            gameState.player1.x,
            gameState.player1.y,
            gameState.player1.width,
            gameState.player1.height
        );

        // Draw Player 2
        context.fillRect(
            gameState.player2.x,
            gameState.player2.y,
            gameState.player2.width,
            gameState.player2.height
        );

        // Draw Ball
        context.fillStyle = COLORS.BALL;
        context.fillRect(
            gameState.ball.x,
            gameState.ball.y,
            gameState.ball.width,
            gameState.ball.height
        );

        // Draw center line
        context.fillStyle = COLORS.CENTER_LINE_MULTIPLAYER;
        context.fillRect(canvas.width / 2, 0, 5, canvas.height);

    }, []);

    // Setup canvas and start render loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        canvas.height = GAME_CONFIG.BOARD_HEIGHT;
        canvas.width = GAME_CONFIG.BOARD_WIDTH;
        contextRef.current = canvas.getContext("2d");

        animationFrameRef.current = requestAnimationFrame(render);

        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [render]);

    // Handle Keyboard Input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isBlurry) return;
            
            const socket = socketService.getSocket();
            if (!socket || !roomCodeRef.current) return;

            // Use same keys for both players since the server knows who is who
            if (e.key === "ArrowUp" || e.key === "z") {
                socket.emit('paddle_move', { roomCode: roomCodeRef.current, direction: 'up' });
            } else if (e.key === "ArrowDown" || e.key === "s") {
                socket.emit('paddle_move', { roomCode: roomCodeRef.current, direction: 'down' });
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (isBlurry) return;
            
            const socket = socketService.getSocket();
            if (!socket || !roomCodeRef.current) return;

            if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "z" || e.key === "s") {
                socket.emit('paddle_move', { roomCode: roomCodeRef.current, direction: 'stop' });
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [isBlurry]);

    const playSound = () => {
        const audio = new Audio(buttonClickSound);
        if (isSoundOn) audio.play();
    };

    const handleReturnToMenu = () => {
        playSound();
        swal({
            title: "Leave Match?",
            text: "This will disconnect you from the online game.",
            buttons: {
                cancel: true,
                confirm: "Yes, Leave"
            } as any,
            dangerMode: true,
        }).then((isConfirmed) => {
            if (isConfirmed) {
                socketService.disconnect();
                navigate("/");
            }
        });
    };

    return (
        <section className={isBlurry ? "blurry" : ""}>
            <div className="title">
                <div className="timer">Room: {roomCode}</div>
                <h3>Online Pong</h3>
                <div className="img-container">
                    <img src={pongImage} alt="Pong" className="pong-header" />
                </div>
            </div>
            
            <div className="options-container">
                <span className="playing-state">
                    Status: <span style={{ color: connectionStatus === "Connected" ? "#4CAF50" : "#F44336" }}>{connectionStatus}</span>
                </span>
                <button onClick={handleReturnToMenu} className="return-btn">
                    Return to menu
                </button>
            </div>

            <div className="names">
                <span>{playerNumberRef.current === 1 ? playerName : opponentName}</span>
                <span className="label">
                    {localScore[1]} - {localScore[2]}
                </span>
                <span>{playerNumberRef.current === 2 ? playerName : opponentName}</span>
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

export default OnlineMode;
