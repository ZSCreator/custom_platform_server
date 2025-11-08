"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
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
const WAIT_TIME = 2000;
const FAHUA_TIME = 14000;
class dzRoom extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.status = 'NONE';
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
        this.status = 'INWAIT';
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
        this.gamePlayers = [];
        this._players = [];
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
        if (this.status == "INWAIT") {
            this._players = this.players.slice();
            this.noticeExit(playerInfo.uid, playerInfo.seat, msg);
        }
        dzRoomMgr_1.default.removePlayerSeat(playerInfo.uid);
    }
    getWaitTime() {
        if (this.status == 'INWAIT')
            return Math.max(WAIT_TIME - (Date.now() - this.currWaitTime), 0);
        if (this.status == 'INGAME')
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
            if (pl && pl.status == 'GAME' && pl.canUserGold() > 0 && !pl.isFold) {
                break;
            }
            next++;
        } while (true);
        return next;
    }
    updateMinBlind() {
        const playerInfo = this._players[this.minBlindIdx];
        if (!playerInfo || playerInfo.status != 'GAME' || playerInfo.isFold || playerInfo.canUserGold() == 0) {
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
        if (this.status != 'NONE' && this.status != 'INWAIT') {
            return;
        }
        this.currWaitTime = Date.now();
        this.channelIsPlayer('dz_onWait', { waitTime: WAIT_TIME, roomId: this.roomId });
        clearTimeout(this.waitTimeout);
        this.waitTimeout = setTimeout(() => {
            const list = this._players.filter(pl => pl && pl.canUserGold() >= this.canCarryGold[0] && pl.status == dzPlayer_1.PlayerStatus.WAIT);
            if (list.length >= 2) {
                this.handler_start(list);
            }
            else {
                this.channelIsPlayer('dz_onWait', { waitTime: 0, roomId: this.roomId });
            }
        }, WAIT_TIME);
    }
    async handler_start(list) {
        this.status = 'INGAME';
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
        this.zhuang_seat = this._players.findIndex(pl => pl && pl.status == 'GAME');
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
            const list = this._players.filter(pl => pl && !pl.isFold && pl.status == 'GAME');
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
        const list = this._players.filter(pl => pl && !pl.isFold && pl.status == 'GAME');
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
        let list = this._players.filter(pl => pl && pl.status == 'GAME' && !pl.isFold);
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
        this.status = 'END';
        if (this._players.some(pl => pl && pl.isOnLine == true)) {
            await utils.delay(30 * 1000);
        }
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
            this.exit(pl, false);
            offLinePlayers.push(pl);
        }
        this.kickingPlayer(pinus_1.pinus.app.getServerId(), offLinePlayers);
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
        if (this.status == 'NONE') {
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
        if (this.status !== 'INGAME') {
            return [];
        }
        const inGamePlayers = this._players.filter(m => m && m.status == 'GAME');
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
}
exports.default = dzRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHpSb29tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvRFpwaXBlaS9saWIvZHpSb29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQThCO0FBQzlCLCtDQUF5QztBQUN6Qyx5Q0FBaUU7QUFDakUsdUVBQW9FO0FBR3BFLHNFQUFvRjtBQUNwRix1RUFBb0U7QUFDcEUsdUNBQW9DO0FBQ3BDLHVHQUFnRztBQUNoRyxvREFBdUc7QUFDdkcsOENBQStDO0FBQy9DLHVDQUF3QztBQUN4QywrQ0FBZ0Q7QUFDaEQsbUVBQW9FO0FBQ3BFLGdEQUE2RDtBQUM3RCxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBSW5ELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQztBQUV2QixNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUM7QUFVekIsTUFBcUIsTUFBTyxTQUFRLHVCQUFvQjtJQStFcEQsWUFBWSxJQUFTO1FBQ2pCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQTlFZixXQUFNLEdBQXlDLE1BQU0sQ0FBQztRQUN0RCxjQUFTLEdBQVksS0FBSyxDQUFDO1FBRTNCLGdCQUFXLEdBQWEsRUFBRSxDQUFDO1FBRTNCLGNBQVMsR0FBa0MsRUFBRSxDQUFDO1FBa0I5QyxhQUFRLEdBQWEsRUFBRSxDQUFDO1FBRXhCLGVBQVUsR0FBVyxDQUFDLENBQUM7UUFFdkIsbUJBQWMsR0FBVyxDQUFDLENBQUM7UUFFM0IsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUV2QixvQkFBZSxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBRTdCLGdCQUFXLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFekIsZ0JBQVcsR0FBVyxDQUFDLENBQUMsQ0FBQztRQUV6QixpQkFBWSxHQUFXLENBQUMsQ0FBQztRQUN6QixpQkFBWSxHQUtSLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFF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