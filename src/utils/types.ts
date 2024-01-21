import { SwalOptions } from "sweetalert/typings/modules/options";

export type player = {
    x: number;
    y: number;
    width: number;
    height: number;
    velocityY: number;
    stopPlayer?: boolean;
};

export type ball = player & {
    velocityX: number; // shhifting by 2px
};

export type score = {
    1: number;
    2: number;
};
