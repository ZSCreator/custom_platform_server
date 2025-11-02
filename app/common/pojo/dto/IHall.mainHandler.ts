import { GameNidEnum } from "../../constant/game/GameNidEnum";

/**
 * enterGameOrSelectionList 请求参数
 * @property nid                游戏编号
 * @property whetherToShowScene 是否分场
 * @property whetherToShowRoom  是否分房间
 * @property whetherToShowRoom  是否展示游戏内信息(盘路)
 * @property sceneId            场编号
 * @property roomId           房间编号
 */
export interface IEnterGameOrSelectionListOption {
    nid: GameNidEnum;

    whetherToShowScene: boolean;

    whetherToShowRoom: boolean;

    whetherToShowGamingInfo: boolean;

    sceneId?: number;

    roomId?: string;

    param?: any;
}

/**
 * enterGameOrSelectionList 返回参数
 */
export interface IEnterGameOrSelectionListResult {

}

/**
 * @property nid 游戏编号
 */
export interface IBackToHall {
    nid: string;
}

export interface IEntryGameServiceOptions {
    nid: string;

    sceneId: number;

    roomId: string;
    param?: any;
}