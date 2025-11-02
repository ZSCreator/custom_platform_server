import BGPlayer from './BGPlayer';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import { pinus } from "pinus";
import Control from "./control";
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import { PersonalControlPlayer } from "../../../services/newControl";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import utils = require('../../../utils/index');
import MessageService = require('../../../services/MessageService');
import BG_logic = require("./BG_logic");
import { RoleEnum } from '../../../common/constant/player/RoleEnum';
import roomManager, { BGRoomManagerImpl } from '../lib/BGRoomManager';

/**等待准备时间 */
const WAIT_TIME = 5000;


export default class BGRoom extends SystemRoom<BGPlayer>{
    players: BGPlayer[] = new Array(5).fill(null);// 玩家列表;
    entryCond: number;
    /**状态 INWAIT.等待 ININIT.初始化  INGAME.游戏中 END.回合结束 */
    status: 'NONE' | 'INWAIT' | 'ININIT' | 'Insurance' | 'INGAME' | 'END' = 'INWAIT';
    backendServerId: string;
    /**最低押注 */
    lowBet: number;

    curr_doing_seat: number;

    /**系统庄牌 */
    banker = {
        banker_cards: [],
        type: 0,
        Points: 0,
        Points_t: 0,
        profit: 0
    };
    area_list: {
        [seat: number]: {
            bet: number,
            profit: number,
            cards: number[],
            /**是否可以购买保险 */
            insurance: boolean,
            /**购买保险状态 */
            insurance_bet: number,
            /**0可以继续操作 2爆牌 3 停牌*/
            operate_status: 0 | 2 | 3,
            /**加倍 */
            addMultiple: boolean,
            /** 0爆牌，1点数牌，2五小龙，3黑杰克*/
            type: number,
            Points: number,
            Points_t: number,
            uid: string
        }[]
    };
    allcards: number[];
    lastWaitTime: number;
    waitTimer: NodeJS.Timeout;
    Oper_timeout: NodeJS.Timeout;
    /**下注区域 */
    location: number;
    /**区域下标 */
    idx: number;
    /**一局的历史记录 */
    record_history: { oper: any[], info: any[], area_list?: any, banker?: any } = { oper: [], info: [], area_list: [] };
    control: Control = new Control({ room: this });

    // 备用牌组
    backupCards: number[] = [];
    // 黑jack
    blackJack: boolean = false;

    constructor(opts: any) {
        super(opts);
        this.backendServerId = pinus.app.getServerId();
        this.entryCond = opts.entryCond;
        this.lowBet = opts.lowBet;
        this.Initialization();
    }
    close() {
        this.sendRoomCloseMessage();
        this.players = [];
    }
    Initialization() {
        //踢掉离线玩家
        this.battle_kickNoOnline();
        // await utils.delay(3500);
        this.curr_doing_seat = -1;// 当前发话的人
        this.banker = {
            type: 0,
            banker_cards: [],
            Points: 0,
            Points_t: 0,
            profit: 0
        }
        this.area_list = {};
        this.status = 'INWAIT';// 等待玩家准备
        this.updateRoundId();
        this.record_history = { oper: [], info: [] };
        this.backupCards = [];
        this.players.forEach(p => !!p && p.init());
        this.blackJack = false;
    }

