'use strict';

// 百人牛牛、彩票百人牛牛的机器人
import * as utils from '../../../../utils'
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
// import logService = require("../../../../services/common/logService");
import * as commonUtil from "../../../../utils/lottery/commonUtil";
import mathUtil = require("../../../../utils/lottery/mathUtil");
import bairenConst = require('../constant/bairenConst');
import RobotManagerDao from "../../../../common/dao/daoManager/Robot.manager";
import robotBetUtil = require("../../../../utils/robot/robotBetUtil");
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);
import { get as getConfiguration } from "../../../../../config/data/JsonMgr";
import roomManager, { IsceneMgr } from '../BairenRoomManager';
/**庄家钱是否够赔付 */
let pl_totalBets: { uid: string, roomId: string, totalBet: number, flag: false }[] = [];

export default class BullFightRobot extends BaseRobot {
    initGold: number = 0;
    gold: number = 0;
    playRound: number;
    leaveRound: number;
    /**是否是庄家 */
    isBanker: boolean;
    /**申请下庄过度状态 */
    exitUpzhuanglist_stat = false;
    /**下注状态 */
    isBetState: boolean;
    /**庄闲最大赔付倍数 */
    compensate: number;
    /**最低下注要求这里为20 */
    lowBet: number;
    upZhuangCond: number;
    zj_sData: bairenConst.Ibr_onUpdateZhuangInfo = null;
    ChipList: number[];
    constructor(opts) {
        super(opts);
        this.playRound = 0;                                     // 当前轮数
        this.leaveRound = commonUtil.randomFromRange(10, 50);  // 离开轮数
        this.isBanker = false;                                  // 是否是庄
        this.isBetState = true;                                // 是否是下注阶段
    }

