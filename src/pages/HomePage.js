import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "./HomePage.css";

import logoLarge from "../assets/logo_large.png";
import arenaIcon from "../assets/attack_icon.png";

const HomePage = () => {
    const { t } = useTranslation();

    return (
        <div className="flex-grow flex flex-col items-center justify-center relative overflow-hidden p-5 sm:p-8 md:p-12 text-center">
            <div>
                <div className="mt-10 mb-10">
                    <img
                        src={logoLarge}
                        alt="KaniPS Logo"
                        className="w-96 h-96 sm:w-[28rem] sm:h-[10rem] mx-auto object-contain"
                    />
                </div>
                <div className="shortcut-grid">
                    {/* Character Button */}
                    <Link to="/character">
                        <button className="shortcut-button">
                            <div className="shortcut-button-content">
                                <img
                                    className="shortcut-icon"
                                    src="https://schaledb.com/images/student/icon/10045.webp"
                                    alt="Character Icon"
                                />
                                <div className="shortcut-text-content">
                                    <h5 className="shortcut-title">
                                        {t("home.character.title")}
                                    </h5>
                                    <p className="shortcut-description">
                                        {t("home.character.description")}
                                    </p>
                                </div>
                            </div>
                        </button>
                    </Link>

                    {/* Arena Button */}
                    <Link to="/arena">
                        <button className="shortcut-button">
                            <div className="shortcut-button-content">
                                <img
                                    className="shortcut-icon"
                                    src={arenaIcon}
                                    alt="Arena Icon"
                                />
                                <div className="shortcut-text-content">
                                    <h5 className="shortcut-title">
                                        {t("home.arena.title")}
                                    </h5>
                                    <p className="shortcut-description">
                                        {t("home.arena.description")}
                                    </p>
                                </div>
                            </div>
                        </button>
                    </Link>

                    {/* Raid Button */}
                    <Link to="/content">
                        <button className="shortcut-button">
                            <div className="shortcut-button-content">
                                <img
                                    className="shortcut-icon"
                                    src="https://schaledb.com/images/raid/icon/Icon_Binah.png"
                                    alt="Raid Icon"
                                />
                                <div className="shortcut-text-content">
                                    <h5 className="shortcut-title">
                                        {t("home.content.title")}
                                    </h5>
                                    <p className="shortcut-description">
                                        {t("home.content.description")}
                                    </p>
                                </div>
                            </div>
                        </button>
                    </Link>

                    {/* Command Button */}
                    <Link to="/command">
                        <button className="shortcut-button">
                            <div className="shortcut-button-content">
                                <img
                                    className="shortcut-icon"
                                    src="https://schaledb.com/images/gear/icon/23003.webp"
                                    alt="CMD Icon"
                                />
                                <div className="shortcut-text-content">
                                    <h5 className="shortcut-title">
                                        {t("home.command.title")}
                                    </h5>
                                    <p className="shortcut-description">
                                        {t("home.command.description")}
                                    </p>
                                </div>
                            </div>
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
