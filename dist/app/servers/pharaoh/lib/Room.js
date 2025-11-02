"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const control_1 = require("./control");
const MessageService_1 = require("../../../services/MessageService");
const Player_1 = require("./Player");
const slotMachineRoom_1 = require("../../../common/classes/game/slotMachineRoom");
const lotteryUtil_1 = require("./util/lotteryUtil");
const littleGame_1 = require("./config/littleGame");
const utils_1 = require("../../../utils");
const recordUtil_1 = require("./util/recordUtil");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
class RoomStandAlone extends slotMachineRoom_1.default {
    constructor(opts) {
        super(opts);
        this.gameName = '埃及夺宝';
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
        _player.setRoundId(this.getRoundId(_player.uid));
        const record = (0, recordUtil_1.buildRecordResult)(_player.gameLevel, result.winningDetails);
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
        _player.settlement(totalWin, gold);
        if (totalWin >= _player.totalBet * 20 && totalWin > 100000) {
            this.sendMaleScreen(_player);
        }
        if (totalWin >= _player.totalBet * 20) {
            _player.isBigWin = true;
            this.sendBigWinner(_player);
        }
        _player.addDetonator(result.roundDetonatorCount);
        if (_player.detonatorCount >= 45) {
            _player.initDetonatorCount();
        }
        _player.updateGameLevelAndPlayerGameState();
        this.deductRunningPool(playerRealWin + result.jackpotWin)
            .deductJackpot(result.jackpotWin);
    }
    async littleGameLottery(_player) {
        const count = (0, lotteryUtil_1.getThrowingCount)();
        _player.currentPosition += count;
        _player.throwCount = count;
        if (_player.currentPosition > littleGame_1.littleGameLayout[_player.littleGameLevel].length) {
            _player.currentPosition = littleGame_1.littleGameLayout[_player.littleGameLevel].length;
        }
        _player.historyPosition.push(_player.currentPosition);
        const awardType = littleGame_1.littleGameLayout[_player.littleGameLevel][_player.currentPosition - 1];
        _player.currentAwardType = awardType;
        const result = (0, lotteryUtil_1.throwingDiceResult)(_player.totalBet, awardType, _player.littleGameAccumulate, this.jackpot);
        _player.throwNum += (result.throwNum - 1);
        this.deductRunningPool(result.award[0]).deductJackpot(result.jackPotGain);
        if ((0, utils_1.sum)(result.award) > 0) {
            const record = (0, recordUtil_1.buildLittleGameResult)(_player.gameLevel, awardType);
            const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
                .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
                .setGameInfo(this.nid, this.sceneId, this.roomId)
                .setGameRoundInfo(_player.roundId, 1)
                .addResult(record)
                .setControlType(_player.controlType)
                .setGameRecordInfo(0, 0, (0, utils_1.sum)(result.award))
                .setGameRecordLivesResult(_player.buildLittleGameLiveResult(record))
                .sendToDB(1);
            _player.littleGameSettlement(playerRealWin, gold);
        }
        else {
            _player.littleGameWin = 0;
        }
        if (result.bigPrizeType) {
            this.sendBoxAwards(result, _player);
        }
        if (_player.throwNum === 0 || _player.currentPosition === littleGame_1.littleGameLayout[_player.littleGameLevel].length) {
            _player.setSpinState();
            if (_player.littleGameLevel === 3) {
                _player.customsClearance = true;
            }
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
    sendJackpotPrizeNotice(player, result) {
        result.jackpotTypeList.forEach((type, i) => {
            const jackpotType = type === 'king' ? 'colossal' : (type === 'diamond' ?
                'monster' : (type === 'platinum' ? 'mega' : 'mini'));
            (0, MessageService_1.notice)({
                route: 'onJackpotWin',
                game: {
                    nid: this.nid,
                    nickname: player.nickname,
                    name: '埃及夺宝',
                    num: result.jackpotWinList[i],
                    jackpotType,
                },
                uid: player.uid,
                language: player.language,
            });
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3BoYXJhb2gvbGliL1Jvb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1Q0FBb0M7QUFDcEMscUVBQTRFO0FBQzVFLHFDQUE4QjtBQUM5QixrRkFBK0U7QUFDL0Usb0RBQXFIO0FBQ3JILG9EQUF1RDtBQUN2RCwwQ0FBcUM7QUFDckMsa0RBQTJFO0FBQzNFLG1GQUFpRjtBQU9qRixNQUFxQixjQUFlLFNBQVEseUJBQTJCO0lBSW5FLFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFKaEIsYUFBUSxHQUFXLE1BQU0sQ0FBQztRQUMxQix1QkFBa0IsR0FBb0MsRUFBRSxDQUFDO0lBSXpELENBQUM7SUFJRCxJQUFJO1FBQ0EsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFNRCxlQUFlLENBQUMsTUFBVztRQUN2QixJQUFJLFVBQVUsR0FBRyxJQUFJLGdCQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDMUMsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUlELEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZTtRQUV6QixNQUFNLFdBQVcsR0FBRyxJQUFBLGlDQUFtQixFQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBR3JFLFdBQVcsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQzthQUNwQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7UUFHL0MsT0FBTyxNQUFNLGlCQUFXLENBQUMsa0JBQWtCLEVB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