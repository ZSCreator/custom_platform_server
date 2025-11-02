'use strict';

// 十三张机器人
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import * as robotConst from "../../../../consts/robotConst";
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);
import utils = require('../../../../utils');
import * as commonUtil from "../../../../utils/lottery/commonUtil";
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import * as cpConst from "../cpConst";


export default class cpRobot extends BaseRobot {
    playRound: number;
    leaveRound: number;
    seat: number;
    /**进入房间的初始金币 */
    initGold: number;
    /**应该离开游戏 */
    shouldLeave: boolean = false;
    constructor(opts: any) {
        super(opts);
        this.playRound = 0;                                     // 当前轮数
        this.leaveRound = commonUtil.randomFromRange(5, 10);    // 离开轮数
        this.seat = opts.seat;                                  // 座位号
    }

    /**加载 */
    async chinesePokerLoaded() {
        try {
            const loadedData = await this.requestByRoute('chinese_poker.mainHandler.loaded', { roomId: this.roomId });
            this.seat = loadedData.seat;
        } catch (error) {
            robotlogger.warn(`chinesePokerLoaded|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${error}`);
            return Promise.reject(error);
        }
    }

    // 注册监听器
    registerListener() {
        // 发牌
        this.Emitter.on("poker_onDeal", this.onChinesePokerDeal.bind(this));
        // 结算
        this.Emitter.on("poker_onSettlement", (settleData) => {
            this.onChinesePokerSettle(settleData);
        });
    }

    // 发牌
    async onChinesePokerDeal(dealData: cpConst.Ipoker_onDeal) {
        const selfItem = dealData.players;
        if (!selfItem) {
            return;
        }
        const allCards = selfItem.card_arr;
        if (!Array.isArray(allCards) || !allCards.length) {
            return;
        }
        const cards = allCards.map(info => info.type[0]);
        const maxTip = cards.indexOf(Math.max.apply(Math, cards));
        await this.delayRequest("chinese_poker.mainHandler.BiPai", {
            roomId: this.roomId,
            cards: allCards[maxTip].cards
        }, commonUtil.randomFromRange(5000, 10000));
    }

    /**
     * 结算，注：结算的时候只是设置是否可以离开（shouldLeave），需要在收到 poker_onCanReady 通知的时候再调用离开的方法，否则开牌会卡住
     * @param settleData 
     */
    async onChinesePokerSettle(settleData: cpConst.Ipoker_onSettlement) {
        setTimeout(() => {
            this.destroy();
        }, utils.random(1, 3) * 10);
    }

    // 离开
    async destroy() {
        await this.leaveGameAndReset(false);
    }
}
