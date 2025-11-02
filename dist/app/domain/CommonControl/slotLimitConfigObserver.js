"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSlotLimitConfigObserver = exports.SlotLimitConfigObserver = void 0;
const observer_1 = require("../../common/classes/observer/remoteObserver/observer");
const winLimitConfigDAOImpl_1 = require("./DAO/winLimitConfigDAOImpl");
const slotsBaseConst_1 = require("./config/slotsBaseConst");
const databaseService_1 = require("../../services/databaseService");
class SlotLimitConfigObserver extends observer_1.RemoteObserver {
    constructor(themeName, redisConn) {
        super(themeName, redisConn);
        this.DAO = winLimitConfigDAOImpl_1.default.getInstance();
    }
    async updateOneGameConfig(nid, winLimitConfig) {
        await this.DAO.updateOneConfig({ nid }, { winLimitConfig });
        await this.DAO.deleteCache(nid);
        this.update('');
    }
}
exports.SlotLimitConfigObserver = SlotLimitConfigObserver;
async function createSlotLimitConfigObserver(nid) {
    return new SlotLimitConfigObserver(slotsBaseConst_1.mappingTheme[nid], await (0, databaseService_1.getRedisClient)());
}
exports.createSlotLimitConfigObserver = createSlotLimitConfigObserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xvdExpbWl0Q29uZmlnT2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9hcHAvZG9tYWluL0NvbW1vbkNvbnRyb2wvc2xvdExpbWl0Q29uZmlnT2JzZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsb0ZBQXFGO0FBRXJGLHVFQUE4RDtBQUc5RCw0REFBcUQ7QUFDckQsb0VBQThEO0FBTTlELE1BQWEsdUJBQXdCLFNBQVEseUJBQWM7SUFHdkQsWUFBWSxTQUFpQixFQUFFLFNBQWdCO1FBQzNDLEtBQUssQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFIeEIsUUFBRyxHQUF3QiwrQkFBbUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUlyRSxDQUFDO0lBT0QsS0FBSyxDQUFDLG1CQUFtQixDQUFDLEdBQWdCLEVBQUUsY0FBZ0M7UUFFeEUsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxFQUFDLEdBQUcsRUFBQyxFQUFFLEVBQUMsY0FBYyxFQUFDLENBQUMsQ0FBQztRQUd4RCxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBR2hDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDcEIsQ0FBQztDQUNKO0FBdEJELDBEQXNCQztBQU1NLEtBQUssVUFBVSw2QkFBNkIsQ0FBQyxHQUFnQjtJQUNoRSxPQUFPLElBQUksdUJBQXVCLENBQUMsNkJBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLElBQUEsZ0NBQWMsR0FBRSxDQUFDLENBQUE7QUFDakYsQ0FBQztBQUZELHNFQUVDIn0=