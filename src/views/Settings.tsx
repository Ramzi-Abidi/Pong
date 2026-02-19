import {
    Radio,
    FormControl,
    FormControlLabel,
    FormLabel,
    RadioGroup,
    Button,
    Divider,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import { useAppStore, GameSettings } from "../store/useAppStore";

const Settings = () => {
    const navigate = useNavigate();
    const storeSettings = useAppStore((state) => state.settings);
    const updateSettings = useAppStore((state) => state.updateSettings);

    const [localSettings, setLocalSettings] = useState<GameSettings>(storeSettings);

    const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const option = event.target.value as GameSettings['speedOption'];
        setLocalSettings({ ...localSettings, speedOption: option });
    };

    const handlePointsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const option = parseInt(event.target.value, 10);
        setLocalSettings({ ...localSettings, pointOption: option });
    };

    const onSave = () => {
        updateSettings(localSettings);
        navigate("/");
    };

    return (
        <div className="slowed-blurry-background">
            <div className="overlay"></div>
            <div className="pong-background"></div>
            <section className="stepper disable-blur">
                <FormControl>
                    <FormLabel id="speed-radio-group-label">
                        <div className="title home-title-section">
                            <h3>Set Speed</h3>
                        </div>
                    </FormLabel>

                    <RadioGroup
                        row
                        aria-labelledby="speed-radio-group-label"
                        name="speed-radio-group"
                        value={localSettings.speedOption}
                        onChange={handleSpeedChange}
                    >
                        <FormControlLabel
                            value="slow"
                            control={<Radio />}
                            label="Slow"
                        />
                        <FormControlLabel
                            value="medium"
                            control={<Radio />}
                            label="Medium"
                        />
                        <FormControlLabel
                            value="fast"
                            control={<Radio />}
                            label="Fast"
                        />
                    </RadioGroup>
                </FormControl>
                <Divider />

                <FormControl>
                    <FormLabel id="points-radio-group-label">
                        <div className="title home-title-section">
                            <h3>Set Points</h3>
                        </div>
                    </FormLabel>

                    <RadioGroup
                        row
                        aria-labelledby="points-radio-group-label"
                        name="points-radio-group"
                        value={localSettings.pointOption.toString()}
                        onChange={handlePointsChange}
                    >
                        <FormControlLabel
                            value="5"
                            control={<Radio />}
                            label="5 points"
                        />
                        <FormControlLabel
                            value="10"
                            control={<Radio />}
                            label="10 points"
                        />
                        <FormControlLabel
                            value="15"
                            control={<Radio />}
                            label="15 points"
                        />
                    </RadioGroup>
                </FormControl>
                <Divider />
                <Button
                    onClick={onSave}
                    className="two-player"
                    startIcon={<HomeIcon />}
                >
                    Save & Go Home
                </Button>
            </section>
        </div>
    );
};

export default Settings;
