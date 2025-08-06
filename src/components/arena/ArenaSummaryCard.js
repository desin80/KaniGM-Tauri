import React from "react";
import { useTranslation } from "react-i18next";
import attackIcon from "../../assets/attack.png";
import defendIcon from "../../assets/defend.png";
import vsIcon from "../../assets/vs.png";

const TeamAvatars = ({ team }) => (
    <div className="team-avatars">
        {team.map((student) => (
            <div key={student.Id} className="rs-char-card">
                <div className="background-plate"></div>
                <img
                    className="portrait-image"
                    src={`https://schaledb.com/images/student/icon/${student.Id}.webp`}
                    alt={student.Name}
                    onError={(e) => {
                        e.currentTarget.parentElement.style.display = "none";
                    }}
                />
            </div>
        ))}
    </div>
);

const ArenaSummaryCard = ({ summary, onDelete }) => {
    const { t } = useTranslation();
    const winRate = (summary.winRate * 100).toFixed(0);

    return (
        <div className="arena-card">
            <div className="team-display-container">
                <TeamAvatars team={summary.attackingTeam} />
                <div className="icon-display attacking-icon">
                    <img src={attackIcon} alt="Attacking" />
                </div>
            </div>

            <div className="vs-icon">
                <img src={vsIcon} alt="VS" />
            </div>

            <div className="team-display-container">
                <div className="icon-display defending-icon">
                    <img src={defendIcon} alt="Defending" />
                </div>
                <TeamAvatars team={summary.defendingTeam} />
            </div>

            <div className="summary-stats">
                <p className="wins-losses text-gray-700 whitespace-nowrap">
                    {summary.wins}W / {summary.losses}L
                </p>
                <p className="win-rate font-regular text-sky-600 whitespace-nowrap">
                    {t("arena.winRate")}: {winRate}%
                </p>
            </div>

            <div
                className="delete-record-button"
                title={t("arena.deleteSummary")}
                onClick={() =>
                    onDelete(summary.attackingTeamIds, summary.defendingTeamIds)
                }
            ></div>
        </div>
    );
};

export default ArenaSummaryCard;
