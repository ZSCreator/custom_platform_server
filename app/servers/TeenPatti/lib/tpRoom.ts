'use strict';

import { pinus } from 'pinus';
import * as TeenPatti_logic from './TeenPatti_logic';

import tpPlayer from './tpPlayer';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import { Irecord_history } from './TeenPattiConst';
import { getLogger } from "pinus-logger";
import ControlImpl from "./ControlImpl";
import { buildRecordResult } from "./util/recordUtil";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import MessageService = require('../../../services/MessageService');
import utils = require('../../../utils/index');
import TeenPattiConst = require('./TeenPattiConst');
import roomManager, { TpRoomManger } from '../lib/TeenPattiMgr';
import { random } from "../../../utils";

/**等待准备时间 */
const WAIT_TIME = 5000;
/**发话时间 */
const FAHUA_TIME = 15000;
/**看牌重置发话时间 */
const KANPAI_TIME = 8000;


/**
 * 游戏房间
 * @property startTime 回合开始时间
 * @property endTime 回合结束时间
 * @property zipResult 结果压缩
 */
export default class jhRoom extends SystemRoom<tpPlayer> {
    /**进入房间最低金币要求 */
    entryCond: number;
    /**最低押注 */
    lowBet: number;
    /** 明注限额128倍数 */
    multipleLimit: number;
    /**最大回合次数 */
    maxRound: number = 20;
    /**状态 INWAIT.等待 INGAME.游戏中 END.回合结束 */
    status: 'NONE' | 'INWAIT' | 'INGAME' | 'END' = 'NONE';
    /**已经多少轮游戏了 */
    roundTimes: number = 1;
    /**当前盘面总押注 */
    currSumBet: number = 0;
    /**当前下注额度 不翻倍的 */
    betNum: number;
    /**当前房间的随机种子 */
    randomSeed: number;
    /**当前发话的人 */
    curr_doing_seat: number = -1;
    /**记录开始等待时候的时间 */
    lastWaitTime: number = 0;
    /**记录开始发话时候的时间 */
    lastFahuaTime: number = 0;
    /**当前桌面上的筹码列表 */
    tableJettons: { value: number, seat: number, betNum: number, currSumBet: number, beizhu: string }[] = [];
    offLineFahua: {
        curr_doing_seat?: number, canBipai?: boolean,
        canKanpai?: boolean, FAHUA_TIME?: number,
        member_num?: number
    } = {};
    /**一局的历史记录 */
    record_history: Irecord_history;
    /**等一段时间后强行开始发牌 */
    waitTimeout: NodeJS.Timer = null;
    zhuang_seat: number;
    Oper_timeout: NodeJS.Timer = null;
    bipaiTimeout: NodeJS.Timer = null;
    TYPE_PROBABILITY = TeenPattiConst.TYPE_PROBABILITY;
    CONTROL_TYPE_PROBABILITY = TeenPattiConst.CONTROL_TYPE_PROBABILITY;
    players: tpPlayer[] = new Array(5).fill(null);// 玩家列表;
    gamePlayers: tpPlayer[] = [];
    /**游戏牌局 推出不删除得玩家列表 */
    _players: tpPlayer[] = [];
    controlLogic: ControlImpl;
    backendServerId: string;

    startTime: number;
    endTime: number;
    zipResult: string;
    logger = getLogger('server_out', __filename);
    bipai_arr: { apply: number, other: number } = { apply: null, other: null };//比牌数组
    max_uid: string;
    constructor(opts) {
        super(opts)
        this.backendServerId = pinus.app.getServerId();
        this.entryCond = opts.entryCond || 0; // 进入条件
        this.lowBet = opts.lowBet || 100;// 底注
        this.multipleLimit = opts.multipleLimit || 128;
        this.betNum = this.lowBet;// 当前下注额度
        this.controlLogic = new ControlImpl({ room: this });
        this.Initialization();
    }
    close() {
        this.sendRoomCloseMessage();
        this.players = [];
    }
    Initialization() {
        //踢掉离线玩家
        this.battle_kickNoOnline();
        this.curr_doing_seat = -1;// 当前发话的人
        this.roundTimes = 1;// 已经多少轮游戏了
        this.currSumBet = 0;// 当前盘面总押注
        this.betNum = this.lowBet;// 当前下注额度
        this.lastFahuaTime = 0;
        this.tableJettons = [];
        this.record_history = { info: [], oper: [] };
        this.gamePlayers = [];

        this.status = 'INWAIT';// 等待玩家准备

        this.offLineFahua.canBipai = false;
        this.offLineFahua.canKanpai = false;
        this.updateRoundId();
    }

