"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const control_1 = require("./control");
const recordUtil_1 = require("./util/recordUtil");
const MessageService_1 = require("../../../services/MessageService");
const scratchPlayer_1 = require("./scratchPlayer");
const lotteryUtil_1 = require("./util/lotteryUtil");
const slotMachineRoom_1 = require("../../../common/classes/game/slotMachineRoom");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
class RoomStandAlone extends slotMachineRoom_1.default {
    constructor(opts) {
        super(opts);
        this.gameName = '刮刮乐';
    }
    init() {
    }
    addPlayerInRoom(player) {
        let currPlayer = new scratchPlayer_1.default(player);
        currPlayer.onLine = true;
        this._players.set(player.uid, currPlayer);
        return true;
    }
    async lottery(_player) {
        const lotteryUtil = (0, lotteryUtil_1.crateSlotLottery)();
        return await control_1.default.getControlInstance().runControl(_player, lotteryUtil);
    }
    async settlement(_player, result) {
        const record = (0, recordUtil_1.buildRecordResult)(_player, result.card);
        _player.setRoundId(this.getRoundId(_player.uid));
        const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(_player.roundId, 1)
            .addResult(record)
            .setControlType(_player.controlType)
            .setGameRecordLivesResult(_player.buildGameLiveResult(record))
            .setGameRecordInfo(_player.bet, _player.bet, result.totalWin - _player.bet)
            .sendToDB(1);
        _player.settlement(playerRealWin + _player.bet, gold);
        if (Math.floor(playerRealWin / _player.bet) >= 50) {
            this.sendMaleScreen(_player);
        }
    }
    sendMaleScreen(player) {
        (0, MessageService_1.sendBigWinNotice)(this.nid, player.nickname, player.profit, player.isRobot, player.headurl);
    }
}
exports.default = RoomStandAlone;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyYXRjaFJvb20uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9TY3JhdGNoL2xpYi9zY3JhdGNoUm9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHVDQUFvQztBQUNwQyxrREFBc0Q7QUFDdEQscUVBQW9FO0FBQ3BFLG1EQUFvQztBQUNwQyxvREFBeUU7QUFDekUsa0ZBQStFO0FBQy9FLG1GQUFpRjtBQVNqRixNQUFxQixjQUFlLFNBQVEseUJBQTJCO0lBR25FLFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFIaEIsYUFBUSxHQUFXLEtBQUssQ0FBQztJQUl6QixDQUFDO0lBSUQsSUFBSTtJQUNKLENBQUM7SUFNRCxlQUFlLENBQUMsTUFBVztRQUN2QixJQUFJLFVBQVUsR0FBRyxJQUFJLHVCQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEMsVUFBVSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMxQyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBSUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFlO1FBRXpCLE1BQU0sV0FBVyxHQUFHLElBQUEsOEJBQWdCLEdBQUUsQ0FBQztRQUd2QyxPQUFPLE1BQU0saUJBQVcsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQU9ELEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBZSxFQUFFLE1BQXlCO1FBQ3ZELE1BQU0sTUFBTSxHQUFHLElBQUEsOEJBQWlCLEVBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUd2RCxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDakQsTUFBTSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLElBQUEsOEJBQXlCLEdBQUU7YUFDNUQsaUJBQWlCLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRyxPQUFPLENBQUMsSUFBSSxDQUFDO2FBQ3JFLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQzthQUNoRCxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQzthQUNwQyxTQUFTLENBQUMsTUFBTSxDQUFDO2FBQ2pCLGNBQWMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO2FBQ25DLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUM3RCxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO2FBQzFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUdqQixPQUFPLENBQUMsVUFBVSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBUXRELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUMvQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ2hDO0lBQ0wsQ0FBQztJQUtELGNBQWMsQ0FBQyxNQUFjO1FBQ3pCLElBQUEsaUNBQWdCLEVBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDL0YsQ0FBQztDQUNKO0FBekVELGlDQXlFQyJ9