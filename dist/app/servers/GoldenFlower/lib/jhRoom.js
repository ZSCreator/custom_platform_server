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
const WAIT_TIME = 2000;
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
            const list = this.players.filter(pl => pl && pl.status == jhPlayer_1.PlayerStatus.WAIT);
            if (list.length >= 2) {
                this.handler_start(list);
            }
            else {
                this.channelIsPlayer('ZJH_onWait', { waitTime: 0 });
            }
        }, WAIT_TIME);
    }
    ready(playerInfo, option) {
        if (option) {
            playerInfo.setStatus(jhPlayer_1.PlayerStatus.WAIT);
        }
        else {
            playerInfo.setStatus(jhPlayer_1.PlayerStatus.NONE);
        }
        this.channelIsPlayer('ZJH_onReady', {
            seat: playerInfo.seat,
            uid: playerInfo.uid,
            status: playerInfo.status,
        });
        if (option) {
            this.wait(playerInfo);
        }
    }
    async handler_start(list) {
        this.status = 'INGAME';
        this.gamePlayers = list;
        this.gamePlayers.forEach(pl => pl.setStatus(jhPlayer_1.PlayerStatus.GAME));
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
        playerInfo.setState(jhPlayer_1.PlayerState.PS_OPER);
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
        Launch_pl.setState(jhPlayer_1.PlayerState.PS_NONE);
        this.addSumBet(Launch_pl, num, "bipai");
        this.record_history.oper.push({ uid: Launch_pl.uid, oper_type: "bipai", update_time: utils.cDate(), msg: { Launch_pl: Launch_pl.uid, accept_pl: accept_pl.uid, num } });
        let ret = GoldenFlower_logic.bipaiSole(Launch_pl, accept_pl);
        const winner = ret > 0 ? Launch_pl : accept_pl;
        const failer = ret > 0 ? accept_pl : Launch_pl;
        failer.setStatus(jhPlayer_1.PlayerStatus.WAIT);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamhSb29tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvR29sZGVuRmxvd2VyL2xpYi9qaFJvb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLGlDQUE4QjtBQUM5QiwyREFBMkQ7QUFDM0QseUNBQWlFO0FBQ2pFLHVFQUFvRTtBQUNwRSwrQ0FBeUM7QUFDekMsK0NBQXdDO0FBQ3hDLGtEQUFzRDtBQUV0RCxzRUFBb0Y7QUFDcEYsdUVBQW9FO0FBQ3BFLDBDQUF3QztBQUN4QyxtRUFBb0U7QUFDcEUsOENBQStDO0FBQy9DLHlEQUEwRDtBQUMxRCw0REFBa0U7QUFFbEUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBRXZCLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQztBQUV6QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFTekIsTUFBcUIsTUFBTyxTQUFRLHVCQUFvQjtJQW1EcEQsWUFBWSxJQUFJO1FBQ1osS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBNUNmLGFBQVEsR0FBVyxFQUFFLENBQUM7UUFFdEIsV0FBTSxHQUF5QyxNQUFNLENBQUM7UUFFdEQsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUV2QixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBTXZCLG9CQUFlLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFN0IsaUJBQVksR0FBVyxDQUFDLENBQUM7UUFFekIsa0JBQWEsR0FBVyxDQUFDLENBQUM7UUFFMUIsaUJBQVksR0FBMEYsRUFBRSxDQUFDO1FBRXpHLG1CQUFjLEdBQW9CLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUd0RSxpQkFBWSxHQUFpQixJQUFJLENBQUM7UUFDbEMscUJBQWdCLEdBQUcsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUM7UUFDdEQsNkJBQXdCLEdBQUcs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