    /**添加玩家 */
    addPlayerInRoom(dbPlayer: any) {
        let currPlayer = this.getPlayer(dbPlayer.uid);
        if (currPlayer) {
            currPlayer.onLine = true;
            this.addMessage(dbPlayer);
            return true;
        }
        if (this.isFull()) return false;
        if (dbPlayer.isRobot == 2 && this.players.filter(c => !!c && c.isRobot == 2).length >= 2) {
            //return false;
        }
        const i = this.players.findIndex(m => !m);
        this.players[i] = new BGPlayer(i, dbPlayer);

        // 添加到消息通道
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
    /**
    * 
    * @param playerInfo 
    * @param isOffLine true离线
    */
    leave(playerInfo: BGPlayer, isOffLine: boolean) {
        this.kickOutMessage(playerInfo.uid);
        do {
            if (isOffLine) {
                playerInfo.onLine = false;
                return;
            }
            this.players[playerInfo.seat] = null;
            if (this.status == "INWAIT") {
                this.channelIsPlayer('ZJH_onExit', {
                    // kickPlayers: [playerInfo.kickStrip()],
                });
                // this._players = this.players.slice();
            }
            break;
        } while (0);
        roomManager.removePlayerSeat(playerInfo.uid);
    }
    /**踢掉离线玩家 */
    protected battle_kickNoOnline() {
        const offLinePlayers: BGPlayer[] = [];
        for (const pl of this.players) {
            if (!pl) continue;
            // 不在线移除玩家 在线则不移除 因为还在这个场中
            if (!pl.onLine) roomManager.removePlayer(pl);
            offLinePlayers.push(pl);
            // this.leave(pl, false);
            this.kickOutMessage(pl.uid);
            roomManager.removePlayerSeat(pl.uid);
            this.players[pl.seat] = null;
        }
        //更新数据（前端需要切换场景）
        this.kickingPlayer(pinus.app.getServerId(), offLinePlayers);
    }

    // 等待玩家准备
    wait(playerInfo?: BGPlayer) {
        if (this.status != 'INWAIT') return;

        // 如果只剩一个人的时候或者没有人了 就直接关闭房间
        if (this.players.filter(pl => pl).length <= 1) {
            this.channelIsPlayer('BlackGame.onWait', { waitTime: 0 });
            return;
        }
        // 通知 所有人开始准备
        // if (Date.now() - this.lastWaitTime < WAIT_TIME) {//5s内就不重复通知玩家
        //     const member = playerInfo && this.channel.getMember(playerInfo.uid);
        //     if (member) {
        //         let waitTime = Math.max(WAIT_TIME - (Date.now() - this.lastWaitTime), 0);
        //         MessageService.pushMessageByUids('BlackGame.onWait', { waitTime }, member);
        //     }
        //     return;
        // }
        this.channelIsPlayer('BlackGame.onWait', { waitTime: WAIT_TIME });

        this.lastWaitTime = Date.now(); // 这个记录只用于前段请求的时候用 毫秒
        // 等一段时间后强行开始发牌
        clearTimeout(this.waitTimer);
        this.waitTimer = setTimeout(() => {
            // 人数超过2个就强行开始
            const list = this.players.filter(pl => pl);
            if (list.length >= 2) {
                this.handler_start(list);
            } else {// 否则就关闭房间 因为当玩家进来的时候会再次检查
                this.channelIsPlayer('BlackGame.onWait', { waitTime: 0 });// 通知还在的人不要准备了 等待其他人来
            }
        }, WAIT_TIME);
    }

    /**下注 */
    protected handler_start(list: BGPlayer[]) {
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
    /**发牌 */
    async handler_deal() {
        await utils.delay(1000);
        this.allcards = BG_logic.shuffle_cards();
        // this.allcards = [10, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
        this.banker.banker_cards = this.allcards.splice(0, 2);
        let res = BG_logic.get_Points(this.banker.banker_cards);
        this.banker.Points = res.Points;

        for (let key in this.area_list) {
            const area_list = this.area_list[key];
            for (const ee of area_list) {
                const currPlayer = this.getPlayer(ee.uid);
                let cards = this.allcards.splice(0, 2);
                if (currPlayer.isRobot == RoleEnum.REAL_PLAYER) {
                    // cards = [1, 1];
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
            // banker_cards: [...this.banker.banker_cards, 0x99],
            area_list: this.area_list
        }
        this.channelIsPlayer("BlackGame.deal", opts);
        /**发牌后，如果庄家的明牌是10,J,Q,K，庄家会检查底牌看是否形成黑杰克。如果庄家的底牌是A，那么翻开底牌，本局直接进行结算 */
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
        /**如果庄家的明牌是A，闲家可以选择是否另外购买保险。购买保险需要花费本局下注金额的一半 */
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

    /**检查底牌 */
    async handler_check(twoStrategy = false) {
        let res = BG_logic.get_Points(this.banker.banker_cards);
        this.channelIsPlayer("BlackGame.checkCards", { type: res.type });
        if (twoStrategy) {
            await utils.delay(3 * 1000);
            if (res.type == 3) {
                this.blackJack = true;
                this.handler_complete();
            } else {
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
                    if (res.Points == 21) {//起手21点就不要操作了
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
            if (find) break;
        }
        if (currPlayer) {
            // console.warn(this.roomId, location, idx);
            this.set_next_doing_seat(currPlayer.seat, location, idx);
        } else {
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
                    if (res.Points == 21) {//起手21点就不要操作了
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
            if (find) break;
        }
        if (currPlayer) {
            // console.warn(this.roomId, location, idx);
            this.set_next_doing_seat(currPlayer.seat, location, idx);
        } else {
            this.handler_complete();
        }
    }

    /**发话 */
    protected set_next_doing_seat(doing: number, location: number, idx: number) {
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

    handler_pass(auto_time: number) {
        this.lastWaitTime = Date.now();
        clearTimeout(this.Oper_timeout);
        this.Oper_timeout = setTimeout(() => {
            if (this.status == "ININIT") {
                for (const pl of this.players) {
                    if (!pl || pl.bet > 0) continue;
                    pl.action_first(this, this.lowBet, pl.seat, true);
                }
                this.handler_deal();
            } else if (this.status == "INGAME") {
                const playerInfo = this.players[this.curr_doing_seat];
                const temp_areaList = this.area_list[this.location];
                if (temp_areaList[0].insurance && temp_areaList[0].insurance_bet == -1) {
                    playerInfo.action_insurance(this, false);
                } else {
                    playerInfo.action_stop_getCard(this);
                }
            }
        }, auto_time);
    }

    /**
     * 补牌
     */
    fillCard() {
        this.banker.banker_cards.push(this.backupCards.shift());
        const result = BG_logic.get_Points(this.banker.banker_cards);
        this.banker.type = result.type;
        this.banker.Points = result.Points;
        this.banker.Points_t = result.Points_t;
    }


    async handler_complete() {
        const result = BG_logic.get_Points(this.banker.banker_cards);
        /**这个时候才可以赋值 */
        this.banker.type = result.type;
        this.banker.Points = result.Points;
        // 如果不是blackJack 则第二牌张牌不要, 进入调控状态。
        if (!this.blackJack) {
            this.banker.banker_cards = this.banker.banker_cards.slice(0, 1);

            // 开始调控
            await this.control.runControl();

            // 补第第二张牌
            this.fillCard();
        }

        let optss = { banker: this.banker, operate_status: 0 };
        this.channelIsPlayer("BlackGame.banker", optss);
        await utils.delay(3000);
        while (true) {
            if (this.banker.Points > 17 || this.banker.banker_cards.length >= 5 || this.backupCards.length === 0) {
                break;
            }

            // 补一张牌
            this.fillCard();
            const optss = { banker: this.banker, operate_status: 0 };
            if (this.banker.Points > 21) {
                optss.operate_status = 2;
            }
            this.channelIsPlayer("BlackGame.banker", optss);
            await utils.delay(3000);
        }

        // 计算
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
            //钱不够扣的情况
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
                }
            })
        }
        this.channelIsPlayer("BlackGame.settlement", opts);
        this.Initialization();
    }

    getWaitTime() {
        return Date.now() - this.lastWaitTime;
    }

    /**
     * 随机开奖
     */
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
        // console.warn('666666666', bankerCards, this.backupCards)

        // 如果不是杀进入调控状态则不再开黑jack
        if (!kill && result.type === 3) {
            return this.randomDeal();
        }
    }

    /**
     * 个人调控
     * @param controlPlayers
     * @param state
     */
    personalControl(controlPlayers: PersonalControlPlayer[], state: CommonControlState) {
        const players = controlPlayers.map(p => {
            const player = this.getPlayer(p.uid);
            player.setControlType(ControlKinds.PERSONAL);

            return player;
        });

        for (let i = 0; i < 100; i++) {
            this.randomDeal(false);
            this.forecastSettlement();

            const profit = players.reduce((total, p) => (p.profit + total), 0);

            console.warn('66666666666666', controlPlayers, profit, players.map(p => p.uid), state);
            if ((state === CommonControlState.WIN && profit >= 0) ||
                (state === CommonControlState.LOSS && profit <= 0)) {
                break;
            }
        }
    }

    /**
     * 场控
     * @param sceneControlState
     * @param isPlatformControl
     */
    sceneControl(sceneControlState: ControlState, isPlatformControl: boolean) {
        if (sceneControlState === ControlState.NONE) {
            return this.randomDeal();
        }

        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        const players = this.players.filter(p => !!p);
        players.forEach(p => p.setControlType(type));

        for (let i = 0; i < 100; i++) {
            this.randomDeal(false);
            this.forecastSettlement();

            const profit = players.reduce((total, p) => (p.profit + total), 0);

            if ((sceneControlState === ControlState.PLAYER_WIN && profit >= 0) ||
                (sceneControlState === ControlState.SYSTEM_WIN && profit <= 0)) {
                break;
            }
        }
    }


    /**
     * 预结算
     */
    forecastSettlement(final?: boolean) {
        this.players.forEach(p => !!p && p.initProfit());

        const bankerCards = final ? this.banker.banker_cards : [...this.banker.banker_cards, ...this.backupCards];
        const banker_result = BG_logic.get_Points(bankerCards);


        if (BG_logic.getCardValue(bankerCards[0]) == 1) {
            for (let key in this.area_list) {
                const area_list = this.area_list[key];
                if (area_list.length > 0 && area_list[0].insurance == true && area_list[0].insurance_bet > 0) {
                    const pl = this.getPlayer(area_list[0].uid);
                    if (banker_result.type == 3) {//A+一个10点 黑桃杰克
                        pl.profit -= area_list[0].insurance_bet;//退下注金额，保费 不退
                    } else {
                        pl.profit -= area_list[0].insurance_bet;//保费归庄家所有
                    }
                }
            }
        }

        for (let key in this.area_list) {
            const temp_areaList = this.area_list[key];
            for (const ee of temp_areaList) {
                const pl = this.getPlayer(ee.uid);
                /**买保险后退保费，跳过结算 */
                if (banker_result.type == 3 && ee.insurance_bet > 0) continue;
                const res = BG_logic.get_Points(ee.cards, temp_areaList.length == 2);
                const ret = BG_logic.bipai(banker_result, res);
                let rate = 1;
                if (ret == 1) {
                    if (banker_result.type == 3) rate = 1.5;
                    pl.profit -= ee.bet * rate;
                    ee.profit -= ee.bet * rate;
                } else if (ret == -1) {
                    if (res.type == 3) rate = 1.5;
                    pl.profit += ee.bet * rate;
                    ee.profit += ee.bet * rate;
                }
            }
        }
    }
}
