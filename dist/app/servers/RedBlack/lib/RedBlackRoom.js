"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RedBlackPlayerImpl_1 = require("./RedBlackPlayerImpl");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const pinus_logger_1 = require("pinus-logger");
const ControlImpl_1 = require("./ControlImpl");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const constants_1 = require("../../../services/newControl/constants");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const lotteryUtil_1 = require("./util/lotteryUtil");
const RedBlackService = require("./util/lotteryUtil");
const utils = require("../../../utils/index");
const RedBlackConst = require("./RedBlackConst");
const msgService = require("../../../services/MessageService");
const JsonConfig = require("../../../pojo/JsonConfig");
const RedBlackMgr_1 = require("../lib/RedBlackMgr");
const LoggerInfo = (0, pinus_logger_1.getLogger)('server_out', __filename);
class Room extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.roomStatus = 'NONE';
        this.zipResult = '';
        this.realPlayerTotalBet = 0;
        this.experience = false;
        this.players = [];
        this.channel = opts.channel;
        this.ChipList = opts.ChipList;
        this.lowBet = opts.lowBet;
        this.capBet = opts.capBet;
        this.betUpperLimit = this.capBet;
        this.stateTime = 0;
        this.allBetNum = 0;
        this.RedBlackHistory = opts.RedBlackHistory || [];
        this.playerAreaBets = {};
        this.zname = JsonConfig.get_games(this.nid).zname;
        this.bankerQueue = [];
        this.banker = null;
        this.killAreas = new Set();
        this.controlLogic = new ControlImpl_1.default({ room: this });
        this.roomStatus = 'NONE';
        this.ramodHistory();
    }
    run() {
        this.stop = false;
        this.runRoom();
    }
    close() {
        clearInterval(this.timer);
        this.controlLogic = null;
        this.bankerQueue.length = 0;
    }
    ramodHistory() {
        let numberOfTimes = RedBlackConst.MAX_HISTORY_LENGTH;
        do {
            const { results: result, winArea, allBetNum, totalRebate } = this.randomLottery();
            this.recordResult(winArea);
            numberOfTimes--;
        } while (numberOfTimes > 0);
    }
    initRoom() {
        this.bankerQueue = this.bankerQueue.filter(player => {
            return player.gold >= RedBlackConst.bankerGoldLimit[this.sceneId] && player.onLine;
        });
        this.bankerDeal();
        if (!this.banker && (this.bankerQueue.length > 0)) {
            this.banker = this.bankerQueue.shift();
            this.banker.setBanker();
        }
        this.allBetNum = 0;
        this.killAreas.clear();
        this.players.map(player => player.roundPlayerInit());
        this.playerAreaBets = {};
        this.updateRealPlayersNumber();
        this.updateRoundId();
        this.startTime = Date.now();
        this.zipResult = '';
        this.realPlayerTotalBet = 0;
        return true;
    }
    bankerDeal() {
        if (this.banker) {
            if (this.banker.gold < RedBlackConst.bankerGoldLimit[this.sceneId] ||
                this.banker.bankerCount >= RedBlackConst.bankerRoundLimit ||
                this.banker.quitBanker) {
                this.banker.clearBanker();
                this.banker = null;
            }
            else {
                this.banker.bankerCount += 1;
            }
        }
    }
    addPlayerInRoom(dbplayer) {
        const roomPlayer = this.getPlayer(dbplayer.uid);
        if (!!roomPlayer) {
            roomPlayer.upOnlineTrue();
        }
        else {
            const roomPlayer = new RedBlackPlayerImpl_1.default(dbplayer, this);
            this.players.push(roomPlayer);
            let displayPlayers = this.rankingLists();
            const opts = {
                displayPlayers: displayPlayers.slice(0, 6),
                displayPlayers_num: displayPlayers.length,
            };
            this.channelIsPlayer(RedBlackConst.route.ListChange, opts);
        }
        this.addMessage(dbplayer);
        this.updateRealPlayersNumber();
        return true;
    }
    leave(playerInfo, drops = false) {
        this.kickOutMessage(playerInfo.uid);
        if (drops) {
            playerInfo.onLine = false;
        }
        else {
            utils.remove(this.players, 'uid', playerInfo.uid);
            let displayPlayers = this.rankingLists();
            const opts = {
                displayPlayers: displayPlayers.slice(0, 6),
                displayPlayers_num: displayPlayers.length,
            };
            this.channelIsPlayer(RedBlackConst.route.ListChange, opts);
        }
        this.updateRealPlayersNumber();
    }
    isFull() {
        return this.players.length >= RedBlackConst.MAXCOUNT;
    }
    rankingLists() {
        let stripPlayers = this.players.map(pl => {
            if (pl) {
                return {
                    uid: pl.uid,
                    nickname: pl.nickname,
                    headurl: pl.headurl,
                    gold: pl.gold - pl.bet,
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
    async br_kickNoOnline() {
        const offlinePlayers = await this.kickOfflinePlayerAndWarnTimeoutPlayer(this.players, 5, 3);
        offlinePlayers.forEach(p => {
            this.leave(p, false);
            if (!p.onLine) {
                RedBlackMgr_1.default.removePlayer(p);
            }
            else {
                RedBlackMgr_1.default.playerAddToChannel(p);
            }
            RedBlackMgr_1.default.removePlayerSeat(p.uid);
        });
    }
    recordResult(result) {
        if (this.RedBlackHistory.length >= RedBlackConst.MAX_HISTORY_LENGTH)
            this.RedBlackHistory.shift();
        this.RedBlackHistory.push(result);
    }
    getPlayerAreaBets() {
        const obs = {};
        const areaSituation = this.playerAreaBets;
        for (let area in areaSituation) {
            areaSituation[area].arr.forEach(playerBet => {
                if (!obs[playerBet.uid])
                    obs[playerBet.uid] = {};
                obs[playerBet.uid][area] = playerBet.bet;
            });
        }
        return obs;
    }
    async getRecords() {
        let redCount = 0, blackCount = 0;
        for (let i = 0, len = this.RedBlackHistory.length; i < len; i++) {
            if (this.RedBlackHistory[i].win === RedBlackConst.area.red) {
                redCount += 1;
            }
            else {
                blackCount += 1;
            }
        }
        return { red: redCount, black: blackCount };
    }
    isLimit(bets, uid) {
        const playerAreaBets = this.playerAreaBets;
        for (let area in bets) {
            if (!playerAreaBets[area])
                continue;
            if (area === RedBlackConst.betArea.luck) {
                const judge = playerAreaBets.luck && playerAreaBets.luck.arr.find(areaInfo => areaInfo.uid === uid);
                if (!!judge && (judge.bet + bets[area] > (this.betUpperLimit / 5))) {
                    return RedBlackConst.LimitRed.personal;
                }
            }
            else {
                const mappArea = RedBlackConst.mapping[area];
                const betAreaBet = playerAreaBets[area].allBet;
                const mappAreaBet = !playerAreaBets[mappArea] ? 0 : playerAreaBets[mappArea].allBet;
                const difference = this.betUpperLimit - (betAreaBet - mappAreaBet);
                if (bets[area] > difference)
                    return RedBlackConst.LimitRed.total;
                const findBet = playerAreaBets[area].arr.find(m => m.uid === uid);
                const myBetArea = findBet ? findBet.bet : 0;
                if (this.betUpperLimit - myBetArea < bets[area])
                    return RedBlackConst.LimitRed.personal;
                const findMappBet = playerAreaBets[mappArea] && playerAreaBets[mappArea].arr.find(m => m.uid === uid);
                const myMappArea = findMappBet ? findMappBet.bet : 0;
                const difference1 = this.betUpperLimit - (myBetArea - myMappArea);
                if (bets[area] > difference1)
                    return RedBlackConst.LimitRed.personal;
            }
        }
        return false;
    }
    computCompensateGold(areaCompensate) {
        const maxLuckCompensate = areaCompensate[RedBlackConst.betArea.luck] * RedBlackConst.odds2['18'];
        const red = areaCompensate[RedBlackConst.betArea.red], black = areaCompensate[RedBlackConst.betArea.black];
        const compensate = (Math.max(red, black) - Math.min(red, black)) * RedBlackConst.odds2.red;
        return maxLuckCompensate + compensate;
    }
    playerIsBankerBetLimit(bets) {
        if (!this.playerIsBanker()) {
            return false;
        }
        const areaCompensate = {};
        RedBlackConst.areas.forEach(_area => {
            areaCompensate[_area] = this.playerAreaBets[_area] ? this.playerAreaBets[_area].allBet : 0;
        });
        for (let area in bets) {
            areaCompensate[area] += bets[area];
            let compensateGold = this.computCompensateGold(areaCompensate);
            if (this.banker.gold < compensateGold) {
                return true;
            }
        }
        return false;
    }
    async playerBet(uid, bets) {
        const playerInfo = `bet|${GameNidEnum_1.GameNidEnum.RedBlack}|${this.roomId}|${uid}`;
        const currPlayer = this.getPlayer(uid);
        for (let area in bets) {
            currPlayer.betHistory(area, bets[area]);
            if (!this.playerAreaBets[area]) {
                this.playerAreaBets[area] = { arr: [], allBet: 0 };
            }
            const areaSitu = this.playerAreaBets[area];
            const judge = areaSitu.arr.findIndex(areaInfo => areaInfo.uid === uid);
            judge === -1 ? areaSitu.arr.push({ uid, bet: bets[area] }) :
                (areaSitu.arr[judge].bet += bets[area]);
            areaSitu.allBet += bets[area];
            currPlayer.isRobot !== 2 && LoggerInfo.info(`${playerInfo}|${bets[area]}|${area}|${currPlayer.isRobot}`);
        }
        if (currPlayer.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER) {
            this.realPlayerTotalBet += utils.sum(bets);
        }
        this.channelIsPlayer(RedBlackConst.route.NoTiceBet, { uid, bets, desktopPlayers: this.rankingLists().slice(0, 6) });
    }
    getCountdown() {
        return Math.floor((RedBlackConst.statusTime[this.roomStatus] - (Date.now() - this.stateTime)) / 1000);
    }
    calculateValidBet(player) {
        const keys = Object.keys(player.betAreas), calculateArr = [], betAreas = player.betAreas;
        let count = 0;
        for (let i = 0, len = keys.length; i < len; i++) {
            const area = keys[i];
            if (area === RedBlackConst.area.draw) {
                count += betAreas[area];
                continue;
            }
            const mappingArea = RedBlackConst.mapping[area];
            if (calculateArr.includes(mappingArea))
                continue;
            const areaBet = betAreas[area], mappingAreaBet = !!betAreas[mappingArea] ? betAreas[mappingArea] : 0;
            count += (Math.max(areaBet, mappingAreaBet) - Math.min(areaBet, mappingAreaBet));
            calculateArr.push(area);
        }
        player.validBetCount(count);
    }
    getBankerQueue() {
        return this.bankerQueue.map(player => player.bankerStrip());
    }
    checkPlayerIsBanker(uid) {
        return this.banker && this.banker.uid === uid;
    }
    playerIsBanker() {
        return !!this.banker;
    }
    checkPlayerInBankerQueue(uid) {
        return !!(this.bankerQueue.find(player => player.uid === uid));
    }
    joinBankerQueue(uid) {
        const player = this.getPlayer(uid);
        if (!!player) {
            this.bankerQueue.push(player);
            this.channelIsPlayer(RedBlackConst.route.queueLength, {
                length: this.bankerQueue.length,
            });
        }
    }
    descendBanker(uid) {
        if (this.checkPlayerIsBanker(uid)) {
            if (this.banker.bankerCount < RedBlackConst.bankerRoundLimit) {
                this.banker.quitBanker = true;
            }
        }
    }
    quitBankerQueue(uid) {
        const judge = this.checkPlayerInBankerQueue(uid);
        if (judge) {
            utils.remove(this.bankerQueue, 'uid', uid);
            this.channelIsPlayer(RedBlackConst.route.queueLength, {
                length: this.bankerQueue.length,
            });
        }
    }
    getControlPlayersBet(params) {
        let bet = 0;
        this.players.forEach(p => {
            if (p.controlState === params.state) {
                bet += p.bet;
            }
        });
        return bet;
    }
    personalDealCards(params) {
        const bet = this.getControlPlayersBet(params);
        return RedBlackService.getPersonalControlResult(this.players, bet, params.state, this.killAreas, RoleEnum_1.RoleEnum.REAL_PLAYER);
    }
    addKillArea(params) {
        this.killAreas.add(params.area);
    }
    setPlayersState(params) {
        params.players.forEach(p => {
            const player = this.getPlayer(p.uid);
            player.setControlType(constants_1.ControlKinds.PERSONAL);
            player.setControlState({ state: params.state });
        });
    }
    getPlayersTotalBet(params) {
        let bet = 0;
        if (params.filterType === 4) {
            this.players.forEach(p => bet += p.filterBetNum({ areas: this.killAreas }));
        }
        else {
            this.players.forEach(p => {
                if (p.isRobot === params.filterType) {
                    bet += p.filterBetNum({ areas: this.killAreas });
                }
            });
        }
        return bet;
    }
    randomLottery() {
        return RedBlackService.randomLottery(this.players, this.killAreas);
    }
    sceneControlResult(sceneControlState, isPlatformControl) {
        if (this.realPlayerTotalBet === 0 || sceneControlState === constants_1.ControlState.NONE) {
            return RedBlackService.randomLottery(this.players, this.killAreas);
        }
        const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        this.players.forEach(p => p.setControlType(type));
        const filterType = !!this.banker && this.banker.isRobot === 0 ? 2 : 0;
        const bet = this.getPlayersTotalBet({ filterType });
        return RedBlackService.getWinORLossResult(this.players, filterType, bet, this.killAreas, sceneControlState === constants_1.ControlState.SYSTEM_WIN);
    }
    async runRoom() {
        this.initRoom();
        this.roomStatus = 'LICENS';
        this.stateTime = Date.now();
        await this.br_kickNoOnline();
        this.channelIsPlayer(RedBlackConst.route.Start, {
            countdown: RedBlackConst.statusTime.LICENS,
            desktopPlayers: this.rankingLists().slice(0, 6),
            banker: this.banker ? this.banker.bankerStrip() : this.banker,
            bankerQueueLength: this.bankerQueue.length,
            roundId: this.roundId,
        });
        this.timer = setTimeout(async () => {
            await this.startBet();
        }, RedBlackConst.statusTime.LICENS);
    }
    async startBet() {
        this.roomStatus = 'BETTING';
        this.stateTime = Date.now();
        this.channelIsPlayer(RedBlackConst.route.StartBet, {
            countdown: RedBlackConst.statusTime.BETTING / 1000
        });
        RedBlackMgr_1.default.pushRoomStateMessage(this.roomId, {
            nid: this.nid,
            sceneId: this.sceneId,
            roomId: this.roomId,
            countDown: this.getCountdown(),
            status: this.roomStatus,
            historyData: this.RedBlackHistory.slice(-20)
        });
        this.timer = setTimeout(async () => {
            await this.openAward();
        }, RedBlackConst.statusTime.BETTING);
    }
    async openAward() {
        this.roomStatus = 'OPENAWARD';
        this.stateTime = Date.now();
        const { results: result, winArea, allBetNum, totalRebate } = await this.controlLogic.runControl();
        this.zipResult = (0, lotteryUtil_1.buildRecordResult)(result, winArea);
        this.allBetNum = allBetNum;
        this.recordResult(winArea);
        this.channelIsPlayer(RedBlackConst.route.Lottery, {
            result,
            winArea,
            countdown: RedBlackConst.statusTime.OPENAWARD / 1000,
        });
        this.timer = setTimeout(async () => {
            await this.processing(totalRebate, result, winArea);
        }, RedBlackConst.statusTime.OPENAWARD);
    }
    async processing(totalProfit, result, winArea) {
        this.roomStatus = 'SETTLEING';
        this.stateTime = Date.now();
        this.endTime = Date.now();
        const roomInfo = `settleMent|${GameNidEnum_1.GameNidEnum.RedBlack}|${this.roomId}`;
        const settlement_info = { result, winArea };
        for (const pl of this.players) {
            if (pl.bet == 0) {
                continue;
            }
            this.calculateValidBet(pl);
            await pl.addGold(this, winArea, settlement_info);
            if (pl.profit > RedBlackConst.scrolling) {
                await msgService.sendBigWinNotice(this.nid, pl.nickname, pl.profit, pl.isRobot, pl.headurl);
            }
            const logInfo = `${roomInfo}|${pl.uid}|${pl.profit}|${pl.gold}`;
            pl.isRobot !== 2 && LoggerInfo.info(`${logInfo}|${pl.isRobot}`);
        }
        RedBlackMgr_1.default.pushRoomStateMessage(this.roomId, {
            nid: this.nid,
            sceneId: this.sceneId,
            roomId: this.roomId,
            countDown: this.getCountdown(),
            status: this.roomStatus,
            historyData: this.RedBlackHistory.slice(-20)
        });
        let opts = {
            countdown: RedBlackConst.statusTime.SETTLEING / 1000,
            userWin: this.players.filter(pl => pl.bet > 0).map(pl => {
                if (pl.bet) {
                    return {
                        uid: pl.uid,
                        nickname: pl.nickname,
                        headurl: pl.headurl,
                        profit: pl.profit,
                        bets: pl.bets,
                        gold: pl.gold
                    };
                }
            }),
            banker: this.banker ? this.banker.strip() : null,
        };
        this.channelIsPlayer(RedBlackConst.route.Settle, opts);
        this.timer = setTimeout(async () => {
            await this.runRoom();
        }, RedBlackConst.statusTime.SETTLEING);
    }
}
exports.default = Room;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVkQmxhY2tSb29tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvUmVkQmxhY2svbGliL1JlZEJsYWNrUm9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZEQUFzRDtBQUN0RCx1RUFBb0U7QUFDcEUsK0NBQXlDO0FBQ3pDLCtDQUF3QztBQUV4QywyRUFBd0U7QUFFeEUsc0VBQW9GO0FBQ3BGLHVFQUFvRTtBQUNwRSxvREFBdUQ7QUFDdkQsc0RBQXVEO0FBQ3ZELDhDQUErQztBQUMvQyxpREFBa0Q7QUFDbEQsK0RBQWdFO0FBQ2hFLHVEQUF3RDtBQUN4RCxvREFBcUU7QUFFckUsTUFBTSxVQUFVLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQVN2RCxNQUFxQixJQUFLLFNBQVEsdUJBQThCO0lBMEI1RCxZQUFZLElBQVM7UUFDakIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBbEJoQixlQUFVLEdBQThELE1BQU0sQ0FBQztRQU8vRSxjQUFTLEdBQVcsRUFBRSxDQUFDO1FBRXZCLHVCQUFrQixHQUFHLENBQUMsQ0FBQztRQUl2QixlQUFVLEdBQUcsS0FBSyxDQUFDO1FBT2YsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzVCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUU5QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQzFCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQTtRQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNuQixJQUFJLENBQUMsU0FBUyxH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