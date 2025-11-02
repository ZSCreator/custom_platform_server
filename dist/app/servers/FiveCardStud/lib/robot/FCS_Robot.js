'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const utils = require("../../../../utils");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const FCS_logic = require("../FCS_logic");
const CC_DEBUG = false;
class DZpipeirobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.Cn = 0;
        this.Rn = 0;
        this.CHn = 0;
        this.N = 0;
        this.plys = [];
        this.isFold = false;
        this.isInitLocation = false;
        this.seat = 0;
        this.sceneId = 0;
        this.playerGold = 0;
        this.roundCount = 0;
        this.isTiaokong = false;
        this.maxSeat = -1;
    }
    async loaded() {
        try {
            let data = await this.requestByRoute("FiveCardStud.mainHandler.loaded", {});
            this.sceneId = data.room.sceneId;
            this.lowBet = data.room.lowBet;
            for (let pl of data.players) {
                if (pl && pl.uid == this.uid) {
                    this.seat = pl.seat;
                    this.currGold = pl.currGold;
                    this.canCarryGold = data.room.canCarryGold;
                }
            }
            return Promise.resolve(data);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    registerListener() {
        this.Emitter.on("FiveCardStud.onDeal", this.onDeal.bind(this));
        this.Emitter.on("FiveCardStud.msg_oper_c", this.msg_oper_c.bind(this));
        this.Emitter.on("FiveCardStud.onSettlement", this.onSettlement.bind(this));
        this.Emitter.on("FiveCardStud.onDeal2", this.onDeal2.bind(this));
        this.Emitter.on("FiveCardStud.onOpts", this.onOpts.bind(this));
    }
    onSettlement(data) {
        setTimeout(() => {
            this.destroy();
        }, utils.random(1, 3) * 10);
    }
    onDeal(data) {
        this.holds = data.players.find(c => c && c.uid == this.uid).holds;
        this.HoldsType = FCS_logic.getAiHoldsType(this.holds);
        this.descSortAllPlayer = data.players.map(c => {
            return {
                seat: c.seat,
                uid: c.uid,
                Location: "FP",
                isFold: false,
                holds: c.holds,
                typeSize: 0,
            };
        });
        CC_DEBUG && console.warn(this.uid, this.HoldsType, this.holds.map(c => FCS_logic.pukes[c]));
    }
    onDeal2(data) {
        this.Rn = 0;
        this.CHn = 0;
        this.Cn = 0;
        this.N = 0;
        this.roundCount++;
        this.isInitLocation = false;
        if (this.isFold) {
            return;
        }
        let TheCards = FCS_logic.getPai();
        this.plys = [];
        {
            const list = utils.clone(data.players);
            for (const pl of list) {
                if (!pl)
                    continue;
                for (const card of pl.holds) {
                    for (let index = 0; index < TheCards.length; index++) {
                        const thecard = TheCards[index];
                        if (thecard == card) {
                            TheCards[index] = null;
                            break;
                        }
                    }
                }
                if (pl.isFold)
                    continue;
                this.plys.push({ uid: pl.uid, hand_strength: 0, HoldsType: "", pl1_win: 0, holds: pl.holds, typeSize: 0, isFold: false });
            }
        }
        TheCards = TheCards.filter(c => !!c);
        this.TheCards = TheCards;
        this.calculateType();
    }
    calculateType() {
        if (this.roundCount == 0) {
            return;
        }
        for (const pl of this.plys) {
            pl.hand_strength = 0;
            pl.pl1_win = 0;
            pl.typeSize = 0;
        }
        let total_num = 200;
        for (let index = 0; index < total_num; index++) {
            let temp = this.TheCards.map(c => c);
            temp.sort(() => 0.5 - Math.random());
            const list = utils.clone(this.plys);
            for (const pl of list) {
                pl.holds = pl.holds.filter(c => c != 0x99);
                do {
                    if (pl.holds.length >= 5) {
                        break;
                    }
                    pl.holds.push(temp.shift());
                } while (true);
                pl.typeSize = FCS_logic.sortPokerToType(pl.holds);
            }
            list.sort((a, b) => {
                return b.typeSize - a.typeSize;
            });
            this.plys.find(c => c.uid == list[0].uid).pl1_win++;
        }
        for (const pl of this.plys) {
            const win_Probability = (pl.pl1_win / (total_num / 100));
            if (win_Probability >= 76 && win_Probability <= 99) {
                pl.HoldsType = "Y1";
            }
            else if (win_Probability > 50 && win_Probability <= 75) {
                pl.HoldsType = "Y2";
            }
            else if (win_Probability > 30 && win_Probability <= 50) {
                pl.HoldsType = "Y3";
            }
            else if (win_Probability > 15 && win_Probability <= 30) {
                pl.HoldsType = "Y4";
            }
            else if (win_Probability >= 0 && win_Probability <= 15) {
                pl.HoldsType = "Y5";
            }
            else {
                pl.HoldsType = "Y6";
            }
            pl.hand_strength = win_Probability;
            if (pl.uid == this.uid) {
                this.HoldsType = pl.HoldsType;
                this.hand_strength = pl.hand_strength;
            }
        }
        CC_DEBUG && console.warn(this.uid, this.roundCount, this.plys.map(c => {
            return {
                uid: c.uid,
                HoldsType: c.HoldsType,
                hand_strength: c.hand_strength,
                holds: c.holds.map(c => FCS_logic.pukes[c]),
            };
        }));
    }
    async msg_oper_c(data) {
        if (data.curr_doing_seat != this.seat) {
            return;
        }
        let action = "";
        let betNum = 0;
        if (this.isInitLocation == false) {
            this.calculateLocation(data.curr_doing_seat);
            this.isInitLocation = true;
        }
        if (data['maxUid'] == this.uid) {
            if (this.roundCount == 0) {
                this.HoldsType = "Y1";
            }
            else {
                this.HoldsType = "Y6";
            }
        }
        let r = utils.random(1, 100);
        let Me = this.descSortAllPlayer.find(c => c.seat == this.seat);
        let pot_odds = data.cinglNum / (data.cinglNum + data.recommendBet[2]);
        let RR = (this.hand_strength / 100) / pot_odds;
        if (this.roundCount == 0) {
            if (this.HoldsType == "Y1") {
                if (this.Rn == 0) {
                    action = "R";
                    betNum = utils.random(this.lowBet * 2, this.lowBet * 5) + this.lowBet * this.CHn;
                }
                else if (this.Rn == 1) {
                    action = "R";
                    betNum = utils.random(data.cinglNum * 2, data.cinglNum * 4) + data.cinglNum * (this.CHn + this.Cn);
                }
                else if (this.Rn > 1) {
                    action = "R";
                    betNum = utils.random(data.cinglNum * 2, data.cinglNum * 4) + data.cinglNum * (this.CHn + this.Cn);
                    if (utils.random(1, 100) <= 50) {
                        betNum = data.freedomBet[1];
                    }
                }
            }
            else if (this.HoldsType == "Y2") {
                if (this.Rn == 0) {
                    action = "R";
                    betNum = utils.random(this.lowBet * 2, this.lowBet * 4) + this.lowBet * this.CHn;
                }
                else if (this.Rn == 1) {
                    action = "R";
                    betNum = utils.random(data.cinglNum * 2, data.cinglNum * 3) + data.cinglNum * (this.CHn + this.Cn);
                }
                else if (this.Rn > 1) {
                    action = "C";
                    if (utils.random(1, 100) <= 93) {
                        action = "F";
                    }
                }
            }
            else if (this.HoldsType == "Y3" || this.HoldsType == "Y4") {
                if (this.Rn == 0) {
                    if (Me.Location == "FP") {
                        action = "CH";
                    }
                    else if (Me.Location == "MP") {
                        action = "R";
                        betNum = utils.random(this.lowBet * 1, this.lowBet * 3);
                        if (utils.random(1, 100) <= 60) {
                            action = "CH";
                        }
                    }
                    else if (Me.Location == "BP") {
                        action = "R";
                        betNum = utils.random(this.lowBet * 2, this.lowBet * 4);
                    }
                }
                else if (this.Rn == 1) {
                    action = "CH";
                }
                else if (this.Rn > 1) {
                    if (data.freedomBet[0] > (1 / 10) * data.currGold) {
                        action = "C";
                    }
                    else {
                        if (utils.random(1, 100) <= 95) {
                            action = "F";
                        }
                        else {
                            action = "C";
                        }
                    }
                }
            }
            else if (this.HoldsType == "Y5") {
                if (this.Rn == 0) {
                    if (Me.Location == "FP" || Me.Location == "MP") {
                        action = "CH";
                    }
                    else if (Me.Location == "BP") {
                        action = "R";
                        betNum = utils.random(this.lowBet * 1, this.lowBet * 3);
                        if (utils.random(1, 100) <= 60) {
                            action = "CH";
                        }
                    }
                }
                else if (this.Rn == 1) {
                    action = "C";
                }
                else if (this.Rn > 1) {
                    action = "F";
                }
            }
            else if (this.HoldsType == "Y6") {
                if (this.Rn == 0) {
                    action = "F";
                    if (utils.random(1, 100) <= 60) {
                        action = "CH";
                    }
                }
                else if (this.Rn >= 1) {
                    action = "F";
                }
            }
        }
        else if (this.roundCount == 1 || this.roundCount == 2) {
            if (this.Rn == 0) {
                if (this.HoldsType == "Y1") {
                    if (r <= 15) {
                        action = "R";
                        betNum = data.recommendBet[0];
                    }
                    else if (r <= 45) {
                        action = "R";
                        betNum = data.recommendBet[1];
                    }
                    else if (r <= 95) {
                        action = "R";
                        betNum = data.recommendBet[2];
                    }
                    else {
                        return this.raiseAddSceneBet(data, data.freedomBet[1]);
                    }
                }
                else if (this.HoldsType == "Y2") {
                    if (r <= 40) {
                        action = "R";
                        betNum = data.recommendBet[0];
                    }
                    else if (r <= 70) {
                        action = "R";
                        betNum = data.recommendBet[1];
                    }
                    else if (r <= 100) {
                        action = "R";
                        betNum = data.recommendBet[2];
                    }
                }
                else if (this.HoldsType == "Y3") {
                    if (Me.Location == "FP") {
                        if (r <= 70) {
                            action = "CH";
                        }
                        else {
                            action = "R";
                            betNum = data.recommendBet[2];
                        }
                    }
                    else if (Me.Location == "MP") {
                        action = "CH";
                    }
                    else if (Me.Location == "BP") {
                        if (r <= 50) {
                            action = "R";
                            betNum = data.recommendBet[0];
                        }
                        else if (r <= 80) {
                            action = "R";
                            betNum = data.recommendBet[1];
                        }
                        else if (r <= 100) {
                            action = "R";
                            betNum = data.recommendBet[2];
                        }
                    }
                }
                else if (this.HoldsType == "Y4") {
                    if (Me.Location == "FP") {
                        action = "F";
                    }
                    else if (Me.Location == "MP") {
                        action = "CH";
                    }
                    else if (Me.Location == "BP") {
                        if (r <= 70) {
                            action = "CH";
                        }
                        else if (r <= 90) {
                            action = "F";
                        }
                        else if (r <= 100) {
                            action = "R";
                            betNum = data.recommendBet[2];
                        }
                    }
                }
                else if (this.HoldsType == "Y5") {
                    if (Me.Location == "FP") {
                        action = "F";
                    }
                    else if (Me.Location == "MP") {
                        action = "F";
                    }
                    else if (Me.Location == "BP") {
                        if (r <= 95) {
                            action = "F";
                        }
                        else if (r <= 100) {
                            action = "R";
                            betNum = data.recommendBet[2];
                        }
                    }
                }
                else if (this.HoldsType == "Y6") {
                    action = "R";
                    betNum = data.freedomBet[1];
                }
            }
            else if (this.Rn >= 1) {
                if (this.HoldsType == "Y6") {
                    action = "R";
                    betNum = data.freedomBet[1];
                }
                else {
                    if (RR < 0.8 || isNaN(RR)) {
                        action = "F";
                        if (r <= 5) {
                            action = "R";
                        }
                    }
                    else if (RR >= 0.8 && RR < 1) {
                        if (r <= 75) {
                            action = "F";
                        }
                        else if (r <= 90) {
                            action = "C";
                        }
                        else {
                            action = "R";
                        }
                    }
                    else if (RR >= 1 && RR < 1.3) {
                        if (r <= 60) {
                            action = "C";
                        }
                        else {
                            action = "R";
                        }
                    }
                    else if (RR >= 1.3) {
                        if (r <= 30) {
                            action = "C";
                        }
                        else {
                            action = "R";
                        }
                    }
                    if (action == "") {
                        console.warn("0000");
                    }
                    if (action == "R") {
                        let rr = utils.random(1, 100);
                        if (this.HoldsType == "Y1") {
                            if (rr <= 15) {
                                action = "R";
                                betNum = data.recommendBet[0];
                            }
                            else if (rr <= 45) {
                                action = "R";
                                betNum = data.recommendBet[1];
                            }
                            else if (rr <= 95) {
                                action = "R";
                                betNum = data.recommendBet[2];
                            }
                            else {
                                return this.raiseAddSceneBet(data, data.freedomBet[1]);
                            }
                        }
                        else if (this.HoldsType == "Y2") {
                            if (rr <= 40) {
                                action = "R";
                                betNum = data.recommendBet[0];
                            }
                            else if (rr <= 70) {
                                action = "R";
                                betNum = data.recommendBet[1];
                            }
                            else if (rr <= 100) {
                                action = "R";
                                betNum = data.recommendBet[2];
                            }
                        }
                        else if (this.HoldsType == "Y3") {
                            if (rr <= 50) {
                                action = "R";
                                betNum = data.recommendBet[0];
                            }
                            else if (rr <= 80) {
                                action = "R";
                                betNum = data.recommendBet[1];
                            }
                            else if (rr <= 100) {
                                action = "R";
                                betNum = data.recommendBet[2];
                            }
                        }
                        else if (this.HoldsType == "Y4") {
                            action = "R";
                            betNum = data.recommendBet[2];
                        }
                        else if (this.HoldsType == "Y5") {
                            action = "R";
                            betNum = data.recommendBet[2];
                        }
                    }
                }
            }
        }
        else if (this.roundCount == 3) {
            if (this.Rn == 0) {
                if (this.HoldsType == "Y1") {
                    if (r <= 15) {
                        action = "R";
                        betNum = data.recommendBet[0];
                    }
                    else if (r <= 45) {
                        action = "R";
                        betNum = data.recommendBet[1];
                    }
                    else if (r <= 95) {
                        action = "R";
                        betNum = data.recommendBet[2];
                    }
                    else {
                        return this.raiseAddSceneBet(data, data.freedomBet[1]);
                    }
                }
                else if (this.HoldsType == "Y2") {
                    if (r <= 40) {
                        action = "R";
                        betNum = data.recommendBet[0];
                    }
                    else if (r <= 70) {
                        action = "R";
                        betNum = data.recommendBet[1];
                    }
                    else if (r <= 100) {
                        action = "R";
                        betNum = data.recommendBet[2];
                    }
                }
                else if (this.HoldsType == "Y3") {
                    if (Me.Location == "FP") {
                        action = "CH";
                    }
                    else if (Me.Location == "MP") {
                        action = "CH";
                    }
                    else if (Me.Location == "BP") {
                        action = "CH";
                    }
                }
                else if (this.HoldsType == "Y4") {
                    if (Me.Location == "FP") {
                        action = "F";
                    }
                    else if (Me.Location == "MP") {
                        action = "CH";
                    }
                    else if (Me.Location == "BP") {
                        action = "CH";
                    }
                }
                else if (this.HoldsType == "Y5") {
                    if (Me.Location == "FP") {
                        action = "F";
                    }
                    else if (Me.Location == "MP") {
                        action = "F";
                    }
                    else if (Me.Location == "BP") {
                        action = "F";
                    }
                }
                else if (this.HoldsType == "Y6") {
                    action = "R";
                    betNum = data.freedomBet[1];
                }
            }
            else if (this.Rn >= 1) {
                if (this.HoldsType == "Y1") {
                    if (RR < 1 || isNaN(RR)) {
                        action = "F";
                    }
                    else if (1 <= RR && RR < 1.3) {
                        if (r <= 60) {
                            action = "C";
                        }
                        else {
                            action = "R";
                        }
                    }
                    else if (RR >= 1.3) {
                        if (r <= 30) {
                            action = "C";
                        }
                        else {
                            action = "R";
                        }
                    }
                }
                else if (this.HoldsType == "Y2" ||
                    this.HoldsType == "Y3" ||
                    this.HoldsType == "Y4" ||
                    this.HoldsType == "Y5") {
                    action = "F";
                }
                else {
                    action = "R";
                    betNum = data.freedomBet[1];
                }
            }
        }
        CC_DEBUG && console.warn(this.uid, this.roundCount, action, this.HoldsType, betNum, `Rn:${this.Rn}`, `odds:${pot_odds}`, RR);
        if (action == "C") {
            this.action_cingl();
        }
        else if (action == "CH") {
            this.action_cingl();
        }
        else if (action == "F") {
            if (data.cinglNum == 0) {
                this.action_cingl();
            }
            else {
                this.action_fold();
            }
        }
        else if (action == "R") {
            this.raiseAddSceneBet(data, betNum);
        }
        else {
            console.warn("no caozuo no die");
            console.warn(this.roundCount, this.HoldsType, this.Rn);
        }
    }
    async raiseRecommBet(data, intervalValue) {
        const sendMsgTimeout = utils.random(1 * 1000, 3 * 1000);
        if (intervalValue > 0) {
            do {
                if (data.recommendBet[intervalValue] > data.currGold) {
                    intervalValue--;
                }
                else {
                    break;
                }
                if (intervalValue == 0) {
                    break;
                }
            } while (true);
        }
        try {
            if (data.recommendBet[intervalValue] > data.currGold ||
                data.recommendBet[intervalValue] > data.freedomBet[1]) {
                await this.delayRequest(`FiveCardStud.mainHandler.cingl`, {}, sendMsgTimeout);
            }
            else {
                let betNum = data.recommendBet[intervalValue];
                this.raiseAddSceneBet(data, betNum);
            }
        }
        catch (error) {
            console.warn(this.uid, JSON.stringify(error), 1);
        }
        return true;
    }
    async raiseAddSceneBet(data, betNum) {
        const sendMsgTimeout = utils.random(1 * 1000, 3 * 1000);
        try {
            if (betNum == undefined || isNaN(betNum) || betNum == 0) {
                console.warn("0000");
            }
            betNum = Math.floor(betNum / 100) * 100;
            if (betNum > data.freedomBet[1]) {
                betNum = data.freedomBet[1];
            }
            if (betNum < data.freedomBet[0]) {
                betNum = data.freedomBet[0];
            }
            if (betNum > data.currGold) {
                betNum = data.currGold;
            }
            await this.delayRequest(`FiveCardStud.mainHandler.filling`, { betNum }, sendMsgTimeout);
        }
        catch (error) {
            console.warn(this.uid, JSON.stringify(error));
        }
        return true;
    }
    async action_fold() {
        const sendMsgTimeout = utils.random(1 * 1000, 3 * 1000);
        try {
            this.isFold = true;
            await this.delayRequest(`FiveCardStud.mainHandler.fold`, {}, sendMsgTimeout);
        }
        catch (error) {
            console.warn(this.uid, JSON.stringify(error));
        }
    }
    async action_cingl() {
        const sendMsgTimeout = utils.random(1 * 1000, 3 * 1000);
        try {
            await this.delayRequest(`FiveCardStud.mainHandler.cingl`, {}, sendMsgTimeout);
        }
        catch (error) {
            console.warn(this.uid, JSON.stringify(error));
        }
    }
    onOpts(opt) {
        CC_DEBUG && console.warn(opt.uid, opt.type);
        if (opt.type == 'cingl') {
            this.Cn++;
            this.N++;
        }
        else if (opt.type == "allin" || opt.type == "filling") {
            this.Rn++;
            this.N++;
        }
        else if (opt.type == "pass") {
            this.CHn++;
            this.N++;
        }
        if (opt.type == 'fold') {
            this.descSortAllPlayer.find(c => c && c.seat == opt.seat).isFold = true;
            let other = this.plys.find(c => c.uid == opt.seat);
            if (other) {
                other.isFold = true;
                this.plys = this.plys.filter(c => c.isFold == false);
                this.calculateType();
            }
        }
    }
    destroy() {
        this.leaveGameAndReset(false);
    }
    calculateLocation(Firstseat) {
        let length = this.descSortAllPlayer.filter(pl => pl && pl.isFold == false).length;
        if (length >= 3) {
            for (const ccc of this.descSortAllPlayer) {
                ccc.Location = "MP";
            }
            let len = 4;
            let seat = Firstseat - 1;
            do {
                if (seat < 0) {
                    seat = len;
                }
                let pl = this.descSortAllPlayer.find(c => c.seat == seat);
                if (pl) {
                    pl.Location = "BP";
                    break;
                }
                seat--;
            } while (true);
            this.descSortAllPlayer.find(c => c.seat == Firstseat).Location = "FP";
        }
        else if (length == 2) {
            for (const ccc of this.descSortAllPlayer) {
                ccc.Location = "BP";
            }
            this.descSortAllPlayer.find(c => c.seat == Firstseat).Location = "MP";
        }
    }
}
exports.default = DZpipeirobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRkNTX1JvYm90LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvRml2ZUNhcmRTdHVkL2xpYi9yb2JvdC9GQ1NfUm9ib3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUNiLDJFQUF3RTtBQUN4RSwyQ0FBMkM7QUFJM0MsK0NBQXlDO0FBQ3pDLE1BQU0sV0FBVyxHQUFHLElBQUEsd0JBQVMsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDdkQsMENBQTBDO0FBQzFDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQztBQUV2QixNQUFxQixZQUFhLFNBQVEscUJBQVM7SUE4Q2pELFlBQVksSUFBSTtRQUNkLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQTNCZCxPQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRVAsT0FBRSxHQUFHLENBQUMsQ0FBQztRQUVQLFFBQUcsR0FBRyxDQUFDLENBQUM7UUFFUixNQUFDLEdBQUcsQ0FBQyxDQUFDO1FBU04sU0FBSSxHQUlFLEVBQUUsQ0FBQztRQUNULFdBQU0sR0FBRyxLQUFLLENBQUM7UUFFZixtQkFBYyxHQUFHLEtBQUssQ0FBQztRQU1yQixJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNkLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUNELEtBQUssQ0FBQyxNQUFNO1FBQ1YsSUFBSTtZQUNGLElBQUksSUFBSSxHQUE2QyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsaUNBQWlDLEVBQUUsRUFBRSxDQUFDLENBQUM7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