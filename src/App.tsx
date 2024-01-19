import React, { useEffect, useRef, useState } from "react";
import SweetAlert2, { withSwal } from "react-sweetalert2";
import swal from "sweetalert";

const App = () => {
    let boardWidth: number = 900;
    let boardHeight: number = 500;
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
    };

    let player2: player = {
        x: boardWidth - playerWidth - 10,
        y: boardHeight / 2,
        width: playerWidth,
        height: playerHeight,
        velocityY: playerVelocityY, // change in teh position over time
    };

    const ballWidth = 10;
    const ballHeight = 10;

    let ball: ball = {
        x: boardWidth / 2,
        y: boardHeight / 2,
        width: ballWidth,
        height: ballHeight,
        velocityX: 1, // shhifting by 1px
        velocityY: 2, // shhifting by 2px
    };
    const score = useRef({
        1: 0,
        2: 0,
    });

    const [firstPlayerName, setFirstNamePlayer] = useState("firstPlayerName..");
    const [secondPlayerName, setSecondNamePlayer] =
        useState("secondPlayerName..");
    const [isBlurry, setBlurry] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);

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

        swal({
            text: `${playerName} won the round :))`,
            buttons: {
                menu: "Return to menu",
                play: "Play-again",
            },
        }).then((value) => {
            console.log(value);
            if (value === "menu") {
                // later we will change this to creat a menu
                enterPlayerNames();
            } else if (value === "play") {
                // play again
                enterPlayerNames();
            }
        });
    };

    const animate = () => {
        requestAnimationFrame(animate); // The requestAnimationFrame() method used to repeat something pretty fast :) => alternative to setInterval()
        // if (!ok) return;
        if (isPlaying === true) {
            // clearing the canvas
            context.clearRect(0, 0, boardWidth, boardHeight);

            // player 1
            context.fillStyle = "skyBlue";
            if (!outOfBound(player1.y + player1.velocityY)) {
                player1.y += player1.velocityY;
            }
            context.fillRect(
                player1.x,
                player1.y,
                player1.width,
                player1.height,
            ); // fillRect(x,y,width,height)

            // player 2
            if (!outOfBound(player2.y + player2.velocityY)) {
                player2.y += player2.velocityY;
            }
            context.fillRect(
                player2.x,
                player2.y,
                player2.width,
                player2.height,
            ); // fillRect(x,y,width,height)
            // changing the color of the ball
            context.fillStyle = "#fff";
            // changing the pos of the ball
            ball.x += ball.velocityX;
            ball.y += ball.velocityY;
            // recreating the ball
            context.fillRect(ball.x, ball.y, ball.width, ball.height);
            // changing the velocity/direction of the ball when it hits the top/bottom of boundries.
            if (ball.y <= 0 || ball.y + ball.height >= boardHeight) {
                ball.velocityY *= -1;
            }
            // detecting collision with player1 or with player2
            if (detectCollision(ball, player1)) {
                // left side of ball touches right side of player1
                if (ball.x <= player1.x + player1.width) {
                    ball.velocityX *= -1;
                }
            } else if (detectCollision(ball, player2)) {
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
                    velocityY: 2,
                };
            };
            // console.log(stuckScores);
            // if(stuckScores === true) {
            //     resetGame(1);
            // }

            // game over
            if (ball.x < 0) {
                score.current[2] += 1;
                resetGame(1);
            } else if (ball.x + ballWidth > boardWidth) {
                score.current[1] += 1;
                resetGame(-1);
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
            context.fillStyle = "#15b7cd";
            context.fillRect(board.width / 2, 0, 5, board.height);
            // console.log(document.querySelector(".btn"));
            console.log(document.querySelector(".btn") === null);
            if (
                score.current[1] >= 6 &&
                isPlaying === true &&
                document.querySelector(".btn") === null
            ) {
                win(firstPlayerName);
            } else if (
                score.current[2] >= 6 &&
                isPlaying === true &&
                document.querySelector(".btn") === null
            ) {
                win(secondPlayerName);
            }
        }
    };

    const movePlayer = (e: any) => {
        if (e.key === "z") {
            player1.velocityY = -3;
        } else if (e.key === "s") {
            player1.velocityY = 3;
        }

        if (e.key === "ArrowUp") {
            player2.velocityY = -3;
        } else if (e.key === "ArrowDown") {
            player2.velocityY = 3;
        }

        // to pause
        // if (e.key === "Escape") {
        //     if (isPlaying === true) {
        //         // set blurry background
        //         if (!isBlurry) {
        //             setBlurry(true);
        //         }
        //         swal("menu").then(() => {});
        //     }
        // }
    };

    const resetScores = (): void => {
        score.current[1] = 0;
        score.current[2] = 0;
    };

    const enterPlayerNames = async (): Promise<any> => {
        setIsPlaying(false);

        const name = await swal({
            title: "Player1, what is ur nickname?",
            text: "If you're feeling mysterious, hit ESC to skip.",
            content: "input",
            button: {
                text: "Ok!",
                closeModal: true,
            },
            className: "btn",
        });
        document.querySelector(".btn")?.remove();
        if (name !== null && name.trim() !== "") {
            setFirstNamePlayer(name);
        }
        const name1 = await swal({
            title: "Player2, what is ur nickname?",
            text: "If you're feeling mysterious, hit ESC to skip.",
            content: "input",
            button: {
                text: "Ok!",
                closeModal: true,
            },
            className: "btn",
            closeOnEsc: true,
        });
        document.querySelector(".btn")?.remove();
        if (name1 !== null && name1.trim() !== "") {
            setSecondNamePlayer(name1);
        }
        await swal({
            text: `Once click "ok" your game will start :))`,
            button: {
                text: "Ok!",
                closeModal: true,
            },
            className: "btn",
            closeOnEsc: true,
        });
        document.querySelector(".btn")?.remove();
        // reset the players' scores
        resetScores();
        // set blurry backerground
        setBlurry(false);
        // start the game
        setIsPlaying(true);
    };

    useEffect(() => {
        // entering names
        enterPlayerNames();

        board = document.getElementById("board") as HTMLCanvasElement;
        board.height = boardHeight;
        board.width = boardWidth;
        context = board.getContext("2d") as CanvasRenderingContext2D;
        // drawing the first player
        context.fillStyle = "skyBlue";
        // drawing a rectangle
        context.fillRect(player1.x, player1.y, player1.width, player1.height); // fillRect(x,y,width,height)
        // loop of game
        requestAnimationFrame(animate);
        window.addEventListener("keyup", movePlayer);
        // return () => {};
    }, []);
    // const s = withSwal(Swal);
    return (
        <section className={isBlurry === true ? "blurry" : ""}>
            <div className="title">pong game</div>
            <div className="options-container">
                <button className="options">options</button>
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

export default App;
