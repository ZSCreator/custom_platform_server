"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regulation = require("../../../domain/games/regulation");
const control_1 = require("./control");
const MessageService_1 = require("../../../services/MessageService");
const Player_1 = require("./Player");
const lotteryUtil_1 = require("./util/lotteryUtil");
const slotMachineRoom_1 = require("../../../common/classes/game/slotMachineRoom");
const utils_1 = require("../../../utils/utils");
const treasureChest_1 = require("./config/treasureChest");
const pinus_logger_1 = require("pinus-logger");
const recordUtil_1 = require("./util/recordUtil");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
class RoomStandAlone extends slotMachineRoom_1.default {
    constructor(opts) {
        super(opts);
        this.gameName = '寻宝奇航';
        this.Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
    }
    init() {
    }
    addPlayerInRoom(player) {
        let currPlayer = new Player_1.default(player, this);
        currPlayer.onLine = true;
        this._players.set(player.uid, currPlayer);
        return true;
    }
    async lottery(_player) {
        _player.record.nextUse = regulation.selectRoulette(_player.record.nextUse);
        const lotteryUtil = (0, lotteryUtil_1.createPirateLottery)();
        lotteryUtil.setTotalBetAndMultiply(_player.totalBet, _player.multiply)
            .setFreeSpin(_player.freeSpinCount > 0);
        return await control_1.default.getControlInstance().runControl(_player, lotteryUtil);
    }
    async boxLottery(_player, index) {
        const treasureChest = _player.treasureChestList[index];
        treasureChest.open = true;
        treasureChest.visible = true;
        _player.keyCount--;
        let profit = 0;
        if (treasureChest.type === treasureChest_1.goldTreasureChest) {
            profit = treasureChest.specialAttributes * _player.totalBet;
        }
        else if (treasureChest.type === treasureChest_1.freeSpinTreasureChest) {
            _player.freeSpinCount += treasureChest.specialAttributes;
        }
        else if (treasureChest.type === treasureChest_1.perspectiveTreasureChest) {
            _player.treasureChestList.forEach(box => box.visible = true);
        }
        else if (treasureChest.type === treasureChest_1.keyTreasureChest) {
            _player.keyCount += treasureChest.specialAttributes;
        }
        if (profit > 0) {
            const record = (0, recordUtil_1.buildLittleGameResult)(_player.totalBet, treasureChest.specialAttributes);
            const roundId = (0, utils_1.genRoundId)(this.nid, this.roomId, _player.uid);
            const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
                .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
                .setGameInfo(this.nid, this.sceneId, this.roomId)
                .setGameRoundInfo(roundId, 1)
                .addResult(record)
                .setControlType(_player.controlType)
                .setGameRecordLivesResult(_player.buildLiveRecord(record))
                .setGameRecordInfo(0, 0, profit)
                .sendToDB(1);
            _player.gold = gold;
            profit = playerRealWin;
        }
        return profit;
    }
    async settlement(_player, result, isFreeSpin = false) {
        const bet = isFreeSpin ? 0 : _player.totalBet;
        _player.setRoundId(this.getRoundId(_player.uid));
        const record = (0, recordUtil_1.buildRecordResult)(_player.multiply, result, bet);
        const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(_player.roundId, 1)
            .addResult(record)
            .setControlType(_player.controlType)
            .setGameRecordLivesResult(_player.buildLiveRecord(record))
            .setGameRecordInfo(bet, bet, result.totalWin - bet)
            .sendToDB(1);
        _player.settlement(playerRealWin, result.goldCount, gold, isFreeSpin);
        if (isFreeSpin) {
            _player.freeSpinCount--;
        }
        if (playerRealWin >= _player.totalBet * 25 && playerRealWin > 100000) {
            this.sendMaleScreen(_player);
        }
        this.deductRunningPool(playerRealWin + result.jackpotWin);
    }
    sendMaleScreen(player) {
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
        }
    }
}
exports.default = RoomStandAlone;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3BpcmF0ZS9saWIvUm9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtEQUFnRTtBQUNoRSx1Q0FBb0M7QUFDcEMscUVBQXdEO0FBQ3hELHFDQUE4QjtBQUM5QixvREFBdUU7QUFDdkUsa0ZBQStFO0FBQy9FLGdEQUFrRDtBQUNsRCwwREFLZ0M7QUFDaEMsK0NBQXlDO0FBQ3pDLGtEQUE2RTtBQUM3RSxtRkFBaUY7QUFRakYsTUFBcUIsY0FBZSxTQUFRLHlCQUEyQjtJQUduRSxZQUFZLElBQVM7UUFDakIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBSGhCLGFBQVEsR0FBVyxNQUFNLENBQUM7UUFDMUIsV0FBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFHN0MsQ0FBQztJQUlELElBQUk7SUFDSixDQUFDO0lBTUQsZUFBZSxDQUFDLE1BQVc7UUFDdkIsSUFBSSxVQUFVLEdBQUcsSUFBSSxnQkFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxQyxVQUFVLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzFDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFJRCxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWU7UUFFekIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRzNFLE1BQU0sV0FBVyxHQUFHLElBQUEsaUNBQW1CLEdBQUUsQ0FBQztRQUMxQyxXQUFXLENBQUMsc0JBQXNCLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFP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