    // 添加玩家
    addPlayerInRoom(dbplayer) {
        let playerInfo = this.getPlayer(dbplayer.uid);
        if (playerInfo) {
            playerInfo.sid = dbplayer.sid;
            this.offLineRecover(playerInfo);
            return true;
        }
        if (this.isFull()) return false;
        const idxs: number[] = [];
        this.players.forEach((m, i) => !m && idxs.push(i));//空位置压入数组
        // 数组中随机一个位置
        const i = idxs[utils.random(0, idxs.length - 1)];
        this.players[i] = new tpPlayer(i, dbplayer);
        this._players = this.players.slice();
        // 添加到消息通道
        this.addMessage(dbplayer);
        return true;
    }

    /**
     * 有玩家离开
     * @param playerInfo 
     * @param isOffLine true离线
     */
    leave(playerInfo: tpPlayer, isOffLine: boolean) {
        this.kickOutMessage(playerInfo.uid);
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        this.players[playerInfo.seat] = null;
        if (this.status == "INWAIT") {
            this._players = this.players.slice();
            this.channelIsPlayer('TeenPatti_onExit', {
                kickPlayers: [playerInfo.kickStrip()],
            });
        }
        roomManager.removePlayerSeat(playerInfo.uid);
    }

    // 获取等待状态的时间
    getWaitTime() {
        if (this.status == 'INWAIT')
            return Math.max(WAIT_TIME - (Date.now() - this.lastWaitTime), 0);
        if (this.status == 'INGAME') {
            return Math.max(FAHUA_TIME - (Date.now() - this.lastFahuaTime), 0);
        }
        return 0;
    }

    // 添加筹码
    addSumBet(currPlayer: tpPlayer, num: number, beizhu: string) {
        this.currSumBet += num;
        // 记录筹码
        this.tableJettons.push({ value: num, seat: currPlayer.seat, beizhu, betNum: this.betNum, currSumBet: this.currSumBet });
    }

    // 等待玩家准备
    wait(currPlayer?: tpPlayer) {
        if (this.status != 'INWAIT') return;

        // 如果只剩一个人的时候或者没有人了 就直接关闭房间
        if (this.players.filter(pl => pl).length <= 1) {
            this.channelIsPlayer('TeenPatti_onWait', { waitTime: 0 });
            return;
        }
        // 通知 所有人开始准备
        if (Date.now() - this.lastWaitTime < WAIT_TIME) {//5s内就不重复通知玩家
            const member = currPlayer && this.channel.getMember(currPlayer.uid);
            if (member) {
                let waitTime = Math.max(WAIT_TIME - (Date.now() - this.lastWaitTime), 0);
                MessageService.pushMessageByUids('TeenPatti_onWait', { waitTime }, member);
            }
            return;
        }
        this.channelIsPlayer('TeenPatti_onWait', { waitTime: WAIT_TIME });

        this.lastWaitTime = Date.now(); // 这个记录只用于前段请求的时候用 毫秒
        // 等一段时间后强行开始发牌
        clearTimeout(this.waitTimeout);
        this.waitTimeout = setTimeout(() => {
            // 人数超过2个就强行开始
            const list = this._players.filter(pl => pl);
            if (list.length >= 2) {
                this.handler_start(list);
            } else {// 否则就关闭房间 因为当玩家进来的时候会再次检查
                this.channelIsPlayer('TeenPatti_onWait', { waitTime: 0 });// 通知还在的人不要准备了 等待其他人来
            }
        }, WAIT_TIME);
    }
    // 发牌
    async handler_start(list: tpPlayer[]) {
        this.status = 'INGAME';
        this.gamePlayers = list;
        this.gamePlayers.forEach(pl => pl.status = 'GAME');

        this.startTime = Date.now();
        // 给每个人发牌 乱序
        list.sort(() => 0.5 - Math.random());

        // 执行调控逻辑
        await this.controlLogic.runControl(list);

        // 构造记录 必须把整个玩家列表发送过去
        this.zipResult = buildRecordResult(this._players);

        for (const pl of list) {
            this.addSumBet(pl, this.lowBet, "deal");//temp.value 下注金额
        }
        // 设置随机数种子
        this.randomSeed = Date.now();

        this.zhuang_seat = this._players.findIndex(m => m && m.status === 'GAME');
        this.curr_doing_seat = this.zhuang_seat;//引入自动判断 发话id是否合理

        this.channelIsPlayer('TeenPatti_onDeal', {
            currSumBet: this.currSumBet,
            randomSeed: this.randomSeed,
            players: this.gamePlayers.map(pl => pl.strip()),
            canBipai: false,
            zhuang_seat: this.zhuang_seat
        });

        // 上次赢得玩家进行发话 延迟前端的发牌动作
        setTimeout(() => {
            this.set_next_doing_seat(this.nextFahuaIdx());
        }, this.gamePlayers.length * 500 + 200);
        return Promise.resolve();
    }

