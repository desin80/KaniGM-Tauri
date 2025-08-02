import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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

    const terrainAliasMapping = {
        KaitenFxMk0: "Outdoor",
        HOD: "Street",
        Shirokuro: "Street",
        EN0005: "Indoor",
        HoverCraft: "Outdoor",
        EN0006: "Street",
        Chesed: "Indoor",
        Binah: "Outdoor",
    };

    const terrainKey = terrain;
    let finalTerrain = terrain ? `_${terrain}` : "";

    if (
        terrainAliasMapping[finalBossName] &&
        terrainAliasMapping[finalBossName] === terrainKey
    ) {
        finalTerrain = "";
    }

    let portraitImageUrl = `https://schaledb.com/images/raid/Boss_Portrait_${finalBossName}_Lobby.png`;
    let bgImageUrl = `https://schaledb.com/images/raid/Boss_Portrait_${finalBossName}_LobbyBG${finalTerrain}.png`;

    if (raidTypeKey === "multifloreraids") {
        bgImageUrl =
            "https://schaledb.com/images/raid/MultiFloorRaid_Floor_BG.png";
    }

    const date =
        item.date ||
        item.SeasonStartData ||
        item.seasonStartDate ||
        item.StartDate;
    return {
        id: item.seasonId || item.Id,
        title: `${item.seasonId || item.Id}. ${item.bossDetail}`,
        date,
        bgImageUrl,
        portraitImageUrl,
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
    const date = item.date || item.startDate;
    return {
        id: item.id,
        title: `${item.id}. ${drillName} Drill`,
        date,
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
            className={`${baseClasses} ${isError ? errorClasses : successClasses}`}
        >
            {message}
        </div>
    );
};

const ContentPage = () => {
    const { t } = useTranslation();
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
                        .sort(
                            (a, b) =>
                                new Date(b.date.split("~")[0]) -
                                new Date(a.date.split("~")[0])
                        ),
                    timeAttackDungeons: (
                        data.timeAttackDungeons || data.TimeAttackDungeons
                    )
                        .map(formatDrillData)
                        .sort(
                            (a, b) =>
                                new Date(b.date.split("~")[0]) -
                                new Date(a.date.split("~")[0])
                        ),
                    eliminateRaids: (data.eliminateRaids || data.EliminateRaids)
                        .map((item) => formatRaidData(item, "eliminateraids"))
                        .sort(
                            (a, b) =>
                                new Date(b.date.split("~")[0]) -
                                new Date(a.date.split("~")[0])
                        ),
                    multiFloorRaids: (
                        data.multiFloorRaids || data.MultiFloorRaids
                    )
                        .map((item) => formatRaidData(item, "multifloreraids"))
                        .sort(
                            (a, b) =>
                                new Date(b.date.split("~")[0]) -
                                new Date(a.date.split("~")[0])
                        ),
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
                <RaidSection
                    title={t("content.totalAssault")}
                    raids={raidData.raids}
                    raidType="raids"
                    onSetRaid={handleSetRaid}
                    isLoading={isLoading}
                    showStatus={showStatus}
                />
                <RaidSection
                    title={t("content.grandAssault")}
                    raids={raidData.eliminateRaids}
                    raidType="eliminateraids"
                    onSetRaid={handleSetRaid}
                    isLoading={isLoading}
                    showStatus={showStatus}
                />
                <RaidSection
                    title={t("content.jointFiringDrill")}
                    raids={raidData.timeAttackDungeons}
                    raidType="timeattackdungeons"
                    onSetRaid={handleSetRaid}
                    isLoading={isLoading}
                    showStatus={showStatus}
                />
                <RaidSection
                    title={t("content.finalRestrictionRelease")}
                    raids={raidData.multiFloorRaids}
                    raidType="multifloreraids"
                    onSetRaid={handleSetRaid}
                    isLoading={isLoading}
                    showStatus={showStatus}
                />
            </div>
        </main>
    );
};

export default ContentPage;
