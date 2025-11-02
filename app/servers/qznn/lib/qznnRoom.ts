import { pinus } from 'pinus';
import qznnPlayer from './qznnPlayer';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import roomManager, { qznnRoomManger } from '../lib/qznnMgr';
import { PersonalControlPlayer } from "../../../services/newControl";
import ControlImpl from "./ControlImpl";
import { getLogger } from 'pinus-logger';
import { buildRecordResult } from "./util/recordUtil";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";

import utils = require('../../../utils/index');
import qznn_logic = require("./qznn_logic");
import qznnConst = require('./qznnConst');
import MessageService = require('../../../services/MessageService');


enum STATUS {
    NONE = 0,
    /**抢庄时间 */
    ROBZHUANG = 16000,
    /**准备下注 */
    READYBET = 10000,
    /**查看手牌 */
    LOOK = 16000,
    /**结果 准备 */
    SETTLEMENT = 5000,
    /**准备倒计时 */
    AWITTIMER = 5000
};

/**
 * 牛牛房间
 * @property startTime 回合开始时间
 * @property endTime 回合结束时间
 * @property zipResult 压缩结算结果
 */
export default class qznnRoom extends SystemRoom<qznnPlayer> {
    /**ROBZHUANG.抢庄 READYBET.下注 LOOK.查看手牌 SETTLEMENT.结算 */
    status: 'NONE' | 'INWAIT' | 'ROBZHUANG' | 'READYBET' | 'LOOK' | 'SETTLEMENT' = 'INWAIT';
    /**战绩列表 记录每局信息 */
    // roundDatas: { list: { uid: string }[] }[];
    /**抢庄列表 */
    robzhuangs: { uid: string, mul: number, gold: number }[] = [];
    /**庄信息 */
    zhuangInfo: { uid: string, mul: number, seat: number };
    /**底分 */
    lowBet: number;
    /**进入条件 */
    entryCond: number;
    tempReadybetTime: number;
    /**是否进入看牌阶段 */
    isLook: boolean;
    /**是否进入结算阶段 */
    isSettlement: boolean;
    /** 牌 */
    pais: number[] = [];

    /**robot 需要用的数据 */
    max_uid: string;
    /**获取当前参与的玩家 */
    _cur_players: qznnPlayer[] = [];
    statusTime: number;
    robzhuangTimeout: NodeJS.Timer = null;
    readybetTimeout: NodeJS.Timer = null;
    lookTimeout: NodeJS.Timer = null;
    waitTimer: NodeJS.Timer = null;
    currWaitTime: number = Date.now();
    autoStartTime: number;
    players: qznnPlayer[];
    controlLogic: ControlImpl;
    /**52张手牌 */
    theCards: number[] = [];
    roomUserLimit = 6;

    startTime: number;
    endTime: number;
    zipResult: string = '';
    Logger = getLogger('server_out', __filename);
    constructor(opts: any) {
        super(opts);
        this.players = new Array(this.roomUserLimit).fill(null);// 玩家列表

        this.zhuangInfo = null;// 庄信息
        this.lowBet = opts.lowBet;//最低下注
        this.entryCond = opts.entryCond; // 进入条件
        this.tempReadybetTime = STATUS.READYBET;

        this.isLook = false;//是否进入看牌阶段
        this.isSettlement = false;//是否进入结算阶段
        this.max_uid = '';
        this.controlLogic = new ControlImpl({ room: this });
        this.Initialization();
    }
    close() {
        this.sendRoomCloseMessage();
        // this.players = [];
    }
    /**初始化 */
    Initialization() {
        this.battle_kickNoOnline();
        this.max_uid = '';
        this.isLook = false;
        this.isSettlement = false;
        this.zhuangInfo = null;


        this.updateRoundId();
        this.status = 'INWAIT';
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
        this.players[seat] = new qznnPlayer(seat, dbplayer);
        // 添加到消息通道
        this.addMessage(dbplayer);
        return true;
    }

