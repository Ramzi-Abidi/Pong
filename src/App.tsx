import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SinglePlayerMode from "./views/SinglePlayerMode";
import MultiplePlayerMode from "./views/MultiplePlayerMode";
import Home from "./views/Home";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route index path="/" element={<Home />} />
                <Route index path="/multiple-player" element={<MultiplePlayerMode />} />
                <Route index path="/single-player" element={<SinglePlayerMode />} />
            </Routes>
        </Router>
    );
};

export default App;
