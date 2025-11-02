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
const recordUtil_1 = require("./util/recordUtil");
class Room extends multiPlayerRoom_1.default {
    constructor(props, roomManager) {
        super(props);
        this.MAX_HISTORY_LENGTH = 75;
        this.banker = null;
        this._players = new Map();
        this.bankerQueue = [];
        this.result = [];
        this.winAreas = [];
        this.displayPlayers = [];
        this.betAreas = initBetAreas();
        this.control = new control_1.default({ room: this });
        this.routeMsg = new routeMessage_1.default(this);
        this.roomManager = roomManager;
        this.lotteryHistory = props.lotteryHistory || [];
        this.ChipList = props.ChipList;
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
    }
    init() {
        this.players.forEach(p => p.init());
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
                throw new Error(`色碟 场: ${this.sceneId} ${this.roomId} 切换状态错误; 当前状态 ${this.processState.stateName} 切换的状态: ${stateName}`);
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
        this.zipResult = (0, recordUtil_1.buildRecordResult)(result);
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
        return this.players.filter(p => p.getTotalBet() > 0 || p === this.banker).map(p => {
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
    return {
        [betAreas_1.BetAreasName.SINGLE]: new betArea_1.default(betAreas_1.betAreaOdds[betAreas_1.BetAreasName.SINGLE]),
        [betAreas_1.BetAreasName.DOUBLE]: new betArea_1.default(betAreas_1.betAreaOdds[betAreas_1.BetAreasName.DOUBLE]),
        [betAreas_1.BetAreasName.FOUR_WHITE]: new betArea_1.default(betAreas_1.betAreaOdds[betAreas_1.BetAreasName.FOUR_WHITE]),
        [betAreas_1.BetAreasName.FOUR_RED]: new betArea_1.default(betAreas_1.betAreaOdds[betAreas_1.BetAreasName.FOUR_RED]),
        [betAreas_1.BetAreasName.THREE_RED]: new betArea_1.default(betAreas_1.betAreaOdds[betAreas_1.BetAreasName.THREE_RED]),
        [betAreas_1.BetAreasName.THREE_WHITE]: new betArea_1.default(betAreas_1.betAreaOdds[betAreas_1.BetAreasName.THREE_WHITE]),
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2NvbG9yUGxhdGUvbGliL3Jvb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsa0ZBQTJFO0FBQzNFLHFDQUE4QjtBQUM5QiwyQ0FBd0M7QUFDeEMsZ0RBQXlDO0FBQ3pDLHdEQUFpRDtBQUNqRCw4REFBdUQ7QUFFdkQseURBQWtEO0FBQ2xELDBDQUF3QztBQUN4QyxnREFBOEQ7QUFDOUQsK0NBQXdDO0FBQ3hDLG9EQUFnRTtBQUVoRSxrRkFBc0Y7QUFDdEYsc0VBQW9GO0FBQ3BGLHVDQUEwQztBQUMxQyx1RUFBb0U7QUFDcEUsa0RBQXNEO0FBbUN0RCxNQUFhLElBQUssU0FBUSx5QkFBdUI7SUFtQjdDLFlBQVksS0FBSyxFQUFFLFdBQWtDO1FBQ2pELEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQW5CQSx1QkFBa0IsR0FBRyxFQUFFLENBQUM7UUFDakMsV0FBTSxHQUFXLElBQUksQ0FBQztRQUN0QixhQUFRLEdBQXdCLElBQUksR0FBRyxFQUFFLENBQUM7UUFDMUMsZ0JBQVcsR0FBYSxFQUFFLENBQUM7UUFFM0IsV0FBTSxHQUFhLEVBQUUsQ0FBQztRQUN0QixhQUFRLEdBQWEsRUFBRSxDQUFDO1FBQ3hCLG1CQUFjLEdBQXNCLEVBQUUsQ0FBQztRQUN2QyxhQUFRLEdBQXVDLFlBQVksRUFBRSxDQUFDO1FBRS9ELFlBQU8sR0FBc0IsSUFBSSxpQkFBaUIsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ25FLGFBQVEsR0FBaUIsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBU25ELElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUM7UUFDakQsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFL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