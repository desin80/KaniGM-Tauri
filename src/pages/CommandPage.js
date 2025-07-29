import React, { useState } from "react";
import api from "../services/api";
import "./CommandPage.css";

const CommandPage = () => {
    const [command, setCommand] = useState("");

    const [result, setResult] = useState({
        text: "Enter a command and press Execute.",
        status: "idle",
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const commandText = command.trim();

        if (!commandText) {
            setResult({ text: "Please enter a command.", status: "error" });
            return;
        }

        setIsLoading(true);
        setResult({ text: `Executing "${commandText}"...`, status: "pending" });

        try {
            const responseText = await api.executeCommand(commandText);
            let processedText = responseText || "An unknown error occurred.";

            if (processedText.startsWith('"') && processedText.endsWith('"')) {
                processedText = processedText.substring(
                    1,
                    processedText.length - 1
                );
            }
            processedText = processedText.replace(/\\r\\n/g, "\n");

            setResult({ text: processedText, status: "success" });
        } catch (error) {
            console.error("Fetch error:", error);
            const errorMsg =
                "A network error occurred. Check the console for details.";
            setResult({ text: errorMsg, status: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const getResultClassName = () => {
        switch (result.status) {
            case "success":
                return "command-result mt-4 is-success";
            case "error":
                return "command-result mt-4 is-error";
            default:
                return "command-result mt-4";
        }
    };

    return (
        <div className="flex-grow flex flex-col items-center justify-center p-4">
            <div className="command-card">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
                    Command Executor
                </h2>
                <form id="commandForm" onSubmit={handleSubmit}>
                    <div className="command-form-container">
                        <input
                            type="text"
                            id="commandInput"
                            className="command-input"
                            placeholder="Enter command (e.g., /help)"
                            value={command}
                            onChange={(e) => setCommand(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            id="executeButton"
                            className="skewed-button skewed-button--primary flex-shrink-0"
                            disabled={isLoading}
                        >
                            <div className="skewed-button-content">
                                <span>
                                    {isLoading ? "Executing..." : "Execute"}
                                </span>
                            </div>
                        </button>
                    </div>
                </form>
                <div id="commandResult" className={getResultClassName()}>
                    {result.text}
                </div>
            </div>
        </div>
    );
};

export default CommandPage;
