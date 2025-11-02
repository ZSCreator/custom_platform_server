'use strict';

import events = require('events');
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import hallConst = require("../../../../consts/hallConst");
import * as robotConst from "../../../../consts/robotConst";
import * as commonUtil from "../../../../utils/lottery/commonUtil";
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);
import * as ld_interface from "../ld_interface"
import ld_Logic = require('../ld_Logic');
import utils = require('../../../../utils');
// const CC_DEBUG = true;
/**
 * 斗地主机器人
 */
export default class DouDiZhuRobot extends BaseRobot {
    playRound: number = 0;
    seat: number = -1;
    playerGold: number = 0;
    cardType: number;
    cards: number[];
    constructor(opts: any) {
        super(opts);
    }

    /**刚进入斗地主 */
    async ddzLoaded() {
        try {
            const loadedData: ld_interface.ld_mainHandler_loaded
                = await this.requestByRoute('LuckyDice.mainHandler.loaded', {});
            // this.seat = loadedData.seat;
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
        this.Emitter.on('ld.onFahua', this.onFahua.bind(this));
        this.Emitter.on('ld.bipai', this.onBipai.bind(this));
    }

    async onFahua(data) {
        for (const pl of data.min_pls) {
            if (pl.uid == this.uid) {
                let dices: number[] = []
                let delayTime = commonUtil.randomFromRange(1000, 5000);
                const alikeCounts = ld_Logic.checkAlike(this.cards);
                if (this.cardType == ld_Logic.CardsType.SINGLE) {
                    this.cards.sort((a, b) => b - a);
                    dices.push(this.cards[0]);
                } else if (this.cardType == ld_Logic.CardsType.DOUBLE) {
                    const Subscript = alikeCounts.find(c => c.count == 2).Subscript;
                    for (const c of Subscript) {
                        dices.push(this.cards[c]);
                    }
                } else if (this.cardType == ld_Logic.CardsType.twodui) {
                    let cardss1: number[] = []
                    for (const cc of alikeCounts.filter(c => c.count == 2)) {
                        for (const c of cc.Subscript) {
                            cardss1.push(this.cards[c]);
                            cardss1.sort((a, b) => b - a);
                        }
                    }
                    for (let index = 0; index < 2; index++) {
                        dices.push(cardss1[index]);
                    }
                } else if (this.cardType == ld_Logic.CardsType.Three ||
                    this.cardType == ld_Logic.CardsType.HuLu) {
                    const Subscript = alikeCounts.find(c => c.count == 3).Subscript;
                    for (const cc of Subscript) {
                        dices.push(this.cards[cc]);
                    }
                } else if (this.cardType == ld_Logic.CardsType.SHUN) {
                } else if (this.cardType == ld_Logic.CardsType.ZaDan) {
                    const Subscript = alikeCounts.find(c => c.count == 4).Subscript;
                    for (const cc of Subscript) {
                        dices.push(this.cards[cc]);
                    }
                } else if (this.cardType == ld_Logic.CardsType.BAOZI) {
                }

                await this.delayRequest('LuckyDice.mainHandler.Keep', { dices: dices }, delayTime);
            }
        }
    }
    onBipai(data: {
        uid: string;
        seat: number;
        cards: number[];
        cardType: number;
        bet: number;
        profit: number;
        totalProfit: number;
        gold: number;
    }[]) {
        for (const pl of data) {
            if (pl && pl.uid == this.uid) {
                this.cardType = pl.cardType;
                this.cards = pl.cards;
            }
        }
    }
}

