'use strict';

// 龙虎斗机器人
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import DragonTigerConst = require("../DragonTigerConst");
import * as commonUtil from "../../../../utils/lottery/commonUtil";
import mathUtil = require("../../../../utils/lottery/mathUtil");
import * as robotBetUtil from "../../../../utils/robot/robotBetUtil";
import { get as getConfiguration } from "../../../../../config/data/JsonMgr";
import roomManager, { IsceneMgr } from '../DragonTigerRoomMangerImpl';
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);
import events = require('events');
const EventEmitter = events.EventEmitter;


export default class DragonTigerRobot extends BaseRobot {
    playerGold: number = 0;
    /**当前轮数 */
    playRound: number = 0;
    /**离开轮数 */
    leaveRound: number = commonUtil.randomFromRange(10, 30);
    betLowLimit: number;
    /**是否是庄家 */
    isBanker: boolean = false;
    /**是否申请过上庄 */
    appliedBanker: boolean = false;
    /**申请下庄过度状态 */
    exitUpzhuanglist_stat = false;
    zj_sData: DragonTigerConst.Idt_zj_info = null;
    ChipList: number[];
    constructor(opts) {
        super(opts);
        this.betLowLimit = opts.betLowLimit;                        // 可下注的最少金币
    }

    // 刚进游戏时加载一次
    async dragonTigerLoaded() {
        try {
            const sceneInfo: IsceneMgr = getConfiguration('scenes/DragonTiger').datas.find(scene => scene.id === this.sceneId);
            this.ChipList = sceneInfo.ChipList;
            let res = await this.requestByRoute("DragonTiger.mainHandler.enterGame", {});
            this.playerGold = res["playerInfo"]["gold"];
            if (res["status"] == "BETTING") {
                const countdown = res["countdown"];
                this.onDragonTigerBetStart({ countdown });
            }
            this.nickname = res.playerInfo.nickname;
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // 机器人离开游戏
    async destroy() {
        await this.leaveGameAndReset();
    }

    // 收到通知后处理
    registerListener() {
        // 开始下注通知
        this.Emitter.on(DragonTigerConst.route.StartBet, (onBetData) => {
            this.onDragonTigerBetStart(onBetData);
            this.onUpdateZhuangInfo();
        });
        // 房间开始通知
        this.Emitter.on(DragonTigerConst.route.Start, this.onDTRoomStart.bind(this));
        this.Emitter.on(`${this.nid}_playerTimeOut`, () => { this.destroy() });
        this.Emitter.on(`${this.nid}_playerExit`, () => { this.destroy() });
        this.Emitter.on(DragonTigerConst.route.dt_zj_info, (data) => {
            this.zj_sData = data;
        });
    }

    onUpdateZhuangInfo() {
        if (this.zj_sData == null) return;
        const szGold = DragonTigerConst.bankerGoldLimit[this.sceneId];
        this.isBanker = this.zj_sData.banker && this.zj_sData.banker.uid === this.uid;
        if (!this.isBanker) {
            const ranLess = commonUtil.randomFromRange(1, 100) <= 30;
            const bankerLength = this.zj_sData.bankerQueue.filter(pl => pl && pl.isRobot == 2).length;
            if (ranLess && bankerLength < 3) {
                this.checkDTApplyBanker();
            } else if (bankerLength > 5) {
                this.zj_sData.bankerQueue.sort((c1, c2) => c1.gold - c2.gold);
                if (this.zj_sData.bankerQueue[0].uid == this.uid && this.playerGold > szGold) {
                    this.checkDTLeaveBanker();
                }
            }
        }
    }

    // 房间开始
    onDTRoomStart(data) {
        this.playerGold = data.gold;
    }

    /**检查是否上庄 */
    async checkDTApplyBanker() {
        if (this.appliedBanker) {
            return;
        }
        const szGold = DragonTigerConst.bankerGoldLimit[this.sceneId];
        if (this.playerGold > szGold) {
            try {
                this.appliedBanker = true;
                // 满足条件申请上庄
                const res = await this.requestByRoute('DragonTiger.mainHandler.becomeBanker', { isUp: true });
            } catch (error) {
                robotlogger.warn(`checkDTApplyBanker|${this.uid}${this.roomId}|${JSON.stringify(error)}`);
            }
        }
    }

    // 检查是否下庄
    async checkDTLeaveBanker() {
        try {
            if (this.exitUpzhuanglist_stat) {
                return;
            }
            this.exitUpzhuanglist_stat = true;
            // 申请下庄
            await this.requestByRoute('DragonTiger.mainHandler.becomeBanker', { isUp: false });
        } catch (error) {
            robotlogger.warn(`checkDTLeaveBanker|${this.uid}|||${JSON.stringify(error)}`);
        } finally {
            this.appliedBanker = false;
            this.exitUpzhuanglist_stat = false;
        }
    }

    // 开始下注
    async onDragonTigerBetStart(onBetData) {
        // 倒计时，onBetData.countdown 单位是秒，这里转为毫秒
        const countdown = onBetData.countdown * 1000;
        // 停止下注的时间戳：开奖前 1 秒
        const stopBetTimeOut = Date.now() + countdown - 1000;
        // 离开条件
        if (this.playRound > this.leaveRound ||
            this.playerGold < this.betLowLimit[0] ||
            (this.isRobot == 2 && (this.playerGold > this.gold_max || this.playerGold < this.gold_min))) {
            return this.destroy();
        }
        if (this.isBanker) {
            // 庄家，检查是否下庄
            return;
        }
        // 获取押注类型和金币
        const { betType, betArr } = robotBetUtil.getDragonTigerBetInfo(this.playerGold - this.betLowLimit, this.sceneId, this.ChipList);
        if (betType.length == 0 || commonUtil.isNullOrUndefined(betArr) || !betArr.length) {
            return this.destroy();
        }
        // 第一次延迟
        let delayTime = commonUtil.randomFromRange(2000, 3000);
        const delayArr = mathUtil.divideSumToNumArr(countdown - delayTime, betArr.length);
        // 第一次的延迟时间放在数组的头部
        delayArr.unshift(delayTime);

        for (let i = 0; i < delayArr.length; i++) {
            delayTime = delayArr[i];
            // 如果 当前时间+随机的延迟时间 超过了下注截止时间，或者钱不够押注限制，则停止下注
            if (Date.now() + delayTime >= stopBetTimeOut || this.playerGold < this.betLowLimit) {
                break;
            }
            if (i > betArr.length - 1) break;

            let bets = { area: betType[commonUtil.randomFromRange(0, betType.length - 1)], bet: betArr[i] };
            try {
                // 下注
                await this.delayRequest('DragonTiger.mainHandler.userBet', bets, delayTime);
                // 减金币
                this.playerGold -= betArr[i];
            } catch (error) {
                robotlogger.info(`龙虎斗下注出错|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${JSON.stringify(error)}`);
                break;
            }
        }
        this.playRound++;
    }
}
