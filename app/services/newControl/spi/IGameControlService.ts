import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";
import {ControlPlayer, ControlResult} from "..";
import {SheetDTO} from "../lib/controlScene";

export interface GetControlInfoParams {
    sceneId: number;
    players: ControlPlayer[],
}


/**
 * 调控服务对游戏提供的接口
 */
export interface IGameControlService {
    nid: GameNidEnum;

    /**
     * 初始化
     * @param nid 游戏nid
     * @param bankerGame 是否是有庄游戏 有庄游戏调控会返回庄杀
     */
    init({nid, bankerGame}:
             {nid: GameNidEnum, bankerGame?: boolean}): Promise<any>;

    /**
     * 获取调控信息
     * @param sceneId
     * @param players
     */
    getControlInfo({sceneId, players}: GetControlInfoParams): Promise<ControlResult>;

    /**
     * 改变奖池
     * @param sceneId 场id
     * @param amount 改变金额
     * @param betAmount 下注金币
     * @param changeStatus 改变状态 1 是增加 2是减少
     */
    changeBonusPoolAmount(sceneId: number, amount: number, betAmount: number, changeStatus: 1 | 2): Promise<void>;

    /**
     * 改变调控数据
     * @param sheet
     */
    changeControlData(sheet: SheetDTO): Promise<void>;


    /**
     * 添加盈利池
     * @param sceneId 场id
     * @param amount 改变金额
     */
    addProfitPoolAmount(sceneId: number, amount: number): Promise<void>;

    /**
     * 获取奖池
     * @param sceneId
     */
    getPool(sceneId: number): Promise<any>;


    /**
     * 获取奖池修正值
     * @param sceneId
     */
    getCorrectedValue(sceneId: number): Promise<{correctedValue: number}>;
}