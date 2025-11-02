'use strict';

// 三公机器人
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import sangongConst = require("../sangongConst");
import commonUtil = require("../../../../utils/lottery/commonUtil");
import utils = require("../../../../utils");

import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);

export default class SanGongRobot extends BaseRobot {
    playRound: number;
    /**离开轮数 */
    leaveRound: number;
    /**初始化金币 */
    initGold: number;
    entryCond: number;
    onStartRob_num = 0;
    constructor(opts) {
        super(opts);
        this.playRound = 0;                                     // 当前轮数
        this.leaveRound = commonUtil.randomFromRange(5, 20);    // 
        this.entryCond = 0;                                     // 进入条件
    }

    /**加载 */
    async sanGongLoaded() {
        try {
            const loadedData = await this.requestByRoute('sangong.mainHandler.loaded', {});
            this.entryCond = loadedData.room.players.find(pl => pl && pl.uid == this.uid).gold;
        } catch (error) {
            robotlogger.warn(`chinesePokerLoaded|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${error}`);
            return Promise.reject(error);
        }
    }

    /**离开 */
    destroy() {
        this.leaveGameAndReset(false);
    }

    // 注册监听器
    registerListener() {
        // 抢庄
        this.Emitter.on(sangongConst.route.RobState, this.onStartRob.bind(this));
        // 开始加注
        this.Emitter.on(sangongConst.route.BetState, this.onSanGongBet.bind(this));

        // 提前看牌
        this.Emitter.on(sangongConst.route.LookState, this.onSanGongLook.bind(this));

        // 初始化游戏
        // this.Emitter.on(sangongConst.route.InitGame,this.onInitSanGong.bind(this));

        // 踢下线
        this.Emitter.on(sangongConst.route.KickPlayer, this.onSanGongKick.bind(this));

        this.Emitter.on(sangongConst.route.SettleResult, this.SettleResult.bind(this));
    }

    // 踢掉玩家
    onSanGongKick(onKicked) {
        if (this.uid == onKicked.uid) {
            return this.destroy();
        }
    }

    /**三公 bet */
    async onSanGongBet(onBetData: sangongConst.IBetState) {
        // 处在离开阶段 或 未准备过 或 自己是庄
        if (onBetData.Banker.uid == this.uid) {
            return;
        }
        const selfInfo = onBetData.players.find(pl => pl && pl.uid == this.uid);
        const ran = Math.random();
        let odds = 1;
        if (selfInfo) {
            if (selfInfo.control) {
                odds = 4;
            } else if (ran < 0.1) {
                odds = 4;
            } else if (ran > 0.9 || selfInfo.control) {
                odds = 3;
            } else if (ran >= 0.1 && ran < 0.7) {
                odds = 2;
            } else {
                odds = 1;
            }
            let delayTime = Math.min(commonUtil.randomFromRange(1000, 4000), onBetData.countdown);
            await this.delayRequest('sangong.mainHandler.bet', { odds }, delayTime);
        }
    }

    /**抢庄 */
    async onStartRob(rob) {
        let odds = 0;
        const selfData = rob.players.find(pl => pl && pl.uid == this.uid);
        if (selfData) {
            const ran = Math.random();
            if (ran < 0.85) {
                odds = 1
            }
        }
        let delayTime = commonUtil.randomFromRange(2000, 4000);
        let t1 = utils.cDate();
        this.onStartRob_num++;
        try {
            let res = await this.delayRequest('sangong.mainHandler.robBanker', { odds }, delayTime);
        } catch (error) {
            let t2 = utils.cDate();
            console.warn(`${this.onStartRob_num}||t1:${t1}||||${t2}|||${this.nickname}`);
        }
    }

    /**结算 */
    async SettleResult(data: sangongConst.ISettleResult) {
        setTimeout(() => {
            this.destroy();
        }, utils.random(1, 3) * 10);
    }

    /**提前看牌 */
    async onSanGongLook(onLookData: sangongConst.IlookState) {
        try {
            // 未准备过
            //0  1  2  3  
            let pl = onLookData.players.find(pl => pl && pl.uid == this.uid);
            if (pl) {
                let ran = utils.random(0, 3);
                let delayTime = commonUtil.randomFromRange(0, onLookData.countdown - 2000);
                let res = await this.delayRequest('sangong.mainHandler.openCardType', { location: ran }, delayTime);
            }
        } catch (error) {
            robotlogger.warn("sangongrobot", JSON.stringify(error));
        }
    }
}
