import React from "react";
import { useTranslation } from "react-i18next";

const dungeonTypeImageMap = {
    Defense: "https://schaledb.com/images/enemy/enemyinfo_boxcat_terror.webp",
    Shooting:
        "https://schaledb.com/images/enemy/enemyinfo_sweeper_decagram_taser_white.webp",
    Destruction:
        "https://schaledb.com/images/enemy/enemyinfo_totem03_timeattack.webp",
    Escort: "https://schaledb.com/images/enemy/enemyinfo_avantgardekun_millenium_ar.webp",
};

const TimeAttackDungeonItem = ({
    dungeon,
    onSetRaid,
    isSelected,
    onSelect,
}) => {
    const { t } = useTranslation();
    const [isSetting, setIsSetting] = React.useState(false);

    const handleSetRaid = async (e) => {
        e.stopPropagation();
        setIsSetting(true);
        await onSetRaid("timeattackdungeons", dungeon.id);
        setIsSetting(false);
    };

    const itemClassName = `drill-item ${isSelected ? "drill-item--selected" : ""}`;
    const typeImageUrl = dungeonTypeImageMap[dungeon.dungeonType];

    return (
        <div className={itemClassName} onClick={() => onSelect(dungeon)}>
            <div className="drill-info-header">
                <div className="drill-title-group">
                    <span className="drill-id">{dungeon.id}</span>
                    <h4 className="drill-title">{`${dungeon.dungeonType} Drill`}</h4>
                </div>
                <span className="drill-date">{dungeon.date.split(" ")[0]}</span>
            </div>

            <div className="drill-body-grid">
                <div className="geas-grid">
                    {(dungeon.geasIconPaths || []).map((iconPath) => (
                        <div key={iconPath} className="geas-icon-wrapper">
                            <img
                                src={`https://schaledb.com/images/timeattack/${iconPath}.webp`}
                                alt={iconPath.replace(/_/g, " ")}
                                className="geas-icon"
                                title={iconPath.replace(/_/g, " ")}
                            />
                        </div>
                    ))}
                </div>
                {typeImageUrl && (
                    <div className="drill-type-image-container">
                        <img
                            src={typeImageUrl}
                            alt={`${dungeon.dungeonType} type`}
                            className="drill-type-image"
                        />
                    </div>
                )}
            </div>

            <div className="drill-action">
                <button
                    className="set-raid-button skewed-button skewed-button--primary"
                    onClick={handleSetRaid}
                    disabled={isSetting}
                >
                    <div className="skewed-button-content">
                        <span>
                            {isSetting
                                ? t("content.setting")
                                : t("content.set")}
                        </span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default TimeAttackDungeonItem;
