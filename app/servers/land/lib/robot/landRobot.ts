'use strict';

import events = require('events');
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import hallConst = require("../../../../consts/hallConst");
import * as robotConst from "../../../../consts/robotConst";
import * as commonUtil from "../../../../utils/lottery/commonUtil";
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import * as land_interface from "../land_interface"
import land_Logic = require('../land_Logic');
import utils = require('../../../../utils');
// const CC_DEBUG = true;
/**
 * 斗地主机器人
 */
export default class DouDiZhuRobot extends BaseRobot {
    playRound: number = 0;
    leaveRound: number = commonUtil.randomFromRange(1, 10);
    seat: number = -1;
    playerGold: number = 0;

    friendSeat: number = -1;
    Previous_seat: number = -1;
    Next_seat: number = -1;

    land_onPostCard: land_interface.Iddz_onPostCard;
    speakData: land_interface.Iddz_onFahua = null;
    players: { seat: number, cards_len: number, friendSeat: number }[] = [];
    record_history: { uid: string, oper_type: string, update_time: string }[] = [];
    constructor(opts: any) {
        super(opts);
    }

    /**刚进入斗地主 */
    async ddzLoaded() {
        try {
            const loadedData: land_interface.land_mainHandler_loaded
                = await this.requestByRoute('land.mainHandler.loaded', {});
            this.seat = loadedData.seat;
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**离开 */
    async destroy() {
        this.leaveGameAndReset(false);
    }

    /**注册消息通知 */
    registerListener() {
        // 监听结算
        this.Emitter.on('land_onSettlement', this.onSettlement.bind(this));
        // 监听抢地主结果
        this.Emitter.on('land_qiang', this.robDeal.bind(this));
        // 监听发牌
        this.Emitter.on('ddz_onDeal', () => {
            // this.onStartDeal();
        });
        // 监听发话
        this.Emitter.on('ddz_onFahua', this.on_msg_oper.bind(this));
        // 监听出牌
        this.Emitter.on('ddz_onPostCard', this.onPostCard.bind(this));

    }


    /**结算 */
    onSettlement(data: land_interface.Iland_onSettlement) {
        setTimeout(() => {
            this.destroy();
        }, utils.random(1, 3) * 10);
    }

    /** 发话*/
    async on_msg_oper(data: land_interface.Iddz_onFahua) {
        const time = `${utils.random(0, 9)}${utils.random(0, 9)}${utils.random(0, 9)}${utils.random(0, 9)}`;
        try {
            this.record_history.push({ uid: `${data.curr_doing_uid}`, oper_type: `${data.status}|on_msg_oper|${time}`, update_time: utils.cDate() });
            // 发话人不是自己
            if (data.curr_doing_seat != this.seat) {
                return;
            }
            this.speakData = data;
            if (data.status == "CPoints") {
                // 抢地主的分数
                let points = commonUtil.randomFromRange(0, 2);
                if (points <= data.fen) {
                    points = 0;
                }
                // 抢地主
                let res = await this.delayRequest('land.mainHandler.qiangCard', { points }, commonUtil.randomFromRange(3000, 5000));
                this.record_history.push({ uid: `${data.curr_doing_uid}`, oper_type: `qiangCard|${time}`, update_time: utils.cDate() });
                if (res.code != 200) {
                    robotlogger.warn(this.nickname, res);
                }
            } else if (data.status == 'INGAME') {
                // 获取出牌的数据
                let notices = this.getDDZPostcard(data);
                let cards = notices.cards;
                let cardType = notices.type;
                let delayTime = commonUtil.randomFromRange(3000, 4500);
                let res = await this.delayRequest('land.mainHandler.postCard', { cards: cards, cardType }, delayTime);
                this.record_history.push({ uid: `${data.curr_doing_uid}`, oper_type: `postCard|${time}`, update_time: utils.cDate() });
                if (res.code == 500) {
                    throw res;
                }
            }
        } catch (error) {
            robotlogger.warn(`land|oper|${this.uid}|${time}|${JSON.stringify(error)}|${utils.cDate()}`);
            // const record_history = this.record_history.slice(-6);
            // for (const oper of record_history) {
            //     robotlogger.warn(`${oper.uid}|${oper.oper_type}|${oper.update_time}`);
            // }
        }
    }

    /**
     * 对抢地主的结果进行处理
     * @param data
     */
    async robDeal(data: land_interface.Iland_qiang) {
        this.friendSeat = -1;
        const land_seat = data.land_seat;
        this.players = [
            { seat: 0, cards_len: 0, friendSeat: -1 },
            { seat: 1, cards_len: 0, friendSeat: -1 },
            { seat: 2, cards_len: 0, friendSeat: -1 },
        ]
        this.Previous_seat = (this.seat - 1) < 0 ? 2 : this.seat - 1;
        this.Next_seat = (this.seat + 1) > 2 ? 0 : this.seat + 1;
        if (this.seat != land_seat) {
            this.friendSeat = [0, 1, 2].find(s => s !== land_seat && s !== this.seat);
            let delayTime = commonUtil.randomFromRange(500, 4000);
            await this.delayRequest('land.mainHandler.double', { double: 1 }, delayTime);
        }
    }

    /**
     * 监听出牌数据
     * @param data
     */
    onPostCard(data: land_interface.Iddz_onPostCard) {
        this.land_onPostCard = data;
        this.players[data.seat].cards_len = data.cards_len;
    }

    /**拆牌 */
    robotChaiPai() {
        let res: { type: number, cards: number[] }[] = [];
        do {
            /**自己手牌 */
            let cardsList: number[] = this.speakData.isRobotData;
            /**上一个玩家的牌 */
            let last_pkg = this.speakData.lastDealPlayer.cards;
            if (this.speakData.lastDealPlayer.seat == this.seat) {
                res = land_Logic.chaipai_1(cardsList, []);
                break;
            }
            let cardsTables = land_Logic.chaipai_1(cardsList, []);
            cardsTables = cardsTables.filter(m => land_Logic.isOverPre(m.cards, last_pkg));


            res = land_Logic.chaipai_2(cardsList, last_pkg);
            res.unshift(...cardsTables);
            break;
        } while (true);
        return res;
    }
    /**
    * 获取出牌的类型和
    * @param cardList cardList 玩家剩余手牌
    * @returns 1-54
    */
    getDDZPostcard(data: land_interface.Iddz_onFahua) {
        // CC_DEBUG && console.warn(this.nickname);
        let notices = this.robotChaiPai();
        // 如果是首家出牌，就出最小的一张
        if (notices.length == 0) {
            // CC_DEBUG && console.warn(this.nickname, "不要起");
            return { type: land_Logic.CardsType.CHECK_CALL, cards: [] };
        }



        if (data.lastDealPlayer.seat == this.seat) {
            // CC_DEBUG && console.warn(this.nickname, "自己首发");
            /**自己不是地主地时候 下一家是敌人,且只有一张牌地时候 优先出 非单张*/
            if (this.Next_seat != this.friendSeat && this.players[this.Next_seat].cards_len == 1) {
                notices = this.getLenMax(notices);
                return notices[0];
            }
            let res = this.getPower(notices).sort((a, b) => a.friendly - b.friendly);
            return { cards: res[0].cards, type: res[0].type };
        }
        /**非友军 */
        if (data.lastDealPlayer.seat != this.friendSeat) {
            // CC_DEBUG && console.warn(this.nickname, "非友军");
            let res = this.getPower(notices).sort((a, b) => a.friendly - b.friendly);
            return { cards: res[0].cards, type: res[0].type };
        }

        /**友军 */
        switch (data.lastDealPlayer.cardType) {
            // 如果是单张 A及以上不出牌
            case land_Logic.CardsType.Single:/**大于K */
                let v = land_Logic.getCardValue(data.lastDealPlayer.cards[0]);
                if (v < land_Logic.enum_Value.ValueT) {
                    // CC_DEBUG && console.warn(this.nickname, "友军", land_Logic.getCardValue(data.lastDealPlayer.cards[0]));
                    if (this.Next_seat != this.friendSeat && this.players[this.Next_seat].cards_len == 1) {
                        notices = this.getLenMax(notices);
                    }
                    return notices[0];
                }
                break;
            // 如果是对子 J以上不出牌
            case land_Logic.CardsType.DOUBLE:
                let V = land_Logic.getCardValue(data.lastDealPlayer.cards[0]);
                if (V < land_Logic.enum_Value.ValueT) {
                    // CC_DEBUG && console.warn(this.nickname, "友军", land_Logic.getCardValue(data.lastDealPlayer.cards[0]));
                    if (this.Next_seat != this.friendSeat && this.players[this.Next_seat].cards_len == 1) {
                        notices = this.getLenMax(notices);
                    }
                    return notices[0];
                }
                break;
            default:
        }
        // CC_DEBUG && console.warn(this.nickname, "友军", "不接", land_Logic.getCardValue(data.lastDealPlayer.cards[0]));
        return { type: land_Logic.CardsType.CHECK_CALL, cards: [] };
    };

    /**引入好感度概念,优先打好高度低的牌 */
    getPower(notices: { type: number, cards: number[] }[]) {
        let data: { type: number, cards: number[], friendly: number }[] = [];
        for (const iterator of notices) {
            switch (iterator.type) {
                case land_Logic.CardsType.Single:
                    {
                        let Value = land_Logic.getCardValue(iterator.cards[0]);
                        data.push({ type: iterator.type, cards: iterator.cards, friendly: Value });
                    }
                    break;
                case land_Logic.CardsType.DOUBLE:
                    {
                        let Value = land_Logic.getCardValue(iterator.cards[0]);
                        if (Value > land_Logic.enum_Value.ValueT) {
                            data.push({ type: iterator.type, cards: iterator.cards, friendly: Value * 0.8 });
                        } else {
                            data.push({ type: iterator.type, cards: iterator.cards, friendly: Value * 1.1 });
                        }
                    }
                    break;
                case land_Logic.CardsType.SHUN:
                    {
                        let Value = land_Logic.getCardValue(iterator.cards[0]);
                        if (Value > land_Logic.enum_Value.ValueT) {
                            data.push({ type: iterator.type, cards: iterator.cards, friendly: Value * 0.09 });
                        } else {
                            data.push({ type: iterator.type, cards: iterator.cards, friendly: Value * 0.12 });
                        }
                    }
                    break;
                default:
                    {
                        data.push({ type: iterator.type, cards: iterator.cards, friendly: 1000 });
                    }
                    break;
            }
        }
        return data;
    }
    /**过滤 长度 大小 在敌人牌少的时候 干预 */
    getLenMax(notices: { type: number, cards: number[] }[]) {
        notices.sort((a, b) => {
            if (b.cards.length > 1) {
                return b.cards.length - a.cards.length
            }
            return land_Logic.getCardValue(b.cards[0]) - land_Logic.getCardValue(a.cards[0]);
        });
        return notices;
    }
}

