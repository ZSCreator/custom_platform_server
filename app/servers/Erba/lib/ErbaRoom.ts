import { pinus } from 'pinus';
import ErbaPlayer from './ErbaPlayer';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import { RoleEnum } from '../../../common/constant/player/RoleEnum';
import { PersonalControlPlayer } from "../../../services/newControl";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import MessageService = require('../../../services/MessageService');
import utils = require('../../../utils/index');
import { fixNoRound } from "../../../utils/lottery/commonUtil";
import Erba_logic = require("./Erba_logic");
import ErbaConst = require("./ErbaConst");
import Control from "./control";
import roomManager, { ErRoomManger } from '../lib/ErbaRoomMgr';

/**等待准备时间 */
const WAIT_TIME = 3000;
/**发话时间 */
const AUTO_TIME = 15000;
const CC_DEBUG = false;
/**
 * 游戏房间
 * @property endTime 回合结束时间
 * @property zipResult 压缩结果
 */
export default class landRoom extends SystemRoom<ErbaPlayer> {
    entryCond: number;
    /**底注 */
    lowBet: number;
    /**已经多少轮游戏了 */
    roundTimes: number = 1;
    /** 0 开局 1 开始叫庄 2庄家宣布 3 玩家投注 3 摇骰子 4 发牌 5 结算*/
    status: 'NONE' | 'INWAIT' | 'startNextHand' | 'startGrab' | 'banker' | 'startBet' | 'sice' | 'showCard' | 'sendResult' = 'INWAIT';
    /**记录开始等待时候的时间 */
    lastWaitTime: number = 0;
    /**记录开始发话时候的时间 */
    lastFahuaTime: number = 0;
    /**自动操作倒计时 */
    auto_delay = AUTO_TIME;
    /**一局的历史记录 */
    record_history = { banker_uid: "", oper: [], info: [] };

    waitTimeout: NodeJS.Timer = null;

    /**玩家列表 */
    players: ErbaPlayer[] = new Array(4).fill(null);

    /**开始一局游戏的时间 */
    startGameTime: number = 0;
    endTime: number;
    zipResult: string = '';
    countdown: number;
    Oper_timeout: { [key: string]: NodeJS.Timeout } = {};
    Oper_timeout_startGrab: NodeJS.Timeout;
    Oper_timeout_startBet: NodeJS.Timeout;
    banker: ErbaPlayer = null;
    setSice: number[] = [];
    cards: number[];
    cardsDealt: number[] = [];
    control: Control = new Control({ room: this });
    statistics: number[];

    constructor(opts: any) {
        super(opts);
        this.entryCond = opts.entryCond || 0; // 进入条件
        this.lowBet = opts.lowBet || 50; // 底注
        this.Initialization();
    }

    Initialization() {
        this.roundTimes = 1;
        this.lastFahuaTime = 0;
        this.record_history = { banker_uid: "", oper: [], info: [] };
        this.startGameTime = 0;
        this.setSice = [];
        this.banker = null;
        this.battle_kickNoOnline();
        this.status = "INWAIT"; // 等待玩家准备
        this.cards = Erba_logic.shuffle_cards();
        this.cardsDealt = [];
        this.statistics = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // this.updateRoundId();
    }
    close() {
        this.sendRoomCloseMessage();
        this.players = [];
    }
    /**添加玩家 */
    addPlayerInRoom(dbplayer) {
        const playerInfo = this.getPlayer(dbplayer.uid);
        // 如果玩家在房间中说明是掉线
        if (playerInfo) {
            playerInfo.sid = dbplayer.sid;
            this.offLineRecover(playerInfo);
            return true;
        }

        // 如果房间已满
        if (this.isFull())
            return false;

        // 给玩家选一个空座位 空位置压入数组
        const indexArr: number[] = [];
        this.players.forEach((m, i) => !m && indexArr.push(i));

        // 数组中随机一个位置
        const i = indexArr[utils.random(0, indexArr.length - 1)];
        this.players[i] = new ErbaPlayer(i, dbplayer);
        // 添加到消息通道
        this.addMessage(dbplayer);
        return true;
    }

