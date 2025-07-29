import React from "react";

const DummyCharacterAvatar = ({
    charInfo,
    getStudentNameById,
    teamType,
    index,
    onEditCharacter,
    dragHandlers,
}) => {
    if (!charInfo || !charInfo.character) return null;
    const { uniqueId } = charInfo.character;

    return (
        <div
            className="dummy-char-card-wrapper"
            draggable="true"
            onDragStart={(e) => dragHandlers.onDragStart(e, teamType, index)}
            onDragEnd={dragHandlers.onDragEnd}
            onDragOver={dragHandlers.onDragOver}
            onDragLeave={dragHandlers.onDragLeave}
            onDrop={(e) => dragHandlers.onDrop(e, teamType, index)}
        >
            <div
                className="dummy-char-card"
                title="Click to edit"
                onClick={() => onEditCharacter(charInfo)}
            >
                <div className="background-plate"></div>
                <img
                    className="portrait-image"
                    src={`https://schaledb.com/images/student/icon/${uniqueId}.webp`}
                    alt={getStudentNameById(uniqueId)}
                    onError={(e) => {
                        e.target.src = `https://placehold.co/96x96/cccccc/9ca3af?text=N/A`;
                    }}
                />
            </div>
            <div className="drag-handle" title="Drag to reorder">
                <span>⇄</span>
            </div>
        </div>
    );
};

const DummyTeamDisplay = ({
    dummyTeam,
    getStudentNameById,
    onEditCharacter,
    dragHandlers,
}) => {
    return (
        <div className="mb-6">
            <div className="dummy-team-strip bg-white/75 backdrop-blur-md backdrop-saturate-150 border border-gray-200/50 text-slate-700 p-4 rounded-lg shadow-lg my-4">
                <div className="flex flex-col md:flex-row justify-around items-center gap-4">
                    <div className="main-team-section text-center">
                        <h4 className="text-xl font-medium mb-2 text-sky-600 ">
                            Main Team
                        </h4>
                        <div className="team-avatars main-team-avatars flex justify-center flex-wrap gap-2 md:gap-3">
                            {dummyTeam.main.map((charInfo, index) => (
                                <DummyCharacterAvatar
                                    key={charInfo.character.serverId || index}
                                    charInfo={charInfo}
                                    getStudentNameById={getStudentNameById}
                                    teamType="main"
                                    index={index}
                                    onEditCharacter={onEditCharacter}
                                    dragHandlers={dragHandlers}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="relative w-1 h-24 my-4 hidden md:block">
                        <div className="absolute top-1/2 left-1/2 w-0.5 h-[10.8rem] bg-slate-400 transform -translate-x-1/2 -translate-y-1/2 rotate-[15deg] origin-center"></div>
                    </div>

                    <div className="support-team-section text-center">
                        <h4 className="text-xl font-medium mb-2 text-amber-600 ">
                            Support Team
                        </h4>
                        <div className="team-avatars support-team-avatars flex justify-center flex-wrap gap-2 md:gap-3">
                            {dummyTeam.support.map((charInfo, index) => (
                                <DummyCharacterAvatar
                                    key={charInfo.character.serverId || index}
                                    charInfo={charInfo}
                                    getStudentNameById={getStudentNameById}
                                    teamType="support"
                                    index={index}
                                    onEditCharacter={onEditCharacter}
                                    dragHandlers={dragHandlers}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DummyTeamDisplay;
