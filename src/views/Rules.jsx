import React from 'react'
import pongImage from "../assets/pong-header.png";
import soundOn from "../assets/sound-on.png";
import soundOff from "../assets/sound-off.png"
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Rules = ({ isSoundOn, onSoundChange }) => {

    const [optionsModal, setOptionsModal] = useState(false);

    const handleOptionsModal = () => {
        setOptionsModal(prevOptionsModal => !prevOptionsModal);
    }

    return (
        <div>
            <div className="title">
                <h3>pong game</h3>
                <div className="img-container">
                    <img src={pongImage} alt="Pong" className="pong-header" />
                </div>
            </div>

            <div className="menu-container">
                <h2>Welcome to the Pong game!</h2>
                <h2>Choose an option to continue</h2>

                <div className="rules-menu">

                    <div className="rules-box">
                        <h1>Play</h1>
                        <Link to={'/single-player'}><button className='rules-box-btn'>Single Player</button></Link>
                        <Link to={'/multi-player'}><button className='rules-box-btn'>Multi Player</button></Link>
                    </div>


                    <div className="rules-box">
                        <h1 onClick={handleOptionsModal} className='options-heading'>Options</h1>
                        {optionsModal && (
                            <div className="options-menu">
                                <h2>Sound</h2>
                                {isSoundOn && (
                                    <img src={soundOn} onClick={onSoundChange}></img>
                                )}

                                {!isSoundOn && (
                                    <img src={soundOff} onClick={onSoundChange}></img>
                                )}
                            </div>
                        )}
                        {!optionsModal && (
                            <h4>Click options to view!</h4>
                        )}
                    </div>
                </div>
            </div>


        </div>
    )
}

export default Rules
