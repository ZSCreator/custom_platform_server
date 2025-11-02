"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regulation = require("../../../domain/games/regulation");
const control_1 = require("./control");
const MessageService_1 = require("../../../services/MessageService");
const Player_1 = require("./Player");
const slotMachineRoom_1 = require("../../../common/classes/game/slotMachineRoom");
const lotteryUtil_1 = require("./util/lotteryUtil");
const lotteryUtil_2 = require("./util/lotteryUtil");
const recordUtil_1 = require("./util/recordUtil");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
class RoomStandAlone extends slotMachineRoom_1.default {
    constructor(opts) {
        super(opts);
        this.gameName = '猴王传奇';
        this.removePlayerTimers = {};
    }
    init() {
        this.runJackpotTimer();
    }
    addPlayerInRoom(player) {
        let currPlayer = new Player_1.default(player, this);
        currPlayer.onLine = true;
        this._players.set(player.uid, currPlayer);
        return true;
    }
    async lottery(_player) {
        if (_player.gameRound < 5 && _player.totalBet < 300) {
            _player.record.nextUse = '1';
            _player.newer = true;
        }
        else {
            _player.newer = false;
        }
        _player.record.nextUse = regulation.selectRoulette(_player.record.nextUse);
        const wR = regulation.wholeRegulation(this.jackpot, this.runningPool);
        const [iR1, iR2] = (0, lotteryUtil_2.personalInternalControl)(_player.record.recordCount, _player.record.nextUse, _player.winPercentage, wR);
        const lotteryUtil = (0, lotteryUtil_1.crateXYJLottery)(_player.newer, _player.record.nextUse, this.jackpot);
        lotteryUtil.setBetAndLineNum(_player.baseBet, _player.lineNumber)
            .setInternalControl(wR, iR1, iR2)
            .setCharacterAndWinPercentage(_player.getCurrentCharacters(), _player.winPercentage);
        const result = await control_1.default.getControlInstance().runControl(_player, lotteryUtil);
        let freeSpinResult;
        if (result.characters.length === 5) {
            _player.setCharacters([]);
            freeSpinResult = lotteryUtil.freeResult();
        }
        else {
            _player.setCharacters(result.characters);
        }
        return { freeSpinResult, result };
    }
    async settlement(_player, result, freeSpinResult) {
        let totalWin = 0, _gold;
        _player.setRoundId(this.getRoundId(_player.uid));
        const record = (0, recordUtil_1.buildRecordResult)(_player.baseBet, _player.lineNumber, result);
        const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(_player.roundId, 1)
            .addResult(record)
            .setControlType(_player.controlType)
            .setGameRecordLivesResult(_player.buildLiveRecord(record))
            .setGameRecordInfo(_player.totalBet, _player.totalBet, result.allTotalWin - _player.totalBet, false)
            .sendToDB(1);
        totalWin += playerRealWin + _player.totalBet;
        _gold = gold;
        if (freeSpinResult) {
            freeSpinResult.totalWin = 0;
            for (let i = 0, len = freeSpinResult.results.length; i < len; i++) {
                const freeSpinWin = freeSpinResult.results[i].oneFreeResult.allTotalWin;
                if (freeSpinWin > 0) {
                    const record = (0, recordUtil_1.buildRecordResult)(_player.baseBet, _player.lineNumber, freeSpinResult.results[i].oneFreeResult);
                    const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
                        .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
                        .setGameInfo(this.nid, this.sceneId, this.roomId)
                        .setGameRoundInfo(_player.roundId, 1)
                        .addResult(record)
                        .setControlType(_player.controlType)
                        .setGameRecordLivesResult(_player.buildLiveRecord(record))
                        .setGameRecordInfo(0, 0, freeSpinWin, false)
                        .sendToDB(1);
                    freeSpinResult.results[i].oneFreeResult.allTotalWin = playerRealWin;
                    totalWin += playerRealWin;
                    freeSpinResult.totalWin += playerRealWin;
                    _gold = gold;
                }
            }
        }
        if (result.bonusGame) {
            _player.gameState = 2;
            _player.initBonusProfit(_player.totalBet);
        }
        _player.settlement(totalWin, _gold);
        if (totalWin >= _player.totalBet * 25 && totalWin > 100000) {
            this.sendMaleScreen(_player);
        }
        if (totalWin >= _player.totalBet * 20) {
            _player.isBigWin = true;
            this.sendBigWinner(_player);
        }
        this.deductRunningPool(playerRealWin + result.jackpotWin);
    }
    async bonusGameLottery(_player, over, selectTime) {
        const result = { isOver: false, profit: 0 };
        if (!over) {
            if (Math.random() < (selectTime > 1 ? 0.3 : 0.5)) {
                _player.bonusGameProfit *= 2;
                result.profit = _player.bonusGameProfit;
            }
            else {
                _player.bonusGameProfit = 0;
                result.isOver = true;
                _player.gameState = 1;
            }
        }
        else {
            _player.record.totalWin += _player.bonusGameProfit;
            _player.record.recordCount++;
            this.deductRunningPool(_player.bonusGameProfit);
            const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
                .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
                .setGameInfo(this.nid, this.sceneId, this.roomId)
                .setGameRoundInfo(_player.roundId, 1)
                .setControlType(_player.controlType)
                .setGameRecordInfo(_player.totalBet, _player.totalBet, _player.bonusGameProfit)
                .setGameRecordLivesResult(_player.buildLiveRecord('w'))
                .sendToDB(1);
            result.isOver = true;
            result.profit = playerRealWin;
            _player.gold = gold;
            _player.gameState = 1;
            _player.bonusGameProfit = 0;
        }
        return result;
    }
    sendMaleScreen(player) {
        (0, MessageService_1.sendBigWinNotice)(this.nid, player.nickname, player.profit, player.isRobot, player.headurl);
    }
    sendBigWinner(player) {
        (0, MessageService_1.notice)({
            route: 'onBigWin',
            game: {
                nid: this.nid, nickname: player.nickname,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3hpeW91amkvbGliL1Jvb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrREFBZ0U7QUFDaEUsdUNBQW9DO0FBQ3BDLHFFQUEwRTtBQUMxRSxxQ0FBOEI7QUFDOUIsa0ZBQStFO0FBQy9FLG9EQUF1RjtBQUN2RixvREFBNkQ7QUFDN0Qsa0RBQXNEO0FBQ3RELG1GQUFpRjtBQU9qRixNQUFxQixjQUFlLFNBQVEseUJBQTJCO0lBSW5FLFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFKaEIsYUFBUSxHQUFXLE1BQU0sQ0FBQztRQUMxQix1QkFBa0IsR0FBb0MsRUFBRSxDQUFDO0lBSXpELENBQUM7SUFJRCxJQUFJO1FBQ0EsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFNRCxlQUFlLENBQUMsTUFBVztRQUN2QixJQUFJLFVBQVUsR0FBRyxJQUFJLGdCQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDMUMsT0FBTyxJQUFJLENBQUE7SUFDZixDQUFDO0lBSUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFlO1FBRXpCLElBQUksT0FBTyxDQUFDLFNBQVMsR0FBRyxDQUFDLElBQUksT0FBTyxDQUFDLFFBQVEsR0FBRyxHQUFHLEVBQUU7WUFFakQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1lBQzdCLE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1NBQ3hCO2FBQU07WUFDSCxPQUFPLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztTQUN6QjtRQUdE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