    /**断线恢复 */
    async offLineRecover(playerInfo: ErbaPlayer) {
        // 把玩家状态设置为在线 托管状态设置为取消托管
        playerInfo.onLine = true;

        // 添加到消息通道
        this.addMessage(playerInfo);
    }

    /**
     * 有玩家离开 isOffLine代表是否断线 断线则不删除玩家
     * @param player 
     * @param isOffLine true是离线
     */
    leave(playerInfo: ErbaPlayer, isOffLine: boolean) {
        /**先踢出玩家通道 */
        this.kickOutMessage(playerInfo.uid);
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        this.players[playerInfo.seat] = null;
        const opts = { uid: playerInfo.uid, seat: playerInfo.seat };
        this.channelIsPlayer('ld.onExit', opts);
        roomManager.removePlayerSeat(playerInfo.uid);
    }

    /**获取等待状态的时间 */
    getWaitTime() {
        return this.countdown;
    }

    /**等待玩家准备 */
    wait(playerInfo?: ErbaPlayer) {
        if (this.status != "INWAIT")
            return;
        if (this.players.filter(pl => pl && pl.status == 'WAIT').length <= 1) {
            this.channelIsPlayer('Erba.onWait', { waitTime: 0 });
            return;
        }
        // 通知 所有人开始准备 5s内就不重复通知玩家
        if (Date.now() - this.lastWaitTime < WAIT_TIME) {
            const member = playerInfo && this.channel.getMember(playerInfo.uid);
            if (member) {
                let waitTime = Math.max(WAIT_TIME - (Date.now() - this.lastWaitTime), 0);
                MessageService.pushMessageByUids(`Erba.onWait`, { waitTime }, member);
            }
            return;
        }

        this.channelIsPlayer('Erba.onWait', { waitTime: WAIT_TIME });

        // 最后一次通知玩家准备的时间
        this.lastWaitTime = Date.now();

        // 等一段时间后强行开始发牌
        clearTimeout(this.waitTimeout);
        this.waitTimeout = setTimeout(() => {
            const list = this.players.filter(pl => !!pl);
            if (list.length == 4) {
                this.handler_start();
            } else {
                this.channelIsPlayer('Erba.onWait', { waitTime: 0 });
            }
        }, WAIT_TIME);
    }

    /**通知开始游戏 */
    handler_start() {
        this.startGameTime = Date.now();
        this.updateRoundId();
        this.status = "startNextHand"; // 开始新的一轮游戏
        this.lastFahuaTime = Date.now();
        clearTimeout(this.waitTimeout);
        this.record_history = { banker_uid: "", oper: [], info: [] };
        this.players.forEach(pl => pl && (pl.initGame()));
        this.banker = null;
        this.cardsDealt = [];
        this.setSice = [];
        let opts = {
            plys: this.players.map(pl => pl && pl.strip()),
            roundTimes: this.roundTimes,
            roundId: this.roundId
        };

        this.channelIsPlayer("Erba.startNextHand", opts);
        this.countdown = 5;
        let Oper_timeout = setInterval(() => {
            this.countdown -= 1;
            if (this.countdown <= 0) {
                CC_DEBUG && console.warn(this.roundId, this.roomId, "startNextHand", utils.cDate());
                clearInterval(Oper_timeout);
                this.handler_startGrab();
            }
        }, 1000);
    }

