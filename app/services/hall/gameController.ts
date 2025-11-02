// game 业务逻辑层
import GameManagerDao from "../../common/dao/daoManager/Game.manager";
import SystemGameTypeManager from "../../common/dao/daoManager/SystemGameType.manager";
import {ApiResult} from "../../common/pojo/ApiResult";
import {httpState} from "../../common/systemState";
import PlatformNameAgentListRedisDao from "../../common/dao/redis/PlatformNameAgentList.redis.dao";


/**
 * 获取系统所有的正在开放的游戏
 */
export const getAllGames = async function (openedOnly?: boolean, next?) {
    let openedFilterFunc = null;
    if (openedOnly) {
        openedFilterFunc = game => game.opened;
    }
    try {
        const games = await GameManagerDao.findList(openedFilterFunc);
        // 如果获取到的游戏列表不为空，则直接返回
        if (games.length) {
            next && next(null, games);
            return Promise.resolve(games)
        }
    } catch (error) {
        next && next(error);
        return Promise.reject(error);
    }
};

/**游戏只给前端返回部分字段 && 排序 */
export async function convertGameForClient(games: any[] ,nidList : any [] , player : any) {
    const resultList = [];

    //根据玩家分代情况来过滤游戏
    let closeGameList = [];
    if(player && player.groupRemark) {
        //查找平台是否关闭了该游戏
        const platformName = await PlatformNameAgentListRedisDao.findPlatformNameForAgent({agent: player.groupRemark});
        if (platformName) {
            closeGameList = await PlatformNameAgentListRedisDao.getPlatformCloseGame({platformName: platformName});
        }
    }


    for(let m of nidList){

        if(closeGameList.length > 0){
            if(closeGameList.includes(m.nid)){
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

    resultList.sort((a,b)=>a.sort - b.sort);
    return resultList;
};



/**判断游戏是否开放 */
export async function isGameOpen(nid: string) {
    if (!nid) {
        console.error(`isGameOpen 入参非法 ${nid}`);
        return false;
    }
    const games = await getAllGames(true)
    if (!games || games.length == 0) {
        console.error(`isGameOpen 获取游戏列表失败`)
        return false
    }
    const game = games.find(m => m.nid === nid);
    return game instanceof Object;
}

