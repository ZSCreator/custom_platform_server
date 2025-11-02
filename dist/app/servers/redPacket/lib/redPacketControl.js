"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const baseGameControl_1 = require("../../../domain/CommonControl/baseGameControl");
const constants_1 = require("../../../services/newControl/constants");
class RedPacketControl extends baseGameControl_1.BaseGameControl {
    constructor({ room }) {
        super({ room });
    }
    async isControl(player) {
        const controlResult = await this.getControlResult([(0, utils_1.filterProperty)(player)]);
        const { personalControlPlayers: players, sceneControlState, isPlatformControl } = controlResult;
        if (players.length) {
            const controlPlayers = this.filterNeedControlPlayer(players);
            const [controlPlayer] = this.filterControlPlayer(controlPlayers, false);
            if (controlPlayer) {
                const player = this.room.getPlayer(controlPlayer.uid);
                if (player) {
                    player.setControlType(constants_1.ControlKinds.PERSONAL);
                    return true;
                }
            }
        }
        if (sceneControlState !== constants_1.ControlState.NONE) {
            const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
            player.setControlType(type);
        }
        return sceneControlState === constants_1.ControlState.SYSTEM_WIN;
    }
}
exports.default = RedPacketControl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkUGFja2V0Q29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3JlZFBhY2tldC9saWIvcmVkUGFja2V0Q29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDBDQUE4QztBQUM5QyxtRkFBOEU7QUFHOUUsc0VBQWtGO0FBS2xGLE1BQXFCLGdCQUFpQixTQUFRLGlDQUFlO0lBQ3pELFlBQVksRUFBRSxJQUFJLEVBQThCO1FBQzVDLEtBQUssQ0FBQyxFQUFDLElBQUksRUFBQyxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQU1NLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBMkI7UUFHOUMsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFBLHNCQUFjLEVBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTVFLE1BQU0sRUFBQyxzQkFBc0IsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUMsR0FBRyxhQUFhLENBQUM7UUFHOUYsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO1lBRWhCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUc3RCxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUd4RSxJQUFJLGFBQWEsRUFBRTtnQkFDZixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRXRELElBQUksTUFBTSxFQUFFO29CQUNSLE1BQU0sQ0FBQyxjQUFjLENBQUMsd0JBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDN0MsT0FBTyxJQUFJLENBQUM7aUJBQ2Y7YUFDSjtTQUNKO1FBRUQsSUFBSSxpQkFBaUIsS0FBSyx3QkFBWSxDQUFDLElBQUksRUFBRTtZQUN6QyxNQUFNLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsd0JBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLHdCQUFZLENBQUMsS0FBSyxDQUFDO1lBQzVFLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDL0I7UUFFRCxPQUFPLGlCQUFpQixLQUFLLHdCQUFZLENBQUMsVUFBVSxDQUFDO0lBQ3pELENBQUM7Q0FDSjtBQTFDRCxtQ0EwQ0MifQ==