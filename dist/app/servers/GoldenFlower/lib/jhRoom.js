'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const GoldenFlower_logic = require("./GoldenFlower_logic");
const jhPlayer_1 = require("./jhPlayer");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const pinus_logger_1 = require("pinus-logger");
const ControlImpl_1 = require("./ControlImpl");
const recordUtil_1 = require("./util/recordUtil");
const constants_1 = require("../../../services/newControl/constants");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const utils_1 = require("../../../utils");
const MessageService = require("../../../services/MessageService");
const utils = require("../../../utils/index");
const GoldenFlowerConst = require("./GoldenFlowerConst");
const GoldenFlowerMgr_1 = require("../lib/GoldenFlowerMgr");
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
        this.record_history = { max_uid: "", info: [], oper: [] };
        this.Oper_timeout = null;
        this.TYPE_PROBABILITY = GoldenFlowerConst.TYPE_PROBABILITY;
        this.CONTROL_TYPE_PROBABILITY = GoldenFlowerConst.CONTROL_TYPE_PROBABILITY;
        this.players = new Array(5).fill(null);
        this.gamePlayers = [];
        this._players = [];
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
        this.waitTimer = null;
        this.experience = false;
        this.max_uid = '';
        this.backendServerId = pinus_1.pinus.app.getServerId();
        this.entryCond = opts.entryCond || 0;
        this.lowBet = opts.lowBet || 100;
        this.capBet = opts.capBet || 2000;
        this.betNum = this.lowBet;
        this.controlLogic = new ControlImpl_1.default({ room: this });
        this.status = 'INWAIT';
        this.updateRoundId();
    }
    close() {
        this.sendRoomCloseMessage();
    }
    async Initialization() {
        this.battle_kickNoOnline();
        await utils.delay(3500);
        this.curr_doing_seat = -1;
        this.roundTimes = 1;
        this.currSumBet = 0;
        this.lastFahuaTime = 0;
        this.tableJettons = [];
        this.record_history = { max_uid: "", info: [], oper: [] };
        this.gamePlayers = [];
        this._players = [];
        this.status = 'INWAIT';
        this.max_uid = '';
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
        this.players[i] = new jhPlayer_1.default(this, i, dbplayer);
        this._players = this.players.slice();
        this.addMessage(dbplayer);
        this.wait();
        return true;
    }
    leave(playerInfo, isOffLine) {
        this.kickOutMessage(playerInfo.uid);
        do {
            if (isOffLine) {
                playerInfo.onLine = false;
                return;
            }
            this.players[playerInfo.seat] = null;
            if (this.status == "INWAIT") {
                this.channelIsPlayer('ZJH_onExit', {
                    kickPlayers: [playerInfo.kickStrip()],
                });
                this._players = this.players.slice();
            }
            break;
        } while (0);
        GoldenFlowerMgr_1.default.removePlayerSeat(playerInfo.uid);
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
    wait(playerInfo) {
        if (this.status != 'INWAIT')
            return;
        if (this.players.filter(pl => pl).length <= 1) {
            this.channelIsPlayer('ZJH_onWait', { waitTime: 0 });
            return;
        }
        this.channelIsPlayer('ZJH_onWait', { waitTime: WAIT_TIME });
        this.lastWaitTime = Date.now();
        clearTimeout(this.waitTimer);
        this.waitTimer = setTimeout(() => {
            const list = this.players.filter(pl => pl);
            if (list.length >= 2) {
                this.handler_start(list);
            }
            else {
                this.channelIsPlayer('ZJH_onWait', { waitTime: 0 });
            }
        }, WAIT_TIME);
    }
    async handler_start(list) {
        this.status = 'INGAME';
        this.gamePlayers = list;
        this.gamePlayers.forEach(pl => pl.status = 'GAME');
        this._players = this.players.slice();
        this.startTime = Date.now();
        this.gamePlayers.sort(() => 0.5 - Math.random());
        await this.controlLogic.runControl(this.gamePlayers);
        this.zipResult = (0, recordUtil_1.buildRecordResult)(this._players);
        for (const pl of this.gamePlayers) {
            this.addSumBet(pl, this.lowBet, "deal");
        }
        this.randomSeed = Date.now();
        this.channelIsPlayer('ZJH_onDeal', {
            currSumBet: this.currSumBet,
            randomSeed: this.randomSeed,
            players: this.gamePlayers.map(pl => pl.wrapGame()),
            canBipai: false,
        });
        this.zhuang_seat = this._players.findIndex(m => m && m.status == 'GAME');
        this.curr_doing_seat = this.zhuang_seat;
        await utils.delay(this.gamePlayers.length * 500 + 200);
        this.set_next_doing_seat(this.nextFahuaIdx());
        return Promise.resolve();
    }
    set_next_doing_seat(doing) {
        const playerInfo = this._players[doing];
        this.curr_doing_seat = doing;
        playerInfo.state = "PS_OPER";
        this.lastFahuaTime = Date.now();
        for (const pl of this.gamePlayers) {
            const member = pl && this.channel.getMember(pl.uid);
            const opts = this.stripSpeak(pl);
            if (pl.isRobot == RoleEnum_1.RoleEnum.ROBOT) {
                opts['max_uid'] = this.max_uid;
            }
            member && MessageService.pushMessageByUids('ZJH_onFahua', opts, member);
        }
        if (this.zhuang_seat == doing) {
            this.roundTimes++;
        }
        this.handler_pass();
    }
    stripSpeak(playerInfo) {
        this.isRobotData = playerInfo.isRobot == 2 ? playerInfo.stripRobot() : null;
        let allin = false;
        const num = playerInfo.holdStatus == 1 ? this.betNum * 2 : this.betNum;
        if (playerInfo.gold <= num) {
            allin = true;
        }
        const opts = {
            fahuaIdx: this.curr_doing_seat,
            betNum: this.betNum,
            totalBet: playerInfo.totalBet,
            roundTimes: this.roundTimes,
            canBipai: this.get_canBipai(),
            canKanpai: this.get_canKanpai(),
            fahuaTime: FAHUA_TIME - (Date.now() - this.lastFahuaTime),
            member_num: this.gamePlayers.filter(m => m && m.status == 'GAME').length,
            zhuangIdx: this.zhuang_seat,
            allin: allin,
            currSumBet: this.currSumBet,
            isRobotData: playerInfo.isRobot == 2 ? this.isRobotData : null
        };
        return opts;
    }
    get_canBipai() {
        return this.betNum >= this.lowBet && this.roundTimes >= 2;
    }
    get_canKanpai() {
        return this.roundTimes >= 2 ? true : false;
    }
    async handler_bipai(Launch_pl, accept_pl, num) {
        clearTimeout(this.Oper_timeout);
        Launch_pl.totalBet += num;
        Launch_pl.gold -= num;
        Launch_pl.state = "PS_NONE";
        this.addSumBet(Launch_pl, num, "bipai");
        this.record_history.oper.push({ uid: Launch_pl.uid, oper_type: "bipai", update_time: utils.cDate(), msg: { Launch_pl: Launch_pl.uid, accept_pl: accept_pl.uid, num } });
        let ret = GoldenFlower_logic.bipaiSole(Launch_pl, accept_pl);
        const winner = ret > 0 ? Launch_pl : accept_pl;
        const failer = ret > 0 ? accept_pl : Launch_pl;
        failer.status = 'WAIT';
        failer.holdStatus = 3;
        (this.zhuang_seat == failer.seat) && this.resetZhuang();
        failer.settlement(this);
        this.channelIsPlayer('ZJH_onOpts', {
            type: 'bipai',
            seat: Launch_pl.seat,
            gold: Launch_pl.gold,
            betNum: num,
            totalBet: Launch_pl.totalBet,
            sumBet: this.currSumBet,
            iswin: winner.uid === Launch_pl.uid,
            other: accept_pl.seat,
        });
        await utils.delay(3500);
        this.checkHasNextPlayer(Launch_pl.seat);
    }
    async handler_complete(list, auto = false) {
        this.status = "END";
        clearTimeout(this.Oper_timeout);
        if (auto) {
            const gamePlayers = this._players.filter(pl => pl && pl.status == 'GAME');
            let winner_list = [gamePlayers[0]];
            for (const pl of gamePlayers) {
                if (pl.uid == winner_list[0].uid)
                    continue;
                let ret = GoldenFlower_logic.bipaiSole(winner_list[0], pl);
                if (ret == -1) {
                    winner_list = [pl];
                }
                else if (ret == 0) {
                    winner_list.push(pl);
                }
            }
            for (const pl of gamePlayers) {
                if (!winner_list.some(c => c.uid == pl.uid)) {
                    await pl.settlement(this);
                }
            }
            list = winner_list;
        }
        const tmp_winNum = this.currSumBet / list.length;
        for (let pl of list) {
            if (!pl)
                continue;
            const practicalWinNum = tmp_winNum;
            pl.profit = practicalWinNum;
            await pl.settlement(this);
            if (Math.floor((practicalWinNum - pl.totalBet) / this.lowBet) > 500) {
                MessageService.sendBigWinNotice(this.nid, pl.nickname, practicalWinNum, pl.isRobot, pl.headurl);
            }
        }
        await utils.delay(800);
        let opts = {
            auto,
            winner: list.map(c => {
                return {
                    uid: c.uid,
                    seat: c.seat,
                    profit: c.profit
                };
            }),
            list: this.gamePlayers.filter(pl => !!pl).map(m => !!m && m.wrapSettlement())
        };
        this.channelIsPlayer('ZJH_onSettlement', opts);
        this.record_history.info = this.gamePlayers.filter(pl => !!pl).map(pl => pl.Record_strip());
        for (const pl of this.gamePlayers) {
            pl && await pl.only_update_game(this);
        }
        this.Initialization();
    }
    checkHasNextPlayer(doing) {
        if (this.status == "END")
            return;
        if (this.roundTimes >= this.maxRound) {
            return this.handler_complete(null, true);
        }
        const list = this.gamePlayers.filter(pl => pl && pl.status == 'GAME');
        if (list.length <= 1) {
            this.handler_complete([list[0]]);
        }
        else {
            this.set_next_doing_seat(this.nextFahuaIdx());
        }
    }
    handler_pass() {
        clearTimeout(this.Oper_timeout);
        let fn = () => {
            let oper_type = 0;
            let playerInfo = this._players[this.curr_doing_seat];
            do {
                if (playerInfo.auto_genzhu) {
                    if (playerInfo.onLine) {
                        oper_type = 1;
                        break;
                    }
                    if (!playerInfo.auto_no_Fold) {
                        oper_type = 1;
                        break;
                    }
                }
                if (playerInfo.auto_no_Fold) {
                    if (this.roundTimes == 1) {
                        oper_type = 1;
                        break;
                    }
                    if (this.roundTimes == 2 || this.roundTimes == 3) {
                        if (playerInfo.holdStatus == 1) {
                            if (playerInfo.cardType >= 2) {
                                oper_type = 1;
                                break;
                            }
                        }
                        oper_type = 0;
                        break;
                    }
                    if (playerInfo.holdStatus == 1) {
                        if (playerInfo.cardType >= 2) {
                            oper_type = 2;
                            break;
                        }
                    }
                }
                break;
            } while (0);
            const num = playerInfo.holdStatus === 1 ? this.betNum * 2 : this.betNum;
            if (playerInfo.gold <= num &&
                (oper_type == 1 || oper_type == 2)) {
                oper_type = 3;
            }
            switch (oper_type) {
                case 0:
                    playerInfo.handler_fold(this);
                    break;
                case 1:
                    let betNum = playerInfo.holdStatus === 1 ? this.betNum * 2 : this.betNum;
                    playerInfo.handler_cingl(this, betNum);
                    break;
                case 2:
                    const list = this.gamePlayers.filter(pl => pl && pl.status == 'GAME' && pl.uid !== playerInfo.uid);
                    if (list.length >= 1) {
                        this.handler_bipai(playerInfo, list[0], num);
                    }
                    break;
                case 3:
                    let ret = playerInfo.handler_Allfighting(this);
                    break;
                default:
                    break;
            }
        };
        let ms = this.getWaitTime() < KANPAI_TIME ? KANPAI_TIME : FAHUA_TIME;
        let playerInfo = this._players[this.curr_doing_seat];
        if (playerInfo.auto_genzhu) {
            ms = 1000;
        }
        this.Oper_timeout = setTimeout(() => {
            fn();
        }, ms);
        return ms;
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
            next = next <= -1 ? len - 1 : next;
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
            canBipai: this.get_canBipai(),
            canKanpai: this.get_canKanpai(),
        };
    }
    battle_kickNoOnline() {
        const offLinePlayers = [];
        for (const pl of this.players) {
            if (!pl)
                continue;
            if (!pl.onLine)
                GoldenFlowerMgr_1.default.removePlayer(pl);
            offLinePlayers.push(pl);
            this.kickOutMessage(pl.uid);
            GoldenFlowerMgr_1.default.removePlayerSeat(pl.uid);
            this.players[pl.seat] = null;
        }
        for (const pl of offLinePlayers) {
            this.players[pl.seat] = null;
        }
        this.kickingPlayer(pinus_1.pinus.app.getServerId(), offLinePlayers);
    }
    generateCards(len, control) {
        const poker = GoldenFlower_logic.randomPoker();
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
        GoldenFlower_logic.sortResult(cards);
        cards = cards.slice(0, len);
        cards.sort((a, b) => Math.random() - 0.5);
        return cards;
    }
    setPlayerCard(playerInfo, cards) {
        const cardType = GoldenFlower_logic.getCardType(cards);
        playerInfo.initGame(this, cards, cardType, this.lowBet);
    }
    static getTypeCards(poker, type) {
        switch (type) {
            case '5': return GoldenFlower_logic.getBZ(poker);
            case '4': return GoldenFlower_logic.getTHS(poker);
            case '3': return GoldenFlower_logic.getTH(poker);
            case '2': return GoldenFlower_logic.getSZ(poker);
            case '1': return GoldenFlower_logic.getDZ(poker);
            case '0': return GoldenFlower_logic.getS(poker);
            default:
                throw new Error(`非法牌型 ${type}`);
        }
    }
    randomDeal(list) {
        const cards = this.generateCards(list.length, false);
        let indexSet = new Set();
        while (indexSet.size !== list.length) {
            indexSet.add(GoldenFlower_logic.random(0, list.length));
        }
        [...indexSet].forEach(index => this.setPlayerCard(list[index], cards.shift()));
    }
    personalControlDeal(gamePlayers, positivePlayers, negativePlayers) {
        const cards = this.generateCards(gamePlayers.length, true);
        positivePlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        negativePlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        GoldenFlower_logic.sortResult(cards);
        const robotPlayers = gamePlayers.filter(p => p.isRobot === 2);
        let luckPlayer;
        if (positivePlayers.length) {
            const p = positivePlayers[GoldenFlower_logic.random(0, positivePlayers.length)];
            luckPlayer = gamePlayers.find(pl => pl.uid === p.uid);
        }
        else {
            luckPlayer = robotPlayers[GoldenFlower_logic.random(0, robotPlayers.length)];
        }
        this.max_uid = luckPlayer.uid;
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
            indexSet.add(GoldenFlower_logic.random(0, gamePlayers.length));
        }
        [...indexSet].forEach(index => this.setPlayerCard(gamePlayers[index], cards.shift()));
    }
    sceneControlDeal(sceneControlState, gamePlayers, isPlatformControl) {
        if (sceneControlState === constants_1.ControlState.NONE) {
            return this.randomDeal(gamePlayers);
        }
        const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        gamePlayers.forEach(p => p.setControlType(type));
        let cards = this.generateCards(gamePlayers.length, sceneControlState === constants_1.ControlState.SYSTEM_WIN);
        GoldenFlower_logic.sortResult(cards);
        const luckPlayer = gamePlayers.filter(p => {
            return sceneControlState === constants_1.ControlState.SYSTEM_WIN ? p.isRobot === RoleEnum_1.RoleEnum.ROBOT : p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER;
        }).sort((a, b) => Math.random() - 0.5)[0];
        this.setPlayerCard(luckPlayer, cards.shift());
        this.max_uid = luckPlayer.uid;
        gamePlayers.filter(p => p.uid !== luckPlayer.uid).sort(p => Math.random() - 0.5).map(p => {
            cards.sort((a, b) => Math.random() - 0.5);
            this.setPlayerCard(p, cards.shift());
        });
    }
}
exports.default = jhRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamhSb29tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvR29sZGVuRmxvd2VyL2xpYi9qaFJvb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLGlDQUE4QjtBQUM5QiwyREFBMkQ7QUFDM0QseUNBQWtDO0FBQ2xDLHVFQUFvRTtBQUNwRSwrQ0FBeUM7QUFDekMsK0NBQXdDO0FBQ3hDLGtEQUFzRDtBQUV0RCxzRUFBb0Y7QUFDcEYsdUVBQW9FO0FBQ3BFLDBDQUF3QztBQUN4QyxtRUFBb0U7QUFDcEUsOENBQStDO0FBQy9DLHlEQUEwRDtBQUMxRCw0REFBa0U7QUFFbEUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBRXZCLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQztBQUV6QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFTekIsTUFBcUIsTUFBTyxTQUFRLHVCQUFvQjtJQW1EcEQsWUFBWSxJQUFJO1FBQ1osS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBNUNmLGFBQVEsR0FBVyxFQUFFLENBQUM7UUFFdEIsV0FBTSxHQUF5QyxNQUFNLENBQUM7UUFFdEQsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUV2QixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBTXZCLG9CQUFlLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFN0IsaUJBQVksR0FBVyxDQUFDLENBQUM7UUFFekIsa0JBQWEsR0FBVyxDQUFDLENBQUM7UUFFMUIsaUJBQVksR0FBMEYsRUFBRSxDQUFDO1FBRXpHLG1CQUFjLEdBQW9CLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUd0RSxpQkFBWSxHQUFpQixJQUFJLENBQUM7UUFDbEMscUJBQWdCLEdBQUcsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUM7UUFDdEQsNkJBQXdCLEdBQUcs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