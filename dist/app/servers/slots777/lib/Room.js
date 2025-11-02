"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regulation = require("../../../domain/games/regulation");
const constant_1 = require("./constant");
const ControlImpl_1 = require("./ControlImpl");
const recordUtil_1 = require("./util/recordUtil");
const MessageService_1 = require("../../../services/MessageService");
const Player_1 = require("./Player");
const lotteryUtil_1 = require("./util/lotteryUtil");
const slotMachineRoom_1 = require("../../../common/classes/game/slotMachineRoom");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
class RoomStandAlone extends slotMachineRoom_1.default {
    constructor(opts) {
        super(opts);
        this.gameName = '幸运777';
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
        if (this.experience) {
            player.gold = 10000 * 100;
        }
        let currPlayer = new Player_1.default(player, this);
        this.addMessage(player);
        currPlayer.onLine = true;
        this._players.set(player.uid, currPlayer);
        return true;
    }
    async lottery(_player) {
        const openPoolAward = this.jackpot > (constant_1.maxAward * _player.baseBet);
        _player.record.nextUse = regulation.selectRoulette(_player.record.nextUse);
        const wR = regulation.wholeRegulation(this.jackpot, this.runningPool);
        const [iR1, iR2] = (0, lotteryUtil_1.personalInternalControl)(_player.record.recordCount, _player.record.nextUse, _player.winPercentage, wR);
        const lotteryUtil = (0, lotteryUtil_1.crateSlotLottery)(_player.newer, _player.record.nextUse);
        lotteryUtil.setBetAndLineNum(_player.baseBet, _player.lineNumber)
            .setInternalControl(wR, iR1, false)
            .setOpenPoolAward(openPoolAward);
        return await ControlImpl_1.default.getControlInstance(this).runControl(_player, lotteryUtil);
    }
    async settlement(_player, result) {
        if (this.experience) {
            return this.experienceRoomSettlement(_player, result);
        }
        _player.setRoundId(this.getRoundId(_player.uid));
        const record = (0, recordUtil_1.buildRecordResult)(_player.baseBet, _player.lineNumber, result.winLines);
        const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(_player.roundId, 1)
            .addResult(record)
            .setControlType(_player.controlType)
            .setGameRecordLivesResult(_player.buildLiveRecord(record))
            .setGameRecordInfo(_player.totalBet, _player.totalBet, result.totalWin - _player.totalBet, false)
            .sendToDB(1);
        let totalWin = playerRealWin, _gold = gold;
        if (result.freeSpin) {
            for (let i = 0, len = result.freeSpinResult.length; i < len; i++) {
                const freeSpinWin = result.freeSpinResult[i].totalWin;
                if (freeSpinWin > 0) {
                    const record = (0, recordUtil_1.buildRecordResult)(_player.baseBet, _player.lineNumber, result.freeSpinResult[i].winLines);
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
        this.deductRunningPool(playerRealWin + result.jackpotWin);
    }
    async experienceRoomSettlement(_player, result) {
        _player.setRoundId(this.getRoundId(_player.uid));
        const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRecordInfo(_player.totalBet, _player.totalBet, result.totalWin - _player.totalBet, false)
            .experienceSettlement(_player.gold);
        let totalWin = playerRealWin, _gold = gold;
        if (result.freeSpin) {
            for (let i = 0, len = result.freeSpinResult.length; i < len; i++) {
                const freeSpinWin = result.freeSpinResult[i].totalWin;
                if (freeSpinWin > 0) {
                    const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
                        .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
                        .setGameInfo(this.nid, this.sceneId, this.roomId)
                        .setGameRecordInfo(0, 0, freeSpinWin, false)
                        .experienceSettlement(_player.gold);
                    result.freeSpinResult[i].totalWin = playerRealWin;
                    totalWin += playerRealWin;
                    _gold = gold;
                }
            }
        }
        _player.settlement(totalWin, _gold);
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
    getTimeoutPlayers() {
        const now = Date.now();
        return this.getPlayers().filter(p => (now - p.lastOperationTime) > 300 * 1000);
    }
}
exports.default = RoomStandAlone;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3Nsb3RzNzc3L2xpYi9Sb29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0RBQWdFO0FBQ2hFLHlDQUFzQztBQUN0QywrQ0FBd0M7QUFDeEMsa0RBQXNEO0FBQ3RELHFFQUE0RTtBQUM1RSxxQ0FBOEI7QUFDOUIsb0RBQTJGO0FBQzNGLGtGQUErRTtBQUMvRSxtRkFBaUY7QUFTakYsTUFBcUIsY0FBZSxTQUFRLHlCQUEyQjtJQUtuRSxZQUFZLElBQVM7UUFDakIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBTGhCLGFBQVEsR0FBVyxPQUFPLENBQUM7SUFRM0IsQ0FBQztJQUlELElBQUk7UUFDQSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFFdkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDcEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDaEQsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDOUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQU9ELGVBQWUsQ0FBQyxNQUFXO1FBRXZCLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNqQixNQUFNLENBQUMsSUFBSSxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUM7U0FDN0I7UUFFRCxJQUFJLFVBQVUsR0FBRyxJQUFJLGdCQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxD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