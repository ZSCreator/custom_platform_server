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
const lotteryUtil_1 = require("./util/lotteryUtil");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const constants_2 = require("../../../services/newControl/constants");
const control_1 = require("./control");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const recordUtil_1 = require("./util/recordUtil");
class Room extends multiPlayerRoom_1.default {
    constructor(props, roomManager) {
        super(props);
        this.MAX_HISTORY_LENGTH = 20;
        this.banker = null;
        this._players = new Map();
        this.bankerQueue = [];
        this.result = 0;
        this.flyTime = 0;
        this.winAreas = [];
        this.displayPlayers = [];
        this.timers = [];
        this.control = new control_1.default({ room: this });
        this.routeMsg = new routeMessage_1.default(this);
        this.roomManager = roomManager;
        this.lotteryHistory = props.lotteryHistory || [];
        this.ChipList = props.ChipList;
        this.lowBet = props.lowBet;
        this.capBet = props.capBet;
    }
    run() {
        this.lotteryHistory = (0, lotteryUtil_1.genRandomResult)();
        this.changeRoomState(constants_1.RoomState.BET);
    }
    close() {
        this.stopTimer();
        this.roomManager = null;
        this._players.clear();
        this.control = null;
        this.routeMsg = null;
        this.timers.forEach(t => clearInterval(t));
        this.timers = [];
    }
    init() {
        this.players.forEach(p => p.init());
        this.timers.forEach(t => clearInterval(t));
        this.timers = [];
        this.updateRoundId();
    }
    async removeOfflinePlayers() {
        const offlinePlayers = await this.kickOfflinePlayerAndWarnTimeoutPlayer(this.players, 5, 3);
        offlinePlayers.forEach(p => {
            this.removePlayer(p);
            if (!p.onLine) {
                this.roomManager.removePlayer(p);
            }
            else {
                this.roomManager.playerAddToChannel(p);
            }
            this.roomManager.removePlayerSeat(p.uid);
        });
    }
    changeRoomState(stateName) {
        clearTimeout(this.stateTimer);
        switch (stateName) {
            case constants_1.RoomState.BET:
                this.processState = new betState_1.default(this);
                break;
            case constants_1.RoomState.LOTTERY:
                this.processState = new lotteryState_1.default(this);
                break;
            case constants_1.RoomState.SETTLEMENT:
                this.processState = new settlementState_1.default(this);
                break;
            default:
                throw new Error(`Crash 场: ${this.sceneId} ${this.roomId} 切换状态错误; 当前状态 ${this.processState.stateName} 切换的状态: ${stateName}`);
        }
        process.nextTick(this.process.bind(this));
    }
    setBanker(player) {
        this.banker = player;
    }
    getBanker() {
        return this.banker;
    }
    getRealPlayersAndBetPlayers() {
        return this.players.filter(p => p.isRealPlayerAndBet());
    }
    addPlayerInRoom(player) {
        if (this._players.get(player.uid)) {
            this._players.get(player.uid).resetOnlineState();
        }
        else {
            const _player = new player_1.default(player);
            this.players.push(_player);
            this._players.set(_player.uid, _player);
            this.routeMsg.playersChange();
        }
        this.addMessage(player);
        return true;
    }
    removePlayer(player) {
        this.kickOutMessage(player.uid);
        (0, utils_1.remove)(this.players, 'uid', player.uid);
        this._players.delete(player.uid);
        this.routeMsg.playersChange();
    }
    playerOffline(player) {
        this.kickOutMessage(player.uid);
        this._players.get(player.uid).setOffline();
    }
    isBetState() {
        return this.processState.stateName === constants_1.RoomState.BET;
    }
    isLotteryState() {
        return this.processState.stateName === constants_1.RoomState.LOTTERY;
    }
    beforeRemovePlayer(player) {
        this.kickOutMessage(player.uid);
    }
    getPlayer(uid) {
        return this._players.get(uid);
    }
    getPlayers() {
        return this.players;
    }
    setResult(result) {
        this.result = result;
        this.zipResult = (0, recordUtil_1.buildRecordResult)(result);
        return this;
    }
    addOneLotteryResult(result) {
        if (this.lotteryHistory.length >= this.MAX_HISTORY_LENGTH) {
            this.lotteryHistory.shift();
        }
        this.lotteryHistory.push(result);
    }
    async takeMoney(player) {
        let flyTime = 0;
        if (this.processState.stateName === constants_1.RoomState.LOTTERY) {
            flyTime = this.processState.getRemainingTime();
        }
        const odds = (0, lotteryUtil_1.calculateOdds)(flyTime);
        player.setNotAuto();
        player.addProfit(odds);
        await player.settlement(this);
        return odds;
    }
    async updateAfterLottery() {
    }
    getResult() {
        return this.result;
    }
    getFlyTime() {
        return this.flyTime;
    }
    isExplodeImmediately() {
        return this.flyTime === 0;
    }
    getWinAreas() {
        return this.winAreas;
    }
    addTimer(timer) {
        this.timers.push(timer);
    }
    setFlyTime(flyTime) {
        this.flyTime = flyTime;
        return this;
    }
    getGamePlayerSettlementResult() {
        return this.players.filter(p => p.getTotalBet() > 0).map(p => {
            return p.settlementResult();
        });
    }
    getLotteryHistory(limit = false) {
        if (limit && this.lotteryHistory.length > 20) {
            return this.lotteryHistory.slice(this.lotteryHistory.length - 20);
        }
        return this.lotteryHistory;
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
    playerBet(player, num) {
        player.addBets(num);
        this.routeMsg.playerBet(player, num);
    }
    getRealPlayersTotalBet() {
        return this.players.filter(p => p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER).reduce((totalBet, p) => totalBet += p.getTotalBet(), 0);
    }
    getFrontDisplayPlayers() {
        return this.players.map(p => p.frontDisplayProperty());
    }
    getControlPlayersTotalProfit(controlPlayers, lotteryUtil) {
        let totalProfit = 0;
        controlPlayers.forEach(p => {
            const player = this.getPlayer(p.uid);
            totalProfit += player.calculateProfit(lotteryUtil.getResult());
        });
        return totalProfit;
    }
    getMaxProfit(result) {
        const realPlayers = this.getRealPlayersAndBetPlayers();
        return realPlayers.reduce((count, p) => p.calculateProfit(result) + count, 0);
    }
    personalControl(lotteryUtil, controlPlayers, state) {
        controlPlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_2.ControlKinds.PERSONAL));
        for (let i = 0; i < 100; i++) {
            lotteryUtil.lottery();
            const totalProfit = this.getControlPlayersTotalProfit(controlPlayers, lotteryUtil);
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
        this.players.forEach(p => p.setControlType(type));
        for (let i = 0; i < 100; i++) {
            lotteryUtil.lottery();
            const totalProfit = this.getMaxProfit(lotteryUtil.getResult());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0NyYXNoL2xpYi9yb29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGtGQUEyRTtBQUMzRSxxQ0FBOEI7QUFDOUIsMkNBQXdDO0FBQ3hDLGdEQUF5QztBQUN6Qyx3REFBaUQ7QUFDakQsOERBQXVEO0FBRXZELHlEQUFrRDtBQUNsRCwwQ0FBc0M7QUFDdEMsb0RBQStFO0FBRS9FLGtGQUFzRjtBQUN0RixzRUFBb0Y7QUFDcEYsdUNBQTBDO0FBQzFDLHVFQUFvRTtBQUNwRSxrREFBc0Q7QUFtQ3RELE1BQWEsSUFBSyxTQUFRLHlCQUF1QjtJQW9CN0MsWUFBWSxLQUFLLEVBQUUsV0FBNkI7UUFDNUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBcEJBLHVCQUFrQixHQUFHLEVBQUUsQ0FBQztRQUNqQyxXQUFNLEdBQVcsSUFBSSxDQUFDO1FBQ3RCLGFBQVEsR0FBd0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUMxQyxnQkFBVyxHQUFhLEVBQUUsQ0FBQztRQUMzQixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBQ25CLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFDcEIsYUFBUSxHQUFhLEVBQUUsQ0FBQztRQUN4QixtQkFBYyxHQUFzQixFQUFFLENBQUM7UUFFdkMsV0FBTSxHQUFtQixFQUFFLENBQUM7UUFDN0IsWUFBTyxHQUFzQixJQUFJLGlCQUFpQixDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDbkUsYUFBUSxHQUFpQixJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFVbkQsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUMsY0FBYyxJQUFJLEVBQUUsQ0FBQztRQUNqRCxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFR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