    /**发话 */
    protected set_next_doing_seat(doing: number) {
        const playerInfo = this._players[doing];
        playerInfo.state = "PS_OPER";
        // 记录发话时候的时间
        this.lastFahuaTime = Date.now();
        //记录说话数据
        this.offLineFahua.canBipai = playerInfo.canBipai(this).canBipai;
        this.offLineFahua.canKanpai = true;
        this.offLineFahua.FAHUA_TIME = FAHUA_TIME;
        this.offLineFahua.member_num = this._players.filter(pl => pl && pl.status === 'GAME').length;
        /**记录轮数 每轮bet重置 */
        if (this.zhuang_seat == doing) {
            this.roundTimes++;
            if (this.roundTimes == 5) {
                this.gamePlayers.forEach(pl => pl && pl.holdStatus == 0 && pl.handler_kanpai(this));
            }
        }
        // 通知
        for (const pl of this.gamePlayers) {
            const member = pl && this.channel.getMember(pl.uid);
            const opts = this.stripSpeak(playerInfo);
            if (pl.isRobot == RoleEnum.ROBOT) {
                opts['max_uid'] = this.max_uid;
                opts['isControl'] = this.controlLogic.isControl;
            }
            member && MessageService.pushMessageByUids('TeenPatti_onFahua', opts, member);
        }
        // 记录当前发话的人
        this.curr_doing_seat = doing;
        this.record_history.oper.push({ uid: playerInfo.uid, oper_type: "oper_s", update_time: utils.cDate(), msg: "" });
        // 时间到了 视为弃牌 下一位继续发话
        this.handler_pass();
    }

    /**
     * 重置发话时间 如果时间到了 就直接跳到下一个发话
     */
    handler_pass() {
        clearTimeout(this.Oper_timeout);
        let ms = FAHUA_TIME;
        this.Oper_timeout = setTimeout(() => {
            let playerInfo = this._players[this.curr_doing_seat];
            // const member = playerInfo && this.channel.getMember(playerInfo.uid);
            // member && MessageService.pushMessageByUids('TeenPatti_test', {}, member);
            // for (const c of this.record_history.oper) {
            //     console.warn(`tp|aoto|${c.uid}|${c.oper_type}|${c.update_time}`);
            // }
            // console.warn(`tp|aoto|${utils.cDate()}|${utils.cDate(this.lastFahuaTime)}`);
            playerInfo.handler_fold(this);
        }, ms);
        return ms;
    }

    /**
     * 包装说话数据
     * @param playerInfo
     */
    stripSpeak(playerInfo: tpPlayer) {
        let is_filling = true;
        if (this.betNum == this.multipleLimit * this.lowBet / 2) {
            is_filling = false;
        }
        const opts = {
            fahuaIdx: playerInfo.seat,
            totalBet: playerInfo.totalBet,
            betNum: this.betNum,// 下注额度
            roundTimes: this.roundTimes,// 当前轮数
            canBipai: this.offLineFahua.canBipai,// 是否可以比牌 只要加过注 才可以比牌
            canKanpai: this.offLineFahua.canKanpai,// 是否可以看牌
            fahuaTime: FAHUA_TIME - (Date.now() - this.lastFahuaTime),
            member_num: this.offLineFahua.member_num,
            zhuang_seat: this.zhuang_seat,
            is_filling
        }
        return opts;
    }

