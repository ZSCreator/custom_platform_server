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
const WAIT_TIME = 3000;
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