"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const qzpjPlayer_1 = require("./qzpjPlayer");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const qzpjMgr_1 = require("./qzpjMgr");
const pinus_logger_1 = require("pinus-logger");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const utils = require("../../../utils/index");
const qzpj_logic = require("./qzpj_logic");
const MessageService = require("../../../services/MessageService");
const qzpjConst_1 = require("./qzpjConst");
const timers_1 = require("timers");
const control_1 = require("./control");
const constants_1 = require("../../../services/newControl/constants");
const CC_DEBUG = false;
var STATUS_TIME;
(function (STATUS_TIME) {
    STATUS_TIME[STATUS_TIME["NONE"] = 0] = "NONE";
    STATUS_TIME[STATUS_TIME["ROBZHUANG"] = 5] = "ROBZHUANG";
    STATUS_TIME[STATUS_TIME["READYBET"] = 5] = "READYBET";
    STATUS_TIME[STATUS_TIME["LOOK"] = 1] = "LOOK";
    STATUS_TIME[STATUS_TIME["SETTLEMENT"] = 5] = "SETTLEMENT";
    STATUS_TIME[STATUS_TIME["AWITTIMER"] = 5] = "AWITTIMER";
})(STATUS_TIME || (STATUS_TIME = {}));
;
class qzpjRoom extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.status = qzpjConst_1.RoomState.NONE;
        this.roundTimes = 1;
        this.robzhuangs = [];
        this._cards = [];
        this._cur_players = [];
        this.statusTime = Date.now();
        this.zipResult = '';
        this.Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
        this.startSeat = 0;
        this.players = new Array(this.maxCount).fill(null);
        this.zhuangInfo = null;
        this.lowBet = opts.lowBet;
        this.entryCond = opts.entryCond;
        this.auto_time = STATUS_TIME.NONE;
        this.isSettlement = false;
        this.max_uid = '';
        this.Initialization(true);
        this.control = new control_1.default({ room: this });
    }
    close() {
        this.sendRoomCloseMessage();
    }
    Initialization(twoStrategy) {
        if (twoStrategy == true) {
            this.battle_kickNoOnline();
            this.status = qzpjConst_1.RoomState.INWAIT;
        }
        this.max_uid = '';
        this.isSettlement = false;
        twoStrategy && (this.roundTimes = 1);
        this.zhuangInfo = null;
        this.robzhuangs = [];
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
        const seat = this.players.findIndex(pl => pl == null);
        this.players[seat] = new qzpjPlayer_1.default(seat, dbplayer);
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
        let opts = {
            uid: playerInfo.uid,
            playerNum: this.players.filter(m => m != null).length
        };
        this.channelIsPlayer(qzpjConst_1.route.qzpj_onExit, opts);
        qzpjMgr_1.default.removePlayerSeat(playerInfo.uid);
    }
    toStatus() {
        return {
            status: this.status,
            auto_time: this.auto_time
        };
    }
    async wait(playerInfo) {
        if (this.status == qzpjConst_1.RoomState.NONE || this.status == qzpjConst_1.RoomState.INWAIT) {
            if (this.players.filter(pl => pl).length <= 1) {
                this.channelIsPlayer(`qzpj.onWait`, { waitTime: 0, roomId: this.roomId });
                return;
            }
            if (Date.now() - this.statusTime < STATUS_TIME.AWITTIMER * 1000) {
                const member = playerInfo && this.channel.getMember(playerInfo.uid);
                if (member) {
                    MessageService.pushMessageByUids(`qz_onWait`, { waitTime: Math.round(Date.now() - this.statusTime) }, member);
                }
                return;
            }
            this.statusTime = Date.now();
            this.channelIsPlayer('qzpj.onWait', { waitTime: STATUS_TIME.AWITTIMER, roomId: this.roomId });
            clearTimeout(this.waitTimer);
            this.waitTimer = setTimeout(() => {
                const list = this.players.filter(pl => pl);
                if (list.length >= 4) {
                    this.handler_start();
                }
                else {
                    this.channelIsPlayer('qzpj.onWait', { waitTime: 0, roomId: this.roomId });
                }
            }, STATUS_TIME.AWITTIMER * 1000);
        }
    }
    handler_start() {
        CC_DEBUG && console.warn("handler_start");
        this.status = qzpjConst_1.RoomState.ROBZHUANG;
        this.Initialization(false);
        this.players.forEach(pl => pl && pl.initGame());
        this.status = qzpjConst_1.RoomState.ROBZHUANG;
        this.auto_time = STATUS_TIME.ROBZHUANG;
        this.startTime = Date.now();
        this.players.forEach(pl => pl && (pl.status = `GAME`));
        this._cur_players = this.players.filter(pl => pl);
        if (this.roundTimes == 1) {
            this._cards = qzpj_logic.shuffle_cards();
        }
        let lookPlayer = this.players.filter(pl => pl && pl.status != 'GAME').map(pl => {
            return { uid: pl.uid, seat: pl.seat, gold: pl.gold, headurl: pl.headurl, nickname: pl.nickname, };
        });
        const opts = { lookPlayer, auto_time: this.auto_time, r: utils.random(1, 100) };
        this.channelIsPlayer(qzpjConst_1.route.qzpj_onStart, opts);
        this.handler_pass();
    }
    async handler_readybet() {
        CC_DEBUG && console.warn("handler_readybet");
        this.statusTime = Date.now();
        (0, timers_1.clearInterval)(this.Oper_timeout);
        let robzhuangs = this.players.filter(pl => pl && pl.robmul > 0).sort((a, b) => b.robmul - a.robmul);
        let zhuang_player = this.players[0];
        if (robzhuangs.length > 0) {
            zhuang_player = robzhuangs.filter(c => c.robmul == robzhuangs[0].robmul).sort((a, b) => b.gold - a.gold)[0];
        }
        else {
            this._cur_players.sort((a, b) => 0.5 - Math.random());
            zhuang_player = this._cur_players[0];
            zhuang_player.robmul = 1;
        }
        try {
            this.zhuangInfo = { uid: zhuang_player.uid, mul: zhuang_player.robmul, seat: zhuang_player.seat };
        }
        catch (error) {
            console.warn(error);
        }
        this.auto_time = this.robzhuangs.length === 1 ? 0.5 : 2.5;
        let opts = {
            stateInfo: this.toStatus(),
            robzhuangs: this.robzhuangs.map(m => m),
            zhuangInfo: this.zhuangInfo,
            players: this._cur_players.map(pl => pl.toRobzhuangData()),
            auto_time: this.auto_time,
        };
        this.channelIsPlayer(qzpjConst_1.route.qzpj_onSetBanker, opts);
        (0, timers_1.clearInterval)(this.Oper_timeout);
        this.Oper_timeout = setInterval(() => {
            this.auto_time--;
            if (this.auto_time > 0)
                return;
            (0, timers_1.clearInterval)(this.Oper_timeout);
            this.handler_readybet2();
        }, 1000);
    }
    async handler_readybet2() {
        this.auto_time = STATUS_TIME.READYBET;
        this.status = qzpjConst_1.RoomState.READYBET;
        for (const pl of this.players) {
            if (!pl)
                continue;
            let BMax = pl.gold / (this.lowBet * this.zhuangInfo.mul);
            BMax = Math.ceil(Math.min(BMax, 30));
            pl.bet_mul_List = [1];
            let B2 = Math.max(Math.ceil(BMax * 0.25), 1);
            const B3 = Math.ceil(BMax * 0.5);
            const B4 = Math.ceil(BMax * 0.75);
            if (!pl.bet_mul_List.includes(B2) && B2 > 1)
                pl.bet_mul_List.push(B2);
            if (!pl.bet_mul_List.includes(B3) && B3 > 1)
                pl.bet_mul_List.push(B3);
            if (!pl.bet_mul_List.includes(B4) && B4 > 1)
                pl.bet_mul_List.push(B4);
            if (!pl.bet_mul_List.includes(BMax) && BMax > 1)
                pl.bet_mul_List.push(BMax);
            const member = pl && this.channel.getMember(pl.uid);
            member && MessageService.pushMessageByUids(qzpjConst_1.route.qzpj_onReadybet, {
                auto_time: this.auto_time,
                bet_mul_List: pl.bet_mul_List
            }, member);
        }
        this.handler_pass();
    }
    handler_pass() {
        (0, timers_1.clearInterval)(this.Oper_timeout);
        this.Oper_timeout = setInterval(() => {
            this.auto_time--;
            if (this.auto_time > 0)
                return;
            (0, timers_1.clearInterval)(this.Oper_timeout);
            if (this.status == qzpjConst_1.RoomState.ROBZHUANG) {
                let players = this.players.filter(pl => pl && pl.status == 'GAME' && pl.robmul == -1);
                for (const pl of players) {
                    pl.handler_robBanker(this, 0);
                }
            }
            else if (this.status == qzpjConst_1.RoomState.READYBET) {
                let players = this.players.filter(pl => pl && pl.status == 'GAME' && pl.isBet == 0 && pl.uid !== this.zhuangInfo.uid);
                for (const pl of players) {
                    pl.handler_bet(this, pl.bet_mul_List[0]);
                }
            }
        }, 1000);
    }
    async handler_deal() {
        (0, timers_1.clearInterval)(this.Oper_timeout);
        CC_DEBUG && console.warn("handler_deal");
        this.status = qzpjConst_1.RoomState.DICE;
        this.statusTime = Date.now();
        this.setSice = [utils.random(1, 6), utils.random(1, 6)];
        let start_seat = this.zhuangInfo.seat;
        for (let idx = 1; idx < utils.sum(this.setSice); idx++) {
            start_seat = this.nextFahuaIdx(start_seat);
        }
        this.auto_time = 4;
        this.startSeat = start_seat;
        let opts = {
            status: this.status,
            setSice: this.setSice,
            auto_time: this.auto_time,
            start_seat
        };
        this.channelIsPlayer(qzpjConst_1.route.qzpj_setSice, opts);
        await utils.delay(this.auto_time * 1000);
        this.status = qzpjConst_1.RoomState.DEAL;
        this.statusTime = Date.now();
        this.auto_time = 0;
        await this.control.runControl();
        for (let index = this.players.length + start_seat; index > start_seat; index--) {
            let seat = index;
            if (index >= this.players.length)
                seat = index - this.players.length;
            const pl = this.players[seat];
            const opts = pl.strip();
            this.channelIsPlayer(qzpjConst_1.route.qzpj_onDeal, opts);
            await utils.delay(500);
        }
        await utils.delay(1000);
        this.status = qzpjConst_1.RoomState.LOOK;
        this.statusTime = Date.now();
        start_seat = this.nextFahuaIdx(this.zhuangInfo.seat);
        for (let index = start_seat; index < this.players.length + start_seat; index++) {
            let seat = index;
            if (index >= this.players.length)
                seat = index - this.players.length;
            const pl = this.players[seat];
            pl && this.liangpaiOpt(pl);
            await utils.delay(1000);
        }
        this.settlement();
    }
    liangpaiOpt(playerInfo) {
        playerInfo.isLiangpai = true;
        let opts = {
            uid: playerInfo.uid,
            seat: playerInfo.seat,
            cards: playerInfo.cards,
            cardType: playerInfo.cardType,
            points: playerInfo.points
        };
        this.channelIsPlayer(qzpjConst_1.route.qzpj_liangpai, opts);
    }
    async settlement() {
        if (this.isSettlement)
            return;
        this.isSettlement = true;
        this.endTime = Date.now();
        this.status = qzpjConst_1.RoomState.SETTLEMENT;
        this.statusTime = Date.now();
        this.auto_time = 10;
        CC_DEBUG && console.warn("settlement");
        try {
            {
                const ply_zj = this._cur_players.find(pl => pl.uid === this.zhuangInfo.uid);
                const curPlayers = this._cur_players.filter(pl => pl && pl.uid != ply_zj.uid);
                let totalWin = 0;
                for (const pl of curPlayers) {
                    const is_zj_win = qzpj_logic.bipai(ply_zj.cards, pl.cards);
                    if (is_zj_win) {
                        let mloseGold = pl.betNum * this.zhuangInfo.mul * this.lowBet;
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
                    const is_zj_win = qzpj_logic.bipai(ply_zj.cards, pl.cards);
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
                    const is_zj_win = qzpj_logic.bipai(ply_zj.cards, pl.cards);
                    if (!is_zj_win) {
                        pl.profit = pl.betNum * this.zhuangInfo.mul * this.lowBet * 1;
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
                    const is_zj_win = qzpj_logic.bipai(ply_zj.cards, pl.cards);
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
                players: this._cur_players.map(m => m.toResult()),
                auto_time: this.auto_time,
                roundTimes: this.roundTimes
            };
            let less_gold = this.players.filter(c => !!c).some(c => c.gold < this.entryCond);
            if (this.roundTimes == 2 ||
                !this.players.some(pl => pl && pl.isRobot == RoleEnum_1.RoleEnum.REAL_PLAYER) ||
                less_gold) {
                opts['less_gold'] = true;
                this.channelIsPlayer(qzpjConst_1.route.qzpj_onSettlement, opts);
                this.Initialization(true);
            }
            else {
                this.channelIsPlayer(qzpjConst_1.route.qzpj_onSettlement, opts);
                let Oper_timeout = setInterval(async () => {
                    this.auto_time -= 1;
                    if (this.auto_time <= 0) {
                        this.roundTimes++;
                        (0, timers_1.clearInterval)(Oper_timeout);
                        this.handler_start();
                    }
                }, 1000);
            }
        }
        catch (error) {
            console.warn(`...`);
        }
    }
    nextFahuaIdx(doing) {
        let next = doing + 1;
        let len = this.players.length;
        do {
            next = next >= len ? 0 : next;
            if (next == doing) {
                return -1;
            }
            let player = this.players[next];
            if (player) {
                return next;
            }
            next++;
        } while (true);
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
            players: this.players.map(pl => pl && pl.strip()),
            status: this.status,
            roundTimes: this.roundTimes
        };
    }
    battle_kickNoOnline() {
        const offLinePlayers = [];
        for (const pl of this.players) {
            if (!pl)
                continue;
            if (!pl.onLine)
                qzpjMgr_1.default.removePlayer(pl);
            offLinePlayers.push(pl);
            this.kickOutMessage(pl.uid);
            qzpjMgr_1.default.removePlayerSeat(pl.uid);
            this.players[pl.seat] = null;
        }
        this.kickingPlayer(pinus_1.pinus.app.getServerId(), offLinePlayers);
    }
    isSameGamePlayers() {
        return this._cur_players.every(p => p.isRobot === this._cur_players[0].isRobot);
    }
    async randomDeal() {
        let filterArr = [];
        for (let index = this.players.length + this.startSeat; index > this.startSeat; index--) {
            let seat = index;
            if (index >= this.players.length)
                seat = index - this.players.length;
            const pl = this.players[seat];
            if (!pl || filterArr.includes(pl.seat))
                continue;
            filterArr.push(pl.seat);
            pl.cards = this._cards.splice(0, 2);
            pl.cardType = qzpj_logic.getCardType(pl.cards, true);
            pl.points = qzpj_logic.getPoints(pl.cards);
            CC_DEBUG && console.warn(pl.cards.toString(), pl.cards.map(c => qzpj_logic.pukes[c]).toString(), `|${pl.cardType}|${qzpj_logic.types[pl.cardType]}`);
        }
    }
    setPlayerCards(player, cards) {
        player.cards = cards;
        player.cardType = qzpj_logic.getCardType(player.cards, true);
        player.points = qzpj_logic.getPoints(player.cards);
    }
    controlPersonalDeal(positivePlayers, negativePlayers) {
        positivePlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        negativePlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        let gamePlayers = this._cur_players;
        const results = [];
        for (let i = 0, len = this._cur_players.length; i < len; i++) {
            results.push(this._cards.splice(0, 2));
        }
        this.sortResult(results);
        if (positivePlayers.length) {
            positivePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                const player = this.getPlayer(p.uid);
                this.setPlayerCards(player, results.shift());
                gamePlayers = gamePlayers.filter(gamePlayer => gamePlayer.uid !== p.uid);
            });
        }
        else {
            negativePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                const player = this.getPlayer(p.uid);
                this.setPlayerCards(player, results.pop());
                gamePlayers = gamePlayers.filter(gamePlayer => gamePlayer.uid !== p.uid);
            });
        }
        gamePlayers.sort((a, b) => Math.random() - 0.5).forEach(player => this.setPlayerCards(player, results.shift()));
    }
    async runSceneControl(sceneControlState, isPlatformControl) {
        const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        this._cur_players.forEach(p => p.setControlType(type));
        const results = [];
        for (let i = 0, len = this._cur_players.length; i < len; i++) {
            results.push(this._cards.splice(0, 2));
        }
        this.sortResult(results);
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
        possibleWinPlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
            this.setPlayerCards(p, results.shift());
        });
        lossPlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
            results.sort((a, b) => Math.random() - 0.5);
            this.setPlayerCards(p, results.pop());
        });
    }
    sortResult(cards) {
        cards.sort((a, b) => {
            return qzpj_logic.bipai(b, a) ? 1 : -1;
        });
    }
}
exports.default = qzpjRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXpwalJvb20uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9xenBqL2xpYi9xenBqUm9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUE4QjtBQUM5Qiw2Q0FBc0M7QUFDdEMsdUVBQW9FO0FBQ3BFLHVDQUFvQztBQUNwQywrQ0FBeUM7QUFDekMsdUVBQW9FO0FBQ3BFLDhDQUErQztBQUMvQywyQ0FBMEM7QUFFMUMsbUVBQW1FO0FBQ25FLDJDQUErQztBQUMvQyxtQ0FBdUM7QUFDdkMsdUNBQWdDO0FBRWhDLHNFQUFvRjtBQUlwRixNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFFdkIsSUFBSyxXQVlKO0FBWkQsV0FBSyxXQUFXO0lBQ1osNkNBQVEsQ0FBQTtJQUVSLHVEQUFhLENBQUE7SUFFYixxREFBWSxDQUFBO0lBRVosNkNBQVEsQ0FBQTtJQUVSLHlEQUFjLENBQUE7SUFFZCx1REFBYSxDQUFBO0FBQ2pCLENBQUMsRUFaSSxXQUFXLEtBQVgsV0FBVyxRQVlmO0FBQUEsQ0FBQztBQVFGLE1BQXFCLFFBQVMsU0FBUSx1QkFBc0I7SUE0Q3hELFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUEzQ2hCLFdBQU0sR0FBYyxxQkFBUyxDQUFDLElBQUksQ0FBQztRQUVuQyxlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBRXZCLGVBQVUsR0FBaUQsRUFBRSxDQUFDO1FBVzlELFdBQU0sR0FBYSxFQUFFLENBQUM7UUFLdEIsaUJBQVksR0FBaUIsRUFBRSxDQUFDO1FBQ2hDLGVBQVUsR0FBVyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFTaEMsY0FBUyxHQUFXLEVBQUUsQ0FBQztRQUN2QixXQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQVE3QyxjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBS2xCLElBQUksQ0FBQyxPQUFP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LFNBQVMsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRCxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxFQUFFO1lBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFDO1NBQzVDO1FBQ0QsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDM0UsT0FBTyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsUUFBUSxHQUFHLENBQUM7UUFDdEcsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLElBQUksR0FBZ0MsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDN0csSUFBSSxDQUFDLGVBQWUsQ0FBQyxpQkFBSyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FB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