'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const TeenPatti_logic = require("./TeenPatti_logic");
const tpPlayer_1 = require("./tpPlayer");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const pinus_logger_1 = require("pinus-logger");
const ControlImpl_1 = require("./ControlImpl");
const recordUtil_1 = require("./util/recordUtil");
const constants_1 = require("../../../services/newControl/constants");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const MessageService = require("../../../services/MessageService");
const utils = require("../../../utils/index");
const TeenPattiConst = require("./TeenPattiConst");
const TeenPattiMgr_1 = require("../lib/TeenPattiMgr");
const utils_1 = require("../../../utils");
const WAIT_TIME = 5000;
const FAHUA_TIME = 15000;
const KANPAI_TIME = 8000;
class jhRoom extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.maxRound = 20;
        this.status = 'NONE';
        this.roundTimes = 1;
        this.currSumBet = 0;
        this.curr_doing_seat = -1;
        this.lastWaitTime = 0;
        this.lastFahuaTime = 0;
        this.tableJettons = [];
        this.offLineFahua = {};
        this.waitTimeout = null;
        this.Oper_timeout = null;
        this.bipaiTimeout = null;
        this.TYPE_PROBABILITY = TeenPattiConst.TYPE_PROBABILITY;
        this.CONTROL_TYPE_PROBABILITY = TeenPattiConst.CONTROL_TYPE_PROBABILITY;
        this.players = new Array(5).fill(null);
        this.gamePlayers = [];
        this._players = [];
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
        this.bipai_arr = { apply: null, other: null };
        this.backendServerId = pinus_1.pinus.app.getServerId();
        this.entryCond = opts.entryCond || 0;
        this.lowBet = opts.lowBet || 100;
        this.multipleLimit = opts.multipleLimit || 128;
        this.betNum = this.lowBet;
        this.controlLogic = new ControlImpl_1.default({ room: this });
        this.Initialization();
    }
    close() {
        this.sendRoomCloseMessage();
        this.players = [];
    }
    Initialization() {
        this.battle_kickNoOnline();
        this.curr_doing_seat = -1;
        this.roundTimes = 1;
        this.currSumBet = 0;
        this.betNum = this.lowBet;
        this.lastFahuaTime = 0;
        this.tableJettons = [];
        this.record_history = { info: [], oper: [] };
        this.gamePlayers = [];
        this.status = 'INWAIT';
        this.offLineFahua.canBipai = false;
        this.offLineFahua.canKanpai = false;
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
        this.players[i] = new tpPlayer_1.default(i, dbplayer);
        this._players = this.players.slice();
        this.addMessage(dbplayer);
        return true;
    }
    leave(playerInfo, isOffLine) {
        this.kickOutMessage(playerInfo.uid);
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        this.players[playerInfo.seat] = null;
        if (this.status == "INWAIT") {
            this._players = this.players.slice();
            this.channelIsPlayer('TeenPatti_onExit', {
                kickPlayers: [playerInfo.kickStrip()],
            });
        }
        TeenPattiMgr_1.default.removePlayerSeat(playerInfo.uid);
    }
    getWaitTime() {
        if (this.status == 'INWAIT')
            return Math.max(WAIT_TIME - (Date.now() - this.lastWaitTime), 0);
        if (this.status == 'INGAME') {
            return Math.max(FAHUA_TIME - (Date.now() - this.lastFahuaTime), 0);
        }
        return 0;
    }
    addSumBet(currPlayer, num, beizhu) {
        this.currSumBet += num;
        this.tableJettons.push({ value: num, seat: currPlayer.seat, beizhu, betNum: this.betNum, currSumBet: this.currSumBet });
    }
    wait(currPlayer) {
        if (this.status != 'INWAIT')
            return;
        if (this.players.filter(pl => pl).length <= 1) {
            this.channelIsPlayer('TeenPatti_onWait', { waitTime: 0 });
            return;
        }
        if (Date.now() - this.lastWaitTime < WAIT_TIME) {
            const member = currPlayer && this.channel.getMember(currPlayer.uid);
            if (member) {
                let waitTime = Math.max(WAIT_TIME - (Date.now() - this.lastWaitTime), 0);
                MessageService.pushMessageByUids('TeenPatti_onWait', { waitTime }, member);
            }
            return;
        }
        this.channelIsPlayer('TeenPatti_onWait', { waitTime: WAIT_TIME });
        this.lastWaitTime = Date.now();
        clearTimeout(this.waitTimeout);
        this.waitTimeout = setTimeout(() => {
            const list = this._players.filter(pl => pl);
            if (list.length >= 2) {
                this.handler_start(list);
            }
            else {
                this.channelIsPlayer('TeenPatti_onWait', { waitTime: 0 });
            }
        }, WAIT_TIME);
    }
    async handler_start(list) {
        this.status = 'INGAME';
        this.gamePlayers = list;
        this.gamePlayers.forEach(pl => pl.status = 'GAME');
        this.startTime = Date.now();
        list.sort(() => 0.5 - Math.random());
        await this.controlLogic.runControl(list);
        this.zipResult = (0, recordUtil_1.buildRecordResult)(this._players);
        for (const pl of list) {
            this.addSumBet(pl, this.lowBet, "deal");
        }
        this.randomSeed = Date.now();
        this.zhuang_seat = this._players.findIndex(m => m && m.status === 'GAME');
        this.curr_doing_seat = this.zhuang_seat;
        this.channelIsPlayer('TeenPatti_onDeal', {
            currSumBet: this.currSumBet,
            randomSeed: this.randomSeed,
            players: this.gamePlayers.map(pl => pl.strip()),
            canBipai: false,
            zhuang_seat: this.zhuang_seat
        });
        setTimeout(() => {
            this.set_next_doing_seat(this.nextFahuaIdx());
        }, this.gamePlayers.length * 500 + 200);
        return Promise.resolve();
    }
    set_next_doing_seat(doing) {
        const playerInfo = this._players[doing];
        playerInfo.state = "PS_OPER";
        this.lastFahuaTime = Date.now();
        this.offLineFahua.canBipai = playerInfo.canBipai(this).canBipai;
        this.offLineFahua.canKanpai = true;
        this.offLineFahua.FAHUA_TIME = FAHUA_TIME;
        this.offLineFahua.member_num = this._players.filter(pl => pl && pl.status === 'GAME').length;
        if (this.zhuang_seat == doing) {
            this.roundTimes++;
            if (this.roundTimes == 5) {
                this.gamePlayers.forEach(pl => pl && pl.holdStatus == 0 && pl.handler_kanpai(this));
            }
        }
        for (const pl of this.gamePlayers) {
            const member = pl && this.channel.getMember(pl.uid);
            const opts = this.stripSpeak(playerInfo);
            if (pl.isRobot == RoleEnum_1.RoleEnum.ROBOT) {
                opts['max_uid'] = this.max_uid;
                opts['isControl'] = this.controlLogic.isControl;
            }
            member && MessageService.pushMessageByUids('TeenPatti_onFahua', opts, member);
        }
        this.curr_doing_seat = doing;
        this.record_history.oper.push({ uid: playerInfo.uid, oper_type: "oper_s", update_time: utils.cDate(), msg: "" });
        this.handler_pass();
    }
    handler_pass() {
        clearTimeout(this.Oper_timeout);
        let ms = FAHUA_TIME;
        this.Oper_timeout = setTimeout(() => {
            let playerInfo = this._players[this.curr_doing_seat];
            playerInfo.handler_fold(this);
        }, ms);
        return ms;
    }
    stripSpeak(playerInfo) {
        let is_filling = true;
        if (this.betNum == this.multipleLimit * this.lowBet / 2) {
            is_filling = false;
        }
        const opts = {
            fahuaIdx: playerInfo.seat,
            totalBet: playerInfo.totalBet,
            betNum: this.betNum,
            roundTimes: this.roundTimes,
            canBipai: this.offLineFahua.canBipai,
            canKanpai: this.offLineFahua.canKanpai,
            fahuaTime: FAHUA_TIME - (Date.now() - this.lastFahuaTime),
            member_num: this.offLineFahua.member_num,
            zhuang_seat: this.zhuang_seat,
            is_filling
        };
        return opts;
    }
    handler_bipai(Launch_pl, accept_pl, num) {
        clearTimeout(this.Oper_timeout);
        clearTimeout(this.bipaiTimeout);
        Launch_pl.totalBet += num;
        Launch_pl.gold -= num;
        Launch_pl.IsMingZhu = true;
        this.addSumBet(Launch_pl, num, "bipai");
        this.record_history.oper.push({ uid: Launch_pl.uid, oper_type: "bipai", update_time: utils.cDate(), msg: { num, accept_pl: accept_pl.uid } });
        this.joineachotherLiangpais([Launch_pl, accept_pl]);
        let ret = TeenPatti_logic.bipaiSole(Launch_pl, accept_pl);
        let winner = Launch_pl;
        let failer = accept_pl;
        if (ret == 0) {
            winner = Launch_pl;
            failer = accept_pl;
        }
        else {
            winner = accept_pl;
            failer = Launch_pl;
        }
        failer.status = 'WAIT';
        failer.holdStatus = 3;
        (this.zhuang_seat == failer.seat) && this.resetZhuang();
        failer.settlement(this);
        this.channelIsPlayer('TeenPatti_onOpts', {
            type: 'bipai',
            seat: Launch_pl.seat,
            gold: Launch_pl.gold,
            betNum: num,
            pl_totalBet: Launch_pl.totalBet,
            room_sumBet: this.currSumBet,
            iswin: winner.uid === Launch_pl.uid,
            other: accept_pl.seat,
        });
        this.bipaiTimeout = setTimeout(() => {
            this.checkHasNextPlayer(Launch_pl.seat);
        }, 3500);
    }
    handler_applyBipai(Launch_pl, accept_pl, num) {
        clearTimeout(this.Oper_timeout);
        clearTimeout(this.bipaiTimeout);
        Launch_pl.totalBet += num;
        Launch_pl.gold -= num;
        Launch_pl.IsMingZhu = true;
        this.addSumBet(Launch_pl, num, "applyBipai");
        this.record_history.oper.push({ uid: Launch_pl.uid, oper_type: "applyBipai", update_time: utils.cDate(), msg: { num, accept_pl: accept_pl.uid } });
        this.channelIsPlayer('TeenPatti_onOpts', {
            type: 'applyBipai',
            seat: Launch_pl.seat,
            gold: Launch_pl.gold,
            betNum: num,
            pl_totalBet: Launch_pl.totalBet,
            room_sumBet: this.currSumBet,
            other: accept_pl.seat,
            applyBipai_TIME: 10 * 1000
        });
        this.bipaiTimeout = setTimeout(() => {
            this.handler_rejectBiPai();
        }, 10 * 1000);
    }
    handler_rejectBiPai() {
        clearTimeout(this.bipaiTimeout);
        let accept_pl = this._players[this.bipai_arr.other];
        const num = accept_pl.holdStatus === 1 ? this.betNum * 2 : this.betNum;
        this.record_history.oper.push({ uid: accept_pl.uid, oper_type: "rejectBiPai", update_time: utils.cDate(), msg: 0 });
        this.channelIsPlayer('TeenPatti_onOpts', {
            type: 'rejectBiPai',
            seat: this.bipai_arr.apply,
            gold: accept_pl.gold,
            other: this.bipai_arr.other,
            pl_totalBet: accept_pl.totalBet,
            room_sumBet: this.currSumBet,
            betNum: 0,
        });
        this.bipai_arr = { apply: null, other: null };
        this.checkHasNextPlayer(this.nextFahuaIdx());
    }
    async handler_complete(players, auto = false) {
        this.status = 'END';
        clearTimeout(this.Oper_timeout);
        clearTimeout(this.waitTimeout);
        clearTimeout(this.bipaiTimeout);
        if (auto) {
            const gamePlayers = this._players.filter(pl => pl && pl.status == 'GAME');
            this.joineachotherLiangpais(gamePlayers);
            players = TeenPatti_logic.getMaxPls(gamePlayers);
            const lose_pls = gamePlayers.filter(pl => !players.includes(pl));
            for (const pl of lose_pls) {
                await pl.settlement(this);
            }
        }
        const tmp_winNum = this.currSumBet / players.length;
        for (let pl of players) {
            if (!pl)
                continue;
            pl.profit = tmp_winNum;
            await pl.settlement(this);
            if (Math.floor((tmp_winNum - pl.totalBet) / this.lowBet) > 500) {
                MessageService.sendBigWinNotice(this.nid, pl.nickname, tmp_winNum, pl.isRobot, pl.headurl);
            }
        }
        await utils.delay(800);
        let opts = {
            auto,
            winner: players.map(c => c.uid),
            winnerSeat: players.map(c => c.seat),
            list: this._players.map(m => !!m && m.wrapSettlement())
        };
        this.channelIsPlayer('TeenPatti_onSettlement', opts);
        this.record_history.info = this._players.filter(pl => pl).map(pl => pl.Record_strip());
        for (const pl of this._players) {
            pl && await pl.only_update_game(this);
        }
        this.Initialization();
    }
    checkHasNextPlayer(doing) {
        if (this.status == "END")
            return;
        if (this.currSumBet >= 1024 * this.lowBet) {
            return this.handler_complete(null, true);
        }
        const list = this._players.filter(m => m && m.status == 'GAME');
        if (list.length <= 1) {
            this.handler_complete([list[0]]);
        }
        else {
            this.set_next_doing_seat(this.nextFahuaIdx());
        }
    }
    previousFahuaIdx() {
        let next = this.curr_doing_seat - 1;
        let len = this._players.length;
        do {
            next = next < 0 ? len : next;
            if (next == this.curr_doing_seat) {
                return -1;
            }
            let pl = this._players[next];
            if (pl && pl.status == 'GAME' && (pl.IsMingZhu || this.players.filter(c => c && c.status == "GAME").length == 2)) {
                return next;
            }
            next--;
        } while (true);
    }
    nextFahuaIdx() {
        let next = this.curr_doing_seat + 1;
        let len = this._players.length;
        do {
            next = next >= len ? 0 : next;
            if (next == this.curr_doing_seat) {
                return -1;
            }
            let player = this._players[next];
            if (player && player.status == 'GAME') {
                return next;
            }
            next++;
        } while (true);
    }
    resetZhuang() {
        let next = this.zhuang_seat - 1;
        let len = this._players.length;
        do {
            next = next <= -1 ? len : next;
            if (next == this.zhuang_seat) {
                return -1;
            }
            let player = this._players[next];
            if (player && player.status == 'GAME') {
                this.zhuang_seat = next;
                return next;
            }
            next--;
        } while (true);
    }
    joineachotherLiangpais(players) {
        if (players.length <= 1)
            return;
        for (let i = players.length - 1; i >= 0; i--) {
            const player = players[i];
            players.forEach(m => {
                if (!!m && m.uid !== player.uid && !player.canliangs.includes(m.uid)) {
                    player.canliangs.push(m.uid);
                }
            });
        }
    }
    strip() {
        return {
            nid: this.nid,
            sceneId: this.sceneId,
            roomId: this.roomId,
            players: this._players.map(m => m && m.strip()),
            status: this.status,
            roundTimes: this.roundTimes,
            curr_doing_seat: this.curr_doing_seat,
            currSumBet: this.currSumBet,
            randomSeed: this.randomSeed,
            tableJettons: this.tableJettons,
            canBipai: this.offLineFahua.canBipai,
            canKanpai: this.offLineFahua.canKanpai,
            zhuang_seat: this.zhuang_seat
        };
    }
    battle_kickNoOnline() {
        const offLinePlayers = [];
        for (const pl of this.players) {
            if (!pl)
                continue;
            if (!pl.onLine)
                TeenPattiMgr_1.default.removePlayer(pl);
            offLinePlayers.push(pl);
            this.kickOutMessage(pl.uid);
            TeenPattiMgr_1.default.removePlayerSeat(pl.uid);
            this.players[pl.seat] = null;
        }
        this.kickingPlayer(pinus_1.pinus.app.getServerId(), offLinePlayers);
    }
    generateCards(len, control) {
        const poker = TeenPatti_logic.randomPoker();
        let cards = [];
        for (let i = 0; i < 10; i++) {
            poker.sort((x, y) => Math.random() - 0.5);
            const threeCards = [];
            for (let j = 0; j < 3; j++) {
                const randomNum = (0, utils_1.random)(0, poker.length - 1);
                threeCards.push(poker.splice(randomNum, 1)[0]);
            }
            cards.push(threeCards);
        }
        TeenPatti_logic.sortResult(cards);
        cards = cards.slice(0, len);
        cards.sort((a, b) => Math.random() - 0.5);
        return cards;
    }
    setPlayerCard(playerInfo, cards) {
        const cardType = TeenPatti_logic.getCardType(cards);
        playerInfo.initGame(this, cards, cardType, this.lowBet);
    }
    static getTypeCards(poker, type) {
        switch (type) {
            case '5': return TeenPatti_logic.getBZ(poker);
            case '4': return TeenPatti_logic.getTHS(poker);
            case '3': return TeenPatti_logic.getTH(poker);
            case '2': return TeenPatti_logic.getSZ(poker);
            case '1': return TeenPatti_logic.getDZ(poker);
            case '0': return TeenPatti_logic.getS(poker);
            default:
                throw new Error(`非法牌型 ${type}`);
        }
    }
    randomDeal(list) {
        const cards = this.generateCards(list.length, false);
        let indexSet = new Set();
        while (indexSet.size !== list.length) {
            indexSet.add(TeenPatti_logic.random(0, list.length));
        }
        [...indexSet].forEach(index => this.setPlayerCard(list[index], cards.shift()));
        this.max_uid = TeenPatti_logic.getMaxPls(this.gamePlayers)[0].uid;
    }
    personalControlDeal(gamePlayers, positivePlayers, negativePlayers) {
        const cards = this.generateCards(gamePlayers.length, true);
        positivePlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        negativePlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        TeenPatti_logic.sortResult(cards);
        const robotPlayers = gamePlayers.filter(p => p.isRobot === 2);
        let luckPlayer;
        if (positivePlayers.length) {
            const p = positivePlayers[TeenPatti_logic.random(0, positivePlayers.length)];
            luckPlayer = gamePlayers.find(pl => pl.uid === p.uid);
        }
        else {
            luckPlayer = robotPlayers[TeenPatti_logic.random(0, robotPlayers.length)];
        }
        this.setPlayerCard(luckPlayer, cards.shift());
        gamePlayers = gamePlayers.filter(player => player.uid !== luckPlayer.uid);
        if (negativePlayers.length) {
            if (negativePlayers.length !== 1) {
                negativePlayers.sort((a, b) => Math.random() - 0.5);
                negativePlayers.forEach(p => {
                    const pl = gamePlayers.find(player => player.uid === p.uid);
                    const card = cards.shift();
                    this.setPlayerCard(pl, card);
                    gamePlayers = gamePlayers.filter(player => player.uid !== p.uid);
                });
            }
            else {
                const randomNum = (0, utils_1.random)(1, 100);
                const player = gamePlayers.find(p => negativePlayers[0].uid === p.uid);
                gamePlayers = gamePlayers.filter(p => player.uid !== p.uid);
                if (randomNum <= 50 || cards.length === 1) {
                    this.setPlayerCard(player, cards.shift());
                }
                else {
                    this.setPlayerCard(player, cards.splice(1, 1)[0]);
                }
            }
        }
        let indexSet = new Set();
        while (indexSet.size !== gamePlayers.length) {
            indexSet.add(TeenPatti_logic.random(0, gamePlayers.length));
        }
        [...indexSet].forEach(index => this.setPlayerCard(gamePlayers[index], cards.shift()));
        this.max_uid = TeenPatti_logic.getMaxPls(this.gamePlayers)[0].uid;
    }
    sceneControlDeal(sceneControlState, gamePlayers, isPlatformControl) {
        if (sceneControlState === constants_1.ControlState.NONE) {
            return this.randomDeal(gamePlayers);
        }
        const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        gamePlayers.forEach(p => p.setControlType(type));
        let cards = this.generateCards(gamePlayers.length, constants_1.ControlState.SYSTEM_WIN === sceneControlState);
        TeenPatti_logic.sortResult(cards);
        const winnerType = sceneControlState === constants_1.ControlState.SYSTEM_WIN ? RoleEnum_1.RoleEnum.ROBOT : RoleEnum_1.RoleEnum.REAL_PLAYER;
        const possibleWinPlayers = gamePlayers.filter(p => p.isRobot === winnerType);
        possibleWinPlayers.sort((a, b) => Math.random() - 0.5);
        const winPlayer = possibleWinPlayers.shift();
        this.setPlayerCard(winPlayer, cards.shift());
        gamePlayers = gamePlayers.filter(p => p.uid !== winPlayer.uid);
        gamePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
            cards.sort((a, b) => Math.random() - 0.5);
            this.setPlayerCard(p, cards.shift());
        });
        this.max_uid = TeenPatti_logic.getMaxPls(this.gamePlayers)[0].uid;
    }
}
exports.default = jhRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHBSb29tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvVGVlblBhdHRpL2xpYi90cFJvb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLGlDQUE4QjtBQUM5QixxREFBcUQ7QUFFckQseUNBQWtDO0FBQ2xDLHVFQUFvRTtBQUVwRSwrQ0FBeUM7QUFDekMsK0NBQXdDO0FBQ3hDLGtEQUFzRDtBQUN0RCxzRUFBb0Y7QUFDcEYsdUVBQW9FO0FBQ3BFLG1FQUFvRTtBQUNwRSw4Q0FBK0M7QUFDL0MsbURBQW9EO0FBQ3BELHNEQUFnRTtBQUNoRSwwQ0FBd0M7QUFHeEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBRXZCLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQztBQUV6QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFTekIsTUFBcUIsTUFBTyxTQUFRLHVCQUFvQjtJQXNEcEQsWUFBWSxJQUFJO1FBQ1osS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBL0NmLGFBQVEsR0FBVyxFQUFFLENBQUM7UUFFdEIsV0FBTSxHQUF5QyxNQUFNLENBQUM7UUFFdEQsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUV2QixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBTXZCLG9CQUFlLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFN0IsaUJBQVksR0FBVyxDQUFDLENBQUM7UUFFekIsa0JBQWEsR0FBVyxDQUFDLENBQUM7UUFFMUIsaUJBQVksR0FBMEYsRUFBRSxDQUFDO1FBQ3pHLGlCQUFZLEdBSVIsRUFBRSxDQUFDO1FBSVAsZ0JBQVcsR0FBaUIsSUFBSSxDQUFDO1FBRWpDLGlCQUFZLEdBQWlCLElBQUksQ0FBQztRQUNsQyxpQkFBWSxHQUFpQixJQUFJLENBQUM7UUFDbEMscUJBQWdCLEdBQUcsY0FBYyxDQUFDLGdCQUFnQixDQUFDO1FBQ25ELDZCQUF3QixHQUFHLGNBQWMsQ0FBQyx3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R0FBRyxDQUFDLENBQUM7UUFDNUIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUUxQyxPQUFPLEtBQUssQ0FBQztJQWFqQixDQUFDO0lBUUQsYUFBYSxDQUFDLFVBQW9CLEVBQUUsS0FBSztRQUNyQyxNQUFNLFFBQVEsR0FBRyxlQUFlLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BELFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFRRCxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQVUsRUFBRSxJQUFZO1FBQ3hDLFFBQVEsSUFBSSxFQUFFO1lBQ1YsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLGVBQWUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDL0MsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDN0M7Z0JBQ0ksTUFBTSxJQUFJLEtBQUssQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBT0QsVUFBVSxDQUFDLElBQWdCO1FBQ3ZCLE1BQU0sS0FBSyxHQUFHLElB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