import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SinglePlayerMode from "./views/SinglePlayerMode";
import MultiplePlayerMode from "./views/MultiplePlayerMode";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route index path="/" element={<MultiplePlayerMode />} />
                <Route index path="/single-player" element={<SinglePlayerMode />} />
            </Routes>
        </Router>
    );
};

export default App;
