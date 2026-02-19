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

export interface HomeProps {
    isSoundOn: boolean;
    onSoundChange: () => void;
}
export interface AudioComponentProps {
  onAudioEnd: () => void;
  path: string;
  volume: number;
}

export interface MultiplePlayerModeProps {
    settings: SettingProps;
    isSoundOn: boolean;
}


export interface SinglePlayerModeProps {
    settings: SettingProps;
    isSoundOn: boolean;
}
export enum SpeedOption {
    SLOW = 'slow',
    MEDIUM = 'medium',
    FAST = 'fast',
}
export interface SettingProps {
    speedOption: SpeedOption;
    pointOption: number;
}