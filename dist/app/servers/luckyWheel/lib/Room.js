"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MessageService_1 = require("../../../services/MessageService");
const Player_1 = require("./Player");
const slotMachineRoom_1 = require("../../../common/classes/game/slotMachineRoom");
const lotteryUtil_1 = require("./util/lotteryUtil");
const recordUtil_1 = require("./util/recordUtil");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const control_1 = require("./control");
class RoomStandAlone extends slotMachineRoom_1.default {
    constructor(opts) {
        super(opts);
        this.gameName = '幸运转盘';
        this.removePlayerTimers = {};
        this.control = new control_1.default({ room: this });
    }
    init() {
    }
    addPlayerInRoom(player) {
        let currPlayer = new Player_1.default(player, this);
        currPlayer.onLine = true;
        this._players.set(player.uid, currPlayer);
        return true;
    }
    async lottery(_player) {
        const lotteryUtil = (0, lotteryUtil_1.createLWLottery)(_player.totalBet);
        return await this.control.runControl(_player, lotteryUtil);
    }
    async settlement(_player, result) {
        let totalWin = 0, _gold;
        _player.setRoundId(this.getRoundId(_player.uid));
        const record = (0, recordUtil_1.buildRecordResult)(_player.totalBet, result);
        const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(_player.roundId, 1)
            .addResult(record)
            .setControlType(_player.controlType)
            .setGameRecordLivesResult(_player.buildLiveRecord(record, result.result))
            .setGameRecordInfo(_player.totalBet, _player.totalBet, result.profit - _player.totalBet, false)
            .sendToDB(1);
        totalWin += playerRealWin + _player.totalBet;
        _gold = gold;
        _player.settlement(totalWin, _gold);
    }
    sendMaleScreen(player) {
        (0, MessageService_1.sendBigWinNotice)(this.nid, player.nickname, player.profit, player.isRobot, player.headurl);
    }
    sendBigWinner(player) {
    }
    sendMailAndRemoveOfflinePlayer(player) {
        if (!player.onLine) {
            if (!Reflect.has(this.removePlayerTimers, player.uid)) {
                this.removePlayer(player);
            }
        }
    }
    setRemovePlayerTimer(player) {
        this.removePlayerTimers[player.uid] = setTimeout(async () => {
            this.deleteTimer(player);
            await this.removeOfflinePlayer(player);
        }, 60 * 1000);
    }
    deleteTimer(player) {
        clearTimeout(this.removePlayerTimers[player.uid]);
        Reflect.deleteProperty(this.removePlayerTimers, player.uid);
    }
}
exports.default = RoomStandAlone;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2x1Y2t5V2hlZWwvbGliL1Jvb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxRUFBb0U7QUFDcEUscUNBQThCO0FBQzlCLGtGQUErRTtBQUMvRSxvREFBb0U7QUFDcEUsa0RBQXNEO0FBQ3RELG1GQUFpRjtBQUNqRix1Q0FBZ0M7QUFPaEMsTUFBcUIsY0FBZSxTQUFRLHlCQUEyQjtJQUtuRSxZQUFZLElBQVM7UUFDakIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBTGhCLGFBQVEsR0FBVyxNQUFNLENBQUM7UUFDMUIsdUJBQWtCLEdBQW9DLEVBQUUsQ0FBQztRQUN6RCxZQUFPLEdBQVksSUFBSSxpQkFBTyxDQUFDLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7SUFJN0MsQ0FBQztJQUlELElBQUk7SUFDSixDQUFDO0lBTUQsZUFBZSxDQUFDLE1BQVc7UUFDdkIsSUFBSSxVQUFVLEdBQUcsSUFBSSxnQkFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxQyxVQUFVLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzFDLE9BQU8sSUFBSSxDQUFBO0lBQ2YsQ0FBQztJQUlELEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZTtRQUV6QixNQUFNLFdBQVcsR0FBRyxJQUFBLDZCQUFlLEVBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXRELE9BQU8sTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQU9ELEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBZSxFQUFFLE1BQXVCO1FBQ3JELElBQUksUUFBUSxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUM7UUFHeEIsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sTUFBTSxHQUFHLElBQUEsOEJBQWlCLEVBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMzRCxNQUFNLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sSUFBQSw4QkFBeUIsR0FBRTthQUM1RCxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7YUFDckUsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDO2FBQ2hELGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFFO2FBQ3JDLFNBQVMsQ0FBQyxNQUFNLENBQUM7YUFDakIsY0FBYyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUM7YUFDbkMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3hFLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDO2FBQzlGLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVqQixRQUFRLElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7UUFDN0MsS0FBSyxHQUFHLElBQUksQ0FBQztRQUdiLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBWXhDLENBQUM7SUFLRCxjQUFjLENBQUMsTUFBYztRQUN6QixJQUFBLGlDQUFnQixFQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzlGLENBQUM7SUFNRCxhQUFhLENBQUMsTUFBYztJQWE1QixDQUFDO0lBTUQsOEJBQThCLENBQUMsTUFBYztRQUN6QyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQVFoQixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNuRCxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzdCO1NBQ0o7SUFDTCxDQUFDO0lBTUQsb0JBQW9CLENBQUMsTUFBYztRQUMvQixJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUV4RCxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBR3pCLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNDLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQU1ELFdBQVcsQ0FBQyxNQUFjO1FBQ3RCLFlBQVksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDbEQsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7Q0FDSjtBQTVJRCxpQ0E0SUMifQ==