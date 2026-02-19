import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import pongImage from "../assets/pong-header.png";
import soundOnImage from "../assets/sound-on.png";
import soundOffImage from "../assets/sound-off.png";
import singlePlayerIcon from "../assets/single-player.png";
import multiPlayerIcon from "../assets/multi-player.png";
import settingsIcon from "../assets/settings-icon.png";
import GitHubIcon from "@mui/icons-material/GitHub";
import buttonClickSound from "../assets/button-click-sound.mp3";
import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";

const Home = () => {
    const isSoundOn = useAppStore((state) => state.isSoundOn);
    const toggleSound = useAppStore((state) => state.toggleSound);

    useEffect(() => {
        const swalEl: HTMLElement | null = document.querySelector(
            ".swal-overlay",
        ) as HTMLElement | null;
        if (swalEl) {
            swalEl.remove();
        }
    }, []);

    const navigate = useNavigate();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const clickedEl: string = e.currentTarget.className
            .toString()
            .trim()
            .toLowerCase();

        if (clickedEl.indexOf("settings") !== -1) {
            navigate('/settings');
        } else if (clickedEl.indexOf("single") !== -1) {
            navigate("/single-player");
        } else {
            navigate("/multiple-player");
        }
    };

    const playSound = () => {
        if (isSoundOn) {
            const audio = new Audio(buttonClickSound);
            audio.play();
        }
    };

    const playMutedSound = () => {
        const audio = new Audio(buttonClickSound);
        audio.play();
    };

    return (
        <div className="slowed-blurry-background">
            <div className="overlay"></div>
            <div className="pong-background"></div>

            <section className="stepper disable-blur">
                <div className="title home-title-section">
                    <a
                        href="https://github.com/Ramzi-Abidi/Pong"
                        target="__blank"
                        className="star-github-link"
                    >
                        <div className="star-github-button" onClick={playSound}>
                            <GitHubIcon className="github-star-icon" />
                            <p>Give Repo Star</p>
                        </div>
                    </a>
                    <h3>pong game</h3>
                    <div className="img-container">
                        <img
                            src={pongImage}
                            alt="Pong"
                            className="pong-header"
                        />
                    </div>
                </div>
                <div className="home-title disable-blur">
                    <p className="">Choose a mode to continue</p>
                </div>
                <div className="menu">
                    <div className="checkbox">
                        {isSoundOn && (
                            <img
                                src={soundOnImage}
                                onClick={toggleSound}
                                className="sound-icon"
                                alt="Sound on"
                            />
                        )}

                        {!isSoundOn && (
                            <img
                                src={soundOffImage}
                                onClick={() => { toggleSound(); playMutedSound(); }}
                                className="sound-icon"
                                alt="Sound off"
                            />
                        )}
                        <h4>Sound{isSoundOn ? " On" : " Off"}</h4>
                    </div>
                    <div className="container-btn">
                        <div className="home-page-option">
                            <Button
                                onClick={(e) => { handleClick(e); playSound(); }}
                                className="single-player"
                            >
                                <img src={singlePlayerIcon} alt="" />
                                Single player
                            </Button>
                        </div>

                        <div className="home-page-option">
                            <Button
                                onClick={(e) => { handleClick(e); playSound(); }}
                                className="two-player"
                            >
                                <img src={multiPlayerIcon} alt="" />
                                Two players
                            </Button>
                        </div>

                        <div className="home-page-option">
                            <Button
                                onClick={(e) => { handleClick(e); playSound(); }}
                                className="settings"
                            >
                                <img src={settingsIcon} alt="" />
                                Settings
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
