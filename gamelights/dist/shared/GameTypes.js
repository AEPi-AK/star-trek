"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FrequencyTaskType;
(function (FrequencyTaskType) {
    FrequencyTaskType[FrequencyTaskType["PressButton"] = 0] = "PressButton";
    FrequencyTaskType[FrequencyTaskType["ScanHand"] = 1] = "ScanHand";
    FrequencyTaskType[FrequencyTaskType["FlipSwitches"] = 2] = "FlipSwitches";
    FrequencyTaskType[FrequencyTaskType["Plugboard"] = 3] = "Plugboard";
    FrequencyTaskType[FrequencyTaskType["ReadCode"] = 4] = "ReadCode";
    FrequencyTaskType[FrequencyTaskType["ScanCard"] = 5] = "ScanCard";
    FrequencyTaskType[FrequencyTaskType["PressBigButton"] = 6] = "PressBigButton";
})(FrequencyTaskType = exports.FrequencyTaskType || (exports.FrequencyTaskType = {}));
var ExclusionTaskType;
(function (ExclusionTaskType) {
    ExclusionTaskType[ExclusionTaskType["PressWhiteButton"] = 0] = "PressWhiteButton";
    ExclusionTaskType[ExclusionTaskType["PressBlueButton"] = 1] = "PressBlueButton";
    ExclusionTaskType[ExclusionTaskType["PressYellowButton"] = 2] = "PressYellowButton";
    ExclusionTaskType[ExclusionTaskType["PressGreenButton"] = 3] = "PressGreenButton";
    ExclusionTaskType[ExclusionTaskType["ScanHand"] = 4] = "ScanHand";
    ExclusionTaskType[ExclusionTaskType["FlipSwitches"] = 5] = "FlipSwitches";
    ExclusionTaskType[ExclusionTaskType["Plugboard"] = 6] = "Plugboard";
    ExclusionTaskType[ExclusionTaskType["ReadCode"] = 7] = "ReadCode";
    ExclusionTaskType[ExclusionTaskType["ScanCard"] = 8] = "ScanCard";
    ExclusionTaskType[ExclusionTaskType["PressBigButton"] = 9] = "PressBigButton";
})(ExclusionTaskType = exports.ExclusionTaskType || (exports.ExclusionTaskType = {}));
var GamePhase;
(function (GamePhase) {
    GamePhase[GamePhase["NotConnected"] = 0] = "NotConnected";
    GamePhase[GamePhase["EnterPlayers"] = 1] = "EnterPlayers";
    GamePhase[GamePhase["PlayGame"] = 2] = "PlayGame";
    GamePhase[GamePhase["LateGame"] = 3] = "LateGame";
    GamePhase[GamePhase["FiringLaser"] = 4] = "FiringLaser";
    GamePhase[GamePhase["GameLost"] = 5] = "GameLost";
    GamePhase[GamePhase["GameWon"] = 6] = "GameWon";
})(GamePhase = exports.GamePhase || (exports.GamePhase = {}));
var GameDifficulty;
(function (GameDifficulty) {
    GameDifficulty[GameDifficulty["PreEasy"] = 0] = "PreEasy";
    GameDifficulty[GameDifficulty["Easy"] = 1] = "Easy";
    GameDifficulty[GameDifficulty["Medium"] = 2] = "Medium";
    GameDifficulty[GameDifficulty["Hard"] = 3] = "Hard";
})(GameDifficulty = exports.GameDifficulty || (exports.GameDifficulty = {}));
//# sourceMappingURL=GameTypes.js.map