    /**开始抢庄*/
    handler_startGrab() {
        this.status = "startGrab";
        this.countdown = 5;
        /**计算 */
        for (const pl of this.players) {
            let B3 = Math.floor(pl.gold / this.lowBet);
            // if (B3 <= 3) B3 = 3;
            if (B3 >= 200) B3 = 200;
            let B1 = Math.max(Math.floor(B3 / 3 + 1), 3);
            let B2 = Math.max(Math.floor(B3 * 2 / 3 + 1), 3);
            // console.warn("B1,B2,B3", B1, B2, B3);
            pl.startGrab_List = [0, 3];
            if (!pl.startGrab_List.includes(B1)) pl.startGrab_List.push(B1);
            if (!pl.startGrab_List.includes(B2)) pl.startGrab_List.push(B2);
            if (!pl.startGrab_List.includes(B3)) pl.startGrab_List.push(B3);
            // if (!pl.startGrab_List.includes(200)) pl.startGrab_List.push(200);
            //----
            const opts = {
                status: this.status,
                countdown: this.countdown,
                startGrab_List: pl.startGrab_List
            }
            const member = pl && this.channel.getMember(pl.uid);
            member && MessageService.pushMessageByUids('Erba.startGrab', opts, member);
            // this.channelIsPlayer("Erba.startGrab", opts);
        }
        this.Oper_timeout_startGrab = setInterval(() => {
            this.countdown -= 1;
            if (this.countdown <= 0) {
                for (const pl of this.players) {
                    CC_DEBUG && console.warn(this.roundId, this.roomId, "startGrab", utils.cDate());
                    if (!pl || pl.Grab_num >= 0) continue;
                    pl.handler_grab(this, 0);
                }
            }
        }, 1000);
    }

    /**庄家宣布 */
    handler_banker() {
        clearInterval(this.Oper_timeout_startGrab);
        this.status = "banker";
        this.countdown = 5;
        // const seat = utils.random(0, 3);
        this.banker = this.players.find(pl => !!pl);
        for (const pl of this.players) {
            if (!pl || pl.uid == this.banker.uid) continue;
            if (pl.Grab_num > this.banker.Grab_num) {
                this.banker = pl;
            }
        }
        const opts = {
            status: this.status,
            countdown: this.countdown,
            banker: this.banker.seat
        }
        this.channelIsPlayer("Erba.banker", opts);
        let Oper_timeout = setInterval(() => {
            this.countdown -= 1;
            if (this.countdown <= 0) {
                CC_DEBUG && console.warn(this.roundId, this.roomId, "banker", utils.cDate());
                clearInterval(Oper_timeout);
                this.handler_startBet();
            }
        }, 1000);
    }
    /**玩家投注 */
    handler_startBet() {
        this.status = "startBet";
        this.countdown = 5;
        /**计算 */
        for (const pl of this.players) {
            if (pl.uid == this.banker.uid) continue;
            let B3 = Math.floor(this.banker.gold / this.lowBet);
            if (B3 > 200) B3 = 200;
            let G4 = Math.min(Math.floor((this.banker.Grab_num > 3 ? this.banker.Grab_num : 3) / 3), Math.floor(pl.gold / this.lowBet));
            G4 = G4 <= 66 ? G4 : 66;
            const G3 = Math.floor(G4 * 0.75);
            const G2 = Math.floor(G4 * 0.5);
            let G1 = Math.max(Math.floor(G4 * 0.25), 1);
            G1 = G1 >= 1 ? G1 : 1;
            pl.bet_mul_List = [1];
            if (!pl.bet_mul_List.includes(G1) && G1 > 1) pl.bet_mul_List.push(G1);
            if (!pl.bet_mul_List.includes(G2) && G1 > 1) pl.bet_mul_List.push(G2);
            if (!pl.bet_mul_List.includes(G3) && G1 > 1) pl.bet_mul_List.push(G3);
            if (!pl.bet_mul_List.includes(G4) && G1 > 1) pl.bet_mul_List.push(G4);
            //----
            const opts = {
                status: this.status,
                countdown: this.countdown,
                bet_mul_List: pl.bet_mul_List
            }
            const member = pl && this.channel.getMember(pl.uid);
            member && MessageService.pushMessageByUids('Erba.startBet', opts, member);
            // this.channelIsPlayer("Erba.startBet", opts);
        }
        this.Oper_timeout_startBet = setInterval(() => {
            this.countdown -= 1;
            if (this.countdown <= 0) {
                CC_DEBUG && console.warn(this.roundId, this.roomId, "startBet", utils.cDate());
                for (const pl of this.players) {
                    if (pl && pl.uid != this.banker.uid && pl.bet_mul == 0) {
                        pl.handler_Bet(this, 1);
                    }
                }
            }
        }, 1000);
    }
    /**摇塞子 */
    handler_sice() {
        clearInterval(this.Oper_timeout_startBet);
        this.setSice = [utils.random(1, 6), utils.random(1, 6)];
        this.status = "sice";
        this.countdown = 5;
        const opts = {
            status: this.status,
            countdown: this.countdown,
            setSice: this.setSice
        }
        this.channelIsPlayer("Erba.setSice", opts);
        let Oper_timeout = setInterval(() => {
            this.countdown -= 1;
            CC_DEBUG && console.warn(this.roundId, this.roomId, "sice", utils.cDate());
            if (this.countdown <= 0) {
                clearInterval(Oper_timeout);
                this.handler_sendHoleCard();
            }
        }, 1000);
    }

