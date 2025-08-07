import React from "react";
import { useTranslation } from "react-i18next";
import charStarIcon from "../../assets/char_star.png";
import weaponStarIcon from "../../assets/weapon_star.png";

const difficultyMap = {
    1: "Stage 1",
    2: "Stage 2",
    3: "Stage 3",
    4: "Stage 4",
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

const TimeAttackDungeonDetailsPanel = ({
    selectedDungeon,
    records,
    isLoading,
    onDeleteRecord,
}) => {
    const { t } = useTranslation();

    if (!selectedDungeon) {
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
        (a, b) => b.totalScore - a.totalScore
    );

    return (
        <div className="boss-details-panel tad-details-panel">
            <div className="details-panel-header">
                <h3
                    style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "#1f2937",
                        textAlign: "left",
                    }}
                >
                    {`${selectedDungeon.dungeonType} Drill`}
                </h3>
                {selectedDungeon.date && (
                    <span className="details-panel-date">
                        {selectedDungeon.date.split(" ")[0]}
                    </span>
                )}
            </div>

            {sortedRecords.length === 0 ? (
                // <p>{t("content.noRecords")}</p>
                <p>Coming Soon...</p>
            ) : (
                sortedRecords.map((record) => (
                    <div key={record.battleId} className="tad-record-container">
                        <div className="tad-record-header">
                            <div className="tad-header-info">
                                <span
                                    className={`difficulty-badge difficulty-stage${record.difficulty}`}
                                >
                                    {difficultyMap[record.difficulty] ||
                                        "Unknown"}
                                </span>
                            </div>
                            <div className="tad-total-score">
                                <small>TOTAL SCORE</small>
                                {record.totalScore.toLocaleString()}
                            </div>
                        </div>

                        <div className="tad-teams-wrapper">
                            {Object.entries(record.teams || {}).map(
                                ([attempt, teamData]) => (
                                    <div
                                        key={attempt}
                                        className="tad-team-card"
                                    >
                                        <div className="tad-team-header">
                                            <span className="tad-team-number">
                                                Team {attempt}
                                            </span>
                                            <span className="tad-team-score">
                                                {teamData.score.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="tad-team-body">
                                            {(teamData.members || []).map(
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
                                onClick={() => onDeleteRecord(record.battleId)}
                            ></button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default TimeAttackDungeonDetailsPanel;
