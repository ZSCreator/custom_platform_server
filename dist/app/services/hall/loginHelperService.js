"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterGameType = void 0;
const SystemGameType_manager_1 = require("../../common/dao/daoManager/SystemGameType.manager");
const pinus_logger_1 = require("pinus-logger");
const GameTypeEnum_1 = require("../../common/constant/game/GameTypeEnum");
const RoleEnum_1 = require("../../common/constant/player/RoleEnum");
const Logger = (0, pinus_logger_1.getLogger)("server_out", __filename);
async function filterGameType(player) {
    let errorMessage = "GameController.filterGameForPlayer ==>";
    if (player.isRobot === RoleEnum_1.RoleEnum.ROBOT) {
        return [];
    }
    let allGameType = null;
    let gameTypeList = [];
    let list = [];
    let nidList = [];
    try {
        allGameType = await SystemGameType_manager_1.default.findList({});
        allGameType = allGameType.filter((x) => x.open == true);
        for (let i in allGameType) {
            const item = allGameType[i];
            gameTypeList.push({ typeId: item.typeId.toString(), sort: item.sort });
        }
        gameTypeList.sort((a, b) => a.sort - b.sort);
        list = gameTypeList.map((x) => x.typeId);
        nidList = allGameType.find((x) => x.typeId == GameTypeEnum_1.GameTypeEnum.ALL_GAME).nidList;
    }
    catch (e) {
        Logger.warn(`filterGameType ${errorMessage}uid: ${player.uid}|${e.stack || e.message || e}`);
        return Promise.resolve({ list, nidList });
    }
    return Promise.resolve({ list, nidList });
}
exports.filterGameType = filterGameType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW5IZWxwZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZpY2VzL2hhbGwvbG9naW5IZWxwZXJTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtGQUF1RjtBQUN2RiwrQ0FBeUM7QUFDekMsMEVBQXVFO0FBQ3ZFLG9FQUFpRTtBQUNqRSxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBUzVDLEtBQUssVUFBVSxjQUFjLENBQUMsTUFBTTtJQUN6QyxJQUFJLFlBQVksR0FBRyx3Q0FBd0MsQ0FBQztJQUU1RCxJQUFJLE1BQU0sQ0FBQyxPQUFPLEtBQUssbUJBQVEsQ0FBQyxLQUFLLEVBQUU7UUFDckMsT0FBTyxFQUFFLENBQUM7S0FDWDtJQUNELElBQUksV0FBVyxHQUFRLElBQUksQ0FBQztJQUM1QixJQUFJLFlBQVksR0FBUSxFQUFFLENBQUM7SUFDM0IsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2QsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ2pCLElBQUk7UUFDRixXQUFXLEdBQUcsTUFBTSxnQ0FBcUIsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdkQsV0FBVyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUM7UUFJeEQsS0FBSyxJQUFJLENBQUMsSUFBSSxXQUFXLEVBQUU7WUFDekIsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7U0FDeEU7UUFDRCxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0MsSUFBSSxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6QyxPQUFPLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSwyQkFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQztLQUM5RTtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsTUFBTSxDQUFDLElBQUksQ0FDVCxrQkFBa0IsWUFBWSxRQUFRLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQzVFLEVBQUUsQ0FDSCxDQUFDO1FBQ0YsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7S0FDM0M7SUFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUM1QyxDQUFDO0FBL0JELHdDQStCQyJ9