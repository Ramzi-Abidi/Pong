import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Rules from "./views/Rules";
import SinglePlayerMode from "./views/SinglePlayerMode";
import MultiplePlayerMode from "./views/MultiplePlayerMode";

const App = () => {

    const [isSoundOn, setIsSoundOn] = useState(true);

    const handleSoundChange = () => {
        setIsSoundOn(prevSound => !prevSound);
    }

    return (
        <Router>
            <Routes>
                <Route index path="/" element={<Rules isSoundOn={isSoundOn} onSoundChange={handleSoundChange}/>} />
                <Route index path="/multi-player" element={<MultiplePlayerMode isSoundOn={isSoundOn}/>} />
                <Route index path="/single-player" element={<SinglePlayerMode isSoundOn={isSoundOn}/>} />
            </Routes>
        </Router>
    );
};

export default App;
