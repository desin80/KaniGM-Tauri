const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getSchaleDbLangCode = (lang) => {
    const langMap = {
        zh: "cn",
        en: "en",
    };
    return langMap[lang] || "en";
};

const api = {
    ResponseStatus: {
        Success: "Success",
        Failure: "Failure",
        Error: "Error",
    },

    hinaCheck: async function () {
        try {
            const response = await fetch(`${API_BASE_URL}/api/hina`);
            if (!response.ok) {
                return false;
            }
            const isReady = await response.json();
            return isReady === true;
        } catch (error) {
            return false;
        }
    },

    /**
     * Retrieves the current user ID from the DOM.
     * @returns {number|null} The user ID, or null if not found or invalid.
     */
    getCurrentUserId: () => {
        const uidInput = document.getElementById("uid-input");
        if (uidInput) {
            const userId = parseInt(uidInput.value, 10);
            if (!isNaN(userId) && userId > 0) {
                return userId;
            }
        }
        console.warn(
            "User ID input field not found or value is invalid. Defaulting to 1."
        );
        return 1;
    },

    /**
     * Retrieves the anti-forgery token from the DOM.
     * @returns {string} The request verification token, or an empty string if not found.
     */
    _getRequestVerificationToken: function () {
        const tokenInput = document.querySelector(
            'input[name="__RequestVerificationToken"]'
        );
        return tokenInput ? tokenInput.value : "";
    },

    /**
     * A generic handler for fetch responses that understands the BaseAPIResponse format.
     * @param {Response} response - The response object from a fetch call.
     * @returns {Promise<any>} A promise that resolves with the `data` property of the response body.
     * @throws {Error} Throws an error if the network request fails or if the API response status is 'Failure' or 'Error'.
     */
    _handleResponse: async function (response) {
        // First, check for network-level errors (e.g., 404 Not Found, 500 Internal Server Error)
        if (!response.ok) {
            const errorText = await response
                .text()
                .catch(() => "Unknown server error");
            throw new Error(
                `Network Error: ${response.status} - ${
                    errorText || "No additional error information."
                }`
            );
        }

        // The network request was successful, so we expect a JSON body with our standard API structure.
        const apiResponse = await response.json();

        // Check the application-defined status from the backend.
        if (apiResponse.status === this.ResponseStatus.Success) {
            // On success, the promise resolves with the actual data payload.
            // The calling code (e.g., in character.js) gets the data directly.
            // console.log(apiResponse)
            return apiResponse.data;
        } else {
            // On failure or error, we reject the promise, throwing an error with the specific message from the server.
            // This will be caught by the .catch() block in the calling code.
            throw new Error(
                apiResponse.message || "An unknown API error occurred."
            );
        }
    },

    // --- Character APIs ---

    /**
     * Fetches all character data from the server.
     * @returns {Promise<Array<object>>} A promise that resolves to the 'data' property of the API response.
     */
    getCharacter: function () {
        return fetch(`${API_BASE_URL}/api/get_character`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                RequestVerificationToken: this._getRequestVerificationToken(),
            },
            body: JSON.stringify({
                UserID: api.getCurrentUserId(),
            }),
        }).then((response) => this._handleResponse(response));
    },

    /**
     * Sends modified character data to the server to be saved.
     * @param {object} payload - The complete character data object to save.
     * @returns {Promise<object>} A promise that resolves with the 'data' property of the server's success response.
     */
    modifyCharacter: function (characterData) {
        return fetch(`${API_BASE_URL}/api/modify_character`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                RequestVerificationToken: this._getRequestVerificationToken(),
            },
            body: JSON.stringify({
                UserID: api.getCurrentUserId(),
                Character: characterData.character,
                Weapon: characterData.weapon,
                EquippedEquipment: characterData.equippedEquipment,
                Gear: characterData.gear,
            }),
        }).then((response) => this._handleResponse(response));
    },

    /**
     * Fetches localization data.
     * @returns {Promise<Array<object>>} A promise that resolves to an array of localization objects.
     */
    // getLocalization: function () {
    //     return fetch("/assets/localization.json").then((response) => {
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //         return response.json();
    //     });
    // },

    // --- Command API ---

    /**
     * Executes a command on the server.
     * @param {string} commandText - The command string to execute.
     * @returns {Promise<any>} A promise that resolves with the 'data' property of the result.
     */
    executeCommand: function (commandText) {
        return fetch(`${API_BASE_URL}/api/command`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                RequestVerificationToken: this._getRequestVerificationToken(),
            },
            body: JSON.stringify({
                UserID: api.getCurrentUserId(),
                Command: commandText,
            }),
        }).then((response) => this._handleResponse(response));
    },

    // --- Raid APIs ---

    /**
     * Fetches all raid data.
     * @returns {Promise<object>} A promise that resolves with the 'data' property containing raid types.
     */
    getRaid: function () {
        return fetch(`${API_BASE_URL}/api/get_raidinfo`).then((response) =>
            this._handleResponse(response)
        );
    },

    /**
     * Sets the active raid on the server.
     * @param {string} raidType - The type of the raid (e.g., 'raids').
     * @param {number|string} seasonId - The ID of the raid season to set.
     * @returns {Promise<object>} A promise that resolves with the 'data' property of the server's success response.
     */
    setRaid: function (raidType, seasonId) {
        return fetch(`${API_BASE_URL}/api/set_raid`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                RequestVerificationToken: this._getRequestVerificationToken(),
            },
            body: JSON.stringify({
                UserID: api.getCurrentUserId(),
                RaidType: raidType,
                SeasonId: parseInt(seasonId),
            }),
        }).then((response) => this._handleResponse(response));
    },

    // --- Raid Record APIs ---

    /**
     * Fetches battle records for a specific raid season.
     * @param {number|string} seasonId - The ID of the raid season.
     * @returns {Promise<Array<object>>} A promise that resolves to an array of record objects.
     */
    getRaidRecordsBySeason: function (seasonId) {
        return fetch(`${API_BASE_URL}/api/get_raid_records_by_season`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                RequestVerificationToken: this._getRequestVerificationToken(),
            },
            body: JSON.stringify({
                UserID: api.getCurrentUserId(),
                SeasonId: seasonId,
            }),
        }).then((response) => this._handleResponse(response));
    },

    // ------------------------------------------------------------------------------------------------------------------------------
    // The functions below are placeholders
    /**
     * Fetches battle records for a specific Grand Assault season.
     * @param {number|string} seasonId - The ID of the raid season.
     * @returns {Promise<Array<object>>} A promise that resolves to an array of record objects with armor types.
     */
    getGrandAssaultRecordsBySeason: function (seasonId) {
        return fetch(`${API_BASE_URL}/api/get_grand_records_by_season`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                RequestVerificationToken: this._getRequestVerificationToken(),
            },
            body: JSON.stringify({
                UserID: api.getCurrentUserId(),
                SeasonId: seasonId,
            }),
        }).then((response) => this._handleResponse(response));
    },

    getTADRecordsBySeason: function (dungeonId) {
        console.warn(
            `API call 'getTADRecordsBySeason' for dungeon ${dungeonId} is using mock data.`
        );
        const teamA = [
            { id: 10001, level: 85, starGrade: 5, weaponStarGrade: 2 },
            { id: 10002, level: 87, starGrade: 4, weaponStarGrade: 1 },
            { id: 10003, level: 90, starGrade: 5, weaponStarGrade: 3 },
            { id: 10004, level: 80, starGrade: 3, weaponStarGrade: 0 },
        ];
        const teamB = [
            { id: 10011, level: 85, starGrade: 5, weaponStarGrade: 2 },
            { id: 10012, level: 87, starGrade: 4, weaponStarGrade: 1 },
            { id: 10013, level: 90, starGrade: 5, weaponStarGrade: 3 },
            { id: 10014, level: 80, starGrade: 3, weaponStarGrade: 0 },
        ];
        const teamC = [
            { id: 10021, level: 85, starGrade: 5, weaponStarGrade: 2 },
            { id: 10022, level: 87, starGrade: 4, weaponStarGrade: 1 },
            { id: 10023, level: 90, starGrade: 5, weaponStarGrade: 3 },
            { id: 10024, level: 80, starGrade: 3, weaponStarGrade: 0 },
        ];
        const teamD = [
            { id: 10031, level: 85, starGrade: 5, weaponStarGrade: 2 },
            { id: 10032, level: 87, starGrade: 4, weaponStarGrade: 1 },
            { id: 10033, level: 90, starGrade: 5, weaponStarGrade: 3 },
            { id: 10034, level: 80, starGrade: 3, weaponStarGrade: 0 },
        ];
        const teamE = [
            { id: 10041, level: 85, starGrade: 5, weaponStarGrade: 2 },
            { id: 10042, level: 87, starGrade: 4, weaponStarGrade: 1 },
            { id: 10043, level: 90, starGrade: 5, weaponStarGrade: 3 },
            { id: 10044, level: 80, starGrade: 3, weaponStarGrade: 0 },
        ];
        const teamF = [
            { id: 10051, level: 85, starGrade: 5, weaponStarGrade: 2 },
            { id: 10052, level: 87, starGrade: 4, weaponStarGrade: 1 },
            { id: 10053, level: 90, starGrade: 5, weaponStarGrade: 3 },
            { id: 10054, level: 80, starGrade: 3, weaponStarGrade: 0 },
        ];

        const mockData = [
            {
                battleId: `tad_rec_${dungeonId}_1`,
                totalScore: 78000,
                difficulty: 4,
                teams: {
                    1: { score: 26000, members: teamA },
                    2: { score: 26500, members: teamB },
                    3: { score: 25500, members: teamC },
                },
            },
            {
                battleId: `tad_rec_${dungeonId}_2`,
                totalScore: 75500,
                difficulty: 3,
                teams: {
                    1: { score: 25000, members: teamD },
                    2: { score: 25100, members: teamE },
                    3: { score: 25400, members: teamF },
                },
            },
        ];
        return Promise.resolve(mockData);
    },

    getMultiFloorRaidRecordsBySeason: function (seasonId) {
        console.warn(
            `API call 'getMultiFloorRaidRecordsBySeason' for season ${seasonId} is using mock data.`
        );

        const characterPool = [
            { id: 10001, level: 90, starGrade: 5, weaponStarGrade: 3 },
            { id: 10002, level: 90, starGrade: 5, weaponStarGrade: 3 },
            { id: 10003, level: 90, starGrade: 5, weaponStarGrade: 3 },
            { id: 10004, level: 90, starGrade: 5, weaponStarGrade: 3 },
            { id: 10005, level: 90, starGrade: 5, weaponStarGrade: 3 },
            { id: 10006, level: 90, starGrade: 5, weaponStarGrade: 3 },
            { id: 10007, level: 90, starGrade: 5, weaponStarGrade: 3 },
            { id: 10008, level: 90, starGrade: 5, weaponStarGrade: 3 },
            { id: 10009, level: 90, starGrade: 5, weaponStarGrade: 3 },
            { id: 10010, level: 90, starGrade: 5, weaponStarGrade: 3 },
        ];

        const mockData = [
            {
                battleId: `mfr_rec_${seasonId}_1`,
                difficulty: 124,
                teams: {
                    1: characterPool.slice(0, 10),
                },
            },
            {
                battleId: `mfr_rec_${seasonId}_2`,
                difficulty: 80,
                teams: {
                    1: characterPool.slice(0, 6),
                },
            },
            {
                battleId: `mfr_rec_${seasonId}_3`,
                difficulty: 35,
                teams: {
                    1: characterPool.slice(0, 4),
                },
            },
        ];
        return Promise.resolve(mockData);
    },

    // ------------------------------------------------------------------------------------------------------------------------------
    /**
     * Deletes a specific raid battle record.
     * @param {string} battleId - The unique identifier of the battle record to delete.
     * @returns {Promise<object>} A promise that resolves on successful deletion.
     */
    deleteRaidRecord: function (battleId) {
        // This is a placeholder for the actual API call.
        // return fetch(`${API_BASE_URL}/api/delete_raid_record`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ UserId: api.getCurrentUserId(), BattleId: battleId })
        // }).then(this._handleResponse);

        console.warn("API call 'deleteRaidRecord' is using mock data.");
        return Promise.resolve({
            status: "Success",
            message: "Record deleted successfully.",
        });
    },

    // --- Arena APIs ---

    getArenaRecords: function () {
        return fetch(`${API_BASE_URL}/api/get_arena_records`).then((response) =>
            this._handleResponse(response)
        );
    },

    getArenaSummaries: function () {
        return fetch(`${API_BASE_URL}/api/get_arena_summaries`).then(
            (response) => this._handleResponse(response)
        );
    },

    getArenaDummy: function () {
        return fetch(`${API_BASE_URL}/api/get_arena_dummy`).then((response) =>
            this._handleResponse(response)
        );
    },

    setArenaDummy: function (characterData) {
        return fetch(`${API_BASE_URL}/api/set_arena_dummy`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                RequestVerificationToken: this._getRequestVerificationToken(),
            },
            body: JSON.stringify({
                UserId: api.getCurrentUserId(),
                Character: characterData.character,
                Weapon: characterData.weapon,
                EquippedEquipment: characterData.equippedEquipment,
                Gear: characterData.gear,
            }),
        }).then((response) => this._handleResponse(response));
    },

    deleteArenaRecord: function (recordObject) {
        return fetch(`${API_BASE_URL}/api/delete_arena_record`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                RequestVerificationToken: this._getRequestVerificationToken(),
            },
            body: JSON.stringify({
                UserId: api.getCurrentUserId(),
                Record: recordObject,
            }),
        }).then((response) => this._handleResponse(response));
    },

    deleteArenaSummary: function (attackingTeamIds, defendingTeamIds) {
        return fetch(`${API_BASE_URL}/api/delete_arena_summary`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                RequestVerificationToken: this._getRequestVerificationToken(),
            },
            body: JSON.stringify({
                UserId: api.getCurrentUserId(),
                AttackingTeamIds: attackingTeamIds,
                DefendingTeamIds: defendingTeamIds,
            }),
        }).then((response) => this._handleResponse(response));
    },

    // --- Settings APIs ---
    /**
     * Fetches the current account settings.
     * @returns {Promise<object>} A promise that resolves with the settings object.
     */
    getSettings: function () {
        return fetch(`${API_BASE_URL}/api/get_settings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                RequestVerificationToken: this._getRequestVerificationToken(),
            },
            body: JSON.stringify({
                UserID: api.getCurrentUserId(),
            }),
        }).then((response) => this._handleResponse(response));
    },

    /**
     * Saves the account settings.
     * @param {object} settings - The complete settings object to save.
     * @returns {Promise<object>} A promise that resolves on successful save.
     */
    setSettings: function (settings) {
        return fetch(`${API_BASE_URL}/api/set_settings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                RequestVerificationToken: this._getRequestVerificationToken(),
            },
            body: JSON.stringify({
                UserID: api.getCurrentUserId(),
                ...settings,
            }),
        }).then((response) => this._handleResponse(response));
    },

    /**
     * Fetches extensive student data from SchaleDB, with session-level caching.
     * @param {string} lang - The current language code (e.g., 'en', 'zh').
     * @returns {Promise<object>} A promise that resolves to the student data object from SchaleDB.
     */
    getSchaleDBStudents: async function (lang) {
        const schaleDbLang = getSchaleDbLangCode(lang);
        const cacheKey = `schaledb_students_${schaleDbLang}`;
        const url = `https://schaledb.com/data/${schaleDbLang}/students.json`;

        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
            console.log(
                `[Cache] Loading ${schaleDbLang} students data from sessionStorage.`
            );
            return JSON.parse(cachedData);
        }

        console.log(
            `[API] Fetching ${schaleDbLang} students data from ${url}.`
        );
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Failed to fetch SchaleDB data. Status: ${response.status}`
            );
        }

        const data = await response.json();

        try {
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (e) {
            console.error("Failed to cache SchaleDB data:", e);
            sessionStorage.removeItem(cacheKey);
        }

        return data;
    },
};

export default api;
