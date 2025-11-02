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
        this.gameName = '77(3x3)';
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
        let result = await ControlImpl_1.default.getControlInstance(this).runControl(_player, lotteryUtil);
        if (result.totalWin > 0) {
            let doubleResult = (0, lotteryUtil_1.goldDoubleResult)(result.totalWin);
            if (doubleResult) {
                result.bankCard = doubleResult.bankCard;
            }
            _player.goldDoubleResult = doubleResult;
        }
        return result;
    }
    async goldDouble(_player) {
        let result = _player.goldDoubleResult;
        const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(_player.roundId, 1)
            .setControlType(_player.controlType)
            .setGameRecordLivesResult(_player.buildLiveRecord(result))
            .setGameRecordInfo(result.totalWin, result.totalWin, result.finallyWin - result.totalWin, false)
            .sendToDB(1);
        let totalWin = playerRealWin, _gold = gold;
        _player.settlement(totalWin, _gold);
        let bankCard = null;
        if (result.finallyWin > 0) {
            _player.playerWin = result.finallyWin;
            let doubleResult = (0, lotteryUtil_1.goldDoubleResult)(_player.playerWin);
            if (doubleResult) {
                bankCard = doubleResult.bankCard;
            }
            _player.goldDoubleResult = doubleResult;
        }
        return { gold: _player.gold, doubleResult: result, bankCard: bankCard };
    }
    async settlement(_player, result) {
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
        _player.settlement(totalWin, _gold);
        if (playerRealWin >= _player.totalBet * 25 && playerRealWin > 100000) {
            this.sendMaleScreen(_player);
        }
        if (playerRealWin >= _player.totalBet * 20) {
            _player.isBigWin = true;
            this.sendBigWinner(_player);
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3Nsb3RzNzcvbGliL1Jvb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrREFBZ0U7QUFDaEUseUNBQXNDO0FBQ3RDLCtDQUF3QztBQUN4QyxrREFBc0Q7QUFDdEQscUVBQTRFO0FBQzVFLHFDQUE4QjtBQUM5QixvREFBNkc7QUFDN0csa0ZBQStFO0FBQy9FLG1GQUFpRjtBQVNqRixNQUFxQixjQUFlLFNBQVEseUJBQTJCO0lBS25FLFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFMaEIsYUFBUSxHQUFXLFNBQVMsQ0FBQztJQVE3QixDQUFDO0lBSUQsSUFBSTtRQUNBLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUV2QixJQUFJLENBQUMsU0FBUyxHQUFHLFdBQVcsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNwQyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUNoRCxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM5QyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN2QixJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBT0QsZUFBZSxDQUFDLE1BQVc7UUFNdkIsSUFBSSxVQUFVLEdBQUcsSUFBSSxnQkFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBR3hCLFVBQVUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1B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