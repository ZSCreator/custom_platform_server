import {ControlTypes, RecordTypes} from "../constants";
import platformControlDao from '../../../common/dao/daoManager/PlatformControl.manager';
import {isNumberObject} from "../../../utils/utils";
import {getLogger, Logger} from 'pinus-logger';
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

const logger: Logger = getLogger('server_out', __filename);

export interface SheetDTO {
    uid: string,
    nid: string,
    sceneId: number,
    platformId: string,
    groupRemark: string,
    betGold: number,
    profit: number,
    serviceCharge: number,
    controlType: ControlTypes,
}

export interface IControlScene {
    /** 下注金币 */
    betGoldAmount: number;

    /** 系统利润 */
    profit: number;

    /** 下注玩家uid集合 */
    betPlayersSet: Set<string> | Array<string> | string | number;

    /** 玩家总投注次数统计 */
    betRoundCount: number;

    /** 抽水费 */
    serviceCharge: number;

    /** 调控单类型统计 */
    controlStateStatistical: { [key in ControlTypes]: number };

    /** 被调控系统输的单 */
    controlLossCount: number;

    /** 被调控系统赢的单 */
    controlWinCount: number;

    /** 受调控影响不输不赢的单 */
    controlEquality: number;

    /** 系统杀率 算法为 利润 / 真实押注 */
    killRate: number;

    /** 系统胜率 赢单量 / 总的押注次数 */
    systemWinRate: number;

    /** 玩家盈利的次数 */
    playerWinCount: number;

    /** 系统盈利次数 */
    systemWinCount: number;

    /** 系统和玩家平局的情况 */
    equalityCount: number;

    /** 类型 */
    type?: RecordTypes;
}

export interface IBaseScene extends IControlScene {
    /** 平台号 */
    platformId: string;
    /** 租户号 */
    tenantId: string; 

    /** 游戏id */
    nid: string;

    /** 场id */
    sceneId: number;

    /** 最后更新时间 */
    dateLastUpdated: number;

    /** 最后改变时间 */
    dateChanged: number;
}

/**
 * 构建场的状态
 * @param platformId
 * @param tenantId
 * @param nid
 * @param sceneId
 */
export function buildControlScene(platformId: string, tenantId: string, nid: GameNidEnum, sceneId: number) {
    return new ControlScene(platformId, tenantId, nid, sceneId);
}


export class ControlScene implements IBaseScene {
    private _id: number;
    tenantId: string;
    platformId: string;
    nid: string;
    sceneId: number;
    betGoldAmount: number;
    profit: number;
    betPlayersSet: Set<string> = new Set();
    betRoundCount: number;
    serviceCharge: number;
    controlLossCount: number;
    controlWinCount: number;
    controlEquality: number;
    killRate: number;
    systemWinRate: number;
    playerWinCount: number;
    systemWinCount: number;
    equalityCount: number;
    dateLastUpdated: number;
    dateChanged: number;
    controlStateStatistical = {
        [ControlTypes.platformControlWin]: 0,
        [ControlTypes.platformControlLoss]: 0,
        [ControlTypes.sceneControlWin]: 0,
        [ControlTypes.sceneControlLoss]: 0,
        [ControlTypes.personalControlWin]: 0,
        [ControlTypes.personalControlLoss]: 0,
        [ControlTypes.none]: 0
    };


    constructor(platform: string, tenantId: string, nid: GameNidEnum, sceneId: number) {
        this.nid = nid;
        this.sceneId = sceneId;
        this.platformId = platform;
        this.tenantId = tenantId;
        const now = Date.now();
        this.dateLastUpdated = now;
        this.dateChanged = now;
    }

