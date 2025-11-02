/**
 * @property SUCCESS 成功
 * @property ERROR   出错
 */
export enum httpState {
    SUCCESS = 200,
    ERROR = 500,
    /**不在房间中 */
    NotInRoom = 501,
    /**游戏中 */
    INGAME = 34701
}