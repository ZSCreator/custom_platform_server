'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const land_Logic = require("../land_Logic");
const utils = require("../../../../utils");
class DouDiZhuRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.playRound = 0;
        this.leaveRound = commonUtil.randomFromRange(1, 10);
        this.seat = -1;
        this.playerGold = 0;
        this.friendSeat = -1;
        this.Previous_seat = -1;
        this.Next_seat = -1;
        this.speakData = null;
        this.players = [];
        this.record_history = [];
    }
    async ddzLoaded() {
        try {
            const loadedData = await this.requestByRoute('land.mainHandler.loaded', {});
            this.seat = loadedData.seat;
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
    async destroy() {
        this.leaveGameAndReset(false);
    }
    registerListener() {
        this.Emitter.on('land_onSettlement', this.onSettlement.bind(this));
        this.Emitter.on('land_qiang', this.robDeal.bind(this));
        this.Emitter.on('ddz_onDeal', () => {
        });
        this.Emitter.on('ddz_onFahua', this.on_msg_oper.bind(this));
        this.Emitter.on('ddz_onPostCard', this.onPostCard.bind(this));
    }
    onSettlement(data) {
        setTimeout(() => {
            this.destroy();
        }, utils.random(1, 3) * 10);
    }
    async on_msg_oper(data) {
        const time = `${utils.random(0, 9)}${utils.random(0, 9)}${utils.random(0, 9)}${utils.random(0, 9)}`;
        try {
            this.record_history.push({ uid: `${data.curr_doing_uid}`, oper_type: `${data.status}|on_msg_oper|${time}`, update_time: utils.cDate() });
            if (data.curr_doing_seat != this.seat) {
                return;
            }
            this.speakData = data;
            if (data.status == "CPoints") {
                let points = commonUtil.randomFromRange(0, 2);
                if (points <= data.fen) {
                    points = 0;
                }
                let res = await this.delayRequest('land.mainHandler.qiangCard', { points }, commonUtil.randomFromRange(3000, 5000));
                this.record_history.push({ uid: `${data.curr_doing_uid}`, oper_type: `qiangCard|${time}`, update_time: utils.cDate() });
                if (res.code != 200) {
                    robotlogger.warn(this.nickname, res);
                }
            }
            else if (data.status == 'INGAME') {
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
        }
        catch (error) {
            robotlogger.warn(`land|oper|${this.uid}|${time}|${JSON.stringify(error)}|${utils.cDate()}`);
        }
    }
    async robDeal(data) {
        this.friendSeat = -1;
        const land_seat = data.land_seat;
        this.players = [
            { seat: 0, cards_len: 0, friendSeat: -1 },
            { seat: 1, cards_len: 0, friendSeat: -1 },
            { seat: 2, cards_len: 0, friendSeat: -1 },
        ];
        this.Previous_seat = (this.seat - 1) < 0 ? 2 : this.seat - 1;
        this.Next_seat = (this.seat + 1) > 2 ? 0 : this.seat + 1;
        if (this.seat != land_seat) {
            this.friendSeat = [0, 1, 2].find(s => s !== land_seat && s !== this.seat);
            let delayTime = commonUtil.randomFromRange(500, 4000);
            await this.delayRequest('land.mainHandler.double', { double: 1 }, delayTime);
        }
    }
    onPostCard(data) {
        this.land_onPostCard = data;
        this.players[data.seat].cards_len = data.cards_len;
    }
    robotChaiPai() {
        let res = [];
        do {
            let cardsList = this.speakData.isRobotData;
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
    getDDZPostcard(data) {
        let notices = this.robotChaiPai();
        if (notices.length == 0) {
            return { type: land_Logic.CardsType.CHECK_CALL, cards: [] };
        }
        if (data.lastDealPlayer.seat == this.seat) {
            if (this.Next_seat != this.friendSeat && this.players[this.Next_seat].cards_len == 1) {
                notices = this.getLenMax(notices);
                return notices[0];
            }
            let res = this.getPower(notices).sort((a, b) => a.friendly - b.friendly);
            return { cards: res[0].cards, type: res[0].type };
        }
        if (data.lastDealPlayer.seat != this.friendSeat) {
            let res = this.getPower(notices).sort((a, b) => a.friendly - b.friendly);
            return { cards: res[0].cards, type: res[0].type };
        }
        switch (data.lastDealPlayer.cardType) {
            case land_Logic.CardsType.Single:
                let v = land_Logic.getCardValue(data.lastDealPlayer.cards[0]);
                if (v < land_Logic.enum_Value.ValueT) {
                    if (this.Next_seat != this.friendSeat && this.players[this.Next_seat].cards_len == 1) {
                        notices = this.getLenMax(notices);
                    }
                    return notices[0];
                }
                break;
            case land_Logic.CardsType.DOUBLE:
                let V = land_Logic.getCardValue(data.lastDealPlayer.cards[0]);
                if (V < land_Logic.enum_Value.ValueT) {
                    if (this.Next_seat != this.friendSeat && this.players[this.Next_seat].cards_len == 1) {
                        notices = this.getLenMax(notices);
                    }
                    return notices[0];
                }
                break;
            default:
        }
        return { type: land_Logic.CardsType.CHECK_CALL, cards: [] };
    }
    ;
    getPower(notices) {
        let data = [];
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
                        }
                        else {
                            data.push({ type: iterator.type, cards: iterator.cards, friendly: Value * 1.1 });
                        }
                    }
                    break;
                case land_Logic.CardsType.SHUN:
                    {
                        let Value = land_Logic.getCardValue(iterator.cards[0]);
                        if (Value > land_Logic.enum_Value.ValueT) {
                            data.push({ type: iterator.type, cards: iterator.cards, friendly: Value * 0.09 });
                        }
                        else {
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
    getLenMax(notices) {
        notices.sort((a, b) => {
            if (b.cards.length > 1) {
                return b.cards.length - a.cards.length;
            }
            return land_Logic.getCardValue(b.cards[0]) - land_Logic.getCardValue(a.cards[0]);
        });
        return notices;
    }
}
exports.default = DouDiZhuRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZFJvYm90LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvbGFuZC9saWIvcm9ib3QvbGFuZFJvYm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFHYiwyRUFBd0U7QUFHeEUsbUVBQW1FO0FBQ25FLCtDQUF5QztBQUN6QyxNQUFNLFdBQVcsR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBR3ZELDRDQUE2QztBQUM3QywyQ0FBNEM7QUFLNUMsTUFBcUIsYUFBYyxTQUFRLHFCQUFTO0lBY2hELFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFkaEIsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUN0QixlQUFVLEdBQVcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdkQsU0FBSSxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLGVBQVUsR0FBVyxDQUFDLENBQUM7UUFFdkIsZUFBVSxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLGtCQUFhLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDM0IsY0FBUyxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBR3ZCLGNBQVMsR0FBZ0MsSUFBSSxDQUFDO1FBQzlDLFlBQU8sR0FBOEQsRUFBRSxDQUFDO1FBQ3hFLG1CQUFjLEdBQThELEVBQUUsQ0FBQztJQUcvRSxDQUFDO0lBR0QsS0FBSyxDQUFDLFNBQVM7UUFDWCxJQUFJO1lBQ0EsTUFBTSxVQUFVLEdBQ1YsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLHlCQUF5QixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQy9ELElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztTQUMvQjtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1YsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEdB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