    /**
     * 比牌
     * @param Launch_pl
     * @param accept_pl
     * @param num 
     */
    handler_bipai(Launch_pl: tpPlayer, accept_pl: tpPlayer, num: number) {
        // 先关闭定时
        clearTimeout(this.Oper_timeout);
        clearTimeout(this.bipaiTimeout);
        Launch_pl.totalBet += num;
        Launch_pl.gold -= num;
        Launch_pl.IsMingZhu = true;
        this.addSumBet(Launch_pl, num, "bipai");
        this.record_history.oper.push({ uid: Launch_pl.uid, oper_type: "bipai", update_time: utils.cDate(), msg: { num, accept_pl: accept_pl.uid } });
        // 互相加入到对方可亮牌列表中
        this.joineachotherLiangpais([Launch_pl, accept_pl]);
        // 比牌
        let ret = TeenPatti_logic.bipaiSole(Launch_pl, accept_pl);
        let winner = Launch_pl;
        let failer = accept_pl;
        if (ret == 0) {
            winner = Launch_pl;
            failer = accept_pl;
        } else {
            winner = accept_pl;
            failer = Launch_pl;
        }
        // 先将失败者 弃牌
        failer.status = 'WAIT';
        failer.holdStatus = 3;// 标记比牌失败
        // 如果是庄要让给上一个玩家
        (this.zhuang_seat == failer.seat) && this.resetZhuang();
        //添加实况记录
        failer.settlement(this);
        // 通知比牌结果
        this.channelIsPlayer('TeenPatti_onOpts', {
            type: 'bipai',
            seat: Launch_pl.seat,
            gold: Launch_pl.gold,
            betNum: num,
            pl_totalBet: Launch_pl.totalBet,
            room_sumBet: this.currSumBet,
            iswin: winner.uid === Launch_pl.uid,// 是否胜利
            other: accept_pl.seat,// 另外一个人
        });
        // 延迟动画时间 然后继续
        this.bipaiTimeout = setTimeout(() => {
            this.checkHasNextPlayer(Launch_pl.seat);
        }, 3500);
    }
    handler_applyBipai(Launch_pl: tpPlayer, accept_pl: tpPlayer, num: number) {
        // 先关闭定时
        clearTimeout(this.Oper_timeout);
        clearTimeout(this.bipaiTimeout);
        Launch_pl.totalBet += num;
        Launch_pl.gold -= num;
        Launch_pl.IsMingZhu = true;
        this.addSumBet(Launch_pl, num, "applyBipai");
        this.record_history.oper.push({ uid: Launch_pl.uid, oper_type: "applyBipai", update_time: utils.cDate(), msg: { num, accept_pl: accept_pl.uid } });
        this.channelIsPlayer('TeenPatti_onOpts', {
            type: 'applyBipai',
            seat: Launch_pl.seat,
            gold: Launch_pl.gold,
            betNum: num,
            pl_totalBet: Launch_pl.totalBet,
            room_sumBet: this.currSumBet,
            other: accept_pl.seat,// 另外一个人
            applyBipai_TIME: 10 * 1000
        });
        // 延迟动画时间 然后继续
        this.bipaiTimeout = setTimeout(() => {
            this.handler_rejectBiPai();
        }, 10 * 1000);
    }

    /**决绝比牌 */
    handler_rejectBiPai() {
        clearTimeout(this.bipaiTimeout);
        let accept_pl = this._players[this.bipai_arr.other];
        const num = accept_pl.holdStatus === 1 ? this.betNum * 2 : this.betNum;
        // accept_pl.totalBet += num;
        // accept_pl.gold -= num;
        this.record_history.oper.push({ uid: accept_pl.uid, oper_type: "rejectBiPai", update_time: utils.cDate(), msg: 0 });
        // this.addSumBet(accept_pl, 0, "rejectBiPai");
        this.channelIsPlayer('TeenPatti_onOpts', {
            type: 'rejectBiPai',
            seat: this.bipai_arr.apply,
            gold: accept_pl.gold,
            other: this.bipai_arr.other,// 另外一个人
            pl_totalBet: accept_pl.totalBet,
            room_sumBet: this.currSumBet,
            betNum: 0,
        });
        this.bipai_arr = { apply: null, other: null };
        // 下一个发话
        this.checkHasNextPlayer(this.nextFahuaIdx());
    }

