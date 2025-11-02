import { pinus } from 'pinus';
import ldPlayer from './ldPlayer';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import { Irecord_history } from "./ld_interface";
import { RoleEnum } from '../../../common/constant/player/RoleEnum';
import { PersonalControlPlayer } from "../../../services/newControl";
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import Control from "./control";
import MessageService = require('../../../services/MessageService');
import utils = require('../../../utils/index');
import ld_Logic = require("./ld_Logic");
import roomManager, { LdRoomManger } from '../lib/ldMgr';
/**等待准备时间 */
const WAIT_TIME = 3000;
/**发话时间 */
const AUTO_TIME = 15000;

/**
 * 游戏房间
 * @property endTime 回合结束时间
 * @property zipResult 压缩结果
 */
export default class landRoom extends SystemRoom<ldPlayer> {
    entryCond: number;
    /**底注 */
    lowBet: number;
    /**最大回合次数 */
    maxRound = 20;
    /**已经多少轮游戏了 */
    roundTimes: number = 1;
    /**1 摇骰子 2 翻开骰子 3 飞筹码 */
    status: 'NONE' | 'INWAIT' | 'GameStart' | 'GameBipai' | 'PROCESSING' = 'NONE';
    /**记录开始等待时候的时间 */
    lastWaitTime: number = 0;
    /**记录开始发话时候的时间 */
    lastFahuaTime: number = 0;
    /**自动操作倒计时 */
    auto_delay = AUTO_TIME;
    /**一局的历史记录 */
    record_history: Irecord_history = { oper: [], info: [] };

    waitTimeout: NodeJS.Timer = null;

    /**玩家列表 */
    players: ldPlayer[] = new Array(8).fill(null);
    min_pls: ldPlayer[] = [];
    /**开始一局游戏的时间 */
    startGameTime: number = 0;
    endTime: number;
    zipResult: string = '';
    control: Control;


    constructor(opts: any) {
        super(opts);
        this.entryCond = opts.entryCond || 0; // 进入条件
        this.lowBet = opts.lowBet || 50; // 底注
        this.Initialization();
        this.control = new Control({ room: this });
    }
    close() {
        this.sendRoomCloseMessage();
        this.players = [];
    }
    Initialization() {
        this.roundTimes = 1;
        this.lastFahuaTime = 0;
        this.record_history = { oper: [], info: [] };
        this.startGameTime = 0;
        this.min_pls = [];
        this.battle_kickNoOnline();
        this.status = "INWAIT"; // 等待玩家准备
        this.updateRoundId();
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
        this.players[i] = new ldPlayer(i, dbplayer);
        // 添加到消息通道
        this.addMessage(dbplayer);
        return true;
    }

