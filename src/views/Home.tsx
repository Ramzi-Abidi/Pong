import { Button, Checkbox } from "@mui/material";
import { useNavigate } from "react-router-dom";
import pongImage from "../assets/pong-header.png";
import soundOnImage from "../assets/sound-on.png";
import soundOffImage from "../assets/sound-off.png";
import { HomeProps } from "../utils/types";
import { useEffect } from "react";

const Home: React.FC<HomeProps> = ({ isSoundOn, onSoundChange }) => {
    useEffect(() => {
        // check if the DOM does contain an alert (sweetAlert) just remove it.
        return () => {};
    }, []);
    const navigate = useNavigate();

    const handleClick = (e: any): void => {
        // console.log(e.target.innerHTML.toString().trim().toLowerCase().indexOf("single") !== -1);
        if (
            e.target.innerHTML
                .toString()
                .trim()
                .toLowerCase()
                .indexOf("single") !== -1
        ) {
            navigate("/single-player");
        } else {
            navigate("/multiple-player");
        }
    };

    return (
        <div className="slowed-blurry-background">
            <div className="overlay"></div>
            <div className="pong-background"></div>
            <section className="stepper disable-blur">
                <div className="title home-title-section">
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
                        <Button onClick={handleClick} className="single-player">
                            {" "}
                            Single player{" "}
                        </Button>
                        <Button onClick={handleClick} className="two-player">
                            {" "}
                            Two players{" "}
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