    /**
     * 有玩家离开
     * @param uid 
     * @param isOffLine true 玩家掉线退出游戏
     */
    leave(playerInfo: qznnPlayer, isOffLine: boolean) {
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        this.kickOutMessage(playerInfo.uid);
        this.players[playerInfo.seat] = null;
        this.channelIsPlayer('qz_onExit', { uid: playerInfo.uid, playerNum: this.players.filter(m => m != null).length });
        roomManager.removePlayerSeat(playerInfo.uid);
    }

    /**当前状态 */
    toStatus() {
        let time = STATUS[this.status] || 0;

        if (this.status == 'READYBET') {
            time = this.tempReadybetTime;
        }
        return {
            status: this.status,
            countdown: Math.max(time - (Date.now() - this.statusTime), 1)
        };
    }

    //开始准备倒计时
    async wait(playerInfo?: qznnPlayer) {
        if (this.status == 'NONE' || this.status == 'INWAIT') {
            // 如果只剩一个人的时候或者没有人了 就直接关闭房间
            if (this.players.filter(pl => pl).length <= 1) {
                this.channelIsPlayer(`qz_onWait`, { waitTime: 0, roomId: this.roomId });
                return;
            }
            // 通知 所有人开始准备
            if (Date.now() - this.currWaitTime < STATUS.AWITTIMER) {//5s内就不重复通知玩家
                const member = playerInfo && this.channel.getMember(playerInfo.uid);
                if (member) {
                    MessageService.pushMessageByUids(`qz_onWait`, { waitTime: Math.round(Date.now() - this.currWaitTime) }, member);
                }
                return;
            }
            this.currWaitTime = Date.now();
            this.channelIsPlayer('qz_onWait', { waitTime: STATUS.AWITTIMER, roomId: this.roomId });

            clearTimeout(this.waitTimer);
            this.waitTimer = setTimeout(async () => {
                // 人数超过2个就强行开始
                const list = this.players.filter(pl => pl);
                if (list.length >= 2) {
                    this.handler_start();
                } else {
                    //再次通知前端准备
                    this.channelIsPlayer('qz_onWait', { waitTime: 0, roomId: this.roomId });
                }
            }, STATUS.AWITTIMER);
        }
    }

    /**运行游戏 */
    handler_start() {
        this.status = 'ROBZHUANG';
        this.startTime = Date.now();
        this.players.forEach(pl => pl && (pl.status = `GAME`));
        this._cur_players = this.players.filter(pl => pl);
        // this.Logger.debug('抢庄牛牛开始运行', this.roomId);
        let lookPlayer = this.players.filter(pl => pl && pl.status != 'GAME').map(pl => {
            return { uid: pl.uid, seat: pl.seat, cards: pl.cards };
        });
        let gamePlayer = this._cur_players.map(pl => {
            return { uid: pl.uid, seat: pl.seat };
        });
        const opts: qznnConst.Iqz_onStart = { lookPlayer, gamePlayer };
        this.channelIsPlayer('qz_onStart', opts);
        this.handler_robzhuang();
    }

    /**获取剩余等待时间 */
    getWaitTime() {
        if (this.status == 'NONE' || this.status == 'INWAIT') {
            return Math.max(STATUS.AWITTIMER - (Date.now() - this.currWaitTime), 0);
        }
        return 0;
    }

