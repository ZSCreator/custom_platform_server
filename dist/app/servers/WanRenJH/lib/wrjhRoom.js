"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("../../../utils/index");
const index_1 = require("../../../utils/index");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const wrjh_logic = require("./wrjh_logic");
const pinus_logger_1 = require("pinus-logger");
const wrjhPlayer_1 = require("./wrjhPlayer");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const constants_1 = require("../../../services/newControl/constants");
const langsrv = require("../../../services/common/langsrv");
const control_1 = require("./control");
const roomUtil_1 = require("./util/roomUtil");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const WanRenJHConst = require("../../../consts/WanRenJHConst");
const MessageService = require("../../../services/MessageService");
const WanrenMgr_1 = require("../lib/WanrenMgr");
const robotCommonOp_1 = require("../../../services/robotService/overallController/robotCommonOp");
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const BET_COUNTDOWN = 19;
const BIPAI_COUNTDOWN = 15;
class wrjhRoom extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.status = 'NONE';
        this.applyZhuangs = [];
        this.situations = [];
        this.lastCountdownTime = 0;
        this.allBets = 0;
        this.allGains = [];
        this.xiaZhuangUid = '';
        this.players = [];
        this.zipResult = '';
        this.bankerCardsBackup = null;
        this.playersCardsBackup = null;
        this.cardsBackup = null;
        this.bairenHistory = opts.bairenHistory || [];
        this.upZhuangCond = opts.ShangzhuangMinNum || 0;
        this.entryCond = opts.entryCond || 0;
        this.lowBet = opts.lowBet;
        this.ChipList = opts.ChipList;
        this.tallBet = opts.tallBet * WanRenJHConst.XIAN_HONG;
        this.compensate = opts.compensate;
        this.zhuangInfo = {
            uid: null,
            hasRound: -1,
            money: 0
        };
        this.zhuangResult = {
            cards: [],
            cardType: 0,
            profit: 0,
            cardNum: []
        };
        this.regions = [];
        for (let index = 0; index < 4; index++) {
            let region = {
                sumBet: 0,
                sumBetRobot: 0,
                cards: [],
                cardType: 0,
                multiple: 1,
                isWin: false,
                historys: [],
                uids: [],
                cardNum: [],
                areaControlState: commonConst_1.CommonControlState.RANDOM
            };
            this.regions.push(region);
        }
        this.pais = wrjh_logic.shuffle();
        this.ramodHistory();
        let AddCount = 0;
        do {
            let pl = (0, robotCommonOp_1.GetOnePl)();
            pl.gold = utils.random(this.upZhuangCond * 3, this.upZhuangCond * 4);
            this.addPlayerInRoom(pl);
            let ply = this.players[AddCount];
            this.applyZhuangs.push(ply);
            AddCount++;
            ply.updatetime += AddCount * 2 * 60;
        } while (AddCount < 3);
    }
    close() {
        clearInterval(this.runInterval);
        this.sendRoomCloseMessage();
        this.players = [];
    }
    ramodHistory() {
        let numberOfTimes = 20;
        do {
            let opts = {
                sceneId: this.sceneId,
                roomId: this.roomId,
                res: this.regions.map(m => { return { isWin: utils.random(0, 1) == 0 ? true : false }; }),
            };
            opts.res.forEach((m, index) => {
                let mm = this.regions[index];
                (mm.historys.length >= 10) && mm.historys.shift();
                mm.historys.push(m.isWin);
            });
            this.bairenHistory.push(opts);
            numberOfTimes--;
        } while (numberOfTimes > 0);
    }
    async Initialization() {
        for (const pl of this.players) {
            pl.initGame(this);
        }
        await this.br_kickNoOnline();
        this.regions.forEach(m => {
            m.sumBet = 0;
            m.sumBetRobot = 0;
            m.cards = null;
            m.cardType = 0;
            m.multiple = 0;
            m.isWin = false;
            m.cardNum = [];
            m.areaControlState = commonConst_1.CommonControlState.RANDOM;
        });
        this.bankerCardsBackup = null;
        this.playersCardsBackup = null;
        this.cardsBackup = null;
        this.zhuangResult = {
            cards: [],
            cardType: 0,
            profit: 0,
            cardNum: []
        };
        this.situations = [];
        this.allBets = 0;
        this.allGains = [];
        this.pais = wrjh_logic.shuffle();
        this.control = new control_1.default({ room: this });
        this.startTime = Date.now();
        this.zipResult = '';
        this.updateRealPlayersNumber();
        this.updateRoundId();
    }
    addPlayerInRoom(dbplayer) {
        let playerInfo = this.getPlayer(dbplayer.uid);
        if (playerInfo) {
            playerInfo.sid = dbplayer.sid;
            this.offLineRecover(playerInfo);
            return true;
        }
        if (this.isFull())
            return false;
        this.players.push(new wrjhPlayer_1.default(dbplayer));
        this.addMessage(dbplayer);
        this.updateRealPlayersNumber();
        this.playersChange();
        return true;
    }
    leave(playerInfo, isOffLine) {
        this.kickOutMessage(playerInfo.uid);
        utils.remove(this.applyZhuangs, 'uid', playerInfo.uid);
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        utils.remove(this.players, 'uid', playerInfo.uid);
        const opts = {
            roomId: this.roomId,
            uid: playerInfo.uid,
        };
        this.channelIsPlayer('wr_onExit', opts);
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
            member && MessageService.pushMessageByUids(`wrjh_playersChange`, opts, member);
            return;
        }
        this.channelIsPlayer(`wrjh_playersChange`, opts);
    }
    getCountdownTime() {
        if (this.status === 'INSETTLE')
            return (BIPAI_COUNTDOWN + 1);
        const time = (Date.now() - this.lastCountdownTime) / 1000;
        if (this.status === 'BETTING')
            return Math.max(BET_COUNTDOWN - time, 0.5);
        if (this.status === 'INBIPAI')
            return Math.max(BIPAI_COUNTDOWN - time, 0.5);
        return 0;
    }
    async runRoom() {
        this.lastCountdownTime = Date.now();
        this.countdown = BET_COUNTDOWN;
        this.status = 'BETTING';
        this.startBet();
        clearInterval(this.runInterval);
        this.runInterval = setInterval(() => this.update(), 1000);
    }
    update() {
        if (this.status === 'INSETTLE')
            return;
        --this.countdown;
        if (this.countdown > 0) {
            return;
        }
        this.lastCountdownTime = Date.now();
        switch (this.status) {
            case 'BETTING':
                this.countdown = BIPAI_COUNTDOWN;
                this.status = 'INSETTLE';
                this.Settlement();
                break;
            case 'INBIPAI':
                this.countdown = BET_COUNTDOWN;
                this.status = 'BETTING';
                this.startBet();
                break;
        }
    }
    getCards(num) {
        let cards = [];
        for (let i = 0; i < num; i++) {
            const index = (0, index_1.random)(0, this.pais.length - 1);
            cards.push(this.pais[index]);
            this.pais.splice(index, 1);
        }
        return cards;
    }
    async startBet() {
        await this.Initialization();
        await this.check_zjList();
        this.playersCardsBackup = this.regions.map(m => {
            m.cards = this.getCards(2);
            return JSON.parse(JSON.stringify(m.cards));
        });
        this.zhuangResult.cards = this.getCards(2);
        this.bankerCardsBackup = JSON.parse(JSON.stringify(this.zhuangResult.cards));
        this.cardsBackup = JSON.parse(JSON.stringify(this.pais));
        WanrenMgr_1.default.pushRoomStateMessage(this.roomId, {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            status: this.status,
            downTime: this.getCountdownTime()
        });
        for (const pl of this.players) {
            const member = this.channel.getMember(pl.uid);
            const opts = { status: this.status, roundId: this.roundId, downTime: this.getCountdownTime(), isRenew: pl.isCanRenew(this) };
            member && MessageService.pushMessageByUids('wr_start', opts, member);
        }
    }
    async Settlement() {
        await this.control.run_result();
        let result = wrjh_logic.getMaxCardtype(this.zhuangResult.cards.slice(), []);
        this.zhuangResult.cardType = result.cardType;
        this.zhuangResult.cardNum = result.cards;
        this.zhuangResult.profit = 0;
        this.casinoWar(this.zhuangResult, false);
        this.regions.forEach(m => {
            (m.historys.length >= 10) && m.historys.shift();
            m.historys.push(m.isWin);
        });
        this.endTime = Date.now();
        this.zipResult = (0, roomUtil_1.buildRecordResult)(this.regions, this.zhuangResult);
        this.settlementBairenRoom(this.players);
        let opts = {
            sceneId: this.sceneId,
            roomId: this.roomId,
            res: this.regions.map(m => { return { isWin: m.isWin }; }),
        };
        this.bairenHistory.push(opts);
        if (this.bairenHistory.length > 20)
            this.bairenHistory.shift();
        for (const pl of this.players) {
            (pl.bet > 0 ||
                (pl.uid == this.zhuangInfo.uid && this.allBets > 0)) && await pl.updateGold(this);
        }
        this.status = 'INBIPAI';
        let opts2 = {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            status: this.status,
            historyData: this.toResultBack()
        };
        WanrenMgr_1.default.pushRoomStateMessage(this.roomId, opts2);
        this.channelIsPlayer("wr_onSettlement", this.players.map(c => {
            return {
                uid: c.uid,
                gold: c.gold,
            };
        }));
    }
    async check_zjList() {
        do {
            if (this.zhuangInfo.uid) {
                this.zhuangInfo.hasRound--;
                const zj_pl = this.getPlayer(this.zhuangInfo.uid);
                if (zj_pl && zj_pl.gold < this.upZhuangCond) {
                    const member = this.channel.getMember(zj_pl.uid);
                    member && MessageService.pushMessageByUids('wr_onKickZhuang', { uid: zj_pl.uid, gold: zj_pl.gold, msg: langsrv.getlanguage(zj_pl.language, langsrv.Net_Message.id_1218) }, member);
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
                            .setGameRecordInfo(0, 0, profit)
                            .addResult(this.zipResult)
                            .sendToDB(2);
                        zj_pl.gold = res.gold;
                        const member = this.channel.getMember(zj_pl.uid);
                        member && MessageService.pushMessageByUids('wr_onKickZhuang', { uid: zj_pl.uid, gold: zj_pl.gold, msg: langsrv.getlanguage(zj_pl.language, langsrv.Net_Message.id_1221) }, member);
                    }
                }
                if (this.zhuangInfo.uid) {
                    break;
                }
            }
            if (this.zhuangInfo.uid == null) {
                let queue_one = this.applyZhuangs.shift() || null;
                if (!queue_one) {
                    break;
                }
                let zj_pl = queue_one ? this.getPlayer(queue_one.uid) : null;
                if (!zj_pl || (zj_pl && zj_pl.onLine == false)) {
                    continue;
                }
                if (zj_pl.gold < this.upZhuangCond) {
                    const member = this.channel.getMember(zj_pl.uid);
                    member && MessageService.pushMessageByUids('wr_onKickZhuang', { uid: zj_pl.uid, gold: zj_pl.gold, msg: langsrv.getlanguage(zj_pl.language, langsrv.Net_Message.id_1219) }, member);
                    continue;
                }
                this.zhuangInfo.uid = zj_pl.uid;
                this.zhuangInfo.hasRound = zj_pl ? WanRenJHConst.ZHUANG_NUM : -1;
                this.zhuangInfo.money = 0;
                break;
            }
        } while (true);
        this.noticeZhuangInfo();
    }
    casinoWar(zhuangResult, isRobot) {
        let bankerLossAmount = 0;
        const zhuangMultiple = this.conversionMultiple(zhuangResult.cardType);
        this.regions.forEach((m, i) => {
            m.isWin = wrjh_logic.bipaiSoleEx([{ cards: m.cardNum, cardType: m.cardType },
                { cards: zhuangResult.cardNum, cardType: zhuangResult.cardType }]);
            if (m.isWin) {
                m.multiple = this.conversionMultiple(m.cardType);
                if (isRobot) {
                    zhuangResult.profit -= m.multiple * (m.sumBet - m.sumBetRobot);
                }
                else {
                    zhuangResult.profit -= m.multiple * m.sumBet;
                }
            }
            else {
                m.multiple = zhuangMultiple;
                if (isRobot) {
                    zhuangResult.profit += zhuangMultiple * (m.sumBet - m.sumBetRobot);
                }
                else {
                    zhuangResult.profit += zhuangMultiple * m.sumBet;
                }
            }
        });
        return { profit: zhuangResult.profit };
    }
    casinoWarTwo(zhuangResult, isRobot) {
        let bankerLossAmount = 0;
        const zhuangMultiple = this.conversionMultiple(zhuangResult.cardType);
        this.regions.forEach((m, i) => {
            m.isWin = wrjh_logic.bipaiSoleEx([{ cards: m.cardNum, cardType: m.cardType },
                { cards: zhuangResult.cardNum, cardType: zhuangResult.cardType }]);
            if (m.isWin) {
                m.multiple = this.conversionMultiple(m.cardType);
                if (isRobot) {
                    zhuangResult.profit -= m.multiple * (m.sumBet - m.sumBetRobot);
                }
                else {
                    zhuangResult.profit -= m.multiple * m.sumBetRobot;
                }
            }
            else {
                m.multiple = zhuangMultiple;
                if (isRobot) {
                    zhuangResult.profit += zhuangMultiple * (m.sumBet - m.sumBetRobot);
                }
                else {
                    zhuangResult.profit += zhuangMultiple * m.sumBetRobot;
                }
            }
        });
        return { profit: zhuangResult.profit };
    }
    calculationBankerGain(controlPlayers) {
        const result = wrjh_logic.getMaxCardtype(this.zhuangResult.cards.slice(), []).cards;
        let cardType = wrjh_logic.getCardType(result);
        const multiple = this.conversionMultiple(cardType);
        const players = controlPlayers.map(controlPlayer => this.players.find(p => p.uid === controlPlayer.uid));
        let gain = 0;
        this.regions.forEach((betArea, i) => {
            betArea.isWin = wrjh_logic.bipaiSoleEx([{ cards: betArea.cardNum, cardType: betArea.cardType },
                { cards: result, cardType: cardType }]);
            betArea.multiple = betArea.isWin ? this.conversionMultiple(betArea.cardType) : multiple;
            players.forEach(p => {
                if (betArea.isWin) {
                    gain -= p.bets[i].bet * betArea.multiple;
                }
                else {
                    gain += p.bets[i].bet * betArea.multiple;
                }
            });
        });
        return gain;
    }
    simulate(parameter) {
        let cards = parameter.slice().sort((j, k) => k % 13 - j % 13);
        let result = wrjh_logic.getMaxCardtype(cards.slice(), []);
        let zhuangResultTemp = {
            cards: [],
            cardNum: result.cards,
            cardType: result.cardType,
            profit: 0
        };
        return zhuangResultTemp;
    }
    onBeting(playerInfo, area, betNum) {
        playerInfo.isBet = true;
        this.bairenBet(playerInfo, area, betNum);
        const bets = [0, 0, 0, 0];
        bets[area] = betNum;
        this.wr_onBeting(playerInfo, bets);
    }
    bairenBet(playerInfo, area, num) {
        playerInfo.bets[area].bet += num;
        playerInfo.bet += num;
        playerInfo.addUpBet += num;
        if (playerInfo.isRobot === 2) {
            this.regions[area].sumBetRobot += num;
        }
        this.allBets += num;
        this.regions[area].sumBet += num;
        let situation = this.situations.find(m => m.area == area);
        if (!situation) {
            this.situations.push({ area: area, betList: [], totalBet: 0 });
            situation = this.situations.find(m => m.area == area);
        }
        situation.betList.push({
            uid: playerInfo.uid,
            bet: num,
            updatetime: new Date().getTime() / 1000
        });
        situation.totalBet += num;
    }
    wr_onBeting(currPlayer, bets) {
        const opts = {
            roomId: this.roomId,
            uid: currPlayer.uid,
            betNums: bets,
            curBetNums: currPlayer.bets,
            sumBets: this.regions.map(m => m.sumBet),
            list: this.rankingLists().slice(0, 6)
        };
        this.channelIsPlayer('wr_onBeting', opts);
    }
    onGoonBet(currPlayer) {
        currPlayer.lastBets.forEach((m, i) => {
            this.bairenBet(currPlayer, m.area, m.betNum);
        });
        currPlayer.bets.forEach((bet, index) => {
            const bets = [0, 0, 0, 0];
            bets[index] = bet.bet;
            this.wr_onBeting(currPlayer, bets);
        });
    }
    settlementBairenRoom(list) {
        for (const pl of list) {
            if (pl.uid === this.zhuangInfo.uid) {
                pl.bet = Math.abs(this.zhuangResult.profit);
                pl.profit = this.zhuangResult.profit;
            }
            else {
                pl.settlementBairenPlayer(this);
            }
            pl.lastProfit = pl.profit;
        }
    }
    noticeZhuangInfo(playerInfo) {
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        const opts = {
            roomId: this.roomId,
            zhuangInfo: zhuang && zhuang.strip(this.zhuangInfo.hasRound),
            applyZhuangs: this.applyZhuangs.map(pl => {
                return {
                    uid: pl.uid,
                    headurl: pl.headurl,
                    nickname: pl.nickname,
                    bet: pl.bet,
                    gold: pl.gold,
                    robot: pl.isRobot,
                };
            }),
        };
        if (playerInfo) {
            const member = this.channel.getMember(playerInfo.uid);
            member && MessageService.pushMessageByUids(`wr_onUpdateZhuangInfo`, opts, member);
            return;
        }
        this.channelIsPlayer('wr_onUpdateZhuangInfo', opts);
    }
    applyUpzhuang(uid) {
        let player = this.getPlayer(uid);
        this.applyZhuangs.push(player);
        this.noticeZhuangInfo();
    }
    async br_kickNoOnline() {
        const players = this.players.filter(p => p.uid !== this.zhuangInfo.uid);
        const offlinePlayers = await this.kickOfflinePlayerAndWarnTimeoutPlayer(players, 5, 3);
        offlinePlayers.forEach(p => {
            this.leave(p, false);
            if (!p.onLine) {
                WanrenMgr_1.default.removePlayer(p);
            }
            else {
                WanrenMgr_1.default.playerAddToChannel(p);
            }
            WanrenMgr_1.default.removePlayerSeat(p.uid);
        });
    }
    exitUpzhuanglist(uid) {
        utils.remove(this.applyZhuangs, 'uid', uid);
        this.noticeZhuangInfo();
    }
    conversionMultiple(type) {
        const fiveScene = { '0': 1, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 };
        const tenScene = { '0': 1, '1': 2, '2': 3, '3': 5, '4': 8, '5': 10 };
        return this.compensate == 5 ? fiveScene[type] : tenScene[type];
    }
    isBeyondZhuangLimit(bets) {
        if (!this.zhuangInfo.uid) {
            return false;
        }
        let totalBet = 0;
        for (const region of this.regions) {
            totalBet += region.sumBet;
        }
        for (const iterator of bets) {
            totalBet += iterator.betNum;
        }
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        return zhuang && zhuang.gold < totalBet * this.compensate;
    }
    toBetBack() {
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        return {
            zhuangResult: { cards: this.zhuangResult.cards },
            zhuangInfo: zhuang && zhuang.strip(this.zhuangInfo.hasRound),
            applyZhuangs: this.applyZhuangs.map(pl => {
                return {
                    uid: pl.uid,
                    headurl: pl.headurl,
                    nickname: pl.nickname,
                    bet: pl.bet,
                    gold: pl.gold,
                    robot: pl.isRobot,
                };
            }),
            regions: this.regions.map(m => {
                return {
                    cards: m.cards,
                };
            }),
            robotNum: this.applyZhuangs.filter(pl => pl.isRobot === 2).length,
        };
    }
    toResultBack() {
        const zj_pl = this.getPlayer(this.zhuangInfo.uid);
        let res = zj_pl ? { uid: zj_pl.uid, gold: zj_pl.gold } : { uid: null, gold: null };
        let stripPlayers = this.players.map(pl => {
            if (pl) {
                return {
                    uid: pl.uid,
                    nickname: pl.nickname,
                    headurl: pl.headurl,
                    gold: pl.gold,
                    bet: pl.bet,
                    bets: pl.bets,
                    profit: pl.profit,
                    winRound: pl.winRound,
                    totalBet: pl.bet,
                    totalProfit: utils.sum(pl.totalProfit),
                };
            }
        });
        const opts = {
            zhuangResult: this.zhuangResult,
            regions: this.regions,
            bairenHistory: this.bairenHistory,
            zhuangInfo: res,
            players: stripPlayers,
            countdownTime: this.getCountdownTime()
        };
        return opts;
    }
    strip() {
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        return {
            roomId: this.roomId,
            lowBet: this.lowBet,
            compensate: this.compensate,
            upZhuangCond: this.upZhuangCond,
            status: this.status === 'INSETTLE' ? 'INBIPAI' : this.status,
            countdownTime: this.getCountdownTime(),
            regions: this.regions,
            zhuangResult: this.zhuangResult
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
    allBet() {
        let allBetNum = 0;
        this.players.forEach(m => {
            allBetNum += m.bet;
        });
        return allBetNum;
    }
    addResult(currPlayer, num) {
        const minLowBet = 100000;
        if (num >= minLowBet) {
            MessageService.sendBigWinNotice(this.nid, currPlayer.nickname, num, currPlayer.isRobot, currPlayer.headurl);
        }
    }
    isBankerWinGreaterPlayerBet(bankerIsRealMan) {
        const currCard = this.zhuangResult.cards.slice();
        return this.casinoWarTwo(this.simulate(currCard), !bankerIsRealMan).profit > 0;
    }
    bankerIsRealMan() {
        const banker = this.players.find(player => player.uid === this.zhuangInfo.uid);
        return !!banker && banker.isRobot === 0;
    }
    getWinORLossResultFunc(isSystemWin) {
        const banker = this.players.find(player => player.uid === this.zhuangInfo.uid);
        const bankerIsRealMan = !!this.zhuangInfo.uid && banker.isRobot === 0;
        for (let i = 0; i < 100; i++) {
            this.randomDeal();
            if (bankerIsRealMan) {
                if (isSystemWin && !this.isBankerWinGreaterPlayerBet(bankerIsRealMan)) {
                    break;
                }
                else if (!isSystemWin && this.isBankerWinGreaterPlayerBet(bankerIsRealMan)) {
                    break;
                }
            }
            else {
                if (isSystemWin && this.isBankerWinGreaterPlayerBet(bankerIsRealMan)) {
                    break;
                }
                else if (!isSystemWin && !this.isBankerWinGreaterPlayerBet(bankerIsRealMan)) {
                    break;
                }
            }
        }
    }
    markKillArea(areas) {
        areas.forEach((state, index) => {
            if (state === commonConst_1.CommonControlState.LOSS) {
                this.regions[index].areaControlState = state;
            }
        });
    }
    personalDealCards(controlPlayers, state) {
        let res;
        controlPlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        for (let i = 0; i < 100; i++) {
            res = this.randomDeal();
            const gain = this.calculationBankerGain(controlPlayers);
            if ((state === commonConst_1.CommonControlState.WIN && gain < 0) || (state === commonConst_1.CommonControlState.LOSS && gain >= 0)) {
                break;
            }
        }
        return res;
    }
    sceneControlResult(state, isPlatformControl) {
        if (state === constants_1.ControlState.NONE) {
            return this.randomDeal();
        }
        const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        this.players.forEach(p => p.setControlType(type));
        return this.getWinORLossResultFunc(state === constants_1.ControlState.SYSTEM_WIN);
    }
    rollbackInitState() {
        this.regions.map((area, index) => {
            area.cards = JSON.parse(JSON.stringify(this.playersCardsBackup[index]));
        });
        this.zhuangResult.cards = JSON.parse(JSON.stringify(this.bankerCardsBackup));
        this.pais = JSON.parse(JSON.stringify(this.cardsBackup));
    }
    randomDealCardsArea() {
        this.regions.map(region => {
            region.cards = region.cards.concat(this.getCards(3));
            let result = wrjh_logic.getMaxCardtype(region.cards.slice(), []);
            if (result) {
                region.cardNum = result.cards;
                region.cardType = result.cardType;
            }
        });
    }
    randomDealBankerCards() {
        this.zhuangResult.cards = this.zhuangResult.cards.concat(this.getCards(3));
    }
    randomDeal() {
        this.rollbackInitState();
        this.randomDealCardsArea();
        this.randomDealBankerCards();
        let cardType = wrjh_logic.getCardType(this.zhuangResult.cards), out = true;
        this.regions.forEach((betArea, i) => {
            betArea.isWin = wrjh_logic.bipaiSoleEx([{ cards: betArea.cardNum, cardType: betArea.cardType },
                { cards: this.zhuangResult.cards, cardType: cardType }]);
            if (betArea.areaControlState === commonConst_1.CommonControlState.LOSS && betArea.isWin) {
                out = false;
            }
        });
        if (!out) {
            return this.randomDeal();
        }
        return true;
    }
}
exports.default = wrjhRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JqaFJvb20uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9XYW5SZW5KSC9saWIvd3JqaFJvb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4Q0FBOEM7QUFDOUMsZ0RBQThDO0FBQzlDLHVFQUFvRTtBQUNwRSwyQ0FBMkM7QUFDM0MsK0NBQXlDO0FBQ3pDLDZDQUFzQztBQVN0QyxrRkFBc0Y7QUFFdEYsc0VBQW9GO0FBRXBGLDREQUE0RDtBQUM1RCx1Q0FBZ0M7QUFDaEMsOENBQW9EO0FBQ3BELG1GQUFpRjtBQUNqRiwrREFBZ0U7QUFDaEUsbUVBQW9FO0FBR3BFLGdEQUE2RDtBQUM3RCxrR0FBMEY7QUFHMUYsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUVuRCxNQUFNLGFBQWEsR0FBRyxFQUFFLENBQUM7QUFFekIsTUFBTSxlQUFlLEdBQUcsRUFBRSxDQUFDO0FBUzNCLE1BQXFCLFFBQVMsU0FBUSx1QkFBc0I7SUFxRHhELFlBQVksSUFBSTtRQUNaLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQTlDZixXQUFNLEdBQWdELE1BQU0sQ0FBQztRQUU3RCxpQkFBWSxHQUFpQixFQUFFLENBQUM7UUFhaEMsZUFBVSxHQUFpRyxFQUFFLENBQUM7UUFFOUcsc0JBQWlCLEdBQVcsQ0FBQyxDQUFDO1FBRzlCLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFFcEIsYUFBUSxHQUFVLEVBQUUsQ0FBQztRQUNyQixpQkFBWSxHQUFHLEVBQUUsQ0FBQztRQUtsQixZQUFPLEdBQWlCLEVBQUUsQ0FBQztRQU8zQixjQUFTLEdBQVcsRUFBRSxDQUFDO1FBR3ZCLHNCQUFpQixHQUFhLElBQUksQ0FBQztRQUVuQyx1QkFBa0IsR0FBZSxJQUFJLENBQUM7UUFFdEMsZ0JBQVcsR0FBYSxJQUFJLENBQUM7UUFLekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJ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