    /**
     * 结算 本回合
     * @param players
     * @param auto 通比
     */
    async handler_complete(players: tpPlayer[], auto = false) {
        this.status = 'END';
        clearTimeout(this.Oper_timeout);
        clearTimeout(this.waitTimeout);
        clearTimeout(this.bipaiTimeout);
        if (auto) {
            /**如果一个游戏中的玩家钱不够说话  通比 */
            const gamePlayers = this._players.filter(pl => pl && pl.status == 'GAME');
            this.joineachotherLiangpais(gamePlayers);
            // 一样的话比 大小
            players = TeenPatti_logic.getMaxPls(gamePlayers);
            //比牌失败的玩家 这里结算一次
            const lose_pls = gamePlayers.filter(pl => !players.includes(pl));
            for (const pl of lose_pls) {
                await pl.settlement(this);
            }
        }

        const tmp_winNum = this.currSumBet / players.length;
        for (let pl of players) {
            if (!pl) continue;
            pl.profit = tmp_winNum;
            //添加实况记录
            await pl.settlement(this);
            //走马灯
            if (Math.floor((tmp_winNum - pl.totalBet) / this.lowBet) > 500) {
                MessageService.sendBigWinNotice(this.nid, pl.nickname, tmp_winNum, pl.isRobot, pl.headurl);
            }
        }
        await utils.delay(800);
        let opts = {
            auto,
            winner: players.map(c => c.uid),
            winnerSeat: players.map(c => c.seat),
            list: this._players.map(m => !!m && m.wrapSettlement())
        }
        this.channelIsPlayer('TeenPatti_onSettlement', opts);
        //发牌的时候记录牌局信息
        this.record_history.info = this._players.filter(pl => pl).map(pl => pl.Record_strip());
        for (const pl of this._players) {
            pl && await pl.only_update_game(this);
        }
        this.Initialization();
    }

    /**
     * 检查 是不是还剩最后一个人了 就直接获胜
     * @param idx
     */
    checkHasNextPlayer(doing: number) {
        if (this.status == "END") return;
        if (this.currSumBet >= 1024 * this.lowBet) {
            return this.handler_complete(null, true);
        }
        const list = this._players.filter(m => m && m.status == 'GAME');
        if (list.length <= 1) {
            this.handler_complete([list[0]]);// 结算
        } else {// 否则如果是当前发话玩家点击弃牌 那么就要让下一个发话
            this.set_next_doing_seat(this.nextFahuaIdx());
        }
    }

    /**上一个玩家 找不到玩家返回-1 逆时针 申请比牌用 */
    previousFahuaIdx() {
        let next = this.curr_doing_seat - 1;
        let len = this._players.length;
        do {
            next = next < 0 ? len : next;
            if (next == this.curr_doing_seat) {
                return -1;
            }
            let pl = this._players[next];
            if (pl && pl.status == 'GAME' && (pl.IsMingZhu || this.players.filter(c => c && c.status == "GAME").length == 2)) {
                return next;
            }
            next--;
        } while (true);
    }

    /**
     * 下一个玩家 找不到玩家返回-1
     */
    nextFahuaIdx() {
        let next = this.curr_doing_seat + 1;
        let len = this._players.length;
        do {
            next = next >= len ? 0 : next;
            if (next == this.curr_doing_seat) {
                return -1;
            }
            let player = this._players[next];
            if (player && player.status == 'GAME') {
                return next;
            }
            next++;
        } while (true);
    }

    /**
     * 重置庄 让给上一个玩家 找不到就返回当前发话set
     */
    resetZhuang() {
        let next = this.zhuang_seat - 1;
        let len = this._players.length;
        do {
            next = next <= -1 ? len : next;
            if (next == this.zhuang_seat) {
                return -1;
            }
            let player = this._players[next];
            if (player && player.status == 'GAME') {
                this.zhuang_seat = next;
                return next;
            }
            next--;
        } while (true);
    }



    /**
     * 互相加入到对方可亮牌列表中
     * @param players
     */
    joineachotherLiangpais(players: tpPlayer[]) {
        if (players.length <= 1)
            return;
        for (let i = players.length - 1; i >= 0; i--) {
            const player = players[i]
            players.forEach(m => {
                if (!!m && m.uid !== player.uid && !player.canliangs.includes(m.uid)) {
                    player.canliangs.push(m.uid);
                }
            });
        }
    }

