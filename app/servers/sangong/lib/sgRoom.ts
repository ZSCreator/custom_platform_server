'use strict';
import { pinus } from 'pinus';
import sgPlayer from './sgPlayer';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import { getLogger } from 'pinus-logger';
import { PersonalControlPlayer } from "../../../services/newControl";
import Control from "./control";
import { buildRecordResult } from "./util/recordUtil";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import MessageService = require('../../../services/MessageService');
import sangong_logic = require('./sangong_logic');
import utils = require('../../../utils/index');
import sangongConst = require('./sangongConst');
import roomManager, { sgRoomManger } from '../lib/SangongMgr';
const LoggerInfo = getLogger('server_out', __filename);
const ZERO = 0;

function getRandomNumber(min: number, max: number) {
    if (max % 1 !== 0 || min % 1 !== 0) {
        throw "min, max不能为非整数";
    }

    const MAX = Math.max(min, max);
    const MIN = Math.min(min, max);
    const MM = MAX - MIN + 1;

    return Math.floor(Math.random() * MM) + MIN;
}

const WAIT_TIME = 5000;

// 房间逻辑
// 准备 -> 抢庄 -> 确定庄家 -> 闲家下注 -> 闲家与庄家比牌 -> 结算 -> 初始化
/**
 * 游戏房间
 * @property startTime 回合开始时间
 * @property endTime 回合结束时间
 * @property zipResult 压缩结算结果
 */
export default class sgRoom extends SystemRoom<sgPlayer> {
    lowBet: number;
    entryCond: number;
    /**结算时间不一定 */
    SETTLE_COUNTDOWN: number = 0;
    /**NONE   LICENS发牌 ROB抢庄 ROBANIMATION抢庄动画阶段 BET下注 LOOK看牌阶段 SETTLEME结算阶段*/
    status: 'INWAIT' | 'LICENS' | 'ROB' | 'ROBANIMATION' | 'BET' | 'LOOK' | 'SETTLEMENT' = 'INWAIT';
    /**每局总下注 */
    allBet: number = 0;
    /**当前参与游戏的玩家列表 当抢庄结束后变成闲家列表 */
    curPlayers: sgPlayer[] = [];
    /**抢庄列表 */
    robBankers: sgPlayer[] = [];
    /**当前房间的庄家 */
    Banker: sgPlayer;
    readyTimer: any;
    stateTime: number = 0;
    lookStateTimer: NodeJS.Timer;
    betTimer: NodeJS.Timer;
    robTimer: NodeJS.Timer;
    /**玩家列表 */
    players: sgPlayer[] = new Array(6).fill(null);// 玩家列表;;
    /**当前调控方案 */
    controlPlan: number = 0;
    /**当局的牌型 */
    cards: { cards: number[], cardType: number }[] = [];

    control: Control;
    lastWaitTime: number;
    waitTimeout: NodeJS.Timeout = null;

    startTime: number;
    endTime: number;
    zipResult: string = '';
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
    close() {
        this.sendRoomCloseMessage();
        this.players = [];
    }
    /**初始化 */
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

    /**
     * 踢掉离线玩家 以及 金币不满足进入条件玩家
     */
    battle_kickNoOnline() {
        const offLinePlayers: sgPlayer[] = [];
        for (const pl of this.players) {
            if (!pl) continue;
            // 不在线移除玩家 在线则不移除 因为还在这个场中
            if (!pl.onLine) roomManager.removePlayer(pl);
            this.exit(pl, false);
            offLinePlayers.push(pl);
        }
        //更新数据（前端需要切换场景）
        this.kickingPlayer(pinus.app.getServerId(), offLinePlayers);
    }


    /**有玩家退出
     * @param uid
     * @param isOffLine true离线
     */
    async exit(playerInfo: sgPlayer, isOffLine: boolean) {
        if (isOffLine) {
            playerInfo.onLine = false;
            playerInfo.leaveTimer = Date.now();
            // 通知其他玩家有人离线
            this.channelIsPlayer(sangongConst.route.Offline, { uid: playerInfo.uid });
            return;
        }
        this.players[playerInfo.seat] = null;
        this.channelIsPlayer(sangongConst.route.OnExit, { uid: playerInfo.uid });
        this.kickOutMessage(playerInfo.uid);
        roomManager.removePlayerSeat(playerInfo.uid);
    }

