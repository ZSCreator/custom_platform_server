/**
 * @property Can_Not_Find_Player 查询不到玩家
 * @property Can_Not_Find_SystemGame 查询不到游戏配置信息
 * @property Parameter_Miss_Field 参数缺失
 * @property Can_Not_Get_useableRoom 未获得可用的房间号
 * @property Game_Not_Open 游戏未开放
 * @property Gold_Not_Enough_To_Join_Game 金币不足
 */
export enum hallState {
    Can_Not_Find_Player = 11001,
    Can_Not_Find_SystemGame = 11002,
    Parameter_Miss_Field = 11003,
    Can_Not_Get_useableRoom = 11004,
    Game_Not_Open = 11005,
    Gold_Not_Enough_To_Join_Game = 11006,
    Player_Had_Leave = 11007,
}   