    /**明牌抢庄   发牌 - 抢庄 */
    async handler_robzhuang() {
        this.status = 'ROBZHUANG';
        this.statusTime = Date.now();
        this.robzhuangs = [];

        // 发牌
        await this.controlLogic.runControl();

        // 判断谁的牌最大
        this.max_uid = this.findMaxUid();

        const cards = this._cur_players.map(p => p.cards);
        // 对牌进行降序排序
        this.sortResult(cards);
        let realPlayer = false;
        for (const card of cards) {
            let pl = this._cur_players.find(c => c && c.cards.toString() == card.toString())
            if (pl.isRobot == 0) {
                realPlayer = true;
            } else if (pl.isRobot == 2 && realPlayer == false) {
                pl.Rank = true;
            }
        }

        this.players.forEach(pl => {
            const member = pl && this.channel.getMember(pl.uid);
            if (!member) return;
            // 通知玩家说话
            const opts: qznnConst.Iqz_onRobzhuang = {
                stateInfo: this.toStatus(),
                roundId: this.roundId,
                players: this._cur_players.map(pl => pl.toMingPaiInfo(pl.uid)),
            }
            if (pl && pl.isRobot == RoleEnum.ROBOT) {
                opts.max_uid = this.max_uid;
                opts.isControl = this.controlLogic.isControl;
                opts.Rank = pl.Rank;
            }
            MessageService.pushMessageByUids('qz_onRobzhuang', opts, member);
        });
        // 延迟后 下注
        this.robzhuangTimeout = setTimeout(() => {
            this.Logger.debug('抢庄牛牛开始下注', this.roomId);
            this.readybet();
        }, STATUS.ROBZHUANG);
    }

    /**
     * 查找最大的牌的uid
     */
    private findMaxUid(): string {
        const cards = this._cur_players.map(p => p.cards);

        // 对牌进行降序排序
        this.sortResult(cards);

        // 直接查找持有这副牌的玩家id 引入cards里面保存的都是是数组对象引用 所以可直接进行比对查找
        const player = this._cur_players.find(p => p.cards == cards[0]);

        return !!player ? player.uid : '';
    }

    /**抢庄 操作 */
    robzhuangOpt(currPlayer: qznnPlayer, mul: number) {
        currPlayer.robmul = mul == 0 ? 1 : mul;
        this.robzhuangs.push({ uid: currPlayer.uid, mul: mul, gold: currPlayer.gold });
        // 通知
        this.channelIsPlayer('qz_onOpts', {
            type: 'robzhuang',
            uid: currPlayer.uid,
            seat: currPlayer.seat,
            robmul: mul,
            list: this._cur_players.map(pl => pl.toRobzhuangData())
        });
        // 检查是否全部都选择了 那么直接进行下一阶段
        if (this.robzhuangs.length === this._cur_players.length) {
            this.readybet();
        }
    }

    /**准备下注   设置庄 - 下注 */
    readybet() {
        this.status = 'READYBET';
        this.statusTime = Date.now();
        clearTimeout(this.robzhuangTimeout);
        /**不抢 不操作 robmul都是1  放入数组 ，前端展示用 */
        for (const pl of this._cur_players) {
            if (pl.robmul == 1 && !this.robzhuangs.find(c => c.uid == pl.uid)) {
                this.robzhuangs.push({ uid: pl.uid, mul: 0, gold: pl.gold });
            }
        }

        this.robzhuangs = this.robzhuangs.sort((a, b) => b.mul - a.mul);

        let zhuang_player = this._cur_players[0];
        if (this.robzhuangs.length > 0) {
            let ran = utils.random(1, 100);
            let max_mul = this.robzhuangs[0].mul;
            let robzhuangs = this.robzhuangs.filter(c => c.mul == max_mul);
            robzhuangs.sort((a, b) => b.gold - a.gold);
            if (ran <= 75) {
                zhuang_player = this._cur_players.find(pl => pl && pl.uid == robzhuangs[0].uid);
            } else {
                robzhuangs.sort(() => 0.5 - Math.random());
                zhuang_player = this._cur_players.find(pl => pl && pl.uid == robzhuangs[0].uid);
            }
            // if (robzhuangs.find(c => c.uid == this.max_uid) && this.controlLogic.isControl) {
            //     zhuang_player = this._cur_players.find(pl => pl && pl.uid == this.max_uid);
            // }
        } else {
            /**如果没有人抢庄 则最有钱的当庄 */
            this._cur_players.sort((pl1, pl2) => { return pl2.gold - pl1.gold });
            zhuang_player = this._cur_players[0];
        }

        this.zhuangInfo = { uid: zhuang_player.uid, mul: zhuang_player.robmul, seat: zhuang_player.seat };
        // 根据是否要随机庄 改变时间
        this.tempReadybetTime = STATUS.READYBET + (this.robzhuangs.length === 1 ? 500 : 2500);
        let opts: qznnConst.Iqz_onReadybet = {
            stateInfo: this.toStatus(),
            robzhuangs: this.robzhuangs.map(m => m),
            zhuangInfo: this.zhuangInfo,
            players: this._cur_players.map(pl => pl.toRobzhuangData())
        }
        this.channelIsPlayer('qz_onReadybet', opts);

        // 延迟后 查看手牌
        this.readybetTimeout = setTimeout(async () => {
            this.defaultBet();
            await this.handler_look();
        }, this.tempReadybetTime);
    }