    /**玩家加入 如果玩家在房间列表中说明是离线玩家 */
    addPlayerInRoom(dbplayer) {
        if (this.getPlayer(dbplayer.uid)) {
            this.reconnectPlayer(dbplayer.uid);
        } else {
            const idxs: number[] = [];
            this.players.forEach((m, i) => !m && idxs.push(i));//空位置压入数组
            // 数组中随机一个位置
            const i = idxs[utils.random(0, idxs.length - 1)];
            this.players[i] = new sgPlayer(dbplayer, i);
            this.players[i].status = "WAIT";
            // 通知其他人有玩家加入
            this.channelIsPlayer(sangongConst.route.Add, this.players[i].strip());
        }

        // 把玩家加入消息通道
        this.addMessage(dbplayer);
        return true;
    }

    /**重连 */
    reconnectPlayer(uid: string) {
        const currPlayer = this.getPlayer(uid);
        if (!currPlayer) return;
        currPlayer.onLine = true;
        // 通知其他玩家有人重新连接
        this.channelIsPlayer(sangongConst.route.Reconnect, { uid });
    }

    /**游戏数据 */
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

    /**当前状态的时间 */
    toStatusTime() {
        let Time = 0;
        if (this.status == 'INWAIT') return ZERO;
        if (this.status == 'SETTLEMENT') return this.SETTLE_COUNTDOWN;
        Time = (sangongConst.COUNTDOWN[this.status] - (Date.now() - this.stateTime));
        return Time;
    }

    /**判断庄  如果没人抢庄 随机一个参与玩家为庄 否则根据抢庄大的为庄 */
    judgeBanker() {
        if (this.robBankers.length === 0) {
            const curLength = this.curPlayers.length - 1;
            this.Banker = this.curPlayers[getRandomNumber(0, curLength)];
            /**前端要求 他好做 特效 */
            this.robBankers = this.curPlayers;
        } else {
            this.robBankers.sort((x, y) => y.robOdds - x.robOdds);
            this.robBankers = this.robBankers.filter(player => player.robOdds === this.robBankers[0].robOdds);

            // 如果调控是调控方案一则找到调控的人, 他必然是庄
            if (this.controlPlan === 1) {
                const controlPlayer = this.robBankers.find(player => player.control);
                this.Banker = controlPlayer || this.robBankers[getRandomNumber(0, this.robBankers.length - 1)];
            } else {
                this.Banker = this.robBankers[getRandomNumber(0, this.robBankers.length - 1)];
            }
        }

        this.Banker.isBanker = true;
        // this.Banker.winCount = 0;
    }


    /**
     * 洗牌
     */
    riffle(gamePlayers: sgPlayer[]) {
        let aPoker = sangong_logic.getpai();

        const cards: { cards: number[], cardType: number }[] = [];
        for (let len = gamePlayers.length - 1; len >= 0; len--) {
            const card = aPoker.splice(0, 3);
            const cardType = sangong_logic.getCardTypeBySg(card);
            cards.push({ cards: card, cardType });
        }

        // 检测是否出现混三公 小三公 大三公
        if (Math.random() <= sangongConst.sangongProbability) {
            const len = getRandomNumber(0, gamePlayers.length - 1);

            for (let i = 0; i < len; i++) {
                for (let i = 0; i < 10000; i++) {
                    aPoker.sort(() => 0.5 - Math.random());
                    const card = aPoker.slice(0, 3);
                    const cardType = sangong_logic.getCardTypeBySg(card);

                    // 检测是否是大牌
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

        // 给几副牌逆序排序
        cards.sort((x, y) => Number(sangong_logic.bipaiSoleBySg(y, x)) - Number(sangong_logic.bipaiSoleBySg(x, y)));

        this.cards = cards;
    }


    /**
     * 个控发牌
     * @param positivePlayers 正调控玩家 在这里的玩家赢得概率高
     * @param negativePlayers 负调控玩家 在这里的玩家赢得概率高
     */
    controlPersonalDeal(positivePlayers: PersonalControlPlayer[], negativePlayers: PersonalControlPlayer[]): void {
        // 未发牌的玩家
        let dealtPlayers = this.curPlayers;

        positivePlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));
        negativePlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));

