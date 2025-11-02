"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MsgRoute = exports.RoomState = void 0;
var RoomState;
(function (RoomState) {
    RoomState["NONE"] = "INWAIT";
    RoomState["READY"] = "Rummy_READY";
    RoomState["PLAY_CARD"] = "PLAY_CARD";
    RoomState["SEND_AWARD"] = "SEND_AWARD";
})(RoomState = exports.RoomState || (exports.RoomState = {}));
var MsgRoute;
(function (MsgRoute) {
    MsgRoute["RUMMY_START_FAPAI"] = "Rummy_Start_FAPAI";
    MsgRoute["RUMMY_PLAY"] = "Rummy_Play";
    MsgRoute["RUMMY_LOST_CARD"] = "Rummy_LOST_CARD";
    MsgRoute["RUMMY_GET_CARD"] = "Rummy_GET_CARD";
    MsgRoute["RUMMY_SHAW"] = "Rummy_SHAW";
    MsgRoute["RUMMY_SEND_AWARD"] = "Rummy_SEND_AWARD";
    MsgRoute["RUMMY_REALPLAYER_READY"] = "Rummy_RealPlayer_Ready";
    MsgRoute["RUMMY_READY"] = "Rummy_READY";
    MsgRoute["RUMMY_CHANGE_CARDS"] = "Rummy_CHANGE_CARDS";
    MsgRoute["RUMMY_ONEXIT"] = "Rummy_onExit";
})(MsgRoute = exports.MsgRoute || (exports.MsgRoute = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvUnVtbXkvbGliL2NvbnN0YW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFPQSxJQUFZLFNBS1g7QUFMRCxXQUFZLFNBQVM7SUFDakIsNEJBQWUsQ0FBQTtJQUNmLGtDQUFxQixDQUFBO0lBQ3JCLG9DQUF1QixDQUFBO0lBQ3ZCLHNDQUF5QixDQUFBO0FBQzdCLENBQUMsRUFMVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQUtwQjtBQVdELElBQVksUUFXWDtBQVhELFdBQVksUUFBUTtJQUNoQixtREFBdUMsQ0FBQTtJQUN2QyxxQ0FBeUIsQ0FBQTtJQUN6QiwrQ0FBbUMsQ0FBQTtJQUNuQyw2Q0FBaUMsQ0FBQTtJQUNqQyxxQ0FBeUIsQ0FBQTtJQUN6QixpREFBcUMsQ0FBQTtJQUNyQyw2REFBaUQsQ0FBQTtJQUNqRCx1Q0FBMkIsQ0FBQTtJQUMzQixxREFBeUMsQ0FBQTtJQUN6Qyx5Q0FBNkIsQ0FBQTtBQUNqQyxDQUFDLEVBWFcsUUFBUSxHQUFSLGdCQUFRLEtBQVIsZ0JBQVEsUUFXbkIifQ==