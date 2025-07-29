import React, { useState } from "react";
import RaidItem from "./RaidItem";

const RaidSection = ({ title, raids, raidType, onSetRaid, isLoading }) => {
    const [selectedRaid, setSelectedRaid] = useState(null);

    return (
        <details>
            <summary className="tab-decoration">{title}</summary>
            <div className="mt-2 p-4 character-card card-decoration">
                <div className="inner-content-grid">
                    <div className="raid-list-column">
                        <div className="raid-item-container">
                            {isLoading && (
                                <p className="text-center text-gray-500 py-4">
                                    Loading data...
                                </p>
                            )}
                            {!isLoading && raids.length === 0 && (
                                <p className="text-center text-gray-500 py-4">
                                    No data available.
                                </p>
                            )}
                            {!isLoading &&
                                raids.map((raid) => (
                                    <RaidItem
                                        key={raid.id}
                                        raid={raid}
                                        raidType={raidType}
                                        onSetRaid={onSetRaid}
                                        isSelected={
                                            selectedRaid?.id === raid.id
                                        }
                                        onSelect={setSelectedRaid}
                                    />
                                ))}
                        </div>
                    </div>
                    <div className="boss-details-panel">
                        {selectedRaid ? (
                            <div>
                                <h3>Details for {selectedRaid.title}</h3>
                                <p>Not Implemented Yet.</p>
                            </div>
                        ) : (
                            <p>Select a Boss to view details.</p>
                        )}
                    </div>
                </div>
            </div>
        </details>
    );
};

export default RaidSection;
