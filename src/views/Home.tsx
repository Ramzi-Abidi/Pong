import { Button, Checkbox } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const label = { inputProps: { "aria-label": "Checkbox demo" } };
    const navigate = useNavigate();

    const handleClick = (e: any): void => {
        // console.log(e.target.innerHTML.toString().trim().toLowerCase().indexOf("single") !== -1);
        if (e.target.innerHTML.toString().trim().toLowerCase().indexOf("single") !== -1) {
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
                <div className="home-title disable-blur">
                    <h3>Welcome to pong game</h3>
                </div>
                <div className="menu">
                    <div className="checkbox">
                        <Checkbox {...label} defaultChecked />
                        Sound
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
