"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlTypes = exports.PlatformControlType = exports.RecordTypes = exports.ControlKinds = exports.ControlState = void 0;
var ControlState;
(function (ControlState) {
    ControlState[ControlState["NONE"] = 0] = "NONE";
    ControlState[ControlState["SYSTEM_WIN"] = 1] = "SYSTEM_WIN";
    ControlState[ControlState["PLAYER_WIN"] = 2] = "PLAYER_WIN";
})(ControlState = exports.ControlState || (exports.ControlState = {}));
var ControlKinds;
(function (ControlKinds) {
    ControlKinds[ControlKinds["NONE"] = 0] = "NONE";
    ControlKinds[ControlKinds["PERSONAL"] = 1] = "PERSONAL";
    ControlKinds[ControlKinds["SCENE"] = 2] = "SCENE";
    ControlKinds[ControlKinds["PLATFORM"] = 3] = "PLATFORM";
})(ControlKinds = exports.ControlKinds || (exports.ControlKinds = {}));
var RecordTypes;
(function (RecordTypes) {
    RecordTypes["ALL"] = "1";
    RecordTypes["SCENE"] = "2";
    RecordTypes["TENANT_SCENE"] = "3";
})(RecordTypes = exports.RecordTypes || (exports.RecordTypes = {}));
var PlatformControlType;
(function (PlatformControlType) {
    PlatformControlType["PLATFORM"] = "1";
    PlatformControlType["GAME"] = "2";
    PlatformControlType["TENANT"] = "3";
    PlatformControlType["TENANT_GAME"] = "4";
})(PlatformControlType = exports.PlatformControlType || (exports.PlatformControlType = {}));
var ControlTypes;
(function (ControlTypes) {
    ControlTypes[ControlTypes["platformControlWin"] = 0] = "platformControlWin";
    ControlTypes[ControlTypes["platformControlLoss"] = 1] = "platformControlLoss";
    ControlTypes[ControlTypes["sceneControlWin"] = 2] = "sceneControlWin";
    ControlTypes[ControlTypes["sceneControlLoss"] = 3] = "sceneControlLoss";
    ControlTypes[ControlTypes["personalControlWin"] = 4] = "personalControlWin";
    ControlTypes[ControlTypes["personalControlLoss"] = 5] = "personalControlLoss";
    ControlTypes[ControlTypes["none"] = 6] = "none";
})(ControlTypes = exports.ControlTypes || (exports.ControlTypes = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZpY2VzL25ld0NvbnRyb2wvY29uc3RhbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQU1BLElBQVksWUFJWDtBQUpELFdBQVksWUFBWTtJQUNwQiwrQ0FBSSxDQUFBO0lBQ0osMkRBQVUsQ0FBQTtJQUNWLDJEQUFVLENBQUE7QUFDZCxDQUFDLEVBSlcsWUFBWSxHQUFaLG9CQUFZLEtBQVosb0JBQVksUUFJdkI7QUFFRCxJQUFZLFlBS1g7QUFMRCxXQUFZLFlBQVk7SUFDcEIsK0NBQUksQ0FBQTtJQUNKLHVEQUFRLENBQUE7SUFDUixpREFBSyxDQUFBO0lBQ0wsdURBQVEsQ0FBQTtBQUNaLENBQUMsRUFMVyxZQUFZLEdBQVosb0JBQVksS0FBWixvQkFBWSxRQUt2QjtBQUtELElBQVksV0FJWDtBQUpELFdBQVksV0FBVztJQUNuQix3QkFBUyxDQUFBO0lBQ1QsMEJBQVcsQ0FBQTtJQUNYLGlDQUFrQixDQUFBO0FBQ3RCLENBQUMsRUFKVyxXQUFXLEdBQVgsbUJBQVcsS0FBWCxtQkFBVyxRQUl0QjtBQUtELElBQVksbUJBS1g7QUFMRCxXQUFZLG1CQUFtQjtJQUMzQixxQ0FBYyxDQUFBO0lBQ2QsaUNBQVUsQ0FBQTtJQUNWLG1DQUFZLENBQUE7SUFDWix3Q0FBaUIsQ0FBQTtBQUNyQixDQUFDLEVBTFcsbUJBQW1CLEdBQW5CLDJCQUFtQixLQUFuQiwyQkFBbUIsUUFLOUI7QUFNRCxJQUFZLFlBcUJYO0FBckJELFdBQVksWUFBWTtJQUVwQiwyRUFBa0IsQ0FBQTtJQUdsQiw2RUFBbUIsQ0FBQTtJQUduQixxRUFBZSxDQUFBO0lBR2YsdUVBQWdCLENBQUE7SUFHaEIsMkVBQWtCLENBQUE7SUFHbEIsNkVBQW1CLENBQUE7SUFHbkIsK0NBQUksQ0FBQTtBQUNSLENBQUMsRUFyQlcsWUFBWSxHQUFaLG9CQUFZLEtBQVosb0JBQVksUUFxQnZCIn0=