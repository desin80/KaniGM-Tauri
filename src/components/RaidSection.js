import React, { useState } from "react";
import RaidItem from "./RaidItem";
import RaidDetailsPanel from "./RaidDetailsPanel";
import GrandAssaultDetailsPanel from "./GrandAssaultDetailsPanel";

const RaidSection = ({
    title,
    raids,
    raidType,
    onSetRaid,
    isLoading: isLoadingList,
    showStatus,
}) => {
    const [selectedRaid, setSelectedRaid] = useState(null);

    const handleSelectRaid = (raid) => {
        setSelectedRaid(raid);
    };

    return (
        <details>
            <summary className="tab-decoration">{title}</summary>
            <div className="mt-2 p-4 character-card card-decoration">
                <div className="inner-content-grid">
                    <div className="raid-list-column">
                        <div className="raid-item-container">
                            {isLoadingList && (
                                <p className="text-center text-gray-500 py-4">
                                    Loading data...
                                </p>
                            )}
                            {!isLoadingList && raids.length === 0 && (
                                <p className="text-center text-gray-500 py-4">
                                    No data available.
                                </p>
                            )}
                            {!isLoadingList &&
                                raids.map((raid) => (
                                    <RaidItem
                                        key={raid.id}
                                        raid={raid}
                                        raidType={raidType}
                                        onSetRaid={onSetRaid}
                                        isSelected={
                                            selectedRaid?.id === raid.id
                                        }
                                        onSelect={handleSelectRaid}
                                    />
                                ))}
                        </div>
                    </div>

                    {raidType === "eliminateraids" ? (
                        <GrandAssaultDetailsPanel
                            selectedRaid={selectedRaid}
                            showStatus={showStatus}
                        />
                    ) : (
                        <RaidDetailsPanel
                            selectedRaid={selectedRaid}
                            showStatus={showStatus}
                        />
                    )}
                </div>
            </div>
        </details>
    );
};

export default RaidSection;