    /**玩家默认下注 */
    defaultBet() {
        let players = this.players.filter(pl => pl && pl.status == 'GAME' && pl.isBet == 0 && pl.uid !== this.zhuangInfo.uid);
        players.forEach(async (pl) => {
            await this.betOpt(pl, qznnConst.xj_bet_arr[0]);
        });
    }

    /**下注操作 */
    async betOpt(playerInfo: qznnPlayer, betNum: number) {
        playerInfo.betNum = betNum;
        playerInfo.isBet = betNum;
        // 检查是否全部都选择了 那么直接进行下一阶段
        this.channelIsPlayer('qz_onOpts', {
            type: 'bet',
            uid: playerInfo.uid,
            seat: playerInfo.seat,
            betNum: betNum,
            lowBet: this.lowBet
        });

        if (this._cur_players.every(m => m.betNum !== 0 || m.uid === this.zhuangInfo.uid)) {
            await this.handler_look();
        }
    }

    /**查看手牌 */
    async handler_look() {
        //已经进入看牌阶段了
        if (this.isLook) return;

        clearTimeout(this.readybetTimeout);

        // 这时候进行兜底限制调控
        this.controlLogic.limitControl();

        //是否已经看牌
        this.isLook = true;

        this.Logger.debug('抢庄牛牛开始看牌', this.roomId);
        this.status = 'LOOK';
        this.statusTime = Date.now();
        // 调整下注倍数 没有下注的默认为最低下注
        this._cur_players.forEach(pl => (pl.uid !== this.zhuangInfo.uid && pl.betNum == 0) && (pl.betNum = this.lowBet));

        // 通知
        const opts: qznnConst.Iqz_onLook = {
            stateInfo: this.toStatus(),
            zhuangInfo: this.zhuangInfo,
            players: this._cur_players.map(pl => pl.toHoldsInfo())
        }
        this.channelIsPlayer('qz_onLook', opts);
        /**庄家下一家开始一次亮牌 */
        let idx = this.zhuangInfo.seat;
        this.lookTimeout = setInterval(() => {
            let pl = this.players[this.previousIdx(idx - 1)];
            pl && this.liangpaiOpt(pl);
            idx--;
        }, 2000);
    }

    previousIdx(idx: number) {
        let len = this.players.length;
        let next = idx;
        let Cycles = 0;
        do {
            (next < 0) && (next = len - 1);
            let pl = this.players[next];
            if (pl && pl.status == 'GAME' && !pl.isLiangpai) {
                break;
            }
            next--;
            Cycles++;
            if (Cycles > len) {
                break;
            }
        } while (true);
        return next;
    }

    /**亮牌操作 */
    liangpaiOpt(playerInfo: qznnPlayer) {
        playerInfo.isLiangpai = true;
        this.channelIsPlayer('qz_onOpts', {
            type: 'liangpai',
            nickname: playerInfo.nickname,
            uid: playerInfo.uid,
            seat: playerInfo.seat,
            cards: playerInfo.cards,
            cardType: playerInfo.cardType
        });

        // 是否不是所有人都亮牌了
        if (this._cur_players.every(m => m.isLiangpai)) {
            this.settlement();
        }
    }

