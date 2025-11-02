"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaiRenRoomImpl = void 0;
const BaiRenPlayerImpl_1 = require("./BaiRenPlayerImpl");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const ControlImpl_1 = require("./ControlImpl");
const langsrv = require("../../../services/common/langsrv");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const pinus_1 = require("pinus");
const constants_1 = require("../../../services/newControl/constants");
const roomUtil_1 = require("./util/roomUtil");
const BRNN_Logic = require("./BRNN_Logic");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const utils = require("../../../utils");
const bairenConst = require("./constant/bairenConst");
const MessageService = require("../../../services/MessageService");
const JsonConfig = require("../../../pojo/JsonConfig");
const BairenRoomManager_1 = require("../lib/BairenRoomManager");
const robotCommonOp_1 = require("../../../services/robotService/overallController/robotCommonOp");
const LICENSING_COUNTDOWN = 4;
const BET_COUNTDOWN = 15;
const BIPAI_COUNTDOWN = 12;
class BaiRenRoomImpl extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.status = 'NONE';
        this.zj_queues = [];
        this.lotterys = [];
        this.lastCountdownTime = 0;
        this.situations = [];
        this.xiaZhuangUid = '';
        this.pais = [];
        this.runInterval = null;
        this.allPais = [];
        this.players = [];
        this.zipResult = '';
        this.areasBackup = null;
        this.cardsBackup = null;
        this.bankerBackup = null;
        this.killAreas = new Set();
        this.roomManager = BairenRoomManager_1.default;
        this.backendServerId = pinus_1.pinus.app.getServerId();
        this.upZhuangCond = opts.ShangzhuangMinNum;
        this.entryCond = opts.entryCond;
        this.lowBet = opts.lowBet;
        this.ChipList = opts.ChipList;
        this.tallBet = opts.tallBet * bairenConst.XIAN_HONG;
        this.compensate = opts.compensate;
        this.bairenHistory = opts.bairenHistory || [];
        this.zhuangInfo = {
            uid: null,
            hasRound: -1,
            money: 0
        };
        this.zhuangResult = {
            cards: null,
            cardType: 0,
            profit: 0,
            isniu: false,
            cardNum: []
        };
        this.maxCount = JsonConfig.get_games(opts.nid).roomUserLimit;
        this.controlLogic = new ControlImpl_1.default({ room: this });
        this.ramodHistory();
        this.Initialization();
        let AddCount = 0;
        do {
            let pl = (0, robotCommonOp_1.GetOnePl)();
            pl.gold = utils.random(this.upZhuangCond * 3, this.upZhuangCond * 4);
            this.addPlayerInRoom(pl);
            let ply = this.players[AddCount];
            this.zj_queues.push(ply);
            AddCount++;
            ply.updatetime += AddCount * 2 * 60;
        } while (AddCount < 3);
    }
    async Initialization() {
        this.players.forEach(pl => pl.initGame(this));
        await this.br_kickNoOnline();
        this.situations = [
            { area: 0, betList: [], totalBet: 0 },
            { area: 1, betList: [], totalBet: 0 },
            { area: 2, betList: [], totalBet: 0 },
            { area: 3, betList: [], totalBet: 0 },
        ];
        this.lotterys = [
            { area: 0, cards: null, cardType: 0, multiple: 0, isWin: false, isniu: false, cardNum: [] },
            { area: 1, cards: null, cardType: 0, multiple: 0, isWin: false, isniu: false, cardNum: [] },
            { area: 2, cards: null, cardType: 0, multiple: 0, isWin: false, isniu: false, cardNum: [] },
            { area: 3, cards: null, cardType: 0, multiple: 0, isWin: false, isniu: false, cardNum: [] },
        ];
        this.areasBackup = null;
        this.bankerBackup = null;
        this.cardsBackup = null;
        this.killAreas.clear();
        this.zhuangResult = {
            cards: null,
            cardType: 0,
            profit: 0,
            isniu: false,
            cardNum: []
        };
        this.pais = BRNN_Logic.shuffle();
        this.allPais = [];
        this.updateRoundId();
        this.updateRealPlayersNumber();
        this.startTime = Date.now();
        this.zipResult = '';
    }
    close() {
        this.sendRoomCloseMessage();
        clearInterval(this.runInterval);
        this.players = [];
    }
    ramodHistory() {
        let numberOfTimes = 100;
        do {
            let opts = {
                sceneId: this.sceneId,
                roomId: this.roomId,
                res: [],
            };
            for (let index = 0; index < 4; index++) {
                let random = utils.random(1, 10);
                opts.res.push(random % 2 ? { isWin: true } : { isWin: false });
            }
            this.bairenHistory.push(opts);
            numberOfTimes--;
        } while (numberOfTimes > 0);
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
        this.players.push(new BaiRenPlayerImpl_1.BaiRenPlayerImpl(dbplayer));
        this.addMessage(dbplayer);
        this.updateRealPlayersNumber();
        return true;
    }
    leave(playerInfo, isOffLine) {
        this.kickOutMessage(playerInfo.uid);
        utils.remove(this.zj_queues, 'uid', playerInfo.uid);
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        utils.remove(this.players, 'uid', playerInfo.uid);
        this.roomManager.removePlayerSeat(playerInfo.uid);
        this.playersChange();
        this.updateRealPlayersNumber();
    }
    playersChange(playerInfo) {
        let displayPlayers = this.rankingLists();
        const opts = {
            list: displayPlayers.slice(0, 6),
            playerNum: displayPlayers.length,
        };
        if (playerInfo) {
            const member = this.channel.getMember(playerInfo.uid);
            member && MessageService.pushMessageByUids(`brnn_playersChange`, opts, member);
            return;
        }
        this.channelIsPlayer(`brnn_playersChange`, opts);
    }
    getCountdownTime() {
        const time = (Date.now() - this.lastCountdownTime) / 1000;
        if (this.status == "Licensing") {
            return Math.max(LICENSING_COUNTDOWN - time, 0.5);
        }
        if (this.status == 'BETTING')
            return Math.max(BET_COUNTDOWN - time, 0.5);
        if (this.status == 'INBIPAI')
            return Math.max(BIPAI_COUNTDOWN - time, 0.5);
        return 0;
    }
    run() {
        this.countdown = 0;
        clearInterval(this.runInterval);
        this.runInterval = setInterval(() => this.update(), 1000);
    }
    update() {
        --this.countdown;
        if (this.countdown > 0) {
            return;
        }
        do {
            if (this.status == "NONE") {
                this.status = "Licensing";
                break;
            }
            ;
            if (this.status == "Licensing") {
                this.status = "BETTING";
                break;
            }
            ;
            if (this.status == "BETTING") {
                this.status = "INBIPAI";
                break;
            }
            ;
            if (this.status == "INBIPAI") {
                this.status = "Licensing";
                break;
            }
            ;
        } while (true);
        this.lastCountdownTime = Date.now();
        switch (this.status) {
            case "Licensing":
                this.countdown = LICENSING_COUNTDOWN;
                this.startDeal();
                break;
            case 'BETTING':
                this.countdown = BET_COUNTDOWN;
                this.startBet();
                break;
            case "INBIPAI":
                this.countdown = BIPAI_COUNTDOWN;
                this.Settlement();
                break;
        }
    }
    async startDeal() {
        await this.Initialization();
        await this.check_zjList();
        this.lotterys.map(m => {
            m.cards = BRNN_Logic.getCardNum(this.pais, 2);
            m.isniu = BRNN_Logic.getCardTypeNew_(m.cards);
        });
        this.zhuangResult.cards = BRNN_Logic.getCardNum(this.pais, 2);
        this.zhuangResult.isniu = BRNN_Logic.getCardTypeNew_(this.zhuangResult.cards);
        this.areasBackup = JSON.parse(JSON.stringify(this.lotterys));
        this.cardsBackup = JSON.parse(JSON.stringify(this.pais));
        this.bankerBackup = JSON.parse(JSON.stringify(this.zhuangResult));
        const opts = {
            status: this.status,
            roundId: this.roundId,
            countdownTime: this.getCountdownTime(),
            data: this.toBetBack()
        };
        for (const pl of this.players) {
            const member = this.channel.getMember(pl.uid);
            opts['isRenew'] = pl.isCanRenew();
            member && MessageService.pushMessageByUids('br_Deal', opts, member);
        }
    }
    async startBet() {
        {
            const opts = {
                status: this.status,
                countdownTime: this.getCountdownTime(),
            };
            this.channelIsPlayer('br_start', opts);
        }
        let opts = {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            status: this.status,
            downTime: this.getCountdownTime()
        };
        this.roomManager.pushRoomStateMessage(this.roomId, opts);
    }
    async Settlement() {
        await this.dealCards();
        this.zhuangResult.profit = this.casinoWar(this.zhuangResult);
        this.endTime = Date.now();
        this.zipResult = (0, roomUtil_1.buildRecordResult)(this);
        this.settlementBairenRoom(this.players);
        let opts = {
            sceneId: this.sceneId,
            roomId: this.roomId,
            res: this.lotterys.map(m => { return { isWin: m.isWin }; }),
        };
        this.bairenHistory.push(opts);
        if (this.bairenHistory.length > 20)
            this.bairenHistory.shift();
        for (const pl of this.players) {
            await pl.updateGold(this);
        }
        let opts2 = {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            status: this.status,
            historyData: this.toResultBack()
        };
        this.roomManager.pushRoomStateMessage(this.roomId, opts2);
        this.players.forEach(pl => {
            const member = this.channel.getMember(pl.uid);
            let opts = {};
            if (pl.isRobot !== 2) {
                opts = {
                    status: this.status,
                    countdownTime: this.getCountdownTime(),
                    data: this.toResultBack()
                };
            }
            MessageService.pushMessageByUids('br_over', opts, member);
        });
    }
    async check_zjList() {
        do {
            if (this.zhuangInfo.uid) {
                this.zhuangInfo.hasRound--;
                const zj_pl = this.getPlayer(this.zhuangInfo.uid);
                if (zj_pl && zj_pl.gold < this.upZhuangCond) {
                    const member = this.channel.getMember(zj_pl.uid);
                    member && MessageService.pushMessageByUids('br_onKickZhuang', { msg: langsrv.getlanguage(zj_pl.language, langsrv.Net_Message.id_1218) }, member);
                    this.zhuangInfo.uid = null;
                }
                if (!zj_pl || this.zhuangInfo.hasRound <= 0) {
                    this.zhuangInfo.uid = null;
                }
                if (zj_pl && this.zhuangInfo.uid == this.xiaZhuangUid) {
                    this.xiaZhuangUid = '';
                    this.zhuangInfo.uid = null;
                    if (this.zhuangInfo.money > 0) {
                        let profit = -this.zhuangInfo.money * 0.4;
                        const res = await (0, RecordGeneralManager_1.default)()
                            .setPlayerBaseInfo(zj_pl.uid, false, zj_pl.isRobot, zj_pl.gold)
                            .setGameInfo(this.nid, this.sceneId, this.roomId)
                            .setGameRecordInfo(0, 0, profit, false)
                            .sendToDB(2);
                        zj_pl.gold = res.gold;
                    }
                }
                if (this.zhuangInfo.uid) {
                    break;
                }
            }
            if (this.zhuangInfo.uid == null) {
                let queue_one = this.zj_queues.shift() || null;
                if (!queue_one) {
                    break;
                }
                let zj_pl = queue_one ? this.getPlayer(queue_one.uid) : null;
                if (!zj_pl || (zj_pl && zj_pl.onLine == false)) {
                    continue;
                }
                if (zj_pl.gold < this.upZhuangCond) {
                    const member = this.channel.getMember(zj_pl.uid);
                    member && MessageService.pushMessageByUids('br_onKickZhuang', { msg: langsrv.getlanguage(zj_pl.language, langsrv.Net_Message.id_1219) }, member);
                    continue;
                }
                this.zhuangInfo.uid = zj_pl.uid;
                this.zhuangInfo.hasRound = zj_pl ? bairenConst.ZHUANG_NUM : -1;
                this.zhuangInfo.money = 0;
                break;
            }
        } while (true);
        this.noticeZhuangInfo();
    }
    casinoWar(zhuangResult) {
        const zhuangMultiple = this.conversionMultiple(zhuangResult.cardType);
        for (const lottery of this.lotterys) {
            lottery.isWin = BRNN_Logic.bipaiSole(lottery, zhuangResult);
            const real_pl_totalbet = this.players.filter(pl => pl && pl.isRobot == 0).reduce((total, v) => { return total + v.betList[lottery.area].bet; }, 0);
            const robo_pl_totalbet = this.players.filter(pl => pl && pl.isRobot == 2).reduce((total, v) => { return total + v.betList[lottery.area].bet; }, 0);
            if (lottery.isWin) {
                lottery.multiple = this.conversionMultiple(lottery.cardType);
                zhuangResult.profit -= lottery.multiple * (real_pl_totalbet + robo_pl_totalbet);
            }
            else {
                lottery.multiple = zhuangMultiple;
                zhuangResult.profit += zhuangMultiple * (real_pl_totalbet + robo_pl_totalbet);
            }
        }
        ;
        return zhuangResult.profit;
    }
    casinoWarTwo(zhuangResult, isRobot) {
        const zhuangMultiple = this.conversionMultiple(zhuangResult.cardType);
        let success = true;
        this.lotterys.forEach((lottery, index) => {
            lottery.isWin = BRNN_Logic.bipaiSole(lottery, zhuangResult);
            const playerTotalBet = this.players.filter(pl => pl && pl.isRobot == RoleEnum_1.RoleEnum.REAL_PLAYER).reduce((total, v) => { return total + v.betList[lottery.area].bet; }, 0);
            const robotTotalBet = this.players.filter(pl => pl && pl.isRobot == RoleEnum_1.RoleEnum.ROBOT).reduce((total, v) => { return total + v.betList[lottery.area].bet; }, 0);
            if (lottery.isWin && this.killAreas.has(index)) {
                success = false;
                return;
            }
            if (this.killAreas.has(index)) {
                return;
            }
            if (lottery.isWin) {
                lottery.multiple = this.conversionMultiple(lottery.cardType);
                if (isRobot) {
                    zhuangResult.profit -= lottery.multiple * playerTotalBet;
                }
                else {
                    zhuangResult.profit -= lottery.multiple * robotTotalBet;
                }
            }
            else {
                lottery.multiple = zhuangMultiple;
                if (isRobot) {
                    zhuangResult.profit += zhuangMultiple * playerTotalBet;
                }
                else {
                    zhuangResult.profit += zhuangMultiple * robotTotalBet;
                }
            }
        });
        return { profit: zhuangResult.profit, success };
    }
    simulate(parameter) {
        let cards = parameter.slice().sort((j, k) => k % 13 - j % 13);
        let zhuangResultTemp = {
            cards: cards,
            cardType: BRNN_Logic.getCardType(cards.slice()),
            profit: 0,
            isniu: false,
            cardNum: null
        };
        return zhuangResultTemp;
    }
    settlementBairenRoom(list) {
        for (const pl of list) {
            if (pl.uid === this.zhuangInfo.uid) {
                pl.profit = this.zhuangResult.profit;
            }
            else {
                pl.settlementBairenPlayer(this.lotterys);
            }
        }
    }
    noticeZhuangInfo(playerInfo) {
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        const opts = {
            zhuangInfo: zhuang && zhuang.strip(this.zhuangInfo.hasRound),
            zj_queues: this.zj_queues.map(pl => {
                return {
                    uid: pl.uid,
                    headurl: pl.headurl,
                    nickname: pl.nickname,
                    gold: pl.gold,
                    isRobot: pl.isRobot
                };
            }),
            applyZhuangsNum: this.zj_queues.length
        };
        if (playerInfo) {
            const member = this.channel.getMember(playerInfo.uid);
            member && MessageService.pushMessageByUids(`br_onUpdateZhuangInfo`, opts, member);
            return;
        }
        this.channelIsPlayer('br_onUpdateZhuangInfo', opts);
    }
    applyUpzhuang(playerInfo) {
        this.zj_queues.push(playerInfo);
        this.noticeZhuangInfo();
    }
    exitUpzhuanglist(uid) {
        utils.remove(this.zj_queues, 'uid', uid);
        this.noticeZhuangInfo();
    }
    conversionMultiple(type) {
        let mul;
        if (this.sceneId == 0) {
            if (type < 7) {
                mul = 1;
            }
            if (type >= 7 && type <= 9) {
                mul = 2;
            }
            if (type == 10) {
                mul = 3;
            }
            if (type >= 11 && type <= 12) {
                mul = 4;
            }
            if (type == 13) {
                mul = 5;
            }
        }
        else {
            mul = type >= this.compensate ? this.compensate : (type || 1);
        }
        return mul;
    }
    isBeyondZhuangLimit(betList) {
        if (!this.zhuangInfo.uid) {
            return false;
        }
        let sum = betList.reduce((total, Value) => { return total + Value.bet; }, 0);
        let TempSum = this.situations.reduce((total, Value) => { return total + Value.totalBet; }, 0);
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        return zhuang && zhuang.gold < (TempSum + sum) * this.compensate;
    }
    toBetBack() {
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        return {
            zhuangResult: { cards: this.zhuangResult.cards, isniu: this.zhuangResult.isniu },
            zhuangInfo: zhuang && zhuang.strip(this.zhuangInfo.hasRound),
            applyZhuangs: this.zj_queues.map(pl => {
                return {
                    uid: pl.uid,
                    headurl: pl.headurl,
                    nickname: pl.nickname,
                    gold: pl.gold,
                    isRobot: pl.isRobot
                };
            }),
            regions: this.lotterys.map(m => {
                return {
                    cards: m.cards,
                    isniu: m.isniu
                };
            }),
            applyZhuangsNum: this.zj_queues.length,
            robotNum: this.zj_queues.filter(m => m && m.isRobot == 2).length
        };
    }
    toResultBack() {
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        let res = zhuang ? { uid: zhuang.uid, gold: zhuang.gold } : { uid: null, gold: null };
        let stripPlayers = this.players.map(pl => {
            if (pl) {
                return {
                    uid: pl.uid,
                    nickname: pl.nickname,
                    headurl: pl.headurl,
                    gold: pl.gold,
                    winRound: pl.winRound,
                    bet: pl.bet,
                    bets: pl.betList,
                    profit: pl.profit,
                    totalBet: pl.bet,
                    totalProfit: utils.sum(pl.totalProfit),
                };
            }
        });
        let opts = {
            zhuangResult: this.zhuangResult,
            regions: this.lotterys,
            situations: this.situations,
            bairenHistory: this.bairenHistory,
            zhuangInfo: res,
            players: stripPlayers,
            countdownTime: this.getCountdownTime()
        };
        return opts;
    }
    strip() {
        return {
            roomId: this.roomId,
            lowBet: this.lowBet,
            upZhuangCond: this.upZhuangCond,
            status: this.status,
            countdownTime: this.getCountdownTime(),
            regions: this.lotterys,
            bairenHistory: this.bairenHistory,
            zhuangResult: this.zhuangResult,
            situations: this.situations
        };
    }
    rankingLists() {
        let stripPlayers = this.players.map(pl => {
            if (pl) {
                return {
                    uid: pl.uid,
                    nickname: pl.nickname,
                    headurl: pl.headurl,
                    gold: pl.gold - pl.bet,
                    bet: pl.bet,
                    bets: pl.betList,
                    profit: pl.profit,
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
    getOffLineData(currPlayer) {
        let opts = {
            status: this.status,
            countdownTime: this.getCountdownTime(),
            data: this.toResultBack()
        };
        return opts;
    }
    addNote(playerInfo) {
        if (playerInfo.profit >= 100000) {
            const zname = JsonConfig.get_games(this.nid).zname;
            MessageService.sendBigWinNotice(this.nid, playerInfo.nickname, playerInfo.profit, playerInfo.isRobot, playerInfo.headurl);
        }
    }
    async controlDealCards(sceneControlState, isPlatformControl) {
        if (sceneControlState === constants_1.ControlState.NONE) {
            return this.randomDeal();
        }
        const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        this.players.forEach(p => p.bet > 0 && p.setControlType(type));
        const banker = this.getPlayer(this.zhuangInfo.uid);
        const bankerIsRealMan = !!banker && banker.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER;
        const playerBet = this.getPlayerBetNum(bankerIsRealMan ? 0 : 2);
        for (let i = 0; i < 100; i++) {
            const { profit } = this.randomDeal();
            if (bankerIsRealMan) {
                if (sceneControlState === constants_1.ControlState.SYSTEM_WIN && profit <= 0) {
                    break;
                }
                else if (sceneControlState === constants_1.ControlState.PLAYER_WIN && profit >= 0) {
                    break;
                }
            }
            else {
                if (sceneControlState === constants_1.ControlState.SYSTEM_WIN && profit >= playerBet) {
                    break;
                }
                else if (sceneControlState === constants_1.ControlState.PLAYER_WIN && profit <= playerBet) {
                    break;
                }
            }
        }
    }
    async dealCards() {
        await this.controlLogic.runControl();
    }
    async br_kickNoOnline() {
        const players = this.players.filter(p => p.uid !== this.zhuangInfo.uid);
        const offlinePlayers = await this.kickOfflinePlayerAndWarnTimeoutPlayer(players, 5, 3);
        offlinePlayers.forEach(p => {
            this.leave(p, false);
            if (!p.onLine) {
                this.roomManager.removePlayer(p);
            }
            else {
                this.roomManager.playerAddToChannel(p);
            }
            this.roomManager.removePlayerSeat(p.uid);
        });
    }
    bankerDealCards(lastResult) {
        this.zhuangResult.cards = this.zhuangResult.cards.concat(lastResult);
        this.zhuangResult.cardType = BRNN_Logic.getCardType(this.zhuangResult.cards.slice());
        this.zhuangResult.cardNum = BRNN_Logic.getNiuNum(this.zhuangResult.cards);
        this.zhuangResult.profit = 0;
    }
    getPlayerBetNum(isRobot = 2) {
        let bet = 0;
        if (isRobot === 4) {
            this.players.forEach(player => bet += player.filterBetNum(this.killAreas));
        }
        else {
            this.players.filter(player => player.isRobot !== isRobot).forEach(player => bet += player.filterBetNum(this.killAreas));
        }
        return bet;
    }
    bankerIsRealMan() {
        const banker = this.getPlayer(this.zhuangInfo.uid);
        return !!banker && banker.isRobot === 0;
    }
    markKillArea(areas) {
        areas.forEach((area, index) => {
            if (area === commonConst_1.CommonControlState.LOSS) {
                this.killAreas.add(index);
            }
        });
    }
    personalDealCards(state) {
        for (let i = 0; i < 100; i++) {
            this.randomDeal();
            const bankerInfo = this.simulate(this.zhuangResult.cards);
            const bankerProfit = this.calculationControlPlayerProfit({ bankerInfo, state });
            if (state === commonConst_1.CommonControlState.WIN && bankerProfit < 0 ||
                state === commonConst_1.CommonControlState.LOSS && bankerProfit > 0) {
                break;
            }
        }
    }
    calculationControlPlayerProfit(params) {
        const bankerMultiple = this.conversionMultiple(params.bankerInfo.cardType);
        const controlPlayers = this.players.filter(player => player.controlState === params.state);
        const betInfo = this.statisticsPlayerBetInfo({ players: controlPlayers });
        let bankerProfit = 0;
        this.lotterys.forEach((areaInfo, index) => {
            areaInfo.isWin = BRNN_Logic.bipaiSole(areaInfo, params.bankerInfo);
            if (areaInfo.isWin) {
                areaInfo.multiple = this.conversionMultiple(areaInfo.cardType);
                bankerProfit -= areaInfo.multiple * betInfo[index];
            }
            else {
                areaInfo.multiple = bankerMultiple;
                bankerProfit += areaInfo.multiple * betInfo[index];
            }
        });
        return bankerProfit;
    }
    statisticsPlayerBetInfo(params) {
        let betInfo = [0, 0, 0, 0];
        params.players.forEach(p => {
            p.betList.forEach((num, index) => betInfo[index] += num.bet);
        });
        return betInfo;
    }
    setPlayersState(params) {
        params.players.forEach(p => {
            const player = this.getPlayer(p.uid);
            player.setControlType(constants_1.ControlKinds.PERSONAL);
            player.setControlState({ state: params.state });
        });
    }
    randomDealCardsArea() {
        this.lotterys.map(area => {
            let cards3 = BRNN_Logic.getCardNum(this.pais, 3);
            area.cards.push(...cards3);
            area.cardType = BRNN_Logic.getCardType(area.cards.slice());
            area.cardNum = BRNN_Logic.getNiuNum(area.cards);
        });
    }
    rollbackInitState() {
        this.lotterys = JSON.parse(JSON.stringify(this.areasBackup));
        this.pais = JSON.parse(JSON.stringify(this.cardsBackup));
        this.zhuangResult = JSON.parse(JSON.stringify(this.bankerBackup));
    }
    randomDealBankerCards() {
        this.bankerDealCards(BRNN_Logic.getCardNum(this.pais, 3));
    }
    randomDeal() {
        this.rollbackInitState();
        this.randomDealCardsArea();
        this.randomDealBankerCards();
        const banker = this.simulate(this.zhuangResult.cards);
        const { success, profit } = this.casinoWarTwo(banker, !this.bankerIsRealMan());
        if (!success) {
            return this.randomDeal();
        }
        return { success, profit };
    }
    calculateBankerWin() {
    }
}
exports.BaiRenRoomImpl = BaiRenRoomImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFpUmVuUm9vbUltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9iYWlyZW4vbGliL0JhaVJlblJvb21JbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHlEQUFrRjtBQUNsRix1RUFBb0U7QUFDcEUsK0NBQXdDO0FBQ3hDLDREQUE0RDtBQUM1RCxrRkFBc0Y7QUFFdEYsaUNBQThCO0FBRTlCLHNFQUFvRjtBQUNwRiw4Q0FBb0Q7QUFDcEQsMkNBQTJDO0FBQzNDLG1GQUFpRjtBQUNqRix1RUFBb0U7QUFDcEUsd0NBQXlDO0FBQ3pDLHNEQUF1RDtBQUN2RCxtRUFBb0U7QUFDcEUsdURBQXdEO0FBQ3hELGdFQUEwRTtBQUMxRSxrR0FBMEY7QUFFMUYsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLENBQUM7QUFFOUIsTUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDO0FBRXpCLE1BQU0sZUFBZSxHQUFHLEVBQUUsQ0FBQztBQUszQixNQUFhLGNBQWUsU0FBUSx1QkFBa0I7SUF3RGxELFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7UUEvQ2YsV0FBTSxHQUFpRCxNQUFNLENBQUM7UUFFOUQsY0FBUyxHQUFhLEVBQUUsQ0FBQztRQVl6QixhQUFRLEdBQWlDLEVBQUUsQ0FBQztRQUU1QyxzQkFBaUIsR0FBVyxDQUFDLENBQUM7UUFFOUIsZUFBVSxHQUFpRyxFQUFFLENBQUM7UUFFOUcsaUJBQVksR0FBRyxFQUFFLENBQUM7UUFFbEIsU0FBSSxHQUFhLEVBQUUsQ0FBQztRQUVwQixnQkFBVyxHQUFpQixJQUFJLENBQUM7UUFDakMsWUFBTyxHQUFVLEVBQUUsQ0FBQztRQUNwQixZQUFPLEdBQWEsRUFBRSxDQUFDO1FBT3ZCLGNBQVMsR0FBVyxFQUFFLENBQUM7UUFJdkIsZ0JBQVcsR0FBUSxJQUFJLENBQUM7UUFFeEIsZ0JBQVcsR0FBUSxJQUFJLENBQUM7UUFFeEIsaUJB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