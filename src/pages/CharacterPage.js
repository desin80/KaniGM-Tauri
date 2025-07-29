import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import "./CharacterPage.css";

import CharacterCard from "../components/CharacterCard";
import CharacterEditorModal from "../components/CharacterEditorModal";

const availableLanguages = {
    Name_en: "English",
    Name_cn: "中文",
    Name_jp: "日本語",
    Name_kr: "한국어",
    Name_th: "ไทย",
};

// 一个简单的状态消息弹窗组件
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

const CharacterPage = () => {
    const [allCharacters, setAllCharacters] = useState([]);
    const [localization, setLocalization] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentLanguage, setCurrentLanguage] = useState("Name_en");
    const [isLangDropdownOpen, setLangDropdownOpen] = useState(false);

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
            try {
                const [locData, charData] = await Promise.all([
                    api.getLocalization(),
                    api.getCharacter(),
                ]);
                if (!Array.isArray(charData))
                    throw new Error("Invalid character data format");
                setLocalization(locData);
                setAllCharacters(charData);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const getLocalizedName = useCallback(
        (uniqueId) => {
            if (localization.length > 0) {
                const entry = localization.find((item) => item.Id === uniqueId);
                return (
                    entry?.[currentLanguage] ||
                    entry?.Name_en ||
                    String(uniqueId)
                );
            }
            return String(uniqueId);
        },
        [localization, currentLanguage]
    );

    const filteredCharacters = allCharacters.filter((charWrapper) => {
        const char = charWrapper.character;
        if (!char) return false;
        const lowerSearchTerm = searchTerm.toLowerCase();
        const nameMatch = getLocalizedName(char.uniqueId)
            .toLowerCase()
            .includes(lowerSearchTerm);
        const idMatch = String(char.uniqueId).includes(lowerSearchTerm);
        return nameMatch || idMatch;
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
        const uniqueId = updatedCharacterData.character.uniqueId;
        const charName = getLocalizedName(uniqueId);
        showStatus(`Saving character ${charName}...`);

        try {
            await api.modifyCharacter(updatedCharacterData);

            const updatedList = allCharacters.map((charWrapper) => {
                if (charWrapper.character.uniqueId === uniqueId) {
                    return updatedCharacterData;
                }
                return charWrapper;
            });
            setAllCharacters(updatedList);

            showStatus(`Character ${charName} saved successfully!`, false);
        } catch (error) {
            console.error("Error saving character:", error);
            showStatus(`Error saving: ${error.message}`, true);
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
                        placeholder="Search by Name or Unique ID"
                        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-sky-500 focus:border-sky-500 placeholder-gray-400 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={isLoading}
                    />
                    <div className="relative">
                        <button
                            id="languageSelectorButton"
                            type="button"
                            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 whitespace-nowrap"
                            onClick={() =>
                                setLangDropdownOpen(!isLangDropdownOpen)
                            }
                            disabled={isLoading}
                        >
                            {availableLanguages[currentLanguage]}
                        </button>
                        {isLangDropdownOpen && (
                            <div
                                id="languageDropdown"
                                className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-20 ring-1 ring-black ring-opacity-5"
                            >
                                {Object.entries(availableLanguages).map(
                                    ([langKey, langName]) => (
                                        <button
                                            key={langKey}
                                            type="button"
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setCurrentLanguage(langKey);
                                                setLangDropdownOpen(false);
                                            }}
                                        >
                                            {langName}
                                        </button>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main
                id="characterList"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 justify-center"
            >
                {isLoading && (
                    <p className="col-span-full text-center text-gray-500">
                        Loading characters...
                    </p>
                )}
                {error && (
                    <p className="col-span-full text-center text-red-500">
                        Failed to load data: {error}
                    </p>
                )}
                {!isLoading && !error && filteredCharacters.length === 0 && (
                    <p className="col-span-full text-center text-gray-500">
                        No characters found.
                    </p>
                )}
                {!isLoading &&
                    !error &&
                    filteredCharacters.map((charWrapper) => (
                        <CharacterCard
                            key={charWrapper.character.uniqueId}
                            character={charWrapper}
                            localizedName={getLocalizedName(
                                charWrapper.character.uniqueId
                            )}
                            onCardClick={handleOpenModal}
                        />
                    ))}
            </main>

            {editingCharacter && (
                <CharacterEditorModal
                    characterData={editingCharacter}
                    localizedName={getLocalizedName(
                        editingCharacter.character.uniqueId
                    )}
                    onClose={() => setEditingCharacter(null)}
                    onSave={handleSaveChanges}
                />
            )}
        </>
    );
};

export default CharacterPage;