    strip() {
        return {
            nid: this.nid,
            sceneId: this.sceneId,
            roomId: this.roomId,
            players: this._players.map(m => m && m.strip()),
            status: this.status,
            roundTimes: this.roundTimes,
            curr_doing_seat: this.curr_doing_seat,
            currSumBet: this.currSumBet,
            randomSeed: this.randomSeed,
            tableJettons: this.tableJettons,
            canBipai: this.offLineFahua.canBipai,// 是否可以比牌 只要加过注 才可以比牌
            canKanpai: this.offLineFahua.canKanpai,// 是否可以看牌
            zhuang_seat: this.zhuang_seat
        };
    }

    /**踢掉离线玩家 */
    battle_kickNoOnline() {
        const offLinePlayers: tpPlayer[] = [];
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
     * 生成几副牌
     * @param len
     * @param control 使用概率模型
     */
    generateCards(len: number, control: boolean): any[] {
        // 生成一副顺序牌
        const poker = TeenPatti_logic.randomPoker();
        let cards: any[] = [];
        // 使用的概率模型
        // const PROBABILITY_MODEL = control ? this.CONTROL_TYPE_PROBABILITY : this.TYPE_PROBABILITY;
        // 转换成键值对数组再顺序排序
        // const PROBABILITY_LIST: any = Object.entries(PROBABILITY_MODEL)
        //     .sort((a: any, b: any) => Number(a[0]) - Number(a[0]));
        // 最后的牌型数组


        for (let i = 0; i < 10; i++) {
            poker.sort((x, y) => Math.random() - 0.5);
            const threeCards = [];

            for (let j = 0; j < 3; j++) {
                const randomNum = random(0, poker.length - 1);
                threeCards.push(poker.splice(randomNum, 1)[0])
            }
            cards.push(threeCards);
        }

        // 降序排序
        TeenPatti_logic.sortResult(cards);
        cards = cards.slice(0, len);
        cards.sort((a, b) => Math.random() - 0.5);

        return cards;
        // for (let i = 0; i < len; i++) {
        //     let num: number = 0, randomValue: number = utils.random(0, 10001);
        //     for (let [type, value] of PROBABILITY_LIST) {
        //         num += value;
        //         if (randomValue <= num) {
        //             // this.logger.warn(typeof type, value, type, randomValue, num);
        //             cards.push(jhRoom.getTypeCards(poker, type));
        //             break;
        //         }
        //     }
        // }
        // return cards;
    }

    /**
     * 给玩家设置牌
     * @param playerInfo
     * @param cards
     * @param golds
     */
    setPlayerCard(playerInfo: tpPlayer, cards) {
        const cardType = TeenPatti_logic.getCardType(cards);
        playerInfo.initGame(this, cards, cardType, this.lowBet);
    }


    /**
     * 获取特定的牌型
     * @param poker
     * @param type
     */
    static getTypeCards(poker: any, type: string): any[] {
        switch (type) {
            case '5': return TeenPatti_logic.getBZ(poker);
            case '4': return TeenPatti_logic.getTHS(poker);
            case '3': return TeenPatti_logic.getTH(poker);
            case '2': return TeenPatti_logic.getSZ(poker);
            case '1': return TeenPatti_logic.getDZ(poker);
            case '0': return TeenPatti_logic.getS(poker);
            default:
                throw new Error(`非法牌型 ${type}`);
        }
    }

    /**
     * 随机发牌
     * @param gamePlayers 参与游戏的玩家
     * @param golds
     */
    randomDeal(list: tpPlayer[]): void {
        const cards = this.generateCards(list.length, false);
        let indexSet: Set<number> = new Set();
        while (indexSet.size !== list.length) {
            indexSet.add(TeenPatti_logic.random(0, list.length));
        }
        // 随机发牌
        [...indexSet].forEach(index => this.setPlayerCard(list[index], cards.shift()));

        this.max_uid = TeenPatti_logic.getMaxPls(this.gamePlayers)[0].uid;
    }

    /**
     * 调控发牌
     * @param params
     */
    /**
     * 调控发牌
     * @param gamePlayers 参与牌局的玩家
     * @param golds
     * @param positivePlayers 正调控玩家 让他赢的
     * @param negativePlayers 负调控的玩家  让他输
     */
    personalControlDeal(gamePlayers: tpPlayer[], positivePlayers: any[], negativePlayers: any[]): void {
        const cards = this.generateCards(gamePlayers.length, true);


        positivePlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));
        negativePlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));

        // 逆序排序
        TeenPatti_logic.sortResult(cards);

        // 过滤出机器人
        const robotPlayers = gamePlayers.filter(p => p.isRobot === 2);

        // 如果这个有正调控的玩家 则正面调控的玩家获得最大的牌
        let luckPlayer;
        if (positivePlayers.length) {
            const p = positivePlayers[TeenPatti_logic.random(0, positivePlayers.length)];
            luckPlayer = gamePlayers.find(pl => pl.uid === p.uid);
        } else {
            luckPlayer = robotPlayers[TeenPatti_logic.random(0, robotPlayers.length)];
        }

        // 给调控玩家或机器人发最大的牌
        this.setPlayerCard(luckPlayer, cards.shift());

        // 过滤掉该玩家
        gamePlayers = gamePlayers.filter(player => player.uid !== luckPlayer.uid);

        // 如果有负调控的玩家
        if (negativePlayers.length) {
            if (negativePlayers.length !== 1) {
                // 打乱随机发牌
                negativePlayers.sort((a, b) => Math.random() - 0.5);
                negativePlayers.forEach(p => {
                    const pl = gamePlayers.find(player => player.uid === p.uid);
                    const card = cards.shift();
                    this.setPlayerCard(pl, card);
                    // 过滤掉该玩家
                    gamePlayers = gamePlayers.filter(player => player.uid !== p.uid);
                });
            } else {
                // 因为现在房间只有可能是单个真人的情况 所以调控不再改为 当进入调控牌局，派发玩家第二大牌40%概率，第三大牌40%概率，第四大牌20%概率
                const randomNum = random(1, 100);
                const player = gamePlayers.find(p => negativePlayers[0].uid === p.uid);
                gamePlayers = gamePlayers.filter(p => player.uid !== p.uid);

                if (randomNum <= 50 || cards.length === 1) {
                    this.setPlayerCard(player, cards.shift());
                } else {
                    this.setPlayerCard(player, cards.splice(1, 1)[0]);
                }
            }

        }

        let indexSet: Set<number> = new Set();
        while (indexSet.size !== gamePlayers.length) {
            indexSet.add(TeenPatti_logic.random(0, gamePlayers.length));
        }
        // 随机发牌
        [...indexSet].forEach(index => this.setPlayerCard(gamePlayers[index], cards.shift()));
        this.max_uid = TeenPatti_logic.getMaxPls(this.gamePlayers)[0].uid;
    }

    /**
     * 场控发牌
     * @param sceneControlState 场控状态
     * @param gamePlayers 参与游戏的玩家
     * @param isPlatformControl
     */
    sceneControlDeal(sceneControlState: ControlState, gamePlayers: tpPlayer[], isPlatformControl: boolean) {
        // 没有则随机发牌
        if (sceneControlState === ControlState.NONE) {
            return this.randomDeal(gamePlayers);
        }

        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        gamePlayers.forEach(p => p.setControlType(type));

        // 获取牌并逆序排序
        let cards = this.generateCards(gamePlayers.length, ControlState.SYSTEM_WIN === sceneControlState);

        // 降序排序
        TeenPatti_logic.sortResult(cards);

        // 如果系统赢则取一个机器人发最大的牌 其他随机发
        // 反之如果玩家赢则取一个玩家发最大的牌 其他随机发
        const winnerType = sceneControlState === ControlState.SYSTEM_WIN ? RoleEnum.ROBOT : RoleEnum.REAL_PLAYER;
        const possibleWinPlayers = gamePlayers.filter(p => p.isRobot === winnerType);
        possibleWinPlayers.sort((a, b) => Math.random() - 0.5);
        const winPlayer = possibleWinPlayers.shift();

        // 发牌
        this.setPlayerCard(winPlayer, cards.shift());

        // 过滤掉那个发牌的玩家
        gamePlayers = gamePlayers.filter(p => p.uid !== winPlayer.uid);
        // 剩余的玩家随机发
        gamePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
            cards.sort((a, b) => Math.random() - 0.5);

            this.setPlayerCard(p, cards.shift());
        });
        this.max_uid = TeenPatti_logic.getMaxPls(this.gamePlayers)[0].uid;
    }
}
