const API_BASE_URL = "http://127.0.0.1:80";

const api = {
    ResponseStatus: {
        Success: "Success",
        Failure: "Failure",
        Error: "Error",
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
        return fetch(`${API_BASE_URL}/dev/api/get_character`, {
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
        return fetch(`${API_BASE_URL}/dev/api/modify_character`, {
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
    getLocalization: function () {
        return fetch("/assets/localization.json").then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
    },

    // --- Command API ---

    /**
     * Executes a command on the server.
     * @param {string} commandText - The command string to execute.
     * @returns {Promise<any>} A promise that resolves with the 'data' property of the result.
     */
    executeCommand: function (commandText) {
        return fetch(`${API_BASE_URL}/dev/api/command`, {
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
        return fetch(`${API_BASE_URL}/dev/api/get_raid`).then((response) =>
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
        return fetch(`${API_BASE_URL}/dev/api/set_raid`, {
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

    // --- Arena APIs ---

    getArenaRecords: function () {
        return fetch(`${API_BASE_URL}/dev/api/get_arena_records`).then(
            (response) => this._handleResponse(response)
        );
    },

    getArenaSummaries: function () {
        return fetch(`${API_BASE_URL}/dev/api/get_arena_summaries`).then(
            (response) => this._handleResponse(response)
        );
    },

    getArenaDummy: function () {
        return fetch(`${API_BASE_URL}/dev/api/get_arena_dummy`).then(
            (response) => this._handleResponse(response)
        );
    },

    setArenaDummy: function (characterData) {
        return fetch(`${API_BASE_URL}/dev/api/set_arena_dummy`, {
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
        return fetch(`${API_BASE_URL}/dev/api/delete_arena_record`, {
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
        return fetch(`${API_BASE_URL}/dev/api/delete_arena_summary`, {
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
};

export default api;
