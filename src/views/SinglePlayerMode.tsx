import React, { useEffect, useRef, useState } from "react";
import swal from "sweetalert";
import { ball, player, score } from "../utils/types";
import pongImage from "../assets/pong-header.png";
import sound from "/Paddle Ball Hit Sound Effect HD.mp3";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const SinglePlayerMode = () => {
    let boardWidth: number = 600;
    let boardHeight: number = 400;
    let context: CanvasRenderingContext2D;
    let board: HTMLCanvasElement;
    let playerWidth: number = 10;
    let playerHeight: number = 50;
    let playerVelocityY = 0;

    let player1: player = {
        x: 10,
        y: boardHeight / 2,
        width: playerWidth,
        height: playerHeight,
        velocityY: playerVelocityY, // change in the position over time
        stopPlayer: false,
    };

    let player2: player = {
        x: boardWidth - playerWidth - 10,
        y: boardHeight / 2,
        width: playerWidth,
        height: playerHeight,
        velocityY: playerVelocityY, // change in teh position over time
        stopPlayer: false,
    };
    const ballWidth = 10;
    const ballHeight = 10;

    // const [ballVelocity, setBallVelocity] = useState({
    //     velocityX: 1,
    //     velocityY: 2,
    // });

    let ball: ball = {
        x: boardWidth / 2,
        y: boardHeight / 2,
        width: ballWidth,
        height: ballHeight,
        velocityX: 1.6, // shhifting by 1px
        velocityY: 0.9, // shhifting by 2px
    };
    const [audio] = useState(new Audio(sound));
    audio.volume = 0.18;

    const [firstPlayerName, setFirstNamePlayer] = useState<string>("Player 1");
    const [winningNumber, setWinningNumber] = useState<number>(11);
    const [secondPlayerName, setSecondNamePlayer] = useState("Player 2");
    const [isBlurry, setBlurry] = useState<boolean>(true);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);

    const [timer, setTimer] = useState<number>(0);

    const timerRef = useRef<number | null>(null);

    const startTimer = () => {
        timerRef.current = window.setInterval(() => {
            setTimer((prevTimer) => prevTimer + 1);
        }, 1000);
    };

    const resetTimer = () => {
        setTimer(0);
        if (timerRef.current !== null) {
            clearInterval(timerRef.current);
        }
    };
    let isPlaying1 = false;
    const score = useRef<score>({
        1: 0,
        2: 0,
    });
    const navigate = useNavigate();

    let firstPlayerName1: string = firstPlayerName;
    let secondPlayerName1: string = secondPlayerName;

    const detectCollision = (a: any, b: any) => {
        return (
            a.x < b.x + b.width && //a's top left corner doesn't reach b's top right corner
            a.x + a.width > b.x && //a's top right corner passes b's top left corner
            a.y < b.y + b.height && //a's top left corner doesn't reach b's bottom left corner
            a.y + a.height > b.y
        ); //a's bottom left corner passes b's top left corner
    };

    const outOfBound = (y: number) => {
        return y < 0 || y + player1.height > boardHeight;
    };

    const win = (playerName: string) => {
        setIsPlaying(false);
        setBlurry(true);
        resetScores();

        alert(`${playerName} wins !`);
        swal({
            title: `Feedback!`,
            text: `Ready for another round? Click 'Play again' to dive back into the excitement! :))`,
            buttons: {
                star: "Star GitHub⭐",
                // menu: "Return to menu",
                play: "Play again",
            } as any,
            className: "btn",
        }).then((value) => {
            console.log(value);
            if (value === "menu") {
                isPlaying1 = false;
                resetScores();
                // later we will change this to creat a menu
                enterPlayerNames();
            } else if (value === "play") {
                // play again
                resetTimer();
                enterPlayerNames();
                startTimer();
            } else {
                // navigate("/https://github.com/Ramzi-Abidi/Pong");
                // window.location.href = '';
                window.open("https://github.com/Ramzi-Abidi/Pong", "_blank");
            }
        });
    };

    const animate = (): void => {
        requestAnimationFrame(animate); // The requestAnimationFrame() method used to repeat something pretty fast :) => alternative to setInterval()
        // if (!ok) return;
        if (isPlaying1 === true) {
            // clearing the canvas
            context.clearRect(0, 0, boardWidth, boardHeight);

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

            context.fillStyle = "#fff";

            // changing the pos of the ball
            ball.x += ball.velocityX;
            ball.y += ball.velocityY;

            // moving the player 1 up and down according following the ball position
            if (ball.y > player1.y) {
                player1.velocityY = 2;
            } else if (ball.y < player1.y) {
                player1.velocityY = -2;
            }

            if (!outOfBound(player1.y + player1.velocityY)) {
                player1.y += player1.velocityY;
            }

            context.fillStyle = "skyBlue";
            context.fillRect(
                player1.x,
                player1.y,
                player1.width,
                player1.height,
            );

            context.fillStyle = "#fff";
            // recreating the ball
            context.fillRect(ball.x, ball.y, ball.width, ball.height);
            // changing the velocity/direction of the ball when it hits the top/bottom of boundries.
            if (ball.y <= 0 || ball.y + ball.height >= boardHeight) {
                ball.velocityY *= -1;
            }
            // detecting collision with player1 or with player2
            if (detectCollision(ball, player1)) {
                audio.play();
                // left side of ball touches right side of player1
                if (ball.x <= player1.x + player1.width) {
                    ball.velocityX *= -1;
                }
            } else if (detectCollision(ball, player2)) {
                audio.play();
                // right side of ball touches left side player2
                if (ball.x + ballWidth >= player2.x) {
                    ball.velocityX *= -1;
                }
            }
            const resetGame = (direction: number) => {
                ball = {
                    x: boardWidth / 2,
                    y: boardHeight / 2,
                    width: ballWidth,
                    height: ballHeight,
                    velocityX: direction,
                    velocityY: ball.velocityY,
                };
            };
            // game over
            if (isPlaying1) {
                if (ball.x < 0) {
                    score.current[2] += 1;
                    resetGame(1.6);
                } else if (ball.x + ballWidth > boardWidth) {
                    score.current[1] += 1;
                    resetGame(-1.6);
                }
            }

            // score
            context.font = "45px sans-serif";
            context.fillText(score.current[1].toString(), boardWidth / 5, 45);
            context.fillText(
                score.current[2].toString(),
                (boardWidth * 4) / 5 - 45,
                45,
            );

            // drawing line
            context.fillStyle = "skyBlue";
            context.fillRect(board.width / 2, 0, 5, board.height);

            // Winning
            if (
                score.current[1] >= winningNumber &&
                isPlaying === true &&
                document.querySelector(".btn") === null &&
                document.querySelector(".driver-popover-title") === null
            ) {
                isPlaying1 = false;
                win(firstPlayerName1);
            } else if (
                score.current[2] >= winningNumber &&
                isPlaying === true &&
                document.querySelector(".btn") === null &&
                document.querySelector(".driver-popover-title") === null
            ) {
                isPlaying1 = false;
                win(secondPlayerName1);
            }
        }
    };

    const movePlayer = (e: any): void => {
        // if (e.key === "z" || e.key === "s") player1.stopPlayer = false;
        if (e.key === "ArrowUp" || e.key === "ArrowDown")
            player2.stopPlayer = false;

        if (e.key === "ArrowUp") {
            player2.velocityY = -2;
        } else if (e.key === "ArrowDown") {
            player2.velocityY = 2;
        }

        // to pause
        if (e.key === "p" || e.key === "Escape") {
            if (isPlaying === true && document.querySelector(".btn") === null) {
                // set blurry background
                if (!isBlurry) {
                    setBlurry(true);
                }
                isPlaying1 = !isPlaying1;
            }
        }
    };

    const resetScores = (): void => {
        score.current[1] = 0;
        score.current[2] = 0;
    };

    const enterPlayerNames = async (): Promise<void> => {
        let obj: any = {
            title: "Player 1, your name ?",
            text: "If you're feeling mysterious, hit [ESC] or [Enter] to skip.",
            content: "input" as any,
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
        document.querySelector(".btn")?.remove();

        const name = await swal(obj);

        if (name === "return") {
            navigate("/");
            return;
        }

        if (name !== null && name.trim() !== "") {
            firstPlayerName1 = name.trim();
            setFirstNamePlayer(name.trim());
            console.log(firstPlayerName1, name.trim());
        }
        obj = {
            title: "Player 2, your name ?",
            text: "If you're feeling mysterious, hit [ESC] or [Enter] to skip.",
            content: "input" as any,
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
        document.querySelector(".btn")?.remove();

        const name1 = await swal(obj);

        if (name1 === "return") {
            navigate("/");
            return;
        }

        if (name1 !== null && name1.trim() !== "") {
            secondPlayerName1 = name1.trim();
            setSecondNamePlayer(name1.trim());
        }

        const title: string =
            firstPlayerName1 !== "" && firstPlayerName1 !== null
                ? `${firstPlayerName1} and ${secondPlayerName1}`
                : "";

        obj = {
            title: `Let the fun flow, ${title}!`,
            text: `How to play ?

            ${firstPlayerName1}, use 'z' and 's' keys.

            ${secondPlayerName1}, use 'top' and 'bottom' arrow keys.

            Let the game begin by pressing [ESC] or [Enter]!
            `,
            button: {
                Text: "ok!",
                closeModal: true,
            },
            className: "btn",
            closeOnEsc: true,
        };

        await swal(obj);

        document.querySelector(".btn")?.remove();

        alert(`Once you click 'OK' your game will launch instantly! :))`);

        isPlaying1 = true;
        // reset the players' scores
        resetScores();
        // set blurry backerground
        setBlurry(false);
        // start the game
        setIsPlaying(true);
    };

    const stopMovingPlayer = (e: any): void => {
        if (e.key === "z" || e.key === "s") {
            player1.stopPlayer = true;
        }

        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            player2.stopPlayer = true;
        }
    };

    useEffect(() => {
        board = document.getElementById("board") as HTMLCanvasElement;
        board.height = boardHeight;
        board.width = boardWidth;
        context = board.getContext("2d") as CanvasRenderingContext2D;
        // drawing the first player
        context.fillStyle = "skyBlue";
        // drawing a rectangle
        context.fillRect(player1.x, player1.y, player1.width, player1.height); // fillRect(x,y,width,height)

        // entering names
        enterPlayerNames();
        startTimer();
        // loop of game
        requestAnimationFrame(animate);
        window.addEventListener("keydown", movePlayer);
        window.addEventListener("keyup", stopMovingPlayer);

        return () => {
            resetTimer();
            window.removeEventListener("keydown", movePlayer);
            window.removeEventListener("keyup", stopMovingPlayer);
        };
        // return () => {};
    }, []);

    const handleClick = () => {
        navigate("/");
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
                <span className="playing-state">Press p to pause game</span>
                <Button onClick={handleClick} className="">
                    Return to menu
                </Button>
            </div>

            <div className="names">
                <span>{firstPlayerName}</span>
                <span className="label">VS</span>
                <span>{secondPlayerName}</span>
            </div>
            <canvas id="board"></canvas>
        </section>
    );
};

export default SinglePlayerMode;