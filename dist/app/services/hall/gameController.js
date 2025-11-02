"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGameOpen = exports.convertGameForClient = exports.getAllGames = void 0;
const Game_manager_1 = require("../../common/dao/daoManager/Game.manager");
const PlatformNameAgentList_redis_dao_1 = require("../../common/dao/redis/PlatformNameAgentList.redis.dao");
const getAllGames = async function (openedOnly, next) {
    let openedFilterFunc = null;
    if (openedOnly) {
        openedFilterFunc = game => game.opened;
    }
    try {
        const games = await Game_manager_1.default.findList(openedFilterFunc);
        if (games.length) {
            next && next(null, games);
            return Promise.resolve(games);
        }
    }
    catch (error) {
        next && next(error);
        return Promise.reject(error);
    }
};
exports.getAllGames = getAllGames;
async function convertGameForClient(games, nidList, player) {
    const resultList = [];
    let closeGameList = [];
    if (player && player.groupRemark) {
        const platformName = await PlatformNameAgentList_redis_dao_1.default.findPlatformNameForAgent({ agent: player.groupRemark });
        if (platformName) {
            closeGameList = await PlatformNameAgentList_redis_dao_1.default.getPlatformCloseGame({ platformName: platformName });
        }
    }
    for (let m of nidList) {
        if (closeGameList.length > 0) {
            if (closeGameList.includes(m.nid)) {
                continue;
            }
        }
        const game = await games.find(x => x.nid == m.nid && x.opened == true);
        if (game) {
            resultList.push({
                nid: m.nid,
                sort: m.sort,
                whetherToShowScene: game.whetherToShowScene,
                whetherToShowRoom: game.whetherToShowRoom,
                whetherToShowGamingInfo: game.whetherToShowGamingInfo,
            });
        }
    }
    resultList.sort((a, b) => a.sort - b.sort);
    return resultList;
}
exports.convertGameForClient = convertGameForClient;
;
async function isGameOpen(nid) {
    if (!nid) {
        console.error(`isGameOpen 入参非法 ${nid}`);
        return false;
    }
    const games = await (0, exports.getAllGames)(true);
    if (!games || games.length == 0) {
        console.error(`isGameOpen 获取游戏列表失败`);
        return false;
    }
    const game = games.find(m => m.nid === nid);
    return game instanceof Object;
}
exports.isGameOpen = isGameOpen;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZUNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvaGFsbC9nYW1lQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwyRUFBc0U7QUFJdEUsNEdBQW1HO0FBTTVGLE1BQU0sV0FBVyxHQUFHLEtBQUssV0FBVyxVQUFvQixFQUFFLElBQUs7SUFDbEUsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7SUFDNUIsSUFBSSxVQUFVLEVBQUU7UUFDWixnQkFBZ0IsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7S0FDMUM7SUFDRCxJQUFJO1FBQ0EsTUFBTSxLQUFLLEdBQUcsTUFBTSxzQkFBYyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRTlELElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNkLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzFCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtTQUNoQztLQUNKO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BCLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNoQztBQUNMLENBQUMsQ0FBQztBQWhCVyxRQUFBLFdBQVcsZUFnQnRCO0FBR0ssS0FBSyxVQUFVLG9CQUFvQixDQUFDLEtBQVksRUFBRSxPQUFnQixFQUFHLE1BQVk7SUFDcEYsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDO0lBR3RCLElBQUksYUFBYSxHQUFHLEVBQUUsQ0FBQztJQUN2QixJQUFHLE1BQU0sSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFO1FBRTdCLE1BQU0sWUFBWSxHQUFHLE1BQU0seUNBQTZCLENBQUMsd0JBQXdCLENBQUMsRUFBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBQyxDQUFDLENBQUM7UUFDL0csSUFBSSxZQUFZLEVBQUU7WUFDZCxhQUFhLEdBQUcsTUFBTSx5Q0FBNkIsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFDLFlBQVksRUFBRSxZQUFZLEVBQUMsQ0FBQyxDQUFDO1NBQzFHO0tBQ0o7SUFHRCxLQUFJLElBQUksQ0FBQyxJQUFJLE9BQU8sRUFBQztRQUVqQixJQUFHLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFDO1lBQ3hCLElBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUM7Z0JBQzdCLFNBQVM7YUFDWjtTQUNKO1FBRUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLENBQUM7UUFHdkUsSUFBSSxJQUFJLEVBQUU7WUFDTixVQUFVLENBQUMsSUFBSSxDQUFDO2dCQUNaLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRztnQkFDVixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7Z0JBQ1osa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQjtnQkFDM0MsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQjtnQkFDekMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLHVCQUF1QjthQUN4RCxDQUFDLENBQUM7U0FDTjtLQUNKO0lBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFBLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hDLE9BQU8sVUFBVSxDQUFDO0FBQ3RCLENBQUM7QUF0Q0Qsb0RBc0NDO0FBQUEsQ0FBQztBQUtLLEtBQUssVUFBVSxVQUFVLENBQUMsR0FBVztJQUN4QyxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUN4QyxPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUNELE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBQSxtQkFBVyxFQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3JDLElBQUksQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7UUFDN0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO1FBQ3BDLE9BQU8sS0FBSyxDQUFBO0tBQ2Y7SUFDRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUM1QyxPQUFPLElBQUksWUFBWSxNQUFNLENBQUM7QUFDbEMsQ0FBQztBQVpELGdDQVlDIn0=