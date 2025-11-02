"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DragonTigerConst = require("./DragonTigerConst");
const utils = require("../../../utils/index");
const msgService = require("../../../services/MessageService");
const JsonConfig = require("../../../pojo/JsonConfig");
const MessageService = require("../../../services/MessageService");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const pinus_logger_1 = require("pinus-logger");
const ControlImpl_1 = require("./ControlImpl");
const langsrv = require("../../../services/common/langsrv");
const pinus_1 = require("pinus");
const constants_1 = require("../../../services/newControl/constants");
const lotteryUtil_1 = require("./util/lotteryUtil");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const dtPlayer_1 = require("./dtPlayer");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const Room_manager_1 = require("../../../common/dao/daoManager/Room.manager");
const DragonTigerRoomMangerImpl_1 = require("../lib/DragonTigerRoomMangerImpl");
const robotCommonOp_1 = require("../../../services/robotService/overallController/robotCommonOp");
const LoggerInfo = (0, pinus_logger_1.getLogger)('server_out', __filename);
class dtRoom extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.stateTime = 0;
        this.allBetNum = 0;
        this.cards = 0;
        this.situations = {};
        this.upZhuangCond = DragonTigerConst.bankerGoldLimit[this.sceneId];
        this.banker = null;
        this.roomStatus = 'NONE';
        this.players = [];
        this.zipResult = '';
        this.realPlayerTotalBet = 0;
        this.ChipList = opts.ChipList;
        this.backendServerId = pinus_1.pinus.app.getServerId();
        this.channel = opts.channel;
        this.lowBet = opts.lowBet;
        this.capBet = opts.capBet;
        this.betUpperLimit = this.capBet;
        this.DragonTigerHistory = opts.DragonTigerHistory || [];
        this.lotteryDetailed = opts.lotteryDetailed || [];
        this.result = {};
        this.winArea = [];
        this.situations = {};
        this.zname = JsonConfig.get_games(this.nid).zname;
        this.bankerQueue = [];
        this.killAreas = new Set();
        this.controlLogic = new ControlImpl_1.default({ room: this });
        this.ramodHistory();
        let AddCount = 0;
        do {
            let pl = (0, robotCommonOp_1.GetOnePl)();
            pl.gold = utils.random(this.upZhuangCond, this.upZhuangCond * 2);
            this.addPlayerInRoom(pl);
            let ply = this.players[AddCount];
            this.bankerQueue.push(ply);
            AddCount++;
            ply.updatetime += AddCount * 2 * 60;
        } while (AddCount < 3);
    }
    async initRoom() {
        this.allBetNum = 0;
        this.players.forEach(pl => pl.roundPlayerInit(this));
        this.situations = {};
        this.result = {};
        this.winArea = [];
        this.killAreas.clear();
        if (this.cards <= 0)
            this.cards = DragonTigerConst.cardsLength;
        await this.br_kickNoOnline();
        this.updateRealPlayersNumber();
        this.updateRoundId();
        this.startTime = Date.now();
        this.zipResult = '';
        this.realPlayerTotalBet = 0;
        return true;
    }
    run() {
        this.stop = false;
        this.runRoom();
    }
    close() {
        this.stop = true;
        this.sendRoomCloseMessage();
        this.players = [];
    }
    ramodHistory() {
        let numberOfTimes = 20;
        do {
            let result = (0, lotteryUtil_1.getRandomLotteryResult)([], new Set());
            this.DragonTigerHistory.length >= DragonTigerConst.MAX_History_LENGTH && this.DragonTigerHistory.splice(0, 1);
            this.DragonTigerHistory.push(result.winArea);
            numberOfTimes--;
        } while (numberOfTimes > 0);
    }
    async check_zjList() {
        do {
            if (this.banker) {
                this.banker.bankerCount--;
                if (this.banker.gold < this.upZhuangCond) {
                    const member = this.channel.getMember(this.banker.uid);
                    member && MessageService.pushMessageByUids(DragonTigerConst.route.dt_msg, { msg: langsrv.getlanguage(this.banker.language, langsrv.Net_Message.id_1218) }, member);
                    this.banker.clearBanker();
                    this.banker = null;
                }
                if (this.banker && this.banker.bankerCount <= 0) {
                    this.banker.clearBanker();
                    this.banker = null;
                }
                if (this.banker && this.banker.quitBanker) {
                    if (this.banker.bankerProfit > 0) {
                        let profit = -this.banker.bankerProfit * 0.4;
                        const res = await (0, RecordGeneralManager_1.default)()
                            .setPlayerBaseInfo(this.banker.uid, false, this.banker.isRobot, this.banker.gold)
                            .setGameInfo(this.nid, this.sceneId, this.roomId)
                            .setGameRecordInfo(0, 0, profit, false)
                            .addResult(this.zipResult)
                            .sendToDB(2);
                        this.banker.gold = res.gold;
                    }
                    this.banker.clearBanker();
                    this.banker = null;
                }
                if (this.banker) {
                    break;
                }
            }
            if (this.banker == null) {
                this.banker = this.bankerQueue.shift();
                if (!this.banker) {
                    break;
                }
                if (this.banker.onLine == false) {
                    continue;
                }
                if (this.banker.gold < this.upZhuangCond) {
                    const member = this.channel.getMember(this.banker.uid);
                    member && MessageService.pushMessageByUids(DragonTigerConst.route.dt_msg, { msg: langsrv.getlanguage(this.banker.language, langsrv.Net_Message.id_1219) }, member);
                    continue;
                }
                this.banker.setBanker();
                break;
            }
        } while (true);
        this.noticeZhuangInfo();
    }
    noticeZhuangInfo(playerInfo) {
        const opts = {
            banker: this.banker ? this.banker.bankerStrip() : this.banker,
            bankerQueue: this.bankerQueue.map(pl => {
                return {
                    uid: pl.uid,
                    headurl: pl.headurl,
                    nickname: pl.nickname,
                    gold: pl.gold,
                    isRobot: pl.isRobot
                };
            }),
            bankerQueueLength: this.bankerQueue.length
        };
        if (playerInfo) {
            const member = this.channel.getMember(playerInfo.uid);
            member && MessageService.pushMessageByUids(DragonTigerConst.route.dt_zj_info, opts, member);
            return;
        }
        this.channelIsPlayer(DragonTigerConst.route.dt_zj_info, opts);
    }
    addPlayerInRoom(player) {
        const roomPlayer = this.getPlayer(player.uid);
        if (!!roomPlayer) {
            roomPlayer.upOnlineTrue();
        }
        else {
            if (this.isFull()) {
                return false;
            }
            this.players.push(new dtPlayer_1.default(player, this));
            let displayPlayers = this.rankingLists();
            const opts = {
                displayPlayers: displayPlayers.slice(0, 6),
                displayPlayers_num: displayPlayers.length,
            };
            this.channelIsPlayer(DragonTigerConst.route.plChange, opts);
        }
        this.addMessage(player);
        this.updateRealPlayersNumber();
        return true;
    }
    leave(playerInfo, drops = false) {
        this.kickOutMessage(playerInfo.uid);
        utils.remove(this.bankerQueue, 'uid', playerInfo.uid);
        if (drops) {
            playerInfo.onLine = false;
        }
        else {
            utils.remove(this.players, 'uid', playerInfo.uid);
            this.playersChange();
        }
        this.updateRealPlayersNumber();
    }
    playersChange(playerInfo) {
        let displayPlayers = this.rankingLists();
        const opts = {
            displayPlayers: displayPlayers.slice(0, 6),
            displayPlayers_num: displayPlayers.length,
        };
        if (playerInfo) {
            const member = this.channel.getMember(playerInfo.uid);
            member && MessageService.pushMessageByUids(DragonTigerConst.route.plChange, opts, member);
            return;
        }
        this.channelIsPlayer(DragonTigerConst.route.plChange, opts);
    }
    getPlayer(uid) {
        return this.players.find(player => player.uid === uid);
    }
    async br_kickNoOnline() {
        const players = this.banker ? this.players.filter(p => p.uid !== this.banker.uid) : this.players;
        const offlinePlayers = await this.kickOfflinePlayerAndWarnTimeoutPlayer(players, 5, 3);
        offlinePlayers.forEach(p => {
            this.leave(p, false);
            if (!p.onLine) {
                DragonTigerRoomMangerImpl_1.default.removePlayer(p);
            }
            else {
                DragonTigerRoomMangerImpl_1.default.playerAddToChannel(p);
            }
            DragonTigerRoomMangerImpl_1.default.removePlayerSeat(p.uid);
        });
    }
    recordResult(winArea) {
        const betArea = {};
        DragonTigerConst.area.forEach(area => betArea[area] = 0);
        this.DragonTigerHistory.length >= DragonTigerConst.MAX_History_LENGTH && this.DragonTigerHistory.splice(0, 1);
        this.DragonTigerHistory.push(winArea);
        const comput = this.DragonTigerHistory.slice(1);
        comput.forEach(result => {
            result.forEach(area => betArea[area] += 1);
        });
        this.lotteryDetailed.push(this.result);
        if (this.lotteryDetailed.length > 20) {
            this.lotteryDetailed.splice(0, 1);
        }
    }
    getRecord() {
        return this.DragonTigerHistory;
    }
    getPlayers() {
        return this.players.sort((x, y) => y.gold - x.gold).map(player => player.strip());
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
    isFull() {
        return this.players.length >= DragonTigerConst.mostNumberPlayer;
    }
    ceiling(uid, RecordBets) {
        const playerAreaBets = this.situations;
        for (let RecordBet of RecordBets) {
            if (!playerAreaBets[RecordBet.area])
                continue;
            if (RecordBet.area === DragonTigerConst.draw) {
                if (RecordBet.bet > (this.betUpperLimit - playerAreaBets[RecordBet.area].allBet)) {
                    return DragonTigerConst.LimitRed.total;
                }
            }
            else {
                const mappArea = DragonTigerConst.mapping[RecordBet.area];
                const betAreaBet = playerAreaBets[RecordBet.area].allBet;
                const mappAreaBet = !playerAreaBets[mappArea] ? 0 : playerAreaBets[mappArea].allBet;
                const difference = this.betUpperLimit - (betAreaBet - mappAreaBet);
                if (RecordBet.bet > difference)
                    return DragonTigerConst.LimitRed.total;
                const findBet = playerAreaBets[RecordBet.area].arr.find(m => m.uid === uid);
                const myBetArea = findBet ? findBet.bet : 0;
                if (this.betUpperLimit - myBetArea < RecordBet.bet)
                    return DragonTigerConst.LimitRed.personal;
                const findMappBet = playerAreaBets[mappArea] && playerAreaBets[mappArea].arr.find(m => m.uid === uid);
                const myMappArea = findMappBet ? findMappBet.bet : 0;
                const difference1 = this.betUpperLimit - (myBetArea - myMappArea);
                if (RecordBet.bet > difference1)
                    return DragonTigerConst.LimitRed.personal;
            }
        }
        return false;
    }
    computCompensateGold(areaCompensate) {
        let gold = 0;
        const keys = Object.keys(areaCompensate).filter(area => area !== 'f');
        let draw_bet = areaCompensate['f'] ? areaCompensate['f'] : 0;
        const drawGold = draw_bet * DragonTigerConst.odds['f'];
        const useArea = [];
        for (const area of keys) {
            if (useArea.includes(area)) {
                continue;
            }
            if (DragonTigerConst.notValidBetArea.includes(area)) {
                gold += areaCompensate[area];
                continue;
            }
            const mappArea = DragonTigerConst.mapping[area];
            let curr_total = areaCompensate[area];
            let other_total = areaCompensate[mappArea];
            const compensate = (Math.max(curr_total, other_total) - Math.min(curr_total, other_total)) * DragonTigerConst.odds[area];
            if (area === DragonTigerConst.ordinaryArea[0] || area === DragonTigerConst.ordinaryArea[1]) {
                gold += Math.max(compensate, drawGold);
            }
            else {
                gold += compensate;
            }
            useArea.push(mappArea);
        }
        if (typeof gold != "number") {
            console.warn(`00000000000000`);
        }
        return gold;
    }
    playerIsBankerBetLimit(RecordBets) {
        if (!this.playerIsBanker()) {
            return false;
        }
        const areaCompensate = {};
        DragonTigerConst.area.forEach(_area => {
            areaCompensate[_area] = this.situations[_area] ? this.situations[_area].allBet : 0;
        });
        for (let RecordBet of RecordBets) {
            areaCompensate[RecordBet.area] += RecordBet.bet;
            let compensateGold = this.computCompensateGold(areaCompensate);
            if (this.banker.gold < compensateGold) {
                return true;
            }
        }
        return false;
    }
    async playerBet(uid, RecordBets) {
        const playerInfo = this.getPlayer(uid);
        for (let RecordBet of RecordBets) {
            playerInfo.betHistory(RecordBet.area, RecordBet.bet);
            if (!this.situations[RecordBet.area]) {
                this.situations[RecordBet.area] = { arr: [], allBet: 0 };
            }
            const areaSitu = this.situations[RecordBet.area];
            const judge = areaSitu.arr.findIndex(areaBet => areaBet.uid === uid);
            judge === -1 ? areaSitu.arr.push({ uid, bet: RecordBet.bet }) :
                (areaSitu.arr[judge].bet += RecordBet.bet);
            areaSitu.allBet += RecordBet.bet;
        }
        if (playerInfo.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER) {
            this.realPlayerTotalBet += RecordBets.reduce((total, value) => {
                return total + value.bet;
            }, 0);
        }
        const opts = { uid, RecordBets, gold: playerInfo.gold - playerInfo.bet, playersInfo: this.rankingLists().slice(0, 6) };
        this.channelIsPlayer(DragonTigerConst.route.OtherBet, opts);
    }
    getRoomInfo() {
        const countdown = Math.floor((DragonTigerConst.statusTimer[this.roomStatus] - (Date.now() - this.stateTime))
            / 1000);
        return { countdown };
    }
    getBankerQueue() {
        return this.bankerQueue.map(player => player.bankerStrip());
    }
    playerIsBanker() {
        return !!this.banker;
    }
    checkPlayerIsBanker(uid) {
        return this.banker && this.banker.uid == uid;
    }
    checkPlayerInBankerQueue(uid) {
        return !!(this.bankerQueue.find(pl => pl.uid == uid));
    }
    joinBankerQueue(uid) {
        const currPlayer = this.getPlayer(uid);
        if (!!currPlayer) {
            this.bankerQueue.push(currPlayer);
            this.noticeZhuangInfo();
        }
    }
    quitBankerQueue(uid) {
        const judge = this.checkPlayerInBankerQueue(uid);
        if (judge) {
            utils.remove(this.bankerQueue, 'uid', uid);
            this.noticeZhuangInfo();
        }
    }
    descendBanker(uid) {
        if (this.banker.bankerCount <= DragonTigerConst.bankerRoundLimit) {
            this.banker.quitBanker = true;
        }
    }
    calculateValidBet(currPlayer, winArea) {
        let calculateArr = [], betAreas = currPlayer.bets;
        let betNumber = 0;
        for (const area in betAreas) {
            if (DragonTigerConst.notValidBetArea.includes(area)) {
                betNumber += betAreas[area].bet;
                continue;
            }
            const mappingArea = DragonTigerConst.mapping[area];
            if (calculateArr.includes(mappingArea))
                continue;
            const areaBet = betAreas[area].bet;
            const mappingAreaBet = !!betAreas[mappingArea] ? betAreas[mappingArea].bet : 0;
            betNumber += (Math.max(areaBet, mappingAreaBet) - Math.min(areaBet, mappingAreaBet));
            calculateArr.push(area);
        }
        currPlayer.validBetCount(betNumber);
    }
    bankerIsRealMan() {
        return !!this.banker && this.banker.isRobot === 0;
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
        const statisticType = !!this.banker && this.banker.isRobot === 0 ? RoleEnum_1.RoleEnum.ROBOT : RoleEnum_1.RoleEnum.REAL_PLAYER;
        return (0, lotteryUtil_1.getPersonalControlResult)(this.players, bet, params.state, this.killAreas, statisticType);
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
    controlDealCardsBanker(params) {
        const bet = this.getPlayersTotalBet({ filterType: 4 });
        return (0, lotteryUtil_1.getWinORLossResult)(this.players, 4, bet, this.killAreas, !params.bankerWin);
    }
    sceneControlResult(sceneControlState, isPlatformControl) {
        if (this.realPlayersNumber === 0
            || sceneControlState === constants_1.ControlState.NONE
            || (!this.bankerIsRealMan() && this.realPlayerTotalBet === 0)) {
            return (0, lotteryUtil_1.randomLottery)(this.players, this.killAreas);
        }
        const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        this.players.forEach(p => p.setControlType(type));
        const filterType = !!this.banker && this.banker.isRobot === 0 ? 2 : 0;
        const bet = this.getPlayersTotalBet({ filterType });
        return (0, lotteryUtil_1.getWinORLossResult)(this.players, filterType, bet, this.killAreas, sceneControlState === constants_1.ControlState.SYSTEM_WIN);
    }
    async runRoom() {
        await this.initRoom();
        if (this.stop == true) {
            this.roomStatus = 'NONE';
            return null;
        }
        await this.check_zjList();
        this.roomStatus = 'LICENS';
        this.stateTime = Date.now();
        this.cards -= 2;
        for (const pl of this.players) {
            const member = this.channel.getMember(pl.uid);
            const opts = {
                roundId: this.roundId,
                cards: this.cards,
                gold: pl.gold
            };
            member && MessageService.pushMessageByUids(DragonTigerConst.route.Start, opts, member);
        }
        this.playersChange();
        setTimeout(async () => {
            await this.startBet();
        }, DragonTigerConst.statusTimer.LICENS);
    }
    async startBet() {
        this.roomStatus = 'BETTING';
        this.stateTime = Date.now();
        DragonTigerRoomMangerImpl_1.default.pushRoomStateMessage(this.roomId, {
            nid: this.nid,
            sceneId: this.sceneId,
            roomId: this.roomId,
            countDown: this.getRoomInfo().countdown,
            status: this.roomStatus,
            historyData: this.getRecord()
        });
        this.channelIsPlayer(DragonTigerConst.route.StartBet, { countdown: DragonTigerConst.statusTimer.BETTING / 1000 });
        setTimeout(async () => {
            await this.openAward();
        }, DragonTigerConst.statusTimer.BETTING);
    }
    async openAward() {
        this.roomStatus = 'OPENAWARD';
        this.stateTime = Date.now();
        const result = await this.controlLogic.runControl();
        this.result = result.lotteryResults;
        this.BankSettleDetails = result.BankSettleDetails;
        this.winArea = result.winArea;
        if (this.sceneId == 0) {
            this.winArea = result.winArea.filter(area => DragonTigerConst.ordinaryArea.includes(area));
        }
        this.zipResult = (0, lotteryUtil_1.buildRecordResult)(this.result, this.winArea);
        this.allBetNum = result.allBet;
        const totalProfit = result.totalProfit;
        this.recordResult(this.winArea);
        await Room_manager_1.default.updateOneRoom({ serverId: this.serverId, roomId: this.roomId, history: this.DragonTigerHistory }, ['history']);
        const opts = {
            result: this.result,
            winArea: this.winArea,
            countdown: DragonTigerConst.statusTimer.OPENAWARD / 1000,
        };
        this.channelIsPlayer(DragonTigerConst.route.Lottery, opts);
        setTimeout(async () => {
            await this.processing(this.winArea, totalProfit);
        }, DragonTigerConst.statusTimer.OPENAWARD);
    }
    async processing(winArea, totalProfit) {
        this.roomStatus = 'SETTLEING';
        this.stateTime = Date.now();
        this.endTime = Date.now();
        for (const pl of this.players) {
            if (pl.bet == 0)
                continue;
            this.calculateValidBet(pl, winArea);
            await pl.addGold(this, winArea);
            if (pl.profit > DragonTigerConst.scrolling) {
                await msgService.sendBigWinNotice(this.nid, pl.nickname, pl.profit, pl.isRobot, pl.headurl);
            }
        }
        if (this.banker) {
            this.banker.profit = this.allBetNum - totalProfit;
            this.banker.validBet = Math.abs(this.banker.profit);
            this.banker.bet = 0;
            await this.banker.addGold(this, winArea);
        }
        this.players.forEach(pl => (!pl.onLine) && pl.addOffLineCount());
        let opts = {
            countdown: DragonTigerConst.statusTimer.SETTLEING / 1000,
            winArea,
            sceneId: this.sceneId,
            banker: this.banker ? this.banker.strip() : { profit: this.allBetNum - totalProfit },
            players: this.players.filter(pl => pl.bet > 0 || (this.banker && this.banker.uid == pl.uid)).map((pl) => {
                return {
                    uid: pl.uid,
                    gold: pl.gold,
                    profit: pl.profit,
                    bets: pl.bets
                };
            })
        };
        this.channelIsPlayer(DragonTigerConst.route.Settle, opts);
        DragonTigerRoomMangerImpl_1.default.pushRoomStateMessage(this.roomId, {
            nid: this.nid,
            sceneId: this.sceneId,
            roomId: this.roomId,
            status: this.roomStatus,
            countDown: this.getRoomInfo().countdown,
            historyData: this.getRecord()
        });
        setTimeout(async () => {
            await this.runRoom();
        }, DragonTigerConst.statusTimer.SETTLEING);
    }
}
exports.default = dtRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHRSb29tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvRHJhZ29uVGlnZXIvbGliL2R0Um9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUF3RDtBQUN4RCw4Q0FBK0M7QUFDL0MsK0RBQWdFO0FBQ2hFLHVEQUF3RDtBQUN4RCxtRUFBb0U7QUFDcEUsdUVBQW9FO0FBQ3BFLCtDQUF5QztBQUN6QywrQ0FBd0M7QUFDeEMsNERBQTREO0FBRTVELGlDQUE4QjtBQUU5QixzRUFBb0Y7QUFDcEYsb0RBQTRJO0FBQzVJLHVFQUFvRTtBQUNwRSx5Q0FBa0M7QUFDbEMsbUZBQWlGO0FBQ2pGLDhFQUFzRTtBQUN0RSxnRkFBMEY7QUFDMUYsa0dBQTBGO0FBRzFGLE1BQU0sVUFBVSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFVdkQsTUFBcUIsTUFBTyxTQUFRLHVCQUFvQjtJQXdDcEQsWUFBWSxJQUFJO1FBQ1osS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBdkNoQixjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBRXRCLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFHdEIsVUFBSyxHQUFXLENBQUMsQ0FBQztRQVFsQixlQUFVLEdBQTZFLEVBQUUsQ0FBQztRQUcxRixpQkFBWSxHQUFHLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFHOUQsV0FBTSxHQUFhLElBQUksQ0FBQztRQUV4QixlQUFVLEdBQThELE1BQU0sQ0FBQztRQUUvRSxZQUFPLEdBQWUsRUFBRSxDQUFDO1FBT3pCLGNBQVMsR0FBVyxFQUFFLENBQUM7UUFDdkIsdUJBQWtCLEdBQVcsQ0FBQyxDQUFDO1FBUzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUM5QixJQUFJLENBQUMsZUFBZSxHQUFHLGFBQUssQ0FBQyxHQUFH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