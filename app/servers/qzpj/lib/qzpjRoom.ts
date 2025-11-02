import { pinus } from 'pinus';
import qzpjPlayer from './qzpjPlayer';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import roomManager from './qzpjMgr';
import { getLogger } from 'pinus-logger';
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import utils = require('../../../utils/index');
import *as qzpj_logic from "./qzpj_logic";
import * as qzpjConst from './qzpjConst';
import * as MessageService from '../../../services/MessageService';
import { RoomState, route } from './qzpjConst';
import { clearInterval } from 'timers';
import Control from "./control";
import { PersonalControlPlayer } from "../../../services/newControl";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import { getCardType, getPoints } from "./qzpj_logic";


const CC_DEBUG = false;

enum STATUS_TIME {
    NONE = 0,
    /**抢庄时间 */
    ROBZHUANG = 5,
    /**准备下注 */
    READYBET = 5,
    /**查看手牌 */
    LOOK = 1,
    /**结果 准备 */
    SETTLEMENT = 5,
    /**准备倒计时 */
    AWITTIMER = 5
};

/**
 * 牛牛房间
 * @property startTime 回合开始时间
 * @property endTime 回合结束时间
 * @property zipResult 压缩结算结果
 */
export default class qzpjRoom extends SystemRoom<qzpjPlayer> {
    /**ROBZHUANG.抢庄 READYBET.下注 LOOK.查看手牌 SETTLEMENT.结算 */
    status: RoomState = RoomState.NONE;
    /**已经多少轮游戏了 */
    roundTimes: number = 1;
    /**抢庄列表 */
    robzhuangs: { uid: string, mul: number, gold: number }[] = [];
    /**庄信息 */
    zhuangInfo: { uid: string, mul: number, seat: number };
    /**底分 */
    lowBet: number;
    /**进入条件 */
    entryCond: number;

    /**是否进入结算阶段 */
    isSettlement: boolean;
    /** 牌 */
    _cards: number[] = [];

    /**robot 需要用的数据 */
    max_uid: string;
    /**获取当前参与的玩家 */
    _cur_players: qzpjPlayer[] = [];
    statusTime: number = Date.now();

    players: qzpjPlayer[];
    auto_time: number;

    // roomUserLimit = 6;

    startTime: number;
    endTime: number;
    zipResult: string = '';
    Logger = getLogger('server_out', __filename);


    Oper_timeout: NodeJS.Timeout;
    waitTimer: NodeJS.Timeout;
    /**1点从庄家开始，2点从庄家的下家 */
    setSice: number[];
    /** 发牌位置 */
    startSeat: number = 0;
    control: Control;

    constructor(opts: any) {
        super(opts);
        this.players = new Array(this.maxCount).fill(null);// 玩家列表

        this.zhuangInfo = null;// 庄信息
        this.lowBet = opts.lowBet;//最低下注
        this.entryCond = opts.entryCond; // 进入条件
        this.auto_time = STATUS_TIME.NONE;

        // this.isLook = false;//是否进入看牌阶段
        this.isSettlement = false;//是否进入结算阶段
        this.max_uid = '';
        this.Initialization(true);
        this.control = new Control({ room: this });
    }

    close() {
        this.sendRoomCloseMessage();
    }

    /**初始化 */
    Initialization(twoStrategy: boolean) {
        if (twoStrategy == true) {
            this.battle_kickNoOnline();
            this.status = RoomState.INWAIT;
        }
        this.max_uid = '';
        this.isSettlement = false;
        twoStrategy && (this.roundTimes = 1);
        this.zhuangInfo = null;
        this.robzhuangs = [];
        this.updateRoundId();
    }

    /**添加玩家 */
    addPlayerInRoom(dbplayer) {
        let playerInfo = this.getPlayer(dbplayer.uid);
        if (playerInfo) {
            playerInfo.sid = dbplayer.sid;
            this.offLineRecover(playerInfo);
            return true;
        }
        if (this.isFull()) return false;
        const seat = this.players.findIndex(pl => pl == null);
        // 随机一个位置
        this.players[seat] = new qzpjPlayer(seat, dbplayer);
        // 添加到消息通道
        this.addMessage(dbplayer);
        return true;
    }

