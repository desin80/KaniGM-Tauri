import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import "./i18n";

import HomePage from "./pages/HomePage";
import CommandPage from "./pages/CommandPage";
import CharacterPage from "./pages/CharacterPage";
import ArenaPage from "./pages/ArenaPage";
import ContentPage from "./pages/ContentPage";
import SettingsPage from "./pages/SettingsPage";
import React, { useState, useEffect } from "react";
import api from "./services/api";
import Hina from "./components/Hina";

function App() {
    const [isBackendReady, setIsBackendReady] = useState(false);

    useEffect(() => {
        if (isBackendReady) {
            return;
        }

        let intervalId;

        const checkStatus = async () => {
            const ready = await api.hinaCheck();
            if (ready) {
                setIsBackendReady(true);
                clearInterval(intervalId);
            }
        };

        checkStatus();
        intervalId = setInterval(checkStatus, 1000);

        return () => clearInterval(intervalId);
    }, [isBackendReady]);

    if (!isBackendReady) {
        const message =
            "Sensei, please make sure the server is running and\n you’ve registered an in-game account before using";
        return <Hina message={message} />;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="character" element={<CharacterPage />} />
                    <Route path="arena" element={<ArenaPage />} />
                    <Route path="content" element={<ContentPage />} />
                    <Route path="command" element={<CommandPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="*" element={<HomePage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
