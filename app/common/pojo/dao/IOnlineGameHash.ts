import { RoleEnum } from "../../constant/player/RoleEnum";

/**
 * redis-key:在线玩家信息
 * @property {Date}   entryHallTime     登录大厅时间
 * @property {Date}   entryGameTime     登录游戏时间
 * @property {string} nid               游戏编号
 * @property {string} sceneId           场编号      -1表示进入大厅
 * @property {string} roomId            房间编号    -1表示未进场
 * @property {string} isRobot           角色身份    -1表示未进房
 */
export interface IOnlineGameHash {
    uid?: string;
    entryHallTime?: Date;
    entryGameTime?: Date;
    frontendServerId?: string;
    backendServerId?: string;
    hallServerId?: string;
    nid: string;
    sceneId: number;
    roomId: string;
    isRobot: RoleEnum;
}