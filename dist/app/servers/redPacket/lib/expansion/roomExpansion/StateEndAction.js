"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const GameStatusEnum_1 = require("../../enum/GameStatusEnum");
const PlayerGameStatusEnum_1 = require("../../enum/PlayerGameStatusEnum");
const RedPacketGameStatusEnum_1 = require("../../enum/RedPacketGameStatusEnum");
const utils = require("../../../../../utils/index");
const roomUtil_1 = require("../../util/roomUtil");
const mailModule = require("../../../../../modules/mailModule");
const RoleEnum_1 = require("../../../../../common/constant/player/RoleEnum");
const RecordGeneralManager_1 = require("../../../../../common/dao/RecordGeneralManager");
const GameRecordDateTable_mysql_dao_1 = require("../../../../../common/dao/mysql/GameRecordDateTable.mysql.dao");
const logger = (0, pinus_1.getLogger)("server_out", __filename);
class StateEndAction {
    constructor(room) {
        this.room = room;
    }
    static getInstance(room, paramRoomCode) {
        if (this.roomCodeList.findIndex(roomId => roomId === paramRoomCode) < 0) {
            this.roomCodeList.push(paramRoomCode);
            this.instanceMap[paramRoomCode] = new StateEndAction(room);
        }
        return this.instanceMap[paramRoomCode];
    }
    initSettleTime() {
        this.room.tmp_countDown = this.room.settleCountDown;
    }
    async settedCurrentGame2() {
        var e_1, _a;
        let grabberResult = [];
        let handoutResult;
        const poolBaseParams = { nid: this.room.nid, sceneId: this.room.sceneId };
        const mineOfRedPacketList = this.room.redPackQueue.filter(redPacketInfo => redPacketInfo.status === RedPacketGameStatusEnum_1.RedPacketGameStatusEnum.GAME);
        if (mineOfRedPacketList.length === 0) {
            logger.error(`红包扫雷|房间:${this.room.roomId}|场:${this.room.sceneId}|第:${this.room.roundTimes}轮
       结算时出错,在红包队列"redPackQueue"查询不到应结算的红包。
       当前红包队列:${JSON.stringify(this.room.redPackQueue)}；
       参与抢包者信息:${JSON.stringify(this.room.currentGraberQueue)}。
       现初始化"游戏过程属性"等，进行下一轮
       `);
            this.room.currentRedPacketList = [];
            this.room.currentGraberQueue = [];
            this.room.tmp_countDown = -1;
            this.room.changeGameStatues(GameStatusEnum_1.GameStatusEnum.WAIT);
            return;
        }
        const playerListInGameStatus = this.room.players.filter((player) => player.status === PlayerGameStatusEnum_1.PlayerGameStatusEnum.GAME);
        this.room.zipResult = (0, roomUtil_1.buildRecordResult)(this.room.currentGraberQueue);
        this.room.updateRealPlayersNumber();
        const playerGameRecordList = new Map();
        let tableName = null;
        try {
            for (var playerListInGameStatus_1 = __asyncValues(playerListInGameStatus), playerListInGameStatus_1_1; playerListInGameStatus_1_1 = await playerListInGameStatus_1.next(), !playerListInGameStatus_1_1.done;) {
                const { uid, isRobot, headurl, nickname, controlType, gold } = playerListInGameStatus_1_1.value;
                const redPacket = this.room.redPackQueue[0];
                let bet = redPacket.amount;
                try {
                    if (uid === mineOfRedPacketList[0].owner_uid) {
                        const graberRedPacketStepInMineList = this.room.currentGraberQueue.filter(graber => graber.hasGrabed && graber.isStepInMine && graber.grabUid !== uid);
                        let grabRedPacketList = this.room.currentGraberQueue.filter(graber => graber.hasGrabed && graber.grabUid === uid);
                        let redPacketAmount = grabRedPacketList.length > 0 ? parseFloat(grabRedPacketList[0].redPacketAmount) : 0;
                        const win = graberRedPacketStepInMineList.length * bet * this.room.sceneInfo.lossRation;
                        const redPacketAmountWithOutGrab = this.room.currentGraberQueue
                            .filter(graber => !graber.hasGrabed)
                            .reduce((totalAmount, nextRedPacket) => {
                            return totalAmount + parseInt(nextRedPacket.redPacketAmount);
                        }, 0);
                        let res = await (0, RecordGeneralManager_1.default)()
                            .setPlayerBaseInfo(uid, false, isRobot, gold)
                            .setGameInfo(this.room.nid, this.room.sceneId, this.room.roomId)
                            .setGameRecordInfo(bet, bet, win + redPacketAmount - bet, true)
                            .redPacketAmountWithOutGrab(redPacketAmountWithOutGrab)
                            .setControlType(controlType)
                            .setGameRoundInfo(this.room.roundId, this.room.realPlayersNumber, -1)
                            .addResult(this.room.zipResult)
                            .sendToDB(1);
                        if (!tableName)
                            tableName = res.tableName ? res.tableName : null;
                        const playerActualProfit = res.playerRealWin;
                        const profitAmount = playerActualProfit > 0 ? win - playerActualProfit : win - (playerActualProfit + bet);
                        if (isRobot !== 2) {
                            if (!this.room.getPlayer(uid).onLine) {
                                mailModule.sendMailFromRedPacket(uid, res.playerRealWin + redPacketAmountWithOutGrab, true);
                            }
                        }
                        let isStepInMine = false;
                        if (redPacketAmount > 0) {
                            const redPacketIdx = this.room.currentGraberQueue.findIndex(({ grabUid }) => grabUid === uid);
                            isStepInMine = this.room.currentGraberQueue[redPacketIdx].isStepInMine;
                            grabberResult.push({
                                uid,
                                grabTime: grabRedPacketList[0].grabTime,
                                redPacketAmount,
                                profitAmount: playerActualProfit + redPacketAmountWithOutGrab,
                                isStepInMine,
                                headurl,
                                nickname,
                                gold: res.gold
                            });
                        }
                        const playerInRoom = this.room.getPlayer(uid);
                        playerInRoom.changePlayerStatus(PlayerGameStatusEnum_1.PlayerGameStatusEnum.READY);
                        playerInRoom.profitAmount = playerActualProfit;
                        playerInRoom.gain += playerActualProfit;
                        playerInRoom.gold = res.gold;
                        handoutResult = {
                            uid,
                            grabTime: 2564453858713,
                            redPacketAmount: redPacketAmount || 0,
                            profitAmount: playerActualProfit + redPacketAmountWithOutGrab,
                            isStepInMine,
                            redPacketAmountWithOutGrab,
                            headurl,
                            nickname,
                            gold: res.gold
                        };
                        if (!!res.gameRecordId) {
                            playerGameRecordList.set(uid, res.gameRecordId);
                        }
                        continue;
                    }
                    const grabRedPacketIdx = this.room.currentGraberQueue.findIndex(redPacket => redPacket.grabUid === uid);
                    if (grabRedPacketIdx < 0)
                        continue;
                    const graberRedPacket = this.room.currentGraberQueue[grabRedPacketIdx];
                    bet = graberRedPacket.isStepInMine ? bet * this.room.sceneInfo.lossRation : 0;
                    const redPacketAmount = parseFloat(graberRedPacket.redPacketAmount);
                    let res = await (0, RecordGeneralManager_1.default)()
                        .setPlayerBaseInfo(uid, false, isRobot, gold)
                        .setGameInfo(this.room.nid, this.room.sceneId, this.room.roomId)
                        .setGameRecordInfo(bet, bet, redPacketAmount - bet)
                        .setControlType(controlType)
                        .setGameRoundInfo(this.room.roundId, this.room.realPlayersNumber, -1)
                        .addResult(this.room.zipResult)
                        .isInStepMine(graberRedPacket.isStepInMine)
                        .sendToDB(1);
                    const playerActualProfit = res.playerRealWin;
                    if (!tableName)
                        tableName = res.tableName ? res.tableName : null;
                    let profitAmount = playerActualProfit > 0 ? redPacketAmount - playerActualProfit : redPacketAmount - (playerActualProfit + bet);
                    if (isRobot !== 2) {
                        if (!this.room.getPlayer(uid).onLine) {
                            mailModule.sendMailFromRedPacket(uid, res.playerRealWin, false);
                        }
                    }
                    const currPlayer = this.room.getPlayer(uid);
                    currPlayer.changePlayerStatus(PlayerGameStatusEnum_1.PlayerGameStatusEnum.READY);
                    currPlayer.profitAmount = playerActualProfit;
                    currPlayer.gain += playerActualProfit;
                    currPlayer.gold = res.gold;
                    grabberResult.push({
                        uid,
                        grabTime: graberRedPacket.grabTime,
                        redPacketAmount: utils.round(parseFloat(graberRedPacket.redPacketAmount)),
                        profitAmount: playerActualProfit,
                        headurl,
                        nickname,
                        isStepInMine: graberRedPacket.isStepInMine,
                        gold: res.gold
                    });
                    if (!!res.gameRecordId) {
                        playerGameRecordList.set(uid, res.gameRecordId);
                    }
                }
                catch (e) {
                    logger.error(`红包扫雷:${this.room.nid}|场:${this.room.sceneId}|第${this.room.roundTimes}轮|结算出错: ${e.stack || e}`);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (playerListInGameStatus_1_1 && !playerListInGameStatus_1_1.done && (_a = playerListInGameStatus_1.return)) await _a.call(playerListInGameStatus_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        grabberResult.sort((a, b) => a.grabTime - b.grabTime);
        if (playerListInGameStatus.some(p => p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)) {
            const { uid, redPacketAmount, profitAmount, redPacketAmountWithOutGrab } = handoutResult;
            const dealerPlayer = playerListInGameStatus.find(p => p.uid === uid);
            const dealer = {
                uid,
                redPacketAmount: this.room.redPackQueue[0].amount,
                profitAmount,
                redPacketAmountWithOutGrab,
                isRobot: dealerPlayer.isRobot,
                mineNumber: this.room.redPackQueue[0].mineNumber
            };
            const playerList = grabberResult.map(res => {
                const { uid, redPacketAmount, isStepInMine, profitAmount } = res;
                const curPlayer = playerListInGameStatus.find(p => p.uid === uid);
                if (!!curPlayer) {
                    const { isRobot } = curPlayer;
                    return { uid, redPacketAmount, isStepInMine, isRobot, profitAmount };
                }
                return { uid, redPacketAmount, isStepInMine, profitAmount };
            });
            const iterator = playerGameRecordList.entries();
            let keyAndVal = iterator.next().value;
            let nextFlag = !!keyAndVal;
            while (nextFlag) {
                const [uid, gameRecordId] = keyAndVal;
                await GameRecordDateTable_mysql_dao_1.default.updateOne(tableName, { id: gameRecordId }, { game_Records_live_result: { dealer, playerList } });
                keyAndVal = iterator.next().value;
                nextFlag = !!keyAndVal;
            }
        }
        return { grabberResult, handoutResult };
    }
    nextGameRound() {
        this.room.currentGraberQueue = [];
        this.room.currentRedPacketList = [];
        this.room.roundTimes++;
        this.room.tmp_countDown = 8000;
        this.room.process = true;
        this.room.grabPlayerSet = new Set();
    }
}
exports.default = StateEndAction;
StateEndAction.roomCodeList = [];
StateEndAction.instanceMap = {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhdGVFbmRBY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9yZWRQYWNrZXQvbGliL2V4cGFuc2lvbi9yb29tRXhwYW5zaW9uL1N0YXRlRW5kQWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLGlDQUFrQztBQUVsQyw4REFBMkQ7QUFDM0QsMEVBQXVFO0FBQ3ZFLGdGQUE2RTtBQUc3RSxvREFBcUQ7QUFFckQsa0RBQXdEO0FBQ3hELGdFQUFnRTtBQUNoRSw2RUFBMEU7QUFDMUUseUZBQXVGO0FBQ3ZGLGlIQUF3RztBQUV4RyxNQUFNLE1BQU0sR0FBRyxJQUFBLGlCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBS25ELE1BQXFCLGNBQWM7SUFpQi9CLFlBQVksSUFBVTtRQUNsQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBWEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFVLEVBQUUsYUFBcUI7UUFDaEQsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sS0FBSyxhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDckUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsR0FBRyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtTQUM3RDtRQUVELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBU0QsY0FBYztRQUNWLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDO0lBQ3hELENBQUM7SUFTRCxLQUFLLENBQUMsa0JBQWtCOztRQUNwQixJ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