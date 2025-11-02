'use strict';

// 三公机器人
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import baicaoConst = require("../baicaoConst");
import * as commonUtil from "../../../../utils/lottery/commonUtil";
import utils = require('../../../../utils');

import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);

export default class SanGongRobot extends BaseRobot {
    playRound: number;
    /**离开轮数 */
    leaveRound: number;
    playerGold: number;
    initGold: number;
    entryCond: number;
    constructor(opts) {
        super(opts);
        this.playRound = 0;                                     // 当前轮数
        this.leaveRound = commonUtil.randomFromRange(5, 20);    // 
        this.playerGold = 0;                                    // 机器人的金币
        this.initGold = 0;                                      // 进入房间的初始金币
        this.entryCond = 0;                                     // 进入条件
    }

    /**加载 */
    async sanGongLoaded() {
        try {
            const loadedData = await this.requestByRoute('baicao.mainHandler.loaded', {});
            this.entryCond = loadedData.room.players.find(pl => pl && pl.uid == this.uid).gold;
        } catch (error) {
            robotlogger.warn(`baicao|robot|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${error}`);
            return Promise.reject(error);
        }
    }

    /**离开 */
    async destroy() {
        await this.leaveGameAndReset(false);
    }

    // 注册监听器
    registerListener() {
        // 初始化游戏
        this.Emitter.on(baicaoConst.route.SettleResult, initData => {
            this.onInitSanGong(initData);
        });
        // 踢下线
        this.Emitter.on(baicaoConst.route.KickPlayer, onKicked => {
            this.onSanGongKick(onKicked);
        });
    }

    // 踢掉玩家
    onSanGongKick(onKicked) {
        if (this.uid == onKicked.uid) {
            return this.destroy();
        }
    }


    // 初始化游戏
    async onInitSanGong(initData: baicaoConst.IInitGame) {
        setTimeout(() => {
            this.destroy();
        }, utils.random(1, 3) * 10);
    }
}
