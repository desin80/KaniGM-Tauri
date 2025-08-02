import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import charStarIcon from "../assets/char_star.png";
import weaponStarIcon from "../assets/weapon_star.png";

const difficultyMap = {
    0: "Normal",
    1: "Hard",
    2: "VeryHard",
    3: "Hardcore",
    4: "Extreme",
    5: "Insane",
    6: "Torment",
    7: "Lunatic",
};

const CharacterIcon = ({ charInfo }) => {
    const { id, level, starGrade, weaponStarGrade } = charInfo;
    const hasWeapon = weaponStarGrade > 0;
    const animationClass = hasWeapon ? "has-weapon-animation" : "";
    const titleText = `ID: ${id}\nLevel: ${level}\nStars: ${starGrade}★\nWeapon: ${weaponStarGrade}★`;

    return (
        <div
            className={`rs-char-card raid-char-card ${animationClass}`}
            title={titleText}
        >
            <div className="background-plate"></div>
            <img
                className="portrait-image"
                src={`https://schaledb.com/images/student/icon/${id}.webp`}
                alt={`Char ${id}`}
                onError={(e) => {
                    e.target.src =
                        "https://schaledb.com/images/student/icon/0.webp";
                }}
            />
            <div className="info-container">
                <div className="stars-group">
                    <div className="star-info character-star-info">
                        <img
                            className="star-icon"
                            src={charStarIcon}
                            alt="Star"
                        />
                        <span className="info-text star-value">
                            {starGrade}
                        </span>
                    </div>
                    {hasWeapon && (
                        <div className="star-info weapon-star-info">
                            <img
                                className="star-icon"
                                src={weaponStarIcon}
                                alt="Weapon Star"
                            />
                            <span className="info-text star-value">
                                {weaponStarGrade}
                            </span>
                        </div>
                    )}
                </div>
                <span className="info-text level-value">Lv.{level}</span>
            </div>
        </div>
    );
};

const GrandAssaultDetailsPanel = ({ selectedRaid, showStatus }) => {
    const { t } = useTranslation();
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeArmor, setActiveArmor] = useState("HeavyArmor");
    const armorTypes = ["HeavyArmor", "LightArmor", "Unarmed", "ElasticArmor"];

    useEffect(() => {
        if (!selectedRaid) {
            setIsLoading(false);
            return;
        }

        const fetchRecords = async () => {
            setIsLoading(true);
            try {
                const fetchedRecords = await api.getGrandAssaultRecordsBySeason(
                    selectedRaid.id
                );
                setRecords(fetchedRecords);
            } catch (error) {
                showStatus(`Failed to load records: ${error.message}`, true);
                setRecords([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecords();
    }, [selectedRaid, showStatus]);

    if (!selectedRaid) {
        return (
            <div className="boss-details-panel">
                <p>{t("content.selectBoss")}</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="boss-details-panel">
                <p>{t("content.loadingData")}</p>
            </div>
        );
    }

    const filteredRecords = records
        .filter((rec) => rec.armor === activeArmor)
        .sort((a, b) => b.score - a.score);

    const getArmorClass = (armor) => {
        if (armor === "HeavyArmor") return "heavy";
        if (armor === "LightArmor") return "light";
        if (armor === "Unarmed") return "unarmed";
        if (armor === "ElasticArmor") return "elastic";
        return "";
    };

    return (
        <div className="boss-details-panel">
            <h3
                style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "#1f2937",
                    marginBottom: "0.5rem",
                    textAlign: "left",
                }}
            >
                {selectedRaid.title.split(". ")[1]}
            </h3>

            <div className="armor-tabs-container">
                {armorTypes.map((armor) => (
                    <button
                        key={armor}
                        className={`armor-tab armor-tab--${getArmorClass(
                            armor
                        )} ${activeArmor === armor ? "armor-tab--active" : ""}`}
                        onClick={() => setActiveArmor(armor)}
                    >
                        {armor.replace("Armor", "")}
                    </button>
                ))}
            </div>

            {filteredRecords.length === 0 ? (
                <p>{t("content.noRecordsForArmor")}</p>
            ) : (
                filteredRecords.map((record) => (
                    <div key={record.battleId} className="raid-record-card">
                        <div className="raid-record-header">
                            <div
                                className={`difficulty-badge difficulty-${(
                                    difficultyMap[record.difficulty] ||
                                    "Unknown"
                                ).toLowerCase()}`}
                            >
                                {difficultyMap[record.difficulty] || "Unknown"}
                            </div>
                            <div className="score-display">
                                <small>SCORE</small>
                                {record.score.toLocaleString()}
                            </div>
                        </div>
                        <div className="teams-list">
                            {Object.entries(record.teams || {}).map(
                                ([attempt, team]) => (
                                    <div key={attempt} className="team-row">
                                        <span className="team-attempt-number">
                                            {attempt}.
                                        </span>
                                        <div className="team-avatars-horizontal">
                                            {(team || []).map((charInfo) => (
                                                <CharacterIcon
                                                    key={charInfo.id}
                                                    charInfo={charInfo}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default GrandAssaultDetailsPanel;
