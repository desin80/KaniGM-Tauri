import React from "react";
import { useTranslation } from "react-i18next";
import typeDefenseIcon from "../../assets/Type_Defense.png";
import typeAttackIcon from "../../assets/Type_Attack.png";
import terrainStreet from "../../assets/Terrain_Street.png";
import terrainOutdoor from "../../assets/Terrain_Outdoor.png";
import terrainIndoor from "../../assets/Terrain_Indoor.png";

const terrainIconMap = {
    Street: terrainStreet,
    Outdoor: terrainOutdoor,
    Indoor: terrainIndoor,
};

const getArmorClass = (armor) => {
    if (armor === "HeavyArmor") return "heavy";
    if (armor === "LightArmor") return "light";
    if (armor === "Unarmed") return "unarmed";
    if (armor === "ElasticArmor") return "elastic";
    return "";
};

const getAttackClass = (attackType) => {
    if (attackType === "Pierce") return "heavy";
    if (attackType === "Explosion") return "light";
    if (attackType === "Mystic") return "unarmed";
    if (attackType === "Sonic") return "elastic";
    return "";
};

const MultiFloorRaidItem = ({ raid, onSetRaid, isSelected, onSelect }) => {
    const { t } = useTranslation();
    const [isSetting, setIsSetting] = React.useState(false);

    const handleSetRaid = async (e) => {
        e.stopPropagation();
        setIsSetting(true);
        await onSetRaid("multifloreraids", raid.seasonId);
        setIsSetting(false);
    };

    const itemClassName = `raid-item ${isSelected ? "raid-item--selected" : ""}`;

    const bgImageUrl =
        "https://schaledb.com/images/raid/MultiFloorRaid_Floor_BG.png";
    const portraitImageUrl = `https://schaledb.com/images/raid/Boss_Portrait_${raid.bossName}_Lobby.png`;
    const terrainIcon = terrainIconMap[raid.groundType];

    return (
        <div className={itemClassName} onClick={() => onSelect(raid)}>
            <div
                className="raid-art-panel"
                style={{ backgroundImage: `url('${bgImageUrl}')` }}
            >
                <div className="raid-gradient-overlay"></div>
                <img
                    src={portraitImageUrl}
                    alt={raid.bossName}
                    className="raid-portrait"
                    onError={(e) => {
                        e.target.style.display = "none";
                    }}
                />
                <div className="raid-info">
                    <div className="raid-title">{`${raid.seasonId}. ${raid.bossName}`}</div>
                    <div className="raid-date">{raid.date}</div>

                    <div className="attribute-icon-list">
                        {raid.armorType && (
                            <div
                                title={`Armor: ${raid.armorType}`}
                                className={`attribute-icon-container attribute-icon--${getArmorClass(raid.armorType)}`}
                            >
                                <img
                                    src={typeDefenseIcon}
                                    alt={raid.armorType}
                                    className="attribute-icon-image"
                                />
                            </div>
                        )}
                        {raid.attackType && (
                            <div
                                title={`Attack: ${raid.attackType}`}
                                className={`attribute-icon-container attribute-icon--${getAttackClass(raid.attackType)}`}
                            >
                                <img
                                    src={typeAttackIcon}
                                    alt={raid.attackType}
                                    className="attribute-icon-image"
                                />
                            </div>
                        )}
                        {terrainIcon && (
                            <div
                                title={`Terrain: ${raid.groundType}`}
                                className="attribute-icon-container attribute-icon--terrain"
                            >
                                <img
                                    src={terrainIcon}
                                    alt={raid.groundType}
                                    className="attribute-icon-image"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="raid-action">
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

export default MultiFloorRaidItem;
