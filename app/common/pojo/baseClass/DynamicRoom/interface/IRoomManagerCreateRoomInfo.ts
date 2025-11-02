/**
 * @name 初始化创建房间必要信息
 */
export interface IRoomManagerCreateRoomInfo {

    /** @property 是否选场 */
    whetherToShowScene: boolean;

    /** @property 游戏场数量 */
    sceneCount: number;

    /** @property 游戏单场房间数量 */
    roomCount: number;
}
