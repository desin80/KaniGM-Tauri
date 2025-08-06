import React from "react";
import { useTranslation } from "react-i18next";
import attackIcon from "../../assets/attack.png";
import defendIcon from "../../assets/defend.png";
import vsIcon from "../../assets/vs.png";
import winIcon from "../../assets/win.png";
import loseIcon from "../../assets/lose.png";

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

const ArenaRecordCard = ({ record, onDelete }) => {
    const { t } = useTranslation();
    return (
        <div className="arena-card">
            <div className="team-display-container">
                <TeamAvatars team={record.attackingTeam} />
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
                <TeamAvatars team={record.defendingTeam} />
            </div>

            <div className="icon-display status-icon">
                <img
                    src={record.win ? winIcon : loseIcon}
                    alt={record.win ? t("common.win") : t("common.lose")}
                />
            </div>

            <div
                className="delete-record-button"
                title={t("common.deleteRecord")}
                onClick={() => onDelete(record)}
            ></div>
        </div>
    );
};

export default ArenaRecordCard;
