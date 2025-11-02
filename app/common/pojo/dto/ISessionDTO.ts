/**
 * @property uid 玩家编号
 * @property nid 游戏编号
 * @property sceneId 场编号
 * @property roomId 房间编号
 * @property frontendServerId 前置服务器编号
 * @property backendServerId  后置服务器编号
 * @property isVip 
 * @property viper 
 * @property language 语言
 */
export interface ISessionDTO {
    uid: string,
    nid: string;
    isRobot: number;
    sceneId: number | null;
    roomId: string | null;
    frontendServerId: string | null;
    backendServerId: string | null;
    isVip: any;
    viper: any;
    language: string;
}
