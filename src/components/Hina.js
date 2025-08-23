import React from "react";
import "./Hina.css";

const Hina = ({ message }) => {
    return (
        <div className="loading-container">
            <div className="message-bubble">
                <p className="message-text">{message}</p>
            </div>
            <div className="wavy-connector"></div>
            <div className="gif-container">
                <img
                    src="/assets/hina.gif"
                    alt="Loading..."
                    className="loading-gif"
                />
                <div className="base-line"></div>
            </div>
        </div>
    );
};

export default Hina;
