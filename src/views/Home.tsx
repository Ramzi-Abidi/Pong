import { Alert, Button, Checkbox } from "@mui/material";
import { useNavigate } from "react-router-dom";
import pongImage from "../assets/pong-header.png";
import soundOnImage from "../assets/sound-on.png";
import soundOffImage from "../assets/sound-off.png";
import singlePlayerIcon from "../assets/single-player.png";
import multiPlayerIcon from "../assets/multi-player.png";
import settingsIcon from "../assets/settings-icon.png";
import GitHubIcon from "@mui/icons-material/GitHub";
import { HomeProps } from "../utils/types";
import { useEffect } from "react";

const Home: React.FC<HomeProps> = ({ isSoundOn, onSoundChange }) => {
    useEffect(() => {
        // check if the DOM does contain any sweet alert element just remove it.
        const swalEl: HTMLElement | null = document.querySelector(
            ".swal-overlay",
        ) as HTMLElement | null;
        if (swalEl) {
            swalEl.remove();
        }
    }, []);

    const navigate = useNavigate();

    const handleClick = (e: any): void => {
        // prevent the default behavior of the button
        // e.preventDefault();

        const clickedEl: string = e.target.innerHTML
            .toString()
            .trim()
            .toLowerCase();

        // if user clicks on settings button
        if (clickedEl.indexOf("settings") !== -1) {
            alert("Still working on the settings!");
        }
        // if user clicks on single-player button
        else if (clickedEl.indexOf("single") !== -1) {
            navigate("/single-player");
        }
        // if user clicks on multiple-player button
        else {
            navigate("/multiple-player");
        }
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
                        <div className="star-github-button">
                            <GitHubIcon className="github-star-icon" />
                            <p>Star GitHub</p>
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
                        {/* <img src={soundOnImage} className="sound-icon" alt="" /> */}
                        {/* <Checkbox {...label} defaultChecked /> */}
                        {isSoundOn && (
                            <img
                                src={soundOnImage}
                                onClick={onSoundChange}
                                className="sound-icon"
                            ></img>
                        )}

                        {!isSoundOn && (
                            <img
                                src={soundOffImage}
                                onClick={onSoundChange}
                                className="sound-icon"
                            ></img>
                        )}
                        <h4>Sound{isSoundOn ? " On" : " Off"}</h4>
                    </div>
                    <div className="container-btn">
                        <div className="home-page-option">
                            <Button onClick={handleClick} className="single-player">
                                {" "}
                                <img src={singlePlayerIcon} alt="" />
                                Single player{" "}
                            </Button>
                        </div>

                        <div className="home-page-option">
                            <Button onClick={handleClick} className="two-player">
                                {" "}
                                <img src={multiPlayerIcon} alt="" />
                                Two players{" "}
                            </Button>
                        </div>

                        <div className="home-page-option">
                            <Button onClick={handleClick} className="settings">
                                {" "}
                                <img src={settingsIcon} alt="" />
                                Settings{" "}
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
