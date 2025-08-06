import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import "./ContentPage.css";
import TotalAssaultSection from "../components/raid/TotalAssaultSection";
import GrandAssaultSection from "../components/raid/GrandAssaultSection";
import TimeAttackDungeonSection from "../components/raid/TimeAttackDungeonSection";
import MultiFloorRaidSection from "../components/raid/MultiFloorRaidSection";

const StatusPopup = ({ message, isError }) => {
    if (!message) return null;
    const baseClasses =
        "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-4 rounded-lg shadow-xl text-sm font-medium z-[100]";
    const successClasses =
        "bg-green-100 border border-green-400 text-green-700";
    const errorClasses = "bg-red-100 border border-red-400 text-red-700";
    return (
        <div
            className={`${baseClasses} ${isError ? errorClasses : successClasses}`}
        >
            {message}
        </div>
    );
};

const ContentPage = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("totalAssault");

    const [totalAssaults, setTotalAssaults] = useState([]);
    const [grandAssaults, setGrandAssaults] = useState([]);
    const [timeAttackDungeons, setTimeAttackDungeons] = useState([]);
    const [multiFloorRaids, setMultiFloorRaids] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState({
        text: "",
        isError: false,
    });

    const showStatus = (text, isError = false) => {
        setStatusMessage({ text, isError });
        setTimeout(() => setStatusMessage({ text: "", isError: false }), 2500);
    };

    useEffect(() => {
        const loadRaidData = async () => {
            setIsLoading(true);
            try {
                const data = await api.getRaid();
                setTotalAssaults(data.totalAssault || []);
                setGrandAssaults(data.grandAssault || []);
                setTimeAttackDungeons(data.timeAttackDungeon || []);
                setMultiFloorRaids(data.multiFloor || []);
            } catch (error) {
                console.error("Error fetching raid data:", error);
                showStatus(`Failed to load raid data: ${error.message}`, true);
            } finally {
                setIsLoading(false);
            }
        };
        loadRaidData();
    }, []);

    const handleSetRaid = async (raidType, seasonId) => {
        try {
            await api.setRaid(raidType, seasonId);
            showStatus(
                `${t("content.raidSetSuccess", { id: seasonId })}`,
                false
            );
        } catch (error) {
            console.error("Error setting raid:", error);
            showStatus(
                `${t("content.raidSetError", { error: error.message })}`,
                true
            );
        }
    };

    return (
        <main className="space-y-6">
            <StatusPopup
                message={statusMessage.text}
                isError={statusMessage.isError}
            />

            <header className="mb-6 md:mb-8">
                <div className="mt-3 sm:mt-4 border-b border-gray-200">
                    <nav
                        className="-mb-px flex space-x-2 sm:space-x-4"
                        aria-label="Tabs"
                    >
                        <button
                            onClick={() => setActiveTab("totalAssault")}
                            className={`px-4 py-3 sm:px-6 text-center border-b-2 cursor-pointer hover:text-gray-200 hover:border-gray-300 transition-colors duration-150  ${activeTab === "totalAssault" ? "text-sky-400 border-sky-500" : "text-white border-transparent"}`}
                        >
                            {t("content.totalAssault")}
                        </button>
                        <button
                            onClick={() => setActiveTab("grandAssault")}
                            className={`px-4 py-3 sm:px-6 text-center border-b-2 cursor-pointer hover:text-gray-200 hover:border-gray-300 transition-colors duration-150  ${activeTab === "grandAssault" ? "text-sky-400 border-sky-500" : "text-white border-transparent"}`}
                        >
                            {t("content.grandAssault")}
                        </button>
                        <button
                            onClick={() => setActiveTab("timeAttackDungeon")}
                            className={`px-4 py-3 sm:px-6 text-center border-b-2 cursor-pointer hover:text-gray-200 hover:border-gray-300 transition-colors duration-150 ${activeTab === "timeAttackDungeon" ? "text-sky-400 border-sky-500" : "text-white border-transparent"}`}
                        >
                            {t("content.jointFiringDrill")}
                        </button>
                        <button
                            onClick={() => setActiveTab("multiFloorRaid")}
                            className={`px-4 py-3 sm:px-6 text-center border-b-2 cursor-pointer hover:text-gray-200 hover:border-gray-300 transition-colors duration-150  ${activeTab === "multiFloorRaid" ? "text-sky-400 border-sky-500" : "text-white border-transparent"}`}
                        >
                            {t("content.finalRestrictionRelease")}
                        </button>
                    </nav>
                </div>
            </header>

            <div>
                {activeTab === "totalAssault" && (
                    <TotalAssaultSection
                        raids={totalAssaults}
                        onSetRaid={handleSetRaid}
                        isLoading={isLoading}
                        showStatus={showStatus}
                    />
                )}
                {activeTab === "grandAssault" && (
                    <GrandAssaultSection
                        raids={grandAssaults}
                        onSetRaid={handleSetRaid}
                        isLoading={isLoading}
                        showStatus={showStatus}
                    />
                )}
                {activeTab === "timeAttackDungeon" && (
                    <TimeAttackDungeonSection
                        dungeons={timeAttackDungeons}
                        onSetRaid={handleSetRaid}
                        isLoading={isLoading}
                        showStatus={showStatus}
                    />
                )}
                {activeTab === "multiFloorRaid" && (
                    <MultiFloorRaidSection
                        raids={multiFloorRaids}
                        onSetRaid={handleSetRaid}
                        isLoading={isLoading}
                        showStatus={showStatus}
                    />
                )}
            </div>
        </main>
    );
};

export default ContentPage;
