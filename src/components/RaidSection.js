import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/api";
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
    const { t } = useTranslation();
    const [selectedRaid, setSelectedRaid] = useState(null);

    const [records, setRecords] = useState([]);
    const [isLoadingRecords, setIsLoadingRecords] = useState(false);

    const handleSelectRaid = async (raid) => {
        if (raidType === "eliminateraids") {
            setSelectedRaid(raid);
            return;
        }

        setSelectedRaid(raid);
        setIsLoadingRecords(true);
        try {
            const fetchedRecords = await api.getRaidRecordsBySeason(raid.id);
            setRecords(fetchedRecords);
        } catch (error) {
            console.error(
                `Error fetching records for season ${raid.id}:`,
                error
            );
            showStatus(`Failed to load records: ${error.message}`, true);
            setRecords([]);
        } finally {
            setIsLoadingRecords(false);
        }
    };

    const handleDeleteRecord = async (battleId) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this battle record?"
            )
        )
            return;

        try {
            await api.deleteRaidRecord(battleId);
            setRecords((prevRecords) =>
                prevRecords.filter((rec) => rec.battleId !== battleId)
            );
            showStatus("Record deleted successfully.", false);
        } catch (error) {
            console.error("Failed to delete record:", error);
            showStatus(`Error: ${error.message}`, true);
        }
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
                                    {t("content.loadingData")}
                                </p>
                            )}
                            {!isLoadingList && raids.length === 0 && (
                                <p className="text-center text-gray-500 py-4">
                                    {t("content.noData")}
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
                            records={records}
                            isLoading={isLoadingRecords}
                            onDeleteRecord={handleDeleteRecord}
                        />
                    )}
                </div>
            </div>
        </details>
    );
};

export default RaidSection;
