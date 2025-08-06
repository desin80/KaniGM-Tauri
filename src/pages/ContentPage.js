import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import "./ContentPage.css";
import TotalAssaultSection from "../components/TotalAssaultSection";
import GrandAssaultSection from "../components/GrandAssaultSection";
import TimeAttackDungeonSection from "../components/TimeAttackDungeonSection";
import MultiFloorRaidSection from "../components/MultiFloorRaidSection";

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
            <div className="details-grid">
                <TotalAssaultSection
                    title={t("content.totalAssault")}
                    raids={totalAssaults}
                    onSetRaid={handleSetRaid}
                    isLoading={isLoading}
                    showStatus={showStatus}
                />
                <GrandAssaultSection
                    title={t("content.grandAssault")}
                    raids={grandAssaults}
                    onSetRaid={handleSetRaid}
                    isLoading={isLoading}
                    showStatus={showStatus}
                />
                <TimeAttackDungeonSection
                    title={t("content.jointFiringDrill")}
                    dungeons={timeAttackDungeons}
                    onSetRaid={handleSetRaid}
                    isLoading={isLoading}
                    showStatus={showStatus}
                />
                <MultiFloorRaidSection
                    title={t("content.finalRestrictionRelease")}
                    raids={multiFloorRaids}
                    onSetRaid={handleSetRaid}
                    isLoading={isLoading}
                    showStatus={showStatus}
                />
            </div>
        </main>
    );
};

export default ContentPage;
