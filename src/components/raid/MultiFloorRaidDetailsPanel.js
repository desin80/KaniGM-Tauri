import React from "react";
import { useTranslation } from "react-i18next";
import charStarIcon from "../../assets/char_star.png";
import weaponStarIcon from "../../assets/weapon_star.png";

const getFloorColorClass = (floor) => {
    if (floor >= 100) return "floor-tier5";
    if (floor >= 75) return "floor-tier4";
    if (floor >= 50) return "floor-tier3";
    if (floor >= 25) return "floor-tier2";
    return "floor-tier1";
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

const MultiFloorRaidDetailsPanel = ({
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

    const sortedRecords = [...records].sort(
        (a, b) => b.difficulty - a.difficulty
    );

    return (
        <div className="boss-details-panel">
            <div className="details-panel-header">
                <h3
                    className="details-panel-title"
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
                    const difficultyName = `Floor ${record.difficulty}`;
                    const floorColorClass = getFloorColorClass(
                        record.difficulty
                    );
                    return (
                        <div key={record.battleId} className="raid-record-card">
                            <div className="raid-record-header">
                                <div
                                    className={`difficulty-badge ${floorColorClass}`}
                                >
                                    {difficultyName}
                                </div>
                            </div>
                            <div className="teams-list">
                                {Object.entries(record.teams || {}).map(
                                    ([attempt, team]) => (
                                        <div
                                            key={attempt}
                                            className="team-row multiflor-team-row"
                                        >
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

export default MultiFloorRaidDetailsPanel;
