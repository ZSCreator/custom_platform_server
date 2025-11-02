"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BGPlayer_1 = require("./BGPlayer");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const pinus_1 = require("pinus");
const control_1 = require("./control");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const constants_1 = require("../../../services/newControl/constants");
const utils = require("../../../utils/index");
const MessageService = require("../../../services/MessageService");
const BG_logic = require("./BG_logic");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const BGRoomManager_1 = require("../lib/BGRoomManager");
const WAIT_TIME = 5000;
class BGRoom extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.players = new Array(5).fill(null);
        this.status = 'INWAIT';
        this.banker = {
            banker_cards: [],
            type: 0,
            Points: 0,
            Points_t: 0,
            profit: 0
        };
        this.record_history = { oper: [], info: [], area_list: [] };
        this.control = new control_1.default({ room: this });
        this.backupCards = [];
        this.blackJack = false;
        this.backendServerId = pinus_1.pinus.app.getServerId();
        this.entryCond = opts.entryCond;
        this.lowBet = opts.lowBet;
        this.Initialization();
    }
    close() {
        this.sendRoomCloseMessage();
        this.players = [];
    }
    Initialization() {
        this.battle_kickNoOnline();
        this.curr_doing_seat = -1;
        this.banker = {
            type: 0,
            banker_cards: [],
            Points: 0,
            Points_t: 0,
            profit: 0
        };
        this.area_list = {};
        this.status = 'INWAIT';
        this.updateRoundId();
        this.record_history = { oper: [], info: [] };
        this.backupCards = [];
        this.players.forEach(p => !!p && p.init());
        this.blackJack = false;
    }
    addPlayerInRoom(dbPlayer) {
        let currPlayer = this.getPlayer(dbPlayer.uid);
        if (currPlayer) {
            currPlayer.onLine = true;
            this.addMessage(dbPlayer);
            return true;
        }
        if (this.isFull())
            return false;
        if (dbPlayer.isRobot == 2 && this.players.filter(c => !!c && c.isRobot == 2).length >= 2) {
        }
        const i = this.players.findIndex(m => !m);
        this.players[i] = new BGPlayer_1.default(i, dbPlayer);
        this.addMessage(dbPlayer);
        const pl = this.players[i];
        this.channelIsPlayer('BlackGame.onEntry', {
            pl: {
                seat: pl.seat,
                uid: pl.uid,
                nickname: pl.nickname,
                headurl: pl.headurl,
                gold: pl.gold,
            },
        });
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
                this.channelIsPlayer('ZJH_onExit', {});
            }
            break;
        } while (0);
        BGRoomManager_1.default.removePlayerSeat(playerInfo.uid);
    }
    battle_kickNoOnline() {
        const offLinePlayers = [];
        for (const pl of this.players) {
            if (!pl)
                continue;
            if (!pl.onLine)
                BGRoomManager_1.default.removePlayer(pl);
            offLinePlayers.push(pl);
            this.kickOutMessage(pl.uid);
            BGRoomManager_1.default.removePlayerSeat(pl.uid);
            this.players[pl.seat] = null;
        }
        this.kickingPlayer(pinus_1.pinus.app.getServerId(), offLinePlayers);
    }
    wait(playerInfo) {
        if (this.status != 'INWAIT')
            return;
        if (this.players.filter(pl => pl).length <= 1) {
            this.channelIsPlayer('BlackGame.onWait', { waitTime: 0 });
            return;
        }
        this.channelIsPlayer('BlackGame.onWait', { waitTime: WAIT_TIME });
        this.lastWaitTime = Date.now();
        clearTimeout(this.waitTimer);
        this.waitTimer = setTimeout(() => {
            const list = this.players.filter(pl => pl);
            if (list.length >= 2) {
                this.handler_start(list);
            }
            else {
                this.channelIsPlayer('BlackGame.onWait', { waitTime: 0 });
            }
        }, WAIT_TIME);
    }
    handler_start(list) {
        const auto_time = 15 * 1000;
        this.status = "ININIT";
        this.players.forEach(pl => pl && (pl.status = 'GAME'));
        this.channelIsPlayer("BlackGame.start", { auto_time });
        for (let idx = 0; idx < this.players.length; idx++) {
            const pl = this.players[idx];
            this.area_list[idx] = [];
            if (pl) {
                this.area_list[idx].push({ bet: 0, profit: 0, insurance: false, insurance_bet: -1, cards: [], type: 0, operate_status: 0, Points: 0, Points_t: 0, uid: pl.uid, addMultiple: false });
            }
        }
        this.handler_pass(auto_time);
        return;
    }
    async handler_deal() {
        await utils.delay(1000);
        this.allcards = BG_logic.shuffle_cards();
        this.banker.banker_cards = this.allcards.splice(0, 2);
        let res = BG_logic.get_Points(this.banker.banker_cards);
        this.banker.Points = res.Points;
        for (let key in this.area_list) {
            const area_list = this.area_list[key];
            for (const ee of area_list) {
                const currPlayer = this.getPlayer(ee.uid);
                let cards = this.allcards.splice(0, 2);
                if (currPlayer.isRobot == RoleEnum_1.RoleEnum.REAL_PLAYER) {
                }
                ee.cards = cards.map(c => c);
                const res = BG_logic.get_Points(ee.cards);
                ee.Points = res.Points;
                ee.Points_t = res.Points_t;
                ee.type = res.type;
            }
        }
        const opts = {
            banker_cards: this.banker.banker_cards.map((c, i) => i == 1 ? 0x99 : c),
            area_list: this.area_list
        };
        this.channelIsPlayer("BlackGame.deal", opts);
        const h = BG_logic.getCardValue(this.banker.banker_cards[0]);
        const t = BG_logic.getCardValue(this.banker.banker_cards[1]);
        if (h >= 10) {
            await utils.delay(this.players.length * 1000);
            await this.handler_check();
        }
        await utils.delay(5 * 1000);
        if (h >= 10 && t == 1) {
            this.blackJack = true;
            return this.handler_complete();
        }
        if (h == 1) {
            for (let key in this.area_list) {
                const area_list = this.area_list[key];
                for (const ee of area_list) {
                    ee.insurance = true;
                }
            }
            return this.insurance_loop();
        }
        this.handler_loop();
    }
    async handler_check(twoStrategy = false) {
        let res = BG_logic.get_Points(this.banker.banker_cards);
        this.channelIsPlayer("BlackGame.checkCards", { type: res.type });
        if (twoStrategy) {
            await utils.delay(3 * 1000);
            if (res.type == 3) {
                this.blackJack = true;
                this.handler_complete();
            }
            else {
                this.handler_loop();
            }
        }
    }
    insurance_loop() {
        this.status = "INGAME";
        clearTimeout(this.Oper_timeout);
        let currPlayer = this.players[0];
        currPlayer = null;
        let idx = 0;
        let location = 0;
        let find = false;
        for (let key in this.area_list) {
            const temp_areaList = this.area_list[key];
            for (let i = 0; i < temp_areaList.length; i++) {
                const ee = temp_areaList[i];
                if (ee.insurance && ee.insurance_bet == -1) {
                    let res = BG_logic.get_Points(ee.cards);
                    if (res.Points == 21) {
                        ee.operate_status = 3;
                        ee.insurance_bet = 0;
                        continue;
                    }
                    currPlayer = this.getPlayer(ee.uid);
                    location = parseInt(key);
                    idx = i;
                    find = true;
                    break;
                }
            }
            if (find)
                break;
        }
        if (currPlayer) {
            this.set_next_doing_seat(currPlayer.seat, location, idx);
        }
        else {
            this.handler_loop();
        }
    }
    handler_loop() {
        this.status = "INGAME";
        clearTimeout(this.Oper_timeout);
        let currPlayer = this.players[0];
        currPlayer = null;
        let idx = 0;
        let location = 0;
        let find = false;
        for (let key in this.area_list) {
            const temp_areaList = this.area_list[key];
            for (let i = 0; i < temp_areaList.length; i++) {
                const ee = temp_areaList[i];
                if (ee.operate_status == 0) {
                    let res = BG_logic.get_Points(ee.cards);
                    if (res.Points == 21) {
                        ee.operate_status = 3;
                        continue;
                    }
                    currPlayer = this.getPlayer(ee.uid);
                    location = parseInt(key);
                    idx = i;
                    find = true;
                    break;
                }
            }
            if (find)
                break;
        }
        if (currPlayer) {
            this.set_next_doing_seat(currPlayer.seat, location, idx);
        }
        else {
            this.handler_complete();
        }
    }
    set_next_doing_seat(doing, location, idx) {
        const playerInfo = this.players[doing];
        this.curr_doing_seat = doing;
        this.idx = idx;
        this.location = location;
        playerInfo.state = "PS_OPER";
        const auto_time = 15 * 1000;
        let separatePoker = false;
        const card1 = this.area_list[this.location][0].cards[0];
        const card2 = this.area_list[this.location][0].cards[1];
        if (this.area_list[location].length == 1 && BG_logic.is_eq_cards(card1, card2)) {
            separatePoker = true;
        }
        const temp_areaList = this.area_list[this.location][this.idx];
        const opts = {
            seat: playerInfo.seat,
            location,
            idx,
            area_list: this.area_list,
            auto_time,
            separatePoker,
            insurance: temp_areaList.insurance,
            insurance_bet: temp_areaList.insurance_bet
        };
        for (const pl of this.players) {
            const member = pl && this.channel.getMember(pl.uid);
            member && MessageService.pushMessageByUids('BlackGame.oper', opts, member);
        }
        this.handler_pass(auto_time);
    }
    handler_pass(auto_time) {
        this.lastWaitTime = Date.now();
        clearTimeout(this.Oper_timeout);
        this.Oper_timeout = setTimeout(() => {
            if (this.status == "ININIT") {
                for (const pl of this.players) {
                    if (!pl || pl.bet > 0)
                        continue;
                    pl.action_first(this, this.lowBet, pl.seat, true);
                }
                this.handler_deal();
            }
            else if (this.status == "INGAME") {
                const playerInfo = this.players[this.curr_doing_seat];
                const temp_areaList = this.area_list[this.location];
                if (temp_areaList[0].insurance && temp_areaList[0].insurance_bet == -1) {
                    playerInfo.action_insurance(this, false);
                }
                else {
                    playerInfo.action_stop_getCard(this);
                }
            }
        }, auto_time);
    }
    fillCard() {
        this.banker.banker_cards.push(this.backupCards.shift());
        const result = BG_logic.get_Points(this.banker.banker_cards);
        this.banker.type = result.type;
        this.banker.Points = result.Points;
        this.banker.Points_t = result.Points_t;
    }
    async handler_complete() {
        const result = BG_logic.get_Points(this.banker.banker_cards);
        this.banker.type = result.type;
        this.banker.Points = result.Points;
        if (!this.blackJack) {
            this.banker.banker_cards = this.banker.banker_cards.slice(0, 1);
            await this.control.runControl();
            this.fillCard();
        }
        let optss = { banker: this.banker, operate_status: 0 };
        this.channelIsPlayer("BlackGame.banker", optss);
        await utils.delay(3000);
        while (true) {
            if (this.banker.Points > 17 || this.banker.banker_cards.length >= 5 || this.backupCards.length === 0) {
                break;
            }
            this.fillCard();
            const optss = { banker: this.banker, operate_status: 0 };
            if (this.banker.Points > 21) {
                optss.operate_status = 2;
            }
            this.channelIsPlayer("BlackGame.banker", optss);
            await utils.delay(3000);
        }
        this.forecastSettlement(true);
        this.record_history.info = this.players.filter(c => !!c).map(c => {
            return {
                uid: c.uid,
                seat: c.seat,
                gold: c.gold,
                profit: c.profit,
            };
        });
        this.record_history.area_list = this.area_list;
        this.record_history.banker = this.banker;
        for (const pl of this.players.filter(pl => !!pl)) {
            if (pl.profit < 0 && Math.abs(pl.profit) > pl.initgold) {
                pl.profit = -pl.initgold;
            }
            this.banker.profit += -pl.profit;
            await pl.settlement(this);
        }
        const opts = {
            banker_profit: this.banker.profit,
            area_list: this.area_list,
            list: this.players.filter(c => !!c).map(c => {
                return {
                    uid: c.uid,
                    seat: c.seat,
                    gold: c.gold,
                    profit: c.profit,
                };
            })
        };
        this.channelIsPlayer("BlackGame.settlement", opts);
        this.Initialization();
    }
    getWaitTime() {
        return Date.now() - this.lastWaitTime;
    }
    randomDeal(kill = false) {
        this.allcards.push(...this.backupCards);
        this.allcards.sort((x, y) => Math.random() - 0.5);
        this.backupCards = [];
        let result = BG_logic.get_Points(this.banker.banker_cards);
        const bankerCards = this.banker.banker_cards.slice();
        while (result.Points < 17 && bankerCards.length < 5) {
            const card = this.allcards.shift();
            bankerCards.push(card);
            this.backupCards.push(card);
            result = BG_logic.get_Points(bankerCards);
            if (result.type === 0) {
                break;
            }
        }
        if (!kill && result.type === 3) {
            return this.randomDeal();
        }
    }
    personalControl(controlPlayers, state) {
        const players = controlPlayers.map(p => {
            const player = this.getPlayer(p.uid);
            player.setControlType(constants_1.ControlKinds.PERSONAL);
            return player;
        });
        for (let i = 0; i < 100; i++) {
            this.randomDeal(false);
            this.forecastSettlement();
            const profit = players.reduce((total, p) => (p.profit + total), 0);
            console.warn('66666666666666', controlPlayers, profit, players.map(p => p.uid), state);
            if ((state === commonConst_1.CommonControlState.WIN && profit >= 0) ||
                (state === commonConst_1.CommonControlState.LOSS && profit <= 0)) {
                break;
            }
        }
    }
    sceneControl(sceneControlState, isPlatformControl) {
        if (sceneControlState === constants_1.ControlState.NONE) {
            return this.randomDeal();
        }
        const type = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        const players = this.players.filter(p => !!p);
        players.forEach(p => p.setControlType(type));
        for (let i = 0; i < 100; i++) {
            this.randomDeal(false);
            this.forecastSettlement();
            const profit = players.reduce((total, p) => (p.profit + total), 0);
            if ((sceneControlState === constants_1.ControlState.PLAYER_WIN && profit >= 0) ||
                (sceneControlState === constants_1.ControlState.SYSTEM_WIN && profit <= 0)) {
                break;
            }
        }
    }
    forecastSettlement(final) {
        this.players.forEach(p => !!p && p.initProfit());
        const bankerCards = final ? this.banker.banker_cards : [...this.banker.banker_cards, ...this.backupCards];
        const banker_result = BG_logic.get_Points(bankerCards);
        if (BG_logic.getCardValue(bankerCards[0]) == 1) {
            for (let key in this.area_list) {
                const area_list = this.area_list[key];
                if (area_list.length > 0 && area_list[0].insurance == true && area_list[0].insurance_bet > 0) {
                    const pl = this.getPlayer(area_list[0].uid);
                    if (banker_result.type == 3) {
                        pl.profit -= area_list[0].insurance_bet;
                    }
                    else {
                        pl.profit -= area_list[0].insurance_bet;
                    }
                }
            }
        }
        for (let key in this.area_list) {
            const temp_areaList = this.area_list[key];
            for (const ee of temp_areaList) {
                const pl = this.getPlayer(ee.uid);
                if (banker_result.type == 3 && ee.insurance_bet > 0)
                    continue;
                const res = BG_logic.get_Points(ee.cards, temp_areaList.length == 2);
                const ret = BG_logic.bipai(banker_result, res);
                let rate = 1;
                if (ret == 1) {
                    if (banker_result.type == 3)
                        rate = 1.5;
                    pl.profit -= ee.bet * rate;
                    ee.profit -= ee.bet * rate;
                }
                else if (ret == -1) {
                    if (res.type == 3)
                        rate = 1.5;
                    pl.profit += ee.bet * rate;
                    ee.profit += ee.bet * rate;
                }
            }
        }
    }
}
exports.default = BGRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQkdSb29tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvQmxhY2tHYW1lL2xpYi9CR1Jvb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5Q0FBa0M7QUFDbEMsdUVBQW9FO0FBQ3BFLGlDQUE4QjtBQUM5Qix1Q0FBZ0M7QUFDaEMsa0ZBQXNGO0FBRXRGLHNFQUFvRjtBQUNwRiw4Q0FBK0M7QUFDL0MsbUVBQW9FO0FBQ3BFLHVDQUF3QztBQUN4Qyx1RUFBb0U7QUFDcEUsd0RBQXNFO0FBR3RFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQztBQUd2QixNQUFxQixNQUFPLFNBQVEsdUJBQW9CO0lBd0RwRCxZQUFZLElBQVM7UUFDakIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBeERoQixZQUFPLEdBQWUsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRzlDLFdBQU0sR0FBa0UsUUFBUSxDQUFDO1FBUWpGLFdBQU0sR0FBRztZQUNMLFlBQVksRUFBRSxFQUFFO1lBQ2hCLElBQUksRUFBRSxDQUFDO1lBQ1AsTUFBTSxFQUFFLENBQUM7WUFDVCxRQUFRLEVBQUUsQ0FBQztZQUNYLE1BQU0sRUFBRSxDQUFDO1NBQ1osQ0FBQztRQThCRixtQkFBYyxHQUFnRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDcEgsWUFBTyxHQUFZLElBQUksaUJBQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRy9DLGdCQUFXLEdBQWEsRUFBRSxDQUFDO1FBRTNCLGNBQVMsR0FBWSxLQUFLLENBQUM7UUFJdkIsSUFBSSxDQUFDLGVBQWUsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQy9DLElBQUksQ0FBQyxT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