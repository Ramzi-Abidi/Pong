
import {Radio, FormControl, FormControlLabel, FormLabel, RadioGroup, Button, Icon, Divider} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

const Settings = (props: any) => {
    const navigate = useNavigate();

    const [settings, setSettings] = useState(props.settings);

    const handleSpeedChange = (event:any) => {
        const option = event.target.value;
        setSettings({ ...settings, speedOption: option});
    }

    const handlePointsChange = (event:any) => {
        const option = event.target.value;
        setSettings({ ...settings, pointOption: option});
    }


    const onTrigger = () => {
        props.parentCallBack(settings, false);
        navigate("/");
    }

    return (
    <div className="slowed-blurry-background">
      <div className="overlay"></div>
        <div className="pong-background"></div>
            <section className="stepper disable-blur">
                
                {/* Speed Settings */}
                <FormControl>
                    <FormLabel id="demo-radio-buttons-group-label">
                        <div className="title home-title-section">
                            <h3>Set Speed</h3>
                        </div>
                    </FormLabel>
                    
                    <RadioGroup
                    row
                    aria-labelledby='demo-radio-buttons-group-label'
                    defaultValue='Medium'
                    name='radio-buttons-group'
                    value = {settings.speedOption} onChange={handleSpeedChange}>  
                        <FormControlLabel value= 'slow' control={<Radio />} label='Slow' />
                        <FormControlLabel value= 'medium' control={<Radio />} label='Medium' />
                        <FormControlLabel value= 'fast' control={<Radio />} label='Fast' />
                    </RadioGroup>

                </FormControl>
                <Divider />

            {/* Points Settings */}
                <FormControl>
                    <FormLabel id="demo-radio-buttons-group-label">
                        <div className="title home-title-section">
                            <h3>Set Points</h3>
                        </div>
                    </FormLabel>
                    
                    <RadioGroup
                    row
                    aria-labelledby='demo-radio-buttons-group-label'
                    defaultValue='Medium'
                    name='radio-buttons-group'
                    value = {settings.pointOption} onChange={handlePointsChange}>  
                        <FormControlLabel value= '5' control={<Radio />} label='5 points' />
                        <FormControlLabel value= '10' control={<Radio />} label='10 points' />
                        <FormControlLabel value= '15' control={<Radio />} label='15 points' />
                    </RadioGroup>

                    {/* More settings be added here and wrapped to a data object to be sent back to parentCallBack */}

                </FormControl>
                <Divider/>
                <Button
                    onClick={onTrigger}
                    className="two-player"
                    startIcon={<HomeIcon />}>
                    {" "}
                    Home{" "}
                </Button>

                
            </section> 
        </div>
  )
}

export default Settings
