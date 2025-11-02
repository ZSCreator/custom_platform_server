"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regulation = require("../../../domain/games/regulation");
const control_1 = require("./control");
const recordUtil_1 = require("./util/recordUtil");
const MessageService_1 = require("../../../services/MessageService");
const player_1 = require("./player");
const lotteryUtil_1 = require("./util/lotteryUtil");
const slotMachineRoom_1 = require("../../../common/classes/game/slotMachineRoom");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
class RoomStandAlone extends slotMachineRoom_1.default {
    constructor(opts) {
        super(opts);
        this.gameName = '亡灵之书';
        this.control = new control_1.default({ room: this });
    }
    init() {
        this.runJackpotTimer();
        this.kickTimer = setInterval(async () => {
            const timeoutPlayers = this.getTimeoutPlayers();
            await this.kickTimeoutPlayers(timeoutPlayers);
            timeoutPlayers.forEach(p => {
                this.removePlayer(p);
            });
        }, 50 * 1000);
    }
    addPlayerInRoom(player) {
        let currPlayer = new player_1.default(player, this);
        this.addMessage(player);
        currPlayer.onLine = true;
        this._players.set(player.uid, currPlayer);
        return true;
    }
    async lottery(_player) {
        _player.record.nextUse = regulation.selectRoulette(_player.record.nextUse);
        const wR = regulation.wholeRegulation(this.jackpot, this.runningPool);
        const [iR1] = (0, lotteryUtil_1.personalInternalControl)(_player.record.recordCount, _player.record.nextUse, _player.winPercentage, wR);
        const lotteryUtil = (0, lotteryUtil_1.crateSlotLottery)(_player.newer, _player.record.nextUse);
        lotteryUtil.setBetAndLineNum(_player.baseBet, _player.lineNumber)
            .setInternalControl(wR, iR1, false);
        lotteryUtil.setTotalBet(_player.totalBet);
        return await this.control.runControl(_player, lotteryUtil);
    }
    async boLottery(_player, color) {
        const lotteryUtil = (0, lotteryUtil_1.createBoLottery)(_player.disCards, _player.profit + _player.boProfit);
        lotteryUtil.setColor(color);
        return this.control.boControl(_player, lotteryUtil);
    }
    async settlement(_player) {
        const result = _player.result;
        const record = (0, recordUtil_1.buildNormalRecord)(_player, false, _player.baseBet, result.winLines);
        const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(_player.roundId, 1)
            .addResult(record)
            .setControlType(_player.controlType)
            .setGameRecordLivesResult(_player.buildLiveRecord(record))
            .setGameRecordInfo(_player.totalBet, _player.totalBet, result.totalWin + _player.boProfit - _player.totalBet, false)
            .sendToDB(1);
        let totalWin = playerRealWin, _gold = gold;
        if (result.freeSpin) {
            for (let i = 0, len = result.freeSpinResult.length; i < len; i++) {
                const freeSpinWin = result.freeSpinResult[i].totalWin;
                if (freeSpinWin > 0) {
                    const record = (0, recordUtil_1.buildNormalRecord)(_player, true, _player.baseBet, result.freeSpinResult[i].winLines);
                    const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
                        .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
                        .setGameInfo(this.nid, this.sceneId, this.roomId)
                        .setGameRoundInfo(_player.roundId, 1)
                        .addResult(record)
                        .setControlType(_player.controlType)
                        .setGameRecordLivesResult(_player.buildLiveRecord(record))
                        .setGameRecordInfo(0, 0, freeSpinWin, false)
                        .sendToDB(1);
                    result.freeSpinResult[i].totalWin = playerRealWin;
                    totalWin += playerRealWin;
                    _gold = gold;
                }
            }
        }
        _player.settlement(totalWin, _gold);
        if (playerRealWin >= _player.totalBet * 25 && playerRealWin > 100000) {
            this.sendMaleScreen(_player);
        }
        if (playerRealWin >= _player.totalBet * 20) {
            _player.isBigWin = true;
            this.sendBigWinner(_player);
        }
        this.deductRunningPool(playerRealWin);
    }
    sendMaleScreen(player) {
        (0, MessageService_1.sendBigWinNotice)(this.nid, player.nickname, player.profit, player.isRobot, player.headurl);
    }
    sendBigWinner(player) {
        (0, MessageService_1.notice)({
            route: 'onBigWin',
            game: {
                nid: this.nid,
                nickname: player.nickname,
                num: player.profit,
                odd: Math.floor(player.profit / player.totalBet),
            },
            uid: player.uid,
            nickname: player.nickname,
            content: '',
            des: '',
            language: player.language,
        }, function () { });
    }
    sendMailAndRemoveOfflinePlayer(player) {
        if (!player.onLine) {
            this.removePlayer(player);
        }
    }
    setRoundId(player) {
        player.setRoundId(this.getRoundId(player.uid));
    }
    getTimeoutPlayers() {
        const now = Date.now();
        return this.getPlayers().filter(p => (now - p.lastOperationTime) > 300 * 1000);
    }
}
exports.default = RoomStandAlone;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0RlYWRCb29rL2xpYi9yb29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0RBQWdFO0FBQ2hFLHVDQUFnQztBQUNoQyxrREFBb0Q7QUFDcEQscUVBQTRFO0FBQzVFLHFDQUE4QjtBQUM5QixvREFNNEI7QUFDNUIsa0ZBQStFO0FBQy9FLG1GQUFpRjtBQVVqRixNQUFxQixjQUFlLFNBQVEseUJBQTJCO0lBS25FLFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFMaEIsYUFBUSxHQUFXLE1BQU0sQ0FBQztRQU10QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFBO0lBQzVDLENBQUM7SUFJRCxJQUFJO1FBQ0EsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBRXZCLElBQUksQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQ3BDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ2hELE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzlDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFPRCxlQUFlLENBQUMsTUFBVztRQUN2QixJQUFJLFVBQVUsR0FBRyxJQUFJLGdCQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFHeEIsVUFB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