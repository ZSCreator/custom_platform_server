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
        this.gameName = 'caishen';
    }
    init() {
        this.kickTimer = setInterval(async () => {
            const timeoutPlayers = this.getTimeoutPlayers();
            await this.kickTimeoutPlayers(timeoutPlayers);
            timeoutPlayers.forEach(p => {
                this.removePlayer(p);
            });
        }, 50 * 1000);
        this.runJackpotTimer();
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
        lotteryUtil.setBetAndLineNum(_player.baseBet, 0)
            .setInternalControl(wR, iR1, false)
            .setOpenPoolAward(openPoolAward);
        return await ControlImpl_1.default.getControlInstance(this).runControl(_player, lotteryUtil);
    }
    async settlement(_player, result) {
        let totalWin = result.totalWin;
        let winLines = result.winLines;
        _player.setRoundId(this.getRoundId(_player.uid));
        const record = (0, recordUtil_1.buildRecordResult)(_player.baseBet, winLines);
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
        for (const freeSpinWin of result.freeSpinResult) {
            if (freeSpinWin.totalWin > 0) {
                const record = (0, recordUtil_1.buildRecordResult)(_player.baseBet, freeSpinWin.winLines);
                const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
                    .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
                    .setGameInfo(this.nid, this.sceneId, this.roomId)
                    .setGameRoundInfo(_player.roundId, 1)
                    .addResult(record)
                    .setControlType(_player.controlType)
                    .setGameRecordLivesResult(_player.buildLiveRecord(record, result.freeSpin, 1, result.window))
                    .setGameRecordInfo(0, 0, freeSpinWin.totalWin, false)
                    .sendToDB(1);
                totalWin += playerRealWin;
                _gold = gold;
            }
        }
        _player.settlement(totalWin, _gold);
        if (playerRealWin >= _player.totalBet * 20) {
            _player.isBigWin = true;
        }
        this.deductRunningPool(playerRealWin + result.jackpotWin);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2NhaXNoZW4vbGliL1Jvb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrREFBZ0U7QUFDaEUseUNBQXNDO0FBQ3RDLCtDQUF3QztBQUN4QyxrREFBc0Q7QUFDdEQscUVBQTRFO0FBQzVFLHFDQUE4QjtBQUM5QixvREFBMkY7QUFDM0Ysa0ZBQStFO0FBQy9FLG1GQUFpRjtBQVNqRixNQUFxQixjQUFlLFNBQVEseUJBQTJCO0lBS25FLFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFMaEIsYUFBUSxHQUFXLFNBQVMsQ0FBQztJQVE3QixDQUFDO0lBSUQsSUFBSTtRQUNBLElBQUksQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQ3BDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ2hELE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzlDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFPRCxlQUFlLENBQUMsTUFBVztRQUV2QixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDakIsTUFBTSxDQUFDLElBQUksR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDO1NBQzdCO1FBRUQsSUFBSSxVQUFVLEdBQUcsSUFBSSxnQkFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FB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