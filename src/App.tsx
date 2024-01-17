import React, { useEffect, useRef } from "react";

const App = () => {
    let boardWidth: number = 500;
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

    let ball = {
        x: boardWidth / 2,
        y: boardHeight / 2,
        width: ballWidth,
        height: ballHeight,
        velocityX: 1, // shhifting by 1px
        velocityY: 2, // shhifting by 2px
    };

    const score = useRef({
        "1": 0,
        "2": 0,
    });

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

    const animate = () => {
        requestAnimationFrame(animate); // The requestAnimationFrame() method used to repeat something pretty fast :) => alternative for setInterval()
        // clearing the canvas
        context.clearRect(0, 0, boardWidth, boardHeight);

        // player 1
        context.fillStyle = "skyBlue";
        if (!outOfBound(player1.y + player1.velocityY)) {
            player1.y += player1.velocityY;
        }
        context.fillRect(player1.x, player1.y, player1.width, player1.height); // fillRect(x,y,width,height)

        // player 2
        if (!outOfBound(player2.y + player2.velocityY)) {
            player2.y += player2.velocityY;
        }
        context.fillRect(player2.x, player2.y, player2.width, player2.height); // fillRect(x,y,width,height)
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
    };

    const movePlayer = (e: any) => {
        // console.log(e);
        console.log(player1);
        console.log(player2);

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
        // loop of game
        requestAnimationFrame(animate);
        window.addEventListener("keyup", movePlayer);
        // return () => {};
    }, []);

    return (
        <div>
            <div className="title">pong game</div>
            <div className="score">
                {/* <h2> {score.current[1]} </h2> */}
                {/* <h2> {score.current[2]} </h2> */}
            </div>
            <canvas id="board"></canvas>
        </div>
    );
};

export default App;
