// 登录辅助
import SystemGameTypeManager from "../../common/dao/daoManager/SystemGameType.manager";
import { getLogger } from "pinus-logger";
import { GameTypeEnum } from "../../common/constant/game/GameTypeEnum";
import { RoleEnum } from "../../common/constant/player/RoleEnum";
const Logger = getLogger("server_out", __filename);



/**
 * 获取游戏类型
 * @param: player，玩家信息
 * 注：返回所有打开的获取游戏类型
 * */
export async function filterGameType(player): Promise<any> {
  let errorMessage = "GameController.filterGameForPlayer ==>";
  // 如果是机器人，返回空的
  if (player.isRobot === RoleEnum.ROBOT) {
    return [];
  }
  let allGameType: any = null;
  let gameTypeList: any = [];
  let list = [];
  let nidList = [];
  try {
    allGameType = await SystemGameTypeManager.findList({});
    allGameType = allGameType.filter((x) => x.open == true);
    /**
     * 因为typeId 前端现在用的是string 所以要改下String
     */
    for (let i in allGameType) {
      const item = allGameType[i];
      gameTypeList.push({ typeId: item.typeId.toString(), sort: item.sort });
    }
    gameTypeList.sort((a, b) => a.sort - b.sort);
    list = gameTypeList.map((x) => x.typeId);
    nidList = allGameType.find((x) => x.typeId == GameTypeEnum.ALL_GAME).nidList;
  } catch (e) {
    Logger.warn(
      `filterGameType ${errorMessage}uid: ${player.uid}|${e.stack || e.message || e
      }`
    );
    return Promise.resolve({ list, nidList });
  }
  return Promise.resolve({ list, nidList });
}