    /**结算 */
    async settlement() {
        //已经结算了。不能再结算了
        if (this.isSettlement) return;
        this.isSettlement = true;
        this.endTime = Date.now();
        this.status = 'SETTLEMENT';
        this.statusTime = Date.now();
        clearInterval(this.lookTimeout);

        // 压缩开奖结果
        this.zipResult = buildRecordResult(this.players, this);
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
                    const is_zj_win = qznn_logic.bipai(ply_zj.cards, pl.cards);
                    if (is_zj_win) {
                        let mloseGold = pl.betNum * this.zhuangInfo.mul * this.lowBet * qznn_logic.getDoubleByConfig(ply_zj.cardType.count);
                        // 检查玩家钱包的金币
                        pl.profit = - mloseGold;
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
                    const is_zj_win = qznn_logic.bipai(ply_zj.cards, pl.cards);
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
                    const is_zj_win = qznn_logic.bipai(ply_zj.cards, pl.cards);
                    if (!is_zj_win) {
                        pl.profit = pl.betNum * this.zhuangInfo.mul * this.lowBet * qznn_logic.getDoubleByConfig(pl.cardType.count);
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
                    const is_zj_win = qznn_logic.bipai(ply_zj.cards, pl.cards);
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
            const opts: qznnConst.Iqz_onSettlement = {
                stateInfo: this.toStatus(),
                zhuangInfo: this.zhuangInfo,
                players: this._cur_players.map(m => m.toResult(this.lowBet)),
            };
            this.channelIsPlayer('qz_onSettlement', opts);
            //一把结束后延迟进入准备阶段
            this.Initialization();
        } catch (error) {
            console.warn(`...`);
        }
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
            players: this.players.map(pl => pl && pl.strip(this)),
            status: this.status
        };
    }

    /**获取自动开始时间 */
    getAutoStartTime() {
        return this.autoStartTime === 0 ? 0 : (this.autoStartTime - (Date.now() - this.createTime));
    }

