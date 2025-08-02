import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import "./i18n";

import HomePage from "./pages/HomePage";
import CommandPage from "./pages/CommandPage";
import CharacterPage from "./pages/CharacterPage";
import ArenaPage from "./pages/ArenaPage";
import ContentPage from "./pages/ContentPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="character" element={<CharacterPage />} />
                    <Route path="arena" element={<ArenaPage />} />
                    <Route path="content" element={<ContentPage />} />
                    <Route path="command" element={<CommandPage />} />
                    <Route path="*" element={<HomePage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
