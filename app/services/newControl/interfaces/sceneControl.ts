/**
 * 游戏场控接口
 * @property nid            游戏nid
 * @property sceneId        游戏场id
 * @property gameName       游戏名字
 * @property sceneName      场名字
 */
export interface ISceneControl {
    nid: string;
    sceneId: number;
    gameName: string;
    sceneName: string;
    serverName: string;

    init(): void;
}