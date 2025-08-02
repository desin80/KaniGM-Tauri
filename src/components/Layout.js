import React, { useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Layout.css";
import logo from "../assets/logo.png";
import LanguageSwitcher from "./LanguageSwitcher";

const Layout = () => {
    const { t } = useTranslation();

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * 8);
        const selectedImage = `bg${randomIndex}.jpg`;
        const imageUrl = `/assets/${selectedImage}`;
        document.body.style.setProperty(
            "--random-bg-image",
            `url('${imageUrl}')`
        );

        const uidInput = document.getElementById("uid-input");
        const localStorageKey = "kaniArchive_userId";
        const storedUid = localStorage.getItem(localStorageKey);

        if (
            storedUid !== null &&
            storedUid !== undefined &&
            !isNaN(parseInt(storedUid, 10))
        ) {
            uidInput.value = storedUid;
        } else {
            localStorage.setItem(localStorageKey, uidInput.value);
        }

        uidInput.addEventListener("input", function () {
            console.log("saved");
            localStorage.setItem(localStorageKey, uidInput.value);
        });
    }, []);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 topbar-bg shadow-md">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex-shrink-0">
                                <img
                                    className="h-12 w-auto rounded-md"
                                    src={logo}
                                    alt="Logo"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                            "https://placehold.co/120x48/3b82f6/ffffff?text=Logo&font=inter";
                                    }}
                                />
                            </Link>
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-4">
                                    <Link
                                        to="/character"
                                        className="hover:bg-gray-200 px-3 py-2 rounded-md topbar-title transition-colors"
                                    >
                                        {t("nav.character")}
                                    </Link>
                                    <Link
                                        to="/arena"
                                        className="hover:bg-gray-200 px-3 py-2 rounded-md topbar-title transition-colors"
                                    >
                                        {t("nav.arena")}
                                    </Link>
                                    <Link
                                        to="/content"
                                        className="hover:bg-gray-200 px-3 py-2 rounded-md topbar-title transition-colors"
                                    >
                                        {t("nav.raid")}
                                    </Link>
                                    <Link
                                        to="/command"
                                        className="hover:bg-gray-200 px-3 py-2 rounded-md topbar-title transition-colors"
                                    >
                                        {t("nav.command")}
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <label
                                htmlFor="uid-input"
                                className="text-lg font-medium text-gray-700 pr-4"
                            >
                                {t("nav.uid")}
                            </label>
                            <input
                                id="uid-input"
                                type="text"
                                defaultValue="1"
                                className="flex-grow bg-white/80 text-slate-800 placeholder-slate-400 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm w-24"
                            />
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto max-w-7xl pt-20 md:pt-24 p-4 md:p-8">
                <Outlet />
            </main>
        </>
    );
};

export default Layout;
