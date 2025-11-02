'use strict';

// 骰宝机器人
import utils = require('../../../../utils');
import up7Const = require('../up7Const');
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import hallConst = require("../../../../consts/hallConst");
import robotConst = require("../../../../consts/robotConst");
import CommonUtil = require("../../../../utils/lottery/commonUtil");
import mathUtil = require("../../../../utils/lottery/mathUtil");
import robotBetUtil = require("../../../../utils/robot/robotBetUtil");
import { get as getConfiguration } from "../../../../../config/data/JsonMgr";
import roomManager, { IsceneMgr } from '../up7RoomMgr';
import { getLogger } from 'pinus-logger';
const logger = getLogger('robot_out', __filename);


export default class up7Robot extends BaseRobot {
    playerGold: number;
    playRound: number;
    leaveRound: number;
    lowBet: number;
    tallBet: number;
    ChipList: number[];
    constructor(opts) {
        super(opts);
        this.playerGold = 0;
        this.playRound = 0;                                      // 当前轮数
        this.leaveRound = CommonUtil.randomFromRange(10, 100);   // 离开轮数
        // this.lowBet = opts.lowBet;                     // 可下注的最少金币
    }

    // 刚进游戏时加载一次
    async Loaded() {
        try {
            const sceneInfo: IsceneMgr = getConfiguration('scenes/7up7down').datas.find(scene => scene.id === this.sceneId);
            this.ChipList = sceneInfo.ChipList;
            let res: up7Const.up7down_mainHandler_loaded = await this.requestByRoute("7up7down.mainHandler.loaded", {});
            this.playerGold = res.pl.gold;
            this.lowBet = res.room.lowBet;
            this.tallBet = res.room.tallBet;
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
        this.Emitter.on("7up7down.result", (resultData) => this.onSicboResult(resultData));
        // 有人进游戏
        this.Emitter.on("7up7down.userChange", async (changeData) => await this.onSicboUserChange(changeData));
        // 开始下注
        this.Emitter.on("7up7down.start", (onBetData) => this.onSicboStart(onBetData));
    }

    // 结算
    onSicboResult(resultData: up7Const.I7up7down_result) {
        const dataOfRobot = resultData.userWin.find(c => c.uid == this.uid);
        if (dataOfRobot) {
            this.playerGold = dataOfRobot.gold;
        }
    }

    // 有人进游戏
    async onSicboUserChange(changeData) {
    }

    // 开始下注
    async onSicboStart(onBetData: up7Const.I7up7down_start) {
        // 倒计时，onBetData.countDown 单位是秒，这里转为毫秒
        const countdown = onBetData.countDown * 1000;
        // 停止下注的时间戳：开奖前 1 秒
        const stopBetTimeOut = Date.now() + countdown - 1000;
        // 离开条件
        if (this.playRound > this.leaveRound || this.playerGold < this.lowBet) {
            return this.destroy();
        }

        // 获取押注类型和金币
        const betType = up7Const.points[utils.random(0, 2)];
        const { betArr } = robotBetUtil.getUp7BetTypeAndGold(this.playerGold, this.sceneId, this.ChipList);
        if (CommonUtil.isNullOrUndefined(betType) || !betArr.length) {
            return this.destroy();
        }
        let tallBet = this.tallBet;
        if (betType == up7Const.BetAreas.BB) {
            tallBet = this.tallBet / 2;
        }
        do {
            if (tallBet < utils.sum(betArr)) {
                betArr.shift();
            } else {
                break;
            }
        } while (true);

        // 第一次延迟
        let delayTime = CommonUtil.randomFromRange(2000, 3000);
        const delayArr = mathUtil.divideSumToNumArr(countdown - delayTime, betArr.length - 1);
        // 第一次的延迟时间放在数组的头部
        delayArr.unshift(delayTime);

        for (let i = 0; i < delayArr.length; i++) {
            delayTime = delayArr[i];
            // 如果 当前时间+随机的延迟时间 超过了下注截止时间，或者钱不够押注限制，则停止下注
            if (!betArr[i] || Date.now() + delayTime > stopBetTimeOut || this.playerGold < this.lowBet || this.playerGold < betArr[i]) {
                break;
            }
            let bets: { area: string, bet: number } = { area: betType, bet: betArr[i] };
            try {
                // 下注
                let res = await this.delayRequest("7up7down.mainHandler.userBet", bets, delayTime);
                // 减金币
                this.playerGold = res.gold;
            } catch (error) {
                logger.warn(`7up下注出错|${this.uid}|${this.roomId}|${JSON.stringify(error)}`);
                logger.warn(`${this.roomId}`, utils.cDate(stopBetTimeOut), utils.cDate(Date.now() + delayTime));
                break;
            }
        }
        this.playRound++;
    }
}