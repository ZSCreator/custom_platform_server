"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const qznnPlayer_1 = require("./qznnPlayer");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const qznnMgr_1 = require("../lib/qznnMgr");
const ControlImpl_1 = require("./ControlImpl");
const pinus_logger_1 = require("pinus-logger");
const recordUtil_1 = require("./util/recordUtil");
const constants_1 = require("../../../services/newControl/constants");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const utils = require("../../../utils/index");
const qznn_logic = require("./qznn_logic");
const qznnConst = require("./qznnConst");
const MessageService = require("../../../services/MessageService");
var STATUS;
(function (STATUS) {
    STATUS[STATUS["NONE"] = 0] = "NONE";
    STATUS[STATUS["ROBZHUANG"] = 16000] = "ROBZHUANG";
    STATUS[STATUS["READYBET"] = 10000] = "READYBET";
    STATUS[STATUS["LOOK"] = 16000] = "LOOK";
    STATUS[STATUS["SETTLEMENT"] = 5000] = "SETTLEMENT";
    STATUS[STATUS["AWITTIMER"] = 5000] = "AWITTIMER";
})(STATUS || (STATUS = {}));
;
class qznnRoom extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.status = 'INWAIT';
        this.robzhuangs = [];
        this.pais = [];
        this._cur_players = [];
        this.robzhuangTimeout = null;
        this.readybetTimeout = null;
        this.lookTimeout = null;
        this.waitTimer = null;
        this.currWaitTime = Date.now();
        this.theCards = [];
        this.roomUserLimit = 6;
        this.zipResult = '';
        this.Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
        this.players = new Array(this.roomUserLimit).fill(null);
        this.zhuangInfo = null;
        this.lowBet = opts.lowBet;
        this.entryCond = opts.entryCond;
        this.tempReadybetTime = STATUS.READYBET;
        this.isLook = false;
        this.isSettlement = false;
        this.max_uid = '';
        this.controlLogic = new ControlImpl_1.default({ room: this });
        this.Initialization();
    }
    close() {
        this.sendRoomCloseMessage();
    }
    Initialization() {
        this.battle_kickNoOnline();
        this.max_uid = '';
        this.isLook = false;
        this.isSettlement = false;
        this.zhuangInfo = null;
        this.updateRoundId();
        this.status = 'INWAIT';
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
        const seat = this.players.findIndex(pl => pl == null);
        this.players[seat] = new qznnPlayer_1.default(seat, dbplayer);
        this.addMessage(dbplayer);
        return true;
    }
    leave(playerInfo, isOffLine) {
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        this.kickOutMessage(playerInfo.uid);
        this.players[playerInfo.seat] = null;
        this.channelIsPlayer('qz_onExit', { uid: playerInfo.uid, playerNum: this.players.filter(m => m != null).length });
        qznnMgr_1.default.removePlayerSeat(playerInfo.uid);
    }
    toStatus() {
        let time = STATUS[this.status] || 0;
        if (this.status == 'READYBET') {
            time = this.tempReadybetTime;
        }
        return {
            status: this.status,
            countdown: Math.max(time - (Date.now() - this.statusTime), 1)
        };
    }
    async wait(playerInfo) {
        if (this.status == 'NONE' || this.status == 'INWAIT') {
            if (this.players.filter(pl => pl).length <= 1) {
                this.channelIsPlayer(`qz_onWait`, { waitTime: 0, roomId: this.roomId });
                return;
            }
            if (Date.now() - this.currWaitTime < STATUS.AWITTIMER) {
                const member = playerInfo && this.channel.getMember(playerInfo.uid);
                if (member) {
                    MessageService.pushMessageByUids(`qz_onWait`, { waitTime: Math.round(Date.now() - this.currWaitTime) }, member);
                }
                return;
            }
            this.currWaitTime = Date.now();
            this.channelIsPlayer('qz_onWait', { waitTime: STATUS.AWITTIMER, roomId: this.roomId });
            clearTimeout(this.waitTimer);
            this.waitTimer = setTimeout(async () => {
                const list = this.players.filter(pl => pl);
                if (list.length >= 2) {
                    this.handler_start();
                }
                else {
                    this.channelIsPlayer('qz_onWait', { waitTime: 0, roomId: this.roomId });
                }
            }, STATUS.AWITTIMER);
        }
    }
    handler_start() {
        this.status = 'ROBZHUANG';
        this.startTime = Date.now();
        this.players.forEach(pl => pl && (pl.status = `GAME`));
        this._cur_players = this.players.filter(pl => pl);
        let lookPlayer = this.players.filter(pl => pl && pl.status != 'GAME').map(pl => {
            return { uid: pl.uid, seat: pl.seat, cards: pl.cards };
        });
        let gamePlayer = this._cur_players.map(pl => {
            return { uid: pl.uid, seat: pl.seat };
        });
        const opts = { lookPlayer, gamePlayer };
        this.channelIsPlayer('qz_onStart', opts);
        this.handler_robzhuang();
    }
    getWaitTime() {
        if (this.status == 'NONE' || this.status == 'INWAIT') {
            return Math.max(STATUS.AWITTIMER - (Date.now() - this.currWaitTime), 0);
        }
        return 0;
    }
    async handler_robzhuang() {
        this.status = 'ROBZHUANG';
        this.statusTime = Date.now();
        this.robzhuangs = [];
        await this.controlLogic.runControl();
        this.max_uid = this.findMaxUid();
        const cards = this._cur_players.map(p => p.cards);
        this.sortResult(cards);
        let realPlayer = false;
        for (const card of cards) {
            let pl = this._cur_players.find(c => c && c.cards.toString() == card.toString());
            if (pl.isRobot == 0) {
                realPlayer = true;
            }
            else if (pl.isRobot == 2 && realPlayer == false) {
                pl.Rank = true;
            }
        }
        this.players.forEach(pl => {
            const member = pl && this.channel.getMember(pl.uid);
            if (!member)
                return;
            const opts = {
                stateInfo: this.toStatus(),
                roundId: this.roundId,
                players: this._cur_players.map(pl => pl.toMingPaiInfo(pl.uid)),
            };
            if (pl && pl.isRobot == RoleEnum_1.RoleEnum.ROBOT) {
                opts.max_uid = this.max_uid;
                opts.isControl = this.controlLogic.isControl;
                opts.Rank = pl.Rank;
            }
            MessageService.pushMessageByUids('qz_onRobzhuang', opts, member);
        });
        this.robzhuangTimeout = setTimeout(() => {
            this.Logger.debug('抢庄牛牛开始下注', this.roomId);
            this.readybet();
        }, STATUS.ROBZHUANG);
    }
    findMaxUid() {
        const cards = this._cur_players.map(p => p.cards);
        this.sortResult(cards);
        const player = this._cur_players.find(p => p.cards == cards[0]);
        return !!player ? player.uid : '';
    }
    robzhuangOpt(currPlayer, mul) {
        currPlayer.robmul = mul == 0 ? 1 : mul;
        this.robzhuangs.push({ uid: currPlayer.uid, mul: mul, gold: currPlayer.gold });
        this.channelIsPlayer('qz_onOpts', {
            type: 'robzhuang',
            uid: currPlayer.uid,
            seat: currPlayer.seat,
            robmul: mul,
            list: this._cur_players.map(pl => pl.toRobzhuangData())
        });
        if (this.robzhuangs.length === this._cur_players.length) {
            this.readybet();
        }
    }
    readybet() {
        this.status = 'READYBET';
        this.statusTime = Date.now();
        clearTimeout(this.robzhuangTimeout);
        for (const pl of this._cur_players) {
            if (pl.robmul == 1 && !this.robzhuangs.find(c => c.uid == pl.uid)) {
                this.robzhuangs.push({ uid: pl.uid, mul: 0, gold: pl.gold });
            }
        }
        this.robzhuangs = this.robzhuangs.sort((a, b) => b.mul - a.mul);
        let zhuang_player = this._cur_players[0];
        if (this.robzhuangs.length > 0) {
            let ran = utils.random(1, 100);
            let max_mul = this.robzhuangs[0].mul;
            let robzhuangs = this.robzhuangs.filter(c => c.mul == max_mul);
            robzhuangs.sort((a, b) => b.gold - a.gold);
            if (ran <= 75) {
                zhuang_player = this._cur_players.find(pl => pl && pl.uid == robzhuangs[0].uid);
            }
            else {
                robzhuangs.sort(() => 0.5 - Math.random());
                zhuang_player = this._cur_players.find(pl => pl && pl.uid == robzhuangs[0].uid);
            }
        }
        else {
            this._cur_players.sort((pl1, pl2) => { return pl2.gold - pl1.gold; });
            zhuang_player = this._cur_players[0];
        }
        this.zhuangInfo = { uid: zhuang_player.uid, mul: zhuang_player.robmul, seat: zhuang_player.seat };
        this.tempReadybetTime = STATUS.READYBET + (this.robzhuangs.length === 1 ? 500 : 2500);
        let opts = {
            stateInfo: this.toStatus(),
            robzhuangs: this.robzhuangs.map(m => m),
            zhuangInfo: this.zhuangInfo,
            players: this._cur_players.map(pl => pl.toRobzhuangData())
        };
        this.channelIsPlayer('qz_onReadybet', opts);
        this.readybetTimeout = setTimeout(async () => {
            this.defaultBet();
            await this.handler_look();
        }, this.tempReadybetTime);
    }
    defaultBet() {
        let players = this.players.filter(pl => pl && pl.status == 'GAME' && pl.isBet == 0 && pl.uid !== this.zhuangInfo.uid);
        players.forEach(async (pl) => {
            await this.betOpt(pl, qznnConst.xj_bet_arr[0]);
        });
    }
    async betOpt(playerInfo, betNum) {
        playerInfo.betNum = betNum;
        playerInfo.isBet = betNum;
        this.channelIsPlayer('qz_onOpts', {
            type: 'bet',
            uid: playerInfo.uid,
            seat: playerInfo.seat,
            betNum: betNum,
            lowBet: this.lowBet
        });
        if (this._cur_players.every(m => m.betNum !== 0 || m.uid === this.zhuangInfo.uid)) {
            await this.handler_look();
        }
    }
    async handler_look() {
        if (this.isLook)
            return;
        clearTimeout(this.readybetTimeout);
        this.controlLogic.limitControl();
        this.isLook = true;
        this.Logger.debug('抢庄牛牛开始看牌', this.roomId);
        this.status = 'LOOK';
        this.statusTime = Date.now();
        this._cur_players.forEach(pl => (pl.uid !== this.zhuangInfo.uid && pl.betNum == 0) && (pl.betNum = this.lowBet));
        const opts = {
            stateInfo: this.toStatus(),
            zhuangInfo: this.zhuangInfo,
            players: this._cur_players.map(pl => pl.toHoldsInfo())
        };
        this.channelIsPlayer('qz_onLook', opts);
        let idx = this.zhuangInfo.seat;
        this.lookTimeout = setInterval(() => {
            let pl = this.players[this.previousIdx(idx - 1)];
            pl && this.liangpaiOpt(pl);
            idx--;
        }, 2000);
    }
    previousIdx(idx) {
        let len = this.players.length;
        let next = idx;
        let Cycles = 0;
        do {
            (next < 0) && (next = len - 1);
            let pl = this.players[next];
            if (pl && pl.status == 'GAME' && !pl.isLiangpai) {
                break;
            }
            next--;
            Cycles++;
            if (Cycles > len) {
                break;
            }
        } while (true);
        return next;
    }
    liangpaiOpt(playerInfo) {
        playerInfo.isLiangpai = true;
        this.channelIsPlayer('qz_onOpts', {
            type: 'liangpai',
            nickname: playerInfo.nickname,
            uid: playerInfo.uid,
            seat: playerInfo.seat,
            cards: playerInfo.cards,
            cardType: playerInfo.cardType
        });
        if (this._cur_players.every(m => m.isLiangpai)) {
            this.settlement();
        }
    }
    async settlement() {
        if (this.isSettlement)
            return;
        this.isSettlement = true;
        this.endTime = Date.now();
        this.status = 'SETTLEMENT';
        this.statusTime = Date.now();
        clearInterval(this.lookTimeout);
        this.zipResult = (0, recordUtil_1.buildRecordResult)(this.players, this);
        try {
            {
                const ply_zj = this._cur_players.find(pl => pl.uid === this.zhuangInfo.uid);
                const curPlayers = this._cur_players.filter(pl => pl && pl.uid != ply_zj.uid);
                let totalWin = 0;
                for (const pl of curPlayers) {
                    const is_zj_win = qznn_logic.bipai(ply_zj.cards, pl.cards);
                    if (is_zj_win) {
                        let mloseGold = pl.betNum * this.zhuangInfo.mul * this.lowBet * qznn_logic.getDoubleByConfig(ply_zj.cardType.count);
                        pl.profit = -mloseGold;
                        totalWin += mloseGold;
                    }
                }
                let initialWin = totalWin;
                if (totalWin > ply_zj.gold) {
                    totalWin = ply_zj.gold;
                }
                let temp_totalWin = totalWin;
                for (const pl of curPlayers) {
                    const is_zj_win = qznn_logic.bipai(ply_zj.cards, pl.cards);
                    if (is_zj_win) {
                        pl.profit = -Math.abs((pl.profit / initialWin) * temp_totalWin);
                        let diffNum = Math.abs(pl.profit) - pl.gold;
                        if (diffNum > 0) {
                            pl.profit = -pl.gold;
                            totalWin -= diffNum;
                        }
                    }
                }
                ply_zj.profit += totalWin;
                let totalLoss = 0;
                for (const pl of curPlayers) {
                    const is_zj_win = qznn_logic.bipai(ply_zj.cards, pl.cards);
                    if (!is_zj_win) {
                        pl.profit = pl.betNum * this.zhuangInfo.mul * this.lowBet * qznn_logic.getDoubleByConfig(pl.cardType.count);
                        let diffNum = Math.abs(pl.profit) - pl.gold;
                        if (diffNum > 0) {
                            pl.profit = pl.gold;
                        }
                        totalLoss -= pl.profit;
                    }
                }
                let initialLoss = totalLoss;
                if (Math.abs(totalLoss) > (ply_zj.gold + totalWin)) {
                    totalLoss = -(ply_zj.gold + totalWin);
                }
                for (const pl of curPlayers) {
                    const is_zj_win = qznn_logic.bipai(ply_zj.cards, pl.cards);
                    if (!is_zj_win) {
                        pl.profit = Math.abs((pl.profit / initialLoss) * totalLoss);
                    }
                }
                ply_zj.profit = totalWin + totalLoss;
            }
            for (const pl of this._cur_players) {
                await pl.updateGold(this);
            }
            const opts = {
                stateInfo: this.toStatus(),
                zhuangInfo: this.zhuangInfo,
                players: this._cur_players.map(m => m.toResult(this.lowBet)),
            };
            this.channelIsPlayer('qz_onSettlement', opts);
            this.Initialization();
        }
        catch (error) {
            console.warn(`...`);
        }
    }
    wrapGameData() {
        return {
            nid: this.nid,
            sceneId: this.sceneId,
            roomId: this.roomId,
            roundId: this.roundId,
            lowBet: this.lowBet,
            stateInfo: this.toStatus(),
            zhuangInfo: this.zhuangInfo,
            robzhuangs: this.robzhuangs,
            players: this.players.map(pl => pl && pl.strip(this)),
            status: this.status
        };
    }
    getAutoStartTime() {
        return this.autoStartTime === 0 ? 0 : (this.autoStartTime - (Date.now() - this.createTime));
    }
    battle_kickNoOnline() {
        const offLinePlayers = [];
        for (const pl of this.players) {
            if (!pl)
                continue;
            if (!pl.onLine)
                qznnMgr_1.default.removePlayer(pl);
            offLinePlayers.push(pl);
            this.kickOutMessage(pl.uid);
            qznnMgr_1.default.removePlayerSeat(pl.uid);
            this.players[pl.seat] = null;
        }
        this.kickingPlayer(pinus_1.pinus.app.getServerId(), offLinePlayers);
    }
    sortResult(cards) {
        cards.sort((a, b) => {
            return qznn_logic.bipai(b, a) ? 1 : -1;
        });
    }
    bankerIsRealMan() {
        const player = this.getPlayer(this.zhuangInfo.uid);
        return player.isRobot === 0;
    }
    isSameGamePlayers() {
        return this._cur_players.every(p => p.isRobot === this._cur_players[0].isRobot);
    }
    getCards() {
        this.pais = qznn_logic.shuffle();
        let cards = [];
        for (let i = 0; i < 7; i++) {
            let finallyCard = this.pais.splice(0, 5);
            cards.push(finallyCard);
        }
        return cards;
    }
    async runSceneControl(sceneControlState, isPlatformControl) {
        const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        this._cur_players.forEach(p => p.setControlType(type));
        let cards = this.getCards();
        this.sortResult(cards);
        let gamePlayers = this._cur_players;
        let possibleWinPlayers;
        let lossPlayers;
        if (sceneControlState === constants_1.ControlState.PLAYER_WIN) {
            possibleWinPlayers = gamePlayers.filter(p => p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER);
            lossPlayers = gamePlayers.filter(p => p.isRobot === RoleEnum_1.RoleEnum.ROBOT);
        }
        else {
            possibleWinPlayers = gamePlayers.filter(p => p.isRobot === RoleEnum_1.RoleEnum.ROBOT);
            lossPlayers = gamePlayers.filter(p => p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER);
        }
        if (sceneControlState === constants_1.ControlState.SYSTEM_WIN && lossPlayers.length === 1) {
            for (let i = 0; i < 100; i++) {
                const result = qznn_logic.getKillPlayerCards(cards, gamePlayers.length);
                if (result) {
                    const player = this.getPlayer(lossPlayers[0].uid);
                    this.setPlayerCards(player, result);
                    gamePlayers = gamePlayers.filter(gamePlayer => gamePlayer.uid !== player.uid);
                    cards = cards.slice(0, possibleWinPlayers.length);
                    possibleWinPlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                        this.setPlayerCards(p, cards.shift());
                    });
                    break;
                }
                cards = this.getCards();
                this.sortResult(cards);
            }
        }
        else {
            cards = cards.slice(0, this._cur_players.length);
            possibleWinPlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                this.setPlayerCards(p, cards.shift());
            });
            lossPlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                cards.sort((a, b) => Math.random() - 0.5);
                this.setPlayerCards(p, cards.pop());
            });
        }
    }
    randomDeal() {
        let cards = this.getCards();
        this._cur_players.sort((a, b) => Math.random() - 0.5)
            .forEach(p => {
            this.setPlayerCards(p, cards.shift());
        });
    }
    setPlayerCards(player, cards) {
        const cardType = qznn_logic.getCardType(cards);
        player.setCards_2(cards, cardType);
    }
    controlPersonalDeal(positivePlayers, negativePlayers) {
        let allResult = this.getCards();
        positivePlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        negativePlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        this.sortResult(allResult);
        let gamePlayers = this._cur_players;
        if (positivePlayers.length) {
            positivePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                const player = this.getPlayer(p.uid);
                this.setPlayerCards(player, allResult.shift());
                gamePlayers = gamePlayers.filter(gamePlayer => gamePlayer.uid !== p.uid);
            });
        }
        else {
            const len = gamePlayers.length;
            if (negativePlayers.length > 1) {
                negativePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                    const player = this.getPlayer(p.uid);
                    this.setPlayerCards(player, allResult.pop());
                    gamePlayers = gamePlayers.filter(gamePlayer => gamePlayer.uid !== p.uid);
                });
            }
            else {
                for (let i = 0; i < 100; i++) {
                    const result = qznn_logic.getKillPlayerCards(allResult, gamePlayers.length);
                    if (result) {
                        const player = this.getPlayer(negativePlayers[0].uid);
                        this.setPlayerCards(player, result);
                        gamePlayers = gamePlayers.filter(gamePlayer => gamePlayer.uid !== player.uid);
                        break;
                    }
                    allResult = this.getCards();
                    this.sortResult(allResult);
                }
            }
        }
        gamePlayers.sort((a, b) => Math.random() - 0.5).forEach(player => this.setPlayerCards(player, allResult.shift()));
    }
}
exports.default = qznnRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXpublJvb20uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9xem5uL2xpYi9xem5uUm9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUE4QjtBQUM5Qiw2Q0FBc0M7QUFDdEMsdUVBQW9FO0FBQ3BFLDRDQUE2RDtBQUU3RCwrQ0FBd0M7QUFDeEMsK0NBQXlDO0FBQ3pDLGtEQUFzRDtBQUN0RCxzRUFBb0Y7QUFDcEYsdUVBQW9FO0FBRXBFLDhDQUErQztBQUMvQywyQ0FBNEM7QUFDNUMseUNBQTBDO0FBQzFDLG1FQUFvRTtBQUdwRSxJQUFLLE1BWUo7QUFaRCxXQUFLLE1BQU07SUFDUCxtQ0FBUSxDQUFBO0lBRVIsaURBQWlCLENBQUE7SUFFakIsK0NBQWdCLENBQUE7SUFFaEIsdUNBQVksQ0FBQTtJQUVaLGtEQUFpQixDQUFBO0lBRWpCLGdEQUFnQixDQUFBO0FBQ3BCLENBQUMsRUFaSSxNQUFNLEtBQU4sTUFBTSxRQVlWO0FBQUEsQ0FBQztBQVFGLE1BQXFCLFFBQVMsU0FBUSx1QkFBc0I7SUEwQ3hELFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUF6Q2hCLFdBQU0sR0FBeUUsUUFBUSxDQUFDO1FBSXhGLGVBQVUsR0FBaUQsRUFBRSxDQUFDO1FBYTlELFNBQUksR0FBYSxFQUFFLENBQUM7UUFLcEIsaUJBQVksR0FBaUIsRUFBRSxDQUFDO1FBRWhDLHFCQUFnQixHQUFpQixJQUFJLENBQUM7UUFDdEMsb0JBQWUsR0FBaUIsSUFBSSxDQUFDO1FBQ3JDLGdCQUFXLEdBQWlCLElBQUksQ0FBQztRQUNqQyxjQUFTLEdBQWlCLElBQUksQ0FBQztRQUMvQixpQkFBWSxHQUFXLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUtsQyxhQUFRLEdBQWEsRUFBRSxDQUFDO1FBQ3hCLGtCQUFhLEdBQUcsQ0FBQyxDQUFDO1FBSWxCLGNBQVMsR0FBVyxFQUFFLENB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