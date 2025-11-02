'use strict';
import { pinus } from 'pinus';
import baicaoPlayer from './baicaoPlayer';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import roomManager, { GameManger } from '../lib/baicaoMgr';
import { PersonalControlPlayer } from "../../../services/newControl";
import Control from "./control";
import { buildRecordResult } from "./util/recordUtil";
import { bipaiSoleBySg } from "./baicao_logic";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import { random } from "../../../utils";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import MessageService = require('../../../services/MessageService');
import baicao_logic = require('./baicao_logic');
import utils = require('../../../utils/index');
import baicaoConst = require('./baicaoConst');


const WAIT_TIME = 5000;

// 房间逻辑
// 准备 -> 抢庄 -> 确定庄家 -> 闲家下注 -> 闲家与庄家比牌 -> 结算 -> 初始化
/**
 * 游戏房间
 * @property startTime 回合开始时间
 * @property endTime 回合结束时间
 * @property zipResult 压缩结算结果
 */
export default class baicaoRoom extends SystemRoom<baicaoPlayer> {
    lowBet: number;
    entryCond: number;
    /**INWAIT(5s) LICENS发牌 (x)s  LOOK看牌阶段3s BIPAI 5s SETTLEME结算阶段2s*/
    status: 'NONE' | 'INWAIT' | 'LICENS' | 'LOOK' | 'BIPAI' | 'SETTLEMENT' = 'NONE';
    /**每局总下注 */
    allBet: number = 0;
    /**当前参与游戏的玩家列表 当抢庄结束后变成闲家列表 */
    curPlayers: baicaoPlayer[] = [];
    stateTime: number = 0;
    /**玩家列表 */
    players: baicaoPlayer[] = new Array(6).fill(null);// 玩家列表
    /**当前调控方案 */
    controlPlan: number = 0;
    /**当局的牌型 */
    cards: {
        cards: number[];
        cardType: number;
        Points: number;
        total_CardValue: number;
    }[] = [];

    control: Control;
    lastWaitTime: number = 0;
    waitTimeout: NodeJS.Timeout = null;

    /**重新摇奖 */
    roundTimes: number = 1;

    startTime: number;
    endTime: number;
    zipResult: string = '';
    countdown: baicaoConst.COUNTDOWN;
    countdown_Interval: NodeJS.Timeout;
    total_bet: number;
    win_seat = -1;
    record_history: baicaoConst.Irecord_history;
    /** 需要发牌的玩家 */
    dealCardsPlayers: baicaoPlayer[] = [];

    constructor(opts: any) {
        super(opts);
        // 房间底注
        this.lowBet = opts.lowBet;
        // 房间至少带入金币
        this.entryCond = opts.entryCond;
        this.channel = opts.channel;                           // 房间通用通道
        // this.channelBet = opts.channelBet;                     // 房间下注专用通道，只通知真实玩家

        this.control = new Control({ room: this });
        this.Initialization();
    }

    /*-------------------------------------- 房间工具方法部分 ----------------------------------------- */

    /**初始化 */
    async Initialization() {
        this.allBet = 0;
        this.roundTimes = 0;
        this.win_seat = -1;
        this.battle_kickNoOnline();
        this.status = "INWAIT";
        this.curPlayers.length = 0;
        this.controlPlan = 0;
        this.cards = [];
        this.stateTime = 0;
        this.record_history = { deal_info: [], player_info: [] };
        this.dealCardsPlayers = [];
        this.updateRoundId();
    }
    close() {
        this.sendRoomCloseMessage();
        this.players = [];
    }
    /**
     * 踢掉离线玩家 以及 金币不满足进入条件玩家
     */
    battle_kickNoOnline() {
        const offLinePlayers: baicaoPlayer[] = [];
        for (const pl of this.players) {
            if (!pl) continue;
            // 不在线移除玩家 在线则不移除 因为还在这个场中
            if (!pl.onLine) roomManager.removePlayer(pl);
            // this.kickOutMessage(pl.uid);
            offLinePlayers.push(pl);
            // this.leave(pl, false);
            this.kickOutMessage(pl.uid);
            roomManager.removePlayerSeat(pl.uid);
            this.players[pl.seat] = null;
        }
        //更新数据（前端需要切换场景）
        this.kickingPlayer(pinus.app.getServerId(), offLinePlayers);
    }


