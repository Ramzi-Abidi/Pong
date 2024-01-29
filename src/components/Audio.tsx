import React, { useEffect, useRef } from 'react';
import { AudioComponentProps } from '../utils/types';

const AudioComponent: React.FC<AudioComponentProps> = ({ onAudioEnd, path, volume }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <audio ref={audioRef} src={path} autoPlay onError={(e) => {
      console.error(`Failed to load audio file: ${path}`, e);
    }} onEnded={onAudioEnd} />
  );
};

export default AudioComponent;