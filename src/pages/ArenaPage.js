import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";
import "./ArenaPage.css";

import DummyTeamDisplay from "../components/DummyTeamDisplay";
import ArenaRecordCard from "../components/ArenaRecordCard";
import ArenaSummaryCard from "../components/ArenaSummaryCard";
import ArenaCharacterEditModal from "../components/ArenaCharacterEditModal";

const StatusPopup = ({ message, isError }) => {
    if (!message) return null;
    const baseClasses =
        "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-4 rounded-lg shadow-xl text-sm font-medium z-[100]";
    const successClasses =
        "bg-green-100 border border-green-400 text-green-700";
    const errorClasses = "bg-red-100 border border-red-400 text-red-700";
    return (
        <div
            className={`${baseClasses} ${
                isError ? errorClasses : successClasses
            }`}
        >
            {message}
        </div>
    );
};

const ArenaPage = () => {
    const [activeTab, setActiveTab] = useState("records");
    const [isLoading, setIsLoading] = useState({
        dummy: true,
        records: true,
        summaries: true,
    });

    const [dummyTeam, setDummyTeam] = useState({ main: [], support: [] });
    const [records, setRecords] = useState([]);
    const [summaries, setSummaries] = useState([]);
    const [localization, setLocalization] = useState([]);

    const [statusMessage, setStatusMessage] = useState({
        text: "",
        isError: false,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCharacter, setEditingCharacter] = useState(null);

    const dragItem = useRef(null);

    const showStatus = (text, isError = false) => {
        setStatusMessage({ text, isError });
        setTimeout(() => setStatusMessage({ text: "", isError: false }), 2500);
    };

    const loadAllData = useCallback(async () => {
        try {
            const locData = await api.getLocalization();
            setLocalization(locData);

            setIsLoading({ dummy: true, records: true, summaries: true });
            const [dummyData, recordsData, summariesData] = await Promise.all([
                api
                    .getArenaDummy()
                    .finally(() =>
                        setIsLoading((prev) => ({ ...prev, dummy: false }))
                    ),
                api
                    .getArenaRecords()
                    .finally(() =>
                        setIsLoading((prev) => ({ ...prev, records: false }))
                    ),
                api
                    .getArenaSummaries()
                    .finally(() =>
                        setIsLoading((prev) => ({ ...prev, summaries: false }))
                    ),
            ]);
            setDummyTeam(dummyData);
            setRecords(recordsData);
            setSummaries(summariesData);
        } catch (err) {
            showStatus(`Failed to load arena data: ${err.message}`, true);
            setIsLoading({ dummy: false, records: false, summaries: false });
        }
    }, []);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    const getStudentNameById = useCallback(
        (studentId) => {
            if (!localization.length) return `ID: ${studentId}`;
            const student = localization.find(
                (s) => s.Id === parseInt(studentId)
            );
            return student ? student.Name_en : `ID: ${studentId}`;
        },
        [localization]
    );

    const handleDeleteRecord = async (recordToDelete) => {
        if (
            window.confirm(
                "Are you sure you want to delete this battle record?"
            )
        ) {
            try {
                await api.deleteArenaRecord(recordToDelete);
                setRecords((prev) =>
                    prev.filter(
                        (r) =>
                            JSON.stringify(r) !== JSON.stringify(recordToDelete)
                    )
                );
                showStatus("Record deleted successfully.", false);
            } catch (error) {
                showStatus(`Error: ${error.message}`, true);
            }
        }
    };

    const handleDeleteSummary = async (attackingIds, defendingIds) => {
        if (
            window.confirm(
                "Are you sure you want to delete this team summary?\nThis will also delete ALL associated battle records for this team."
            )
        ) {
            try {
                await api.deleteArenaSummary(attackingIds, defendingIds);
                await loadAllData();
                showStatus(
                    "Summary and associated records deleted successfully.",
                    false
                );
            } catch (error) {
                showStatus(`Error: ${error.message}`, true);
            }
        }
    };

    const handleEditCharacter = (charInfo) => {
        setEditingCharacter(charInfo);
        setIsModalOpen(true);
    };

    const handleSaveCharacter = async (updatedCharData) => {
        showStatus(
            `Saving ${getStudentNameById(
                updatedCharData.character.uniqueId
            )}...`
        );
        try {
            await api.setArenaDummy(updatedCharData);
            await loadAllData();
            showStatus("Character saved successfully!", false);
        } catch (error) {
            showStatus(`Error saving: ${error.message}`, true);
        } finally {
            setIsModalOpen(false);
            setEditingCharacter(null);
        }
    };

    const onDragStart = (e, teamType, index) => {
        dragItem.current = { teamType, index };
        e.currentTarget.classList.add("dragging");
    };

    const onDragEnd = (e) => {
        if (e.currentTarget.classList.contains("dragging")) {
            e.currentTarget.classList.remove("dragging");
        }
        dragItem.current = null;
        document
            .querySelectorAll(".drag-over")
            .forEach((el) => el.classList.remove("drag-over"));
    };

    const onDragOver = (e) => {
        e.preventDefault();
        const dropTarget = e.currentTarget;
        if (dropTarget && !dropTarget.classList.contains("drag-over")) {
            document
                .querySelectorAll(".drag-over")
                .forEach((el) => el.classList.remove("drag-over"));
            dropTarget.classList.add("drag-over");
        }
    };

    const onDragLeave = (e) => {
        e.currentTarget.classList.remove("drag-over");
    };

    const onDrop = async (e, targetTeamType, targetIndex) => {
        e.currentTarget.classList.remove("drag-over");
        const source = dragItem.current;
        if (
            !source ||
            source.teamType !== targetTeamType ||
            source.index === targetIndex
        )
            return;

        const teamArray = dummyTeam[source.teamType];
        const sourceData = teamArray[source.index];
        const targetData = teamArray[targetIndex];

        const payloadForSourceSlot = JSON.parse(JSON.stringify(targetData));
        payloadForSourceSlot.character.serverId = sourceData.character.serverId;
        if (payloadForSourceSlot.weapon)
            payloadForSourceSlot.weapon.serverId = sourceData.weapon.serverId;
        if (payloadForSourceSlot.gear)
            payloadForSourceSlot.gear.serverId = sourceData.gear.serverId;
        if (payloadForSourceSlot.equippedEquipment) {
            payloadForSourceSlot.equippedEquipment.forEach((equip, i) => {
                if (equip)
                    equip.serverId = sourceData.equippedEquipment[i].serverId;
            });
        }

        const payloadForTargetSlot = JSON.parse(JSON.stringify(sourceData));
        payloadForTargetSlot.character.serverId = targetData.character.serverId;
        if (payloadForTargetSlot.weapon)
            payloadForTargetSlot.weapon.serverId = targetData.weapon.serverId;
        if (payloadForTargetSlot.gear)
            payloadForTargetSlot.gear.serverId = targetData.gear.serverId;
        if (payloadForTargetSlot.equippedEquipment) {
            payloadForTargetSlot.equippedEquipment.forEach((equip, i) => {
                if (equip)
                    equip.serverId = targetData.equippedEquipment[i].serverId;
            });
        }

        showStatus("Saving new order...", false);
        try {
            await Promise.all([
                api.setArenaDummy(payloadForSourceSlot),
                api.setArenaDummy(payloadForTargetSlot),
            ]);
            showStatus("Order saved successfully!", false);
        } catch (error) {
            showStatus(`Error saving order: ${error.message}`, true);
        } finally {
            await loadAllData();
        }
    };

    const dragHandlers = {
        onDragStart,
        onDragEnd,
        onDragOver,
        onDragLeave,
        onDrop,
    };

    return (
        <>
            <StatusPopup
                message={statusMessage.text}
                isError={statusMessage.isError}
            />

            {isLoading.dummy ? (
                <p className="text-center text-gray-500 py-8">
                    Loading dummy team...
                </p>
            ) : (
                dummyTeam && (
                    <DummyTeamDisplay
                        dummyTeam={dummyTeam}
                        getStudentNameById={getStudentNameById}
                        onEditCharacter={handleEditCharacter}
                        dragHandlers={dragHandlers}
                    />
                )
            )}

            {isModalOpen && editingCharacter && (
                <ArenaCharacterEditModal
                    characterData={editingCharacter}
                    getStudentNameById={getStudentNameById}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveCharacter}
                />
            )}

            <header className="mb-6 md:mb-8">
                <div className="mt-3 sm:mt-4 border-b border-gray-200">
                    <nav
                        className="-mb-px flex space-x-2 sm:space-x-4"
                        aria-label="Tabs"
                    >
                        <button
                            onClick={() => setActiveTab("records")}
                            className={`px-4 py-3 sm:px-6 text-center border-b-2 cursor-pointer hover:text-gray-700 hover:border-gray-300 transition-colors duration-150 ${
                                activeTab === "records"
                                    ? "text-sky-600 border-sky-500"
                                    : "text-gray-500 border-transparent"
                            }`}
                        >
                            Battle Records
                        </button>
                        <button
                            onClick={() => setActiveTab("summaries")}
                            className={`px-4 py-3 sm:px-6 text-center border-b-2 cursor-pointer hover:text-gray-700 hover:border-gray-300 transition-colors duration-150 ${
                                activeTab === "summaries"
                                    ? "text-sky-600 border-sky-500"
                                    : "text-gray-500 border-transparent"
                            }`}
                        >
                            Team Summaries
                        </button>
                    </nav>
                </div>
            </header>

            <main>
                {activeTab === "records" && (
                    <div>
                        {isLoading.records && (
                            <p className="text-center text-gray-500 py-8">
                                Loading records...
                            </p>
                        )}
                        {!isLoading.records && records.length === 0 && (
                            <p className="text-center text-gray-500 py-8">
                                No battle records found.
                            </p>
                        )}
                        {records.map((record, index) => (
                            <ArenaRecordCard
                                key={JSON.stringify(record) + index}
                                record={record}
                                onDelete={handleDeleteRecord}
                                getStudentNameById={getStudentNameById}
                            />
                        ))}
                    </div>
                )}
                {activeTab === "summaries" && (
                    <div>
                        {isLoading.summaries && (
                            <p className="text-center text-gray-500 py-8">
                                Loading summaries...
                            </p>
                        )}
                        {!isLoading.summaries && summaries.length === 0 && (
                            <p className="text-center text-gray-500 py-8">
                                No team summaries found.
                            </p>
                        )}
                        {summaries.map((summary, index) => (
                            <ArenaSummaryCard
                                key={JSON.stringify(summary) + index}
                                summary={summary}
                                onDelete={handleDeleteSummary}
                                getStudentNameById={getStudentNameById}
                            />
                        ))}
                    </div>
                )}
            </main>
        </>
    );
};

export default ArenaPage;
