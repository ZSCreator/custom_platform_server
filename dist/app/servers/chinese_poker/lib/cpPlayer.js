"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
class cpPlayer extends PlayerInfo_1.PlayerInfo {
    constructor(i, opts) {
        super(opts);
        this.status = 'NONE';
        this.biPai_status = false;
        this.cards = [];
        this.card_arr = [];
        this.specialType = 0;
        this.cardType1 = null;
        this.cardType2 = null;
        this.cardType3 = null;
        this.tmp_gain = 0;
        this.gain1 = 0;
        this.gain2 = 0;
        this.gain3 = 0;
        this.specialgain = 0;
        this.extension = [0, 0, 0, 0, 0, 0];
        this.profit = 0;
        this.sumgain = 0;
        this.shoot = [];
        this.holdStatus = 0;
        this.bet = 0;
        this.BiPaicards = [];
        this.initgold = 0;
        this.seat = i;
        this.gold = opts.gold || 0;
        this.initgold = this.gold;
    }
    stripRobot() {
        return {
            cards: this.BiPaicards,
            seat: this.seat,
            uid: this.uid,
            isRobot: this.isRobot,
            cardType1: this.cardType1,
            cardType2: this.cardType2,
            cardType3: this.cardType3,
            specialgain: this.specialgain
        };
    }
    prepare() {
        if (this.status != `NONE`)
            this.status = "WAIT";
        this.holdStatus = 0;
        this.cards = null;
        this.card_arr = null;
        this.cardType1 = null;
        this.extension = [0, 0, 0, 0, 0, 0];
        this.biPai_status = false;
        this.gain1 = 0;
        this.gain2 = 0;
        this.gain3 = 0;
        this.tmp_gain = 0;
        this.profit = 0;
        this.specialgain = 0;
        this.sumgain = 0;
        this.shoot = [];
        this.BiPaicards = [];
    }
    initGame(cards, bet) {
        this.status = 'GAME';
        this.cards = cards;
        this.bet = bet;
        this.initControlType();
    }
    wrapSettlement() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            seat: this.seat,
            cardType1: this.cardType1,
            cardType2: this.cardType2,
            cardType3: this.cardType3,
            specialType: this.specialType,
            gain1: this.gain1,
            gain2: this.gain2,
            gain3: this.gain3,
            tmp_gain: this.tmp_gain,
            specialgain: this.specialgain,
            sumgain: this.sumgain,
            last_profit: this.profit,
            shoot: this.shoot,
            extension: this.extension,
            BiPaicards: this.BiPaicards,
            biPai_status: this.biPai_status,
            gold: this.gold
        };
    }
    toGame(uid) {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: this.nickname,
            seat: this.seat,
            gold: this.gold,
            bet: this.bet,
            cards: uid == this.uid ? this.cards : null,
            card_arr: uid == this.uid ? this.card_arr : null,
            holdStatus: this.holdStatus,
            status: this.status,
            BiPaicards: uid == this.uid ? this.BiPaicards : null
        };
    }
    strip() {
        return {
            seat: this.seat,
            uid: this.uid,
            headurl: this.headurl,
            nickname: (this.nickname),
            gold: this.gold,
            status: this.status,
            holds: this.holdStatus == 1 ? this.cards : null,
            ip: this.ip,
            holdStatus: this.holdStatus,
            bet: this.bet,
            isRobot: this.isRobot,
            BiPaicards: this.BiPaicards
        };
    }
    Record_strip(roomInfo) {
        let cards = [];
        cards.push(...this.BiPaicards[0], ...this.BiPaicards[1], ...this.BiPaicards[2]);
        let shoot = [0, 0];
        if (this.shoot.length >= 1)
            shoot[0] = 1;
        roomInfo.players.forEach(m => {
            if (!!m && m.shoot.some(c => c.uid == this.uid))
                shoot[1] = 1;
        });
        return {
            uid: this.uid,
            nickname: (this.nickname),
            isRobot: this.isRobot,
            bet: this.bet,
            gain1: this.gain1,
            gain2: this.gain2,
            gain3: this.gain3,
            last_profit: this.profit,
            specialgain: this.specialgain,
            sumgain: this.sumgain,
            shoot: shoot,
            cards: cards,
            seat: this.seat,
        };
    }
    rechargeStrip() {
        return {
            uid: this.uid,
            seat: this.seat,
            gold: this.gold,
        };
    }
    kickStrip() {
        return {
            uid: this.uid,
            seat: this.seat
        };
    }
    async settlement(roomInfo) {
        let validBet = this.bet;
        if (Math.abs(this.profit) > this.bet && this.profit < 0) {
            validBet = Math.abs(this.profit);
        }
        this.gameRecordService = (0, RecordGeneralManager_1.default)();
        const res = await this.gameRecordService
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .setGameRecordInfo(Math.abs(this.bet), validBet, this.profit, false)
            .setControlType(this.controlType)
            .addResult(roomInfo.zipResult)
            .sendToDB(1);
        this.gold = res.gold;
        this.profit = res.playerRealWin;
    }
    async only_update_game(roomInfo) {
        await this.gameRecordService.Later_updateRecord(roomInfo.record_history);
    }
}
exports.default = cpPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3BQbGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9jaGluZXNlX3Bva2VyL2xpYi9jcFBsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVFQUFvRTtBQUtwRSxtRkFBMkc7QUFFM0csTUFBcUIsUUFBUyxTQUFRLHVCQUFVO0lBNkM1QyxZQUFZLENBQVMsRUFBRSxJQUFTO1FBQzVCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQTVDaEIsV0FBTSxHQUE2QixNQUFNLENBQUM7UUFFMUMsaUJBQVksR0FBWSxLQUFLLENBQUM7UUFFOUIsVUFBSyxHQUFhLEVBQUUsQ0FBQztRQUVyQixhQUFRLEdBQTBDLEVBQUUsQ0FBQztRQUVyRCxnQkFBVyxHQUF5QixDQUFDLENBQUM7UUFJdEMsY0FBUyxHQUFzQyxJQUFJLENBQUM7UUFFcEQsY0FBUyxHQUFzQyxJQUFJLENBQUM7UUFFcEQsY0FBUyxHQUFzQyxJQUFJLENBQUM7UUFFcEQsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUVyQixVQUFLLEdBQVcsQ0FBQyxDQUFDO1FBRWxCLFVBQUssR0FBVyxDQUFDLENBQUM7UUFFbEIsVUFBSyxHQUFXLENBQUMsQ0FBQztRQUVsQixnQkFBVyxHQUFXLENBQUMsQ0FBQztRQUV4QixjQUFTLEdBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRXpDLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFFbkIsWUFBTyxHQUFXLENBQUMsQ0FBQztRQUVwQixVQUFLLEdBQTBELEVBQUUsQ0FBQztRQUVsRSxlQUFVLEdBQVUsQ0FBQyxDQUFDO1FBRXRCLFFBQUcsR0FBVyxDQUFDLENBQUM7UUFDaEIsZUFBVSxHQUFlLEVBQUUsQ0FBQztRQUc1QixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBR2pCLElBQUksQ0FBQyxJQUFJLEdBQUcs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