"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JsonMgr = require("../../../config/data/JsonMgr");
const Room_manager_1 = require("../../common/dao/daoManager/Room.manager");
const JsonConfig = require("../../pojo/JsonConfig");
class expandingMethod {
    static MessageDispatch(Message_Id, app, data) {
        switch (Message_Id) {
            case 1000:
                return this.resetRobotMonitor(data);
                break;
            case 1001:
                return this.initJsonConfig(app);
                break;
            case 1003:
                return this.maintenance(app, data);
                break;
            default:
                break;
        }
        return "err";
    }
    static async resetRobotMonitor(systemConfig) {
        return;
    }
    static async initJsonConfig(app) {
        try {
            JsonMgr.init();
            return { err: false };
        }
        catch (e) {
            return { err: e };
        }
    }
    static async maintenance(app, timestamp) {
        const serverName = app.getServerType();
        const gameConfigIdx = JsonConfig.get_games_all().findIndex(m => m.serverName == serverName);
        let playerCountInfo = { total_player_num: 0, reality_player_num: 0, robot_player_num: 0 };
        if (gameConfigIdx >= 0) {
            const { nid } = JsonConfig.get_games_all()[gameConfigIdx];
            let roomList = await Room_manager_1.default.findList({ nid: nid }, true);
            playerCountInfo = roomList.reduce((result, roomInfo) => {
                return result;
            }, playerCountInfo);
        }
        return { time: (Date.now() - timestamp), remoteName: serverName, playerCountInfo };
    }
}
exports.default = expandingMethod;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwYW5kaW5nTWV0aG9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZpY2VzL3JvYm90UmVtb3RlU2VydmljZS9leHBhbmRpbmdNZXRob2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx3REFBeUQ7QUFDekQsMkVBQXNFO0FBQ3RFLG9EQUFxRDtBQVNyRCxNQUFxQixlQUFlO0lBRWhDLE1BQU0sQ0FBQyxlQUFlLENBQUMsVUFBa0IsRUFBRSxHQUFnQixFQUFFLElBQVM7UUFDbEUsUUFBUSxVQUFVLEVBQUU7WUFDaEIsS0FBSyxJQUFJO2dCQUNMLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwQyxNQUFNO1lBQ1YsS0FBSyxJQUFJO2dCQUNMLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDaEMsTUFBTTtZQUNWLEtBQUssSUFBSTtnQkFDTCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNuQyxNQUFNO1lBQ1Y7Z0JBQ0ksTUFBTTtTQUNiO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsWUFBWTtRQUl2QyxPQUFPO0lBQ1gsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQWdCO1FBQ3hDLElBQUk7WUFDQSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDZixPQUFPLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDO1NBQ3pCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1NBQ3JCO0lBQ0wsQ0FBQztJQUlELE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQWdCLEVBQUUsU0FBaUI7UUFDeEQsTUFBTSxVQUFVLEdBQVcsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQy9DLE1BQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxDQUFDO1FBQzVGLElBQUksZUFBZSxHQUFHLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLGtCQUFrQixFQUFFLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUMxRixJQUFJLGFBQWEsSUFBSSxDQUFDLEVBQUU7WUFDcEIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUUxRCxJQUFJLFFBQVEsR0FBRyxNQUFNLHNCQUFjLENBQUMsUUFBUSxDQUFDLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFDLElBQUksQ0FBQyxDQUFDO1lBRTdELGVBQWUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxFQUFFO2dCQUtuRCxPQUFPLE1BQU0sQ0FBQztZQUNsQixDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUM7U0FDdkI7UUFDRCxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFNBQVMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLENBQUM7SUFFdkYsQ0FBQztDQUNKO0FBekRELGtDQXlEQyJ9