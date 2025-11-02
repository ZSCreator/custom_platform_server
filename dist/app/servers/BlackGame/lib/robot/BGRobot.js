"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const BG_logic = require("../BG_logic");
const pl_totalBets = [];
class TTZRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.playerGold = 0;
        this.banker_cards = [];
        this.area_list = {};
        for (let idx = 0; idx < 5; idx++) {
            this.area_list[idx] = [];
        }
    }
    async ttzLoaded() {
        try {
            const data = await this.requestByRoute(`BlackGame.mainHandler.loaded`, {});
            let Me = data.players.find(c => c && c.uid == this.uid);
            this.seat = Me.seat;
            this.lowBet = data.roomInfo.lowBet;
            this.playerGold = Me.gold;
            return Promise.resolve();
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async destroy() {
        await this.leaveGameAndReset(false);
    }
    registerListener() {
        this.Emitter.on(`BlackGame.start`, this.BlackGame_start.bind(this));
        this.Emitter.on("BlackGame.deal", this.on_deal.bind(this));
        this.Emitter.on("BlackGame.oper", this.onTTZ_Start.bind(this));
        this.Emitter.on("BlackGame.settlement", this.onSettlement.bind(this));
        this.Emitter.on("BlackGame.action_first", this.on_first.bind(this));
    }
    async onTTZ_Start(data) {
        if (data.seat == this.seat) {
            let delayTime = commonUtil.randomFromRange(2000, 3000);
            let random = commonUtil.randomFromRange(1, 100);
            const bet = data.area_list[data.location][data.idx].bet;
            const cards = data.area_list[data.location][data.idx].cards;
            const result = BG_logic.get_Points(cards, false);
            const banker_result = BG_logic.get_Points(this.banker_cards, false);
            if (data.insurance && data.insurance_bet == -1) {
                let opts = { flag: false };
                if (result.Points == 21 ||
                    result.Points == 20 && random <= 90 ||
                    result.Points == 19 && random <= 70 ||
                    result.Points == 18 && random <= 50 ||
                    result.Points == 17 && random <= 50 ||
                    result.Points <= 16 && random <= 10) {
                    opts = { flag: true };
                }
                if (this.playerGold < bet / 2) {
                    opts = { flag: false };
                }
                if (opts.flag) {
                    this.playerGold -= bet / 2;
                }
                try {
                    const res = await this.delayRequest(`BlackGame.mainHandler.insurance`, opts, delayTime);
                }
                catch (error) {
                    console.warn("--");
                }
                return;
            }
            let oper_type = "";
            if (data.separatePoker) {
                const value = BG_logic.Card2RealCard[cards[0]];
                if (value == "2" && banker_result.Points <= 7) {
                    oper_type = random <= 90 ? "split" : "hit";
                }
                else if (value == "3" && banker_result.Points <= 7) {
                    oper_type = random <= 90 ? "split" : "hit";
                }
                else if (value == "4" && (banker_result.Points == 5 || banker_result.Points == 6)) {
                    oper_type = "split";
                }
                else if (value == "5" && banker_result.Points <= 7) {
                    oper_type = random <= 80 ? "double" : "hit";
                }
                else if (value == "6" && banker_result.Points <= 6) {
                    oper_type = random <= 90 ? "split" : "hit";
                }
                else if (value == "7" && banker_result.Points <= 7) {
                    oper_type = random <= 90 ? "split" : "hit";
                }
                else if (value == "8") {
                    oper_type = "split";
                }
                else if (value == "9" && banker_result.Points <= 6) {
                    oper_type = random <= 90 ? "split" : "stand";
                }
                else if (value == "9" && banker_result.Points >= 7) {
                    oper_type = random <= 90 ? "stand" : "split";
                }
                else if (value == "10" && banker_result.Points >= 7) {
                    oper_type = "stand";
                }
                else if (value == "A") {
                    oper_type = "split";
                }
            }
            const first = BG_logic.getCardValue(cards[0]);
            const second = BG_logic.getCardValue(cards[1]);
            if (oper_type == "") {
                if (cards.length == 2 && (first == 1 || second == 1)) {
                    const Ace_not = first == 1 ? second : first;
                    if (2 <= Ace_not && Ace_not <= 5) {
                        if (4 < banker_result.Points && banker_result.Points < 7) {
                            oper_type = random <= 90 ? "double" : "hit";
                        }
                        else
                            oper_type = random <= 10 ? "double" : "hit";
                    }
                    else if (Ace_not == 6) {
                        if (2 < banker_result.Points && banker_result.Points < 7) {
                            oper_type = random <= 90 ? "double" : "hit";
                        }
                        else {
                            oper_type = random <= 10 ? "double" : "hit";
                        }
                    }
                    else if (Ace_not == 7) {
                        if (2 < banker_result.Points && banker_result.Points < 7) {
                            oper_type = random <= 90 ? "double" : "hit";
                        }
                        else if (banker_result.Points == 2 || banker_result.Points == 7 || banker_result.Points == 8) {
                            oper_type = random <= 90 ? "double" : "hit";
                        }
                    }
                    else if (Ace_not == 8 || Ace_not == 9) {
                        oper_type = random <= 90 ? "stand" : "hit";
                    }
                }
                if (oper_type == "") {
                    if (result.Points <= 8) {
                        oper_type = "hit";
                    }
                    else if (result.Points == 9) {
                        oper_type = random <= 40 ? "double" : "hit";
                    }
                    else if (result.Points == 10) {
                        oper_type = random <= 80 ? "double" : "hit";
                    }
                    else if (result.Points == 11) {
                        oper_type = random <= 90 ? "double" : "hit";
                    }
                    else if (result.Points == 12) {
                        oper_type = random <= 50 ? "stand" : "hit";
                    }
                    else if (result.Points == 13) {
                        if (2 <= banker_result.Points && banker_result.Points <= 6) {
                            oper_type = random <= 60 ? "stand" : "hit";
                        }
                        else {
                            oper_type = random <= 40 ? "stand" : "hit";
                        }
                    }
                    else if (result.Points == 14) {
                        if (2 <= banker_result.Points && banker_result.Points <= 6) {
                            oper_type = random <= 70 ? "stand" : "hit";
                        }
                        else {
                            oper_type = random <= 90 ? "hit" : "stand";
                        }
                    }
                    else if (result.Points == 15) {
                        if (2 <= banker_result.Points && banker_result.Points <= 6) {
                            oper_type = random <= 80 ? "stand" : "hit";
                        }
                        else {
                            oper_type = random <= 90 ? "hit" : "stand";
                        }
                    }
                    else if (result.Points == 16) {
                        if (2 <= banker_result.Points && banker_result.Points <= 6) {
                            oper_type = random <= 90 ? "stand" : "hit";
                        }
                        else {
                            oper_type = random <= 90 ? "hit" : "stand";
                        }
                    }
                    else {
                        oper_type = "stand";
                    }
                }
            }
            try {
                if (oper_type == "double" && cards.length > 2) {
                    oper_type = "hit";
                }
                if (this.playerGold < bet && (oper_type == "split" || oper_type == "double")) {
                    oper_type = "hit";
                }
                if (oper_type == "hit") {
                    const res = await this.delayRequest(`BlackGame.mainHandler.getOnePoker`, {}, delayTime);
                }
                else if (oper_type == "stand") {
                    const res = await this.delayRequest(`BlackGame.mainHandler.action_stop_getCard`, {}, delayTime);
                }
                else if (oper_type == "double") {
                    this.playerGold -= bet;
                    const res = await this.delayRequest(`BlackGame.mainHandler.addMultiple`, {}, delayTime);
                }
                else if (oper_type == "split") {
                    this.playerGold -= bet;
                    const res = await this.delayRequest(`BlackGame.mainHandler.separatePoker`, {}, delayTime);
                }
                else {
                    console.warn("BlackGame,error22", oper_type, cards.map(c => BG_logic.Card2RealCard[c]).toString());
                }
            }
            catch (error) {
                console.warn("BlackGame,error", error, bet, oper_type, cards.map(c => BG_logic.Card2RealCard[c]).toString());
            }
        }
    }
    on_deal(data) {
        this.banker_cards = data.banker_cards;
    }
    onSettlement() {
        let pl_totalBet = pl_totalBets.find(m => m.roomId == this.roomId);
        if (pl_totalBet) {
            pl_totalBet.totalBet = 0;
            pl_totalBet.flag = false;
        }
    }
    on_first(data) {
        this.area_list[data.location] = [{ uid: data.uid }];
    }
    BlackGame_start({ auto_time }) {
        this.auto_time = new Date() + auto_time;
        let delayTime = commonUtil.randomFromRange(2000, 8000);
        this.action_bet(this.seat, delayTime);
        setTimeout(() => {
            const random = commonUtil.randomFromRange(1, 100);
            if (random <= 10) {
                for (let key in this.area_list) {
                    const temp_areaList = this.area_list[key];
                    if (temp_areaList.length == 0) {
                        delayTime = commonUtil.randomFromRange(1000, 15000 - 9000);
                        this.action_bet(parseInt(key), delayTime);
                    }
                }
            }
        }, 8 * 1000);
    }
    async action_bet(seat, delayTime) {
        let opts = { location: seat, bet: this.lowBet };
        const random = commonUtil.randomFromRange(1, 100);
        opts.bet = opts.bet * random;
        while (opts.bet > this.playerGold) {
            opts.bet -= this.lowBet;
        }
        if (opts.bet >= this.lowBet) {
            this.playerGold -= opts.bet;
            try {
                const data = await this.delayRequest(`BlackGame.mainHandler.first_bet`, opts, delayTime);
            }
            catch (error) {
            }
        }
    }
}
exports.default = TTZRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQkdSb2JvdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0JsYWNrR2FtZS9saWIvcm9ib3QvQkdSb2JvdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDJFQUF3RTtBQUV4RSxtRUFBb0U7QUFJcEUsd0NBQXlDO0FBSXpDLE1BQU0sWUFBWSxHQUF3RCxFQUFFLENBQUM7QUFLN0UsTUFBcUIsUUFBUyxTQUFRLHFCQUFTO0lBYTNDLFlBQVksSUFBSTtRQUNaLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQWJoQixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBQ3ZCLGlCQUFZLEdBQWEsRUFBRSxDQUFDO1FBSzVCLGNBQVMsR0FJTCxFQUFFLENBQUM7UUFJSCxLQUFLLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQzVCO0lBQ0wsQ0FBQztJQUdELEtBQUssQ0FBQyxTQUFTO1FBQ1gsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyw4QkFBOEIsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMzRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7WUFDcEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUNuQyxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7WUFDMUIsT0FBTyxPQUFP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