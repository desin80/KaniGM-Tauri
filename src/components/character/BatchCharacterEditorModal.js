import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { produce } from "immer";

const BatchUpdateField = ({
    label,
    path,
    type = "number",
    min,
    max,
    checked,
    value,
    onCheckboxChange,
    onValueChange,
}) => {
    const { t } = useTranslation();

    return (
        <label className="block sm:flex sm:items-center">
            <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-sky-600 rounded mr-3"
                checked={checked}
                onChange={(e) => onCheckboxChange(path, e.target.checked)}
            />
            <span className="stat-label inline-block sm:w-1/3">{label}:</span>
            <input
                type={type}
                value={value ?? ""}
                onChange={(e) => onValueChange(path, e)}
                min={min}
                max={max}
                className="number-input form-input sm:w-2/3"
                disabled={!checked}
                placeholder={!checked ? t("common.noChange") : ""}
            />
        </label>
    );
};

const BatchCharacterEditorModal = ({ selectedCharacters, onClose, onSave }) => {
    const { t } = useTranslation();
    const [fieldsToUpdate, setFieldsToUpdate] = useState({});
    const [formData, setFormData] = useState({});

    const handleCheckboxChange = (path, isChecked) => {
        setFieldsToUpdate(
            produce((draft) => {
                draft[path] = isChecked;
            })
        );
        if (!isChecked) {
            setFormData(
                produce((draft) => {
                    delete draft[path];
                })
            );
        }
    };

    const handleValueChange = (path, event) => {
        const { value, min, max } = event.target;
        let parsed = parseInt(value, 10);
        const minValue = parseInt(min, 10);
        const maxValue = parseInt(max, 10);

        if (isNaN(parsed) || value.trim() === "") {
            parsed = minValue;
        } else {
            if (!isNaN(minValue) && parsed < minValue) parsed = minValue;
            if (!isNaN(maxValue) && parsed > maxValue) parsed = maxValue;
        }
        setFormData(
            produce((draft) => {
                draft[path] = parsed;
            })
        );
    };

    const handleSaveChanges = () => {
        const changes = {};
        for (const path in fieldsToUpdate) {
            if (fieldsToUpdate[path] && formData[path] !== undefined) {
                changes[path] = formData[path];
            }
        }
        onSave(changes);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
            <div
                className="character-editor-content bg-white shadow-xl overflow-hidden transition-all duration-300 ease-in-out rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 card-decoration overflow-y-auto">
                    <div className="mb-4">
                        <h2 className="character-editor-title text-sky-600">
                            {t("character.batchEditTitle")}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {t("character.batchEditSubtitle", {
                                count: selectedCharacters.length,
                            })}
                        </p>
                    </div>

                    <form
                        className="space-y-4 text-sm"
                        onSubmit={(e) => e.preventDefault()}
                    >
                        <fieldset className="border border-gray-300 p-3 rounded-md">
                            <legend className="text-gray-500 px-1 text-xs">
                                {t("character.characterStats")}
                            </legend>
                            <div className="space-y-2">
                                <BatchUpdateField
                                    label={t("character.starGrade")}
                                    path="character.starGrade"
                                    min="1"
                                    max="5"
                                    checked={
                                        !!fieldsToUpdate["character.starGrade"]
                                    }
                                    value={formData["character.starGrade"]}
                                    onCheckboxChange={handleCheckboxChange}
                                    onValueChange={handleValueChange}
                                />
                                <BatchUpdateField
                                    label={t("character.level")}
                                    path="character.level"
                                    min="1"
                                    max="90"
                                    checked={
                                        !!fieldsToUpdate["character.level"]
                                    }
                                    value={formData["character.level"]}
                                    onCheckboxChange={handleCheckboxChange}
                                    onValueChange={handleValueChange}
                                />
                                <BatchUpdateField
                                    label={t("character.favorRank")}
                                    path="character.favorRank"
                                    min="1"
                                    max="100"
                                    checked={
                                        !!fieldsToUpdate["character.favorRank"]
                                    }
                                    value={formData["character.favorRank"]}
                                    onCheckboxChange={handleCheckboxChange}
                                    onValueChange={handleValueChange}
                                />
                            </div>
                        </fieldset>

                        <fieldset className="border border-gray-300 p-3 rounded-md">
                            <legend className="text-gray-500 px-1 text-xs">
                                {t("character.skills")}
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                <BatchUpdateField
                                    label={t("character.exSkill")}
                                    path="character.exSkillLevel"
                                    min="1"
                                    max="5"
                                    checked={
                                        !!fieldsToUpdate[
                                            "character.exSkillLevel"
                                        ]
                                    }
                                    value={formData["character.exSkillLevel"]}
                                    onCheckboxChange={handleCheckboxChange}
                                    onValueChange={handleValueChange}
                                />
                                <BatchUpdateField
                                    label={t("character.normalSkill")}
                                    path="character.publicSkillLevel"
                                    min="1"
                                    max="10"
                                    checked={
                                        !!fieldsToUpdate[
                                            "character.publicSkillLevel"
                                        ]
                                    }
                                    value={
                                        formData["character.publicSkillLevel"]
                                    }
                                    onCheckboxChange={handleCheckboxChange}
                                    onValueChange={handleValueChange}
                                />
                                <BatchUpdateField
                                    label={t("character.passiveSkill")}
                                    path="character.passiveSkillLevel"
                                    min="1"
                                    max="10"
                                    checked={
                                        !!fieldsToUpdate[
                                            "character.passiveSkillLevel"
                                        ]
                                    }
                                    value={
                                        formData["character.passiveSkillLevel"]
                                    }
                                    onCheckboxChange={handleCheckboxChange}
                                    onValueChange={handleValueChange}
                                />
                                <BatchUpdateField
                                    label={t("character.subSkill")}
                                    path="character.extraPassiveSkillLevel"
                                    min="1"
                                    max="10"
                                    checked={
                                        !!fieldsToUpdate[
                                            "character.extraPassiveSkillLevel"
                                        ]
                                    }
                                    value={
                                        formData[
                                            "character.extraPassiveSkillLevel"
                                        ]
                                    }
                                    onCheckboxChange={handleCheckboxChange}
                                    onValueChange={handleValueChange}
                                />
                            </div>
                        </fieldset>
                        <fieldset className="border border-gray-300 p-3 rounded-md">
                            <legend className="text-gray-500 px-1 text-xs">
                                {t("character.weapon")}
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                <BatchUpdateField
                                    label={t("character.level")}
                                    path="weapon.level"
                                    min="1"
                                    max="60"
                                    checked={!!fieldsToUpdate["weapon.level"]}
                                    value={formData["weapon.level"]}
                                    onCheckboxChange={handleCheckboxChange}
                                    onValueChange={handleValueChange}
                                />
                                <BatchUpdateField
                                    label={t("character.starGrade")}
                                    path="weapon.starGrade"
                                    min="1"
                                    max="4"
                                    checked={
                                        !!fieldsToUpdate["weapon.starGrade"]
                                    }
                                    value={formData["weapon.starGrade"]}
                                    onCheckboxChange={handleCheckboxChange}
                                    onValueChange={handleValueChange}
                                />
                            </div>
                        </fieldset>
                        <fieldset className="border border-gray-300 p-3 rounded-md">
                            <legend className="text-gray-500 px-1 text-xs">
                                {t("character.equipmentTiers")}
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
                                {[0, 1, 2].map((i) => (
                                    <BatchUpdateField
                                        key={i}
                                        label={t("character.equipmentTier", {
                                            num: i + 1,
                                        })}
                                        path={`equippedEquipment.${i}.tier`}
                                        min="1"
                                        max="10"
                                        checked={
                                            !!fieldsToUpdate[
                                                `equippedEquipment.${i}.tier`
                                            ]
                                        }
                                        value={
                                            formData[
                                                `equippedEquipment.${i}.tier`
                                            ]
                                        }
                                        onCheckboxChange={handleCheckboxChange}
                                        onValueChange={handleValueChange}
                                    />
                                ))}
                            </div>
                        </fieldset>
                        <fieldset className="border border-gray-300 p-3 rounded-md">
                            <legend className="text-gray-500 px-1 text-xs">
                                {t("character.gear")}
                            </legend>
                            <div className="space-y-2">
                                <BatchUpdateField
                                    label={t("character.tier")}
                                    path="gear.tier"
                                    min="0"
                                    max="2"
                                    checked={!!fieldsToUpdate["gear.tier"]}
                                    value={formData["gear.tier"]}
                                    onCheckboxChange={handleCheckboxChange}
                                    onValueChange={handleValueChange}
                                />
                            </div>
                        </fieldset>
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
                            onClick={handleSaveChanges}
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

export default BatchCharacterEditorModal;
