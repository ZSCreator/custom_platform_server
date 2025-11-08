'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerState = exports.PlayerStatus = void 0;
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const utils = require("../../../utils/index");
const GoldenFlower_logic = require("./GoldenFlower_logic");
const MessageService = require("../../../services/MessageService");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
var PlayerStatus;
(function (PlayerStatus) {
    PlayerStatus["NONE"] = "NONE";
    PlayerStatus["WAIT"] = "WAIT";
    PlayerStatus["GAME"] = "GAME";
    PlayerStatus["READY"] = "READY";
})(PlayerStatus = exports.PlayerStatus || (exports.PlayerStatus = {}));
var PlayerState;
(function (PlayerState) {
    PlayerState["PS_NONE"] = "PS_NONE";
    PlayerState["PS_OPER"] = "PS_OPER";
})(PlayerState = exports.PlayerState || (exports.PlayerState = {}));
class jhPlayer extends PlayerInfo_1.PlayerInfo {
    constructor(roomInfo, i, opts) {
        super(opts);
        this.status = PlayerStatus.NONE;
        this.state = PlayerState.PS_NONE;
        this.cards = null;
        this.cardType = 0;
        this.holdStatus = 0;
        this.totalBet = 0;
        this.profit = 0;
        this.auto_genzhu = false;
        this.auto_no_Fold = true;
        this.is_settlement = false;
        this.initgold = 0;
        this.seat = i;
        this.gold = opts.gold;
        if (roomInfo.experience) {
            this.gold = 2000000;
        }
        this.initgold = this.gold;
    }
    stripRobot() {
        return {
            cards: this.cards,
            cardType: this.cardType,
            uid: this.uid,
            isRobot: this.isRobot,
            gold: this.gold
        };
    }
    initGame(roomInfo, cards, cardType, betNum) {
        this.setStatus(PlayerStatus.GAME);
        this.cards = cards;
        this.cards.sort((a, b) => {
            if (a % 13 === 0)
                return 0;
            if (b % 13 === 0)
                return 1;
            return b % 13 - a % 13;
        });
        this.cardType = cardType;
        this.holdStatus = 0;
        this.totalBet = betNum;
        this.gold -= betNum;
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "lowBet", update_time: utils.cDate(), msg: betNum });
        this.initControlType();
    }
    toHolds() {
        return this.cards && { uid: this.uid, cards: this.cards, type: this.cardType, isRobot: this.isRobot };
    }
    wrapSettlement() {
        return {
            uid: this.uid,
            seat: this.seat,
            totalBet: this.totalBet,
            profit: this.profit,
            gold: this.gold,
            holds: this.toHolds(),
        };
    }
    wrapGame() {
        return {
            seat: this.seat,
            uid: this.uid,
            headurl: this.headurl,
            nickname: this.nickname,
            gold: this.gold,
            totalBet: this.totalBet,
            holds: null,
            holdStatus: this.holdStatus
        };
    }
    strip() {
        return {
            seat: this.seat,
            uid: this.uid,
            headurl: this.headurl,
            nickname: encodeURI(this.nickname),
            gold: this.gold,
            status: this.status,
            holdStatus: this.holdStatus,
            totalBet: this.totalBet,
            isRobot: this.isRobot,
            ip: this.ip,
        };
    }
    Record_strip() {
        return {
            uid: this.uid,
            isRobot: this.isRobot,
            seat: this.seat,
            nickname: this.nickname,
            headurl: this.headurl,
            gold: this.gold,
            totalBet: this.totalBet,
            hold: this.cards,
            cardType: this.cardType,
            holdStatus: this.holdStatus,
            profit: this.profit,
        };
    }
    kickStrip() {
        return {
            uid: this.uid,
            seat: this.seat
        };
    }
    async settlement(roomInfo) {
        roomInfo.record_history.max_uid = roomInfo.max_uid;
        this.gameRecordService = (0, RecordGeneralManager_1.default)();
        const data = this.gameRecordService
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .addResult(roomInfo.zipResult)
            .setControlType(this.controlType)
            .setGameRecordInfo(Math.abs(this.totalBet), Math.abs(this.totalBet), this.profit - this.totalBet, false)
            .setGameRecordLivesResult(roomInfo.record_history);
        let res = await data.sendToDB(1);
        this.is_settlement = true;
        this.gold = res.gold;
        this.initgold = this.gold;
        this.profit = res.playerRealWin;
    }
    async only_update_game(roomInfo) {
        if (!roomInfo.experience) {
            await this.gameRecordService.Later_updateRecord(roomInfo.record_history);
        }
    }
    rechargeStrip() {
        return {
            uid: this.uid,
            seat: this.seat,
            gold: this.gold,
        };
    }
    handler_fold(roomInfo) {
        let flage = false;
        if (roomInfo.curr_doing_seat == this.seat && this.status == "GAME") {
            flage = true;
        }
        this.setStatus(PlayerStatus.WAIT);
        this.setState(PlayerState.PS_NONE);
        this.settlement(roomInfo);
        this.holdStatus = 2;
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "fold", update_time: utils.cDate(), msg: "" });
        (roomInfo.zhuang_seat === this.seat) && roomInfo.resetZhuang();
        for (const pl of roomInfo._players) {
            const member = pl && roomInfo.channel.getMember(pl.uid);
            if (!member)
                continue;
            const opts = { type: 'fold', seat: this.seat };
            if (pl.uid == this.uid)
                opts["cards"] = this.cards;
            MessageService.pushMessageByUids('ZJH_onOpts', opts, member);
        }
        const list = roomInfo._players.filter(pl => pl && pl.status == 'GAME');
        if (flage || list.length == 1) {
            roomInfo.checkHasNextPlayer(this.seat);
        }
    }
    handler_kanpai(roomInfo) {
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "kanpai", update_time: utils.cDate(), msg: "" });
        roomInfo.channelIsPlayer('ZJH_onOpts', {
            type: 'kanpai',
            seat: this.seat,
            fahuaTime: this.seat === roomInfo.curr_doing_seat ? roomInfo.handler_pass() : 0
        });
    }
    handler_cingl(roomInfo, betNum) {
        clearTimeout(roomInfo.Oper_timeout);
        this.setState(PlayerState.PS_NONE);
        this.totalBet += betNum;
        this.gold -= betNum;
        roomInfo.addSumBet(this, betNum, "cingl");
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "cingl", update_time: utils.cDate(), msg: betNum });
        roomInfo.channelIsPlayer('ZJH_onOpts', {
            type: 'cingl',
            seat: this.seat,
            gold: this.gold,
            betNum: betNum,
            totalBet: this.totalBet,
            sumBet: roomInfo.currSumBet
        });
        roomInfo.checkHasNextPlayer(this.seat);
    }
    handler_filling(roomInfo, betNum, num) {
        clearTimeout(roomInfo.Oper_timeout);
        this.setState(PlayerState.PS_NONE);
        this.totalBet += betNum;
        this.gold -= betNum;
        roomInfo.betNum = num;
        roomInfo.addSumBet(this, betNum, "filling");
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "filling", update_time: utils.cDate(), msg: betNum });
        roomInfo.channelIsPlayer('ZJH_onOpts', {
            type: "filling",
            seat: this.seat,
            gold: this.gold,
            betNum: betNum,
            totalBet: this.totalBet,
            sumBet: roomInfo.currSumBet
        });
        roomInfo.checkHasNextPlayer(this.seat);
    }
    async handler_Allfighting(roomInfo) {
        clearTimeout(roomInfo.Oper_timeout);
        this.setState(PlayerState.PS_NONE);
        let curr_bet = this.gold;
        this.totalBet += curr_bet;
        this.gold -= curr_bet;
        roomInfo.addSumBet(this, curr_bet, "allin");
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "allin", update_time: utils.cDate(), msg: curr_bet });
        let flag = true;
        const gamePlayers = roomInfo._players.filter(pl => pl && pl.status == 'GAME');
        for (const pl of gamePlayers) {
            if (pl && pl.uid == this.uid)
                continue;
            let temp = GoldenFlower_logic.bipaiSole(this, pl);
            if (temp <= 0) {
                flag = false;
            }
        }
        roomInfo.channelIsPlayer('ZJH_onOpts', {
            type: 'allin',
            seat: this.seat,
            gold: this.gold,
            betNum: curr_bet,
            totalBet: this.totalBet,
            sumBet: roomInfo.currSumBet,
            iswin: flag,
        });
        if (!flag) {
            this.setStatus(PlayerStatus.WAIT);
            this.holdStatus = 3;
            (roomInfo.zhuang_seat == this.seat) && roomInfo.resetZhuang();
            this.settlement(roomInfo);
        }
        if (flag) {
            for (const pl of gamePlayers) {
                if (pl && pl.uid == this.uid)
                    continue;
                let diff = pl.totalBet - this.totalBet;
                if (diff > 0) {
                    pl.totalBet -= diff;
                    roomInfo.addSumBet(pl, -diff, "allin");
                }
                pl.setStatus(PlayerStatus.WAIT);
                pl.holdStatus = 3;
                pl.settlement(roomInfo);
            }
        }
        await utils.delay(1500);
        roomInfo.checkHasNextPlayer(this.seat);
        return flag;
    }
    setStatus(status) {
        this.status = status;
    }
    setState(state) {
        this.state = state;
    }
}
exports.default = jhPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamhQbGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9Hb2xkZW5GbG93ZXIvbGliL2poUGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBQ2IsdUVBQW9FO0FBRXBFLDhDQUErQztBQUkvQywyREFBMkQ7QUFDM0QsbUVBQW9FO0FBRXBFLG1GQUEyRztBQUczRyxJQUFZLFlBS1g7QUFMRCxXQUFZLFlBQVk7SUFDcEIsNkJBQWEsQ0FBQTtJQUNiLDZCQUFhLENBQUE7SUFDYiw2QkFBYSxDQUFBO0lBQ2IsK0JBQWUsQ0FBQTtBQUNuQixDQUFDLEVBTFcsWUFBWSxHQUFaLG9CQUFZLEtBQVosb0JBQVksUUFLdkI7QUFHRCxJQUFZLFdBR1g7QUFIRCxXQUFZLFdBQVc7SUFDbkIsa0NBQW1CLENBQUE7SUFDbkIsa0NBQW1CLENBQUE7QUFDdkIsQ0FBQyxFQUhXLFdBQVcsR0FBWCxtQkFBVyxLQUFYLG1CQUFXLFFBR3RCO0FBR0QsTUFBcUIsUUFBUyxTQUFRLHVCQUFVO0lBd0I1QyxZQUFZLFFBQWdCLEVBQUUsQ0FBUyxFQUFFLElBQVM7UUFDOUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBdkJoQixXQUFNLEdBQWlCLFlBQVksQ0FBQyxJQUFJLENBQUM7UUFFekMsVUFBSyxHQUFnQixXQUFXLENBQUMsT0FBTyxDQUFDO1FBRXpDLFVBQUssR0FBYSxJQUFJLENBQUM7UUFFdkIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUVyQixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBRXZCLGFBQVEsR0FBRyxDQUFDLENBQUM7UUFFYixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBRW5CLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBRXBCLGlCQUFZLEdBQUcsSUFBSSxDQUFDO1FBRXBCLGtCQUFhLEdBQUcsS0FBSyxDQUFDO1FBR3RCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFHakIsSUFB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