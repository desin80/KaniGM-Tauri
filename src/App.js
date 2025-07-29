import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import HomePage from "./pages/HomePage";
import CommandPage from "./pages/CommandPage";
import CharacterPage from "./pages/CharacterPage";

const ArenaPage = () => <div>Arena Page Content</div>;
const ContentPage = () => <div>Content/Raid Page Content</div>;

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