    /**踢掉离线玩家 */
    battle_kickNoOnline() {
        const offLinePlayers: qznnPlayer[] = [];
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

    /**按牌型大小 降序 */
    sortResult(cards: number[][]) {
        cards.sort((a, b) => {
            return qznn_logic.bipai(b, a) ? 1 : -1;
        });
    }
    /**
     * 庄是否真人玩家
     */
    bankerIsRealMan() {
        const player = this.getPlayer(this.zhuangInfo.uid);
        return player.isRobot === 0;
    }

    /**
     * 所有游戏玩家是否相同类型
     */
    isSameGamePlayers() {
        return this._cur_players.every(p => p.isRobot === this._cur_players[0].isRobot);
    }

    /**
     * 获取7副牌
     */
    getCards() {
        // 洗牌
        this.pais = qznn_logic.shuffle();

        let cards: number[][] = [];

        for (let i = 0; i < 7; i++) {
            let finallyCard = this.pais.splice(0, 5);
            cards.push(finallyCard);
        }

        return cards;
    }

    /**
     * 运行场控
     */
    async runSceneControl(sceneControlState: ControlState, isPlatformControl) {
        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        this._cur_players.forEach(p => p.setControlType(type));

        let cards = this.getCards();

        // 对牌进行逆序排序
        this.sortResult(cards);



        let gamePlayers = this._cur_players;

        // 赢的玩家
        let possibleWinPlayers: qznnPlayer[];
        // 输的玩家
        let lossPlayers: qznnPlayer[];


        // 如果玩家赢
        if (sceneControlState === ControlState.PLAYER_WIN) {
            possibleWinPlayers = gamePlayers.filter(p => p.isRobot === RoleEnum.REAL_PLAYER);
            lossPlayers = gamePlayers.filter(p => p.isRobot === RoleEnum.ROBOT);
        } else {
            possibleWinPlayers = gamePlayers.filter(p => p.isRobot === RoleEnum.ROBOT);
            lossPlayers = gamePlayers.filter(p => p.isRobot === RoleEnum.REAL_PLAYER);
        }

        if (sceneControlState === ControlState.SYSTEM_WIN && lossPlayers.length === 1) {
            for (let i = 0; i < 100; i++) {
                const result = qznn_logic.getKillPlayerCards(cards, gamePlayers.length);

                if (result) {
                    const player = this.getPlayer(lossPlayers[0].uid);
                    this.setPlayerCards(player, result);
                    gamePlayers = gamePlayers.filter(gamePlayer => gamePlayer.uid !== player.uid);

                    cards = cards.slice(0, possibleWinPlayers.length);

                    // 给胜利玩家类型发大牌
                    possibleWinPlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                        this.setPlayerCards(p, cards.shift());
                    });
                    break;
                }

                cards = this.getCards();
                this.sortResult(cards);
            }
        } else {
            // 取前面几幅
            cards = cards.slice(0, this._cur_players.length);

            // 给胜利玩家类型发大牌
            possibleWinPlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                this.setPlayerCards(p, cards.shift());
            });

            // 给失败玩家随机发小牌
            lossPlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                cards.sort((a, b) => Math.random() - 0.5);

                this.setPlayerCards(p, cards.pop());
            });
        }
    }

    /**
     * 随机发牌
     */
    randomDeal() {
        let cards = this.getCards();
        /**做牌型测试代码 */
        // do {
        //     let ret = cards.some(c => qznn_logic.getCardType(c).count == qznn_logic.CardsType.niuniu_14);
        //     if (ret) break;
        //     cards = this.getCards();
        // } while (true);
        this._cur_players.sort((a, b) => Math.random() - 0.5)
            .forEach(p => {
                this.setPlayerCards(p, cards.shift())
            });
    }

    /**
     * 设置玩家的牌
     * @param player 被发牌的玩家
     * @param cards 牌
     */
    setPlayerCards(player: qznnPlayer, cards: number[]) {
        const cardType = qznn_logic.getCardType(cards);
        player.setCards_2(cards, cardType);
    }


    /**
     * 个控发牌
     * @param positivePlayers 正调控玩家 在这里的玩家赢得概率高
     * @param negativePlayers 负调控玩家 在这里的玩家赢得概率高
     */
    controlPersonalDeal(positivePlayers: PersonalControlPlayer[], negativePlayers: PersonalControlPlayer[]): void {
        let allResult = this.getCards();

        positivePlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));
        negativePlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));

        // 对牌进行逆序排序
        this.sortResult(allResult);
        let gamePlayers = this._cur_players;

        // 如果玩家在正调控里
        if (positivePlayers.length) {
            positivePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                const player = this.getPlayer(p.uid);
                this.setPlayerCards(player, allResult.shift());
                gamePlayers = gamePlayers.filter(gamePlayer => gamePlayer.uid !== p.uid);
            })
        } else {
            // 如果杀给玩家发一副前4张牌有牛的牌
            const len = gamePlayers.length;

            // 万一调控玩家有两人 用以前逻辑 如果做了租户隔离 玩家只有一人走以下逻辑
            if (negativePlayers.length > 1) {
                negativePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                    const player = this.getPlayer(p.uid);
                    this.setPlayerCards(player, allResult.pop());
                    gamePlayers = gamePlayers.filter(gamePlayer => gamePlayer.uid !== p.uid);
                })
            } else {
                for (let i = 0; i < 100; i++) {
                    const result = qznn_logic.getKillPlayerCards(allResult, gamePlayers.length);

                    if (result) {
                        const player = this.getPlayer(negativePlayers[0].uid);
                        this.setPlayerCards(player, result);
                        gamePlayers = gamePlayers.filter(gamePlayer => gamePlayer.uid !== player.uid);
                        break;
                    }

                    allResult = this.getCards();
                    this.sortResult(allResult);
                }
            }
        }
        // 剩余的玩家随机发牌
        gamePlayers.sort((a, b) => Math.random() - 0.5).forEach(player => this.setPlayerCards(player, allResult.shift()));
    }
}
