import React from "react";

const CharacterCard = ({ characterWrapper, onCardClick }) => {
    const { character } = characterWrapper;
    const { uniqueId, Name } = character;

    const handleImageError = (e) => {
        e.target.src = "https://placehold.co/96x96/33363d/e0e0e0?text=No+Img";
        e.target.alt = "Image not found";
    };

    return (
        <div
            className="character-card cursor-pointer hover:-translate-y-1"
            onClick={() => onCardClick(uniqueId)}
        >
            <div className="relative p-4 flex flex-col items-center text-center">
                <img
                    src={`https://schaledb.com/images/student/collection/${uniqueId}.webp`}
                    alt={Name || `Character ${uniqueId}`}
                    className="character-image w-24 h-24 rounded-md object-cover mb-3 border-2 border-gray-200"
                    onError={handleImageError}
                />
                <div>
                    <h2 className="character-card-title text-sky-700">
                        {Name || `Character ${uniqueId}`}
                    </h2>
                    <p className="character-ids text-xs text-gray-500 mt-1">
                        ID:{" "}
                        <span className="character-uniqueId-text">
                            {uniqueId}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CharacterCard;
