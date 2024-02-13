import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import SinglePlayerMode from "./views/SinglePlayerMode";
import MultiplePlayerMode from "./views/MultiplePlayerMode";
import Home from "./views/Home";
import Settings from "./views/Settings";

const App = () => {

    const [isSoundOn, setIsSoundOn] = useState(true);

    const handleSoundChange = () => {
        setIsSoundOn(isSoundOn => !isSoundOn);
    }

    const [settings, setSettings] = useState({
        speedOption : 'medium' 
    });
    const updateSpeed = (option: string) => {
        setSettings({ ...settings, speedOption: option})
    }

    const handleCallBack = (data: any, showSettings: boolean) => {
        updateSpeed(data.speedOption);
    }

    return (
        <Router>
            <Routes>
                <Route index path="/" element={<Home isSoundOn={isSoundOn} onSoundChange={handleSoundChange}/>} />
                <Route index path="/multiple-player" element={<MultiplePlayerMode settings={settings}  isSoundOn={isSoundOn}/>} />
                <Route index path="/single-player" element={<SinglePlayerMode settings = {settings} isSoundOn={isSoundOn} />} />
                <Route index path="/settings" element={<Settings parentCallBack={handleCallBack} settings={settings} isSoundOn={isSoundOn}/>} />
            </Routes>
        </Router>
    );
};

export default App;
