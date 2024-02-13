
import {Radio, FormControl, FormControlLabel, FormLabel, RadioGroup, Button, Icon} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

const Settings = (props: any) => {
    const navigate = useNavigate();

    const [settings, setSettings] = useState(props.settings);
    const handleChange = (event:any) => {
        const option = event.target.value;
        setSettings({ ...settings, speedOption: option });
    }

    const onTrigger = () => {
        props.parentCallBack(settings, false);
        navigate("/");
    }

    return (
    <div className="slowed-blurry-background">
      <div className="overlay"></div>
        <div className="pong-background"></div>
            <section className = "stepper disable-blur">
                <FormControl>
                    <FormLabel id="demo-radio-buttons-group-label">
                        <div className="title home-title-section">
                            <h3>Speed</h3>
                        </div>
                    </FormLabel>
                    
                    <RadioGroup
                    aria-labelledby='demo-radio-buttons-group-label'
                    defaultValue='Medium'
                    name='radio-buttons-group'
                    value = {settings.speedOption} onChange={handleChange}>  
                        <FormControlLabel value= 'slow' control={<Radio />} label='Slow' />
                        <FormControlLabel value= 'medium' control={<Radio />} label='Medium' />
                        <FormControlLabel value= 'fast' control={<Radio />} label='Fast' />
                    </RadioGroup>

                    {/* More settings be added here and wrapped to a data object to be sent back to parentCallBack */}

                            <Button
                                onClick={onTrigger}
                                className="two-player"
                                startIcon={<HomeIcon />}>
                                {" "}
                                Home{" "}
                            </Button>
                </FormControl>
            </section> 
        </div>
  )
}

export default Settings
