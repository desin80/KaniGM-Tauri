import React from "react";
import RaidItem from "./RaidItem";

const RaidSection = ({ title, raids, raidType, onSetRaid, isLoading }) => {
    return (
        <details>
            <summary className="tab-decoration">{title}</summary>
            <div className="mt-2 p-4 character-card card-decoration">
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
                            />
                        ))}
                </div>
            </div>
        </details>
    );
};

export default RaidSection;
