"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const pinus_1 = require("pinus");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const FCS_logic = require("./FCS_logic");
const Logger = (0, pinus_1.getLogger)('server_out', __filename);
class FCSPlayer extends PlayerInfo_1.PlayerInfo {
    constructor(i, opts, sceneId) {
        super(opts);
        this.status = 'NONE';
        this.state = "PS_NONE";
        this.typeSize = 0;
        this._typeSize = 0;
        this.holds = [];
        this.cardType = { cards: [], type: 0 };
        this.bet = 0;
        this.tatalBet = 0;
        this.isBet = false;
        this.isFold = false;
        this.profit = 0;
        this.initgold = 0;
        this.TheCards = [];
        this.gold = opts.gold;
        this.currGold = opts.gold > opts.currGold ? opts.currGold : opts.gold;
        this.seat = i;
        this.state = "PS_NONE";
        this.initgold = this.gold;
    }
    initGame(holds) {
        this.holds = holds.slice(0, 2).map(c => c);
        this.TheCards = holds.slice(2).map(c => c);
        this.status = 'GAME';
    }
    execBet(roomInfo, betnum) {
        this.bet += betnum;
        this.tatalBet += betnum;
        this.isBet = true;
        roomInfo.roomCurrSumBet += betnum;
        roomInfo.lastBetNum = Math.max(this.bet, roomInfo.lastBetNum);
    }
    resetBet() {
        this.bet = 0;
        this.isBet = false;
    }
    canUserGold() {
        return this.currGold - this.tatalBet;
    }
    canDeal(maxBetNum) {
        let status = (this.isBet && (this.bet == maxBetNum)) || (this.canUserGold() == 0);
        return status;
    }
    result(roomInfo) {
        return {
            uid: this.uid,
            seat: this.seat,
            profit: this.profit,
            currGold: this.currGold,
            gold: this.gold,
            holds: this.holds,
            cardType: this.cardType,
            sumBetNum: this.tatalBet,
            roundTimes: roomInfo.roundTimes,
            isFold: this.isFold,
            typeSize: this.typeSize
        };
    }
    toGame(uid, roundNum) {
        let opts = {
            uid: this.uid,
            seat: this.seat,
            gold: this.gold,
            currGold: this.canUserGold(),
            bet: this.bet,
            tatalBet: this.tatalBet,
            holds: this.uid == uid ? this.holds : this.holds.map((c, i) => i == 0 ? 0x99 : c),
            status: this.status,
            isFold: this.isFold,
        };
        return opts;
    }
    strip() {
        return {
            seat: this.seat,
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            gold: this.gold,
            currGold: this.canUserGold(),
            status: this.status,
            bet: this.bet,
            isFold: this.isFold,
            holds: null
        };
    }
    async addMilitary(roomInfo) {
        roomInfo.endTime = Date.now();
        try {
            this.gameRecordService = (0, RecordGeneralManager_1.default)();
            const res = await this.gameRecordService
                .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
                .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
                .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
                .setControlType(this.controlType)
                .setGameRecordInfo(Math.abs(this.tatalBet), Math.abs(this.tatalBet), this.profit - this.tatalBet, false)
                .setGameRecordLivesResult(roomInfo.record_history)
                .sendToDB(1);
            this.profit = res.playerRealWin;
            this.gold = res.gold;
            this.initgold = this.gold;
            this.currGold += res.playerRealWin;
            roomInfo.addNote(this, this.profit);
        }
        catch (error) {
            Logger.error(error.stack || error.message || error);
        }
    }
    async only_update_game(roomInfo) {
        await this.gameRecordService.Later_updateRecord(roomInfo.record_history);
    }
    handler_play(roomInfo, type, currBet) {
        clearTimeout(roomInfo.action_Timeout);
        this.execBet(roomInfo, currBet);
        roomInfo.recordDrawBefore(this, currBet, type);
        this.state = "PS_NONE";
        roomInfo.channelIsPlayer('FiveCardStud.onOpts', {
            type: type,
            seat: this.seat,
            uid: this.uid,
            currGold: this.canUserGold(),
            currBet: currBet,
            bet: this.bet,
            roomCurrSumBet: roomInfo.roomCurrSumBet,
        });
        roomInfo.nextStatus();
    }
    async handler_fold(roomInfo) {
        clearTimeout(roomInfo.action_Timeout);
        this.isFold = true;
        this.state = "PS_NONE";
        this.status = "WAIT";
        if (roomInfo.roundTimes == 3) {
            this.cardType.type = FCS_logic.GetCardType(this.holds.slice());
            this.cardType.cards = this.holds.slice();
        }
        roomInfo.recordDrawBefore(this, 0, 'Fold');
        roomInfo.channelIsPlayer('FiveCardStud.onOpts', {
            type: 'fold',
            seat: this.seat,
            uid: this.uid,
            gold: this.gold,
            currGold: this.canUserGold(),
            headurl: this.headurl
        });
        await this.addMilitary(roomInfo);
        const list = roomInfo._players.filter(pl => pl && pl.status == 'GAME' && !pl.isFold);
        if (list.length <= 1) {
            roomInfo.partPool();
            roomInfo.settlement();
        }
        else {
            roomInfo.nextStatus();
        }
    }
}
exports.default = FCSPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRkNTUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvRml2ZUNhcmRTdHVkL2xpYi9GQ1NQbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1RUFBb0U7QUFHcEUsaUNBQWtDO0FBQ2xDLG1GQUEyRztBQUMzRyx5Q0FBMEM7QUFDMUMsTUFBTSxNQUFNLEdBQUcsSUFBQSxpQkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUtuRCxNQUFxQixTQUFVLFNBQVEsdUJBQVU7SUFnQzdDLFlBQVksQ0FBUyxFQUFFLElBQVMsRUFBRSxPQUFlO1FBQzdDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQTlCaEIsV0FBTSxHQUE2QixNQUFNLENBQUM7UUFFMUMsVUFBSyxHQUEwQixTQUFTLENBQUM7UUFJekMsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUVyQixjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBR3RCLFVBQUssR0FBYSxFQUFFLENBQUM7UUFFckIsYUFBUSxHQUFzQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDO1FBRXJFLFFBQUcsR0FBVyxDQUFDLENBQUM7UUFFaEIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUVyQixVQUFLLEdBQVksS0FBSyxDQUFDO1FBRXZCLFdBQU0sR0FBWSxLQUFLLENBQUM7UUFFeEIsV0FBTSxHQUFXLENBQUMsQ0FBQztRQUVuQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBR3JCLGFBQVEsR0FBYSxFQUFFLENBQUM7UUFHcEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMs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