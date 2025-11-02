"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const ld_Logic = require("./ld_Logic");
const utils = require("../../../utils/index");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
class ldPlayer extends PlayerInfo_1.PlayerInfo {
    constructor(i, opts) {
        super(opts);
        this.status = "NONE";
        this.state = "PS_NONE";
        this.cards = [];
        this.cardType = -1;
        this.bet = 0;
        this.totalBet = 0;
        this.profit = 0;
        this.totalProfit = 0;
        this.Oper_timeout = null;
        this.keep_dices = [];
        this.initgold = 0;
        this.seat = i;
        this.gold = opts.gold;
        this.initgold = this.gold;
    }
    prepare() {
        this.profit = 0;
        this.bet = 0;
    }
    initGame(cards) {
        this.status = "GAME";
        this.cards = cards.map(c => c);
        this.cardType = ld_Logic.getCardType(this.cards);
        this.initControlType();
    }
    wrapGame() {
        return {
            seat: this.seat,
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            gold: this.gold,
            bet: this.bet,
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
            bet: this.bet,
            profit: this.profit,
            totalBet: this.totalBet,
            totalProfit: this.totalProfit,
            cards: this.cards,
            cardType: this.cardType,
            isRobot: this.isRobot
        };
    }
    async updateGold(roomInfo) {
        this.gameRecordService = (0, RecordGeneralManager_1.default)();
        const res = await this.gameRecordService
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .setControlType(this.controlType)
            .setGameRecordInfo(Math.abs(this.totalBet), Math.abs(this.totalBet), this.totalProfit, false)
            .setGameRecordLivesResult(roomInfo.record_history)
            .sendToDB(1);
        this.gold = res.gold;
        this.initgold = this.gold;
        this.totalProfit = res.playerRealWin;
    }
    async only_update_game(roomInfo) {
        await this.gameRecordService.Later_updateRecord(roomInfo.record_history);
    }
    handler_Keep(roomInfo, dices) {
        clearTimeout(this.Oper_timeout);
        this.keep_dices = dices;
        this.state = "PS_NONE";
        const opts = {
            uid: this.uid,
            seat: this.seat,
            dices
        };
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "Keep", update_time: utils.cDate(), msg: dices });
        roomInfo.channelIsPlayer('ld.Keep', opts);
        if (roomInfo.min_pls.every(pl => pl.state == "PS_NONE") == true) {
            roomInfo.handler_start();
        }
    }
}
exports.default = ldPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGRQbGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9MdWNreURpY2UvbGliL2xkUGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUVBQW9FO0FBR3BFLHVDQUF3QztBQUV4Qyw4Q0FBK0M7QUFDL0MsbUZBQTJHO0FBRzNHLE1BQXFCLFFBQVMsU0FBUSx1QkFBVTtJQXVCNUMsWUFBWSxDQUFTLEVBQUUsSUFBUztRQUM1QixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFyQmhCLFdBQU0sR0FBNkIsTUFBTSxDQUFDO1FBRTFDLFVBQUssR0FBMEIsU0FBUyxDQUFBO1FBRXhDLFVBQUssR0FBYSxFQUFFLENBQUM7UUFDckIsYUFBUSxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBR3RCLFFBQUcsR0FBVyxDQUFDLENBQUM7UUFDaEIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUVyQixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBQ25CLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBRXhCLGlCQUFZLEdBQWlCLElBQUksQ0FBQztRQUVsQyxlQUFVLEdBQWEsRUFBRSxDQUFDO1FBRzFCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFHakIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7UUFDZCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQzlCLENBQUM7SUFHRCxPQUFPO1FBQ0gsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDakIsQ0FBQztJQUdELFFBQVEsQ0FBQyxLQUFlO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEdB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