    // 加载
    async bullFightLoaded() {
        try {
            const sceneInfo: IsceneMgr = getConfiguration('scenes/bairen').datas.find(scene => scene.id === this.sceneId);
            this.ChipList = sceneInfo.ChipList;
            if (!pl_totalBets.find(m => m.uid == this.uid)) {
                pl_totalBets.push({ uid: this.uid, roomId: this.roomId, totalBet: 0, flag: false });
            }
            let res: bairenConst.bairen_mainHandler_loaded = await this.requestByRoute(`bairen.mainHandler.loaded`, {});
            if (res.code == 200) {
                this.lowBet = res.room.lowBet;
                this.upZhuangCond = res.room.upZhuangCond;
                this.initGold = this.gold = res.players.find(pl => pl.uid == this.uid).gold;
            }
            this.compensate = this.sceneId == 0 ? 5 : 10;
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // 离开斗牛
    async destroy() {
        this.isBetState = false;
        await this.leaveGameAndReset();
        pl_totalBets = pl_totalBets.filter(m => m.uid != this.uid);
    }

    // 收到通知后处理
    registerListener() {
        // 有人进游戏
        this.Emitter.on(`br_onEntry`, async (dataFromEntry) => {
            await this.onBullFightEntry(dataFromEntry);
        });
        this.Emitter.on("br_onUpdateZhuangInfo", this.onUpdateZhuangInfo.bind(this));
        // 开始下注
        this.Emitter.on(`br_start`, this.onBullFightBetStart.bind(this));

        // 下注结束
        this.Emitter.on(`br_over`, this.onBullFightBetOver.bind(this));
    }

    onUpdateZhuangInfo(data: bairenConst.Ibr_onUpdateZhuangInfo) {
        this.isBanker = data.zhuangInfo && data.zhuangInfo.uid === this.uid;
        if (!this.isBanker) {
            const ranLess = commonUtil.randomFromRange(1, 100) <= 30;
            const bankerLength = data.zj_queues.filter(pl => pl && pl.isRobot == 2).length;
            if (ranLess && bankerLength < 3) {
                this.checkBanker();
            }
            if (!this.exitUpzhuanglist_stat && bankerLength > 5) {
                data.zj_queues.sort((c1, c2) => c1.gold - c2.gold);
                if (data.zj_queues[0].uid == this.uid) {
                    this.requestXiaZhuang();
                }
            }
        }
        this.zj_sData = data;
    }

    // 有人进游戏
    async onBullFightEntry(dataFromEntryMsg) {

    }

    /**斗牛开始下注 */
    async onBullFightBetStart(data: bairenConst.Ibr_start) {
        // 倒计时，毫秒为单位
        const countdown = data.countdownTime * 1000;
        // 停止下注的时间戳：开奖前 1 秒
        const stopBetTimeOut = Date.now() + countdown - 1000;

        // 庄或者未处于下注阶段，不押注
        if (this.isBanker || !this.isBetState) {
            return;
        }

        if (this.playRound > this.leaveRound ||
            this.gold < this.lowBet ||
            (this.isRobot == 2 && (this.gold > this.gold_max || this.gold < this.gold_min))) {
            return this.destroy();
        }
        // 随机因子
        const randomFactor = commonUtil.randomFromRange(1, 100);


        // 获取下注信息
        const { betArea, betArr } = robotBetUtil.getBullFightBetInfo(randomFactor,
            this.gold - this.lowBet, this.zj_sData && this.zj_sData.zhuangInfo ? this.zj_sData.zhuangInfo.gold : 0, this.ChipList);
        // 没有随机到下注金币，离开
        if (commonUtil.isNullOrUndefined(betArea) || commonUtil.isNullOrUndefined(betArr) || !betArr.length) {
            return await this.destroy();
        }
        // 把倒计时 countdownInSecond - delayTime 分成 betArr.length - 1 份（结果数组中可能包含 0，筛掉小于1秒钟的）
        // 因为第一次下注要延迟 4-8 秒，所以总时间只有 countdownInSecond - delayTime，且只分成 betArr.length - 1 份
        // delayTime 和 delayArr 的单位是：毫秒
        let delayTime = commonUtil.randomFromRange(3000, 5000);
        const delayArr = mathUtil.divideSumToNumArr(countdown - delayTime, betArr.length);
        // 第一次的延迟时间放在数组的头部
        delayArr.unshift(delayTime);
        let sumCount = 0;//已经下注金额


        /**如果是非系统庄家,则机器人下注金额不超过庄家可赔付金币的80% */
        if (this.zj_sData && this.zj_sData.zhuangInfo) {
            let delay = 1000;
            let zj_gold_peifu = this.zj_sData.zhuangInfo.gold / this.compensate * 0.6;
            let pl_totalBet = pl_totalBets.find(m => m.roomId == this.roomId);
            pl_totalBet.totalBet += utils.sum(betArr);
            if (pl_totalBet.totalBet > zj_gold_peifu) {
                delay = 2000;
            }
            for (let idx = 0; idx < delayArr.length; idx++) {
                delayArr[idx] = delayArr[idx] + delay;
            }
        }



        for (let i = 0; i < delayArr.length; i++) {
            delayTime = delayArr[i];
            // 如果 当前时间+随机的延迟时间 超过了下注截止时间、或者不是下注状态，或者不是庄家，则停止下注
            if (Date.now() + delayTime >= stopBetTimeOut || !this.isBetState || this.isBanker) {
                break;
            }
            if (i > betArr.length - 1) {
                break;
            }
            sumCount = sumCount + betArr[i];
            if (sumCount * this.compensate > this.gold)
                continue;

            try {
                // 延迟下注
                let res = await this.delayRequest(`bairen.mainHandler.bet`, {
                    bet: betArr[i],
                    area: betArea
                }, delayTime);
                this.gold -= betArr[i];
            } catch (error) {
                let context = `bairen.mainHandler.bet|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${error}`;
                robotlogger.info(context);
                break;
            }
        }
        // 已下注次数加1
        this.playRound++;
    }
    /**
     *  是否申请上庄 上庄列表机器人数量
     */
    async checkBanker() {
        if (this.gold > this.upZhuangCond) {
            if (this.sceneId == 0 || (this.sceneId == 1 && this.gold >= this.lowBet * 300)) {
                try {
                    await this.delayRequest(`bairen.mainHandler.applyUpzhuang`, {}, 15000);
                } catch (error) {
                }
            }
        }
    }
    // 申请下庄
    async requestXiaZhuang() {
        this.exitUpzhuanglist_stat = true;
        // 否则申请下庄
        await this.requestByRoute(`bairen.mainHandler.exitUpzhuanglist`, {}).catch(error => {
            robotlogger.warn(`bairen.mainHandler.exitUpzhuanglist|${this.uid}||${this.sceneId}|${this.roomId}|${JSON.stringify(error)}`);
        });
        // 成功了才置状态
        this.isBanker = false;
        this.exitUpzhuanglist_stat = false;
    }
    // 斗牛下注结束
    async onBullFightBetOver(data: bairenConst.Ibr_over) {
        // const player = await RobotManagerDao.findOne({ uid: this.uid }, false);
        // this.gold = player ? player.gold : 0;
        let pl_totalBet = pl_totalBets.find(m => m.roomId == this.roomId);
        if (pl_totalBet) {
            pl_totalBet.totalBet = 0;
            pl_totalBet.flag = false;
        }
    }
}