        // 如果玩家在正调控里 则从头部取大牌给玩家 不用关心同时有负调控玩家 因为大牌已经被正调控玩家取了
        if (positivePlayers.length) {
            positivePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                const player = this.getPlayer(p.uid);
                const handCards = this.cards.shift();
                player.licensing(handCards.cards, handCards.cardType);
                dealtPlayers = dealtPlayers.filter(dealtPlayer => p.uid !== dealtPlayer.uid);
            })
        } else {
            // 如果玩家在负调控里 则从尾部去小牌给玩家
            negativePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                const player = this.getPlayer(p.uid);
                const handCards = this.cards.pop();
                player.licensing(handCards.cards, handCards.cardType);
                dealtPlayers = dealtPlayers.filter(dealtPlayer => p.uid !== dealtPlayer.uid);
            });
        }

        // 打乱牌
        this.cards.sort((a, b) => Math.random() - 0.5);

        // 剩余的玩家随机发牌
        dealtPlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
            const handCards = this.cards.pop();
            p.licensing(handCards.cards, handCards.cardType);
        });
    }

    /**
     * 场控发牌
     * @param sceneControlState 场控状态
     * @param isPlatformControl
     */
    sceneControl(sceneControlState: ControlState, isPlatformControl) {
        if (sceneControlState === ControlState.NONE) {
            return this.randomDeal(this.curPlayers);
        }

        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        this.curPlayers.forEach(p => p.setControlType(type));

        // 如果场控为输 给玩家发最小的牌 否则给玩家发最大的牌
        const winType = sceneControlState === ControlState.PLAYER_WIN ? RoleEnum.REAL_PLAYER : RoleEnum.ROBOT;
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

    /**
     * 随机发牌
     */
    randomDeal(list: sgPlayer[]) {
        list.sort((a, b) => Math.random() - 0.5);
        for (const pl of list) {
            this.cards.sort((a, b) => Math.random() - 0.5);
            const handCards = this.cards.shift();
            pl.licensing(handCards.cards, handCards.cardType);
        }
    }

    async licensingControl(list: sgPlayer[]) {
        // 洗牌
        this.riffle(list);
        // 只有机器人或者只有真人不执行调控
        if (!list.every(pl => pl && pl.isRobot === 0) &&
            !list.every(pl => pl && pl.isRobot === 2)) {
            await this.control.runControlDeal();
        } else {
            this.randomDeal(list);
        }
    }

    /*-------------------------------------- 房间运行逻辑部分 ----------------------------------------- */


    /**进入准备状态 */
    wait(currPlayer?: sgPlayer) {
        if (this.status == `INWAIT`) {
            // 如果只剩一个人的时候或者没有人了 就直接关闭房间
            if (this.players.filter(pl => pl && pl.status == `WAIT`).length <= 1) {
                this.channelIsPlayer(sangongConst.route.ReadyState, { waitTime: 0 });
                return;
            }
            // 通知 所有人开始准备
            if (Date.now() - this.lastWaitTime < WAIT_TIME) {//5s内就不重复通知玩家
                const member = currPlayer && this.channel.getMember(currPlayer.uid);
                if (member) {
                    let waitTime = Math.max(WAIT_TIME - (Date.now() - this.lastWaitTime), 0);
                    MessageService.pushMessageByUids(sangongConst.route.ReadyState, { waitTime }, member);
                }
                return;
            }

            this.channelIsPlayer(sangongConst.route.ReadyState, { waitTime: WAIT_TIME });

            this.lastWaitTime = Date.now(); // 这个记录只用于前段请求的时候用 毫秒
            // 等一段时间后强行开始发牌
            clearTimeout(this.waitTimeout);
            this.waitTimeout = setTimeout(() => {
                // 人数超过2个就强行开始
                const list = this.players.filter(pl => pl);//&& pl.status == `WAIT`
                if (list.length >= 2) {
                    this.licensing_step_1(list);
                } else {// 否则就关闭房间 因为当玩家进来的时候会再次检查
                    this.channelIsPlayer(sangongConst.route.ReadyState, { waitTime: 0 });// 通知还在的人不要准备了 等待其他人来
                }
            }, WAIT_TIME);
        }
    }

    /**发牌 */
    async licensing_step_1(list: sgPlayer[]) {
        this.startTime = Date.now();
        this.stateTime = Date.now();
        this.status = 'LICENS';
        list.forEach(pl => pl.status = "GAME");
        this.curPlayers = list;

        await this.licensingControl(list);

        const opts = {
            players: list.map(pl => pl.robStrip()),
        }

        this.channelIsPlayer(sangongConst.route.Licens, opts);

        setTimeout(() => {
            this.robBanker_step_2();
        }, sangongConst.COUNTDOWN.LICENS);
    }

    /**进入抢庄状态 */
    robBanker_step_2() {
        this.status = 'ROB';
        // 通知玩家进入抢庄状态
        const opts = {
            countdown: sangongConst.COUNTDOWN.ROB,
            players: this.curPlayers.map(pl => pl.robStrip()),
        }
        this.channelIsPlayer(sangongConst.route.RobState, opts);

        this.robTimer = setTimeout(() => {
            this.robAnimation_step_3();
        }, sangongConst.COUNTDOWN.ROB);
    }

    /**延迟进入下注状态， 给前端做抢庄动画的时间 */
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
        }
        if (this.Banker.isRob == false) {
            opts.noRob.push(this.Banker.robStrip());
        }

        this.channelIsPlayer(sangongConst.route.RobAnimation, opts);

        setTimeout(async () => {
            await this.betState_step_4();
        }, sangongConst.COUNTDOWN.ROBANIMATION);
    }

    /**进入下注状态 */
    async betState_step_4() {
        this.status = 'BET';
        this.stateTime = Date.now();
        for (const pl of this.players) {
            if (!pl) continue;
            const member = this.channel.getMember(pl.uid);
            const opts: sangongConst.IBetState = {
                countdown: sangongConst.COUNTDOWN.BET,
                Banker: this.Banker.betStateStrip(),
                players: this.curPlayers.filter(c => c && c.uid != this.Banker.uid).map(c => {
                    return {
                        uid: c.uid,
                        seat: c.seat,
                        totalOdds: c.totalOdds,
                        control: pl.isRobot == 2 ? c.control : null
                    }
                }),
            }
            MessageService.pushMessageByUids(sangongConst.route.BetState, opts, member);
            // this.channelIsPlayer(sangongConst.route.BetState, opts);
        }

        // 如果在下注的时候没人点选按钮，按默认下注倍数下注
        this.betTimer = setTimeout(() => {
            const notBetPlayers = this.curPlayers.filter(pl => pl.uid != this.Banker.uid && !pl.isBet);
            for (const pl of notBetPlayers) {
                pl.handler_bet(this, pl.bOdds);
            }
        }, sangongConst.COUNTDOWN.BET);
    }

    // 看牌阶段
    lookState_step_5() {
        clearTimeout(this.betTimer);
        this.status = 'LOOK';
        this.stateTime = Date.now();

        // const bCardtype = this.Banker.cardType;
        this.Banker.cardsOdds = sangongConst.Odds[this.Banker.cardType];
        /**以小博大*/
        {
            /**庄家赢取 */
            let totalWin = 0;
            /**计算庄家可赢取 */
            for (const pl of this.curPlayers) {
                if (pl.uid == this.Banker.uid) continue;
                const isBankerWin = sangong_logic.bipaiSoleBySg(this.Banker, pl);
                if (isBankerWin) {
                    let mloseGold = this.Banker.cardsOdds * this.Banker.robOdds * pl.bet;
                    // 检查玩家钱包的金币
                    pl.profit = - mloseGold;
                    totalWin += mloseGold;
                }
            }
            /**原始赢取 算比列用 */
            let initialWin = totalWin;
            /**修正最大赢取 */
            if (totalWin > this.Banker.gold) {
                totalWin = this.Banker.gold;
            }
            /**临时计算 储存值 */
            let temp_totalWin = totalWin;
            /**按比列 和 最大输 修正玩家输出金币 */
            for (const pl of this.curPlayers) {
                if (pl.uid == this.Banker.uid) continue;
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
            /**第二部分 庄家输钱出去 */
            let totalLoss = 0;
            for (const pl of this.curPlayers) {
                if (pl.uid == this.Banker.uid) continue;
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
            /**原始赢取 算比列用 */
            let initialLoss = totalLoss;
            /**修正最大赢取 */
            if (Math.abs(totalLoss) > (this.Banker.gold + totalWin)) {
                totalLoss = -(this.Banker.gold + totalWin);
            }
            /**按比列 和 最大输 修正玩家输出金币 */
            for (const pl of this.curPlayers) {
                if (pl.uid == this.Banker.uid) continue;
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
        }
        this.channelIsPlayer(sangongConst.route.LookState, opts);

        this.lookStateTimer = setTimeout(() => {
            this.players.forEach(pl => pl && !pl.openCards && pl.handler_openCard(this));
        }, sangongConst.COUNTDOWN.LOOK);
    }

    /**结算 */
    async settlement() {
        clearTimeout(this.lookStateTimer)
        this.endTime = Date.now();
        this.status = 'SETTLEMENT';
        this.stateTime = Date.now();



        this.SETTLE_COUNTDOWN = sangongConst.COUNTDOWN.SETTLEMENT;



        // 压缩结果
        this.zipResult = buildRecordResult(this.players);


        for (const pl of this.curPlayers) {
            if (pl.profit < 0 && pl.gold < Math.abs(pl.profit)) {
                console.warn(this.roundId, pl.uid, `1111`, this.curPlayers.map(c => c.uid).toString());
            }
            await pl.updateGold(this);
        }
        for (const pl of this.curPlayers) {
            await pl.only_update_game(this);
        }
        // 通知结算结果
        const opts = {
            players: this.curPlayers.map(pl => pl.toResult()),
            Banker: this.Banker.toResult(),
        }
        this.channelIsPlayer(sangongConst.route.SettleResult, opts);
        this.Initialization();
    }
}



