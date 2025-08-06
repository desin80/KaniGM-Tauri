import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import GrandAssaultItem from "./GrandAssaultItem";
import GrandAssaultDetailsPanel from "./GrandAssaultDetailsPanel";

const GrandAssaultSection = ({
    title,
    raids,
    onSetRaid,
    isLoading: isLoadingList,
    showStatus,
}) => {
    const { t } = useTranslation();
    const [selectedRaid, setSelectedRaid] = useState(null);

    const handleSelectRaid = (raid) => {
        setSelectedRaid(raid);
    };

    const sortedRaids = [...raids].sort(
        (a, b) =>
            new Date(b.date.split("~")[0]) - new Date(a.date.split("~")[0])
    );

    return (
        <details>
            <summary className="tab-decoration">{title}</summary>
            <div className="mt-2 p-4 character-card card-decoration">
                <div className="inner-content-grid">
                    <div className="raid-list-column">
                        <div className="raid-item-container">
                            {isLoadingList && (
                                <p className="text-center text-gray-500 py-4">
                                    {t("content.loadingData")}
                                </p>
                            )}
                            {!isLoadingList && sortedRaids.length === 0 && (
                                <p className="text-center text-gray-500 py-4">
                                    {t("content.noData")}
                                </p>
                            )}
                            {!isLoadingList &&
                                sortedRaids.map((raid) => (
                                    <GrandAssaultItem
                                        key={raid.seasonId}
                                        raid={raid}
                                        onSetRaid={onSetRaid}
                                        isSelected={
                                            selectedRaid?.seasonId ===
                                            raid.seasonId
                                        }
                                        onSelect={handleSelectRaid}
                                    />
                                ))}
                        </div>
                    </div>

                    <GrandAssaultDetailsPanel
                        selectedRaid={selectedRaid}
                        showStatus={showStatus}
                    />
                </div>
            </div>
        </details>
    );
};

export default GrandAssaultSection;
