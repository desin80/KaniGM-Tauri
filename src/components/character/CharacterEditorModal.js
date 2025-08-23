import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const getNestedValue = (obj, path) => {
    const keys = path.split(".");
    let result = obj;
    for (const key of keys) {
        if (result && typeof result === "object" && key in result) {
            result = result[key];
        } else {
            return undefined;
        }
    }
    return result;
};

const CharacterEditorModal = ({ characterData, onClose, onSave }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState(
        JSON.parse(JSON.stringify(characterData))
    );

    useEffect(() => {
        setFormData(JSON.parse(JSON.stringify(characterData)));
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

        if (path.startsWith("weapon.")) {
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

    if (!formData) return null;

    const { character, weapon, equippedEquipment, gear } = formData;
    const localizedName = character.Name || `Character ${character.uniqueId}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
            <div
                className="character-editor-content bg-white shadow-xl overflow-hidden transition-all duration-300 ease-in-out rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 card-decoration overflow-y-auto">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
                        <img
                            src={`https://schaledb.com/images/student/collection/${character.uniqueId}.webp`}
                            alt={localizedName}
                            className="character-image w-24 h-24 md:w-28 md:h-28 rounded-md object-cover mr-0 sm:mr-4 mb-3 sm:mb-0 border-2 border-gray-300"
                        />
                        <div>
                            <h2 className="character-editor-title text-sky-600">
                                {localizedName}
                            </h2>
                            <p className="character-ids text-xs text-gray-500">
                                {t("character.uniqueId")}:{" "}
                                <span>{character.uniqueId}</span> |
                                {t("character.serverId")}:{" "}
                                <span>{character.serverId}</span>
                            </p>
                        </div>
                    </div>

                    <form
                        className="space-y-4 text-sm"
                        onSubmit={(e) => {
                            e.preventDefault();
                            onSave(formData);
                        }}
                    >
                        <fieldset className="border border-gray-300 p-3 rounded-md">
                            <legend className="text-gray-500 px-1 text-xs">
                                {t("character.characterStats")}
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
                                <label className="block">
                                    <span className="stat-label inline-block">
                                        {t("character.starGrade")}:
                                    </span>
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
                                        className="number-input form-input"
                                    />
                                </label>
                                <label className="block">
                                    <span className="stat-label inline-block">
                                        {t("character.level")}:
                                    </span>
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
                                        className="number-input form-input"
                                    />
                                </label>
                                <label className="block">
                                    <span className="stat-label inline-block">
                                        {t("character.favorRank")}:
                                    </span>
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
                                        className="number-input form-input"
                                    />
                                </label>
                            </div>
                        </fieldset>

                        <fieldset className="border border-gray-300 p-3 rounded-md">
                            <legend className="text-gray-500 px-1 text-xs">
                                {t("character.skills")}
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                <label className="block">
                                    <span className="stat-label inline-block">
                                        {t("character.exSkill")}:
                                    </span>
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
                                        className="number-input form-input"
                                    />
                                </label>
                                <label className="block">
                                    <span className="stat-label inline-block">
                                        {t("character.normalSkill")}:
                                    </span>
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
                                        className="number-input form-input"
                                    />
                                </label>
                                <label className="block">
                                    <span className="stat-label inline-block">
                                        {t("character.passiveSkill")}:
                                    </span>
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
                                        className="number-input form-input"
                                    />
                                </label>
                                <label className="block">
                                    <span className="stat-label inline-block">
                                        {t("character.subSkill")}:
                                    </span>
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
                                        className="number-input form-input"
                                    />
                                </label>
                            </div>
                        </fieldset>

                        <fieldset className="border border-gray-300 p-3 rounded-md">
                            <legend className="text-gray-500 px-1 text-xs">
                                {t("character.potentialStats")}
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
                                <label className="block">
                                    <span className="stat-label inline-block">
                                        {t("character.maxHP")}:
                                    </span>
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
                                        max="50"
                                        className="number-input form-input"
                                    />
                                </label>
                                <label className="block">
                                    <span className="stat-label inline-block">
                                        {t("character.attack")}:
                                    </span>
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
                                        max="50"
                                        className="number-input form-input"
                                    />
                                </label>
                                <label className="block">
                                    <span className="stat-label inline-block">
                                        {t("character.heal")}:
                                    </span>
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
                                        max="50"
                                        className="number-input form-input"
                                    />
                                </label>
                            </div>
                        </fieldset>

                        <div className="weapon-stats-container">
                            <fieldset className="border border-gray-300 p-3 rounded-md">
                                <legend className="text-gray-500 px-1 text-xs">
                                    {t("character.weapon")}
                                </legend>
                                {weapon ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                        <label className="block">
                                            <span className="stat-label inline-block">
                                                {t("character.level")}:
                                            </span>
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
                                                className="number-input form-input"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="stat-label inline-block">
                                                {t("character.starGrade")}:
                                            </span>
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
                                                className="number-input form-input"
                                            />
                                        </label>
                                    </div>
                                ) : (
                                    <div className="weapon-internal-na-message">
                                        {t("common.na")}
                                    </div>
                                )}
                            </fieldset>
                        </div>

                        <div className="equipment-container">
                            <fieldset className="border border-gray-300 p-3 rounded-md">
                                <legend className="text-gray-500 px-1 text-xs">
                                    {t("character.equipmentTiers")}
                                </legend>
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-4 gap-y-2 equipment-slots">
                                    {[0, 1, 2].map((i) => (
                                        <label key={i} className="block">
                                            <span
                                                className="stat-label inline-block"
                                                title={
                                                    equippedEquipment?.[i]
                                                        ? `Eq. Type UID: ${equippedEquipment[i].uniqueId}`
                                                        : ""
                                                }
                                            >
                                                Eq. {i + 1}:
                                            </span>
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
                                                className="number-input form-input"
                                                disabled={
                                                    !equippedEquipment?.[i]
                                                }
                                                placeholder={
                                                    !equippedEquipment?.[i]
                                                        ? "N/A"
                                                        : ""
                                                }
                                            />
                                        </label>
                                    ))}
                                    <label className="block">
                                        <span
                                            className="stat-label inline-block"
                                            title={
                                                gear
                                                    ? `Gear Type UID: ${gear.uniqueId}`
                                                    : ""
                                            }
                                        >
                                            {t("character.gear")}:
                                        </span>
                                        <input
                                            type="number"
                                            value={
                                                getNestedValue(
                                                    formData,
                                                    "gear.tier"
                                                ) ?? ""
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "gear.tier",
                                                    e
                                                )
                                            }
                                            min="0"
                                            max="2"
                                            className="number-input form-input"
                                            disabled={!gear}
                                            placeholder={
                                                !gear ? t("common.na") : ""
                                            }
                                        />
                                    </label>
                                </div>
                            </fieldset>
                        </div>
                    </form>
                </div>

                <div className="mt-auto p-4 text-right bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-end space-x-3">
                        <button
                            className="skewed-button skewed-button--cancel"
                            onClick={onClose}
                        >
                            <div className="skewed-button-content">
                                <span>{t("common.close")}</span>
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
        </div>
    );
};

export default CharacterEditorModal;