    /**
     * 初始化数据
     */
    init(first, history?: IControlScene) {
        if (first) {
            this.betGoldAmount = 0;
            this.profit = 0;
            this.betPlayersSet.clear();
            this.playerWinCount = 0;
            this.systemWinRate = 0;
            this.systemWinCount = 0;
            this.killRate = 0;
            this.controlWinCount = 0;
            this.controlLossCount = 0;
            this.controlEquality = 0;
            this.betRoundCount = 0;
            this.serviceCharge = 0;
            this.equalityCount = 0;

            this.controlStateStatistical = {
                [ControlTypes.platformControlWin]: 0,
                [ControlTypes.platformControlLoss]: 0,
                [ControlTypes.sceneControlWin]: 0,
                [ControlTypes.sceneControlLoss]: 0,
                [ControlTypes.personalControlWin]: 0,
                [ControlTypes.personalControlLoss]: 0,
                [ControlTypes.none]: 0
            };
        } else {
            this.betGoldAmount = history.betGoldAmount;
            this.profit = history.profit;
            (history.betPlayersSet as Array<string>).forEach(uid => this.betPlayersSet.add(uid));
            this.playerWinCount = history.playerWinCount;
            this.systemWinRate = history.systemWinRate;
            this.killRate = history.killRate;
            this.controlWinCount = history.controlWinCount;
            this.controlLossCount = history.controlLossCount;
            this.controlEquality = history.controlEquality;
            this.betRoundCount = history.betRoundCount;
            this.serviceCharge = history.serviceCharge;
            this.controlStateStatistical = history.controlStateStatistical;
            this.systemWinCount = history.systemWinCount;
            this.equalityCount = history.equalityCount;
            this._id = (history as any).id;
        }
    }

    /**
     * 更新
     */
    async updateToDB() {
        this.dateLastUpdated = Date.now();
        await platformControlDao.updateSummaryData(this._id, this.getBaseData());
    }

    /**
     * 创建
     */
    async crateToDB() {
        const now = Date.now();
        this.dateLastUpdated = now;
        this.dateChanged = now;

        const result = await platformControlDao.createOne(this.getBaseData());
        this._id = result.id;
    }

    /**
     * 如果最后的修改时间超过最后的更新时间则更新进数据库
     */
    needToBeUpdate() {
        return this.dateChanged > this.dateLastUpdated;
    }

    /**
     * 获取基础数据
     */
    getBaseData(backend = false): IControlScene | IBaseScene {
        return {
            platformId: this.platformId,
            tenantId: this.tenantId,
            nid: this.nid,
            sceneId: this.sceneId,
            betGoldAmount: this.betGoldAmount,
            profit: this.profit,
            betPlayersSet: backend ? this.betPlayersSet.size : [...this.betPlayersSet.values()],
            playerWinCount: this.playerWinCount,
            systemWinCount: this.systemWinCount,
            equalityCount: this.equalityCount,
            systemWinRate: this.systemWinRate,
            killRate: this.killRate,
            controlWinCount: this.controlWinCount,
            controlLossCount: this.controlLossCount,
            controlEquality: this.controlEquality,
            betRoundCount: this.betRoundCount,
            serviceCharge: this.serviceCharge,
            controlStateStatistical: this.controlStateStatistical,
            type: this.tenantId ? RecordTypes.TENANT_SCENE : RecordTypes.SCENE,
        }
    }

    dealWithSheet(sheet: SheetDTO) {
        if (!isNumberObject(sheet.profit) || !isNumberObject(sheet.betGold) || !isNumberObject(sheet.serviceCharge)) {
            logger.warn(`平台调控处理数据出错 ${JSON.stringify(sheet)}`);
            return;
        }

        const profit = Math.floor(sheet.profit);
        const betGold = Math.floor(sheet.betGold);
        const serviceCharge = Math.floor(sheet.serviceCharge);

        this.betRoundCount++;
        this.betPlayersSet.add(sheet.uid);
        this.profit -= profit;
        this.betGoldAmount += betGold;
        this.serviceCharge += serviceCharge;

        if (profit > 0) {
            this.playerWinCount++;
        } else if (profit < 0) {
            this.systemWinCount++;
        } else {
            this.equalityCount++;
        }

        if (sheet.controlType !== ControlTypes.none) {
            if (profit > 0) {
                this.controlWinCount++;
            } else if (profit < 0) {
                this.controlLossCount++;
            } else {
                this.controlEquality++;
            }

            this.controlStateStatistical[sheet.controlType]++;
        } else {
            this.controlStateStatistical[sheet.controlType]++;
        }

        this.killRate = this.profit / this.betGoldAmount;
        this.systemWinRate = this.systemWinCount / this.betRoundCount;
        this.killRate = Math.floor(this.killRate * 100) / 100;
        this.systemWinRate = Math.floor(this.systemWinRate * 100) / 100;
        this.dateChanged = Date.now();
    }


}