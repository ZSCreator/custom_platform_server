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
const lotteryUtil_1 = require("./util/lotteryUtil");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const constants_2 = require("../../../services/newControl/constants");
const control_1 = require("./control");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const readyState_1 = require("./states/readyState");
class Room extends multiPlayerRoom_1.default {
    constructor(props, roomManager) {
        super(props);
        this.MAX_HISTORY_LENGTH = 20;
        this._players = new Map();
        this.result = -1;
        this.winAreas = [];
        this.displayPlayers = [];
        this.betAreas = initBetAreas();
        this.doubleAreas = [];
        this.control = new control_1.default({ room: this });
        this.routeMsg = new routeMessage_1.default(this);
        this.roomManager = roomManager;
        this.lotteryHistory = props.lotteryHistory || [];
        this.ChipList = props.ChipList;
    }
    run() {
        this.lotteryHistory = (0, lotteryUtil_1.genRandomResult)();
        this.changeRoomState(constants_1.RoomState.READY);
    }
    close() {
        this.stopTimer();
        this.roomManager = null;
        this._players.clear();
        this.control = null;
        this.routeMsg = null;
    }
    init() {
        this.players.forEach(p => p.init());
        this.doubleAreas = [];
        for (let [, betArea] of Object.entries(this.betAreas)) {
            betArea.init();
        }
        this.updateRoundId();
    }
    getDoubleAreas() {
        return this.doubleAreas;
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
            case constants_1.RoomState.READY:
                this.processState = new readyState_1.default(this);
                break;
            default:
                throw new Error(`番摊 场: ${this.sceneId} ${this.roomId} 切换状态错误; 当前状态 ${this.processState.stateName} 切换的状态: ${stateName}`);
        }
        process.nextTick(this.process.bind(this));
    }
    getRealPlayersAndBetPlayers() {
        return this.players.filter(p => p.isRealPlayerAndBet());
    }
    getBetAreas() {
        return this.betAreas;
    }
    addPlayerInRoom(player) {
        if (this._players.get(player.uid)) {
            this._players.get(player.uid).resetOnlineState();
        }
        else {
            const _player = new player_1.default(player);
            this.players.push(_player);
            this._players.set(_player.uid, _player);
            this.updateDisplayPlayers();
            this.routeMsg.playersChange();
        }
        this.addMessage(player);
        return true;
    }
    removePlayer(player) {
        this.kickOutMessage(player.uid);
        (0, utils_1.remove)(this.players, 'uid', player.uid);
        this._players.delete(player.uid);
        this.updateDisplayPlayers();
        this.routeMsg.playersChange();
    }
    playerOffline(player) {
        this.kickOutMessage(player.uid);
        this._players.get(player.uid).setOffline();
    }
    isBetState() {
        return this.processState.stateName === constants_1.RoomState.BET;
    }
    updateDisplayPlayers() {
        if (this.players.length === 0)
            return;
        const players = this.players;
        players.sort((a, b) => b.getWinRoundCount() - a.getWinRoundCount());
        const winner = players.shift();
        players.sort((a, b) => b.gold - a.gold);
        players.unshift(winner);
        this.displayPlayers = players.slice(0, 6).map(p => p.displayProperty());
        this.players = players;
    }
    beforeRemovePlayer(player) {
        this.kickOutMessage(player.uid);
    }
    getPlayer(uid) {
        return this._players.get(uid);
    }
    quitBankerQueue(player) {
    }
    getPlayers() {
        return this.players;
    }
    setResult(result) {
        this.result = result;
        return this;
    }
    addOneLotteryResult(result) {
        if (this.lotteryHistory.length >= this.MAX_HISTORY_LENGTH) {
            this.lotteryHistory.shift();
        }
        this.lotteryHistory.push(result);
    }
    async updateAfterLottery() {
    }
    getResult() {
        return this.result;
    }
    getWinAreas() {
        return this.winAreas;
    }
    setWinAreas(winAreas) {
        this.winAreas = winAreas;
        return this;
    }
    getGamePlayerSettlementResult() {
        return this.players.filter(p => p.getTotalBet() > 0).map(p => {
            return p.settlementResult();
        });
    }
    randomAreasDouble() {
        let num;
        const number = Math.random();
        if (number < 0.94) {
            num = 1;
        }
        else if (number < 0.98) {
            num = 2;
        }
        else {
            num = 3;
        }
        for (let i = 0; i < num; i++) {
            const index = (0, utils_1.random)(0, betAreas_1.areas.length - 1);
            const areaName = betAreas_1.areas[index];
            this.doubleAreas.push(areaName);
            this.betAreas[areaName].setDoubled();
        }
    }
    getLotteryHistory() {
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
    checkBets(bets) {
        for (let [areaName, num] of Object.entries(bets)) {
            if (this.betAreas[areaName].isOverrun(num)) {
                return true;
            }
        }
        return false;
    }
    playerBet(player, bets) {
        for (let [areaName, num] of Object.entries(bets)) {
            this.betAreas[areaName].addPlayerBet(player.uid, num);
            player.addBets(areaName, num);
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
    getRealPlayersTotalBet() {
        return this.players.filter(p => p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER).reduce((totalBet, p) => totalBet += p.getTotalBet(), 0);
    }
    getFrontDisplayPlayers() {
        return this.players.map(p => p.frontDisplayProperty());
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
        this.players.forEach(p => p.setControlType(type));
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
    let betAreas = {};
    betAreas_1.areas.forEach(area => betAreas[area] = new betArea_1.default(betAreas_1.betAreaOdds[area]));
    return betAreas;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2ZhblRhbi9saWIvcm9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxrRkFBMkU7QUFDM0UscUNBQThCO0FBQzlCLDJDQUF3QztBQUN4QyxnREFBeUM7QUFDekMsd0RBQWlEO0FBQ2pELDhEQUF1RDtBQUV2RCx5REFBa0Q7QUFDbEQsMENBQWdEO0FBQ2hELGdEQUFxRTtBQUNyRSwrQ0FBd0M7QUFDeEMsb0RBQWdFO0FBRWhFLGtGQUFzRjtBQUN0RixzRUFBb0Y7QUFDcEYsdUNBQXNDO0FBQ3RDLHVFQUFvRTtBQUNwRSxvREFBNkM7QUErQjdDLE1BQWEsSUFBSyxTQUFRLHlCQUF1QjtJQWE3QyxZQUFZLEtBQUssRUFBRSxXQUE4QjtRQUM3QyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFiQSx1QkFBa0IsR0FBRyxFQUFFLENBQUM7UUFDakMsYUFBUSxHQUF3QixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzFDLFdBQU0sR0FBVyxDQUFDLENBQUMsQ0FBQztRQUNwQixhQUFRLEdBQWEsRUFBRSxDQUFDO1FBQ3hCLG1CQUFjLEdBQXNCLEVBQUUsQ0FBQztRQUN2QyxhQUFRLEdBQXVDLFlBQVksRUFBRSxDQUFDO1FBRTlELGdCQUFXLEdBQW1CLEVBQUUsQ0FBQztRQUVsQyxZQUFPLEdBQWtCLElBQUksaUJBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzNELGFBQVEsR0FBaUIsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBSW5ELElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUM7UUFDakQsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO0lBQ25DLENBQUM7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