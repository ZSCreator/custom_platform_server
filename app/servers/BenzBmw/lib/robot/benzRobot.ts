'use strict';

// 骰宝机器人
import utils = require('../../../../utils');
import benzConst = require('../benzConst');
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import hallConst = require("../../../../consts/hallConst");
import robotConst = require("../../../../consts/robotConst");
import CommonUtil = require("../../../../utils/lottery/commonUtil");
import mathUtil = require("../../../../utils/lottery/mathUtil");
import robotBetUtil = require("../../../../utils/robot/robotBetUtil");
import { get as getConfiguration } from "../../../../../config/data/JsonMgr";
import roomManager, { IsceneMgr } from '../benzRoomMgr';
import { BenzLimit_totalBet } from '../../../../../config/data/gamesBetAstrict';
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);


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
            const sceneInfo: IsceneMgr = getConfiguration('scenes/BenzBmw').datas.find(scene => scene.id === this.sceneId);
            this.ChipList = sceneInfo.ChipList;
            let res: benzConst.IBenzBmw_mainHandler_loaded = await this.requestByRoute("BenzBmw.mainHandler.loaded", {});
            this.playerGold = res.pl.gold;
            this.lowBet = res.roomInfo.lowBet;
            // this.tallBet = res.roomInfo.tallBet;
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // 机器人离开游戏
    async destroy() {
        await this.leaveGameAndReset(false);
    }

    /**收到通知后处理 */
    registerListener() {
        // 结算
        this.Emitter.on("Benz.Lottery", this.onSicboResult.bind(this));
        // 开始下注
        this.Emitter.on("Benz.BETTING", this.onSicboStart.bind(this));
    }

    // 结算
    onSicboResult(resultData: benzConst.IBenz_Lottery) {
        const dataOfRobot = resultData.userWin.find(c => c.uid == this.uid);
        if (dataOfRobot) {
            this.playerGold = dataOfRobot.gold;
        }
    }

    // 开始下注
    async onSicboStart(onBetData: benzConst.IBenz_Start) {
        // 倒计时，onBetData.countDown 单位是秒，这里转为毫秒
        const countdown = onBetData.countdown * 1000;
        // 停止下注的时间戳：开奖前 1 秒
        const stopBetTimeOut = Date.now() + countdown - 1000;
        // 离开条件
        if (this.playRound > this.leaveRound || this.playerGold < this.lowBet) {
            return this.destroy();
        }

        // 获取押注类型和金币
        const betType = benzConst.points[utils.random(0, benzConst.points.length - 1)];
        const { betArr } = robotBetUtil.getUp7BetTypeAndGold(this.playerGold, this.sceneId, this.ChipList);
        if (CommonUtil.isNullOrUndefined(betType) || !betArr.length) {
            return this.destroy();
        }

        // 第一次延迟
        let delayTime = CommonUtil.randomFromRange(2000, 3000);
        const delayArr = mathUtil.divideSumToNumArr(countdown - delayTime, betArr.length - 1);
        // 第一次的延迟时间放在数组的头部
        delayArr.unshift(delayTime);
        let tallBet = 0;
        for (let i = 0; i < delayArr.length; i++) {
            delayTime = delayArr[i];
            // 如果 当前时间+随机的延迟时间 超过了下注截止时间，或者钱不够押注限制，则停止下注
            if (!betArr[i] || (Date.now() + delayTime + 200) > stopBetTimeOut || this.playerGold < this.lowBet || this.playerGold < betArr[i]) {
                break;
            }
            tallBet += betArr[i];
            if (tallBet > BenzLimit_totalBet.find(c => c.area == betType.area).Limit[this.sceneId]) {
                break;
            }
            let bets: { area: string, bet: number } = { area: betType.area, bet: betArr[i] };
            try {
                // 下注
                let res = await this.delayRequest("BenzBmw.mainHandler.userBet", bets, delayTime);
                // 减金币
                this.playerGold = res.gold;
            } catch (error) {
                robotlogger.warn(`BenzBmw|下注出错|${this.uid}|${this.roomId}|${JSON.stringify(error)}`);
                robotlogger.warn(`BenzBmw|${this.roomId}`, utils.cDate(stopBetTimeOut), utils.cDate(Date.now()));
                break;
            }
        }
        this.playRound++;
    }
}