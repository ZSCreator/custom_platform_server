"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MessageService = require("../../../services/MessageService");
const utils = require("../../../utils/index");
const GameUtil = require("../../../utils/GameUtil");
const cp_logic = require("./cp_logic");
const GameUtil3 = require("./gameUtil3");
const cpPlayer_1 = require("./cpPlayer");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const control_1 = require("./control");
const pinus_1 = require("pinus");
const recordUtil_1 = require("./util/recordUtil");
const constants_1 = require("../../../services/newControl/constants");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const chinese_pokerMgr_1 = require("../lib/chinese_pokerMgr");
const WAIT_TIME = 5000;
const configuration_TIME = 30 * 1000;
class cpRoom extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.status = 'NONE';
        this.lastWaitTime = null;
        this.lastFahuaTime = null;
        this.lastSettlementTime = null;
        this.initPais = [];
        this.configurationTimeout = null;
        this.record_history = [];
        this.waitTimeout = null;
        this.settTimeout = null;
        this.players = new Array(4).fill(null);
        this.cardsNumber = 4;
        this.specialCardProbability = 0.06;
        this.run_Players = [];
        this.zipResult = '';
        this.backendServerId = pinus_1.pinus.app.getServerId();
        this.entryCond = opts.entryCond || 0;
        this.lowBet = opts.lowBet || 100;
        this.control = new control_1.default({ room: this });
        this.Initialization();
    }
    close() {
        this.sendRoomCloseMessage();
        this.players = [];
    }
    Initialization() {
        this.record_history = [];
        this.run_Players = [];
        this.battle_kickNoOnline();
        this.status = 'INWAIT';
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
        this.players[i] = new cpPlayer_1.default(i, dbplayer);
        this.addMessage(dbplayer);
        return true;
    }
    leave(playerInfo, isOffLine) {
        this.kickOutMessage(playerInfo.uid);
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        if (this.status != 'INGAME' || playerInfo.status != 'GAME') {
            this.players[playerInfo.seat] = null;
            this.channelIsPlayer('poker_onExit', {
                uid: playerInfo.uid, seat: playerInfo.seat,
                playerNum: this.players.filter(m => m !== null).length
            });
        }
        chinese_pokerMgr_1.default.removePlayerSeat(playerInfo.uid);
    }
    getWaitTime() {
        if (this.status == 'INWAIT')
            return Math.max(WAIT_TIME - (Date.now() - this.lastWaitTime), 0);
        if (this.status == 'INGAME') {
            return Math.max(configuration_TIME - (Date.now() - this.lastFahuaTime), 0);
        }
        if (this.status == 'END') {
            return Date.now() - this.lastSettlementTime;
        }
        return 0;
    }
    wait(playerInfo) {
        if (this.status != 'INWAIT')
            return;
        const arr = this.players.filter(pl => pl && pl.status == `WAIT`);
        if (arr.length <= 1) {
            this.channelIsPlayer('poker_onWait', { waitTime: 0 });
            return;
        }
        if (Date.now() - this.lastWaitTime < WAIT_TIME) {
            const member = playerInfo && this.channel.getMember(playerInfo.uid);
            if (member) {
                let waitTime = this.getWaitTime();
                MessageService.pushMessageByUids(`poker_onWait`, { waitTime: waitTime }, member);
            }
            return;
        }
        this.channelIsPlayer('poker_onWait', { waitTime: WAIT_TIME });
        this.lastWaitTime = Date.now();
        clearTimeout(this.waitTimeout);
        this.waitTimeout = setTimeout(() => {
            this.run_Players = this.players.filter(pl => pl);
            if (this.run_Players.length >= 2) {
                this.handler_start();
            }
            else {
                this.channelIsPlayer('poker_onWait', { waitTime: 0 });
            }
        }, WAIT_TIME);
    }
    async handler_start() {
        this.startTime = Date.now();
        this.status = 'INGAME';
        this.run_Players = this.players.filter(pl => pl);
        this.run_Players.forEach(pl => pl.status = `GAME`);
        await this.control.runControlDeal();
        this.run_Players.forEach(pl => {
            let cards = pl.cards;
            pl.initGame(cards, this.lowBet);
            let card_arr = this.combination22(pl.cards.slice());
            card_arr.sort((a, b) => {
                return (b.type[0] + b.type[1] + b.type[2]) - (a.type[0] + a.type[1] + a.type[2]);
            });
            pl.card_arr = card_arr.slice(0, 5);
            pl.BiPaicards = [card_arr[0].cards.slice(0, 3), card_arr[0].cards.slice(3, 8), card_arr[0].cards.slice(8, 13)];
        });
        for (const pl of this.players) {
            if (!pl)
                continue;
            const member = this.channel.getMember(pl.uid);
            if (member) {
                const opts = {
                    otherPlayers: this.players.filter(m => m && m.uid != pl.uid).map(m => m && m.toGame(pl.uid)),
                    players: pl.toGame(pl.uid),
                    configuration_TIME: configuration_TIME
                };
                MessageService.pushMessageByUids('poker_onDeal', opts, member);
            }
        }
        this.lastFahuaTime = Date.now();
        this.configurationTime();
    }
    configurationTime() {
        clearTimeout(this.configurationTimeout);
        this.configurationTimeout = setTimeout(() => {
            let pls = this.players.filter(pl => pl && pl.status == 'GAME');
            for (const pl of pls) {
                if (pl.holdStatus == 0) {
                    this.configuration(pl);
                }
            }
        }, configuration_TIME + 1000);
        return;
    }
    configuration(playerInfo) {
        playerInfo.holdStatus = 1;
        this.channelIsPlayer('poker_configuration', { uid: playerInfo.uid, seat: playerInfo.seat });
        let list = this.players.filter(pl => pl && pl.status == 'GAME');
        if (list.every(m => m && m.holdStatus === 1)) {
            clearTimeout(this.configurationTimeout);
            const list = this.players.filter(pl => !!pl && pl.status == 'GAME');
            this.checkCanBiPai(list);
            this.settlement(list);
        }
    }
    checkCanBiPai(list) {
        for (const pl of list) {
            (pl.holdStatus == 0) && (pl.holdStatus = 1);
            pl.cardType1 = GameUtil3.getCardtype(pl.BiPaicards[0], []);
            pl.cardType2 = cp_logic.getCardtype(pl.BiPaicards[1], []);
            pl.cardType3 = cp_logic.getCardtype(pl.BiPaicards[2], []);
            pl.specialType = cp_logic.countAlikePoker({ cards: pl.cards, type1: pl.cardType1.type, type2: pl.cardType2.type, type3: pl.cardType3.type, });
        }
        for (const pl of list) {
            if (pl.cardType1.type == 4 && (pl.cardType2.type != 4 || pl.cardType3.type != 4)) {
                pl.cardType1.type = 0;
                pl.cardType1.type = 0;
            }
            if (pl.cardType1.type == 5 && (pl.cardType2.type != 5 || pl.cardType3.type != 5)) {
                pl.cardType1.type = 0;
                pl.cardType1.type = 0;
            }
            if (pl.cardType1.type == 8 && (pl.cardType2.type != 8 || pl.cardType3.type != 8)) {
                pl.cardType1.type = 0;
                pl.cardType1.type = 0;
            }
            const maxPoker1 = cp_logic.bipai(pl.cardType1, pl.cardType2);
            const maxPoker2 = cp_logic.bipai(pl.cardType2, pl.cardType3);
            if (maxPoker1 > 0 || maxPoker2 > 0) {
                pl.biPai_status = true;
            }
        }
        ;
        const notSpecialType_list = list.filter(m => m.specialType == 0);
        for (let i = 0; i < notSpecialType_list.length; i++) {
            for (let j = i + 1; j < notSpecialType_list.length; j++) {
                let pl1 = notSpecialType_list[i];
                let pl2 = notSpecialType_list[j];
                let maxPoker1 = GameUtil3.bipai(pl1.cardType1, pl2.cardType1);
                let maxPoker2 = cp_logic.bipai(pl1.cardType2, pl2.cardType2);
                let maxPoker3 = cp_logic.bipai(pl1.cardType3, pl2.cardType3);
                if (pl1.biPai_status == true && pl2.biPai_status == true) {
                    maxPoker1 = 0;
                    maxPoker2 = 0;
                    maxPoker3 = 0;
                }
                else if (pl1.biPai_status == true) {
                    maxPoker1 = -1;
                    maxPoker2 = -1;
                    maxPoker3 = -1;
                }
                else if (pl2.biPai_status == true) {
                    maxPoker1 = 1;
                    maxPoker2 = 1;
                    maxPoker3 = 1;
                }
                let tmpgain = { gain1: 0, gain2: 0, gain3: 0 };
                {
                    if (maxPoker1 != 0) {
                        let pl = pl2;
                        let symbol = false;
                        if (maxPoker1 > 0) {
                            pl = pl1;
                            symbol = true;
                        }
                        tmpgain.gain1 = symbol ? 1 : -1;
                        if (pl.cardType1.type == 3) {
                            pl.extension[0] = 1;
                            tmpgain.gain1 += symbol ? 2 : -2;
                        }
                    }
                }
                {
                    if (maxPoker2 != 0) {
                        {
                            let pl = pl2;
                            let symbol = false;
                            if (maxPoker2 > 0) {
                                pl = pl1;
                                symbol = true;
                            }
                            tmpgain.gain2 += symbol ? 1 : -1;
                            if (pl.cardType2.type == 6) {
                                pl.extension[1] = 1;
                                tmpgain.gain2 += symbol ? 1 : -1;
                            }
                            else if (pl.cardType2.type == 7) {
                                pl.extension[2] = 1;
                                tmpgain.gain2 += symbol ? 6 : -6;
                            }
                            else if (pl.cardType2.type == 8) {
                                pl.extension[3] = 1;
                                tmpgain.gain2 += symbol ? 8 : -8;
                            }
                        }
                    }
                }
                {
                    if (maxPoker3 != 0) {
                        let pl = pl2;
                        let symbol = false;
                        if (maxPoker3 > 0) {
                            pl = pl1;
                            symbol = true;
                        }
                        tmpgain.gain3 += symbol ? 1 : -1;
                        if (pl.cardType3.type == 7) {
                            pl.extension[4] = 1;
                            tmpgain.gain3 += symbol ? 3 : -3;
                        }
                        else if (pl.cardType3.type == 8) {
                            pl.extension[5] = 1;
                            tmpgain.gain3 += symbol ? 4 : -4;
                        }
                    }
                }
                pl1.gain1 += tmpgain.gain1;
                pl1.gain2 += tmpgain.gain2;
                pl1.gain3 += tmpgain.gain3;
                pl2.gain1 += -tmpgain.gain1;
                pl2.gain2 += -tmpgain.gain2;
                pl2.gain3 += -tmpgain.gain3;
                if (maxPoker1 > 0 && maxPoker2 > 0 && maxPoker3 > 0) {
                    pl1.tmp_gain += (tmpgain.gain1 + tmpgain.gain2 + tmpgain.gain3);
                    pl2.tmp_gain -= (tmpgain.gain1 + tmpgain.gain2 + tmpgain.gain3);
                    pl1.shoot.push({ uid: pl2.uid, seat: pl2.seat, shoot_gain: [tmpgain.gain1, tmpgain.gain2, tmpgain.gain3] });
                }
                else if (maxPoker1 < 0 && maxPoker2 < 0 && maxPoker3 < 0) {
                    pl2.tmp_gain += -(tmpgain.gain1 + tmpgain.gain2 + tmpgain.gain3);
                    pl1.tmp_gain -= -(tmpgain.gain1 + tmpgain.gain2 + tmpgain.gain3);
                    pl2.shoot.push({ uid: pl1.uid, seat: pl1.seat, shoot_gain: [-tmpgain.gain1, -tmpgain.gain2, -tmpgain.gain3] });
                }
            }
        }
        for (const ply of notSpecialType_list) {
            if (ply.shoot.length == 3) {
                for (const pl of notSpecialType_list) {
                    if (ply == pl) {
                        continue;
                    }
                    let temp = utils.sum(ply.shoot.find(c => c.uid == pl.uid).shoot_gain) * 2;
                    pl.tmp_gain -= temp;
                    ply.tmp_gain += temp;
                }
            }
        }
        for (let i = 0; i < list.length; i++) {
            for (let j = i + 1; j < list.length; j++) {
                let player1 = list[i];
                let player2 = list[j];
                const specialType_arr = [0, 4, 3, 4, 5, 6, 10, 10, 10, 20, 20, 24, 36, 108];
                let tmpGain1 = 0;
                let tmpGain2 = 0;
                if (player1.specialType > player2.specialType) {
                    tmpGain1 = specialType_arr[player1.specialType];
                    tmpGain2 = -tmpGain1;
                }
                else if (player2.specialType > player1.specialType) {
                    tmpGain2 = specialType_arr[player2.specialType];
                    tmpGain1 = -tmpGain2;
                }
                player1.specialgain += tmpGain1;
                player2.specialgain += tmpGain2;
            }
        }
        for (const pl of list) {
            pl.sumgain += pl.gain1 + pl.gain2 + pl.gain3 + pl.tmp_gain + pl.specialgain;
        }
    }
    async settlement(list) {
        this.endTime = Date.now();
        if (list.length === 0) {
            console.error(this.nid, this.roomId, '出现错误 结算的时候没有玩家');
            return this.wait();
        }
        let totalWinNum = 0;
        let totalSumgain = 0;
        this.zipResult = (0, recordUtil_1.buildRecordResult)(this.players);
        for (const pl of list) {
            if (pl.sumgain < 0) {
                pl.profit = pl.sumgain * this.lowBet;
                totalSumgain += -pl.sumgain;
                totalWinNum += Math.abs(pl.profit);
            }
        }
        for (const pl of list) {
            if (pl.sumgain > 0) {
                pl.profit = Math.floor(totalWinNum * pl.sumgain / totalSumgain);
            }
        }
        for (let pl of list) {
            await pl.settlement(this);
        }
        this.record_history = list.map(pl => pl && pl.wrapSettlement());
        for (let pl of list) {
            await pl.only_update_game(this);
        }
        let opts = {
            list: list.map(pl => pl.wrapSettlement())
        };
        this.channelIsPlayer('poker_onSettlement', opts);
        this.status = 'END';
        this.lastSettlementTime = Date.now();
        this.Initialization();
    }
    battle_kickNoOnline() {
        const offLinePlayers = [];
        for (const pl of this.players) {
            if (!pl)
                continue;
            if (!pl.onLine)
                chinese_pokerMgr_1.default.removePlayer(pl);
            offLinePlayers.push(pl);
            this.kickOutMessage(pl.uid);
            chinese_pokerMgr_1.default.removePlayerSeat(pl.uid);
            this.players[pl.seat] = null;
        }
        this.kickingPlayer(pinus_1.pinus.app.getServerId(), offLinePlayers);
    }
    GetMinPai(arr_pai, type) {
        if (arr_pai.length == 0)
            return [];
        let results = arr_pai[0];
        for (let i = 1; i < arr_pai.length; i++) {
            const pai1 = arr_pai[i];
            const maxPoker1 = cp_logic.bipai({ cards: pai1, type: type }, { cards: results, type: type });
            if (maxPoker1 < 0)
                results = pai1;
        }
        return [results];
    }
    GetMaxPai(arr_pai, type) {
        if (arr_pai.length == 0)
            return [];
        let results = arr_pai[0];
        for (let i = 1; i < arr_pai.length; i++) {
            const pai1 = arr_pai[i];
            const maxPoker1 = cp_logic.bipai({ cards: pai1, type: type }, { cards: results, type: type });
            if (maxPoker1 > 0)
                results = pai1;
        }
        return [results];
    }
    combination22(cards) {
        let arr_pai = [];
        let theCards = cards.map(m => cp_logic.getCardValue(m));
        const alikeCount = cp_logic.checkAlike(theCards);
        const types = [8, 7, 6, 5, 4, 3, 2, 1, 0];
        for (let i = 0; i < types.length; i++) {
            const type3 = types[i];
            if (type3 === 1 || type3 === 0)
                continue;
            let arr_poker3 = cp_logic.getCardArr(cards, type3);
            if (type3 == 8) {
                arr_poker3 = this.GetMaxPai(arr_poker3, type3);
            }
            else if (type3 == 7 && alikeCount[4] == 1) {
                arr_poker3 = this.GetMinPai(arr_poker3, type3);
            }
            else if (type3 == 6 && alikeCount[3] == 1) {
                arr_poker3 = this.GetMinPai(arr_poker3, type3);
            }
            else if (type3 == 3 && alikeCount[3] == 1) {
                arr_poker3 = this.GetMinPai(arr_poker3, type3);
            }
            for (let j = 0; j < arr_poker3.length; j++) {
                const tmp_cards3 = arr_poker3[j];
                let cards_copy3 = utils.array_diff(cards.slice(), tmp_cards3);
                for (let k = i; k < types.length; k++) {
                    const type2 = types[k];
                    let arr_poker2 = cp_logic.getCardArr(cards_copy3, type2);
                    if (type2 == 1 || type2 == 2 || type2 == 3 || type2 == 6 || type2 == 7) {
                        arr_poker2 = this.GetMinPai(arr_poker2, type2);
                    }
                    for (let kk = 0; kk < arr_poker2.length; kk++) {
                        const tmp_cards2 = arr_poker2[kk];
                        let tmp_cards1 = utils.array_diff(cards_copy3.slice(), tmp_cards2);
                        let type1 = GameUtil3.getCardtype(tmp_cards1).type;
                        const res_cards = [];
                        tmp_cards1.sort((a, b) => cp_logic.getCardValue(b) - cp_logic.getCardValue(a));
                        tmp_cards2.sort((a, b) => cp_logic.getCardValue(b) - cp_logic.getCardValue(a));
                        tmp_cards3.sort((a, b) => cp_logic.getCardValue(b) - cp_logic.getCardValue(a));
                        res_cards.push(...tmp_cards1);
                        res_cards.push(...tmp_cards2);
                        res_cards.push(...tmp_cards3);
                        if (type1 == 4 && (type2 != 4 || type3 != 4)) {
                            type1 = 0;
                        }
                        if (type1 == 5 && (type2 != 5 || type3 != 5)) {
                            type1 = 0;
                        }
                        if (type1 == 8 && (type2 != 8 || type3 != 8)) {
                            type1 = 0;
                        }
                        const maxPoker1 = cp_logic.bipai({ type: type1, cards: tmp_cards1 }, { type: type2, cards: tmp_cards2 });
                        const maxPoker2 = cp_logic.bipai({ type: type2, cards: tmp_cards2 }, { type: type3, cards: tmp_cards3 });
                        if (maxPoker1 > 0 || maxPoker2 > 0) {
                            continue;
                        }
                        arr_pai.push({ cards: res_cards, type: [type1, type2, type3] });
                        if (arr_pai.length >= 25) {
                            return arr_pai;
                        }
                        break;
                    }
                }
            }
        }
        return arr_pai;
    }
    sortResult(allResult) {
        const list = [];
        for (let i = 0; i < 4; i++) {
            let cards = allResult[i].slice();
            let card_arr = this.combination22(cards.slice());
            card_arr.sort((a, b) => {
                return (b.type[0] + b.type[1] + b.type[2]) - (a.type[0] + a.type[1] + a.type[2]);
            });
            let BiPaicards = [card_arr[0].cards.slice(0, 3), card_arr[0].cards.slice(3, 8), card_arr[0].cards.slice(8, 13)];
            let currPlayer = new cpPlayer_1.default(0, { uid: i.toString() });
            currPlayer.cards = cards.slice();
            currPlayer.BiPaicards = BiPaicards;
            list.push(currPlayer);
        }
        this.checkCanBiPai(list);
        list.sort((a, b) => { return b.sumgain - a.sumgain; });
        list.forEach((m, i) => {
            allResult[i] = m.cards.slice();
        });
    }
    controlPersonalDeal(positivePlayers, negativePlayers) {
        let allResult = this.shuffleDeck();
        positivePlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        negativePlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        this.sortResult(allResult);
        let dealtPlayers = this.run_Players;
        if (positivePlayers.length) {
            positivePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                const player = this.getPlayer(p.uid);
                player.cards = allResult.shift();
                dealtPlayers = dealtPlayers.filter(dealtPlayer => p.uid !== dealtPlayer.uid);
            });
        }
        else {
            negativePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                const player = this.getPlayer(p.uid);
                player.cards = allResult.pop();
                dealtPlayers = dealtPlayers.filter(dealtPlayer => p.uid !== dealtPlayer.uid);
            });
        }
        dealtPlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
            p.cards = allResult.shift();
        });
    }
    sceneControl(sceneControlState, isPlatformControl) {
        const allResult = this.shuffleDeck();
        if (sceneControlState === constants_1.ControlState.NONE) {
            return this.randomDeal(allResult);
        }
        const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        this.run_Players.forEach(p => p.setControlType(type));
        this.sortResult(allResult);
        const gamePlayers = this.run_Players;
        const luckPlayer = gamePlayers.filter(p => {
            return sceneControlState === constants_1.ControlState.SYSTEM_WIN ? p.isRobot === RoleEnum_1.RoleEnum.ROBOT : p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER;
        }).sort((a, b) => Math.random() - 0.5)[0];
        luckPlayer.cards = allResult.shift();
        gamePlayers.filter(p => p.uid !== luckPlayer.uid).sort(p => Math.random() - 0.5).map(p => {
            allResult.sort((a, b) => Math.random() - 0.5);
            p.cards = allResult.shift();
        });
    }
    randomDeal(allResult) {
        this.run_Players.sort((a, b) => Math.random() - 0.5).forEach(pl => {
            pl.cards = allResult.shift();
        });
    }
    shuffleDeck() {
        let cards = GameUtil.getPai(1);
        if (Math.random() < this.specialCardProbability) {
            for (let i = 0; i < 10000; i++) {
                const poker = GameUtil.getPai(1);
                const copyCards = [...poker];
                while (copyCards.length > 0) {
                    const onePoker = copyCards.splice(0, 13);
                    const type = cp_logic.countAlikePoker({ cards: onePoker });
                    if (type > 0) {
                        cards = [...poker];
                        break;
                    }
                }
            }
        }
        this.initPais = [...cards];
        let allResult = [];
        for (let i = 0; i < this.cardsNumber; i++) {
            let finallyCard = this.initPais.splice(0, 13);
            allResult.push(finallyCard);
        }
        return allResult;
    }
}
exports.default = cpRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3BSb29tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY2hpbmVzZV9wb2tlci9saWIvY3BSb29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUVBQW9FO0FBQ3BFLDhDQUErQztBQUMvQyxvREFBcUQ7QUFDckQsdUNBQXdDO0FBQ3hDLHlDQUEwQztBQUMxQyx5Q0FBa0M7QUFDbEMsdUVBQW9FO0FBRXBFLHVDQUFnQztBQUNoQyxpQ0FBOEI7QUFDOUIsa0RBQXNEO0FBQ3RELHNFQUFvRjtBQUNwRix1RUFBb0U7QUFDcEUsOERBQW9FO0FBRXBFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQztBQUV2QixNQUFNLGtCQUFrQixHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFZckMsTUFBcUIsTUFBTyxTQUFRLHVCQUFvQjtJQWdDcEQsWUFBWSxJQUFTO1FBQ2pCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQTlCaEIsV0FBTSxHQUF5QyxNQUFNLENBQUM7UUFFdEQsaUJBQVksR0FBVyxJQUFJLENBQUM7UUFFNUIsa0JBQWEsR0FBVyxJQUFJLENBQUM7UUFFN0IsdUJBQWtCLEdBQVcsSUFBSSxDQUFDO1FBRWxDLGFBQVEsR0FBYSxFQUFFLENBQUM7UUFHeEIseUJBQW9CLEdBQWlCLElBQUksQ0FBQztRQUUxQyxtQkFBYyxHQUFVLEVBQUUsQ0FBQztRQUUzQixnQkFBVyxHQUFpQixJQUFJLENBQUM7UUFDakMsZ0JBQVcsR0FBaUIsSUFBSSxDQUFDO1FBQ2pDLFlBQU8sR0FBZSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFHOUMsZ0JBQVcsR0FBVyxDQUFDLENBQUM7UUFDeEIsMkJBQXNCLEdBQVcsSUFBSSxDQUFDO1FBQ3RDLGdCQUFXLEdBQWUsRUFBRSxDQUFDO1FBSzdCLGNBQVMsR0FBVyxFQUFFLENBQUM7UUFJbkIsSUFBSSxD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Q3pCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7SUFDTCxDQUFDO0lBR0QsYUFBYSxDQUFDLElBQWdCO1FBQzFCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxFQUFFO1lBQ25CLENBQUMsRUFBRSxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFNUMsRUFBRSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFM0QsRUFBRSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFMUQsRUFBRSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFMUQsRUFBRSxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1NBTWpKO1FBRUQsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLEVBQUU7WUFDbkIsSUFBSSxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUU7Z0JBQzlFLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztnQkFBQyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7YUFDaEQ7WUFDRCxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRTtnQkFDOUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO2dCQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQzthQUNoRDtZQUNELElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFO2dCQUM5RSxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7Z0JBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO2FBQ2hEO1lBRUQsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM3RCxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzdELElBQUksU0FBUyxHQUFHLENBQUMsSUFBSSxTQUFTLEdBQUcsQ0FBQyxFQUFFO2dCQUNoQyxFQUFFLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQzthQUMxQjtTQUNKO1FBQUEsQ0FBQztRQUVGLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFakUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNqRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDckQsSUFBSSxHQUFHLEdBQUcsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLElBQUksR0FBRyxHQUFHLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVqQyxJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUM5RCxJQUFJLFNBQVMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUM3RCxJQUFJLFNBQVMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUU3RCxJQUFJLEdBQUcsQ0FBQyxZQUFZLElBQUksSUFBSSxJQUFJLEdBQUcsQ0FBQyxZQUFZLElBQUksSUFBSSxFQUFFO29CQUN0RCxTQUFTLEdBQUcsQ0FBQyxDQUFDO29CQUNkLFNBQVMsR0FBRyxDQUFDLENBQUM7b0JBQ2QsU0FBUyxHQUFHLENBQUMsQ0FBQztpQkFDakI7cUJBQU0sSUFBSSxHQUFHLENBQUMsWUFBWSxJQUFJLElBQUksRUFBRTtvQkFDakMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNmLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDZixTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQ2xCO3FCQUFNLElBQUksR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLEVBQUU7b0JBQ2pDLFNBQVMsR0FBRyxDQUFDLENBQUM7b0JBQ2QsU0FBUyxHQUFHLENBQUMsQ0FBQztvQkFDZCxTQUFTLEdBQUcsQ0FBQyxDQUFDO2lCQUNqQjtnQkFDRCxJQUFJLE9BQU8sR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBRS9DO29CQUNJLElBQUksU0FBUyxJQUFJLENBQUMsRUFBRTt3QkFDaEIsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDO3dCQUNiLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQzt3QkFDbkIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxFQUFFOzRCQUNmLEVBQUUsR0FBRyxHQUFHLENBQUM7NEJBQ1QsTUFBTSxHQUFHLElBQUksQ0FBQzt5QkFDakI7d0JBQ0QsT0FBTyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ2hDLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFOzRCQUN4QixFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFDcEIsT0FBTyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ3BDO3FCQUNKO2lCQUNKO2dCQUVEO29CQUNJLElBQUksU0FBUyxJQUFJLENBQUMsRUFBRTt3QkFDaEI7NEJBQ0ksSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDOzRCQUNiLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQzs0QkFDbkIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxFQUFFO2dDQUNmLEVBQUUsR0FBRyxHQUFHLENBQUM7Z0NBQ1QsTUFBTSxHQUFHLElBQUksQ0FBQzs2QkFDakI7NEJBQ0QsT0FBTyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ2pDLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFO2dDQUN4QixFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQ0FDcEIsT0FBTyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NkJBQ3BDO2lDQUFNLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFO2dDQUMvQixFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQ0FDcEIsT0FBTyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NkJBQ3BDO2lDQUFNLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFO2dDQUMvQixFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQ0FDcEIsT0FBTyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NkJBQ3BDO3lCQUNKO3FCQUNKO2lCQUNKO2dCQUVEO29CQUNJLElBQUksU0FBUyxJQUFJLENBQUMsRUFBRTt3QkFDaEIsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDO3dCQUNiLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQzt3QkFDbkIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxFQUFFOzRCQUNmLEVBQUUsR0FBRyxHQUFHLENBQUM7NEJBQ1QsTUFBTSxHQUFHLElBQUksQ0FBQzt5QkFDakI7d0JBQ0QsT0FBTyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ2pDLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFOzRCQUN4QixFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFDcEIsT0FBTyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ3BDOzZCQUFNLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFOzRCQUMvQixFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFDcEIsT0FBTyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ3BDO3FCQUNKO2lCQUNKO2dCQUVELEdBQUcsQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQztnQkFDM0IsR0FBRyxDQUFDLEtBQUssSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDO2dCQUMzQixHQUFHLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUM7Z0JBRTNCLEdBQUcsQ0FBQyxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO2dCQUM1QixHQUFHLENBQUMsS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztnQkFDNUIsR0FBRyxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7Z0JBRTVCLElBQUksU0FBUyxHQUFHLENBQUMsSUFBSSxTQUFTLEdBQUcsQ0FBQyxJQUFJLFNBQVMsR0FBRyxDQUFDLEVBQUU7b0JBQ2pELEdBQUcsQ0FBQyxRQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNoRSxHQUFHLENBQUMsUUFBUSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDaEUsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDL0c7cUJBQU0sSUFBSSxTQUFTLEdBQUcsQ0FBQyxJQUFJLFNBQVMsR0FBRyxDQUFDLElBQUksU0FBUyxHQUFHLENBQUMsRUFBRTtvQkFDeEQsR0FBRyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDakUsR0FBRyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDakUsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDbkg7YUFDSjtTQUNKO1FBR0QsS0FBSyxNQUFNLEdBQUcsSUFBSSxtQkFBbUIsRUFBRTtZQUNuQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtnQkFDdkIsS0FBSyxNQUFNLEVBQUUsSUFBSSxtQkFBbUIsRUFBRTtvQkFDbEMsSUFBSSxHQUFHLElBQUksRUFBRSxFQUFFO3dCQUNYLFNBQVM7cUJBQ1o7b0JBQ0QsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtvQkFDekUsRUFBRSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUM7b0JBQ3BCLEdBQUcsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDO2lCQUN4QjthQUNKO1NBQ0o7UUFHRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNsQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3RDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixNQUFNLGVBQWUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDNUUsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQixJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7Z0JBQ2pCLElBQUksT0FBTyxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxFQUFFO29CQUMzQyxRQUFRLEdBQUcsZUFBZSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDaEQsUUFBUSxHQUFHLENBQUMsUUFBUSxDQUFDO2lCQUN4QjtxQkFBTSxJQUFJLE9BQU8sQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsRUFBRTtvQkFDbEQsUUFBUSxHQUFHLGVBQWUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQ2hELFFBQVEsR0FBRyxDQUFDLFFBQVEsQ0FBQTtpQkFDdkI7Z0JBQ0QsT0FBTyxDQUFDLFdBQVcsSUFBSSxRQUFRLENBQUM7Z0JBQ2hDLE9BQU8sQ0FBQyxXQUFXLElBQUksUUFBUSxDQUFDO2FBQ25DO1NBQ0o7UUFFRCxLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksRUFBRTtZQUNuQixFQUFFLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQztTQUMvRTtJQWNMLENBQUM7SUFHRCxLQUFLLENBQUMsVUFBVSxDQUFDLElBQWdCO1FBQzdCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzFCLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDbkIsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUN2RCxPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUN0QjtRQUNELElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztRQUNwQixJQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7UUFFckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFBLDhCQUFpQixFQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUdqRCxLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksRUFBRTtZQUNuQixJQUFJLEVBQUUsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxFQUFFO2dCQUNoQixFQUFFLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFDckMsWUFBWSxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQztnQkFDNUIsV0FBVyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3RDO1NBQ0o7UUFDRCxLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksRUFBRTtZQUNuQixJQUFJLEVBQUUsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxFQUFFO2dCQUNoQixFQUFFLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDLENBQUM7YUFDbkU7U0FDSjtRQUVELEtBQUssSUFBSSxFQUFFLElBQUksSUFBSSxFQUFFO1lBQ2pCLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3QjtRQUNELElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUNoRSxLQUFLLElBQUksRUFBRSxJQUFJLElBQUksRUFBRTtZQUNqQixNQUFNLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNuQztRQUNELElBQUksSUFBSSxHQUFHO1lBQ1AsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDNUMsQ0FBQTtRQUNELElBQUksQ0FBQyxlQUFlLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNyQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUtELG1CQUFtQjtRQUNmLE1BQU0sY0FBYyxHQUFlLEVBQUUsQ0FBQztRQUN0QyxLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDM0IsSUFBSSxDQUFDLEVBQUU7Z0JBQUUsU0FBUztZQUVsQixJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU07Z0JBQUUsMEJBQVcsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDN0MsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUV4QixJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM1QiwwQkFBVyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7U0FDaEM7UUFHRCxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUdELFNBQVMsQ0FBQyxPQUFtQixFQUFFLElBQVk7UUFDdkMsSUFBSSxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUM7WUFBRSxPQUFPLEVBQUUsQ0FBQztRQUNuQyxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFFckMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDOUYsSUFBSSxTQUFTLEdBQUcsQ0FBQztnQkFDYixPQUFPLEdBQUcsSUFBSSxDQUFDO1NBQ3RCO1FBQ0QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFHRCxTQUFTLENBQUMsT0FBbUIsRUFBRSxJQUFZO1FBQ3ZDLElBQUksT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDO1lBQUUsT0FBTyxFQUFFLENBQUM7UUFDbkMsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3JDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzlGLElBQUksU0FBUyxHQUFHLENBQUM7Z0JBQ2IsT0FBTyxHQUFHLElBQUksQ0FBQztTQUN0QjtRQUNELE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBR0QsYUFBYSxDQUFDLEtBQWU7UUFDekIsSUFBSSxPQUFPLEdBQTBDLEVBQUUsQ0FBQztRQUV4RCxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakQsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzFDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ25DLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QixJQUFJLEtBQUssS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUM7Z0JBQUUsU0FBUztZQUN6QyxJQUFJLFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVuRCxJQUFJLEtBQUssSUFBSSxDQUFDLEVBQUU7Z0JBQ1osVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ2xEO2lCQUNJLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN2QyxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDbEQ7aUJBQ0ksSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3ZDLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNsRDtpQkFBTSxJQUFJLEtBQUssSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDekMsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ2xEO1lBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3hDLE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakMsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBRTlELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUNuQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZCLElBQUksVUFBVSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUV6RCxJQUFJLEtBQUssSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsRUFBRTt3QkFDcEUsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO3FCQUNsRDtvQkFDRCxLQUFLLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRTt3QkFDM0MsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUNsQyxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQzt3QkFDbkUsSUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUM7d0JBRW5ELE1BQU0sU0FBUyxHQUFhLEVBQUUsQ0FBQzt3QkFFL0IsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUUvRSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBRS9FLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDL0UsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDO3dCQUM5QixTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUM7d0JBQzlCLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQzt3QkFDOUIsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLEVBQUU7NEJBQzFDLEtBQUssR0FBRyxDQUFDLENBQUM7eUJBQ2I7d0JBQ0QsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLEVBQUU7NEJBQzFDLEtBQUssR0FBRyxDQUFDLENBQUM7eUJBQ2I7d0JBQ0QsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLEVBQUU7NEJBQzFDLEtBQUssR0FBRyxDQUFDLENBQUM7eUJBQ2I7d0JBRUQsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUs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