    /**有玩家离开
     * isOffLine true离线
     */
    leave(playerInfo: baicaoPlayer, isOffLine: boolean) {
        do {
            if (isOffLine) {
                playerInfo.onLine = false;
                break;
            }
            const idx = playerInfo.seat;
            if (idx !== -1) {
                this.players[idx] = null;
            }
            this.channelIsPlayer(baicaoConst.route.OnExit, { uid: playerInfo.uid, seat: playerInfo.seat, nickname: playerInfo.nickname });
        } while (false);
        this.kickOutMessage(playerInfo.uid);
        roomManager.removePlayerSeat(playerInfo.uid);
    }

    /**玩家加入 如果玩家在房间列表中说明是离线玩家 */
    addPlayerInRoom(dbplayer) {
        let playerInfo = this.getPlayer(dbplayer.uid);
        if (playerInfo) {
            playerInfo.leaveCount = 0;
            playerInfo.onLine = true;
        } else {
            const idxs: number[] = [];
            this.players.forEach((m, i) => !m && idxs.push(i));//空位置压入数组
            if (idxs.length == 0) return false;
            // 数组中随机一个位置
            const i = idxs[utils.random(0, idxs.length - 1)];
            this.players[i] = new baicaoPlayer(i, dbplayer);

            // 通知其他人有玩家加入
            this.channelIsPlayer(baicaoConst.route.Add, {
                uid: this.players[i].uid,
                nickname: this.players[i].nickname,
                headurl: this.players[i].headurl,
                gold: this.players[i].gold,
                status: this.players[i].status
            });
        }
        // 把玩家加入消息通道
        this.addMessage(dbplayer);
        return true;
    }

    /**
     * 所有游戏玩家是否相同类型
     */
    isSameGamePlayers() {
        return this.curPlayers.every(p => p.isRobot === this.curPlayers[0].isRobot);
    }


    /**当前状态的时间 */
    toStatusTime() {
        if (this.status == 'NONE') return 0;
        if (this.status == 'SETTLEMENT') return this.countdown;
        return this.countdown;
    }

    /**查看手牌 */
    look(playerInfo: baicaoPlayer) {
        return { cardsInfo: playerInfo.toHoldsInfo() };
    }

