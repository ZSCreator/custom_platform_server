"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const FCSPlayer_1 = require("./FCSPlayer");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const FCSConst = require("./FCSConst");
const constants_1 = require("../../../services/newControl/constants");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const control_1 = require("./control");
const utils = require("../../../utils/index");
const FCS_logic = require("./FCS_logic");
const MessageService = require("../../../services/MessageService");
const FCSRoomMgr_1 = require("../lib/FCSRoomMgr");
const FCS_logic_1 = require("./FCS_logic");
const utils_1 = require("../../../utils");
const WAIT_TIME = 5000;
const NEXT_DOING_TIME = 15000;
class FCSRoom extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.status = 'NONE';
        this.pool_List = [];
        this.TheCards = [];
        this.roundTimes = 0;
        this.roomCurrSumBet = 0;
        this.lastBetNum = 0;
        this.curr_doing_seat = -1;
        this.zhuang_seat = -1;
        this.currWaitTime = 0;
        this.action_Timeout = null;
        this.players = new Array(5).fill(null);
        this.zipResult = '';
        this.gamePlayers = [];
        this.min_ply_gold = 0;
        this._players = [];
        this.maxUid = null;
        this.canCarryGold = opts.canCarryGold;
        this.lowBet = opts.lowBet;
        this.control = new control_1.default({ room: this });
        this.Initialization();
    }
    close() {
        this.sendRoomCloseMessage();
        this.players = [];
    }
    Initialization() {
        clearTimeout(this.dissolve);
        this.record_history = {
            drawBefore: [],
            draw: [],
            turnPoker: [],
            riverPoker: [],
            info: []
        };
        this.min_ply_gold = 0;
        this.battle_kickNoOnline();
        this.record_history = {
            drawBefore: [],
            draw: [],
            turnPoker: [],
            riverPoker: [],
            info: []
        };
        this.status = 'INWAIT';
        this.curr_doing_seat = -1;
        this.roundTimes = 0;
        this.roomCurrSumBet = 0;
        this.lastBetNum = 0;
        this.currWaitTime = 0;
        this.gamePlayers = [];
        this.pool_List = [];
        this.maxUid = null;
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
        this.players[i] = new FCSPlayer_1.default(i, dbplayer, this.sceneId);
        this._players = this.players.slice();
        this.addMessage(dbplayer);
        this.channelIsPlayer('FiveCardStud.onEntry', {
            player: this._players[i].strip(),
            status: this.status,
            waitTime: this.getWaitTime()
        });
        return true;
    }
    exit(playerInfo, isExit) {
        this.kickOutMessage(playerInfo.uid);
        if (isExit) {
            playerInfo.onLine = false;
            return;
        }
        this.players[playerInfo.seat] = null;
        if (this.status == "INWAIT") {
            this._players = this.players.slice();
            this.channelIsPlayer('FiveCardStud.onExit', { uid: playerInfo.uid, seat: playerInfo.seat });
        }
        FCSRoomMgr_1.default.removePlayerSeat(playerInfo.uid);
    }
    getWaitTime() {
        if (this.status == 'INWAIT')
            return Math.max(WAIT_TIME - (Date.now() - this.currWaitTime), 0);
        if (this.status == 'INGAME')
            return Math.max(NEXT_DOING_TIME - (Date.now() - this.lastFahuaTime), 0);
        return 0;
    }
    nextIdx(seat) {
        let count = seat, len = this._players.length;
        do {
            (count >= len) && (count = 0);
            const pl = this._players[count];
            if (pl && pl.status == "GAME" && !pl.isFold && pl.canUserGold() > 0) {
                return count;
            }
            count++;
        } while (true);
    }
    async wait(playerInfo) {
        if (this.status == 'NONE' || this.status == 'INWAIT') {
            if (this._players.filter(pl => pl && pl.canUserGold() >= this.canCarryGold[0]).length <= 1) {
                this.channelIsPlayer(`FiveCardStud.onWait`, { waitTime: 0, roomId: this.roomId });
                return;
            }
            if (Date.now() - this.currWaitTime < WAIT_TIME) {
                const member = playerInfo && this.channel.getMember(playerInfo.uid);
                if (member) {
                    let waitTime = Math.max(WAIT_TIME - (Date.now() - this.currWaitTime), 0);
                    MessageService.pushMessageByUids(`FiveCardStud.onWait`, { waitTime }, member);
                }
                return;
            }
            this.currWaitTime = Date.now();
            this.channelIsPlayer('FiveCardStud.onWait', { waitTime: WAIT_TIME, roomId: this.roomId });
            clearTimeout(this.action_Timeout);
            this.action_Timeout = setTimeout(() => {
                const list = this._players.filter(pl => pl && pl.canUserGold() >= this.canCarryGold[0]);
                if (list.length >= 2) {
                    this.deal_step_1(list);
                }
                else {
                    this.channelIsPlayer('FiveCardStud.onWait', { waitTime: 0, roomId: this.roomId });
                }
            }, WAIT_TIME);
        }
    }
    async deal_step_1(list) {
        this.status = 'INGAME';
        this.startTime = Date.now();
        this.gamePlayers = list;
        this.gamePlayers.forEach(pl => pl && (pl.status = "GAME"));
        this.TheCards = FCS_logic.getPai();
        this.gamePlayers.sort((pl1, pl2) => pl1.canUserGold() - pl2.canUserGold());
        this.min_ply_gold = this.gamePlayers[0].canUserGold();
        this.min_ply_gold = Math.floor(this.min_ply_gold / 400) * 100;
        await this.control.runControl();
        for (const pl of list) {
            let card = this.TheCards.splice(utils.random(0, this.TheCards.length - 3), 2);
            pl.execBet(this, this.lowBet);
        }
        this.partPool();
        this.zhuang_seat = this.getMaxPkerPl();
        let zj_pl = this._players.find(pl => pl && pl.seat == this.zhuang_seat);
        for (const pl of this._players) {
            const member = pl && this.channel.getMember(pl.uid);
            if (member) {
                const opts = {
                    zhuang: { seat: zj_pl.seat, uid: zj_pl.uid },
                    roomCurrSumBet: this.roomCurrSumBet,
                    players: list.map(c => c.toGame(pl.uid, 2)),
                };
                MessageService.pushMessageByUids(`FiveCardStud.onDeal`, opts, member);
            }
        }
        this._players.forEach(pl => pl && pl.resetBet());
        this.lastBetNum = 0;
        await utils.delay(1000);
        this.set_next_doing_seat(this.zhuang_seat);
    }
    set_next_doing_seat(doing) {
        let playerInfo = this._players[doing];
        playerInfo.state = "PS_OPER";
        this.lastFahuaTime = Date.now();
        this.curr_doing_seat = doing;
        for (const pl of this._players.filter(c => !!c)) {
            const member = pl && this.channel.getMember(pl.uid);
            const opts = this.stripSpeak(playerInfo);
            if (pl.isRobot == RoleEnum_1.RoleEnum.ROBOT) {
                opts['maxUid'] = this.maxUid;
            }
            member && MessageService.pushMessageByUids('FiveCardStud.msg_oper_c', opts, member);
        }
        this.action_Timeout = setTimeout(() => {
            if (this.lastBetNum == 0) {
                playerInfo.handler_play(this, 'pass', 0);
            }
            else {
                playerInfo.handler_fold(this);
            }
        }, NEXT_DOING_TIME + 1000);
    }
    stripSpeak(playerInfo) {
        const cinglNum = this.lastBetNum - playerInfo.bet;
        this.freedomBet = [cinglNum, this.min_ply_gold - playerInfo.bet];
        const opts = {
            curr_doing_seat: this.curr_doing_seat,
            roundTimes: this.roundTimes,
            currGold: playerInfo.canUserGold(),
            freedomBet: this.freedomBet,
            cinglNum: cinglNum,
            aoto_time: NEXT_DOING_TIME - (Date.now() - this.lastFahuaTime),
            recommendBet: [Math.floor(this.roomCurrSumBet / 300) * 100, Math.floor(this.roomCurrSumBet * 2 / 300) * 100, this.roomCurrSumBet],
        };
        opts["bet"] = playerInfo.bet;
        opts["min_ply_gold"] = this.min_ply_gold;
        return opts;
    }
    async nextStatus() {
        this.auto_dissolve_room();
        const list = this._players.filter(pl => pl && !pl.isFold && pl.status == 'GAME');
        const isPoker = list.every(pl => pl.canDeal(this.lastBetNum));
        if (isPoker && list.filter(pl => pl.canUserGold() > 0).length <= 1) {
            this.partPool();
            return this.public_deal3();
        }
        if (isPoker) {
            this.partPool();
            this.public_deal2();
            return;
        }
        let next_id = this.nextIdx(this.curr_doing_seat + 1);
        this.set_next_doing_seat(next_id);
    }
    auto_dissolve_room() {
        clearTimeout(this.dissolve);
        this.dissolve = setTimeout(() => {
            console.warn("超过60s没有操作，房间卡死");
        }, 60 * 1000);
    }
    public_deal1() {
        this._players.forEach(pl => pl && pl.resetBet());
        this.lastBetNum = 0;
        for (const pl of this._players) {
            if (!pl || pl.isFold)
                continue;
            pl.holds.push(pl.TheCards.shift());
        }
        this.roundTimes++;
        for (const pl of this._players) {
            const member = pl && this.channel.getMember(pl.uid);
            if (member) {
                const opts = {
                    roundTimes: this.roundTimes,
                    players: this._players.map(c => c && c.toGame(pl.uid, this.roundTimes + 2)),
                };
                MessageService.pushMessageByUids(`FiveCardStud.onDeal2`, opts, member);
            }
        }
        const gamePlayers = this._players.filter(pl => pl && pl.status == "GAME").sort((pl1, pl2) => pl1.canUserGold() - pl2.canUserGold());
        this.min_ply_gold = gamePlayers[0].canUserGold();
        if (this.roundTimes == 1) {
            this.min_ply_gold = Math.floor(this.min_ply_gold / 2);
        }
        this.min_ply_gold = Math.floor(this.min_ply_gold / 100) * 100;
    }
    public_deal2() {
        if (this.roundTimes >= 3) {
            return this.settlement();
        }
        this.public_deal1();
        setTimeout(() => {
            this.curr_doing_seat = this.getMaxPkerPl() - 1;
            let next_id = this.nextIdx(this.curr_doing_seat + 1);
            this.set_next_doing_seat(next_id);
        }, 2000);
    }
    public_deal3() {
        if (this.roundTimes >= 3) {
            return this.settlement();
        }
        this.public_deal1();
        setTimeout(() => this.public_deal3(), 2000);
    }
    recordDrawBefore(playerInfo, bet, type) {
        let ob = {
            uid: playerInfo.uid,
            nickname: playerInfo.nickname,
            bet: bet,
            type: type,
            profit: playerInfo.profit
        };
        if (this.roundTimes == 0) {
            this.record_history.drawBefore.push(ob);
        }
        else if (this.roundTimes == 1) {
            this.record_history.draw.push(ob);
        }
        else if (this.roundTimes == 2) {
            this.record_history.turnPoker.push(ob);
        }
        else if (this.roundTimes == 3) {
            this.record_history.riverPoker.push(ob);
        }
    }
    recordResult() {
        this.record_history.info = this._players.map(pl => {
            if (pl)
                return {
                    tatalBet: pl.tatalBet,
                    profit: pl.profit,
                    holds: pl.holds,
                    cardType: pl.cardType,
                    nickname: pl.nickname,
                    uid: pl.uid,
                    isFold: pl.isFold
                };
        });
    }
    async settlement() {
        let list = this._players.filter(pl => pl && pl.status == 'GAME');
        this.status = 'END';
        this.countAlikePoker(list);
        this._players.some(pl => pl && pl.isRobot == 0) && console.warn(this.roundId, this.roomId);
        this.poolSettlement(list);
        for (const pl of list) {
            pl && await pl.addMilitary(this);
        }
        this.recordResult();
        for (const pl of this._players) {
            pl && await pl.only_update_game(this);
        }
        await utils.delay(800);
        const opts = {
            list: this._players.filter(c => !!c).map(pl => pl && pl.result(this))
        };
        this.channelIsPlayer('FiveCardStud.onSettlement', opts);
        await utils.delay(800);
        this.Initialization();
    }
    battle_kickNoOnline() {
        const offLinePlayers = [];
        for (const pl of this.players) {
            if (!pl)
                continue;
            if (!pl.onLine)
                FCSRoomMgr_1.default.removePlayer(pl);
            offLinePlayers.push(pl);
            this.kickOutMessage(pl.uid);
            this.players[pl.seat] = null;
            FCSRoomMgr_1.default.removePlayerSeat(pl.uid);
        }
        this.kickingPlayer(pinus_1.pinus.app.getServerId(), offLinePlayers);
    }
    countAlikePoker(list) {
        for (const pl of list) {
            if (pl.isFold) {
                pl.typeSize = -1;
            }
            if (!pl.isFold) {
                let cards = (pl.holds.length != 0 && pl.holds) ? pl.holds : null;
                if (cards) {
                    pl.cardType.type = FCS_logic.GetCardType(pl.holds.slice());
                    pl.cardType.cards = pl.holds.slice();
                    pl.typeSize = FCS_logic.sortPokerToType(pl.holds.slice());
                }
            }
        }
    }
    getMaxPkerPl() {
        let seat = -1;
        let _typeSize = -1;
        let TheCards = FCS_logic.getPai();
        for (const pl of this._players) {
            if (!pl)
                continue;
            for (const card of pl.holds) {
                for (let index = 1; index < TheCards.length; index++) {
                    if (TheCards[index] == card) {
                        TheCards[index] = null;
                        break;
                    }
                }
            }
        }
        TheCards = TheCards.filter(c => !!c);
        for (const pl of this._players) {
            if (!pl || pl.isFold)
                continue;
            pl._typeSize = FCS_logic.sortPokerToType(pl.holds.slice(1, 5));
            if (pl.holds.length == 5) {
                pl._typeSize = FCS_logic.maybe_sortPokerToType(TheCards, pl.holds.slice(1, 5));
            }
            if (pl._typeSize > _typeSize) {
                _typeSize = pl._typeSize;
                seat = pl.seat;
            }
        }
        return seat;
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
        console.log('当前底池', this.roomId, this.pool_List.map(m => {
            return { bet: m.bet, uids: JSON.stringify(m.uids) };
        }));
    }
    poolSettlement(list) {
        for (const pool of this.pool_List) {
            let uids = pool.uids.sort((c1, c2) => {
                let pl1 = this.getPlayer(c1.uid);
                c1.typeSize = (pl1 && !pl1.isFold) ? pl1.typeSize : 0;
                let pl2 = this.getPlayer(c2.uid);
                c2.typeSize = (pl2 && !pl2.isFold) ? pl2.typeSize : 0;
                return c2.typeSize - c1.typeSize;
            });
            let pls = uids.filter(c => c.typeSize == uids[0].typeSize);
            for (const pl of pls) {
                let playerInfo = this.getPlayer(pl.uid);
                playerInfo.profit += Math.floor(pool.bet / pls.length);
            }
        }
    }
    addNote(player, num) {
        if (num >= FCSConst.FAN_JIANG * this.lowBet) {
            MessageService.sendBigWinNotice(this.nid, player.nickname, num, player.isRobot, player.headurl);
        }
    }
    randomDeal() {
        const cards = [], tc = this.TheCards;
        for (let i = 0, len = this.gamePlayers.length; i < len; i++) {
            const c = [];
            for (let j = 0; j < 5; j++) {
                c.push(tc.splice((0, utils_1.random)(0, tc.length - 1), 1)[0]);
            }
            cards.push(c);
        }
        this.gamePlayers.forEach(player => {
            cards.sort((x, y) => Math.random() - 0.5);
            player.initGame(cards.shift());
        });
    }
    personalControlDeal(positivePlayers, negativePlayers) {
        positivePlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        negativePlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        let gamePlayers = this.gamePlayers;
        const controlPlayersCount = positivePlayers.length + negativePlayers.length + 1;
        const cards = (0, FCS_logic_1.getControlCards)(gamePlayers.length, controlPlayersCount, this.TheCards);
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
        luckPlayer.initGame(cards.shift());
        this.maxUid = luckPlayer.uid;
        gamePlayers = gamePlayers.filter(player => player.uid !== luckPlayer.uid);
        if (negativePlayers.length) {
            negativePlayers.sort((a, b) => Math.random() - 0.5);
            negativePlayers.forEach(p => {
                const pl = gamePlayers.find(player => player.uid === p.uid);
                pl.initGame(cards.shift());
                gamePlayers = gamePlayers.filter(player => player.uid !== p.uid);
            });
        }
        gamePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
            cards.sort((a, b) => Math.random() - 0.5);
            p.initGame(cards.pop());
        });
    }
    sceneControlDeal(sceneControlState, isPlatformControl) {
        if (sceneControlState === constants_1.ControlState.NONE) {
            return this.randomDeal();
        }
        const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        this.gamePlayers.forEach(p => p.setControlType(type));
        let gamePlayers = this.gamePlayers;
        const winnerType = sceneControlState === constants_1.ControlState.SYSTEM_WIN ? RoleEnum_1.RoleEnum.ROBOT : RoleEnum_1.RoleEnum.REAL_PLAYER;
        const possibleWinPlayers = gamePlayers.filter(p => p.isRobot === winnerType);
        const lossPlayers = gamePlayers.filter(p => p.isRobot !== winnerType);
        possibleWinPlayers.sort((a, b) => Math.random() - 0.5);
        const controlPlayersCount = lossPlayers.length + 1;
        const cards = (0, FCS_logic_1.getControlCards)(gamePlayers.length, controlPlayersCount, this.TheCards);
        const winPlayer = possibleWinPlayers.shift();
        winPlayer.initGame(cards.shift());
        this.maxUid = winPlayer.uid;
        gamePlayers = gamePlayers.filter(p => p.uid !== winPlayer.uid);
        lossPlayers.sort((a, b) => Math.random() - 0.5);
        lossPlayers.forEach(p => {
            p.initGame(cards.shift());
            gamePlayers = gamePlayers.filter(player => player.uid !== p.uid);
        });
        gamePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
            cards.sort((a, b) => Math.random() - 0.5);
            p.initGame(cards.shift());
        });
    }
}
exports.default = FCSRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRkNTUm9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0ZpdmVDYXJkU3R1ZC9saWIvRkNTUm9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUE4QjtBQUM5QiwyQ0FBb0M7QUFDcEMsdUVBQW9FO0FBQ3BFLHVDQUF1QztBQUV2QyxzRUFBb0Y7QUFDcEYsdUVBQW9FO0FBQ3BFLHVDQUFvQztBQUNwQyw4Q0FBK0M7QUFDL0MseUNBQTBDO0FBQzFDLG1FQUFvRTtBQUNwRSxrREFBNkQ7QUFFN0QsMkNBQThDO0FBQzlDLDBDQUF3QztBQUl4QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFFdkIsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDO0FBVTlCLE1BQXFCLE9BQVEsU0FBUSx1QkFBcUI7SUF1RHRELFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7UUF0RGYsV0FBTSxHQUF5QyxNQUFNLENBQUM7UUFJdEQsY0FBUyxHQUE4QixFQUFFLENBQUM7UUFFMUMsYUFBUSxHQUFhLEVBQUUsQ0FBQztRQUV4QixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBRXZCLG1CQUFjLEdBQVcsQ0FBQyxDQUFDO1FBRTNCLGVBQVUsR0FBVyxDQUFDLENBQUM7UUFFdkIsb0JBQWUsR0FBVyxDQUFDLENBQUMsQ0FBQztRQUU3QixnQkFBVyxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBRXpCLGlCQUFZLEdBQVcsQ0FBQyxDQUFDO1FBQ3pCLG1CQUFjLEdBQWlCLElBQUksQ0FBQztRQU1wQyxZQUFPLEdBQWdCLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQWtCL0MsY0FBUyxHQUFXLEVBQUUsQ0FBQztRQUd2QixnQkFBVyxHQUFnQixFQUFFLENBQUM7UUFFOUIsaUJBQVksR0FBRyxDQUFDLENBQUM7UUFDakIsYUFBUSxHQUFnQixF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