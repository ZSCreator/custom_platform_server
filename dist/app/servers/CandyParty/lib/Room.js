"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const control_1 = require("./control");
const MessageService_1 = require("../../../services/MessageService");
const Player_1 = require("./Player");
const slotMachineRoom_1 = require("../../../common/classes/game/slotMachineRoom");
const lotteryUtil_1 = require("./util/lotteryUtil");
const recordUtil_1 = require("./util/recordUtil");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
class RoomStandAlone extends slotMachineRoom_1.default {
    constructor(opts) {
        super(opts);
        this.gameName = '糖果派对';
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
        const lotteryUtil = (0, lotteryUtil_1.cratePharaohLottery)(_player.newer, this.jackpot);
        lotteryUtil.setTotalBet(_player.totalBet)
            .setDetonatorCount(_player.detonatorCount);
        return await control_1.default.getControlInstance().runControl(_player, lotteryUtil);
    }
    async settlement(_player, result) {
        let totalWin = 0;
        let MeGold = 0;
        _player.setRoundId(this.getRoundId(_player.uid));
        const record = (0, recordUtil_1.buildRecordResult)(_player.gameLevel, result.winningDetails, result.odds);
        const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(_player.roundId, 1)
            .addResult(record)
            .setControlType(_player.controlType)
            .setGameRecordInfo(_player.totalBet, _player.totalBet, result.totalWin - _player.totalBet, false)
            .setGameRecordLivesResult(_player.buildGameLiveResult(record))
            .sendToDB(1);
        totalWin += playerRealWin + _player.totalBet;
        MeGold = gold;
        for (let i = 0, len = result.freeSpinResult.length; i < len; i++) {
            const freeSpinWin = result.freeSpinResult[i].totalWin;
            if (freeSpinWin > 0) {
                const record = (0, recordUtil_1.buildRecordResult)(_player.gameLevel, result.freeSpinResult[i].winningDetails, result.freeSpinResult[i].odds);
                const twoResult = await (0, RecordGeneralManager_1.default)()
                    .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
                    .setGameInfo(this.nid, this.sceneId, this.roomId)
                    .setGameRoundInfo(_player.roundId, 1)
                    .addResult(record)
                    .setControlType(_player.controlType)
                    .setGameRecordLivesResult(_player.buildGameLiveResult(record))
                    .setGameRecordInfo(0, 0, freeSpinWin, false)
                    .sendToDB(1);
                result.freeSpinResult[i].totalWin = twoResult.playerRealWin;
                totalWin += twoResult.playerRealWin;
                MeGold = twoResult.gold;
            }
        }
        _player.settlement(totalWin, MeGold);
        _player.addDetonator(result.roundDetonatorCount);
        if (_player.detonatorCount >= 45) {
            _player.initDetonatorCount();
        }
        _player.updateGameLevelAndPlayerGameState();
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
            if (!Reflect.has(this.removePlayerTimers, player.uid)) {
                this.removePlayer(player);
            }
        }
    }
    sendBoxAwards(result, player) {
        const type = result.bigPrizeType === 'king' ? 'colossal' : (result.bigPrizeType === 'diamond' ?
            'monster' : (result.bigPrizeType === 'platinum' ? 'mega' : 'mini'));
        (0, MessageService_1.notice)({
            route: 'onJackpotWin',
            game: {
                nid: this.nid,
                nickname: player.nickname,
                num: Math.floor(result.jackPotGain),
                jackpotType: type,
            },
            uid: player.uid,
            language: player.language,
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0NhbmR5UGFydHkvbGliL1Jvb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1Q0FBb0M7QUFDcEMscUVBQTRFO0FBQzVFLHFDQUE4QjtBQUM5QixrRkFBK0U7QUFDL0Usb0RBQStFO0FBQy9FLGtEQUFzRDtBQUN0RCxtRkFBaUY7QUFPakYsTUFBcUIsY0FBZSxTQUFRLHlCQUEyQjtJQUluRSxZQUFZLElBQVM7UUFDakIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBSmhCLGFBQVEsR0FBVyxNQUFNLENBQUM7UUFDMUIsdUJBQWtCLEdBQW9DLEVBQUUsQ0FBQztJQUl6RCxDQUFDO0lBSUQsSUFBSTtRQUNBLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBTUQsZUFBZSxDQUFDLE1BQVc7UUFDdkIsSUFBSSxVQUFVLEdBQUcsSUFBSSxnQkFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxQyxVQUFVLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzFDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFJRCxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWU7UUFFekIsTUFBTSxXQUFXLEdBQUcsSUFBQSxpQ0FBbUIsRUFBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUdyRSxXQUFXLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7YUFDcEMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRy9DLE9BQU8sTUFBTSxpQkFBVyxDQUFDLGtCQUFrQixFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8s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