    /**
     * 个控发牌
     * @param positivePlayers 正调控玩家 在这里的玩家赢得概率高
     * @param negativePlayers 负调控玩家 在这里的玩家赢得概率高
     */
    controlPersonalDeal(positivePlayers: PersonalControlPlayer[], negativePlayers: PersonalControlPlayer[]): void {
        // 未发牌的玩家
        let dealtPlayers = this.dealCardsPlayers;

        positivePlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));
        negativePlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));

        this.cards.sort((x, y) => Number(bipaiSoleBySg(x, y)) - Number(bipaiSoleBySg(y, x)));

        // 如果这个有正调控的玩家 则正面调控的玩家获得最大的牌 否则随机一个机器人获得最大的牌
        let luckPlayer;
        if (positivePlayers.length) {
            const p = positivePlayers[utils.random(0, positivePlayers.length - 1)];
            luckPlayer = dealtPlayers.find(pl => pl.uid === p.uid);
        } else {
            const robotPlayers = dealtPlayers.filter(p => p.isRobot === RoleEnum.ROBOT);
            luckPlayer = robotPlayers[random(0, robotPlayers.length - 1)];
        }

        const handCards = this.cards.shift();
        luckPlayer.licensing(this, handCards.cards, handCards.cardType, handCards.Points, handCards.total_CardValue);
        // 过滤掉这个玩家
        dealtPlayers = dealtPlayers.filter(dealtPlayer => luckPlayer.uid !== dealtPlayer.uid);


        // 打乱牌
        this.cards.sort((a, b) => Math.random() - 0.5);

        // 剩余的玩家随机发牌
        dealtPlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
            const handCards = this.cards.pop();
            p.licensing(this, handCards.cards, handCards.cardType, handCards.Points, handCards.total_CardValue);
        });
    }

    /**
     * 场控发牌
     * @param sceneControlState 场控状态
     * @param isPlatformControl 是否是平台调控
     */
    sceneControl(sceneControlState: ControlState, isPlatformControl: boolean) {
        // 未发牌的玩家
        let gamePlayers = this.dealCardsPlayers;
        // 没有则随机发牌
        if (sceneControlState === ControlState.NONE) {
            return this.randomDeal();
        }

        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        gamePlayers.forEach(p => p.setControlType(type));

        this.cards.sort((x, y) => Number(bipaiSoleBySg(x, y)) - Number(bipaiSoleBySg(y, x)));

        // 如果系统赢则取一个机器人发最大的牌 其他随机发
        // 反之如果玩家赢则取一个玩家发最大的牌 其他随机发
        const winnerType = sceneControlState === ControlState.SYSTEM_WIN ? RoleEnum.ROBOT : RoleEnum.REAL_PLAYER;
        const possibleWinPlayers = gamePlayers.filter(p => p.isRobot === winnerType);
        possibleWinPlayers.sort((a, b) => Math.random() - 0.5);
        const winPlayer = possibleWinPlayers.shift();

        const handCards = this.cards.shift();
        winPlayer.licensing(this, handCards.cards, handCards.cardType, handCards.Points, handCards.total_CardValue);

        // 过滤掉那个发牌的玩家
        gamePlayers = gamePlayers.filter(p => p.uid !== winPlayer.uid);
        // 剩余的玩家随机发
        gamePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
            this.cards.sort((a, b) => Math.random() - 0.5);

            const handCards = this.cards.shift();
            p.licensing(this, handCards.cards, handCards.cardType, handCards.Points, handCards.total_CardValue);
        });
    }

    /**
     * 随机发牌
     */
    randomDeal() {
        this.dealCardsPlayers.sort((a, b) => Math.random() - 0.5).forEach(pl => {
            this.cards.sort((a, b) => Math.random() - 0.5);
            const handCards = this.cards.shift();
            pl.licensing(this, handCards.cards, handCards.cardType, handCards.Points, handCards.total_CardValue);
        });
    }

    /*-------------------------------------- 房间运行逻辑部分 ----------------------------------------- */


    /**进入准备状态 */
    wait(playerInfo?: baicaoPlayer) {
        if (this.status == "INWAIT" || this.status == `NONE`) {
            this.status = "INWAIT";// 等待玩家准备

            // 如果只剩一个人的时候或者没有人了 就直接关闭房间
            if (this.players.filter(pl => pl && pl.status == `WAIT`).length <= 1) {
                this.channelIsPlayer(baicaoConst.route.ReadyState, { status: this.status, waitTime: 0 });
                return;
            }
            // 通知 所有人开始准备
            if (Date.now() - this.lastWaitTime < WAIT_TIME) {//5s内就不重复通知玩家
                const member = playerInfo && this.channel.getMember(playerInfo.uid);
                if (member) {
                    let waitTime = Math.max(WAIT_TIME - (Date.now() - this.lastWaitTime), 0) / 1000;
                    MessageService.pushMessageByUids(baicaoConst.route.ReadyState, { status: this.status, waitTime }, member);
                }
                return;
            }
            this.channelIsPlayer(baicaoConst.route.ReadyState, { status: this.status, waitTime: WAIT_TIME / 1000 });

            this.lastWaitTime = Date.now(); // 这个记录只用于前段请求的时候用 毫秒
            // 等一段时间后强行开始发牌
            clearTimeout(this.waitTimeout);
            this.waitTimeout = setTimeout(() => {
                // 人数超过2个就强行开始
                const list = this.players.filter(pl => pl);
                this.curPlayers = list;
                if (list.length >= 2) {
                    this.Game_licensing(list);
                } else {// 否则就关闭房间 因为当玩家进来的时候会再次检查
                    this.channelIsPlayer(baicaoConst.route.ReadyState, { status: this.status, waitTime: 0 });// 通知还在的人不要准备了 等待其他人来
                }
            }, WAIT_TIME);
        }
    }


    /**发牌
     *@param restart true重新发牌
     */
    async Game_licensing(list: baicaoPlayer[], restart: boolean = false) {
        this.status = 'LICENS';
        this.stateTime = Date.now();
        this.startTime = this.stateTime;
        if (!restart) {
            for (const pl of list) {
                pl.status = "GAME";
                pl.bet = this.lowBet;
            }
            // this.cards = baicao_logic.riffle(list);
            this.total_bet = list.length * this.lowBet;
        }
        this.cards = baicao_logic.riffle(list);

        this.dealCardsPlayers = list;
        // 调控发牌
        await this.control.runControlDeal();

        this.countdown = baicaoConst.COUNTDOWN.LICENS;

        this.channelIsPlayer(baicaoConst.route.Licens, {
            players: list.map(pl => {
                return {
                    uid: pl.uid,
                    seat: pl.seat
                }
            }),
            countdown: this.countdown,
            total_bet: this.total_bet,
            status: this.status,
            restart,
            roundId: this.roundId
        });

        this.countdown_Interval = setInterval(() => {
            this.countdown--;
            if (this.countdown < 0) {
                clearInterval(this.countdown_Interval);
                this.Game_lookState(list);
            }
        }, 1000);
    }

    /**看牌阶段 */
    Game_lookState(list: baicaoPlayer[]) {
        let gamePlayers = this.players.filter(pl => pl && pl.status == "GAME");
        this.status = 'LOOK';
        this.countdown = baicaoConst.COUNTDOWN.LOOK;
        let opts = {
            countdown: this.countdown,
            status: this.status,
            players: list.map(pl => {
                return {
                    uid: pl.uid,
                    seat: pl.seat,
                    cardType: pl.cardType,
                    Points: pl.Points,
                    cards: pl.cards,
                }
            }),
        }
        this.channelIsPlayer(baicaoConst.route.LookState, opts);
        this.countdown_Interval = setInterval(() => {
            this.countdown--;
            if (this.countdown < 0) {
                clearInterval(this.countdown_Interval);
                this.Game_BIPAI(list);
            }
        }, 1000);
    }

    /**比牌 */
    Game_BIPAI(list: baicaoPlayer[]) {
        let gamePlayers = this.players.filter(pl => pl && pl.status == "GAME");
        this.countdown = baicaoConst.COUNTDOWN.BIPAI;
        this.status = "BIPAI";
        let plss = list.sort((a, b) => b.total_CardValue - a.total_CardValue);
        let pls = plss.filter(pl => pl.total_CardValue == plss[0].total_CardValue);
        if (pls.length == 0) {
            console.warn(`000`);
        }
        let win_arr = pls.map(c => c.uid);
        for (const pl of gamePlayers) {
            if (!win_arr.includes(pl.uid)) {
                pl.profit = -pl.bet;
            }
        }

        this.channelIsPlayer(baicaoConst.route.BipaiState, {
            status: this.status,
            countdown: this.countdown,
            players: list.map(pl => {
                if (pl) {
                    return {
                        uid: pl.uid,
                        profit: pl.profit,
                        seat: pl.seat,
                        cardType: pl.cardType,
                        Points: pl.Points,
                        cards: pl.cards,
                    }
                }
            })
        });
        this.countdown_Interval = setInterval(() => {
            this.countdown--;
            if (this.countdown < 0) {
                clearInterval(this.countdown_Interval);
                if (pls.length >= 2) {
                    this.roundTimes++;
                    this.Game_licensing(pls, true);
                    return;
                } else {
                    this.win_seat = pls[0].seat;
                }
                this.Game_settlement();
            }
        }, 1000);
    }

    /**结算 */
    async Game_settlement() {
        this.status = 'SETTLEMENT';
        this.countdown = baicaoConst.COUNTDOWN.SETTLEMENT;
        let gamePlayers = this.players.filter(pl => pl && pl.status == "GAME");
        for (const pl of gamePlayers) {
            if (this.win_seat != pl.seat) {
                pl.profit = -pl.bet;
                this.players[this.win_seat].profit += pl.bet;
            }
        }

        this.endTime = Date.now();
        this.zipResult = buildRecordResult(this.players);
        this.record_history["player_info"] = this.curPlayers.map(pl => pl.toResult());
        for (const pl of this.curPlayers) {
            await pl.updateGold(this);
        }


        // 通知结算结果
        this.channelIsPlayer(baicaoConst.route.SettleResult, {
            players: this.curPlayers.map(pl => pl.toResult()), countdown: this.countdown, status: this.status,
        });
        this.Initialization();
    }
}



