"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regulation = require("../../../domain/games/regulation");
const control_1 = require("./control");
const recordUtil_1 = require("./util/recordUtil");
const MessageService_1 = require("../../../services/MessageService");
const Player_1 = require("./Player");
const lotteryUtil_1 = require("./util/lotteryUtil");
const slotMachineRoom_1 = require("../../../common/classes/game/slotMachineRoom");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const constant_1 = require("./constant");
class RoomStandAlone extends slotMachineRoom_1.default {
    constructor(opts) {
        super(opts);
        this.gameName = 'halloween';
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
        }, 30 * 1000);
    }
    addPlayerInRoom(player) {
        let currPlayer = new Player_1.default(player, this);
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
        lotteryUtil.setBet(_player.baseBet)
            .setInternalControl(wR, iR1, false);
        return await this.control.runControl(_player, lotteryUtil);
    }
    clayPotLottery() {
        return (0, lotteryUtil_1.getClayPotLotteryResult)();
    }
    async subGameSettlement(player, profit, record) {
        const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(player.uid, false, player.isRobot, player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(player.roundId, 1)
            .addResult(record)
            .setGameRecordLivesResult(player.buildLiveRecord(record))
            .setGameRecordInfo(0, 0, profit, false)
            .sendToDB(1);
        player.settlement(playerRealWin, gold);
    }
    async clayPotSettlement(player, result) {
        if (result === constant_1.ClayPotGameElementType.Bonus) {
            player.clayPotGameBonusCount *= 2;
            return;
        }
        const profit = result * player.baseBet * player.clayPotGameBonusCount;
        await this.subGameSettlement(player, profit, (0, recordUtil_1.buildClayPotGameRecord)(player.baseBet, profit, player.clayPotGameBonusCount, result));
        player.setSubGameType(null);
    }
    diceGameLottery() {
        return (0, lotteryUtil_1.getDiceLotteryResult)();
    }
    async diceSettlement(player, result) {
        const profit = result * player.baseBet * constant_1.DICE_GAME_BONUS;
        await this.subGameSettlement(player, profit, (0, recordUtil_1.buildDiceGameRecord)(player.baseBet, profit, constant_1.DICE_GAME_BONUS, result));
        player.setSubGameType(null);
    }
    turntableGameLottery() {
        return (0, lotteryUtil_1.getTurntableLotteryResult)();
    }
    async turntableSettlement(player, result) {
        const profit = result * player.baseBet * constant_1.TURNTABLE_BONUS;
        100 * 70 * 21;
        await this.subGameSettlement(player, profit, (0, recordUtil_1.buildTurnTableGameRecord)(player.baseBet, profit, constant_1.TURNTABLE_BONUS, result));
        player.setSubGameType(null);
    }
    async orchardSettlement(player, result) {
        player.orchardGameResults.push(result);
        if (result === constant_1.OrchardGameElementType.None) {
            await this.subGameSettlement(player, player.orchardProfit, (0, recordUtil_1.buildOrchardGameRecord)(player.baseBet, player.orchardProfit, player.orchardProfit / player.baseBet, player.orchardGameResults));
            player.setSubGameType(null);
            return;
        }
        const profit = result * player.baseBet;
        player.orchardProfit += profit;
        player.profit = profit;
    }
    async settlement(_player, result) {
        _player.setRoundId(this.getRoundId(_player.uid));
        const record = (0, recordUtil_1.buildRecordResult)(_player.baseBet, result);
        const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(_player.roundId, 1)
            .addResult(record)
            .setControlType(_player.controlType)
            .setGameRecordLivesResult(_player.buildLiveRecord(record))
            .setGameRecordInfo(_player.totalBet, _player.totalBet, result.totalWin - _player.totalBet, false)
            .sendToDB(1);
        _player.settlement(playerRealWin, gold);
        _player.setSubGameType(result.subGame.type);
        if (playerRealWin >= _player.totalBet * 25 && playerRealWin > 100000) {
        }
        if (playerRealWin >= _player.totalBet * 20) {
            _player.isBigWin = true;
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
    getPrizePool() {
        return 500000000 + this.runningPool;
    }
    getTimeoutPlayers() {
        const now = Date.now();
        return this.getPlayers().filter(p => {
            return (!p.subGameType || !p.isOnLine) && (now - p.lastOperationTime) > 300 * 1000;
        });
    }
}
exports.default = RoomStandAlone;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2hhbGxvd2Vlbi9saWIvUm9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtEQUFnRTtBQUNoRSx1Q0FBZ0M7QUFDaEMsa0RBSzJCO0FBQzNCLHFFQUEwRTtBQUMxRSxxQ0FBOEI7QUFDOUIsb0RBTzRCO0FBQzVCLGtGQUErRTtBQUMvRSxtRkFBaUY7QUFDakYseUNBQTRHO0FBUzVHLE1BQXFCLGNBQWUsU0FBUSx5QkFBMkI7SUFLbkUsWUFBWSxJQUFTO1FBQ2pCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUxoQixhQUFRLEdBQVcsV0FBVyxDQUFDO1FBTzNCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUlELElBQUk7UUFDQSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDcEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDaEQsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDOUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQU9ELGVBQWUsQ0FBQyxNQUFXO1FBQ3ZCLElBQUksVUFBVSxHQUFHLElBQUksZ0JBQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMs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