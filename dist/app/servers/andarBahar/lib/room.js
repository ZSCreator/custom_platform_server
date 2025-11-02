"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const multiPlayerRoom_1 = require("../../../common/classes/game/multiPlayerRoom");
const player_1 = require("./player");
const constants_1 = require("./constants");
const betState_1 = require("./states/betState");
const lotteryState_1 = require("./states/lotteryState");
const settlementState_1 = require("./states/settlementState");
const routeMessage_1 = require("./classes/routeMessage");
const utils_1 = require("../../../utils");
const betAreas_1 = require("./config/betAreas");
const betArea_1 = require("./classes/betArea");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const constants_2 = require("../../../services/newControl/constants");
const control_1 = require("./control");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const GameUtil_1 = require("../../../utils/GameUtil");
const secondBetState_1 = require("./states/secondBetState");
const secondLotteryState_1 = require("./states/secondLotteryState");
const dealState_1 = require("./states/dealState");
const recordUtil_1 = require("./util/recordUtil");
class Room extends multiPlayerRoom_1.default {
    constructor(props, roomManager) {
        super(props);
        this.lowBet = 0;
        this.capBet = 0;
        this._players = new Map();
        this.result = null;
        this.winArea = null;
        this.betAreas = initBetAreas();
        this.cards = [];
        this.systemCard = null;
        this.lotteryOver = true;
        this.control = new control_1.default({ room: this });
        this.routeMsg = new routeMessage_1.default(this);
        this.zipResult = '';
        this.roomManager = roomManager;
        this.players = new Array(5).fill(null);
        this.lowBet = props.lowBet;
        this.capBet = props.capBet;
    }
    run() {
        this.changeRoomState(constants_1.RoomState.DEAL);
    }
    close() {
        this.stopTimer();
        this.roomManager = null;
        this._players.clear();
    }
    init() {
        this.players.forEach(p => !!p && p.init());
        this.cards = (0, GameUtil_1.getPai)(1);
        this.lotteryOver = true;
        this.result = null;
        for (let [, betArea] of Object.entries(this.betAreas)) {
            betArea.init();
        }
        this.updateRoundId();
    }
    async removeOfflinePlayers() {
        const offlinePlayers = await this.kickOfflinePlayerAndWarnTimeoutPlayer(this.players, 5, 3);
        offlinePlayers.forEach(p => {
            this.removePlayer(p);
            if (!p.onLine) {
                this.roomManager.removePlayer(p);
            }
            this.roomManager.removePlayerSeat(p.uid);
        });
    }
    async changeRoomState(stateName) {
        clearTimeout(this.stateTimer);
        switch (stateName) {
            case constants_1.RoomState.DEAL:
                this.processState = new dealState_1.default(this);
                break;
            case constants_1.RoomState.BET:
                this.processState = new betState_1.default(this);
                break;
            case constants_1.RoomState.LOTTERY:
                this.processState = new lotteryState_1.default(this);
                break;
            case constants_1.RoomState.SECOND_BET:
                this.processState = new secondBetState_1.default(this);
                break;
            case constants_1.RoomState.SECOND_LOTTERY:
                this.processState = new secondLotteryState_1.default(this);
                break;
            case constants_1.RoomState.SETTLEMENT:
                this.processState = new settlementState_1.default(this);
                break;
            default:
                throw new Error(`猜AB 场: ${this.sceneId} ${this.roomId} 切换状态错误; 当前状态 ${this.processState.stateName} 切换的状态: ${stateName}`);
        }
        process.nextTick(this.process.bind(this));
    }
    getRealPlayersAndBetPlayers() {
        return this.players.filter(p => !!p && p.isRealPlayerAndBet());
    }
    getBetAreas() {
        return this.betAreas;
    }
    containRealPlayer() {
        return this.players.filter(p => !!p && p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER).length > 0;
    }
    isBetState() {
        return this.processState.stateName === constants_1.RoomState.BET ||
            this.processState.stateName === constants_1.RoomState.SECOND_BET;
    }
    checkBettingState(player) {
        if (this.processState.stateName === constants_1.RoomState.BET && player.isBet()) {
            return true;
        }
        if (this.isSecondBetState()) {
            if (player.isBet()) {
                if (player.isSkip() || player.isSecondBet()) {
                    return true;
                }
            }
            else {
                return true;
            }
        }
        return false;
    }
    addPlayerInRoom(player) {
        if (this._players.get(player.uid)) {
            this._players.get(player.uid).resetOnlineState();
        }
        else {
            const indexList = [];
            this.players.forEach((p, index) => !p && indexList.push(index));
            if (indexList.length === 0) {
                return false;
            }
            const index = indexList[(0, utils_1.random)(0, indexList.length - 1)];
            const _player = new player_1.default(player);
            this.players[index] = _player;
            this._players.set(_player.uid, _player);
            this.routeMsg.playersChange();
        }
        this.addMessage(player);
        return true;
    }
    removePlayer(player) {
        this.kickOutMessage(player.uid);
        const index = this.players.findIndex(p => p && p.uid == player.uid);
        this.players[index] = null;
        this._players.delete(player.uid);
        this.routeMsg.playersChange();
    }
    playerOffline(player) {
        this.kickOutMessage(player.uid);
        this._players.get(player.uid).setOffline();
    }
    getPlayer(uid) {
        return this._players.get(uid);
    }
    getPlayers() {
        return this.players;
    }
    setResult(result) {
        this.result = result;
        return this;
    }
    getResult() {
        return this.result;
    }
    getWinArea() {
        return this.winArea;
    }
    setWinAreas(winArea) {
        this.winArea = winArea;
        this.zipResult = (0, recordUtil_1.buildRecordResult)(this.systemCard, this.result, this.winArea);
        return this;
    }
    getGamePlayerSettlementResult() {
        return this.players.filter(p => !!p && p.getTotalBet() > 0).map(p => {
            return p.settlementResult();
        });
    }
    checkBetAreas(player, bets) {
        if (typeof bets !== 'object') {
            return false;
        }
        const betAreas = Object.keys(bets);
        for (const key of betAreas) {
            if (!betAreas_1.areas.includes(key)) {
                return false;
            }
            if (typeof bets[key] !== 'number' ||
                bets[key] <= 0 ||
                bets[key] % this.lowBet !== 0 ||
                this.betAreas[key].getPlayerBet(player.uid) + bets[key] > this.capBet) {
                return false;
            }
        }
        return true;
    }
    getDisplayPlayers() {
        return this.players.slice(0, 6).map(p => {
            return {
                uid: p.uid,
                gold: p.gold,
                nickname: p.nickname,
                headurl: p.headurl,
            };
        });
    }
    setSystemCard() {
        this.systemCard = this.cards.shift();
    }
    getSystemCard() {
        return this.systemCard;
    }
    checkBets(bets) {
        for (let [areaName, num] of Object.entries(bets)) {
            if (this.betAreas[areaName].isOverrun(num)) {
                return true;
            }
        }
        return false;
    }
    skip(player) {
        player.setSkip();
        this.routeMsg.playerSkip(player);
    }
    changeBettingState() {
        if (this.processState.stateName === constants_1.RoomState.BET &&
            this.players.filter(p => !!p).every(p => p.isBet())) {
            this.changeRoomState(constants_1.RoomState.LOTTERY);
        }
        if (this.processState.stateName === constants_1.RoomState.SECOND_BET &&
            this.players.filter(p => !!p && p.isBet() && !p.isSkip()).every(p => p.isSecondBet())) {
            this.changeRoomState(constants_1.RoomState.SECOND_LOTTERY);
        }
    }
    playerBet(player, bets) {
        for (let [areaName, num] of Object.entries(bets)) {
            this.betAreas[areaName].addPlayerBet(player.uid, num);
            player.addBets(areaName, num);
        }
        if (this.processState.stateName === constants_1.RoomState.SECOND_BET) {
            player.setSecondBet();
        }
        this.routeMsg.playerBet(player, bets);
    }
    getSimpleBetAreas() {
        const simpleAreas = {};
        for (let [areaName, area] of Object.entries(this.betAreas)) {
            simpleAreas[areaName] = area.getTotalBet();
        }
        return simpleAreas;
    }
    getCards() {
        return this.cards;
    }
    getRealPlayersTotalBet() {
        return this.players.filter(p => !!p && p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER).reduce((totalBet, p) => totalBet += p.getTotalBet(), 0);
    }
    getFrontDisplayPlayers() {
        return this.players.map(p => !!p ? p.frontDisplayProperty() : null);
    }
    getControlPlayersTotalProfit(controlPlayers) {
        let totalProfit = 0;
        for (let [, area] of Object.entries(this.betAreas)) {
            controlPlayers.forEach(p => totalProfit += area.getPlayerProfit(p.uid));
        }
        return totalProfit;
    }
    getRealPlayersTotalProfit(killAreas) {
        let totalProfit = 0;
        const realPlayers = this.getRealPlayersAndBetPlayers();
        for (let [areaName, area] of Object.entries(this.betAreas)) {
            if (killAreas.includes(areaName))
                continue;
            realPlayers.forEach(p => totalProfit += area.getPlayerProfit(p.uid));
        }
        return totalProfit;
    }
    setLotteryOver(over) {
        this.lotteryOver = over;
    }
    isLotteryOver() {
        return this.lotteryOver;
    }
    isSecondBetState() {
        return this.processState.stateName === constants_1.RoomState.SECOND_BET;
    }
    personalControl(lotteryUtil, controlPlayers, state) {
        controlPlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_2.ControlKinds.PERSONAL));
        for (let i = 0; i < 100; i++) {
            lotteryUtil.lottery();
            const totalProfit = this.getControlPlayersTotalProfit(controlPlayers);
            if (state === commonConst_1.CommonControlState.WIN && totalProfit > 0) {
                break;
            }
            else if (state === commonConst_1.CommonControlState.LOSS && totalProfit <= 0) {
                break;
            }
        }
        return lotteryUtil;
    }
    sceneControl(lotteryUtil, sceneControlState, isPlatformControl) {
        if (sceneControlState === constants_2.ControlState.NONE) {
            return this.randomLottery(lotteryUtil);
        }
        const type = isPlatformControl ? constants_2.ControlKinds.PLATFORM : constants_2.ControlKinds.SCENE;
        this.players.forEach(p => !!p && p.setControlType(type));
        for (let i = 0; i < 100; i++) {
            lotteryUtil.lottery();
            const totalProfit = this.getRealPlayersTotalProfit(lotteryUtil.getKillAreas());
            if (sceneControlState === constants_2.ControlState.SYSTEM_WIN && totalProfit < 0) {
                break;
            }
            else if (sceneControlState === constants_2.ControlState.PLAYER_WIN && totalProfit > 0) {
                break;
            }
        }
        return lotteryUtil;
    }
    randomLottery(lotteryUtil) {
        lotteryUtil.lottery();
        return lotteryUtil;
    }
}
exports.Room = Room;
function initBetAreas() {
    return {
        [betAreas_1.BetAreasName.ANDAR]: new betArea_1.default(betAreas_1.betAreaOdds[betAreas_1.BetAreasName.ANDAR]),
        [betAreas_1.BetAreasName.BAHAR]: new betArea_1.default(betAreas_1.betAreaOdds[betAreas_1.BetAreasName.BAHAR]),
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2FuZGFyQmFoYXIvbGliL3Jvb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsa0ZBQTJFO0FBQzNFLHFDQUE4QjtBQUM5QiwyQ0FBd0M7QUFDeEMsZ0RBQXlDO0FBQ3pDLHdEQUFpRDtBQUNqRCw4REFBdUQ7QUFFdkQseURBQWtEO0FBQ2xELDBDQUF3QztBQUN4QyxnREFBcUU7QUFDckUsK0NBQXdDO0FBR3hDLGtGQUFzRjtBQUN0RixzRUFBb0Y7QUFDcEYsdUNBQTBDO0FBQzFDLHVFQUFvRTtBQUNwRSxzREFBaUQ7QUFDakQsNERBQXFEO0FBQ3JELG9FQUE2RDtBQUM3RCxrREFBMkM7QUFDM0Msa0RBQXNEO0FBcUJ0RCxNQUFhLElBQUssU0FBUSx5QkFBdUI7SUFpQjdDLFlBQVksS0FBSyxFQUFFLFdBQWtDO1FBQ2pELEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQWpCUixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBQ25CLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFDcEIsYUFBUSxHQUF3QixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRTFDLFdBQU0sR0FBd0MsSUFBSSxDQUFDO1FBQ25ELFlBQU8sR0FBVyxJQUFJLENBQUM7UUFDdkIsYUFBUSxHQUF1QyxZQUFZLEVBQUUsQ0FBQztRQUM5RCxVQUFLLEdBQWEsRUFBRSxDQUFDO1FBQ3JCLGVBQVUsR0FBVyxJQUFJLENBQUM7UUFDMUIsZ0JBQVcsR0FBWSxJQUFJLENBQUM7UUFDN0IsWUFBTyxHQUFzQixJQUFJLGlCQUFpQixDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDbkUsYUFBUSxHQUFpQixJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFHaEQsY0FBUyxHQUFXLEVBQUUsQ0FBQztRQUkxQixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FB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