'use strict';

// 骰宝机器人
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import hallConst = require("../../../../consts/hallConst");
import robotConst = require("../../../../consts/robotConst");
import CommonUtil = require("../../../../utils/lottery/commonUtil");
import mathUtil = require("../../../../utils/lottery/mathUtil");
import robotBetUtil = require("../../../../utils/robot/robotBetUtil");
import { get as getConfiguration } from "../../../../../config/data/JsonMgr";
import roomManager, { IsceneMgr } from '../SicBoRoomMgr';
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);


export default class SicboRobot extends BaseRobot {
    playerGold: number;
    playRound: number;
    leaveRound: number;
    betLowLimit: number;
    ChipList: number[];
    constructor(opts) {
        super(opts);
        this.playerGold = 0;
        this.playRound = 0;                                      // 当前轮数
        this.leaveRound = CommonUtil.randomFromRange(10, 100);   // 离开轮数
        this.betLowLimit = opts.betLowLimit;                     // 可下注的最少金币
    }

    // 刚进游戏时加载一次
    async sicboLoaded() {
        try {
            const sceneInfo: IsceneMgr = getConfiguration('scenes/SicBo').datas.find(scene => scene.id === this.sceneId);
            this.ChipList = sceneInfo.ChipList;
            const res = await this.requestByRoute("SicBo.mainHandler.loaded", {});
            this.playerGold = res.pl.gold;
            if (res.room.roomStatus == "BETTING") {
                this.onSicboStart({ countDown: res.room.countDown })
            }

            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // 机器人离开游戏
    async destroy() {
        await this.leaveGameAndReset();
    }

    /**收到通知后处理 */
    registerListener() {
        // 结算
        this.Emitter.on("SicBo.result", (resultData) => this.onSicboResult(resultData));
        // 有人进游戏
        this.Emitter.on("SicBo.userChange", async (changeData) => await this.onSicboUserChange(changeData));
        // 开始下注
        this.Emitter.on("SicBo.start", (onBetData) => this.onSicboStart(onBetData));
    }

    // 结算
    onSicboResult(resultData) {
        const dataOfRobot = resultData.userWin[this.uid];
        if (dataOfRobot && typeof dataOfRobot === 'object' && dataOfRobot.totalWin) {
            this.playerGold += dataOfRobot.totalWin
        }
    }

    // 有人进游戏
    async onSicboUserChange(changeData) {
    }

    // 开始下注
    async onSicboStart(onBetData) {
        // 倒计时，onBetData.countDown 单位是秒，这里转为毫秒
        const countdown = onBetData.countDown * 1000;
        // 停止下注的时间戳：开奖前 1 秒
        const stopBetTimeOut = Date.now() + countdown - 1000;
        // 离开条件
        if (this.playRound > this.leaveRound ||
            this.playerGold < this.betLowLimit ||
            (this.isRobot == 2 && (this.playerGold < this.gold_min || this.playerGold > this.gold_max))) {
            return this.destroy();
        }

        // 获取押注类型和金币
        const { betType, betArr } = robotBetUtil.getSicboBetTypeAndGold(this.playerGold, this.sceneId, this.ChipList);
        if (CommonUtil.isNullOrUndefined(betType) || !betArr.length) {
            return this.destroy();
        }

        // 第一次延迟
        let delayTime = CommonUtil.randomFromRange(2000, 3000);
        const delayArr = mathUtil.divideSumToNumArr(countdown - delayTime, betArr.length - 1);
        // 第一次的延迟时间放在数组的头部
        delayArr.unshift(delayTime);

        for (let i = 0; i < delayArr.length; i++) {
            delayTime = delayArr[i];
            // 如果 当前时间+随机的延迟时间 超过了下注截止时间，或者钱不够押注限制，则停止下注
            if (Date.now() + delayTime >= stopBetTimeOut || this.playerGold < this.betLowLimit) {
                break;
            }
            let bets: { area: string, bet: number } = { area: betType, bet: betArr[i] };
            try {
                // 下注
                await this.delayRequest("SicBo.mainHandler.userBet", bets, delayTime);
                // 减金币
                this.playerGold -= betArr[i];
            } catch (error) {
                robotlogger.info(`骰宝下注出错|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${error}`);
                break;
            }
        }
        this.playRound++;
    }
}