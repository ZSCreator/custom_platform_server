'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const sgPlayer_1 = require("./sgPlayer");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const pinus_logger_1 = require("pinus-logger");
const control_1 = require("./control");
const recordUtil_1 = require("./util/recordUtil");
const constants_1 = require("../../../services/newControl/constants");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const MessageService = require("../../../services/MessageService");
const sangong_logic = require("./sangong_logic");
const utils = require("../../../utils/index");
const sangongConst = require("./sangongConst");
const SangongMgr_1 = require("../lib/SangongMgr");
const LoggerInfo = (0, pinus_logger_1.getLogger)('server_out', __filename);
const ZERO = 0;
function getRandomNumber(min, max) {
    if (max % 1 !== 0 || min % 1 !== 0) {
        throw "min, max不能为非整数";
    }
    const MAX = Math.max(min, max);
    const MIN = Math.min(min, max);
    const MM = MAX - MIN + 1;
    return Math.floor(Math.random() * MM) + MIN;
}
const WAIT_TIME = 5000;
class sgRoom extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.SETTLE_COUNTDOWN = 0;
        this.status = 'INWAIT';
        this.allBet = 0;
        this.curPlayers = [];
        this.robBankers = [];
        this.stateTime = 0;
        this.players = new Array(6).fill(null);
        this.controlPlan = 0;
        this.cards = [];
        this.waitTimeout = null;
        this.zipResult = '';
        this.lowBet = opts.lowBet;
        this.entryCond = opts.entryCond;
        this.channel = opts.channel;
        this.control = new control_1.default({ room: this });
        this.Initialization();
    }
    close() {
        this.sendRoomCloseMessage();
        this.players = [];
    }
    Initialization() {
        this.allBet = 0;
        this.Banker = null;
        this.controlPlan = 0;
        this.cards = [];
        this.robBankers = [];
        this.stateTime = 0;
        this.battle_kickNoOnline();
        this.status = "INWAIT";
        this.updateRoundId();
    }
    battle_kickNoOnline() {
        const offLinePlayers = [];
        for (const pl of this.players) {
            if (!pl)
                continue;
            if (!pl.onLine)
                SangongMgr_1.default.removePlayer(pl);
            this.exit(pl, false);
            offLinePlayers.push(pl);
        }
        this.kickingPlayer(pinus_1.pinus.app.getServerId(), offLinePlayers);
    }
    async exit(playerInfo, isOffLine) {
        if (isOffLine) {
            playerInfo.onLine = false;
            playerInfo.leaveTimer = Date.now();
            this.channelIsPlayer(sangongConst.route.Offline, { uid: playerInfo.uid });
            return;
        }
        this.players[playerInfo.seat] = null;
        this.channelIsPlayer(sangongConst.route.OnExit, { uid: playerInfo.uid });
        this.kickOutMessage(playerInfo.uid);
        SangongMgr_1.default.removePlayerSeat(playerInfo.uid);
    }
    addPlayerInRoom(dbplayer) {
        if (this.getPlayer(dbplayer.uid)) {
            this.reconnectPlayer(dbplayer.uid);
        }
        else {
            const idxs = [];
            this.players.forEach((m, i) => !m && idxs.push(i));
            const i = idxs[utils.random(0, idxs.length - 1)];
            this.players[i] = new sgPlayer_1.default(dbplayer, i);
            this.players[i].status = "WAIT";
            this.channelIsPlayer(sangongConst.route.Add, this.players[i].strip());
        }
        this.addMessage(dbplayer);
        return true;
    }
    reconnectPlayer(uid) {
        const currPlayer = this.getPlayer(uid);
        if (!currPlayer)
            return;
        currPlayer.onLine = true;
        this.channelIsPlayer(sangongConst.route.Reconnect, { uid });
    }
    wrapGameData() {
        return {
            sceneId: this.sceneId,
            roomId: this.roomId,
            roundId: this.roundId,
            status: this.status,
            players: this.players.map(pl => pl && pl.strip()),
            countdown: this.toStatusTime(),
            profit: this.allBet,
            Banker: this.Banker ? this.Banker.uid : null,
            robBankers: this.robBankers.map(pl => pl.robStrip()),
            lowBet: this.lowBet,
        };
    }
    toStatusTime() {
        let Time = 0;
        if (this.status == 'INWAIT')
            return ZERO;
        if (this.status == 'SETTLEMENT')
            return this.SETTLE_COUNTDOWN;
        Time = (sangongConst.COUNTDOWN[this.status] - (Date.now() - this.stateTime));
        return Time;
    }
    judgeBanker() {
        if (this.robBankers.length === 0) {
            const curLength = this.curPlayers.length - 1;
            this.Banker = this.curPlayers[getRandomNumber(0, curLength)];
            this.robBankers = this.curPlayers;
        }
        else {
            this.robBankers.sort((x, y) => y.robOdds - x.robOdds);
            this.robBankers = this.robBankers.filter(player => player.robOdds === this.robBankers[0].robOdds);
            if (this.controlPlan === 1) {
                const controlPlayer = this.robBankers.find(player => player.control);
                this.Banker = controlPlayer || this.robBankers[getRandomNumber(0, this.robBankers.length - 1)];
            }
            else {
                this.Banker = this.robBankers[getRandomNumber(0, this.robBankers.length - 1)];
            }
        }
        this.Banker.isBanker = true;
    }
    riffle(gamePlayers) {
        let aPoker = sangong_logic.getpai();
        const cards = [];
        for (let len = gamePlayers.length - 1; len >= 0; len--) {
            const card = aPoker.splice(0, 3);
            const cardType = sangong_logic.getCardTypeBySg(card);
            cards.push({ cards: card, cardType });
        }
        if (Math.random() <= sangongConst.sangongProbability) {
            const len = getRandomNumber(0, gamePlayers.length - 1);
            for (let i = 0; i < len; i++) {
                for (let i = 0; i < 10000; i++) {
                    aPoker.sort(() => 0.5 - Math.random());
                    const card = aPoker.slice(0, 3);
                    const cardType = sangong_logic.getCardTypeBySg(card);
                    if (cardType > 9) {
                        const bigCard = { cards: card, cardType };
                        const splArr = cards.splice(getRandomNumber(0, cards.length - 1), 1, bigCard);
                        aPoker.splice(0, 3);
                        splArr.push(...splArr);
                        break;
                    }
                }
            }
        }
        cards.sort((x, y) => Number(sangong_logic.bipaiSoleBySg(y, x)) - Number(sangong_logic.bipaiSoleBySg(x, y)));
        this.cards = cards;
    }
    controlPersonalDeal(positivePlayers, negativePlayers) {
        let dealtPlayers = this.curPlayers;
        positivePlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        negativePlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        if (positivePlayers.length) {
            positivePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                const player = this.getPlayer(p.uid);
                const handCards = this.cards.shift();
                player.licensing(handCards.cards, handCards.cardType);
                dealtPlayers = dealtPlayers.filter(dealtPlayer => p.uid !== dealtPlayer.uid);
            });
        }
        else {
            negativePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                const player = this.getPlayer(p.uid);
                const handCards = this.cards.pop();
                player.licensing(handCards.cards, handCards.cardType);
                dealtPlayers = dealtPlayers.filter(dealtPlayer => p.uid !== dealtPlayer.uid);
            });
        }
        this.cards.sort((a, b) => Math.random() - 0.5);
        dealtPlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
            const handCards = this.cards.pop();
            p.licensing(handCards.cards, handCards.cardType);
        });
    }
    sceneControl(sceneControlState, isPlatformControl) {
        if (sceneControlState === constants_1.ControlState.NONE) {
            return this.randomDeal(this.curPlayers);
        }
        const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        this.curPlayers.forEach(p => p.setControlType(type));
        const winType = sceneControlState === constants_1.ControlState.PLAYER_WIN ? RoleEnum_1.RoleEnum.REAL_PLAYER : RoleEnum_1.RoleEnum.ROBOT;
        const winPlayers = this.curPlayers.filter(p => p.isRobot === winType);
        const lossPlayers = this.curPlayers.filter(p => p.isRobot !== winType);
        lossPlayers.sort((x, y) => Math.random() - 0.5).forEach(p => {
            const handCards = this.cards.pop();
            p.licensing(handCards.cards, handCards.cardType);
        });
        winPlayers.sort((x, y) => Math.random() - 0.5).forEach(p => {
            const handCards = this.cards.shift();
            p.licensing(handCards.cards, handCards.cardType);
        });
    }
    randomDeal(list) {
        list.sort((a, b) => Math.random() - 0.5);
        for (const pl of list) {
            this.cards.sort((a, b) => Math.random() - 0.5);
            const handCards = this.cards.shift();
            pl.licensing(handCards.cards, handCards.cardType);
        }
    }
    async licensingControl(list) {
        this.riffle(list);
        if (!list.every(pl => pl && pl.isRobot === 0) &&
            !list.every(pl => pl && pl.isRobot === 2)) {
            await this.control.runControlDeal();
        }
        else {
            this.randomDeal(list);
        }
    }
    wait(currPlayer) {
        if (this.status == `INWAIT`) {
            if (this.players.filter(pl => pl && pl.status == `WAIT`).length <= 1) {
                this.channelIsPlayer(sangongConst.route.ReadyState, { waitTime: 0 });
                return;
            }
            if (Date.now() - this.lastWaitTime < WAIT_TIME) {
                const member = currPlayer && this.channel.getMember(currPlayer.uid);
                if (member) {
                    let waitTime = Math.max(WAIT_TIME - (Date.now() - this.lastWaitTime), 0);
                    MessageService.pushMessageByUids(sangongConst.route.ReadyState, { waitTime }, member);
                }
                return;
            }
            this.channelIsPlayer(sangongConst.route.ReadyState, { waitTime: WAIT_TIME });
            this.lastWaitTime = Date.now();
            clearTimeout(this.waitTimeout);
            this.waitTimeout = setTimeout(() => {
                const list = this.players.filter(pl => pl);
                if (list.length >= 2) {
                    this.licensing_step_1(list);
                }
                else {
                    this.channelIsPlayer(sangongConst.route.ReadyState, { waitTime: 0 });
                }
            }, WAIT_TIME);
        }
    }
    async licensing_step_1(list) {
        this.startTime = Date.now();
        this.stateTime = Date.now();
        this.status = 'LICENS';
        list.forEach(pl => pl.status = "GAME");
        this.curPlayers = list;
        await this.licensingControl(list);
        const opts = {
            players: list.map(pl => pl.robStrip()),
        };
        this.channelIsPlayer(sangongConst.route.Licens, opts);
        setTimeout(() => {
            this.robBanker_step_2();
        }, sangongConst.COUNTDOWN.LICENS);
    }
    robBanker_step_2() {
        this.status = 'ROB';
        const opts = {
            countdown: sangongConst.COUNTDOWN.ROB,
            players: this.curPlayers.map(pl => pl.robStrip()),
        };
        this.channelIsPlayer(sangongConst.route.RobState, opts);
        this.robTimer = setTimeout(() => {
            this.robAnimation_step_3();
        }, sangongConst.COUNTDOWN.ROB);
    }
    robAnimation_step_3() {
        clearTimeout(this.robTimer);
        this.status = 'ROBANIMATION';
        this.stateTime = Date.now();
        this.judgeBanker();
        const opts = {
            countdown: sangongConst.COUNTDOWN.ROBANIMATION,
            robBankers: this.robBankers.map(pl => pl.robStrip()),
            Banker: this.Banker.betStateStrip(),
            noRob: this.curPlayers.filter(pl => pl && pl.uid != this.Banker.uid && pl.isRob == false).map(pl => pl.robStrip())
        };
        if (this.Banker.isRob == false) {
            opts.noRob.push(this.Banker.robStrip());
        }
        this.channelIsPlayer(sangongConst.route.RobAnimation, opts);
        setTimeout(async () => {
            await this.betState_step_4();
        }, sangongConst.COUNTDOWN.ROBANIMATION);
    }
    async betState_step_4() {
        this.status = 'BET';
        this.stateTime = Date.now();
        for (const pl of this.players) {
            if (!pl)
                continue;
            const member = this.channel.getMember(pl.uid);
            const opts = {
                countdown: sangongConst.COUNTDOWN.BET,
                Banker: this.Banker.betStateStrip(),
                players: this.curPlayers.filter(c => c && c.uid != this.Banker.uid).map(c => {
                    return {
                        uid: c.uid,
                        seat: c.seat,
                        totalOdds: c.totalOdds,
                        control: pl.isRobot == 2 ? c.control : null
                    };
                }),
            };
            MessageService.pushMessageByUids(sangongConst.route.BetState, opts, member);
        }
        this.betTimer = setTimeout(() => {
            const notBetPlayers = this.curPlayers.filter(pl => pl.uid != this.Banker.uid && !pl.isBet);
            for (const pl of notBetPlayers) {
                pl.handler_bet(this, pl.bOdds);
            }
        }, sangongConst.COUNTDOWN.BET);
    }
    lookState_step_5() {
        clearTimeout(this.betTimer);
        this.status = 'LOOK';
        this.stateTime = Date.now();
        this.Banker.cardsOdds = sangongConst.Odds[this.Banker.cardType];
        {
            let totalWin = 0;
            for (const pl of this.curPlayers) {
                if (pl.uid == this.Banker.uid)
                    continue;
                const isBankerWin = sangong_logic.bipaiSoleBySg(this.Banker, pl);
                if (isBankerWin) {
                    let mloseGold = this.Banker.cardsOdds * this.Banker.robOdds * pl.bet;
                    pl.profit = -mloseGold;
                    totalWin += mloseGold;
                }
            }
            let initialWin = totalWin;
            if (totalWin > this.Banker.gold) {
                totalWin = this.Banker.gold;
            }
            let temp_totalWin = totalWin;
            for (const pl of this.curPlayers) {
                if (pl.uid == this.Banker.uid)
                    continue;
                const isBankerWin = sangong_logic.bipaiSoleBySg(this.Banker, pl);
                if (isBankerWin) {
                    pl.cardsOdds = sangongConst.Odds[pl.cardType];
                    pl.profit = -Math.abs((pl.profit / initialWin) * temp_totalWin);
                    let diffNum = Math.abs(pl.profit) - pl.gold;
                    if (diffNum > 0) {
                        pl.profit = -pl.gold;
                        totalWin -= diffNum;
                    }
                }
            }
            let totalLoss = 0;
            for (const pl of this.curPlayers) {
                if (pl.uid == this.Banker.uid)
                    continue;
                const isBankerWin = sangong_logic.bipaiSoleBySg(this.Banker, pl);
                if (!isBankerWin) {
                    pl.cardsOdds = sangongConst.Odds[pl.cardType];
                    pl.profit = pl.cardsOdds * pl.bet * this.Banker.robOdds;
                    let diffNum = Math.abs(pl.profit) - pl.gold;
                    if (diffNum > 0) {
                        pl.profit = pl.gold;
                    }
                    totalLoss -= pl.profit;
                }
            }
            let initialLoss = totalLoss;
            if (Math.abs(totalLoss) > (this.Banker.gold + totalWin)) {
                totalLoss = -(this.Banker.gold + totalWin);
            }
            for (const pl of this.curPlayers) {
                if (pl.uid == this.Banker.uid)
                    continue;
                const isBankerWin = sangong_logic.bipaiSoleBySg(this.Banker, pl);
                if (!isBankerWin) {
                    pl.profit = Math.abs((pl.profit / initialLoss) * totalLoss);
                }
            }
            this.Banker.profit = totalWin + totalLoss;
            for (const pl of this.curPlayers) {
                if (pl.profit < 0 && pl.gold < Math.abs(pl.profit)) {
                    console.warn(this.roundId, pl.uid, `2222`);
                }
            }
        }
        let opts = {
            countdown: sangongConst.COUNTDOWN.LOOK,
            players: this.players.map(pl => pl && pl.robStrip()),
        };
        this.channelIsPlayer(sangongConst.route.LookState, opts);
        this.lookStateTimer = setTimeout(() => {
            this.players.forEach(pl => pl && !pl.openCards && pl.handler_openCard(this));
        }, sangongConst.COUNTDOWN.LOOK);
    }
    async settlement() {
        clearTimeout(this.lookStateTimer);
        this.endTime = Date.now();
        this.status = 'SETTLEMENT';
        this.stateTime = Date.now();
        this.SETTLE_COUNTDOWN = sangongConst.COUNTDOWN.SETTLEMENT;
        this.zipResult = (0, recordUtil_1.buildRecordResult)(this.players);
        for (const pl of this.curPlayers) {
            if (pl.profit < 0 && pl.gold < Math.abs(pl.profit)) {
                console.warn(this.roundId, pl.uid, `1111`, this.curPlayers.map(c => c.uid).toString());
            }
            await pl.updateGold(this);
        }
        for (const pl of this.curPlayers) {
            await pl.only_update_game(this);
        }
        const opts = {
            players: this.curPlayers.map(pl => pl.toResult()),
            Banker: this.Banker.toResult(),
        };
        this.channelIsPlayer(sangongConst.route.SettleResult, opts);
        this.Initialization();
    }
}
exports.default = sgRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2dSb29tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvc2FuZ29uZy9saWIvc2dSb29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFDYixpQ0FBOEI7QUFDOUIseUNBQWtDO0FBQ2xDLHVFQUFvRTtBQUNwRSwrQ0FBeUM7QUFFekMsdUNBQWdDO0FBQ2hDLGtEQUFzRDtBQUN0RCxzRUFBb0Y7QUFDcEYsdUVBQW9FO0FBQ3BFLG1FQUFvRTtBQUNwRSxpREFBa0Q7QUFDbEQsOENBQStDO0FBQy9DLCtDQUFnRDtBQUNoRCxrREFBOEQ7QUFDOUQsTUFBTSxVQUFVLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN2RCxNQUFNLElBQUksR0FBRyxDQUFDLENBQUM7QUFFZixTQUFTLGVBQWUsQ0FBQyxHQUFXLEVBQUUsR0FBVztJQUM3QyxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ2hDLE1BQU0sZ0JBQWdCLENBQUM7S0FDMUI7SUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMvQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMvQixNQUFNLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUV6QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNoRCxDQUFDO0FBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBVXZCLE1BQXFCLE1BQU8sU0FBUSx1QkFBb0I7SUFrQ3BELFlBQVksSUFBUztRQUNq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