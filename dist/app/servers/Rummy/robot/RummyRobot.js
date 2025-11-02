"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../common/pojo/baseClass/BaseRobot");
const CommonUtil = require("../../../utils/lottery/commonUtil");
const constants_1 = require("../lib/constants");
const cardTypeUtils = require("../robot/cardTypeUtils");
const RummyLogic = require("../lib/RummyLogic");
const CC_DEBUG = false;
var RequestRoute;
(function (RequestRoute) {
    RequestRoute["playerGetlostCard"] = "Rummy.mainHandler.playerGetlostCard";
    RequestRoute["getPokerListCard"] = "Rummy.mainHandler.getPokerListCard";
    RequestRoute["lostCard"] = "Rummy.mainHandler.lostCard";
    RequestRoute["loaded"] = "Rummy.mainHandler.loaded";
    RequestRoute["grop"] = "Rummy.mainHandler.grop";
    RequestRoute["shaw"] = "Rummy.mainHandler.shaw";
    RequestRoute["playerOtherPostCardsList"] = "Rummy.mainHandler.playerOtherPostCardsList";
    RequestRoute["start"] = "Rummy.mainHandler.start";
})(RequestRoute || (RequestRoute = {}));
class RummyRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.playerGold = 0;
        this.round = 0;
        this.playerSet = 0;
        this.cards = [];
        this.cardsList = [];
        this.profit = 0;
        this.point = 0;
        this.gropPoint = 0;
        this.isGetCard = false;
        this.pokerList = [];
        this.winPlayer = 0;
        this.needCards = [];
        this.loseCards = [];
        this.whichSet = 0;
        this.lostCards = [];
        this.status = constants_1.RoomState.NONE;
    }
    async finishInit() {
        this.round = 0;
        this.cards = [];
        this.cardsList = [];
        this.profit = 0;
        this.point = 0;
        this.gropPoint = 0;
        this.isGetCard = false;
        this.changeCard = null;
        this.firstCard = null;
        this.whichSet = -1;
        this.changeCardList = [];
        this.lostCards = [];
        this.status = constants_1.RoomState.NONE;
        this.lastCard = null;
        this.needCards = [];
        this.loseCards = [];
    }
    async load() {
        try {
            const loadedData = await this.requestByRoute(RequestRoute.loaded, {});
            this.playerSet = loadedData.pl.playerSet;
            this.uid = loadedData.pl.uid;
            return Promise.resolve();
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async destroy() {
        CC_DEBUG && console.warn("机器人调用断线", this.uid);
        await this.leaveGameAndReset(false);
        return;
    }
    registerListener() {
        this.Emitter.on(constants_1.MsgRoute.RUMMY_START_FAPAI, (data) => this.getStartPlayerCard(data));
        this.Emitter.on(constants_1.MsgRoute.RUMMY_PLAY, (data) => this.robotLoseCard(data));
        this.Emitter.on(constants_1.MsgRoute.RUMMY_LOST_CARD, (data) => this.rummyLostCard(data));
        this.Emitter.on(constants_1.MsgRoute.RUMMY_SHAW, (data) => this.playerOtherPostCardsList(data));
        this.Emitter.on(constants_1.MsgRoute.RUMMY_REALPLAYER_READY, (data) => this.robotSendAward(data));
        this.Emitter.on(constants_1.MsgRoute.RUMMY_CHANGE_CARDS, (data) => this.changeRobotCardsList(data));
        this.Emitter.on(constants_1.MsgRoute.RUMMY_READY, (data) => this.getReady(data));
    }
    async getReady(data) {
        this.status = data.status;
        CC_DEBUG && console.warn("机器人准备阶段:", this.uid, this.sceneId, this.roomId);
        return;
    }
    async getStartPlayerCard(data) {
        this.cards = data.cards;
        this.changeCard = data.changeCard;
        this.changeCardList = data.changeCardList;
        this.firstCard = data.firstCard;
        this.lostCards = data.lostCards;
        this.status = data.status;
        this.winPlayer = data.winPlayer;
        const result = cardTypeUtils.robotCardsToCombination(this.cards, this.changeCardList);
        this.cardsList = result.cardTypeList;
        this.needCards = result.needCards;
        this.cards = result.cards;
        CC_DEBUG && console.warn("机器人uid:", this.uid, "机器人的牌", this.cardsList, "变牌：", this.changeCardList, "cards:", this.cards, "winPlayer:", this.winPlayer, "玩家需要的牌组：", this.needCards);
        return;
    }
    async robotLoseCard(data) {
        this.whichSet = data.whichSet;
        this.round = data.round;
        if (this.status !== constants_1.RoomState.PLAY_CARD) {
            CC_DEBUG && console.warn(`房间状态不是打牌阶段不能说话:uid:${this.uid},`);
            return;
        }
        CC_DEBUG && console.warn(`机器人发话系统uid :${this.uid},whichSet:${this.whichSet},机器人位置：${this.playerSet}`);
        if (this.whichSet == this.playerSet) {
            let needCard = null;
            if (this.lostCards.length > 0) {
                needCard = this.lostCards[this.lostCards.length - 1];
            }
            else {
                needCard = this.firstCard;
            }
            let card = null;
            if ([52, 53].includes(needCard) || this.changeCardList.includes(needCard) || this.needCards.includes(needCard)) {
                let delayTime = CommonUtil.randomFromRange(1000, 2000);
                if (this.round == 1) {
                    delayTime = 6000;
                }
                let lostdata = await this.delayRequest(RequestRoute.playerGetlostCard, {}, delayTime);
                CC_DEBUG && console.warn("机器人uid:", this.uid, "机器人从废牌要的牌", lostdata, "回合:", this.round);
                if (lostdata.code == 200) {
                    card = lostdata.card;
                    this.cards.push(card);
                }
            }
            else {
                let delayTime = CommonUtil.randomFromRange(1000, 2000);
                if (this.round == 1) {
                    delayTime = 6000;
                }
                let getCardData = await this.delayRequest(RequestRoute.getPokerListCard, {}, delayTime);
                CC_DEBUG && console.warn("机器人uid:", this.uid, "机器人要的牌", getCardData, "回合:", this.round);
                if (getCardData.code == 200) {
                    card = getCardData.card;
                    this.cards.push(card);
                }
            }
            const { cards, loseCard, cardTypeList, needCards } = cardTypeUtils.robotCardsToCombination(this.cards, this.changeCardList, card);
            this.cards = cards;
            this.cardsList = cardTypeList;
            this.needCards = needCards;
            let lastCard = loseCard;
            CC_DEBUG && console.warn("机器人uid:", this.uid, "机器人要丢的牌,lostCard", loseCard, "回合:", this.round);
            CC_DEBUG && console.warn("机器人uid:", this.uid, "机器人要丢完牌的牌组cardsList", cardTypeList, "机器人变牌", this.changeCardList, "回合:", this.round);
            CC_DEBUG && console.warn("机器人uid:", this.uid, "机器人丢完牌的cards", cards, "回合:", this.round);
            CC_DEBUG && console.warn("机器人uid:", this.uid, "机器人丢完牌的needCards", needCards, "回合:", this.round);
            const point = RummyLogic.calculatePlayerPoint(cardTypeList, this.changeCardList);
            let delayTime1 = CommonUtil.randomFromRange(2000, 8000);
            if (this.winPlayer == 1) {
                let robotGop = cardTypeUtils.robotGrop(point, this.cards, this.cardsList, this.changeCardList, this.round);
                if (robotGop) {
                    await this.delayRequest(RequestRoute.grop, { cardsList: this.cardsList, card: lastCard }, delayTime1);
                    CC_DEBUG && console.warn("机器人uid:", this.uid, '机器人弃牌 cardsList:', this.cardsList, 'round:', this.round);
                }
            }
            if (point == 0) {
                await this.delayRequest(RequestRoute.shaw, { cardsList: this.cardsList, card: lastCard }, delayTime1);
                CC_DEBUG && console.warn("机器人uid:", this.uid, "回合:", this.round, '机器人胡牌 cardsList:', this.cardsList, 'lostCard:', lastCard);
            }
            else {
                await this.delayRequest(RequestRoute.lostCard, { cardsList: this.cardsList, card: lastCard, point }, delayTime1);
                this.lastCard = lastCard;
                CC_DEBUG && console.warn("机器人uid:", this.uid, "回合:", this.round, '机器人丢牌 :', this.lastCard, '丢了牌过后:', this.cardsList);
            }
        }
        else {
            CC_DEBUG && console.warn(`不该这个机器人说话uid:${this.uid}`);
            return;
        }
    }
    async rummyLostCard(data) {
        this.lostCards = data.lostCards;
        CC_DEBUG && console.warn("机器人uid:", this.uid, '机器人监听到的丢牌 lostCards:', this.lostCards);
        return;
    }
    async playerOtherPostCardsList(data) {
        if (data.playerSet == this.playerSet) {
            return;
        }
        let delayTime = CommonUtil.randomFromRange(1000, 2000);
        await this.delayRequest(RequestRoute.playerOtherPostCardsList, { cardsList: this.cardsList }, delayTime);
        return;
    }
    async robotSendAward(data) {
        await this.finishInit();
        CC_DEBUG && console.warn("机器人uid:", this.uid, `机器人监听到的派奖结束点击开始 lostCards:${this.lostCards}`);
        return;
    }
    async changeRobotCardsList(data) {
        CC_DEBUG && console.warn("机器人uid:", this.uid, "机器人监听：", data.cards, '.....', data.cardsList);
        this.cards = data.cards;
        this.cardsList = data.cardsList;
        return;
    }
}
exports.default = RummyRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUnVtbXlSb2JvdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL1J1bW15L3JvYm90L1J1bW15Um9ib3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3RUFBcUU7QUFDckUsZ0VBQWdFO0FBQ2hFLGdEQUF1RDtBQUV2RCx3REFBd0Q7QUFDeEQsZ0RBQWdEO0FBQ2hELE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQztBQUl2QixJQUFLLFlBU0o7QUFURCxXQUFLLFlBQVk7SUFDYix5RUFBeUQsQ0FBQTtJQUN6RCx1RUFBdUQsQ0FBQTtJQUN2RCx1REFBdUMsQ0FBQTtJQUN2QyxtREFBbUMsQ0FBQTtJQUNuQywrQ0FBK0IsQ0FBQTtJQUMvQiwrQ0FBK0IsQ0FBQTtJQUMvQix1RkFBdUUsQ0FBQTtJQUN2RSxpREFBaUMsQ0FBQTtBQUNyQyxDQUFDLEVBVEksWUFBWSxLQUFaLFlBQVksUUFTaEI7QUFLRCxNQUFxQixVQUFXLFNBQVEscUJBQVM7SUEwQzdDLFlBQVksSUFBSTtRQUNaLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQTFDaEIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUV2QixVQUFLLEdBQVcsQ0FBQyxDQUFDO1FBRWxCLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFFdEIsVUFBSyxHQUFhLEVBQUUsQ0FBQztRQUVyQixjQUFTLEdBQVUsRUFBRSxDQUFDO1FBRXRCLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFFbkIsVUFBSyxHQUFXLENBQUMsQ0FBQztRQUVsQixjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBRXRCLGNBQVMsR0FBWSxLQUFLLENBQUM7UUFrQjNCLGNBQVMsR0FBYSxFQUFFLENBQUM7UUFFekIsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUV0QixjQUFTLEdBQWEsRUFBRSxDQUFDO1FBRXpCLGNBQVMsR0FBYSxFQUFFLENBQUM7UUFHckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7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