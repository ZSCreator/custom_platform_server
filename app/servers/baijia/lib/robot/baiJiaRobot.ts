'use strict';

// 欢乐百人机器人
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import * as commonUtil from "../../../../utils/lottery/commonUtil";
import robotBetUtil = require("../../../../utils/robot/robotBetUtil");
import RobotManager from "../../../../common/dao/daoManager/Robot.manager";
import * as baijiaConst from '../baijiaConst';
import { getLogger } from 'pinus-logger';
const logger = getLogger('robot_out', __filename);
import { get as getConfiguration } from "../../../../../config/data/JsonMgr";
import roomManager, { IsceneMgr } from '../BaijiaRoomManagerImpl';
// 下注的时间长度
const BET_COUNTDOWN = 25000;

export default class BaiJiaLeRobot extends BaseRobot {
    playerGold: number;
    /**是否申请离开 */
    isleavtate = false;
    /**玩家轮数 */
    playRound: number;
    /**离开轮数 */
    leaveRound: number;
    /**上庄条件 */
    upZhuangCond: number;
    zj_sData: baijiaConst.Ibj_onUpdateZhuangInfo = null;
    ChipList: number[];
    constructor(opts) {
        super(opts);
        this.playerGold = 0;
        this.playRound = 0;                                         // 当前轮数
        this.leaveRound = commonUtil.randomFromRange(10, 20);      // 离开轮数
    }

    // 刚进游戏时加载一次
    async baiJiaLeLoaded() {
        try {
            const sceneInfo: IsceneMgr = getConfiguration('scenes/baijia').datas.find(scene => scene.id === this.sceneId);
            this.ChipList = sceneInfo.ChipList;
            const dataFromLoaded: baijiaConst.baijia_mainHandler_loaded = await this.requestByRoute("baijia.mainHandler.loaded", {});
            this.upZhuangCond = dataFromLoaded.upZhuangCond;
            this.playerGold = dataFromLoaded.playerInfo.gold;
            if (dataFromLoaded.roomInfo.status == "BETTING") {
                const countdown = dataFromLoaded.roomInfo["countdownTime"] / 1000;
                this.onBaiJiaStartBet({ countdown });
            }
            return Promise.resolve(dataFromLoaded);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**机器人离开游戏 */
    async destroy() {
        this.isleavtate = true;
        await this.leaveGameAndReset();
    }

    /**收到通知后处理 */
    registerListener() {
        // 有人进游戏
        this.Emitter.on("bj_onEntry", this.bjOnEntry.bind(this));
        this.Emitter.on("baijia_playerTimeOut", this.playerTimeOut.bind(this));
        // 百家开始下注的通知
        this.Emitter.on("bj_bet", async (data) => {
            if (this.isleavtate) return;
            await this.Check_apply_up_zhuangs();
            await this.onBaiJiaStartBet(data);
        });
        //庄家切换推送
        this.Emitter.on("bj_onUpdateZhuangInfo", (data) => {
            this.zj_sData = data;
        });
        this.Emitter.on("bj_onBeting", (data) => {
            if (data.uid == this.uid){
                this.playerGold = data.gold;
            }
        });
    }

    playerTimeOut(data) {
        this.destroy();
        return;
    }

    // 有玩家进入的处理
    async bjOnEntry(data) {
        if (data.player.uid == this.uid) {
            this.playerGold = data.player.gold;
        }
    }

    // 百家开始下注的通知
    async onBaiJiaStartBet(data) {
        try {
            // 停止下注的时间戳，提前两秒停止
            const stopBetTimeOut = Date.now() + data["countdown"] * 1000 - 2000;
            if (this.zj_sData && this.zj_sData.zhuangInfo && this.zj_sData.zhuangInfo.uid == this.uid) {
                return;
            }
            if (this.playRound > this.leaveRound ||
                (this.isRobot == 2 && (this.playerGold > this.gold_max || this.playerGold < this.gold_min))) {
                await this.destroy();
                return;
            }
            // 处于下注阶段
            await this.baiJiaRobotDelayBet(stopBetTimeOut);
        } catch (error) {
            logger.warn(`baiJiaLeRobot.onBaiJiaStartBet|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${error}`);
        }
    }
    /**检查条件满足则上庄 */
    async Check_apply_up_zhuangs() {
        try {
            // 已经是庄家，或者申请过上庄
            let applyZhuangsNum = this.zj_sData ? this.zj_sData.applyZhuangsNum : 0;
            if (this.zj_sData && this.zj_sData.zhuangInfo && (
                this.zj_sData.zhuangInfo.uid == this.uid ||
                this.zj_sData.applyZhuangs.find(pl => pl && pl.uid == this.uid) ||
                this.zj_sData.applyZhuangsNum > 3
            )) {
                return;
            }

            let ranLess = commonUtil.randomFromRange(1, 100) <= 40;
            if (applyZhuangsNum == 0) {
                ranLess = true;
            }
            if (this.playerGold > this.upZhuangCond && ranLess) {
                // 满足条件申请上庄
                let result = await this.requestByRoute('baijia.mainHandler.applyUpzhuang', {});
            }
        } catch (error) {
            logger.info(`baijiale_robot|${this.uid}|${this.playerGold}|${JSON.stringify(error)}`);
        }
    }

    /**延迟随机时间多次下注 */
    async baiJiaRobotDelayBet(stopBetTimeOut: number) {
        const { betArea, goldArr } = robotBetUtil.getBaiJiaBetInfo(this.playerGold, this.sceneId, this.ChipList);
        if (!betArea || !goldArr.length) {
            await this.destroy();
            return;
        }
        if (!goldArr.length) {
            return;
        }
        // 第一次延迟6-9s，之后每次都随机延迟 1s - 5s
        let delayTime = commonUtil.randomFromRange(3000, 9000);
        for (let betNum of goldArr) {
            try {
                // 超过最后下注的期限、金币不足、不是下注阶段、处于离开阶段都返回
                if (Date.now() + delayTime >= stopBetTimeOut || this.playerGold < betNum) {
                    break;
                }
                let bets = { area: betArea, bet: betNum };
                await this.delayRequest("baijia.mainHandler.bet", bets, delayTime);
                this.playerGold -= betNum;
                delayTime = commonUtil.randomFromRange(1000, 5000);
            } catch (error) {
                logger.info(`baiJiaLeRobot.baiJiaRobotBet|${this.uid}|${JSON.stringify(error)}`);
                break;
            }
        }
        // 已下注轮数加1
        this.playRound++;
    }
}
