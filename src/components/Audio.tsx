import React, { useEffect, useRef } from "react";
import { AudioComponentProps } from "../utils/types";

const AudioComponent: React.FC<AudioComponentProps> = ({
    onAudioEnd,
    path,
    volume,
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            if (path.indexOf("background-music") !== -1) {
                audioRef.current.loop = true; // Enable loop for continuous playback
            }
        }
    }, [volume]);

    return (
        <audio
            ref={audioRef}
            src={path}
            autoPlay
            onError={(e) => {
                console.error(`Failed to load audio file: ${path}`, e);
            }}
            onEnded={onAudioEnd}
        />
    );
};

export default AudioComponent;
