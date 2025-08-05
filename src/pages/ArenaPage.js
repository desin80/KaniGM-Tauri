import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
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
            className={`${baseClasses} ${isError ? errorClasses : successClasses}`}
        >
            {message}
        </div>
    );
};

const ArenaPage = () => {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState("records");
    const [isLoading, setIsLoading] = useState({
        dummy: true,
        records: true,
        summaries: true,
        students: true,
    });

    const [dummyTeam, setDummyTeam] = useState({ main: [], support: [] });
    const [records, setRecords] = useState([]);
    const [summaries, setSummaries] = useState([]);
    const [allStudents, setAllStudents] = useState({});

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
        setIsLoading({
            dummy: true,
            records: true,
            summaries: true,
            students: true,
        });
        try {
            const [studentData, dummyData, recordsData, summariesData] =
                await Promise.all([
                    api.getSchaleDBStudents(i18n.language).finally(() =>
                        setIsLoading((prev) => ({
                            ...prev,
                            students: false,
                        }))
                    ),
                    api
                        .getArenaDummy()
                        .finally(() =>
                            setIsLoading((prev) => ({ ...prev, dummy: false }))
                        ),
                    api.getArenaRecords().finally(() =>
                        setIsLoading((prev) => ({
                            ...prev,
                            records: false,
                        }))
                    ),
                    api.getArenaSummaries().finally(() =>
                        setIsLoading((prev) => ({
                            ...prev,
                            summaries: false,
                        }))
                    ),
                ]);

            setAllStudents(studentData);

            const enrichCharacter = (charWrapper) => {
                const studentInfo =
                    studentData[charWrapper.character.uniqueId] || {};
                return {
                    ...charWrapper,
                    character: {
                        ...studentInfo,
                        ...charWrapper.character,
                    },
                };
            };

            const getTeamObjectsByIds = (idArray) => {
                return idArray.map(
                    (id) => studentData[id] || { Id: id, Name: `ID: ${id}` }
                );
            };

            const enrichedDummy = {
                main: dummyData.main.map(enrichCharacter),
                support: dummyData.support.map(enrichCharacter),
            };
            setDummyTeam(enrichedDummy);

            const enrichedRecords = recordsData.map((record) => ({
                ...record,
                attackingTeam: getTeamObjectsByIds(record.attackingTeamIds),
                defendingTeam: getTeamObjectsByIds(record.defendingTeamIds),
            }));
            setRecords(enrichedRecords);

            const enrichedSummaries = summariesData.map((summary) => ({
                ...summary,
                attackingTeam: getTeamObjectsByIds(summary.attackingTeamIds),
                defendingTeam: getTeamObjectsByIds(summary.defendingTeamIds),
            }));
            setSummaries(enrichedSummaries);
        } catch (err) {
            showStatus(`Failed to load arena data: ${err.message}`, true);
            setIsLoading({
                dummy: false,
                records: false,
                summaries: false,
                students: false,
            });
        }
    }, [i18n.language]);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    const handleDeleteRecord = async (recordToDelete) => {
        if (window.confirm(t("arena.confirmDeleteRecord"))) {
            try {
                const originalRecord = {
                    attackingTeamIds: recordToDelete.attackingTeamIds,
                    defendingTeamIds: recordToDelete.defendingTeamIds,
                    win: recordToDelete.win,
                };
                await api.deleteArenaRecord(originalRecord);
                setRecords((prev) =>
                    prev.filter(
                        (r) =>
                            r.attackingTeamIds.join() !==
                                recordToDelete.attackingTeamIds.join() ||
                            r.defendingTeamIds.join() !==
                                recordToDelete.defendingTeamIds.join()
                    )
                );
                showStatus(t("arena.recordDeleted"), false);
            } catch (error) {
                showStatus(`Error: ${error.message}`, true);
            }
        }
    };

    const handleDeleteSummary = async (attackingIds, defendingIds) => {
        if (window.confirm(t("arena.confirmDeleteSummary"))) {
            try {
                await api.deleteArenaSummary(attackingIds, defendingIds);
                await loadAllData();
                showStatus(t("arena.summaryDeleted"), false);
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
        const studentName =
            updatedCharData.character.Name ||
            `ID: ${updatedCharData.character.uniqueId}`;
        showStatus(`Saving ${studentName}...`);
        try {
            await api.setArenaDummy(updatedCharData);
            await loadAllData();
            showStatus(t("arena.characterSaved"), false);
        } catch (error) {
            showStatus(`Error saving: ${error.message}`, true);
        } finally {
            setIsModalOpen(false);
            setEditingCharacter(null);
        }
    };

    // Drag and Drop logic remains the same
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

        showStatus(t("arena.savingOrder"), false);
        try {
            await Promise.all([
                api.setArenaDummy(payloadForSourceSlot),
                api.setArenaDummy(payloadForTargetSlot),
            ]);
            showStatus(t("arena.orderSaved"), false);
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

            {isLoading.dummy || isLoading.students ? (
                <p className="text-center text-gray-500 py-8">
                    {t("arena.loadingDummyTeam")}
                </p>
            ) : (
                dummyTeam && (
                    <DummyTeamDisplay
                        dummyTeam={dummyTeam}
                        onEditCharacter={handleEditCharacter}
                        dragHandlers={dragHandlers}
                    />
                )
            )}

            {isModalOpen && editingCharacter && (
                <ArenaCharacterEditModal
                    characterData={editingCharacter}
                    allStudentsData={allStudents}
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
                            className={`px-4 py-3 sm:px-6 text-center border-b-2 cursor-pointer hover:text-gray-700 hover:border-gray-300 transition-colors duration-150 ${activeTab === "records" ? "text-sky-600 border-sky-500" : "text-gray-500 border-transparent"}`}
                        >
                            {t("arena.battleRecords")}
                        </button>
                        <button
                            onClick={() => setActiveTab("summaries")}
                            className={`px-4 py-3 sm:px-6 text-center border-b-2 cursor-pointer hover:text-gray-700 hover:border-gray-300 transition-colors duration-150 ${activeTab === "summaries" ? "text-sky-600 border-sky-500" : "text-gray-500 border-transparent"}`}
                        >
                            {t("arena.teamSummaries")}
                        </button>
                    </nav>
                </div>
            </header>

            <main>
                {activeTab === "records" && (
                    <div>
                        {isLoading.records ? (
                            <p className="text-center text-gray-500 py-8">
                                {t("arena.loadingRecords")}
                            </p>
                        ) : records.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">
                                {t("arena.noRecords")}
                            </p>
                        ) : (
                            records.map((record, index) => (
                                <ArenaRecordCard
                                    key={`${record.attackingTeamIds.join()}-${record.defendingTeamIds.join()}-${index}`}
                                    record={record}
                                    onDelete={handleDeleteRecord}
                                />
                            ))
                        )}
                    </div>
                )}
                {activeTab === "summaries" && (
                    <div>
                        {isLoading.summaries ? (
                            <p className="text-center text-gray-500 py-8">
                                {t("arena.loadingSummaries")}
                            </p>
                        ) : summaries.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">
                                {t("arena.noSummaries")}
                            </p>
                        ) : (
                            summaries.map((summary, index) => (
                                <ArenaSummaryCard
                                    key={`${summary.attackingTeamIds.join()}-${summary.defendingTeamIds.join()}-${index}`}
                                    summary={summary}
                                    onDelete={handleDeleteSummary}
                                />
                            ))
                        )}
                    </div>
                )}
            </main>
        </>
    );
};

export default ArenaPage;
