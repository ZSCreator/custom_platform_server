'use strict';

// 捕鱼乐机器人
import events = require('events');
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import * as hallConst from "../../../../consts/hallConst";
import * as robotConst from "../../../../consts/robotConst";
import * as commonUtil from "../../../../utils/lottery/commonUtil";



// 下注的时间长度
const BET_COUNTDOWN = 25000;

export default class buyuRobot extends BaseRobot {
    playerGold: number;
    /**下注状态 */
    isBetState: boolean;
    /**玩家轮数 */
    playRound: number;
    /**离开轮数 */
    leaveRound: number;
    isBanker: boolean;
    appliedBanker: boolean;
    /**可以下注的最少金币 */
    betLowLimit: number;
    constructor(opts) {
        super(opts);
        this.playerGold = 0;
        this.betLowLimit = opts.betLowLimit || 0;                    // 可以下注的最少金币
        this.isBetState = false;                                    // 是否可以下注
        this.playRound = 0;                                         // 当前轮数
        this.leaveRound = commonUtil.randomFromRange(10, 50);      // 离开轮数
        this.isBanker = false;                                      // 是否是庄家
        this.appliedBanker = false;                                 // 是否申请过上庄

    }

    // 刚进游戏时加载一次
    async baiJiaLeLoaded(param) {
        try {
            const dataFromLoaded = await this.requestByRoute("buyu.mainHandler.loaded", param);
            return Promise.resolve("");
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // 机器人离开游戏
    async destroy() {
        this.isBetState = false;
        this.leaveGameAndReset();
    }

    // 收到通知后处理
    registerListener() {

    }
}