    /**发送手牌 */
    async handler_sendHoleCard() {
        // this.setSice = [utils.random(1, 6), utils.random(1, 6)];
        this.status = "showCard";
        this.countdown = 5;

        await this.control.runControl();
        for (const pl of this.players) {
            if (pl) {
                for (const card of pl.HoleCard) {
                    this.statistics[card]++;
                }
            }
        }
        const opts = {
            status: this.status,
            countdown: this.countdown,
            setSice: this.setSice
        }
        this.channelIsPlayer("Erba.showCard", opts);
        this.Oper_timeout[this.status] = setInterval(() => {
            this.countdown -= 1;
            CC_DEBUG && console.warn(this.roundId, this.roomId, "showCard", utils.cDate());
            if (this.countdown <= 0) {
                this.handler_sendResult();
            }
        }, 1000);
    }

    /**结算 */
    async handler_sendResult() {
        clearInterval(this.Oper_timeout[this.status]);
        // this.setSice = [utils.random(1, 6), utils.random(1, 6)];
        this.status = "sendResult";
        this.countdown = 10;
        CC_DEBUG && console.warn(this.roundId, this.roomId, this.status, utils.cDate());
        // 玩家结算
        this.playersSettlement();

        for (const pl of this.players) {
            pl && await pl.updateGold(this);
        }
        this.record_history.banker_uid = this.banker.uid;
        this.record_history.info = this.players.map(c => {
            if (c) {
                return {
                    uid: c.uid,
                    seat: c.seat,
                    profit: c.profit,
                    HoleCard: c.HoleCard,
                    bet_mul: c.bet_mul,
                    Grab_num: c.Grab_num
                }
            }
        });
        for (const pl of this.players) {
            pl && await pl.only_update_game(this);
        }
        const opts = {
            players: this.players.map(pl => {
                if (pl)
                    return {
                        uid: pl.uid,
                        seat: pl.seat,
                        nickname: pl.nickname,
                        headurl: pl.headurl,
                        HoleCard: pl.HoleCard,
                        bet_mul: pl.bet_mul,
                        profit: pl.profit,
                        gold: pl.gold
                    }
            }),
            statistics: this.statistics
        };
        this.channelIsPlayer("Erba.sendResult", opts);
        // this.players.find(c => !!c).gold = 0;
        let less_gold = this.players.filter(c => !!c).some(c => c.gold < this.entryCond);
        if (this.roundTimes == 5 ||
            !this.players.some(pl => pl && pl.isRobot == RoleEnum.REAL_PLAYER) ||
            less_gold) {
            this.channelIsPlayer("Erba.over", { less_gold });
            this.Initialization();
            // this.status = "banker";
            return;
        } else {
            let Oper_timeout = setInterval(async () => {
                this.countdown -= 1;
                if (this.countdown <= 0) {
                    this.roundTimes++;
                    clearInterval(Oper_timeout);
                    this.handler_start();
                }
            }, 1000);
        }
    }