    /**断线恢复 */
    async offLineRecover(playerInfo: ldPlayer) {
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
    leave(playerInfo: ldPlayer, isOffLine: boolean) {
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
        if (this.status == "GameStart") {
            return Math.max(this.players.filter(pl => pl).length * 500 + 2000 - (Date.now() - this.lastFahuaTime), 0);
        }
        if (this.status == "GameBipai") {
            return Math.max(0, 0);
        }
        if (this.status == "PROCESSING") {
            return Math.max(AUTO_TIME - (Date.now() - this.lastFahuaTime), 0);
        }
        return 0;
    }

    /**等待玩家准备 */
    wait(playerInfo?: ldPlayer) {
        if (this.status != "INWAIT")
            return;
        if (this.players.filter(pl => pl && pl.status == 'WAIT').length <= 1) {
            this.channelIsPlayer('ld.onWait', { waitTime: 0 });
            return;
        }
        // 通知 所有人开始准备 5s内就不重复通知玩家
        if (Date.now() - this.lastWaitTime < WAIT_TIME) {
            const member = playerInfo && this.channel.getMember(playerInfo.uid);
            if (member) {
                let waitTime = Math.max(WAIT_TIME - (Date.now() - this.lastWaitTime), 0);
                MessageService.pushMessageByUids(`ld.onWait`, { waitTime }, member);
            }
            return;
        }

        this.channelIsPlayer('ld.onWait', { waitTime: WAIT_TIME });

        // 最后一次通知玩家准备的时间
        this.lastWaitTime = Date.now();

        // 等一段时间后强行开始发牌
        clearTimeout(this.waitTimeout);
        this.waitTimeout = setTimeout(() => {
            const list = this.players.filter(pl => pl);
            if (list.length >= 5) {
                list.forEach(c => c.status = "GAME");
                this.handler_start();
            } else {
                this.channelIsPlayer('ld.onWait', { waitTime: 0 });
            }
        }, WAIT_TIME);
    }

    /**摇骰子 */
    async handler_start() {
        // this.updateRoundId();
        this.status = "GameStart"; // 开始新的一轮游戏
        this.lastFahuaTime = Date.now();
        clearTimeout(this.waitTimeout);
        this.players.forEach(c => c && (c.bet = this.lowBet));
        let players = this.players;
        if (this.min_pls.length > 0) {
            players = this.min_pls;
        }
        let opts = { plys: this.players.map(pl => pl && pl.wrapGame()), roundTimes: this.roundTimes };
        this.channelIsPlayer("ld.start", opts);

        // 上次赢得玩家进行发话 延迟前端的发牌动作
        await utils.delay(2000);
        this.handler_bipai();
    }
    /** 翻开骰子 结算*/
    async handler_bipai() {
        this.status = "GameBipai";
        let gamePlayers = this.min_pls;
        if (gamePlayers.length == 0) {
            gamePlayers = this.players;
        }

        // 运行调控发摇第一次骰子的结果
        await this.control.runControl();

        for (const pl of gamePlayers) {
            if (pl) {
                const opts = {
                    uid: pl.uid,
                    seat: pl.seat,
                    cards: pl.cards,
                    cardType: pl.cardType,
                }
                this.channelIsPlayer("ld.open", opts);
                await utils.delay(2000);
            }
        }

        this.min_pls = [this.players.find(pl => pl)];
        for (const pl of this.players) {
            if (pl && pl.uid != this.min_pls[0].uid) {
                let ret = ld_Logic.bipaiSole({ cardType: this.min_pls[0].cardType, cards: this.min_pls[0].cards },
                    { cardType: pl.cardType, cards: pl.cards });
                if (ret > 0) {
                    this.min_pls = [pl];
                } else if (ret == 0) {
                    this.min_pls.push(pl);
                }
            }
        }
        for (const min_pl of this.min_pls) {
            min_pl.profit = -min_pl.bet * (this.players.filter(pl => pl).length - this.min_pls.length);
            min_pl.gold += min_pl.profit;
            for (const pl of this.players) {
                if (pl && !this.min_pls.find(c => c.uid == pl.uid)) {
                    pl.profit += pl.bet;
                    pl.gold += pl.profit;
                }
            }
        }
        for (const pl of this.players) {
            if (!pl) continue;
            pl.totalBet += pl.bet;
            pl.totalProfit += pl.profit;
        }
        const fn = () => {
            const opts = this.players.map(pl => {
                if (pl)
                    return {
                        uid: pl.uid,
                        seat: pl.seat,
                        cards: pl.cards,
                        cardType: pl.cardType,
                        bet: pl.bet,
                        profit: pl.profit,
                        totalProfit: pl.totalProfit,
                        gold: pl.gold
                    }
            });
            return opts;
        }
        const opts = fn();
        this.record_history.info.push(opts);
        this.channelIsPlayer("ld.bipai", opts);
        await utils.delay(5000);
        if (this.roundTimes == 20 ||
            !this.players.some(pl => pl && pl.isRobot == RoleEnum.REAL_PLAYER) ||
            this.min_pls.length == this.players.filter(pl => pl).length) {
            for (const pl of this.players) {
                pl && await pl.updateGold(this);
            }
            for (const pl of this.players) {
                pl && await pl.only_update_game(this);
            }
            const opts = fn();
            this.channelIsPlayer("ld.end", opts);
            this.Initialization();
            return;
        }
        this.players.forEach(pl => pl && pl.prepare());
        this.roundTimes++;
        this.set_next_doing_seat();
    }

    /**发话 */
    async set_next_doing_seat() {
        this.status = "PROCESSING";
        this.lastFahuaTime = Date.now();
        // 通知玩家说话
        for (const pl of this.min_pls) {
            pl.state = "PS_OPER";
            pl.keep_dices = [];
            this.handler_pass(pl);
        }
        const opts = {
            auto_delay: this.auto_delay,
            min_pls: this.min_pls.map(pl => {
                return {
                    uid: pl.uid,
                    seat: pl.seat
                }
            })
        }
        this.channelIsPlayer("ld.onFahua", opts);
    }

    /**重置发话时间 如果时间到了 就直接跳到下一个发话 */
    handler_pass(playerInfo: ldPlayer) {
        clearTimeout(playerInfo.Oper_timeout);
        playerInfo.Oper_timeout = setTimeout(() => {
            playerInfo.handler_Keep(this, []);
        }, this.auto_delay);
    }

    /**踢掉离线玩家 */
    battle_kickNoOnline() {
        const offLinePlayers: ldPlayer[] = [];
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
     * 随机开奖
     */
    randomLottery() {
        let gamePlayers = this.min_pls;
        if (gamePlayers.length == 0) {
            gamePlayers = this.players;
        }

        // 运行调控发摇第一次骰子的结果

        for (const pl of gamePlayers) {
            if (pl) {
                let pais = ld_Logic.getRandomDice(5 - pl.keep_dices.length);
                pais.push(...pl.keep_dices);
                pl.initGame(pais);
            }
        }
    }

    /**
     * 查找最新玩家列表
     */
    findMinPlayers() {
        let minPlayers = [this.players.find(pl => pl)];
        for (const pl of this.players) {
            if (pl && pl.uid != minPlayers[0].uid) {
                let ret = ld_Logic.bipaiSole({ cardType: minPlayers[0].cardType, cards: minPlayers[0].cards },
                    { cardType: pl.cardType, cards: pl.cards });
                if (ret > 0) {
                    minPlayers = [pl];
                } else if (ret === 0) {
                    minPlayers.push(pl);
                }
            }
        }

        return minPlayers;
    }

    /**
     * 个控玩家
     * @param players
     * @param state
     */
    personalControl(players: PersonalControlPlayer[], state: CommonControlState) {
        players.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));

        for (let i = 0; i < 100; i++) {
            this.randomLottery();
            const minPlayers = this.findMinPlayers();

            // 如果是让调控玩家赢，则最小不能包含玩家
            if (state === CommonControlState.WIN && players.filter(p => !!minPlayers.find(m => m.uid === p.uid)).length === 0) {
                break;
            }

            // 如果是让调控玩家赢，则最小包含玩家
            if (state === CommonControlState.LOSS && players.filter(p => !!minPlayers.find(m => m.uid === p.uid)).length > 0) {
                break;
            }
        }
    }

    /**
     * 场控状态
     * @param sceneControlState
     * @param isPlatformControl 是否是平台调控
     */
    sceneControl(sceneControlState: ControlState, isPlatformControl) {
        if (sceneControlState === ControlState.NONE) {
            return this.randomLottery();
        }

        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        this.players.forEach(p => !!p && p.setControlType(type));

        for (let i = 0; i < 100; i++) {
            this.randomLottery();
            const minPlayers = this.findMinPlayers();

            // 如果是让调控系统赢，则最小包含真人玩家
            if (sceneControlState === ControlState.SYSTEM_WIN && minPlayers.filter(p => p.isRobot === RoleEnum.REAL_PLAYER).length > 0) {
                break;
            }

            // 如果是让调控玩家赢，则最小不能包含真人玩家
            if (sceneControlState === ControlState.PLAYER_WIN && minPlayers.filter(p => p.isRobot === RoleEnum.REAL_PLAYER).length === 0) {
                break;
            }
        }
    }
}

