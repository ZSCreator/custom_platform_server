"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const recordUtil_1 = require("./util/recordUtil");
const pinus_logger_1 = require("pinus-logger");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
class dzPlayer extends PlayerInfo_1.PlayerInfo {
    constructor(i, opts, roomInfo) {
        super(opts);
        this.status = 'NONE';
        this.state = "PS_NONE";
        this.type = -1;
        this.typeSize = 0;
        this.holds = null;
        this.cardType = { cards: [], type: 0, prompt: [] };
        this.bet = 0;
        this.tatalBet = 0;
        this.isBet = false;
        this.isFold = false;
        this.profit = 0;
        this.recommendBet = [];
        this.playerType = '';
        this.gold = opts.gold;
        this.currGold = opts.gold > opts.currGold ? opts.currGold : opts.gold;
        this.seat = i;
        this.state = "PS_NONE";
    }
    initGame(holds) {
        this.holds = holds.map(c => c);
        this.status = 'GAME';
        this.initControlType();
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
        let flag = (this.isFold || roomInfo.roundTimes < 3);
        return {
            uid: this.uid,
            seat: this.seat,
            profit: this.profit,
            currGold: this.currGold,
            gold: this.gold,
            holds: flag ? null : this.holds,
            cardType: flag ? null : this.cardType,
            type: flag ? null : this.type,
            sumBetNum: this.tatalBet,
            roundTimes: roomInfo.roundTimes,
            isFold: this.isFold
        };
    }
    toGame(uid) {
        return {
            uid: this.uid,
            seat: this.seat,
            gold: this.gold,
            currGold: this.canUserGold(),
            bet: this.bet,
            tatalBet: this.tatalBet,
            holds: uid == this.uid ? this.holds : null,
            playerType: this.playerType,
            status: this.status
        };
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
        if (roomInfo._players.find(p => p && p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)) {
            roomInfo.zipResult = (0, recordUtil_1.buildRecordResult)(roomInfo._players, roomInfo.publicCardToSort);
        }
        try {
            this.gameRecordService = (0, RecordGeneralManager_1.default)();
            const res = await this.gameRecordService
                .setPlayerBaseInfo(this.uid, false, this.isRobot, this.gold)
                .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
                .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
                .setControlType(this.controlType)
                .setGameRecordInfo(Math.abs(this.tatalBet), Math.abs(this.tatalBet), this.profit - this.tatalBet, false)
                .addResult(roomInfo.zipResult)
                .setGameRecordLivesResult(roomInfo.record_history)
                .sendToDB(1);
            this.profit = res.playerRealWin;
            this.gold = res.gold;
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
    robotStrip() {
        return {
            uid: this.uid,
            type: this.type,
            cardType: this.cardType,
            seat: this.seat,
            isRobot: this.isRobot
        };
    }
    stripHolds() {
        return {
            uid: this.uid,
            holds: this.holds,
            type: this.type,
            isFold: this.isFold
        };
    }
    stripSelfPoker() {
        return {
            uid: this.uid,
            holds: this.holds,
            type: this.type,
            cardType: this.cardType,
        };
    }
    stripRobotNeed() {
        return {
            uid: this.uid,
            isRobot: this.isRobot,
            holds: this.holds,
            type: this.type,
        };
    }
    async handler_fold(roomInfo, type) {
        clearTimeout(roomInfo.Oper_timeout);
        roomInfo.recordDrawBefore(this, 0, type);
        this.state = "PS_NONE";
        await this.addMilitary(roomInfo);
        this.isFold = true;
        this.status = "NONE";
        roomInfo.channelIsPlayer('dz_onOpts', {
            type: 'fold',
            uid: this.uid,
            seat: this.seat,
            gold: this.gold,
            currGold: this.currGold,
        });
        const list = roomInfo._players.filter(pl => pl && pl.status == 'GAME' && !pl.isFold);
        if (list.length <= 1) {
            roomInfo.partPool();
            roomInfo.settlement();
        }
        else {
            roomInfo.nextStatus(this);
        }
    }
}
exports.default = dzPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHpQbGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9EWnBpcGVpL2xpYi9kelBsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVFQUFvRTtBQUNwRSx1RUFBb0U7QUFHcEUsa0RBQXNEO0FBQ3RELCtDQUF5QztBQUN6QyxtRkFBMkc7QUFDM0csTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUluRCxNQUFxQixRQUFTLFNBQVEsdUJBQVU7SUE4QjVDLFlBQVksQ0FBUyxFQUFFLElBQVMsRUFBRSxRQUFnQjtRQUM5QyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUE1QmhCLFdBQU0sR0FBNkIsTUFBTSxDQUFDO1FBRTFDLFVBQUssR0FBMEIsU0FBUyxDQUFBO1FBRXhDLFNBQUksR0FBVyxDQUFDLENBQUMsQ0FBQztRQUVsQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBR3JCLFVBQUssR0FBYSxJQUFJLENBQUM7UUFFdkIsYUFBUSxHQUF3RCxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFFbkcsUUFBRyxHQUFXLENBQUMsQ0FBQztRQUVoQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBRXJCLFVBQUssR0FBWSxLQUFLLENBQUM7UUFFdkIsV0FBTSxHQUFZLEtBQUssQ0FBQztRQUV4QixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBRW5CLGlCQUFZLEdBQWEsRUFBRSxDQUFDO1FBRTVCLGVBQVUsR0FBcUIsRUFBRSxDQUFDO1FBSTlCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxD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