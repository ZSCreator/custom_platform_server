"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const player_1 = require("./player");
const slotMachineRoom_1 = require("../../../common/classes/game/slotMachineRoom");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const lotteryUtil_1 = require("./util/lotteryUtil");
const attConst_1 = require("./attConst");
const control_1 = require("./control");
const roomUtil_1 = require("./util/roomUtil");
const pinus_1 = require("pinus");
const MessageService_1 = require("../../../services/MessageService");
class RoomStandAlone extends slotMachineRoom_1.default {
    constructor(opts) {
        super(opts);
        this.gameName = '皇家连环炮';
        this.offlinePlayersMap = new Map();
    }
    init() {
    }
    addOfflinePlayer(player) {
        player.isOnLine = false;
        const timer = setTimeout(async () => {
            player.conversionRetainCards(player.cards.slice());
            await this.lottery(player);
            await this.settlement(player, true);
            await this.kickingPlayer(pinus_1.pinus.app.getServerId(), [player]);
            this.removePlayer(player);
            this.offlinePlayersMap.delete(player.uid);
        }, 180 * 1000);
        this.offlinePlayersMap.set(player.uid, timer);
    }
    removeOfflineTimer(uid) {
        clearTimeout(this.offlinePlayersMap.get(uid));
    }
    addPlayerInRoom(player) {
        let currPlayer = new player_1.default(player, this);
        currPlayer.onLine = true;
        this._players.set(player.uid, currPlayer);
        return true;
    }
    async initPlayerCards(player) {
        const lotteryUtil = (0, lotteryUtil_1.createLotteryUtil)(attConst_1.GameState.Deal, player.baseBet, player.roundCount);
        const result = await control_1.default.getControlInstance(this).runControl(player, lotteryUtil);
        player.cards = result.cards;
        player.gameState = attConst_1.GameState.Deal;
        player.setRoundId(this.getRoundId(player.uid));
    }
    async lottery(player) {
        const lotteryUtil = (0, lotteryUtil_1.createLotteryUtil)(attConst_1.GameState.Again, player.baseBet, player.roundCount);
        lotteryUtil.setCards(player.retainCards);
        let result;
        if (player.retainCards.length === 5) {
            result = lotteryUtil.result();
        }
        else {
            result = await control_1.default.getControlInstance(this).runControl(player, lotteryUtil);
        }
        player.setProfit(result.totalWin);
        player.cardsList = result.resultList;
        return result;
    }
    async settlement(player, end) {
        if (end) {
            const record = (0, roomUtil_1.buildRecordResult)(player);
            const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
                .setPlayerBaseInfo(player.uid, false, player.isRobot, player.gold)
                .setGameInfo(this.nid, this.sceneId, this.roomId)
                .setGameRoundInfo(player.roundId, 1)
                .addResult(record)
                .setControlType(player.controlType)
                .setGameRecordLivesResult(player.buildLiveRecord(record))
                .setGameRecordInfo(player.totalBet, player.totalBet, player.profit - player.totalBet, false)
                .sendToDB(1);
            player.settlement(playerRealWin + player.totalBet, gold);
            player.init();
            if (playerRealWin >= player.totalBet * 25 && playerRealWin > 100000) {
                this.sendBigWinner(player);
            }
        }
    }
    async boLottery(player, color) {
        const lotteryUtil = (0, lotteryUtil_1.createLotteryUtil)(attConst_1.GameState.Bo, player.baseBet, player.roundCount);
        lotteryUtil.setBoCurrentProfit(player.profit)
            .setDisCardsAndColor(player.foldCards, color);
        const result = await control_1.default.getControlInstance(this).runControl(player, lotteryUtil);
        player.boRecords.push({ color, profit: result.totalWin, multiple: result.multiple, card: result.card });
        player.setProfit(result.totalWin);
        player.foldCards.push(result.card);
        return result;
    }
    playerReadyBo(player) {
        player.gameState = attConst_1.GameState.Bo;
        player.foldCards = (0, lotteryUtil_1.getRandomOfCards)(5);
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
        });
    }
}
exports.default = RoomStandAlone;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2F0dC9saWIvcm9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUE4QjtBQUM5QixrRkFBK0U7QUFDL0UsbUZBQWlGO0FBQ2pGLG9EQUFvRjtBQUNwRix5Q0FBdUM7QUFDdkMsdUNBQWdDO0FBQ2hDLDhDQUFvRDtBQUNwRCxpQ0FBOEI7QUFDOUIscUVBQXdEO0FBU3hELE1BQXFCLGNBQWUsU0FBUSx5QkFBMkI7SUFJbkUsWUFBWSxJQUFTO1FBQ2pCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUpoQixhQUFRLEdBQVcsT0FBTyxDQUFDO1FBQzNCLHNCQUFpQixHQUFnQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBSTNELENBQUM7SUFJRCxJQUFJO0lBQ0osQ0FBQztJQU1ELGdCQUFnQixDQUFDLE1BQWM7UUFDM0IsTUFBTSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDeEIsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssSUFBSSxFQUFFO1lBRWhDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDbkQsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFHcEMsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUMsQ0FBQyxFQUFF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