    /**踢掉离线玩家 */
    battle_kickNoOnline() {
        const offLinePlayers: ErbaPlayer[] = [];
        for (const pl of this.players) {
            if (!pl) continue;
            // 不在线移除玩家 在线则不移除 因为还在这个场中
            if (!pl.onLine) roomManager.removePlayer(pl);
            // this.leave(pl, false);
            offLinePlayers.push(pl);
            this.kickOutMessage(pl.uid);
            roomManager.removePlayerSeat(pl.uid);
            this.players[pl.seat] = null;
        }
        //更新数据（前端需要切换场景）
        this.kickingPlayer(pinus.app.getServerId(), offLinePlayers);
    }


    /**
     * 所有游戏玩家是否相同类型
     */
    isSameGamePlayers() {
        const players = this.players.filter(p => !!p);
        return players.every(p => p.isRobot === players[0].isRobot);
    }


    /**
     * 获取几付随机牌
     * @param len
     */
    getRandomCards(len: number) {
        this.cards.push(...this.cardsDealt);
        this.cards.sort((x, y) => Math.random() - 0.5);

        const cards = [];

        for (let i = 0; i < len; i++) {
            const card = this.cards.splice(0, 2);
            cards.push(card);
            this.cardsDealt.push(...card);
        }

        return cards;
    }

    /**
     * 随机发牌
     */
    randomDeal() {
        const players = this.players.filter(p => !!p);
        const cards = this.getRandomCards(players.length);

        players.forEach(p => p.HoleCard = cards.shift());
    }

    /**
     * 运行场控
     */
    async runSceneControl(sceneControlState: ControlState, isPlatformControl) {
        // 如果所有玩家类型都一样或者场控方案 随机发牌
        if (sceneControlState === ControlState.NONE) {
            return this.randomDeal();
        }

        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        const players = this.players.filter(p => !!p);

        players.forEach(p => p.setControlType(type));

        // 因为只有一个玩家 所以直接给玩家发大牌即可
        for (let i = 0; i < 100; i++) {
            // 随机发牌
            this.randomDeal();
            // 玩家结算
            this.playersSettlement();
            // 获取真实玩家收益
            const profit = this.getRealPlayersProfit();

            if (sceneControlState === ControlState.SYSTEM_WIN && profit <= 0) {
                return;
            }

            if (sceneControlState === ControlState.PLAYER_WIN && profit >= 0) {
                return;
            }
        }
    }

    /**
     * 个控发牌
     * @param positivePlayers 正调控玩家 在这里的玩家赢
     * @param negativePlayers 负调控玩家 在这里的玩家输
     */
    controlPersonalDeal(positivePlayers: PersonalControlPlayer[], negativePlayers: PersonalControlPlayer[]): void {
        let players = this.players.filter(p => !!p);
        const cards = this.getRandomCards(players.length);
        Erba_logic.sortResult(cards);

        // 如果玩家在正调控里
        if (positivePlayers.length) {
            positivePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                const player = this.getPlayer(p.uid);
                player.HoleCard = cards.shift();
                players = players.filter(p => p.uid !== player.uid);
            });
        }

        if (negativePlayers.length) {
            negativePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                const player = this.getPlayer(p.uid);
                player.HoleCard = cards.pop();
                players = players.filter(p => p.uid !== player.uid);
            });
        }

        players.sort((x, y) => Math.random() - 0.5).forEach(p => p.HoleCard = cards.shift());
    }

    /**
     * 获取真实玩家收益
     */
    getRealPlayersProfit() {
        return this.players.reduce((total, p) => {
            if (!p) return total;

            total += p.isRobot === RoleEnum.REAL_PLAYER ? p.profit : 0;

            return total;
        }, 0)
    }

    /**
     * 玩家结算
     */
    playersSettlement() {
        for (const player of this.players) {
            if (!player || player.uid == this.banker.uid) continue;
            player.profit = 0;
            let ret = Erba_logic.bipai(this.banker.HoleCard, player.HoleCard);
            const profit = this.lowBet * player.bet_mul;
            if (ret >= 0) {
                this.banker.profit += profit;
                player.profit -= profit;
            } else if (ret == -1) {
                this.banker.profit -= profit;
                player.profit += profit;
            }
        }
    }
}

