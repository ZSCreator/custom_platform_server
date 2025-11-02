'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const utils = require("../../../utils/index");
const MessageService = require("../../../services/MessageService");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
class jhPlayer extends PlayerInfo_1.PlayerInfo {
    constructor(i, opts) {
        super(opts);
        this.status = 'NONE';
        this.state = "PS_NONE";
        this.cards = null;
        this.cardType = 0;
        this.holdStatus = 0;
        this.totalBet = 0;
        this.profit = 0;
        this.canliangs = [];
        this.auto_genzhu = false;
        this.auto_no_Fold = true;
        this.is_settlement = false;
        this.initgold = 0;
        this.IsMingZhu = false;
        this.seat = i;
        this.gold = opts.gold;
        this.initgold = this.gold;
    }
    stripRobot() {
        return {
            cards: this.cards,
            cardType: this.cardType,
            uid: this.uid,
            isRobot: this.isRobot
        };
    }
    prepare() {
        this.status = `READY`;
        this.cards = null;
        this.cardType = 0;
        this.holdStatus = 0;
        this.canliangs = [];
        this.totalBet = 0;
        this.profit = 0;
    }
    initGame(roomInfo, cards, cardType, betNum) {
        this.status = 'GAME';
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
        this.canliangs = [];
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
            canliangs: this.canliangs
        };
    }
    strip() {
        return {
            seat: this.seat,
            uid: this.uid,
            headurl: this.headurl,
            nickname: this.nickname,
            gold: this.gold,
            status: this.status,
            holdStatus: this.holdStatus,
            pl_totalBet: this.totalBet,
        };
    }
    Record_strip() {
        return {
            uid: this.uid,
            isRobot: this.isRobot,
            seat: this.seat,
            nickname: encodeURI(this.nickname),
            headurl: this.headurl,
            gold: this.gold,
            totalBet: this.totalBet,
            hold: this.cards,
            cardType: this.cardType,
            holdStatus: this.holdStatus,
            profit: this.profit,
            canliangs: this.canliangs
        };
    }
    kickStrip() {
        return {
            uid: this.uid,
            seat: this.seat
        };
    }
    canBipai(roomInfo) {
        let plys = roomInfo.players.filter(pl => pl && pl.uid != this.uid && pl.status == "GAME");
        if ((plys.filter(pl => pl.IsMingZhu).length > 0 && this.holdStatus == 1) || plys.length == 1) {
            return { plys, canBipai: true };
        }
        return { plys, canBipai: false };
    }
    async settlement(roomInfo) {
        this.gameRecordService = (0, RecordGeneralManager_1.default)();
        const res = await this.gameRecordService
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .setGameRecordInfo(Math.abs(this.totalBet), Math.abs(this.totalBet), this.profit - this.totalBet, false)
            .setGameRecordLivesResult(roomInfo.record_history)
            .setControlType(this.controlType)
            .addResult(roomInfo.zipResult)
            .sendToDB(1);
        this.gold = res.gold;
        this.initgold = this.gold;
        this.profit = res.playerRealWin;
        this.is_settlement = true;
    }
    async only_update_game(roomInfo) {
        await this.gameRecordService.Later_updateRecord(roomInfo.record_history);
    }
    handler_cingl(roomInfo, betNum) {
        clearTimeout(roomInfo.Oper_timeout);
        this.totalBet += betNum;
        this.gold -= betNum;
        roomInfo.addSumBet(this, betNum, "cingl");
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "cingl", update_time: utils.cDate(), msg: betNum });
        if (this.holdStatus == 1) {
            this.IsMingZhu = true;
        }
        roomInfo.channelIsPlayer('TeenPatti_onOpts', {
            type: 'cingl',
            seat: this.seat,
            gold: this.gold,
            betNum: betNum,
            pl_totalBet: this.totalBet,
            room_sumBet: roomInfo.currSumBet
        });
        roomInfo.checkHasNextPlayer(roomInfo.nextFahuaIdx());
    }
    handler_filling(roomInfo, betNum, num) {
        clearTimeout(roomInfo.Oper_timeout);
        this.totalBet += betNum;
        this.gold -= betNum;
        roomInfo.betNum = num;
        let type = 'filling';
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "filling", update_time: utils.cDate(), msg: betNum });
        roomInfo.addSumBet(this, betNum, "filling");
        if (this.holdStatus == 1) {
            this.IsMingZhu = true;
        }
        roomInfo.channelIsPlayer('TeenPatti_onOpts', {
            type,
            seat: this.seat,
            gold: this.gold,
            betNum: betNum,
            pl_totalBet: this.totalBet,
            room_sumBet: roomInfo.currSumBet
        });
        roomInfo.checkHasNextPlayer(roomInfo.nextFahuaIdx());
    }
    handler_kanpai(roomInfo) {
        this.holdStatus = 1;
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "kanpai", update_time: utils.cDate(), msg: "" });
        for (const pl of roomInfo._players) {
            if (!pl)
                continue;
            const member = roomInfo.channel.getMember(pl.uid);
            const opts = {
                type: 'kanpai',
                seat: this.seat,
                fahuaTime: this.seat == roomInfo.curr_doing_seat ? roomInfo.handler_pass() : 0,
                holds: this.toHolds(),
            };
            if (pl.uid != this.uid) {
                delete opts.holds;
            }
            member && MessageService.pushMessageByUids('TeenPatti_onOpts', opts, member);
        }
    }
    handler_fold(roomInfo) {
        let flage = false;
        if (roomInfo.curr_doing_seat == this.seat && this.status == "GAME") {
            flage = true;
        }
        this.status = 'WAIT';
        this.holdStatus = 2;
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "fold", update_time: utils.cDate(), msg: "" });
        (roomInfo.zhuang_seat === this.seat) && roomInfo.resetZhuang();
        roomInfo.channelIsPlayer('TeenPatti_onOpts', { type: 'fold', seat: this.seat });
        this.settlement(roomInfo);
        const list = roomInfo._players.filter(pl => pl && pl.status == 'GAME');
        if (flage || list.length == 1) {
            roomInfo.checkHasNextPlayer(this.seat);
        }
    }
}
exports.default = jhPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHBQbGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9UZWVuUGF0dGkvbGliL3RwUGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFDYix1RUFBb0U7QUFDcEUsOENBQStDO0FBRS9DLG1FQUFvRTtBQUNwRSxtRkFBMkc7QUFHM0csTUFBcUIsUUFBUyxTQUFRLHVCQUFVO0lBNkI1QyxZQUFZLENBQVMsRUFBRSxJQUFTO1FBQzVCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQTVCaEIsV0FBTSxHQUF1QyxNQUFNLENBQUM7UUFFcEQsVUFBSyxHQUEwQixTQUFTLENBQUE7UUFFeEMsVUFBSyxHQUFhLElBQUksQ0FBQztRQUV2QixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBRXJCLGVBQVUsR0FBVyxDQUFDLENBQUM7UUFFdkIsYUFBUSxHQUFHLENBQUMsQ0FBQztRQUViLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFFbkIsY0FBUyxHQUFhLEVBQUUsQ0FBQztRQUd6QixnQkFBVyxHQUFHLEtBQUssQ0FBQztRQUVwQixpQkFBWSxHQUFHLElBQUksQ0FBQztRQUVwQixrQkFBYSxHQUFHLEtBQUssQ0FBQztRQUd0QixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBRXJCLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFHZCxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNkLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDOUIsQ0FBQztJQUdELFVBQVU7UUFDTixPQUFPO1lBQ0gsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUN2QixHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7WUFDYixPQUFPLEVBQUUs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