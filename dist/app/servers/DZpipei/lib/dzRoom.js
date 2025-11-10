"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomStatus = void 0;
const pinus_logger_1 = require("pinus-logger");
const dzPlayer_1 = require("./dzPlayer");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const constants_1 = require("../../../services/newControl/constants");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const control_1 = require("./control");
const RobotPokerAction_1 = require("../../../services/robotService/DZpipei/services/RobotPokerAction");
const controlUtil_1 = require("./util/controlUtil");
const utils = require("../../../utils/index");
const dz_logic = require("./dz_logic");
const dzpipeiConst = require("./DZpipeiConst");
const MessageService = require("../../../services/MessageService");
const dzRoomMgr_1 = require("../lib/dzRoomMgr");
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const WAIT_TIME = 5000;
const FAHUA_TIME = 14000;
var RoomStatus;
(function (RoomStatus) {
    RoomStatus["NONE"] = "NONE";
    RoomStatus["INWAIT"] = "INWAIT";
    RoomStatus["INGAME"] = "INGAME";
    RoomStatus["END"] = "END";
})(RoomStatus = exports.RoomStatus || (exports.RoomStatus = {}));
class dzRoom extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.status = RoomStatus.NONE;
        this.isquanxia = false;
        this.publicCards = [];
        this.pool_List = [];
        this.TheCards = [];
        this.roundTimes = 0;
        this.roomCurrSumBet = 0;
        this.lastBetNum = 0;
        this.curr_doing_seat = -1;
        this.zhuang_seat = -1;
        this.minBlindIdx = -1;
        this.currWaitTime = 0;
        this.offLineFahua = { idx: -1, cinglNum: 0 };
        this.publicCard = [];
        this.publicCardToSort = [];
        this.Oper_timeout = null;
        this.waitTimeout = null;
        this.players = new Array(9).fill(null);
        this.zipResult = '';
        this.default = '';
        this.gamePlayers = [];
        this._players = [];
        this.RobotPokerAction = new RobotPokerAction_1.default();
        this.canCarryGold = opts.canCarryGold;
        this.blindBet = opts.blindBet;
        this.ante = opts.ante;
        this.record_history = {
            lowbet: [],
            blindBet: [],
            drawBefore: [],
            draw: [],
            turnPoker: [],
            riverPoker: [],
            info: []
        };
        this.control = new control_1.default({ room: this });
        this.Initialization();
    }
    close() {
        this.sendRoomCloseMessage();
        this.players = [];
    }
    Initialization() {
        this.battle_kickNoOnline();
        this.setStatus(RoomStatus.INWAIT);
        this.default = '';
        this.publicCard = [];
        this.publicCardToSort = [];
        this.descSortAllPlayer = [];
        this.curr_doing_seat = -1;
        this.roundTimes = 0;
        this.roomCurrSumBet = 0;
        this.lastBetNum = 0;
        this.currWaitTime = 0;
        this.publicCards.length = 0;
        this.record_history = {
            lowbet: [],
            blindBet: [],
            drawBefore: [],
            draw: [],
            turnPoker: [],
            riverPoker: [],
            info: []
        };
        this.isquanxia = false;
        this.pool_List = [];
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
        const idxs = [];
        this.players.forEach((m, i) => !m && idxs.push(i));
        const i = idxs[utils.random(0, idxs.length - 1)];
        if (!dbplayer.currGold) {
            dbplayer.currGold = this.canCarryGold[0];
        }
        this.players[i] = new dzPlayer_1.default(i, dbplayer, this);
        this._players = this.players.slice();
        this.addMessage(dbplayer);
        this.channelIsPlayer('dz_onEntry', {
            player: this.players[i].strip(),
            status: this.status,
            waitTime: this.getWaitTime()
        });
        return true;
    }
    exit(playerInfo, isExit, msg = "") {
        this.kickOutMessage(playerInfo.uid);
        if (isExit) {
            playerInfo.onLine = false;
            return;
        }
        this.players[playerInfo.seat] = null;
        if (this.status == RoomStatus.INWAIT) {
            this._players = this.players.slice();
            this.noticeExit(playerInfo.uid, playerInfo.seat, msg);
        }
        dzRoomMgr_1.default.removePlayerSeat(playerInfo.uid);
    }
    getWaitTime() {
        if (this.status == RoomStatus.INWAIT)
            return Math.max(WAIT_TIME - (Date.now() - this.currWaitTime), 0);
        if (this.status == RoomStatus.INGAME)
            return Math.max(FAHUA_TIME - (Date.now() - this.lastFahuaTime), 0);
        return 0;
    }
    nextIdx(idx) {
        let next = idx + 1;
        let len = this._players.length;
        do {
            next = next >= len ? 0 : next;
            if (next == idx) {
                next = -1;
                break;
            }
            let pl = this._players[next];
            if (pl && pl.status == dzPlayer_1.PlayerStatus.GAME && pl.canUserGold() > 0 && !pl.isFold) {
                break;
            }
            next++;
        } while (true);
        return next;
    }
    updateMinBlind() {
        const playerInfo = this._players[this.minBlindIdx];
        if (!playerInfo || playerInfo.status != dzPlayer_1.PlayerStatus.GAME || playerInfo.isFold || playerInfo.canUserGold() == 0) {
            this.minBlindIdx = this.nextIdx(this.minBlindIdx);
        }
    }
    ready(playerInfo, option) {
        if (option) {
            playerInfo.setStatus(dzPlayer_1.PlayerStatus.WAIT);
        }
        else {
            playerInfo.setStatus(dzPlayer_1.PlayerStatus.NONE);
        }
        this.channelIsPlayer('dz_onReady', {
            seat: playerInfo.seat,
            uid: playerInfo.uid,
            status: playerInfo.status,
        });
        if (option) {
            this.wait(playerInfo);
        }
    }
    async wait(playerInfo) {
        if (this.status != RoomStatus.NONE && this.status != RoomStatus.INWAIT) {
            return;
        }
        const waitingPlayer = this._players.filter(pl => pl && pl.status == dzPlayer_1.PlayerStatus.WAIT);
        if (waitingPlayer.length <= 1) {
            return;
        }
        this.currWaitTime = Date.now();
        this.channelIsPlayer('dz_onWait', { waitTime: WAIT_TIME, roomId: this.roomId });
        clearTimeout(this.waitTimeout);
        this.waitTimeout = setTimeout(() => {
            if (waitingPlayer.length >= 2) {
                this.handler_start(waitingPlayer);
            }
            else {
                this.channelIsPlayer('dz_onWait', { waitTime: 0, roomId: this.roomId });
            }
        }, WAIT_TIME);
    }
    async handler_start(list) {
        this.setStatus(RoomStatus.INGAME);
        this.startTime = Date.now();
        this.gamePlayers = list;
        this.gamePlayers.forEach(pl => pl && (pl.status = dzPlayer_1.PlayerStatus.GAME));
        this.TheCards = dz_logic.getPai();
        await this.control.runControl();
        for (const pl of list) {
            this.record_history.lowbet.push({ uid: pl.uid, nickname: pl.nickname, bet: pl.bet });
        }
        this.partPool();
        this.lastBetNum = 0;
        this.zhuang_seat = this._players.findIndex(pl => pl && pl.status == dzPlayer_1.PlayerStatus.GAME);
        this.minBlindIdx = list.length == 2 ? this.zhuang_seat : this.nextIdx(this.zhuang_seat);
        const sb_pl = this._players[this.minBlindIdx];
        sb_pl.execBet(this, this.blindBet[0]);
        sb_pl.playerType = "SB";
        this.recordBlindBet(sb_pl);
        let doing = this.nextIdx(this.minBlindIdx);
        const bb_pl = this._players[doing];
        bb_pl.execBet(this, this.blindBet[1]);
        bb_pl.playerType = "BB";
        this.recordBlindBet(bb_pl);
        doing = this.nextIdx(doing);
        let zj_pl = this._players.find(pl => pl && pl.seat == this.zhuang_seat);
        for (const pl of this._players) {
            if (!pl)
                continue;
            let poker = dz_logic.getCardsType(pl.holds.slice(), this.publicCards.slice());
            pl.cardType = poker;
            pl.type = poker.type == -1 ? 0 : poker.type;
            const member = this.channel.getMember(pl.uid);
            const opts = {
                zhuang: { seat: zj_pl.seat, uid: zj_pl.uid },
                roomCurrSumBet: this.roomCurrSumBet,
                fahuaIdx: doing,
                cardType: pl.cardType,
                type: pl.type,
                players: list.map(c => c.toGame(pl.uid)),
                default: this.default,
            };
            if (pl.isRobot == 0)
                delete opts["default"];
            member && MessageService.pushMessageByUids('dz_onDeal', opts, member);
        }
        let allPlayerList = this.stripRobotNeed();
        this.descSortAllPlayer = RobotPokerAction_1.default.getAllPlayerPokerPowerDescendingSort(allPlayerList, this.publicCardToSort);
        setTimeout(() => this.set_next_doing_seat(doing), 1500);
    }
    set_next_doing_seat(doing) {
        let playerInfo = this._players[doing];
        playerInfo.state = dzPlayer_1.OptionState.PS_OPER;
        this.lastFahuaTime = Date.now();
        const cinglNum = this.lastBetNum - playerInfo.bet;
        playerInfo.recommendBet = [Math.floor(this.roomCurrSumBet / 3), Math.floor(this.roomCurrSumBet / 3 * 2), this.roomCurrSumBet];
        this.offLineFahua.idx = doing;
        this.offLineFahua.cinglNum = cinglNum;
        this.curr_doing_seat = doing;
        const opts = this.stripSpeak(playerInfo);
        const AiInfo = this.getAiInfo(playerInfo);
        const temp = utils.clone(opts);
        Object.assign(temp, AiInfo);
        this.channelIsPlayer("dz_onFahua", temp);
        this.Oper_timeout = setTimeout(() => {
            if (this.lastBetNum == 0) {
                this.handler_oper('pass', playerInfo, 0);
            }
            else {
                playerInfo.handler_fold(this, 'fold');
            }
        }, FAHUA_TIME + 1000);
    }
    stripSpeak(playerInfo) {
        this.freedomBet = [0, 0];
        let betmin = this.lastBetNum - playerInfo.bet;
        let betmax = playerInfo.canUserGold();
        if (betmax > betmin) {
            this.freedomBet = [betmin, betmax];
        }
        const opts = {
            roundTimes: this.roundTimes,
            fahuaIdx: this.offLineFahua.idx,
            lastBetNum: this.lastBetNum,
            currGold: playerInfo.canUserGold(),
            cinglNum: this.offLineFahua.cinglNum,
            freedomBet: this.freedomBet,
            recommBet: playerInfo.recommendBet,
            fahuaTime: FAHUA_TIME - (Date.now() - this.lastFahuaTime),
            round_action: ""
        };
        return opts;
    }
    getAiInfo(playerInfo) {
        const opts = { round_action: "", win_Probability: 0 };
        if (this.roundTimes == 0) {
            opts.round_action = dz_logic.getY1_4(playerInfo.holds);
            return opts;
        }
        let total_num = 0;
        let pl1_win = 0;
        for (let index = 0; index < 100; index++) {
            let temp = this.TheCards.map(c => c);
            temp.sort(() => 0.5 - Math.random());
            const publicCards = temp.splice(0, 5 - this.publicCards.length);
            publicCards.push(...this.publicCards);
            total_num++;
            const list = this._players.filter(pl => pl && !pl.isFold && pl.status == dzPlayer_1.PlayerStatus.GAME);
            const aipoke = list.map(c => {
                return {
                    uid: c.uid,
                    holds: c.holds,
                    cardSize: 0
                };
            });
            for (const c of aipoke) {
                let { cards, type } = dz_logic.getCardsType(c.holds.slice(), publicCards.slice());
                c.cardSize = dz_logic.sortPokerToType(cards.slice());
            }
            aipoke.sort((a, b) => {
                return b.cardSize - a.cardSize;
            });
            if (aipoke[0].uid == playerInfo.uid) {
                pl1_win++;
            }
        }
        const win_Probability = pl1_win / total_num * 100;
        opts.win_Probability = win_Probability;
        if (win_Probability >= 0 && win_Probability <= 14) {
            opts.round_action = "y1b";
        }
        else if (win_Probability > 14 && win_Probability <= 39) {
            opts.round_action = "y2b";
        }
        else if (win_Probability > 36 && win_Probability <= 59) {
            opts.round_action = "y3b";
        }
        else if (win_Probability > 59 && win_Probability <= 99) {
            opts.round_action = "y4b";
        }
        else if (win_Probability == 100) {
            opts.round_action = "y5b";
        }
        return opts;
    }
    handler_oper(type, playerInfo, currBet) {
        clearTimeout(this.Oper_timeout);
        playerInfo.execBet(this, currBet);
        this.recordDrawBefore(playerInfo, currBet, type);
        playerInfo.state = dzPlayer_1.OptionState.PS_NONE;
        this.channelIsPlayer('dz_onOpts', {
            type: type,
            seat: playerInfo.seat,
            uid: playerInfo.uid,
            currGold: playerInfo.canUserGold(),
            currBet: currBet,
            bet: playerInfo.bet,
            roomCurrSumBet: this.roomCurrSumBet,
        });
        this.nextStatus(playerInfo);
    }
    nextStatus(playerInfo) {
        const list = this._players.filter(pl => pl && !pl.isFold && pl.status == dzPlayer_1.PlayerStatus.GAME);
        const isPoker = list.every(pl => pl.canDeal(this.lastBetNum));
        if (isPoker && list.filter(pl => pl.canUserGold() > 0).length <= 1) {
            this.isquanxia = true;
            this.partPool();
            this.public_deal3();
            return;
        }
        if (isPoker) {
            this.partPool();
            this.public_deal2();
            return;
        }
        let next_id = this.nextIdx(playerInfo.seat);
        this.set_next_doing_seat(next_id);
    }
    public_deal1() {
        const cards = this.publicCard.splice(0, dz_logic.getPaiCount(this.roundTimes));
        this.publicCards = this.publicCards.concat(cards);
        this._players.filter(pl => pl && pl.holds != null).forEach(pl => {
            let poker = dz_logic.getCardsType(pl.holds.slice(), this.publicCards.slice());
            pl.cardType = poker;
            pl.type = poker.type;
        });
        for (const pl of this._players) {
            if (!pl)
                continue;
            const member = this.channel.getMember(pl.uid);
            const opts = {
                publicCards: this.publicCards,
                roundTimes: this.roundTimes,
                cardType: pl.cardType,
                isFold: pl.isFold,
                allPlayer: this._players.filter(pl => pl && pl.holds != null).map(pl => pl.robotStrip()),
            };
            if (pl.isRobot == 0)
                delete opts.allPlayer;
            member && MessageService.pushMessageByUids('dz_onDeal2', opts, member);
        }
        ++this.roundTimes;
    }
    public_deal2() {
        if (this.roundTimes >= 3) {
            return this.settlement();
        }
        this._players.forEach(pl => pl && pl.resetBet());
        this.lastBetNum = 0;
        this.public_deal1();
        this.updateMinBlind();
        setTimeout(() => {
            this.set_next_doing_seat(this.minBlindIdx);
        }, 2000);
    }
    public_deal3() {
        if (this.roundTimes >= 3) {
            return this.settlement();
        }
        this.public_deal1();
        setTimeout(() => this.public_deal3(), 2000);
    }
    async settlement() {
        let list = this._players.filter(pl => pl && pl.status == dzPlayer_1.PlayerStatus.GAME && !pl.isFold);
        await utils.delay(1000);
        this.countAlikePoker();
        this.poolSettlement();
        for (const pl of list) {
            await pl.addMilitary(this);
        }
        this.recordResult();
        for (const pl of this._players) {
            pl && await pl.only_update_game(this);
        }
        await utils.delay(800);
        const results = list.map(pl => pl && pl.result(this));
        const opts = {
            list: results,
        };
        this.channelIsPlayer('dz_onSettlement', opts);
        this.setStatus(RoomStatus.END);
        this.Initialization();
    }
    strip() {
        let zj_pl = this._players.find(pl => pl && pl.seat == this.zhuang_seat);
        return {
            nid: this.nid,
            sceneId: this.sceneId,
            roomId: this.roomId,
            players: this._players.map(pl => pl && pl.strip()),
            status: this.status,
            waitTime: this.getWaitTime(),
            fahuaIdx: this.curr_doing_seat,
            roomCurrSumBet: this.roomCurrSumBet,
            blindBet: this.blindBet,
            canCarryGold: this.canCarryGold,
            publicCard: this.publicCards,
            zhuang: zj_pl && { uid: zj_pl.uid, seat: zj_pl.seat }
        };
    }
    battle_kickNoOnline() {
        const offLinePlayers = [];
        for (const pl of this.players) {
            if (!pl)
                continue;
            if (!pl.onLine)
                dzRoomMgr_1.default.removePlayer(pl);
        }
    }
    noticeExit(uid, seat, msg = '') {
        const opts = {
            uid: uid,
            seat: seat,
            msg,
            status: this.status,
            playerNum: this._players.filter(pl => pl).length
        };
        this.channelIsPlayer('dz_onExit', opts);
    }
    recordBlindBet(playerInfo) {
        let ob = {
            payerType: playerInfo.playerType,
            uid: playerInfo.uid,
            nickname: playerInfo.nickname,
            bet: playerInfo.bet,
            type: playerInfo.playerType
        };
        this.record_history.blindBet.push(ob);
    }
    recordDrawBefore(playerInfo, bet, type) {
        let ob = {
            payerType: playerInfo.playerType,
            uid: playerInfo.uid,
            nickname: playerInfo.nickname,
            bet: bet,
            type: type
        };
        if (this.publicCards.length == 0) {
            this.record_history.drawBefore.push(ob);
        }
        else if (this.publicCards.length == 3) {
            this.record_history.draw.push(ob);
        }
        else if (this.publicCards.length == 4) {
            this.record_history.turnPoker.push(ob);
        }
        else if (this.publicCards.length == 5) {
            this.record_history.riverPoker.push(ob);
        }
    }
    recordResult() {
        this.record_history.info = this._players.map(pl => {
            if (pl) {
                let arr = [];
                arr.push(...pl.holds);
                arr.push(...this.publicCards);
                return {
                    playerType: pl.playerType,
                    tatalBet: pl.tatalBet,
                    profit: pl.profit,
                    holds: arr,
                    type: pl.type,
                    nickname: pl.nickname,
                    uid: pl.uid,
                    isFold: pl.isFold
                };
            }
        });
    }
    countAlikePoker() {
        for (const pl of this._players) {
            if (!pl)
                continue;
            if (pl.isFold) {
                pl.type = -1;
                pl.typeSize = -1;
            }
            else {
                let cards = (pl.holds.length != 0 && pl.holds) ? pl.holds : null;
                if (cards)
                    pl.typeSize = dz_logic.sortPokerToType(pl.cardType.cards.slice());
            }
        }
    }
    partPool() {
        do {
            let pool = { bet: 0, uids: [] };
            let list = this._players.filter(pl => pl && pl.bet > 0).sort((pl1, pl2) => { return pl1.bet - pl2.bet; });
            if (list.length == 0)
                break;
            let bet = list[0].bet;
            for (const pl of list) {
                pool.bet += bet;
                pool.uids.push({ uid: pl.uid, typeSize: 0 });
                pl.bet -= bet;
            }
            this.pool_List.push(pool);
            if (list.every(pl => pl.bet == 0)) {
                break;
            }
        } while (true);
    }
    poolSettlement() {
        for (const pool of this.pool_List) {
            let uids = pool.uids.sort((c1, c2) => {
                let pl1 = this._players.find(c => c && c.uid == c1.uid);
                c1.typeSize = pl1.typeSize;
                let pl2 = this._players.find(c => c && c.uid == c2.uid);
                c2.typeSize = pl2.typeSize;
                return c2.typeSize - c1.typeSize;
            });
            let pls = uids.filter(c => c.typeSize == uids[0].typeSize);
            for (const pl of pls) {
                let playerInfo = this._players.find(c => c && c.uid == pl.uid);
                playerInfo.profit += Math.floor(pool.bet / pls.length);
            }
        }
    }
    getPlayerHolds() {
        return this._players.filter(m => m && m.holds != null).map(m => m.stripHolds());
    }
    getOffLineData(playerInfo) {
        let data = {
            onFahua: this._players[this.curr_doing_seat] ? this.stripSpeak(this._players[this.curr_doing_seat]) : null,
            onLine: playerInfo.onLine,
            selfHolds: playerInfo.stripSelfPoker()
        };
        if (this.isquanxia)
            data['otherHolds'] = this.getPlayerHolds();
        return data;
    }
    serverNotice() {
        if (this.status == RoomStatus.NONE) {
            Logger.info(`服务器即将维护，踢掉玩家`);
        }
    }
    sortResult(publicCards) {
        publicCards.sort((a, b) => {
            let a_ = this.sortPlyaerCard(a);
            let b_ = this.sortPlyaerCard(b);
            return a_ - b_;
        });
    }
    sortPlyaerCard(result) {
        let { cards, type } = dz_logic.getCardsType(result.selfCard.slice(), result.publicCard.slice());
        const cardSize = dz_logic.sortPokerToType(cards.slice());
        result.cardSize = cardSize;
        return cardSize;
    }
    getMaxSeatCard(publicCard) {
        const allCard = [];
        this._players.filter(x => x && x.holds != null).forEach(m => {
            const cardObj = { uid: null, seat: null, isRobot: null, cards: null, holds: null, publicCard: null, cardSize: null };
            let { cards, type } = dz_logic.getCardsType(m.holds.slice(), publicCard.slice());
            const cardSize = dz_logic.sortPokerToType(cards.slice());
            cardObj.uid = m.uid;
            cardObj.seat = m.seat;
            cardObj.isRobot = m.isRobot;
            cardObj.cards = cards;
            cardObj.holds = m.holds;
            cardObj.publicCard = publicCard;
            cardObj.cardSize = cardSize;
            allCard.push(cardObj);
        });
        allCard.sort((a, b) => {
            return a.cardSize - b.cardSize;
        });
        return allCard;
    }
    addNote(player, num) {
        if (num >= dzpipeiConst.FAN_JIANG * this.blindBet[0]) {
            MessageService.sendBigWinNotice(this.nid, player.nickname, num, player.isRobot, player.headurl);
        }
    }
    stripRobotNeed() {
        if (this.status !== RoomStatus.INGAME) {
            return [];
        }
        const inGamePlayers = this._players.filter(m => m && m.status == dzPlayer_1.PlayerStatus.GAME);
        return inGamePlayers.map(m => m && m.stripRobotNeed());
    }
    randomDeal() {
        this.setPublicCards(this.TheCards.splice(utils.random(0, this.TheCards.length - 6), 5));
        this.gamePlayers.forEach(player => {
            let card = this.TheCards.splice(utils.random(0, this.TheCards.length - 3), 2);
            this.setPlayerHolds(player, card);
        });
    }
    personalControlDeal(positivePlayers, negativePlayers) {
        const model = (0, controlUtil_1.getCardsModel)();
        positivePlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        negativePlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        const publicCards = (0, controlUtil_1.selectPublicCards)(this.TheCards, model);
        this.setPublicCards(publicCards);
        (0, controlUtil_1.deleteHolds)(this.TheCards, publicCards);
        let gamePlayers = this.gamePlayers;
        const cards = (0, controlUtil_1.selectPlayersCards)(this.TheCards, model, publicCards, gamePlayers.length);
        const robotPlayers = gamePlayers.filter(p => p.isRobot === RoleEnum_1.RoleEnum.ROBOT);
        let luckPlayer;
        if (positivePlayers.length) {
            const p = positivePlayers[utils.random(0, positivePlayers.length - 1)];
            luckPlayer = gamePlayers.find(pl => pl.uid === p.uid);
        }
        else {
            if (robotPlayers.length > 1) {
                robotPlayers.sort((a, b) => b.canUserGold() - a.canUserGold());
                luckPlayer = Math.random() < 0.85 ? robotPlayers[0] : robotPlayers[1];
            }
            else {
                luckPlayer = robotPlayers[0];
            }
        }
        console.warn(`德州个控 调控牌型:${model}, 公牌:${publicCards}, 幸运玩家:${luckPlayer.uid}, 第一幅手牌: ${cards[0]}, 第二幅:${cards[1]}`);
        this.setPlayerHolds(luckPlayer, cards.shift());
        this.default = luckPlayer.uid;
        gamePlayers = gamePlayers.filter(player => player.uid !== luckPlayer.uid);
        if (negativePlayers.length) {
            negativePlayers.sort((a, b) => Math.random() - 0.5);
            negativePlayers.forEach(p => {
                const pl = gamePlayers.find(player => player.uid === p.uid);
                const card = cards.shift();
                this.setPlayerHolds(pl, card);
                gamePlayers = gamePlayers.filter(player => player.uid !== p.uid);
            });
        }
        gamePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
            cards.sort((a, b) => Math.random() - 0.5);
            this.setPlayerHolds(p, cards.pop());
        });
    }
    sceneControlDeal(sceneControlState, isPlatformControl) {
        if (sceneControlState === constants_1.ControlState.NONE) {
            return this.randomDeal();
        }
        const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        this.gamePlayers.forEach(p => p.setControlType(type));
        const model = (0, controlUtil_1.getCardsModel)();
        const publicCards = (0, controlUtil_1.selectPublicCards)(this.TheCards, model);
        this.setPublicCards(publicCards);
        (0, controlUtil_1.deleteHolds)(this.TheCards, publicCards);
        let gamePlayers = this.gamePlayers;
        const cards = (0, controlUtil_1.selectPlayersCards)(this.TheCards, model, publicCards, gamePlayers.length);
        const winnerType = sceneControlState === constants_1.ControlState.SYSTEM_WIN ? RoleEnum_1.RoleEnum.ROBOT : RoleEnum_1.RoleEnum.REAL_PLAYER;
        const possibleWinPlayers = gamePlayers.filter(p => p.isRobot === winnerType);
        possibleWinPlayers.sort((a, b) => Math.random() - 0.5);
        const winPlayer = possibleWinPlayers.shift();
        console.warn(`德州场控 调控牌型:${model}, 公牌:${publicCards}, 幸运玩家:${winPlayer.uid}, 第一幅手牌: ${cards[0]}, 第二幅:${cards[1]}`);
        this.setPlayerHolds(winPlayer, cards.shift());
        this.default = winPlayer.uid;
        gamePlayers = gamePlayers.filter(p => p.uid !== winPlayer.uid);
        gamePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
            cards.sort((a, b) => Math.random() - 0.5);
            this.setPlayerHolds(p, cards.pop());
        });
    }
    setPlayerHolds(player, cards) {
        player.initGame(cards);
        player.execBet(this, this.ante);
    }
    sortCards(cards) {
        cards.sort((a, b) => {
            return this.getCardNumber(b) - this.getCardNumber(a);
        });
    }
    getCardNumber(card) {
        let { cards } = dz_logic.getCardsType(card.slice(), this.publicCardToSort.slice());
        return dz_logic.sortPokerToType(cards.slice());
    }
    getCards(len) {
        const cards = [];
        for (let i = 0; i < len; i++) {
            cards.push(this.TheCards.splice(utils.random(0, this.TheCards.length - 3), 2));
        }
        return cards;
    }
    setPublicCards(cards) {
        this.publicCard = cards;
        this.publicCardToSort = this.publicCardToSort.concat(this.publicCard);
    }
    ;
    getDescSortAllPlayer() {
        return this.descSortAllPlayer;
    }
    ;
    setStatus(status) {
        this.status = status;
    }
}
exports.default = dzRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHpSb29tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvRFpwaXBlaS9saWIvZHpSb29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtDQUF5QztBQUN6Qyx5Q0FBaUU7QUFDakUsdUVBQW9FO0FBR3BFLHNFQUFvRjtBQUNwRix1RUFBb0U7QUFDcEUsdUNBQW9DO0FBQ3BDLHVHQUFnRztBQUNoRyxvREFBdUc7QUFDdkcsOENBQStDO0FBQy9DLHVDQUF3QztBQUN4QywrQ0FBZ0Q7QUFDaEQsbUVBQW9FO0FBQ3BFLGdEQUE2RDtBQUM3RCxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBSW5ELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQztBQUV2QixNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUM7QUFFekIsSUFBWSxVQUtYO0FBTEQsV0FBWSxVQUFVO0lBQ2xCLDJCQUFhLENBQUE7SUFDYiwrQkFBaUIsQ0FBQTtJQUNqQiwrQkFBaUIsQ0FBQTtJQUNqQix5QkFBVyxDQUFBO0FBQ2YsQ0FBQyxFQUxXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBS3JCO0FBU0QsTUFBcUIsTUFBTyxTQUFRLHVCQUFvQjtJQStFcEQsWUFBWSxJQUFTO1FBQ2pCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQTlFZixXQUFNLEdBQWUsVUFBVSxDQUFDLElBQUksQ0FBQztRQUNyQyxjQUFTLEdBQVksS0FBSyxDQUFDO1FBRTNCLGdCQUFXLEdBQWEsRUFBRSxDQUFDO1FBRTNCLGNBQVMsR0FBa0MsRUFBRSxDQUFDO1FBa0I5QyxhQUFRLEdBQWEsRUFBRSxDQUFDO1FBRXhCLGVBQVUsR0FBVyxDQUFDLENBQUM7UUFFdkIsbUJBQWMsR0FBVyxDQUFDLENBQUM7UUFFM0IsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUV2QixvQkFBZSxHQUFXLENBQUMsQ0FB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