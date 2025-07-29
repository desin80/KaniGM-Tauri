import React, { useState, useEffect } from "react";
import api from "../services/api";
import "./ContentPage.css";
import RaidSection from "../components/RaidSection";

const jfdTypeMap = {
    1: "Defense",
    2: "Shooting",
    3: "Destruction",
    4: "Escort",
};

const formatRaidData = (item, raidTypeKey) => {
    let bossName, terrain;
    if (raidTypeKey === "eliminateraids") {
        const match = (item.bossDetail || "").match(/^(.+?)\s*\(([^)]+)\)/);
        if (!match) {
            bossName = item.bossDetail;
            terrain = "";
        } else {
            const nameAndTerrain = match[1].trim().split(/\s+/);
            bossName = nameAndTerrain[0];
            terrain = nameAndTerrain.length > 1 ? nameAndTerrain[1] : "";
        }
    } else {
        const detailParts = (item.bossDetail || "default").split("_");
        bossName = detailParts[0];
        terrain = detailParts.length > 1 ? detailParts[1] : "";
    }
    const aliasMapping = { ShiroKuro: "Shirokuro", Kaitenger: "KaitenFxMk0" };
    let finalBossName = aliasMapping[bossName] || bossName;
    let bgImageUrl = `https://schaledb.com/images/raid/Boss_Portrait_${finalBossName}_LobbyBG${
        terrain ? `_${terrain}` : ""
    }.png`;
    if (raidTypeKey === "multifloreraids") {
        bgImageUrl =
            "https://schaledb.com/images/raid/MultiFloorRaid_Floor_BG.png";
    }
    return {
        id: item.seasonId,
        title: `${item.seasonId}. ${item.bossDetail}`,
        date: item.date || item.SeasonStartData || item.seasonStartDate,
        bgImageUrl,
        portraitImageUrl: `https://schaledb.com/images/raid/Boss_Portrait_${finalBossName}_Lobby.png`,
    };
};

const formatDrillData = (item) => {
    const drillName = jfdTypeMap[item.jfdType];
    const urlMapping = {
        1: "https://schaledb.com/images/enemy/enemyinfo_boxcat_terror.webp",
        2: "https://schaledb.com/images/enemy/enemyinfo_sweeper_decagram_taser_white.webp",
        3: "https://schaledb.com/images/enemy/enemyinfo_totem03_timeattack.webp",
        4: "https://schaledb.com/images/enemy/enemyinfo_avantgardekun_millenium_ar.webp",
    };
    return {
        id: item.id,
        title: `${item.id}. ${drillName} Drill`,
        date: item.date || item.startDate,
        bgImageUrl: "",
        portraitImageUrl: urlMapping[item.jfdType],
    };
};

const StatusPopup = ({ message, isError }) => {
    if (!message) return null;
    const baseClasses =
        "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-4 rounded-lg shadow-xl text-sm font-medium z-[100]";
    const successClasses =
        "bg-green-100 border border-green-400 text-green-700";
    const errorClasses = "bg-red-100 border border-red-400 text-red-700";
    return (
        <div
            className={`${baseClasses} ${
                isError ? errorClasses : successClasses
            }`}
        >
            {message}
        </div>
    );
};

const ContentPage = () => {
    const [raidData, setRaidData] = useState({
        raids: [],
        timeAttackDungeons: [],
        eliminateRaids: [],
        multiFloorRaids: [],
    });
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
            try {
                const data = await api.getRaid();
                const normalizedData = {
                    raids: (data.raids || data.Raids)
                        .map((item) => formatRaidData(item, "raids"))
                        .sort((a, b) => b.id - a.id),
                    timeAttackDungeons: (
                        data.timeAttackDungeons || data.TimeAttackDungeons
                    )
                        .map(formatDrillData)
                        .sort((a, b) => b.id - a.id),
                    eliminateRaids: (data.eliminateRaids || data.EliminateRaids)
                        .map((item) => formatRaidData(item, "eliminateraids"))
                        .sort((a, b) => b.id - a.id),
                    multiFloorRaids: (
                        data.multiFloorRaids || data.MultiFloorRaids
                    )
                        .map((item) => formatRaidData(item, "multifloreraids"))
                        .sort((a, b) => b.id - a.id),
                };
                setRaidData(normalizedData);
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
            showStatus(`Successfully set raid (ID: ${seasonId})!`, false);
        } catch (error) {
            console.error("Error setting raid:", error);
            showStatus(`Error setting raid: ${error.message}`, true);
        }
    };

    return (
        <main className="space-y-6">
            <StatusPopup
                message={statusMessage.text}
                isError={statusMessage.isError}
            />

            <div className="details-grid">
                <RaidSection
                    title="Total Assault"
                    raids={raidData.raids}
                    raidType="raids"
                    onSetRaid={handleSetRaid}
                    isLoading={isLoading}
                />
                <RaidSection
                    title="Grand Assault"
                    raids={raidData.eliminateRaids}
                    raidType="eliminateraids"
                    onSetRaid={handleSetRaid}
                    isLoading={isLoading}
                />
                <RaidSection
                    title="Joint Firing Drill"
                    raids={raidData.timeAttackDungeons}
                    raidType="timeattackdungeons"
                    onSetRaid={handleSetRaid}
                    isLoading={isLoading}
                />
                <RaidSection
                    title="Final Restriction Release"
                    raids={raidData.multiFloorRaids}
                    raidType="multifloreraids"
                    onSetRaid={handleSetRaid}
                    isLoading={isLoading}
                />
            </div>
        </main>
    );
};

export default ContentPage;
