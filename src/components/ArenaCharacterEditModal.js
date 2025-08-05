import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const getNestedValue = (obj, path) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
};

const ArenaCharacterEditModal = ({
    characterData,
    allStudentsData,
    onClose,
    onSave,
}) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState(
        JSON.parse(JSON.stringify(characterData))
    );
    const [searchInput, setSearchInput] = useState("");
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const char = characterData.character;
        setFormData(JSON.parse(JSON.stringify(characterData)));
        setSearchInput(char.Name || `ID: ${char.uniqueId}`);
    }, [characterData]);

    const handleInputChange = (path, event) => {
        const { value, min, max } = event.target;
        const newFormData = JSON.parse(JSON.stringify(formData));
        let current = newFormData;
        const keys = path.split(".");
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]] || typeof current[keys[i]] !== "object") {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        let finalValue;
        if (path.startsWith("weapon.") || path === "gear.tier") {
            if (value.trim() === "") {
                finalValue = null;
            } else {
                let parsed = parseInt(value, 10);
                const minValue = parseInt(min, 10);
                const maxValue = parseInt(max, 10);
                if (!isNaN(minValue) && parsed < minValue) parsed = minValue;
                if (!isNaN(maxValue) && parsed > maxValue) parsed = maxValue;
                finalValue = isNaN(parsed) ? null : parsed;
            }
        } else {
            let parsed = parseInt(value, 10);
            const minValue = parseInt(min, 10);
            const maxValue = parseInt(max, 10);
            if (isNaN(parsed) || value.trim() === "") {
                finalValue = minValue;
            } else {
                if (!isNaN(minValue) && parsed < minValue) {
                    finalValue = minValue;
                } else if (!isNaN(maxValue) && parsed > maxValue) {
                    finalValue = maxValue;
                } else {
                    finalValue = parsed;
                }
            }
        }
        current[keys[keys.length - 1]] = finalValue;
        setFormData(newFormData);
    };

    const selectCharacter = (student) => {
        const newFormData = JSON.parse(JSON.stringify(formData));
        const existingData = newFormData.character;
        newFormData.character = {
            ...existingData,
            ...student,
            uniqueId: student.Id,
        };

        setFormData(newFormData);
        setSearchInput(student.Name);
        setDropdownOpen(false);
    };

    const filteredCharacters = allStudentsData
        ? Object.values(allStudentsData).filter(
              (char) =>
                  char.Name.toLowerCase().includes(searchInput.toLowerCase()) ||
                  String(char.Id).includes(searchInput)
          )
        : [];

    if (!formData) return null;
    const { weapon, equippedEquipment, gear } = formData;

    return (
        <div
            className="fixed inset-0 bg-gray-600/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
            onClick={onClose}
        >
            <div
                className="relative top-10 mx-auto p-5 border w-full max-w-xl shadow-xl rounded-lg bg-white text-slate-800"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2 text-sm">
                    <form
                        className="space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            onSave(formData);
                        }}
                    >
                        <fieldset className="border border-gray-300 p-3 rounded-md">
                            <legend className="text-gray-500 px-1 text-xs">
                                {t("character.title")}
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                                <div className="relative sm:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700">
                                        {t("character.uniqueId")}:
                                    </label>
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => {
                                            setSearchInput(e.target.value);
                                            setDropdownOpen(true);
                                        }}
                                        onFocus={() => setDropdownOpen(true)}
                                        onBlur={() =>
                                            setTimeout(
                                                () => setDropdownOpen(false),
                                                150
                                            )
                                        }
                                        placeholder={t(
                                            "common.searchByIdOrName"
                                        )}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    />
                                    {isDropdownOpen && (
                                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {filteredCharacters
                                                .slice(0, 10)
                                                .map((char) => (
                                                    <div
                                                        key={char.Id}
                                                        onMouseDown={() =>
                                                            selectCharacter(
                                                                char
                                                            )
                                                        }
                                                        className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                                                    >
                                                        <img
                                                            src={`https://schaledb.com/images/student/icon/${char.Id}.webp`}
                                                            alt={char.Name}
                                                            className="w-6 h-6 rounded-full mr-2"
                                                        />
                                                        <span>
                                                            {char.Name}
                                                            (ID: {char.Id})
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">
                                        {t("character.starGrade")}:
                                    </label>
                                    <input
                                        type="number"
                                        value={
                                            getNestedValue(
                                                formData,
                                                "character.starGrade"
                                            ) ?? ""
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "character.starGrade",
                                                e
                                            )
                                        }
                                        min="1"
                                        max="5"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">
                                        {t("character.level")}:
                                    </label>
                                    <input
                                        type="number"
                                        value={
                                            getNestedValue(
                                                formData,
                                                "character.level"
                                            ) ?? ""
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "character.level",
                                                e
                                            )
                                        }
                                        min="1"
                                        max="90"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">
                                        {t("character.favorRank")}:
                                    </label>
                                    <input
                                        type="number"
                                        value={
                                            getNestedValue(
                                                formData,
                                                "character.favorRank"
                                            ) ?? ""
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "character.favorRank",
                                                e
                                            )
                                        }
                                        min="1"
                                        max="100"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="border border-gray-300 p-3 rounded-md">
                            <legend className="text-gray-500 px-1 text-xs">
                                {t("character.skills")}
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">
                                        {t("character.exSkill")}:
                                    </label>
                                    <input
                                        type="number"
                                        value={
                                            getNestedValue(
                                                formData,
                                                "character.exSkillLevel"
                                            ) ?? ""
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "character.exSkillLevel",
                                                e
                                            )
                                        }
                                        min="1"
                                        max="5"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">
                                        {t("character.normalSkill")}:
                                    </label>
                                    <input
                                        type="number"
                                        value={
                                            getNestedValue(
                                                formData,
                                                "character.publicSkillLevel"
                                            ) ?? ""
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "character.publicSkillLevel",
                                                e
                                            )
                                        }
                                        min="1"
                                        max="10"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">
                                        {t("character.passiveSkill")}:
                                    </label>
                                    <input
                                        type="number"
                                        value={
                                            getNestedValue(
                                                formData,
                                                "character.passiveSkillLevel"
                                            ) ?? ""
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "character.passiveSkillLevel",
                                                e
                                            )
                                        }
                                        min="1"
                                        max="10"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">
                                        {t("character.subSkill")}:
                                    </label>
                                    <input
                                        type="number"
                                        value={
                                            getNestedValue(
                                                formData,
                                                "character.extraPassiveSkillLevel"
                                            ) ?? ""
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "character.extraPassiveSkillLevel",
                                                e
                                            )
                                        }
                                        min="1"
                                        max="10"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="border border-gray-300 p-3 rounded-md">
                            <legend className="text-gray-500 px-1 text-xs">
                                {t("character.potentialStats")}
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">
                                        {t("character.maxHP")}:
                                    </label>
                                    <input
                                        type="number"
                                        value={
                                            getNestedValue(
                                                formData,
                                                "character.potentialStats.1"
                                            ) ?? ""
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "character.potentialStats.1",
                                                e
                                            )
                                        }
                                        min="0"
                                        max="25"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">
                                        {t("character.attack")}:
                                    </label>
                                    <input
                                        type="number"
                                        value={
                                            getNestedValue(
                                                formData,
                                                "character.potentialStats.2"
                                            ) ?? ""
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "character.potentialStats.2",
                                                e
                                            )
                                        }
                                        min="0"
                                        max="25"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">
                                        {t("character.heal")}:
                                    </label>
                                    <input
                                        type="number"
                                        value={
                                            getNestedValue(
                                                formData,
                                                "character.potentialStats.3"
                                            ) ?? ""
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "character.potentialStats.3",
                                                e
                                            )
                                        }
                                        min="0"
                                        max="25"
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="border border-gray-300 p-3 rounded-md">
                            <legend className="text-gray-500 px-1 text-xs">
                                {t("character.weapon")}
                            </legend>
                            {weapon ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                                    <label className="block text-xs font-medium text-gray-700">
                                        {t("character.level")}:
                                        <input
                                            type="number"
                                            value={
                                                getNestedValue(
                                                    formData,
                                                    "weapon.level"
                                                ) ?? ""
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "weapon.level",
                                                    e
                                                )
                                            }
                                            min="1"
                                            max="60"
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                        />
                                    </label>
                                    <label className="block text-xs font-medium text-gray-700">
                                        {t("character.starGrade")}:
                                        <input
                                            type="number"
                                            value={
                                                getNestedValue(
                                                    formData,
                                                    "weapon.starGrade"
                                                ) ?? ""
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "weapon.starGrade",
                                                    e
                                                )
                                            }
                                            min="1"
                                            max="4"
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                        />
                                    </label>
                                </div>
                            ) : (
                                <div className="text-gray-500 italic text-center py-2">
                                    {t("common.na")}
                                </div>
                            )}
                        </fieldset>

                        <fieldset className="border border-gray-300 p-3 rounded-md">
                            <legend className="text-gray-500 px-1 text-xs">
                                {t("character.equipmentTiers")}
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3">
                                {[0, 1, 2].map((i) => (
                                    <div key={i}>
                                        <label
                                            className="block text-xs font-medium text-gray-700"
                                            title={
                                                equippedEquipment?.[i]
                                                    ? `UID: ${equippedEquipment[i].uniqueId}`
                                                    : ""
                                            }
                                        >
                                            Eq. {i + 1} {t("character.tier")}:
                                        </label>
                                        <input
                                            type="number"
                                            value={
                                                getNestedValue(
                                                    formData,
                                                    `equippedEquipment.${i}.tier`
                                                ) ?? ""
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    `equippedEquipment.${i}.tier`,
                                                    e
                                                )
                                            }
                                            min="1"
                                            max="10"
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                            disabled={!equippedEquipment?.[i]}
                                            placeholder={
                                                !equippedEquipment?.[i]
                                                    ? t("common.na")
                                                    : ""
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </fieldset>

                        <fieldset className="border border-gray-300 p-3 rounded-md">
                            <legend className="text-gray-500 px-1 text-xs">
                                {t("character.gearTier")}
                            </legend>
                            <div>
                                <label
                                    className="block text-xs font-medium text-gray-700"
                                    title={gear ? `UID: ${gear.uniqueId}` : ""}
                                >
                                    {t("character.tier")}:
                                </label>
                                <input
                                    type="number"
                                    value={
                                        getNestedValue(formData, "gear.tier") ??
                                        ""
                                    }
                                    onChange={(e) =>
                                        handleInputChange("gear.tier", e)
                                    }
                                    min="1"
                                    max="2"
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    disabled={!gear}
                                    placeholder={!gear ? t("common.na") : ""}
                                />
                            </div>
                        </fieldset>
                    </form>
                </div>
                <div className="flex justify-end pt-4 p-4 space-x-2 border-t">
                    <button
                        className="skewed-button skewed-button--cancel"
                        onClick={onClose}
                    >
                        <div className="skewed-button-content">
                            <span>{t("common.cancel")}</span>
                        </div>
                    </button>
                    <button
                        className="skewed-button skewed-button--primary"
                        onClick={() => onSave(formData)}
                    >
                        <div className="skewed-button-content">
                            <span>{t("common.save")}</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArenaCharacterEditModal;
