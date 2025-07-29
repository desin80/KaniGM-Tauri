import React from "react";

const RaidItem = ({ raid, raidType, onSetRaid }) => {
    const [isSetting, setIsSetting] = React.useState(false);

    const handleSetRaid = async () => {
        setIsSetting(true);
        await onSetRaid(raidType, raid.id);
        setIsSetting(false);
    };

    return (
        <div className="raid-item">
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
                </div>
            </div>
            <div className="raid-action">
                <button
                    className="set-raid-button skewed-button skewed-button--primary"
                    onClick={handleSetRaid}
                    disabled={isSetting}
                >
                    <div className="skewed-button-content">
                        <span>{isSetting ? "Setting..." : "Set"}</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default RaidItem;
