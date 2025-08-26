import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import "./CharacterPage.css";
import { produce } from "immer";
import { set } from "lodash";

import CharacterCard from "../components/character/CharacterCard";
import CharacterEditorModal from "../components/character/CharacterEditorModal";
import BatchCharacterEditorModal from "../components/character/BatchCharacterEditorModal";

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

const CharacterPage = () => {
    const { t, i18n } = useTranslation();
    const [allCharacters, setAllCharacters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingCharacter, setEditingCharacter] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isBatchEditorOpen, setIsBatchEditorOpen] = useState(false);
    const [statusMessage, setStatusMessage] = useState({
        text: "",
        isError: false,
    });

    const showStatus = (text, isError = false) => {
        setStatusMessage({ text, isError });
        setTimeout(() => setStatusMessage({ text: "", isError: false }), 2500);
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const backendCharacters = await api.getCharacter();
                if (!Array.isArray(backendCharacters)) {
                    throw new Error(
                        "Invalid character data format from backend"
                    );
                }

                const schaleDbData = await api.getSchaleDBStudents(
                    i18n.language
                );

                const mergedCharacters = backendCharacters.map(
                    (charWrapper) => {
                        const schaleDbInfo =
                            schaleDbData[charWrapper.character.uniqueId];
                        if (schaleDbInfo) {
                            return {
                                ...charWrapper,
                                character: {
                                    ...schaleDbInfo,
                                    ...charWrapper.character,
                                },
                            };
                        }
                        return charWrapper;
                    }
                );
                setAllCharacters(mergedCharacters);
            } catch (err) {
                console.error("Failed to load character data:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [i18n.language]);

    const filteredCharacters = allCharacters
        .filter((charWrapper) => {
            const char = charWrapper.character;
            if (!char) return false;
            const lowerSearchTerm = searchTerm.toLowerCase();

            const nameMatch =
                char.Name?.toLowerCase().includes(lowerSearchTerm);
            const idMatch = String(char.uniqueId).includes(lowerSearchTerm);

            return nameMatch || idMatch;
        })
        .sort((a, b) => {
            const nameA = a.character.Name || "";
            const nameB = b.character.Name || "";
            return nameA.localeCompare(nameB);
        });

    const handleCardClick = (uniqueId, event) => {
        if (event.ctrlKey) {
            const newSelectedIds = new Set(selectedIds);
            if (newSelectedIds.has(uniqueId)) {
                newSelectedIds.delete(uniqueId);
            } else {
                newSelectedIds.add(uniqueId);
            }
            setSelectedIds(newSelectedIds);
        } else {
            const characterToEdit = allCharacters.find(
                (cw) => cw.character.uniqueId === uniqueId
            );
            if (characterToEdit) {
                setEditingCharacter(characterToEdit);
            }
        }
    };

    const handleSelectAll = () => {
        const allFilteredIds = filteredCharacters.map(
            (cw) => cw.character.uniqueId
        );
        setSelectedIds(new Set(allFilteredIds));
    };

    const handleDeselect = (uniqueId) => {
        const newSelectedIds = new Set(selectedIds);
        newSelectedIds.delete(uniqueId);
        setSelectedIds(newSelectedIds);
    };

    const handleClearSelection = () => {
        setSelectedIds(new Set());
    };

    const handleToggleSelectAll = () => {
        const areAllFilteredSelected =
            filteredCharacters.length > 0 &&
            filteredCharacters.every((cw) =>
                selectedIds.has(cw.character.uniqueId)
            );

        if (areAllFilteredSelected) {
            handleClearSelection();
        } else {
            handleSelectAll();
        }
    };

    const handleSaveChanges = async (updatedCharacterData) => {
        const charName = updatedCharacterData.character.Name;
        showStatus(t("character.saving", { name: charName }));

        try {
            await api.modifyCharacter(updatedCharacterData);

            const updatedList = allCharacters.map((charWrapper) => {
                if (
                    charWrapper.character.uniqueId ===
                    updatedCharacterData.character.uniqueId
                ) {
                    return updatedCharacterData;
                }
                return charWrapper;
            });
            setAllCharacters(updatedList);

            showStatus(t("character.saveSuccess", { name: charName }), false);
        } catch (error) {
            console.error("Error saving character:", error);
            showStatus(
                `${t("common.errorSaving", { error: error.message })}`,
                true
            );
        } finally {
            setEditingCharacter(null);
        }
    };

    const handleSaveBatchChanges = async (changes) => {
        const selectedCount = selectedIds.size;
        showStatus(t("character.batchSaving", { count: selectedCount }));

        const charactersToUpdate = allCharacters.filter((cw) =>
            selectedIds.has(cw.character.uniqueId)
        );

        const updatePromises = charactersToUpdate.map((charWrapper) => {
            const updatedCharWrapper = produce(charWrapper, (draft) => {
                Object.keys(changes).forEach((path) => {
                    const value = changes[path];
                    set(draft, path, value);
                });
            });
            return api.modifyCharacter(updatedCharWrapper);
        });

        try {
            await Promise.all(updatePromises);

            const newAllCharacters = produce(allCharacters, (draft) => {
                draft.forEach((charWrapper, index) => {
                    if (selectedIds.has(charWrapper.character.uniqueId)) {
                        Object.keys(changes).forEach((path) => {
                            const value = changes[path];
                            set(draft[index], path, value);
                        });
                    }
                });
            });
            setAllCharacters(newAllCharacters);
            showStatus(
                t("character.batchSaveSuccess", { count: selectedCount }),
                false
            );
        } catch (error) {
            console.error("Error saving multiple characters:", error);
            showStatus(t("common.errorSaving", { error: error.message }), true);
        } finally {
            setIsBatchEditorOpen(false);
            handleClearSelection();
        }
    };

    const selectedCharactersForFooter = allCharacters.filter((cw) =>
        selectedIds.has(cw.character.uniqueId)
    );

    const areAllFilteredSelected =
        filteredCharacters.length > 0 &&
        filteredCharacters.every((cw) =>
            selectedIds.has(cw.character.uniqueId)
        );

    return (
        <>
            <StatusPopup
                message={statusMessage.text}
                isError={statusMessage.isError}
            />
            <header className="mb-8">
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-2">
                    <input
                        type="search"
                        id="searchInput"
                        placeholder={t("character.search")}
                        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-sky-500 focus:border-sky-500 placeholder-gray-400 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={isLoading}
                    />
                    <button
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-white/80 text-gray-700 hover:bg-gray-100/80 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-20 text-center"
                        onClick={handleToggleSelectAll}
                        disabled={isLoading || filteredCharacters.length === 0}
                    >
                        {areAllFilteredSelected
                            ? t("common.deselectAll")
                            : t("common.selectAll")}
                    </button>
                </div>
            </header>

            <main
                id="characterList"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 justify-center"
            >
                {isLoading && (
                    <p className="col-span-full text-center text-gray-500">
                        {t("character.loading")}
                    </p>
                )}
                {error && (
                    <p className="col-span-full text-center text-red-500">
                        {t("character.loadError")}: {error}
                    </p>
                )}
                {!isLoading && !error && filteredCharacters.length === 0 && (
                    <p className="col-span-full text-center text-gray-500">
                        {t("character.noCharacters")}
                    </p>
                )}
                {!isLoading &&
                    !error &&
                    filteredCharacters.map((charWrapper) => (
                        <CharacterCard
                            key={charWrapper.character.uniqueId}
                            characterWrapper={charWrapper}
                            onCardClick={handleCardClick}
                            isSelected={selectedIds.has(
                                charWrapper.character.uniqueId
                            )}
                        />
                    ))}
            </main>

            {editingCharacter && (
                <CharacterEditorModal
                    characterData={editingCharacter}
                    onClose={() => setEditingCharacter(null)}
                    onSave={handleSaveChanges}
                />
            )}

            {isBatchEditorOpen && (
                <BatchCharacterEditorModal
                    selectedCharacters={allCharacters.filter((cw) =>
                        selectedIds.has(cw.character.uniqueId)
                    )}
                    onClose={() => setIsBatchEditorOpen(false)}
                    onSave={handleSaveBatchChanges}
                />
            )}

            {selectedIds.size > 0 && (
                <div className="batch-edit-footer">
                    <div className="selected-tags-container">
                        {selectedCharactersForFooter.map((cw) => (
                            <div
                                key={cw.character.uniqueId}
                                className="selected-character-tag"
                            >
                                <span>{cw.character.Name}</span>
                                <button
                                    onClick={() =>
                                        handleDeselect(cw.character.uniqueId)
                                    }
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center space-x-3 flex-shrink-0">
                        <button
                            className="skewed-button skewed-button--primary"
                            onClick={() => setIsBatchEditorOpen(true)}
                        >
                            <span>{t("common.edit")}</span>
                        </button>
                        <button
                            className="skewed-button skewed-button--cancel"
                            onClick={handleClearSelection}
                        >
                            <span>{t("common.cancel")}</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default CharacterPage;
