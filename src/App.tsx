import React, { useEffect } from "react";

const App = () => {
    let boardWidth: number = 500;
    let boardHeight: number = 500;
    let context: CanvasRenderingContext2D;
    let board: HTMLCanvasElement | null;

    let playerWidth: number = 10;
    let playerHeight: number = 50;

    let player1: player = {
        x: 10,
        y: boardHeight / 2,
        width: playerWidth,
        height: playerHeight,
    };

    let player2: player = {
        x: boardWidth - playerWidth - 10,
        y: boardHeight / 2,
        width: playerWidth,
        height: playerHeight,
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
        // return () => {};
        // drawing a rectangle
        requestAnimationFrame(animate);

        // return () => {};
    }, []);

    const animate = () => {
        context.fillStyle = "skyBlue";

        context.fillRect(player2.x, player2.y, player2.width, player2.height); // fillRect(x,y,width,height)
    };
    return (
        <div>
            <canvas id="board"> </canvas>
        </div>
    );
};

export default App;
