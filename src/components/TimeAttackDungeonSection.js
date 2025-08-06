import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import TimeAttackDungeonItem from "./TimeAttackDungeonItem";
import TimeAttackDungeonDetailsPanel from "./TimeAttackDungeonDetailsPanel";

const TimeAttackDungeonSection = ({
    title,
    dungeons,
    onSetRaid,
    isLoading: isLoadingList,
    showStatus,
}) => {
    const { t } = useTranslation();
    const [selectedDungeon, setSelectedDungeon] = useState(null);

    const [records, setRecords] = useState([]);
    const [isLoadingRecords, setIsLoadingRecords] = useState(false);

    const handleSelectDungeon = async (dungeon) => {
        setSelectedDungeon(dungeon);
        setIsLoadingRecords(true);
        try {
            const fetchedRecords = await api.getTADRecordsBySeason(dungeon.id);
            setRecords(fetchedRecords);
        } catch (error) {
            console.error(
                `Error fetching records for dungeon ${dungeon.id}:`,
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

    const sortedDungeons = [...dungeons].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
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
                        {!isLoadingList && sortedDungeons.length === 0 && (
                            <p className="text-center text-gray-500 py-4">
                                {t("content.noData")}
                            </p>
                        )}
                        {!isLoadingList &&
                            sortedDungeons.map((dungeon) => (
                                <TimeAttackDungeonItem
                                    key={dungeon.id}
                                    dungeon={dungeon}
                                    onSetRaid={onSetRaid}
                                    isSelected={
                                        selectedDungeon?.id === dungeon.id
                                    }
                                    onSelect={handleSelectDungeon}
                                />
                            ))}
                    </div>
                </div>

                <TimeAttackDungeonDetailsPanel
                    selectedDungeon={selectedDungeon}
                    records={records}
                    isLoading={isLoadingRecords}
                    onDeleteRecord={handleDeleteRecord}
                />
            </div>
        </div>
    );
};

export default TimeAttackDungeonSection;
