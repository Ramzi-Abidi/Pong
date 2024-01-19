type player = {
    x: number;
    y: number;
    width: number;
    height: number;
    velocityY: number;
};

type ball = player & {
    velocityX: number; // shhifting by 2px
};
