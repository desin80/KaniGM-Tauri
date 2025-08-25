import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import "./CharacterPage.css";

import CharacterCard from "../components/character/CharacterCard";
import CharacterEditorModal from "../components/character/CharacterEditorModal";

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

    const handleOpenModal = (uniqueId) => {
        const characterToEdit = allCharacters.find(
            (cw) => cw.character.uniqueId === uniqueId
        );
        if (characterToEdit) {
            setEditingCharacter(characterToEdit);
        }
    };

    const handleSaveChanges = async (updatedCharacterData) => {
        const charName = updatedCharacterData.character.Name;
        showStatus(`Saving character ${charName}...`);

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

            showStatus(`Character ${charName} saved successfully!`, false);
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

    return (
        <>
            <StatusPopup
                message={statusMessage.text}
                isError={statusMessage.isError}
            />
            <header className="mb-8">
                <div className="flex justify-center items-center space-x-2">
                    <input
                        type="search"
                        id="searchInput"
                        placeholder={t("character.search")}
                        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-sky-500 focus:border-sky-500 placeholder-gray-400 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={isLoading}
                    />
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
                            onCardClick={handleOpenModal}
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
        </>
    );
};

export default CharacterPage;
