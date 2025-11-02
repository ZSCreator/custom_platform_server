"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
class ldPlayer extends PlayerInfo_1.PlayerInfo {
    constructor(i, opts) {
        super(opts);
        this.status = "NONE";
        this.state = "PS_NONE";
        this.bet_mul = 0;
        this.profit = 0;
        this.Grab_num = -1;
        this.HoleCard = [];
        this.initgold = 0;
        this.seat = i;
        this.gold = opts.gold;
        this.initgold = this.gold;
    }
    initGame() {
        this.status = "GAME";
        this.HoleCard = [];
        this.bet_mul = 0;
        this.Grab_num = -1;
        this.profit = 0;
        this.initControlType();
    }
    strip() {
        return {
            seat: this.seat,
            uid: this.uid,
            headurl: this.headurl,
            nickname: encodeURI(this.nickname),
            gold: this.gold,
            status: this.status,
            bet_mul: this.bet_mul,
            profit: this.profit,
            HoleCard: this.HoleCard,
        };
    }
    async updateGold(roomInfo) {
        this.gameRecordService = (0, RecordGeneralManager_1.default)();
        if (this.profit < 0 && Math.abs(this.profit) > this.gold) {
            this.profit = -this.gold;
        }
        const res = await this.gameRecordService
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .setGameRecordInfo(Math.abs(this.profit), Math.abs(this.profit), this.profit, false)
            .setControlType(this.controlType)
            .setGameRecordLivesResult(roomInfo.record_history)
            .sendToDB(1);
        this.gold = res.gold;
        this.initgold = this.gold;
        this.profit = res.playerRealWin;
    }
    async only_update_game(roomInfo) {
        await this.gameRecordService.Later_updateRecord(roomInfo.record_history);
    }
    handler_grab(roomInfo, Grab_num) {
        this.Grab_num = Grab_num;
        roomInfo.channelIsPlayer("Erba.note_grab", { seat: this.seat, Grab_num });
        roomInfo.record_history.oper.push({ seat: this.seat, Grab_num, uid: this.uid });
        const gamePlayer = roomInfo.players.filter(pl => !!pl);
        if (gamePlayer.every(c => c && c.Grab_num >= 0)) {
            roomInfo.handler_banker();
        }
    }
    handler_Bet(roomInfo, bet_mul) {
        this.bet_mul = bet_mul;
        roomInfo.channelIsPlayer("Erba.note_bet_mul", { seat: this.seat, bet_mul });
        roomInfo.record_history.oper.push({ seat: this.seat, bet_mul, uid: this.uid });
        const gamePlayer = roomInfo.players.filter(pl => pl && pl.uid != roomInfo.banker.uid);
        if (gamePlayer.every(c => c.bet_mul > 0)) {
            roomInfo.handler_sice();
        }
    }
}
exports.default = ldPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXJiYVBsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0VyYmEvbGliL0VyYmFQbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1RUFBb0U7QUFNcEUsbUZBQTJHO0FBRzNHLE1BQXFCLFFBQVMsU0FBUSx1QkFBVTtJQXNCNUMsWUFBWSxDQUFTLEVBQUUsSUFBUztRQUM1QixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFwQmhCLFdBQU0sR0FBNkIsTUFBTSxDQUFDO1FBRTFDLFVBQUssR0FBMEIsU0FBUyxDQUFBO1FBRXhDLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFHcEIsV0FBTSxHQUFXLENBQUMsQ0FBQztRQU9uQixhQUFRLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFdEIsYUFBUSxHQUFhLEVBQUUsQ0FBQztRQUV4QixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBR2pCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztJQUM5QixDQUFDO0lBR0QsUUFBUTtRQUNKLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFFRCxLQUFLO1FBQ0QsT0FBTztZQUNILElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztZQUNi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