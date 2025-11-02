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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL01vb25QcmluY2Vzcy9saWIvUm9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUFvQztBQUNwQyxxRUFBNEU7QUFDNUUscUNBQThCO0FBQzlCLGtGQUErRTtBQUMvRSxvREFBK0U7QUFDL0Usa0RBQXNEO0FBQ3RELG1GQUFpRjtBQU9qRixNQUFxQixjQUFlLFNBQVEseUJBQTJCO0lBSW5FLFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFKaEIsYUFBUSxHQUFXLE1BQU0sQ0FBQztRQUMxQix1QkFBa0IsR0FBb0MsRUFBRSxDQUFDO0lBSXpELENBQUM7SUFJRCxJQUFJO1FBQ0EsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFNRCxlQUFlLENBQUMsTUFBVztRQUN2QixJQUFJLFVBQVUsR0FBRyxJQUFJLGdCQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDMUMsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUlELEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZTtRQUV6QixNQUFNLFdBQVcsR0FBRyxJQUFBLGlDQUFtQixFQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBR3JFLFdBQVcsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQzthQUNwQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7UUFHL0MsT0FBTyxNQUFNLGlCQUFXLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FB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