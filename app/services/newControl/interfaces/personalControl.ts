/**
 * 个控接口
 * @property nid            游戏nid
 * @property sceneId        游戏场id
 * @property gameName       游戏名字
 * @property sceneName      场名字
 */
export interface IPersonalControl {
    nid: string;
    sceneId: number;
    serverName: string;
    gameName: string;
    sceneName: string

    init(): void;
}