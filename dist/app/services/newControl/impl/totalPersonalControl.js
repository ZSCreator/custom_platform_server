"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TotalPersonalControl = void 0;
const totalPersonalControlDAO_1 = require("../DAO/totalPersonalControlDAO");
const OnlinePlayer_redis_dao_1 = require("../../../common/dao/redis/OnlinePlayer.redis.dao");
class TotalPersonalControl {
    static async addPlayer(controlPlayer) {
        await totalPersonalControlDAO_1.TotalPersonalControlDAO.getPersonalTotalControlDAO().addTotalControlPlayer(controlPlayer);
        const isOnline = await OnlinePlayer_redis_dao_1.default.findOne({ uid: controlPlayer.uid });
        if (isOnline) {
            await this.addOnlinePlayer(controlPlayer.uid);
        }
    }
    static async removePlayer(uid) {
        await totalPersonalControlDAO_1.TotalPersonalControlDAO.getPersonalTotalControlDAO().deleteControlPlayer(uid);
        return totalPersonalControlDAO_1.TotalPersonalControlDAO.getPersonalTotalControlDAO().deleteOnlineControlPlayer(uid);
    }
    static async findPlayer(uid) {
        return totalPersonalControlDAO_1.TotalPersonalControlDAO.getPersonalTotalControlDAO().find({ uid });
    }
    static async addOnlinePlayer(uid) {
        return totalPersonalControlDAO_1.TotalPersonalControlDAO.getPersonalTotalControlDAO().addOnlinePlayer(uid);
    }
    static async removeOnlinePlayer(uid) {
        return totalPersonalControlDAO_1.TotalPersonalControlDAO.getPersonalTotalControlDAO().deleteOnlineControlPlayer(uid);
    }
    static async getAllPlayersUidList() {
        return totalPersonalControlDAO_1.TotalPersonalControlDAO.getPersonalTotalControlDAO().getControlPlayersUid();
    }
    static async getControlPlayers() {
        return totalPersonalControlDAO_1.TotalPersonalControlDAO.getPersonalTotalControlDAO().getControlPlayers();
    }
    static async getPlayersRange(where, start, stop) {
        return totalPersonalControlDAO_1.TotalPersonalControlDAO.getPersonalTotalControlDAO().getControlPlayersRange(where, start, stop);
    }
    static async getPlayersCount(where) {
        return totalPersonalControlDAO_1.TotalPersonalControlDAO.getPersonalTotalControlDAO().getControlPlayersCount(where);
    }
    static async getOnlinePlayersCount() {
        return totalPersonalControlDAO_1.TotalPersonalControlDAO.getPersonalTotalControlDAO().getOnlinePlayersLength();
    }
    static async getOnlinePlayersUidRange(start, end) {
        return totalPersonalControlDAO_1.TotalPersonalControlDAO.getPersonalTotalControlDAO().getOnlineControlPlayers(start, end);
    }
    static async clearOnlineSet() {
        return totalPersonalControlDAO_1.TotalPersonalControlDAO.getPersonalTotalControlDAO().clearOnlineControlPlayersSet();
    }
    static async removeControlPlayers() {
        return totalPersonalControlDAO_1.TotalPersonalControlDAO.getPersonalTotalControlDAO().removeAll();
    }
}
exports.TotalPersonalControl = TotalPersonalControl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG90YWxQZXJzb25hbENvbnRyb2wuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvbmV3Q29udHJvbC9pbXBsL3RvdGFsUGVyc29uYWxDb250cm9sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDRFQUF1RTtBQUV2RSw2RkFBK0U7QUFPL0UsTUFBYSxvQkFBb0I7SUFNN0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsYUFBb0M7UUFDdkQsTUFBTSxpREFBdUIsQ0FBQywwQkFBMEIsRUFBRSxDQUFDLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBR2hHLE1BQU0sUUFBUSxHQUFHLE1BQU0sZ0NBQWUsQ0FBQyxPQUFPLENBQUMsRUFBQyxHQUFHLEVBQUMsYUFBYSxDQUFDLEdBQUcsRUFBQyxDQUFDLENBQUM7UUFFeEUsSUFBSSxRQUFRLEVBQUU7WUFDVixNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ2pEO0lBQ0wsQ0FBQztJQU1ELE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQVc7UUFDakMsTUFBTSxpREFBdUIsQ0FBQywwQkFBMEIsRUFBRSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXBGLE9BQU8saURBQXVCLENBQUMsMEJBQTBCLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMvRixDQUFDO0lBTUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBVztRQUMvQixPQUFPLGlEQUF1QixDQUFDLDBCQUEwQixFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUMsR0FBRyxFQUFDLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBTUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBVztRQUNwQyxPQUFPLGlEQUF1QixDQUFDLDBCQUEwQixFQUFFLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFNRCxNQUFNLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEdBQVc7UUFDdkMsT0FBTyxpREFBdUIsQ0FBQywwQkFBMEIsRUFBRSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQy9GLENBQUM7SUFLRCxNQUFNLENBQUMsS0FBSyxDQUFDLG9CQUFvQjtRQUM3QixPQUFPLGlEQUF1QixDQUFDLDBCQUEwQixFQUFFLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztJQUN2RixDQUFDO0lBTUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxpQkFBaUI7UUFDMUIsT0FBTyxpREFBdUIsQ0FBQywwQkFBMEIsRUFBRSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDcEYsQ0FBQztJQVFELE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEtBQWEsRUFBRSxLQUFhLEVBQUUsSUFBWTtRQUNuRSxPQUFPLGlEQUF1QixDQUFDLDBCQUEwQixFQUFFLENBQUMsc0JBQXNCLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzRyxDQUFDO0lBTUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsS0FBYTtRQUN0QyxPQUFPLGlEQUF1QixDQUFDLDBCQUEwQixFQUFFLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDOUYsQ0FBQztJQUtELE1BQU0sQ0FBQyxLQUFLLENBQUMscUJBQXFCO1FBQzlCLE9BQU8saURBQXVCLENBQUMsMEJBQTBCLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0lBQ3pGLENBQUM7SUFLRCxNQUFNLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLEtBQWEsRUFBRSxHQUFXO1FBQzVELE9BQU8saURBQXVCLENBQUMsMEJBQTBCLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDcEcsQ0FBQztJQUtELE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYztRQUN2QixPQUFPLGlEQUF1QixDQUFDLDBCQUEwQixFQUFFLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztJQUMvRixDQUFDO0lBTUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxvQkFBb0I7UUFDN0IsT0FBTyxpREFBdUIsQ0FBQywwQkFBMEIsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzVFLENBQUM7Q0FDSjtBQWhIRCxvREFnSEMifQ==