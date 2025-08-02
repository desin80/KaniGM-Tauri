import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: "en", name: t("languages.en") },
        { code: "zh", name: t("languages.zh") },
        { code: "ja", name: t("languages.ja") },
    ];

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsOpen(false);
    };

    const currentLanguage =
        languages.find((lang) => lang.code === i18n.language) || languages[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 whitespace-nowrap"
            >
                {currentLanguage.name}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-20 ring-1 ring-black ring-opacity-5">
                    {languages.map((language) => (
                        <button
                            key={language.code}
                            onClick={() => changeLanguage(language.code)}
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                                i18n.language === language.code
                                    ? "text-sky-600 bg-sky-50"
                                    : "text-gray-700"
                            }`}
                        >
                            {language.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
