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
    constructor(props) {
        super(props);
        this.gameName = 'CashSlot';
        this.ChipList = props.ChipList;
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
        currPlayer.jackpot.mini = this.ChipList[0] * 50;
        currPlayer.jackpot.minor = this.ChipList[0] * 500;
        currPlayer.jackpot.Grand = this.ChipList[0] * 5000;
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
        _player.setRoundId(this.getRoundId(_player.uid));
        const record = (0, recordUtil_1.buildRecordResult)(_player.baseBet, result.freeSpinResult, result.winLines.slice(0, 5));
        const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(_player.roundId, 1)
            .addResult(record)
            .setControlType(_player.controlType)
            .setGameRecordLivesResult(_player.buildLiveRecord(record, result.freeSpin, 1, result.window))
            .setGameRecordInfo(_player.totalBet, _player.totalBet, result.totalWin + result.freeSpinResult.totalWin - _player.totalBet, false)
            .sendToDB(1);
        let totalWin = playerRealWin, _gold = gold;
        _player.settlement(totalWin, _gold);
        if (playerRealWin >= _player.totalBet * 20) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0Nhc2hTbG90L2xpYi9Sb29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0RBQWdFO0FBQ2hFLHlDQUFzQztBQUN0QywrQ0FBd0M7QUFDeEMsa0RBQXNEO0FBQ3RELHFFQUE0RTtBQUM1RSxxQ0FBOEI7QUFDOUIsb0RBQTJGO0FBQzNGLGtGQUErRTtBQUMvRSxtRkFBaUY7QUFTakYsTUFBcUIsY0FBZSxTQUFRLHlCQUEyQjtJQUtuRSxZQUFZLEtBQVU7UUFDbEIsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBTGpCLGFBQVEsR0FBVyxVQUFVLENBQUM7UUFNMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO0lBRW5DLENBQUM7SUFJRCxJQUFJO1FBQ0EsSUFBSSxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDcEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDaEQsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDOUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQU9ELGVBQWUsQ0FBQyxNQUFXO1FBRXZCLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNqQixNQUFNLENBQUMsSUFBSSxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUM7U0FDN0I7UUFFRCxJQUFJLFVBQVUsR0FBRyxJQUFJLGdCQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxV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