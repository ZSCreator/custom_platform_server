"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const up7Player_1 = require("./up7Player");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const pinus_logger_1 = require("pinus-logger");
const lotteryUtil_1 = require("./util/lotteryUtil");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const constants_1 = require("../../../services/newControl/constants");
const control_1 = require("./control");
const recordUtil_1 = require("./util/recordUtil");
const util = require("../../../utils/index");
const up7Const = require("./up7Const");
const lotteryUtil = require("./util/lotteryUtil");
const MessageService = require("../../../services/MessageService");
const JsonConfig = require("../../../pojo/JsonConfig");
const utils = require("../../../utils/index");
const up7RoomMgr_1 = require("../lib/up7RoomMgr");
const utils_1 = require("../../../utils/utils");
const up7Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
class up7Room extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.gameinning = false;
        this.status = 'NONE';
        this.situations = [
            { area: "AA", betList: [], totalBet: 0 },
            { area: "BB", betList: [], totalBet: 0 },
            { area: "CC", betList: [], totalBet: 0 },
        ];
        this.countDown = 0;
        this.up7Historys = [];
        this.runInterval = null;
        this.players = [];
        this.zipResult = '';
        this.killAreas = new Set();
        this.realPlayerTotalBet = 0;
        this.ChipList = opts.ChipList;
        this.channel = opts.channel;
        this.entryCond = opts.entryCond;
        this.lowBet = opts.lowBet;
        this.tallBet = opts.tallBet;
        this.up7Historys = opts.up7Historys || [];
        this.maxCount = JsonConfig.get_games(this.nid).roomUserLimit;
        this.control = new control_1.default({ room: this });
        this.ramodHistory();
    }
    async initRoom() {
        this.situations = [
            { area: "AA", betList: [], totalBet: 0 },
            { area: "BB", betList: [], totalBet: 0 },
            { area: "CC", betList: [], totalBet: 0 },
        ];
        this.players.map(async (m) => m.up7Init());
        this.updateRoundId();
        this.startTime = Date.now();
        this.zipResult = '';
        this.killAreas.clear();
        this.realPlayerTotalBet = 0;
        this.updateRealPlayersNumber();
    }
    close() {
        clearInterval(this.runInterval);
    }
    ramodHistory() {
        let numberOfTimes = 20;
        do {
            this.up7Historys.push({
                md5: (0, utils_1.genRoundId)(this.nid, this.roomId),
                lotteryResult: [utils.random(1, 6), utils.random(1, 6)],
                winAreas: [],
                userWin: [],
            });
            numberOfTimes--;
        } while (numberOfTimes > 0);
        this.result = this.up7Historys[this.up7Historys.length - 1].lotteryResult;
    }
    async gameStart() {
        clearInterval(this.runInterval);
        this.runInterval = setInterval(() => this.update(), 1000);
    }
    async update() {
        if (this.gameinning)
            return;
        --this.countDown;
        if (this.countDown > 0) {
            return;
        }
        do {
            if (this.status == "NONE") {
                this.status = "BETTING";
                break;
            }
            ;
            if (this.status == "BETTING") {
                this.status = "OPENAWARD";
                break;
            }
            ;
            if (this.status == "OPENAWARD") {
                this.status = "BETTING";
                break;
            }
            ;
        } while (true);
        switch (this.status) {
            case "BETTING":
                this.gameinning = true;
                await this.startBet();
                this.gameinning = false;
                break;
            case "OPENAWARD":
                this.gameinning = true;
                await this.openAward();
                this.gameinning = false;
                break;
            default:
                break;
        }
    }
    async startBet() {
        await this.initRoom();
        await this.br_kickNoOnline();
        this.status = 'BETTING';
        this.countDown = up7Const.BETTING;
        for (const pl of this.players) {
            const member = this.channel.getMember(pl.uid);
            const opts = { countDown: this.countDown, roundId: this.roundId, isRenew: pl.isCanRenew() };
            member && MessageService.pushMessageByUids('7up7down.start', opts, member);
        }
        up7RoomMgr_1.default.pushRoomStateMessage(this.roomId, { sceneId: this.sceneId, roomId: this.roomId, roomStatus: this.status, countDown: this.countDown });
    }
    async openAward() {
        try {
            this.status = 'OPENAWARD';
            const result = await this.control.result();
            let { winAreas } = lotteryUtil.settle(result, this);
            this.zipResult = (0, recordUtil_1.buildRecordResult)(result);
            this.recordHistory(result, winAreas);
            this.result = result;
            this.winAreas = winAreas;
            for (const pl of this.players) {
                pl.bet > 0 && await pl.updateGold(this);
            }
            this.countDown = up7Const.KAIJIANG;
            this.channelIsPlayer('7up7down.result', this.resultStrip());
            up7RoomMgr_1.default.pushRoomStateMessage(this.roomId, {
                sceneId: this.sceneId,
                roomId: this.roomId,
                countDown: this.countDown,
                roomStatus: this.status,
                up7Historys: this.getRecird().slice(-20)
            });
        }
        catch (error) {
            console.error('7up7down.Room.openAward==>', error);
        }
    }
    addPlayerInRoom(dbplayer) {
        let currPlayer = this.getPlayer(dbplayer.uid);
        if (currPlayer) {
            currPlayer.sid = dbplayer.sid;
            this.offLineRecover(currPlayer);
            return true;
        }
        if (this.isFull())
            return false;
        this.players.push(new up7Player_1.default(dbplayer));
        this.addMessage(dbplayer);
        this.updateRealPlayersNumber();
        this.playersChange();
        return true;
    }
    leave(playerInfo, isOffLine) {
        this.kickOutMessage(playerInfo.uid);
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        util.remove(this.players, 'uid', playerInfo.uid);
        this.updateRealPlayersNumber();
        this.playersChange();
        up7RoomMgr_1.default.removePlayerSeat(playerInfo.uid);
    }
    playersChange() {
        this.channelIsPlayer('7up7down.userChange', {
            playerNum: this.players.length,
            rankingList: this.rankingLists().slice(0, 6)
        });
    }
    getPlayer(uid) {
        return this.players.find(m => m && m.uid === uid);
    }
    resultStrip() {
        let opts = {
            sceneId: this.sceneId,
            roomId: this.roomId,
            roomStatus: this.status,
            result: this.result,
            winAreas: this.winAreas,
            userWin: this.players.filter(pl => pl.bet > 0).map(pl => {
                return {
                    uid: pl.uid,
                    nickname: pl.nickname,
                    headurl: pl.headurl,
                    gold: pl.gold,
                    profit: pl.profit,
                    bets: pl.bets
                };
            }),
            countDown: this.countDown
        };
        return opts;
    }
    getBeforehandResult(result) {
        let results = lotteryUtil.settle(result, this);
        let allLossValue = this.allLoss(true);
        return allLossValue;
    }
    buildPlayerGameRecord(uid) {
        if (!uid) {
            return {};
        }
        let result = {
            uid,
            area: this.getPlayer(uid).bets,
            settlement_info: this.buildSettlementInfo()
        };
        return result;
    }
    buildSettlementInfo() {
        try {
            let settlement_info = JSON.parse(JSON.stringify(this.up7Historys[this.up7Historys.length - 1]));
            delete settlement_info.userWin;
            return settlement_info;
        }
        catch (e) {
            console.error("7up7down 构建报表结算数据出错：" + (e.stack | e));
        }
    }
    allLoss(isRobot) {
        let allLossNum = 0;
        for (let pl of this.players) {
            if (isRobot) {
                pl.isRobot !== 2 && (allLossNum += pl.profit > 0 ? pl.profit + pl.bet : 0);
            }
            else {
                allLossNum += pl.profit > 0 ? pl.profit + pl.bet : 0;
            }
        }
        return allLossNum;
    }
    rankingLists() {
        let stripPlayers = this.players.map(pl => {
            if (pl) {
                return {
                    uid: pl.uid,
                    nickname: pl.nickname,
                    headurl: pl.headurl,
                    gold: pl.gold,
                    winRound: pl.winRound,
                    totalBet: pl.bet,
                    totalProfit: utils.sum(pl.totalProfit),
                };
            }
        });
        stripPlayers.sort((pl1, pl2) => {
            return pl2.winRound - pl1.winRound;
        });
        let copy_player = stripPlayers.shift();
        stripPlayers.sort((pl1, pl2) => {
            return utils.sum(pl2.gold + pl2.totalBet) - utils.sum(pl1.gold + pl2.totalBet);
        });
        stripPlayers.unshift(copy_player);
        return stripPlayers;
    }
    userBetAreas(player) {
        const userBetAreas = [];
        this.allBetAreas.forEach(k => {
            userBetAreas.push({
                id: k,
                selfBet: !this.situations[k] ? 0 :
                    (this.situations[k].betList.find(m => m.uid === player.uid) ?
                        this.situations[k].betList.find(m => m.uid === player.uid).bet : 0),
                allBet: !this.situations[k] ? 0 : this.situations[k].totalBet
            });
        });
        return userBetAreas;
    }
    async recordHistory(result, winAreas) {
        if (this.up7Historys.length >= 20) {
            this.up7Historys.splice(0, 1);
        }
        this.up7Historys.push({
            md5: this.roundId,
            lotteryResult: result,
            winAreas,
            userWin: this.players.filter(pl => pl.bet > 0).map(pl => {
                return {
                    uid: pl.uid,
                    nickname: pl.nickname,
                    headurl: pl.headurl,
                    profit: pl.profit,
                    bets: pl.bets,
                };
            }),
        });
    }
    getRecird() {
        return this.up7Historys.map(c => {
            return {
                md5: c.lotteryResult,
                lotteryResult: c.lotteryResult
            };
        });
    }
    roomStrip() {
        return {
            points: up7Const.points,
        };
    }
    async br_kickNoOnline() {
        const offlinePlayers = await this.kickOfflinePlayerAndWarnTimeoutPlayer(this.players, 5, 3);
        offlinePlayers.forEach(p => {
            this.leave(p, false);
            if (!p.onLine) {
                up7RoomMgr_1.default.removePlayer(p);
            }
            else {
                up7RoomMgr_1.default.playerAddToChannel(p);
            }
            up7RoomMgr_1.default.removePlayerSeat(p.uid);
        });
    }
    getAllBet(condition) {
        if (condition === 4) {
        }
        let num = 0;
        this.players.forEach(p => {
            if (p.isRobot === condition) {
                num += p.bet;
            }
        });
        return num;
    }
    getPlayersTotalBet(players) {
        return players.reduce((totalBet, p) => totalBet + this.players.find(player => player.uid === p.uid).bet, 0);
    }
    getPlayersTotalProfit(players) {
        return players.reduce((totalBet, p) => totalBet + this.players.find(player => player.uid === p.uid).profit, 0);
    }
    personalControlResult(players, state) {
        if (state === commonConst_1.CommonControlState.RANDOM) {
            return this.randomLotteryResult();
        }
        players.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        let result;
        for (let i = 0; i < 100; i++) {
            result = this.randomLotteryResult();
            (0, lotteryUtil_1.settle)(result, this);
            const totalProfit = this.getPlayersTotalProfit(players);
            if (state === commonConst_1.CommonControlState.WIN && totalProfit >= 0) {
                break;
            }
            if (state === commonConst_1.CommonControlState.LOSS && totalProfit < 0) {
                break;
            }
        }
        return result;
    }
    sceneControlResult(state, killAreas, isPlatformControl) {
        const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        let result;
        for (let i = 0; i < 100; i++) {
            result = this.randomLotteryResult();
            const { winAreas } = (0, lotteryUtil_1.settle)(result, this);
            if (killAreas.includes(winAreas)) {
                continue;
            }
            if (state === constants_1.ControlState.NONE) {
                break;
            }
            const totalProfit = this.getPlayersTotalProfit(this.players.filter(p => p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER));
            if (state === constants_1.ControlState.SYSTEM_WIN && totalProfit < 0) {
                this.players.forEach(p => p.bet > 0 && p.setControlType(type));
                break;
            }
            if (state === constants_1.ControlState.PLAYER_WIN && totalProfit >= 0) {
                this.players.forEach(p => p.bet > 0 && p.setControlType(type));
                break;
            }
        }
        return result;
    }
    addKillArea(area) {
        this.killAreas.add(area);
    }
    randomLotteryResult() {
        return [util.random(1, 6), util.random(1, 6)];
    }
}
exports.default = up7Room;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXA3Um9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzLzd1cDdkb3duL2xpYi91cDdSb29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQW9DO0FBQ3BDLHVFQUFvRTtBQUNwRSwrQ0FBeUM7QUFDekMsb0RBQTRDO0FBQzVDLHVFQUFvRTtBQUVwRSxrRkFBc0Y7QUFDdEYsc0VBQW9GO0FBQ3BGLHVDQUFtQztBQUVuQyxrREFBc0Q7QUFDdEQsNkNBQThDO0FBQzlDLHVDQUF3QztBQUN4QyxrREFBbUQ7QUFDbkQsbUVBQW9FO0FBQ3BFLHVEQUF3RDtBQUN4RCw4Q0FBK0M7QUFFL0Msa0RBQThEO0FBQzlELGdEQUFrRDtBQUNsRCxNQUFNLFNBQVMsR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBYXRELE1BQXFCLE9BQVEsU0FBUSx1QkFBcUI7SUF1RHRELFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7UUFsRGYsZUFBVSxHQUFHLEtBQUssQ0FBQztRQUluQixXQUFNLEdBQXFDLE1BQU0sQ0FBQztRQUNsRCxlQUFVLEdBQTZFO1lBQ25GLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUU7WUFDeEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRTtZQUN4QyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFO1NBQzNDLENBQUM7UUFHRixjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBQ3RCLGdCQUFXLEdBZ0JMLEVBQUUsQ0FBQztRQUVULGdCQUFXLEdBQWlCLElBQUksQ0FBQztRQU1qQyxZQUFPLEdBQWdCLEVBQUUsQ0FBQztR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