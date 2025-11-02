"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaiJiaPlayerImpl_1 = require("./BaiJiaPlayerImpl");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const ControlImpl_1 = require("./ControlImpl");
const pinus_1 = require("pinus");
const constants_1 = require("../../../services/newControl/constants");
const roomUtil_1 = require("./util/roomUtil");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const baijia_logic = require("./baijia_logic");
const utils = require("../../../utils");
const baijiaConst = require("./baijiaConst");
const MessageService = require("../../../services/MessageService");
const langsrv = require("../../../services/common/langsrv");
const BaijiaRoomManagerImpl_1 = require("../lib/BaijiaRoomManagerImpl");
const robotCommonOp_1 = require("../../../services/robotService/overallController/robotCommonOp");
let BET_COUNTDOWN = 15;
let BIPAI_COUNTDOWN = 13;
let SHUFFLE__COUNTDOWN = 3;
class BaiJiaRoomImpl extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.pokerNum = 8;
        this.status = 'NONE';
        this.lastCountdownTime = 0;
        this.baijiaHistory = [];
        this.additionalCountdown = 0;
        this.allBets = 0;
        this.betList = [];
        this.inningNum = 48;
        this.bout = 0;
        this.zj_List = [];
        this.runInterval = null;
        this.players = [];
        this.zipResult = '';
        this.backendServerId = pinus_1.pinus.app.getServerId();
        this.entryCond = opts.entryCond;
        this.tallBet = opts.tallBet * baijiaConst.BET_XIANZHI;
        this.twainUpperLimit = opts.twainUpperLimit;
        this.betUpperLimit = opts.betUpperLimit;
        this.ChipList = opts.ChipList;
        this.lowBet = opts.lowBet;
        this.pais = baijia_logic.getPai(this.pokerNum).slice(0, this.pokerNum * 52 - utils.random(30, 80));
        this.allPoker = this.pais.length;
        this.area_bet = {
            play: { mul: 1, betUpperLimit: this.betUpperLimit, sumBet: 0 },
            draw: { mul: 8, betUpperLimit: this.twainUpperLimit, sumBet: 0 },
            bank: { mul: 1, betUpperLimit: this.betUpperLimit, sumBet: 0 },
            small: { mul: 1.5, betUpperLimit: this.betUpperLimit, sumBet: 0 },
            pair0: { mul: 11, betUpperLimit: this.twainUpperLimit, sumBet: 0 },
            pair1: { mul: 11, betUpperLimit: this.twainUpperLimit, sumBet: 0 },
            big: { mul: 1.5, betUpperLimit: this.betUpperLimit, sumBet: 0 }
        };
        this.regions = [
            { cards: null, cardType: 0, oldCardType: 0 },
            { cards: null, cardType: 0, oldCardType: 0 },
        ];
        this.result = null;
        this.baijiaHistory = opts.baijiaHistory || [];
        this.shuffle = false;
        this.upZhuangCond = opts.ShangzhuangMinNum;
        this.xiaZhuangUid = '';
        this.zhuangInfo = {
            uid: null,
            hasRound: -1,
            money: 0,
            profit: 0
        };
        this.killAreas = new Set();
        this.controlLogic = new ControlImpl_1.default({ room: this });
        this.ramodHistory();
        let AddCount = 0;
        do {
            let pl = (0, robotCommonOp_1.GetOnePl)();
            pl.gold = utils.random(this.upZhuangCond * 2, this.upZhuangCond * 3);
            this.addPlayerInRoom(pl);
            let ply = this.players[AddCount];
            this.zj_List.push(ply);
            AddCount++;
            ply.updatetime += AddCount * 2 * 60;
        } while (AddCount < 3);
    }
    close() {
        clearInterval(this.runInterval);
        this.sendRoomCloseMessage();
        this.players = [];
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
        this.players.push(new BaiJiaPlayerImpl_1.BaiJiaPlayerImpl(dbplayer));
        this.addMessage(dbplayer);
        this.updateRealPlayersNumber();
        return true;
    }
    leave(playerInfo, isOffLine) {
        this.kickOutMessage(playerInfo.uid);
        if (this.zj_List.findIndex(pl => pl.uid == playerInfo.uid) !== -1) {
            this.exitUpzhuanglist(playerInfo.uid);
        }
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        utils.remove(this.players, 'uid', playerInfo.uid);
        this.updateRealPlayersNumber();
        this.playerLeave();
    }
    playerLeave() {
        const opts = {
            roomId: this.roomId,
            list: this.rankingLists().slice(0, 6),
            playerNum: this.players.length
        };
        this.channelIsPlayer('bj_onExit', opts);
    }
    getCountdownTime() {
        const time = Date.now() - this.lastCountdownTime;
        if (this.status === 'INSETTLE')
            return (BIPAI_COUNTDOWN + 1 + this.additionalCountdown + (this.shuffle ? SHUFFLE__COUNTDOWN : 0)) * 1000;
        if (this.status === 'BETTING')
            return Math.max((BET_COUNTDOWN) * 1000 - time, 500);
        if (this.status === 'INBIPAI')
            return Math.max((BIPAI_COUNTDOWN + this.additionalCountdown + (this.shuffle ? SHUFFLE__COUNTDOWN : 0)) * 1000 - time, 500);
        return 0;
    }
    async run() {
        this.lastCountdownTime = Date.now();
        await this.Initialization();
        this.openTimer();
    }
    async Initialization() {
        this.players.forEach(pl => pl.initGame(this));
        await this.br_kickNoOnline();
        await this.check_zjList();
        await this.initRoom();
    }
    async check_zjList() {
        do {
            if (this.zhuangInfo.uid) {
                this.zhuangInfo.hasRound--;
                const zj_pl = this.getPlayer(this.zhuangInfo.uid);
                if (zj_pl && zj_pl.gold < this.upZhuangCond) {
                    const member = this.channel.getMember(zj_pl.uid);
                    member && MessageService.pushMessageByUids('bj_onKickZhuang', { msg: langsrv.getlanguage(zj_pl.language, langsrv.Net_Message.id_1218) }, member);
                    this.zhuangInfo.uid = null;
                }
                if (this.zhuangInfo.hasRound <= 0) {
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
                            .addResult(this.zipResult)
                            .sendToDB(2);
                        zj_pl.gold = res.gold;
                    }
                }
                if (this.zhuangInfo.uid) {
                    this.noticeZhuangInfo();
                    return;
                }
            }
            if (this.zhuangInfo.uid == null) {
                let queue_one = this.zj_List.shift() || null;
                if (!queue_one) {
                    break;
                }
                let zj_pl = queue_one ? this.getPlayer(queue_one.uid) : null;
                if (!zj_pl || (zj_pl && zj_pl.onLine == false)) {
                    continue;
                }
                if (zj_pl.gold < this.upZhuangCond) {
                    const member = this.channel.getMember(zj_pl.uid);
                    member && MessageService.pushMessageByUids('bj_onKickZhuang', { msg: langsrv.getlanguage(zj_pl.language, langsrv.Net_Message.id_1219) }, member);
                    continue;
                }
                this.zhuangInfo.uid = zj_pl.uid;
                this.zhuangInfo.hasRound = zj_pl ? baijiaConst.ZHUANG_NUM : -1;
                this.zhuangInfo.money = 0;
                this.noticeZhuangInfo();
                return;
            }
        } while (true);
    }
    openTimer() {
        clearInterval(this.runInterval);
        this.runInterval = setInterval(() => this.update(), 1000);
    }
    addPoker() {
        if (this.bout == this.inningNum) {
            this.baijiaHistory = [];
            this.pais = baijia_logic.getPai(this.pokerNum);
            this.shuffle = true;
            this.cuttingPoker();
            this.bout = 0;
        }
    }
    cuttingPoker() {
        let index = this.pais.length - utils.random(30, 80);
        this.pais = this.pais.slice(0, index);
        this.allPoker = this.pais.length;
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
                this.status = 'INSETTLE';
                this.Settlement();
                break;
            case 'INBIPAI':
                this.Initialization();
                break;
        }
    }
    async initRoom() {
        this.countdown = BET_COUNTDOWN;
        this.channelIsPlayer('bj_bet', { roundId: this.roundId, countdown: this.countdown });
        this.shuffle = false;
        this.addPoker();
        this.status = 'BETTING';
        BaijiaRoomManagerImpl_1.default.pushRoomStateMessage(this.roomId, {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            countDown: this.countdown,
            status: this.status,
            historyData: this.toResultBack()
        });
        this.allBets = 0;
        this.betList = [];
        this.regions.forEach(m => {
            m.cards = null;
            m.cardType = 0;
        });
        for (let key in this.area_bet) {
            this.area_bet[key].sumBet = 0;
        }
        this.zhuangInfo.profit = 0;
        this.killAreas.clear();
        this.updateRoundId();
        this.updateRealPlayersNumber();
        this.startTime = Date.now();
        this.zipResult = '';
    }
    async Settlement() {
        this.bout++;
        const { cards0, cards1 } = await this.controlLogic.runControl();
        this.regions[0].cards = cards0;
        let cardType0 = this.regions[0].oldCardType = baijia_logic.getCardTypeTo9(cards0);
        this.regions[1].cards = cards1;
        let cardType1 = this.regions[1].oldCardType = baijia_logic.getCardTypeTo9(cards1);
        this.additionalCountdown = 0;
        let bupai = -1;
        if (baijia_logic.canBupaiByPlay(cardType0, cardType1)) {
            bupai = this.seqDeal()[0];
            cards0.push(bupai);
            this.additionalCountdown += 1;
        }
        if (baijia_logic.canBupaiByBank(cardType0, cardType1, bupai)) {
            cards1.push(...this.seqDeal());
            this.additionalCountdown += 1;
        }
        this.countdown = BIPAI_COUNTDOWN + this.additionalCountdown;
        cardType0 = this.regions[0].cardType = baijia_logic.getCardTypeTo9(cards0);
        cardType1 = this.regions[1].cardType = baijia_logic.getCardTypeTo9(cards1);
        this.result = baijia_logic.getResultTo9(cards0, cards1, cardType0, cardType1);
        this.zipResult = (0, roomUtil_1.buildRecordResult)(cards0, cards1, this.result);
        let playerSumProfit = this.settlement(this.players);
        this.endTime = Date.now();
        const zhuangPlayer = this.getPlayer(this.zhuangInfo.uid);
        {
            let profit = -playerSumProfit;
            this.zhuangInfo.profit = profit;
            if (zhuangPlayer) {
                zhuangPlayer.profit = profit;
                zhuangPlayer.validBet = Math.abs(profit);
                zhuangPlayer.bet = Math.abs(profit);
            }
        }
        this.recordHistorys(this.result);
        this.addByBaijia(playerSumProfit);
        for (const pl of this.players) {
            await pl.updateGold(this);
        }
        this.channelIsPlayer(`hlbj_over`, { roomId: this.roomId });
        BaijiaRoomManagerImpl_1.default.pushRoomStateMessage(this.roomId, {
            nid: this.nid,
            roomId: this.roomId,
            sceneId: this.sceneId,
            countDown: this.countdown,
            status: `INBIPAI`,
            roundId: this.roundId,
            historyData: this.toResultBack()
        });
        this.status = 'INBIPAI';
    }
    preSettlement(result, controlState = commonConst_1.CommonControlState.RANDOM) {
        let cards0 = result.cards0.slice();
        let cardType0 = baijia_logic.getCardTypeTo9(cards0);
        let cards1 = result.cards1.slice();
        let cardType1 = baijia_logic.getCardTypeTo9(cards1);
        let bupai = [], bupai2 = [];
        if (baijia_logic.canBupaiByPlay(cardType0, cardType1)) {
            bupai = this.seqDeal();
            cards0.push(...bupai);
        }
        if (baijia_logic.canBupaiByBank(cardType0, cardType1, bupai[0])) {
            bupai2 = this.seqDeal();
            cards1.push(...bupai2);
        }
        this.pais = [...bupai, ...bupai2].concat(this.pais);
        cardType0 = baijia_logic.getCardTypeTo9(cards0);
        cardType1 = baijia_logic.getCardTypeTo9(cards1);
        this.result = baijia_logic.getResultTo9(cards0, cards1, cardType0, cardType1);
        let copyPlayers;
        if (controlState === commonConst_1.CommonControlState.RANDOM) {
            copyPlayers = this.copyPlayers();
        }
        else {
            copyPlayers = this.copyControlPlayers(controlState);
        }
        return this.yuSettlement(copyPlayers);
    }
    copyPlayers() {
        const filterProfitType = this.getBankerRobotType();
        return this.players.filter(m => m.isRobot !== filterProfitType).map(m => {
            const obj = {};
            for (let key in m) {
                obj[key] = m[key];
            }
            return obj;
        });
    }
    copyControlPlayers(state) {
        return this.players.filter(p => p.controlState === state).map(p => {
            const obj = {};
            for (let key in p) {
                obj[key] = p[key];
            }
            return obj;
        });
    }
    deal(count = 1) {
        this.pais.sort((x, y) => Math.random() - 0.5);
        const ret = [];
        for (let i = 0; i < count; i++) {
            ret.push(this.pais.splice(utils.random(0, this.pais.length - 1), 1)[0]);
        }
        return ret;
    }
    seqDeal() {
        const result = [];
        result.push(this.pais.shift());
        return result;
    }
    settlement(list) {
        let sum = 0;
        for (const pl of list) {
            pl.settlement(this.result);
            sum += pl.profit;
        }
        return sum;
    }
    yuSettlement(list) {
        let sum = 0;
        for (const pl of list) {
            for (let key in this.result) {
                if (this.killAreas.has(key))
                    continue;
                const v = pl.bets[key];
                if (this.result[key]) {
                    sum += Math.floor(v.bet * v.mul);
                }
                else {
                    sum -= v.bet;
                }
            }
            if (this.result.draw) {
                sum += pl.bets.play.bet;
                sum += pl.bets.bank.bet;
            }
        }
        return sum;
    }
    recordHistorys(result) {
        while (this.baijiaHistory.length >= 100) {
            this.baijiaHistory.shift();
        }
        while (this.baijiaHistory.length >= 1 && this.baijiaHistory[0].win_area === 'draw') {
            this.baijiaHistory.shift();
        }
        let value = '';
        if (result.play) {
            value = 'play';
        }
        else if (result.bank) {
            value = 'bank';
        }
        else if (result.draw) {
            value = 'draw';
        }
        if (value !== '') {
            if (result.pair0) {
                value += '-0';
            }
            if (result.pair1) {
                value += '-1';
            }
            this.baijiaHistory.push({ win_area: value });
        }
    }
    ramodHistory() {
        let numberOfTimes = utils.random(10, 30);
        this.bout = numberOfTimes;
        do {
            let randomIndex = utils.random(1, 100);
            let result = {};
            if (randomIndex <= 45) {
                result.play = true;
            }
            else if (randomIndex <= 90) {
                result.bank = true;
            }
            else {
                result.draw = true;
            }
            this.deal(4);
            this.recordHistorys(result);
            numberOfTimes--;
        } while (numberOfTimes > 0);
    }
    onBeting(currPlayer, msg) {
        this.baijiaBet(currPlayer, [msg]);
        this.bj_onBeting(currPlayer, [msg]);
    }
    baijiaBet(player, RecordBets) {
        for (const RecordBet of RecordBets) {
            player.maxBet += RecordBet.bet;
            player.bet += RecordBet.bet;
            player.bets[RecordBet.area].bet += RecordBet.bet;
            this.allBets += RecordBet.bet;
            this.betList.push({ uid: player.uid, area: RecordBet.area, bet: RecordBet.bet });
            this.area_bet[RecordBet.area].sumBet += RecordBet.bet;
        }
    }
    bj_onBeting(playerInfo, betNums) {
        let RecordBets = [];
        for (const betNum of betNums) {
            RecordBets.push({ uid: playerInfo.uid, area: betNum.area, bet: betNum.bet });
        }
        let opts = {
            roomId: this.roomId,
            uid: playerInfo.uid,
            gold: playerInfo.gold - playerInfo.bet,
            RecordBets: RecordBets,
            curBetNums: playerInfo.bets,
            area_bet: this.area_bet,
            list: this.rankingLists().slice(0, 6)
        };
        this.channelIsPlayer('bj_onBeting', opts);
    }
    onGoonBet(player) {
        this.baijiaBet(player, player.lastBets);
        this.bj_onBeting(player, player.lastBets);
    }
    toBetBack() {
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        return {
            paiCount: this.pais.length,
            zhuangInfo: zhuang && zhuang.strip(this.zhuangInfo.hasRound),
            applyZhuangs: this.zj_List.map(pl => pl.strip1())
        };
    }
    toResultBack() {
        const zj_pl = this.getPlayer(this.zhuangInfo.uid);
        let res = zj_pl ? { uid: zj_pl.uid, gold: zj_pl.gold, profit: this.zhuangInfo.profit } : { uid: null, profit: this.zhuangInfo.profit };
        return {
            paiCount: this.pais.length,
            regions: this.regions,
            result: this.result,
            baijiaHistory: this.baijiaHistory,
            players: this.players.filter(pl => pl.bet > 0).map(pl => pl.result()),
            isShuffle: this.shuffle,
            allPoker: this.allPoker,
            zhuangInfo: res
        };
    }
    strip() {
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        return {
            roomId: this.roomId,
            lowBet: this.lowBet,
            status: this.status === 'INSETTLE' ? 'INBIPAI' : this.status,
            countdownTime: this.getCountdownTime(),
            paiCount: this.pais.length,
            area_bet: this.area_bet,
            baijiaHistory: this.baijiaHistory,
            allPoker: this.allPoker,
            zhuangInfo: zhuang && zhuang.strip(this.zhuangInfo.hasRound),
            applyZhuangs: this.zj_List.map(pl => pl.strip1()),
        };
    }
    async addByBaijia(money) {
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
    getOffLineData(player) {
        let data = { isOnLine: false, toResultBack: null };
        data.toResultBack = this.toResultBack();
        return data;
    }
    addNote(playerInfo, profit) {
        if (playerInfo.profit >= 100000) {
            MessageService.sendBigWinNotice(this.nid, playerInfo.nickname, playerInfo.profit, playerInfo.isRobot, playerInfo.headurl);
        }
    }
    noticeZhuangInfo() {
        try {
            const zhuang = this.getPlayer(this.zhuangInfo.uid);
            const opts = {
                zhuangInfo: zhuang && zhuang.strip(this.zhuangInfo.hasRound),
                applyZhuangs: this.zj_List.map(pl => {
                    return {
                        uid: pl.uid,
                        headurl: pl.headurl,
                        nickname: pl.nickname,
                        gold: pl.gold,
                        isRobot: pl.isRobot
                    };
                }),
                applyZhuangsNum: this.zj_List.length
            };
            this.channelIsPlayer('bj_onUpdateZhuangInfo', opts);
        }
        catch (error) {
            console.warn(JSON.stringify(this.zj_List));
        }
    }
    applyUpzhuang(playerInfo) {
        this.zj_List.push(playerInfo);
        this.noticeZhuangInfo();
    }
    exitUpzhuanglist(uid) {
        utils.remove(this.zj_List, 'uid', uid);
        this.noticeZhuangInfo();
    }
    checkZhangEnoughMoney(RecordBets) {
        const zhuang = this.getPlayer(this.zhuangInfo.uid);
        let isEnough = true;
        if (zhuang) {
            isEnough = false;
            let area_bet = utils.clone(this.area_bet);
            for (const RecordBet of RecordBets) {
                area_bet[RecordBet.area].sumBet += RecordBet.bet;
            }
            let A = area_bet.pair0.sumBet * area_bet.pair0.mul + area_bet.pair1.sumBet * area_bet.pair1.mul;
            let B = Math.max(area_bet.big.sumBet, area_bet.small.sumBet) * area_bet.small.mul -
                Math.min(area_bet.big.sumBet, area_bet.small.sumBet);
            let C = Math.max(area_bet.draw.sumBet * area_bet.draw.mul, area_bet.bank.sumBet - area_bet.play.sumBet, area_bet.play.sumBet - area_bet.bank.sumBet);
            if (zhuang.gold > (A + B + C)) {
                isEnough = true;
            }
        }
        return isEnough;
    }
    async br_kickNoOnline() {
        const players = this.zhuangInfo ? this.players.filter(p => p.uid !== this.zhuangInfo.uid) : this.players;
        const offlinePlayers = await this.kickOfflinePlayerAndWarnTimeoutPlayer(players, 5, 3);
        offlinePlayers.forEach(p => {
            this.leave(p, false);
            if (!p.onLine) {
                BaijiaRoomManagerImpl_1.default.removePlayer(p);
            }
            else {
                BaijiaRoomManagerImpl_1.default.playerAddToChannel(p);
            }
            BaijiaRoomManagerImpl_1.default.removePlayerSeat(p.uid);
        });
    }
    calculateValidBet(player) {
        const zhuangPlayer = this.getPlayer(this.zhuangInfo.uid);
        if (zhuangPlayer && zhuangPlayer.uid == player.uid) {
            return;
        }
        const keys = Object.keys(player.bets), calculateArr = [], betAreas = player.bets;
        let count = 0;
        for (let i = 0, len = keys.length; i < len; i++) {
            const area = keys[i];
            if (!baijiaConst.validAreas.includes(area)) {
                count += betAreas[area].bet;
                continue;
            }
            const mappingArea = baijiaConst.mapping[area];
            if (calculateArr.includes(mappingArea))
                continue;
            const areaBet = betAreas[area].bet, mappingAreaBet = betAreas[mappingArea].bet;
            count += (Math.max(areaBet, mappingAreaBet) - Math.min(areaBet, mappingAreaBet));
            calculateArr.push(area);
        }
        player.validBetCount(count);
    }
    getBankerRobotType() {
        const player = this.getPlayer(this.zhuangInfo.uid);
        return !!player ? player.isRobot : 2;
    }
    getPlayerAllBet(filterType = 4) {
        if (filterType === 4) {
            return this.allBets;
        }
        return this.players.reduce((total, p) => {
            if (p.isRobot !== filterType) {
                total += p.filterBetNum(this.killAreas);
            }
            return total;
        }, 0);
    }
    getControlPlayerTotalBet(state) {
        return this.players.reduce((total, p) => {
            if (p.controlState === state) {
                total += p.bet;
            }
            return total;
        }, 0);
    }
    getRandomLotteryResult() {
        let card1 = this.deal(2);
        let card2 = this.deal(2);
        return { cards0: card1, cards1: card2 };
    }
    getNotContainKillAreaResult() {
        let result;
        for (let i = 0; i < 100; i++) {
            result = this.getRandomLotteryResult();
            this.preSettlement(result);
            if (Object.keys(this.result).find(key => this.result[key] && this.killAreas.has(key))) {
                this.pais.push(...result.cards0);
                this.pais.push(...result.cards1);
                continue;
            }
            break;
        }
        return result;
    }
    getWinORLossResultFunc(isSystemWin) {
        let result, bankerType = this.getBankerRobotType(), playerBet = this.getPlayerAllBet(bankerType);
        for (let i = 0; i < 100; i++) {
            result = this.getRandomLotteryResult();
            const gain = this.preSettlement(result);
            if (Object.keys(this.result).find(key => this.result[key] && this.killAreas.has(key))) {
                this.pais.push(...result.cards0);
                this.pais.push(...result.cards1);
                continue;
            }
            if (bankerType === 0) {
                if (isSystemWin && gain >= 0) {
                    break;
                }
                if (!isSystemWin && gain <= 0) {
                    break;
                }
            }
            else {
                if (isSystemWin && gain <= 0) {
                    break;
                }
                if (!isSystemWin && gain >= 0) {
                    break;
                }
            }
            this.pais.push(...result.cards0);
            this.pais.push(...result.cards1);
        }
        return result;
    }
    async sceneControlResult(sceneControlState, isPlatformControl) {
        if (this.players.every(player => player.isRobot === RoleEnum_1.RoleEnum.ROBOT) || sceneControlState === constants_1.ControlState.NONE) {
            return this.getNotContainKillAreaResult();
        }
        const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        this.players.forEach(p => p.bet > 0 && p.setControlType(type));
        return this.getWinORLossResultFunc(sceneControlState === constants_1.ControlState.SYSTEM_WIN);
    }
    bankerIsRealMan() {
        const banker = this.getPlayer(this.zhuangInfo.uid);
        return !!banker && banker.isRobot === 0;
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
    personalDealCards(params) {
        let result;
        for (let i = 0; i < 100; i++) {
            result = this.getRandomLotteryResult();
            const gain = this.preSettlement(result, params.state);
            if (params.state === commonConst_1.CommonControlState.LOSS && gain < 0) {
                break;
            }
            if (params.state === commonConst_1.CommonControlState.WIN && gain > 0) {
                break;
            }
            this.pais.push(...result.cards0);
            this.pais.push(...result.cards1);
        }
        return result;
    }
    controlDealCardsBanker(params) {
        return this.getWinORLossResultFunc(!params.bankerWin);
    }
}
exports.default = BaiJiaRoomImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFpSmlhUm9vbUltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9iYWlqaWEvbGliL0JhaUppYVJvb21JbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseURBQXNEO0FBQ3RELHVFQUFvRTtBQUNwRSx1RUFBb0U7QUFDcEUsa0ZBQXNGO0FBQ3RGLCtDQUF3QztBQUN4QyxpQ0FBOEI7QUFFOUIsc0VBQW9GO0FBQ3BGLDhDQUFvRDtBQUNwRCxtRkFBaUY7QUFDakYsK0NBQWdEO0FBQ2hELHdDQUF5QztBQUN6Qyw2Q0FBOEM7QUFDOUMsbUVBQW9FO0FBRXBFLDREQUE2RDtBQUM3RCx3RUFBOEU7QUFDOUUsa0dBQTBGO0FBSTFGLElBQUksYUFBYSxHQUFHLEVBQUUsQ0FBQztBQUV2QixJQUFJLGVBQWUsR0FBRyxFQUFFLENBQUM7QUFFekIsSUFBSSxrQkFBa0IsR0FBRyxDQUFDLENBQUM7QUFLM0IsTUFBcUIsY0FBZSxTQUFRLHVCQUE0QjtJQWdGcEUsWUFBWSxJQUFTO1FBQ2pCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQTFFaEIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUVyQixXQUFNLEdBQWdELE1BQU0sQ0FBQztRQU03RCxzQkFBaUIsR0FBVyxDQUFDLENBQUM7UUFjOUIsa0JBQWEsR0FBMkIsRUFBRSxDQUFDO1FBUzNDLHdCQUFtQixHQUFXLENBQUMsQ0FBQztRQUVoQyxZQUFPLEdBQVcsQ0FBQyxDQUFDO1FBRXBCLFlBQU8sR0FBaUQsRUFBRSxDQUFDO1FBRzNELGNBQVMsR0FBVyxFQUFFLENBQUM7UUFFdkIsU0FBSSxHQUFXLENBQUMsQ0FBQztRQUdqQixZQUFPLEdBQXVCLEVBQUUsQ0FBQztRQWNqQyxnQkFBVyxHQUFpQixJQUFJLENBQUM7UUFFakMsWUFBTyxHQUF1QixFQUFFLENBQUM7UUFTakMsY0FBUyxHQUFXLEVBQUUsQ0FBQztRQU9uQixJQUFJLENBQUMsZUFB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