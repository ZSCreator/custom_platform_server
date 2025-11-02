"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../pojo/entity/PlayerInfo");
var State;
(function (State) {
    State[State["GAME"] = 0] = "GAME";
    State[State["LEISURE"] = 1] = "LEISURE";
})(State || (State = {}));
class SlotMachinePlayer extends PlayerInfo_1.PlayerInfo {
    constructor() {
        super(...arguments);
        this.state = State.LEISURE;
    }
    changeGameState() {
        this.state = State.GAME;
    }
    changeLeisureState() {
        this.state = State.LEISURE;
    }
    isGameState() {
        return this.state === State.GAME;
    }
    setOffline() {
        this.onLine = false;
    }
    setOnline() {
        this.onLine = true;
    }
}
exports.default = SlotMachinePlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xvdE1hY2hpbmVQbGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2NsYXNzZXMvZ2FtZS9zbG90TWFjaGluZVBsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZEQUF3RDtBQU94RCxJQUFLLEtBR0o7QUFIRCxXQUFLLEtBQUs7SUFDTixpQ0FBSSxDQUFBO0lBQ0osdUNBQU8sQ0FBQTtBQUNYLENBQUMsRUFISSxLQUFLLEtBQUwsS0FBSyxRQUdUO0FBRUQsTUFBcUIsaUJBQWtCLFNBQVEsdUJBQVU7SUFBekQ7O1FBQ1ksVUFBSyxHQUFVLEtBQUssQ0FBQyxPQUFPLENBQUM7SUFvQ3pDLENBQUM7SUEvQkcsZUFBZTtRQUNYLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztJQUM1QixDQUFDO0lBS0Qsa0JBQWtCO1FBQ2QsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO0lBQy9CLENBQUM7SUFLRCxXQUFXO1FBQ1AsT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxJQUFJLENBQUM7SUFDckMsQ0FBQztJQUtELFVBQVU7UUFDTixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUN4QixDQUFDO0lBS0QsU0FBUztRQUNMLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ3ZCLENBQUM7Q0FDSjtBQXJDRCxvQ0FxQ0MifQ==