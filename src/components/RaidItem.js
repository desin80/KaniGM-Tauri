import React from "react";
import { useTranslation } from "react-i18next";
import typeDefenseIcon from "../assets/Type_Defense.png";

const getArmorClass = (armor) => {
    if (armor === "HeavyArmor") return "heavy";
    if (armor === "LightArmor") return "light";
    if (armor === "Unarmed") return "unarmed";
    if (armor === "ElasticArmor") return "elastic";
    return "";
};

const RaidItem = ({ raid, raidType, onSetRaid, isSelected, onSelect }) => {
    const { t } = useTranslation();
    const [isSetting, setIsSetting] = React.useState(false);

    const handleSetRaid = async (e) => {
        e.stopPropagation();
        setIsSetting(true);
        await onSetRaid(raidType, raid.id);
        setIsSetting(false);
    };

    const itemClassName = `raid-item ${isSelected ? "raid-item--selected" : ""}`;

    return (
        <div className={itemClassName} onClick={() => onSelect(raid)}>
            <div
                className="raid-art-panel"
                style={{ backgroundImage: `url('${raid.bgImageUrl}')` }}
            >
                <div className="raid-gradient-overlay"></div>
                <img
                    src={raid.portraitImageUrl}
                    alt={raid.title}
                    className="raid-portrait"
                    onError={(e) => {
                        e.target.style.display = "none";
                    }}
                />
                <div className="raid-info">
                    <div className="raid-title">{raid.title}</div>
                    <div className="raid-date">{raid.date}</div>
                    {raid.armors && raid.armors.length > 0 && (
                        <div className="armor-icon-list">
                            {raid.armors.map((armor) => (
                                <div
                                    key={armor}
                                    title={armor}
                                    className={`armor-icon-container armor-icon--${getArmorClass(armor)}`}
                                >
                                    <img
                                        src={typeDefenseIcon}
                                        alt={armor}
                                        className="armor-icon-image"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
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

export default RaidItem;
