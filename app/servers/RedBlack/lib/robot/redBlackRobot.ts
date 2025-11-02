'use strict';

// 红黑机器人
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import RedBlackConst = require("../RedBlackConst");
import mathUtil = require("../../../../utils/lottery/mathUtil");
import CommonUtil = require("../../../../utils/lottery/commonUtil");
import robotBetUtil = require("../../../../utils/robot/robotBetUtil");
import RobotManagerDao from "../../../../common/dao/daoManager/Robot.manager";
import { get as getConfiguration } from "../../../../../config/data/JsonMgr";
import roomManager, { IsceneMgr } from '../RedBlackMgr';
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);



export default class RedBlackRobot extends BaseRobot {
    playerGold: number;
    playRound: number;
    leaveRound: number;
    betLowLimit: number;
    ChipList: number[];
    constructor(opts: any) {
        super(opts);
        this.playerGold = 0;
        this.playRound = 0;                                         // 当前轮数
        this.leaveRound = CommonUtil.randomFromRange(1, 10);      // 离开轮数
        this.betLowLimit = opts.betLowLimit;                        // 可下注的最少金币
    }

    // 刚进游戏时加载一次
    async redBlackLoaded() {
        try {
            const sceneInfo: IsceneMgr = getConfiguration('scenes/RedBlack').datas.find(scene => scene.id === this.sceneId);
            this.ChipList = sceneInfo.ChipList;
            let res: RedBlackConst.RedBlack_mainHandler_enterGame = await this.requestByRoute("RedBlack.mainHandler.enterGame", {});
            this.playerGold = res.players.gold;
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**机器人离开游戏 */
    async destroy() {
        await this.leaveGameAndReset();
    }

    // 收到通知后处理
    registerListener() {
        // 开始下注通知
        this.Emitter.on(RedBlackConst.route.StartBet, (onBetData) => {
            this.onRedBlackStart(onBetData);
        });
        this.Emitter.on(RedBlackConst.route.Settle, (onBetData) => {
            const Me = onBetData.userWin.find(c => c && c.uid == this.uid);
            if (Me)
                this.playerGold = Me.gold;
        });
    }

    // 开始下注
    async onRedBlackStart(onBetData) {
        // 倒计时，onBetData.countdown 单位是秒，这里转为毫秒
        const countdown = onBetData.countdown * 1000;
        // 停止下注的时间戳：开奖前 1 秒
        const stopBetTimeOut = Date.now() + countdown;

        // 离开条件
        if (this.playRound > this.leaveRound ||
            (this.isRobot == 2 && (this.playerGold > this.gold_max || this.playerGold < this.gold_min))) {
            return this.destroy();
        }

        // 获取押注类型和金币
        const { betType, betArr } = robotBetUtil.getRedBlackBetInfo(this.playerGold, this.sceneId > 0 ? this.sceneId - 1 : 0, this.ChipList);
        if (CommonUtil.isNullOrUndefined(betType) || !betArr.length) {
            return this.destroy();
        }
        // 第一次延迟
        let delayTime = CommonUtil.randomFromRange(2000, 4000);
        const delayArr = mathUtil.divideSumToNumArr(countdown - delayTime, betArr.length).filter(num => num >= 200);
        // 第一次的延迟时间放在数组的头部
        delayArr.unshift(delayTime);
        for (let i = 0; i < delayArr.length; i++) {
            delayTime = delayArr[i];
            // 如果 当前时间+随机的延迟时间 超过了下注截止时间，或者钱不够押注限制，则停止下注
            if (Date.now() + delayTime >= stopBetTimeOut || this.playerGold < this.betLowLimit) {
                break;
            }
            if (!betArr[i]) {
                break;
            }
            let bets: { [key: string]: number } = {};
            bets[betType] = betArr[i];
            try {
                // 下注
                await this.delayRequest('RedBlack.mainHandler.userBet', bets, delayTime);
                // 减金币
                this.playerGold -= betArr[i];
            } catch (error) {
                robotlogger.info(`红黑下注出错|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${error}`);
                break;
            }
        }
        this.playRound++;
    }
}