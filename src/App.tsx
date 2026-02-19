import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SinglePlayerMode from "./views/SinglePlayerMode";
import MultiplePlayerMode from "./views/MultiplePlayerMode";
import Home from "./views/Home";
import Settings from "./views/Settings";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route index path="/" element={<Home />} />
                <Route path="/multiple-player" element={<MultiplePlayerMode />} />
                <Route path="/single-player" element={<SinglePlayerMode />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </Router>
    );
};

export default App;
