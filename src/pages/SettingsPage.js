import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import "./SettingsPage.css";

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

const SettingsPage = () => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState({
        text: "",
        isError: false,
    });

    const showStatus = (text, isError = false) => {
        setStatusMessage({ text, isError });
        setTimeout(() => setStatusMessage({ text: "", isError: false }), 2500);
    };

    useEffect(() => {
        api.getSettings()
            .then((data) => setSettings(data))
            .catch((err) =>
                showStatus(
                    t("settings.loadError", { message: err.message }),
                    true
                )
            )
            .finally(() => setIsLoading(false));
    }, [t]);

    const handleToggleChange = (key) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleTimeToggleChange = () => {
        setSettings((prev) => ({
            ...prev,
            changetime: {
                ...prev.changetime,
                enabled: !prev.changetime.enabled,
            },
        }));
    };

    const handleTimeOffsetChange = (e) => {
        const value = e.target.value;
        setSettings((prev) => ({
            ...prev,
            changetime: {
                ...prev.changetime,
                offset: value === "" ? 0 : parseInt(value, 10),
            },
        }));
    };

    const handleSave = async () => {
        showStatus(t("settings.saving"));
        try {
            await api.setSettings(settings);
            showStatus(t("settings.saveSuccess"), false);
        } catch (err) {
            showStatus(t("settings.saveError", { message: err.message }), true);
        }
    };

    if (isLoading || !settings) {
        return (
            <p className="text-center text-gray-500 py-8">
                {t("settings.loading")}
            </p>
        );
    }

    return (
        <>
            <StatusPopup
                message={statusMessage.text}
                isError={statusMessage.isError}
            />
            <div className="settings-card">
                <div className="setting-row">
                    <div className="setting-info">
                        <p className="setting-title">
                            {t("settings.trackpvp.title")}
                        </p>
                        <p className="setting-description">
                            {t("settings.trackpvp.description")}
                        </p>
                    </div>
                    <div className="setting-control">
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.trackpvp}
                                onChange={() => handleToggleChange("trackpvp")}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <div className="setting-row">
                    <div className="setting-info">
                        <p className="setting-title">
                            {t("settings.usefinal.title")}
                        </p>
                        <p className="setting-description">
                            {t("settings.usefinal.description")}
                        </p>
                    </div>
                    <div className="setting-control">
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.usefinal}
                                onChange={() => handleToggleChange("usefinal")}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <div className="setting-row">
                    <div className="setting-info">
                        <p className="setting-title">
                            {t("settings.bypassteam.title")}
                        </p>
                        <p className="setting-description">
                            {t("settings.bypassteam.description")}
                        </p>
                    </div>
                    <div className="setting-control">
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.bypassteam}
                                onChange={() =>
                                    handleToggleChange("bypassteam")
                                }
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <div className="setting-row">
                    <div className="setting-info">
                        <p className="setting-title">
                            {t("settings.changetime.title")}
                        </p>
                        <p className="setting-description">
                            {t("settings.changetime.description")}
                        </p>
                    </div>
                    <div className="setting-control">
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.changetime.enabled}
                                onChange={handleTimeToggleChange}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                        <input
                            type="number"
                            className="form-input w-24 text-center"
                            value={settings.changetime.offset}
                            onChange={handleTimeOffsetChange}
                            disabled={!settings.changetime.enabled}
                            placeholder={t("settings.daysPlaceholder")}
                        />
                    </div>
                </div>

                <div className="flex justify-end mt-8">
                    <button
                        className="skewed-button skewed-button--primary"
                        onClick={handleSave}
                    >
                        <div className="skewed-button-content">
                            <span>{t("settings.saveButton")}</span>
                        </div>
                    </button>
                </div>
            </div>
        </>
    );
};

export default SettingsPage;
