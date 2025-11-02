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
        this.gameName = 'TriplePanda';
    }
    init() {
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
        let totalWin = result.totalWin;
        let winLines = result.winLines;
        if (result.freeSpinResult.length > 0) {
            totalWin = result.freeSpinResult[result.freeSpinResult.length - 1].totalWin;
            winLines = result.freeSpinResult[result.freeSpinResult.length - 1].winLines;
        }
        _player.setRoundId(this.getRoundId(_player.uid));
        const record = (0, recordUtil_1.buildRecordResult)(_player.baseBet, _player.lineNumber, winLines.slice(0, 5));
        const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(_player.roundId, 1)
            .addResult(record)
            .setControlType(_player.controlType)
            .setGameRecordLivesResult(_player.buildLiveRecord(record, result.freeSpin, 1, result.window))
            .setGameRecordInfo(_player.totalBet, _player.totalBet, totalWin - _player.totalBet, false)
            .sendToDB(1);
        totalWin = playerRealWin;
        let _gold = gold;
        _player.settlement(totalWin, _gold);
        if (playerRealWin >= _player.totalBet * 25) {
            _player.isBigWin = true;
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
        _player.settlement(totalWin, _gold);
    }
    sendMaleScreen(player) {
        (0, MessageService_1.sendBigWinNotice)(this.nid, player.nickname, player.profit, player.isRobot, player.headurl);
    }
    sendBigWinner(player) {
        (0, MessageService_1.notice)({
            route: 'onBigWin',
            game: {
                nid: this.nid, nickname: player.nickname, name: this.gameName, num: player.profit, gold: '金币',
                odd: Math.floor(player.profit / player.totalBet),
            },
            uid: player.uid,
            nickname: player.nickname,
            content: '',
            des: ''
        }, function () { });
    }
    sendMailAndRemoveOfflinePlayer(player) {
        if (!player.onLine) {
            this.removePlayer(player);
        }
    }
    getTimeoutPlayers() {
        const now = Date.now();
        return this.getPlayers().filter(p => (now - p.lastOperationTime) > 120 * 1000);
    }
}
exports.default = RoomStandAlone;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL1RyaXBsZVBhbmRhL2xpYi9Sb29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0RBQWdFO0FBQ2hFLHlDQUFzQztBQUN0QywrQ0FBd0M7QUFDeEMsa0RBQXNEO0FBQ3RELHFFQUE0RTtBQUM1RSxxQ0FBOEI7QUFDOUIsb0RBQTJGO0FBQzNGLGtGQUErRTtBQUMvRSxtRkFBaUY7QUFTakYsTUFBcUIsY0FBZSxTQUFRLHlCQUEyQjtJQUtuRSxZQUFZLElBQVM7UUFDakIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBTGhCLGFBQVEsR0FBVyxhQUFhLENBQUM7SUFRakMsQ0FBQztJQUlELElBQUk7UUFDQSxJQUFJLENBQUMsU0FBUyxHQUFHLFdBQVcsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNwQyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUNoRCxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM5QyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN2QixJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBT0QsZUFBZSxDQUFDLE1BQVc7UUFFdkIsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2pCLE1BQU0sQ0FBQyxJQUFJLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQztTQUM3QjtRQUVELElBQUksVUFBVSxHQUFHLElBQUksZ0JBQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUd4QixVQUFVLENBQUMsTUFB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