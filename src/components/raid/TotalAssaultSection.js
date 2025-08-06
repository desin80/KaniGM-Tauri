import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../services/api";
import TotalAssaultItem from "./TotalAssaultItem";
import TotalAssaultDetailsPanel from "./TotalAssaultDetailsPanel";

const TotalAssaultSection = ({
    title,
    raids,
    onSetRaid,
    isLoading: isLoadingList,
    showStatus,
}) => {
    const { t } = useTranslation();
    const [selectedRaid, setSelectedRaid] = useState(null);

    const [records, setRecords] = useState([]);
    const [isLoadingRecords, setIsLoadingRecords] = useState(false);

    const handleSelectRaid = async (raid) => {
        setSelectedRaid(raid);
        setIsLoadingRecords(true);
        try {
            const fetchedRecords = await api.getRaidRecordsBySeason(
                raid.seasonId
            );
            setRecords(fetchedRecords);
        } catch (error) {
            console.error(
                `Error fetching records for season ${raid.seasonId}:`,
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

    const sortedRaids = [...raids].sort(
        (a, b) =>
            new Date(b.date.split("~")[0]) - new Date(a.date.split("~")[0])
    );

    return (
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
                                <TotalAssaultItem
                                    key={raid.seasonId}
                                    raid={raid}
                                    onSetRaid={onSetRaid}
                                    isSelected={
                                        selectedRaid?.seasonId === raid.seasonId
                                    }
                                    onSelect={handleSelectRaid}
                                />
                            ))}
                    </div>
                </div>

                <TotalAssaultDetailsPanel
                    selectedRaid={selectedRaid}
                    records={records}
                    isLoading={isLoadingRecords}
                    onDeleteRecord={handleDeleteRecord}
                />
            </div>
        </div>
    );
};

export default TotalAssaultSection;
