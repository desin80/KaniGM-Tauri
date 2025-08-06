import React from "react";
import { useTranslation } from "react-i18next";
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

const TotalAssaultDetailsPanel = ({
    selectedRaid,
    records,
    isLoading,
    onDeleteRecord,
}) => {
    const { t } = useTranslation();

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

    const sortedRecords = [...records].sort((a, b) => b.score - a.score);

    return (
        <div className="boss-details-panel">
            <div className="details-panel-header">
                <h3
                    style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "#1f2937",
                        textAlign: "left",
                    }}
                >
                    {selectedRaid.bossName}
                </h3>
                {selectedRaid.date && (
                    <span className="details-panel-date">
                        {selectedRaid.date.split(" ")[0]}
                    </span>
                )}
            </div>
            <hr
                style={{
                    border: "none",
                    borderTop: "1px solid rgba(209, 213, 219, 0.7)",
                    marginBottom: "1rem",
                }}
            />

            {sortedRecords.length === 0 ? (
                <p>{t("content.noRecords")}</p>
            ) : (
                sortedRecords.map((record) => {
                    const difficultyName =
                        difficultyMap[record.difficulty] || "Unknown";
                    return (
                        <div key={record.battleId} className="raid-record-card">
                            <div className="raid-record-header">
                                <div
                                    className={`difficulty-badge difficulty-${difficultyName.toLowerCase()}`}
                                >
                                    {difficultyName}
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
                                                {(team || []).map(
                                                    (charInfo) => (
                                                        <CharacterIcon
                                                            key={charInfo.id}
                                                            charInfo={charInfo}
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                            <div className="record-actions">
                                <button
                                    className="delete-record-button"
                                    title="Delete this record"
                                    onClick={() =>
                                        onDeleteRecord(record.battleId)
                                    }
                                ></button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default TotalAssaultDetailsPanel;