    /**
     * 有玩家离开
     * @param uid
     * @param isOffLine true 玩家掉线退出游戏
     */
    leave(playerInfo: qzpjPlayer, isOffLine: boolean) {
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        this.kickOutMessage(playerInfo.uid);
        this.players[playerInfo.seat] = null;
        let opts = {
            uid: playerInfo.uid,
            playerNum: this.players.filter(m => m != null).length
        }
        this.channelIsPlayer(route.qzpj_onExit, opts);
        roomManager.removePlayerSeat(playerInfo.uid);
    }

    /**当前状态 */
    toStatus() {
        return {
            status: this.status,
            auto_time: this.auto_time
        };
    }

    //开始准备倒计时
    async wait(playerInfo?: qzpjPlayer) {
        if (this.status == RoomState.NONE || this.status == RoomState.INWAIT) {
            // 如果只剩一个人的时候或者没有人了 就直接关闭房间
            if (this.players.filter(pl => pl).length <= 1) {
                this.channelIsPlayer(`qzpj.onWait`, { waitTime: 0, roomId: this.roomId });
                return;
            }
            // 通知 所有人开始准备
            if (Date.now() - this.statusTime < STATUS_TIME.AWITTIMER * 1000) {//5s内就不重复通知玩家
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
                // 人数超过2个就强行开始
                const list = this.players.filter(pl => pl);
                if (list.length >= 4) {
                    this.handler_start();
                } else {
                    //再次通知前端准备
                    this.channelIsPlayer('qzpj.onWait', { waitTime: 0, roomId: this.roomId });
                }
            }, STATUS_TIME.AWITTIMER * 1000);
        }
    }

    /**运行游戏 */
    handler_start() {
        CC_DEBUG && console.warn("handler_start");
        this.status = RoomState.ROBZHUANG;
        this.Initialization(false);
        this.players.forEach(pl => pl && pl.initGame());
        this.status = RoomState.ROBZHUANG;
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

        const opts: qzpjConst.IRoom_route_start = { lookPlayer, auto_time: this.auto_time, r: utils.random(1, 100) };
        this.channelIsPlayer(route.qzpj_onStart, opts);
        this.handler_pass();
    }


    /**准备下注   设置庄 - 下注 */
    async handler_readybet() {
        CC_DEBUG && console.warn("handler_readybet");
        this.statusTime = Date.now();
        clearInterval(this.Oper_timeout);
        let robzhuangs = this.players.filter(pl => pl && pl.robmul > 0).sort((a, b) => b.robmul - a.robmul);
        let zhuang_player = this.players[0];
        if (robzhuangs.length > 0) {
            zhuang_player = robzhuangs.filter(c => c.robmul == robzhuangs[0].robmul).sort((a, b) => b.gold - a.gold)[0];
        } else {
            /**如果没有人抢庄 则最有钱的当庄 */
            this._cur_players.sort((a, b) => 0.5 - Math.random());
            zhuang_player = this._cur_players[0];
            zhuang_player.robmul = 1;
        }
        try {
            this.zhuangInfo = { uid: zhuang_player.uid, mul: zhuang_player.robmul, seat: zhuang_player.seat };
        } catch (error) {
            console.warn(error);
        }
        // 根据是否要随机庄 改变时间
        this.auto_time = this.robzhuangs.length === 1 ? 0.5 : 2.5;
        let opts: qzpjConst.IRoom_route_bet = {
            stateInfo: this.toStatus(),
            robzhuangs: this.robzhuangs.map(m => m),
            zhuangInfo: this.zhuangInfo,
            players: this._cur_players.map(pl => pl.toRobzhuangData()),
            auto_time: this.auto_time,
        }
        this.channelIsPlayer(route.qzpj_onSetBanker, opts);
        clearInterval(this.Oper_timeout);
        this.Oper_timeout = setInterval(() => {
            this.auto_time--;
            if (this.auto_time > 0) return;
            clearInterval(this.Oper_timeout);
            this.handler_readybet2();
        }, 1000)
    }

    async handler_readybet2() {
        this.auto_time = STATUS_TIME.READYBET;
        this.status = RoomState.READYBET;
        for (const pl of this.players) {
            if (!pl) continue;
            let BMax = pl.gold / (this.lowBet * this.zhuangInfo.mul);
            BMax = Math.ceil(Math.min(BMax, 30));
            pl.bet_mul_List = [1];
            let B2 = Math.max(Math.ceil(BMax * 0.25), 1);
            const B3 = Math.ceil(BMax * 0.5);
            const B4 = Math.ceil(BMax * 0.75);
            if (!pl.bet_mul_List.includes(B2) && B2 > 1) pl.bet_mul_List.push(B2);
            if (!pl.bet_mul_List.includes(B3) && B3 > 1) pl.bet_mul_List.push(B3);
            if (!pl.bet_mul_List.includes(B4) && B4 > 1) pl.bet_mul_List.push(B4);
            if (!pl.bet_mul_List.includes(BMax) && BMax > 1) pl.bet_mul_List.push(BMax);
            // console.warn(BMax, pl.bet_mul_List.toString());
            const member = pl && this.channel.getMember(pl.uid);
            member && MessageService.pushMessageByUids(route.qzpj_onReadybet, {
                auto_time: this.auto_time,
                bet_mul_List: pl.bet_mul_List
            }, member);
        }
        // this.channelIsPlayer(route.qzpj_onReadybet, { auto_time: this.auto_time });
        this.handler_pass();
    }

    handler_pass() {
        clearInterval(this.Oper_timeout);
        this.Oper_timeout = setInterval(() => {
            this.auto_time--;
            if (this.auto_time > 0) return;
            clearInterval(this.Oper_timeout);
            if (this.status == RoomState.ROBZHUANG) {
                let players = this.players.filter(pl => pl && pl.status == 'GAME' && pl.robmul == -1);
                for (const pl of players) {
                    pl.handler_robBanker(this, 0);
                }
            } else if (this.status == RoomState.READYBET) {
                let players = this.players.filter(pl => pl && pl.status == 'GAME' && pl.isBet == 0 && pl.uid !== this.zhuangInfo.uid);
                for (const pl of players) {
                    pl.handler_bet(this, pl.bet_mul_List[0]);
                }
            }
        }, 1000)
    }

    /**发牌 */
    async handler_deal() {
        clearInterval(this.Oper_timeout);
        CC_DEBUG && console.warn("handler_deal");
        this.status = RoomState.DICE;
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
        }
        this.channelIsPlayer(route.qzpj_setSice, opts);
        await utils.delay(this.auto_time * 1000);

        this.status = RoomState.DEAL;
        this.statusTime = Date.now();
        this.auto_time = 0;

        // 调控发牌
        await this.control.runControl();

        for (let index = this.players.length + start_seat; index > start_seat; index--) {
            let seat = index;
            if (index >= this.players.length) seat = index - this.players.length;
            const pl = this.players[seat];
            const opts: qzpjConst.IRoom_route_Deal = pl.strip();
            this.channelIsPlayer(route.qzpj_onDeal, opts);
            // const member = this.channel.getMember(pl.uid);
            // member && MessageService.pushMessageByUids(route.qzpj_onDeal, opts, member);
            await utils.delay(500);
        }
        await utils.delay(1000);

        this.status = RoomState.LOOK;
        this.statusTime = Date.now();
        start_seat = this.nextFahuaIdx(this.zhuangInfo.seat);
        for (let index = start_seat; index < this.players.length + start_seat; index++) {
            let seat = index;
            if (index >= this.players.length) seat = index - this.players.length;
            const pl = this.players[seat];
            pl && this.liangpaiOpt(pl);
            await utils.delay(1000);
        }
        this.settlement();
    }

    /**亮牌操作 */
    liangpaiOpt(playerInfo: qzpjPlayer) {
        playerInfo.isLiangpai = true;
        let opts: qzpjConst.IRoom_route_liangpai = {
            uid: playerInfo.uid,
            seat: playerInfo.seat,
            cards: playerInfo.cards,
            cardType: playerInfo.cardType,
            points: playerInfo.points
        }
        this.channelIsPlayer(route.qzpj_liangpai, opts);
    }

    /**结算 */
    async settlement() {
        //已经结算了。不能再结算了
        if (this.isSettlement) return;
        this.isSettlement = true;
        this.endTime = Date.now();
        this.status = RoomState.SETTLEMENT;
        this.statusTime = Date.now();
        this.auto_time = 10;
        CC_DEBUG && console.warn("settlement");
        // 压缩开奖结果
        // this.zipResult = buildRecordResult(this.players, this);
        // 获取庄
        try {
            /**防止一小博大 */
            {
                const ply_zj = this._cur_players.find(pl => pl.uid === this.zhuangInfo.uid);
                /**不含庄家 */
                const curPlayers = this._cur_players.filter(pl => pl && pl.uid != ply_zj.uid);
                /**庄家赢取 */
                let totalWin = 0;
                /**计算庄家可赢取 */
                for (const pl of curPlayers) {
                    const is_zj_win = qzpj_logic.bipai(ply_zj.cards, pl.cards);
                    if (is_zj_win) {
                        let mloseGold = pl.betNum * this.zhuangInfo.mul * this.lowBet;
                        // 检查玩家钱包的金币
                        pl.profit = -mloseGold;
                        totalWin += mloseGold;
                    }
                }
                /**原始赢取 算比列用 */
                let initialWin = totalWin;
                /**修正最大赢取 */
                if (totalWin > ply_zj.gold) {
                    totalWin = ply_zj.gold;
                }
                /**临时计算 储存值 */
                let temp_totalWin = totalWin;
                /**按比列 和 最大输 修正玩家输出金币 */
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
                // console.warn(initialWin, totalWin);
                // console.warn(Banker);
                // console.warn(curPlayers);
                /**第二部分 庄家输钱出去 */
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
                // console.warn("=====", curPlayers);
                /**原始赢取 算比列用 */
                let initialLoss = totalLoss;
                /**修正最大赢取 */
                if (Math.abs(totalLoss) > (ply_zj.gold + totalWin)) {
                    totalLoss = -(ply_zj.gold + totalWin);
                }
                // let temp_totalLoss = totalLoss;
                /**按比列 和 最大输 修正玩家输出金币 */
                for (const pl of curPlayers) {
                    const is_zj_win = qzpj_logic.bipai(ply_zj.cards, pl.cards);
                    if (!is_zj_win) {
                        pl.profit = Math.abs((pl.profit / initialLoss) * totalLoss);
                    }
                }
                ply_zj.profit = totalWin + totalLoss;
            }
            //更新玩家金币
            for (const pl of this._cur_players) {
                await pl.updateGold(this);
            }
            // 通知
            const opts: qzpjConst.IRoom_route_onSettlement = {
                stateInfo: this.toStatus(),
                zhuangInfo: this.zhuangInfo,
                players: this._cur_players.map(m => m.toResult()),
                auto_time: this.auto_time,
                roundTimes: this.roundTimes
            };

            let less_gold = this.players.filter(c => !!c).some(c => c.gold < this.entryCond);
            if (this.roundTimes == 2 ||
                !this.players.some(pl => pl && pl.isRobot == RoleEnum.REAL_PLAYER) ||
                less_gold) {
                opts['less_gold'] = true;
                this.channelIsPlayer(route.qzpj_onSettlement, opts);
                //一把结束后延迟进入准备阶段
                this.Initialization(true);
            } else {
                this.channelIsPlayer(route.qzpj_onSettlement, opts);
                let Oper_timeout = setInterval(async () => {
                    this.auto_time -= 1;
                    if (this.auto_time <= 0) {
                        this.roundTimes++;
                        clearInterval(Oper_timeout);
                        this.handler_start();
                    }
                }, 1000);
            }
        } catch (error) {
            console.warn(`...`);
        }
    }


    /**
     * 下一个玩家 找不到玩家返回-1
     */
    nextFahuaIdx(doing: number) {
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

    /**游戏数据 */
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

    /**踢掉离线玩家 */
    battle_kickNoOnline() {
        const offLinePlayers: qzpjPlayer[] = [];
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
        return this._cur_players.every(p => p.isRobot === this._cur_players[0].isRobot);
    }

    /**
     * 开始坐标
     */
    async randomDeal() {
        let filterArr = [];
        for (let index = this.players.length + this.startSeat; index > this.startSeat; index--) {
            let seat = index;
            if (index >= this.players.length) seat = index - this.players.length;
            const pl = this.players[seat];
            if (!pl || filterArr.includes(pl.seat)) continue;
            filterArr.push(pl.seat);
            pl.cards = this._cards.splice(0, 2);
            pl.cardType = qzpj_logic.getCardType(pl.cards, true);
            pl.points = qzpj_logic.getPoints(pl.cards);
            CC_DEBUG && console.warn(pl.cards.toString(), pl.cards.map(c => qzpj_logic.pukes[c]).toString(), `|${pl.cardType}|${qzpj_logic.types[pl.cardType]}`);

            // const opts: qzpjConst.IRoom_route_Deal = pl.strip();
            // this.channelIsPlayer(route.qzpj_onDeal, opts);
            // await utils.delay(500);
        }
    }

    /**
     * 设置玩家的牌
     * @param player 被发牌的玩家
     * @param cards 牌
     */
    setPlayerCards(player: qzpjPlayer, cards: number[]) {
        player.cards = cards;
        player.cardType = qzpj_logic.getCardType(player.cards, true);
        player.points = qzpj_logic.getPoints(player.cards);
    }

    /**
     * 个控发牌
     * @param positivePlayers 正调控玩家 在这里的玩家赢得概率高
     * @param negativePlayers 负调控玩家 在这里的玩家赢得概率高
     */
    controlPersonalDeal(positivePlayers: PersonalControlPlayer[], negativePlayers: PersonalControlPlayer[]): void {
        positivePlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));
        negativePlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));

        // 对牌进行逆序排序
        let gamePlayers = this._cur_players;
        const results = [];
        for (let i = 0, len = this._cur_players.length; i < len; i++) {
            results.push(this._cards.splice(0, 2));
        }

        this.sortResult(results);

        // 如果玩家在正调控里
        if (positivePlayers.length) {
            positivePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                const player = this.getPlayer(p.uid);
                this.setPlayerCards(player, results.shift());
                gamePlayers = gamePlayers.filter(gamePlayer => gamePlayer.uid !== p.uid);
            })
        } else {
            // 如果杀给玩家发一副前4张牌有牛的牌
            negativePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                const player = this.getPlayer(p.uid);
                this.setPlayerCards(player, results.pop());
                gamePlayers = gamePlayers.filter(gamePlayer => gamePlayer.uid !== p.uid);
            })
        }
        // 剩余的玩家随机发牌
        gamePlayers.sort((a, b) => Math.random() - 0.5).forEach(player => this.setPlayerCards(player, results.shift()));
    }

    /**
     * 运行场控
     */
    async runSceneControl(sceneControlState: ControlState, isPlatformControl) {
        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        this._cur_players.forEach(p => p.setControlType(type));

        const results = [];
        for (let i = 0, len = this._cur_players.length; i < len; i++) {
            results.push(this._cards.splice(0, 2));
        }
        this.sortResult(results);

        let gamePlayers = this._cur_players;

        // 赢的玩家
        let possibleWinPlayers: qzpjPlayer[];
        // 输的玩家
        let lossPlayers: qzpjPlayer[];


        // 如果玩家赢
        if (sceneControlState === ControlState.PLAYER_WIN) {
            possibleWinPlayers = gamePlayers.filter(p => p.isRobot === RoleEnum.REAL_PLAYER);
            lossPlayers = gamePlayers.filter(p => p.isRobot === RoleEnum.ROBOT);
        } else {
            possibleWinPlayers = gamePlayers.filter(p => p.isRobot === RoleEnum.ROBOT);
            lossPlayers = gamePlayers.filter(p => p.isRobot === RoleEnum.REAL_PLAYER);
        }

        // 给胜利玩家类型发大牌
        possibleWinPlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
            this.setPlayerCards(p, results.shift());
        });

        // 给失败玩家随机发小牌
        lossPlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
            results.sort((a, b) => Math.random() - 0.5);
            this.setPlayerCards(p, results.pop());
        });
    }

    /**
     * 对结果进行排序
     * @param cards
     */
    sortResult(cards: number[][]) {
        cards.sort((a, b) => {
            return qzpj_logic.bipai(b, a) ? 1 : -1;
        });
    }
}
