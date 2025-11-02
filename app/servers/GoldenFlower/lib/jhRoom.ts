'use strict';

import { pinus } from 'pinus';
import * as GoldenFlower_logic from './GoldenFlower_logic';
import jhPlayer from './jhPlayer';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import { getLogger } from "pinus-logger";
import ControlImpl from "./ControlImpl";
import { buildRecordResult } from "./util/recordUtil";
import { Irecord_history } from '../lib/GoldenFlower_interface';
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import { random } from "../../../utils";
import MessageService = require('../../../services/MessageService');
import utils = require('../../../utils/index');
import GoldenFlowerConst = require('./GoldenFlowerConst');
import roomManager, { GRoomManger } from '../lib/GoldenFlowerMgr';
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
export default class jhRoom extends SystemRoom<jhPlayer> {
    /**进入房间最低金币要求 */
    entryCond: number;
    /**最低押注 */
    lowBet: number;
    /** 封顶 */
    capBet: number;
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
    /**一局的历史记录 */
    record_history: Irecord_history = { max_uid: "", info: [], oper: [] };
    zhuang_seat: number;
    isRobotData: any;
    Oper_timeout: NodeJS.Timer = null;
    TYPE_PROBABILITY = GoldenFlowerConst.TYPE_PROBABILITY;
    CONTROL_TYPE_PROBABILITY = GoldenFlowerConst.CONTROL_TYPE_PROBABILITY;
    players: jhPlayer[] = new Array(5).fill(null);// 玩家列表;
    gamePlayers: jhPlayer[] = [];
    /**游戏牌局 推出不删除得玩家列表 */
    _players: jhPlayer[] = [];
    controlLogic: ControlImpl;
    backendServerId: string;

    startTime: number;
    endTime: number;
    zipResult: string;
    logger = getLogger('server_out', __filename);
    waitTimer: NodeJS.Timeout = null;
    experience = false;

    /** 默认赢家 */
    max_uid: string = '';

    constructor(opts) {
        super(opts)
        // this.experience = this.sceneId == 0 ? true : false;
        this.backendServerId = pinus.app.getServerId();
        this.entryCond = opts.entryCond || 0; // 进入条件
        this.lowBet = opts.lowBet || 100;// 底注
        this.capBet = opts.capBet || 2000;
        this.betNum = this.lowBet;// 当前下注额度
        this.controlLogic = new ControlImpl({ room: this });
        this.status = 'INWAIT';// 等待玩家准备
        this.updateRoundId();
    }
    close() {
        this.sendRoomCloseMessage();
        //this.players = [];
    }
    async Initialization() {
        //踢掉离线玩家
        this.battle_kickNoOnline();
        await utils.delay(3500);
        this.curr_doing_seat = -1;// 当前发话的人
        this.roundTimes = 1;// 已经多少轮游戏了
        this.currSumBet = 0;// 当前盘面总押注
        // this.betNum = this.lowBet;// 当前下注额度
        this.lastFahuaTime = 0;
        this.tableJettons = [];
        this.record_history = { max_uid: "", info: [], oper: [] };
        this.gamePlayers = [];
        this._players = [];
        this.status = 'INWAIT';// 等待玩家准备
        this.max_uid = '';
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
        this.players[i] = new jhPlayer(this, i, dbplayer);
        this._players = this.players.slice();
        // 添加到消息通道
        this.addMessage(dbplayer);
        this.wait();
        //踢掉离线玩家
        return true;
    }

    /**
    * 
    * @param playerInfo 
    * @param isOffLine true离线
    */
    leave(playerInfo: jhPlayer, isOffLine: boolean) {
        this.kickOutMessage(playerInfo.uid);
        do {
            if (isOffLine) {
                playerInfo.onLine = false;
                return;
            }
            this.players[playerInfo.seat] = null;
            if (this.status == "INWAIT") {
                this.channelIsPlayer('ZJH_onExit', {
                    kickPlayers: [playerInfo.kickStrip()],
                });
                this._players = this.players.slice();
            }
            break;
        } while (0);
        roomManager.removePlayerSeat(playerInfo.uid);
    }

    /**获取等待状态的时间 */
    getWaitTime() {
        if (this.status == 'INWAIT')
            return Math.max(WAIT_TIME - (Date.now() - this.lastWaitTime), 0);
        if (this.status == 'INGAME') {
            return Math.max(FAHUA_TIME - (Date.now() - this.lastFahuaTime), 0);
        }
        return 0;
    }

    // 添加筹码
    addSumBet(currPlayer: jhPlayer, num: number, beizhu: string) {
        this.currSumBet += num;
        // 记录筹码
        this.tableJettons.push({ value: num, seat: currPlayer.seat, beizhu, betNum: this.betNum, currSumBet: this.currSumBet });
    }

    // 等待玩家准备
    wait(playerInfo?: jhPlayer) {
        if (this.status != 'INWAIT') return;
        // 如果只剩一个人的时候或者没有人了 就直接关闭房间
        if (this.players.filter(pl => pl).length <= 1) {
            this.channelIsPlayer('ZJH_onWait', { waitTime: 0 });
            return;
        }
        this.channelIsPlayer('ZJH_onWait', { waitTime: WAIT_TIME });
        this.lastWaitTime = Date.now(); // 这个记录只用于前段请求的时候用 毫秒
        // 等一段时间后强行开始发牌
        clearTimeout(this.waitTimer);
        this.waitTimer = setTimeout(() => {
            // 人数超过2个就强行开始
            const list = this.players.filter(pl => pl);
            if (list.length >= 2) {
                this.handler_start(list);
            } else {// 否则就关闭房间 因为当玩家进来的时候会再次检查
                this.channelIsPlayer('ZJH_onWait', { waitTime: 0 });// 通知还在的人不要准备了 等待其他人来
            }
        }, WAIT_TIME);
    }

    /**发牌 */
    protected async handler_start(list: jhPlayer[]) {
        this.status = 'INGAME';
        this.gamePlayers = list;
        this.gamePlayers.forEach(pl => pl.status = 'GAME');
        this._players = this.players.slice();

        this.startTime = Date.now();

        // 给每个人发牌 乱序
        this.gamePlayers.sort(() => 0.5 - Math.random());

        // 执行调控逻辑
        await this.controlLogic.runControl(this.gamePlayers);

        // for (const pl of this._players) {
        //     if (!pl) continue
        //     this.setPlayerCard(pl, [51, 37, 23]);
        // }
        // 构造记录 必须把整个玩家列表发送过去
        this.zipResult = buildRecordResult(this._players);

        for (const pl of this.gamePlayers) {
            this.addSumBet(pl, this.lowBet, "deal");//temp.value 下注金额
        }

        // 设置随机数种子
        this.randomSeed = Date.now();
        // 通知
        this.channelIsPlayer('ZJH_onDeal', {
            currSumBet: this.currSumBet,
            randomSeed: this.randomSeed,
            players: this.gamePlayers.map(pl => pl.wrapGame()),
            canBipai: false,
        });
        this.zhuang_seat = this._players.findIndex(m => m && m.status == 'GAME');
        this.curr_doing_seat = this.zhuang_seat;//引入自动判断 发话id是否合理
        // 上次赢得玩家进行发话 延迟前端的发牌动作
        await utils.delay(this.gamePlayers.length * 500 + 200);
        this.set_next_doing_seat(this.nextFahuaIdx());
        return Promise.resolve();
    }

    /**发话 */
    protected set_next_doing_seat(doing: number) {
        const playerInfo = this._players[doing];
        this.curr_doing_seat = doing;
        playerInfo.state = "PS_OPER";

        // this.record_history.oper.push({ uid: playerInfo.uid, oper_type: `${this.roundId}|oper_s`, update_time: utils.cDate(), msg: `${playerInfo.seat}|${this.curr_doing_seat}` });
        // 记录发话时候的时间
        this.lastFahuaTime = Date.now();
        // 通知
        for (const pl of this.gamePlayers) {
            const member = pl && this.channel.getMember(pl.uid);
            const opts = this.stripSpeak(pl);
            if (pl.isRobot == RoleEnum.ROBOT) {
                opts['max_uid'] = this.max_uid;
            }
            member && MessageService.pushMessageByUids('ZJH_onFahua', opts, member);
        }
        /**记录轮数 每轮bet重置 */
        if (this.zhuang_seat == doing) {
            this.roundTimes++;
        }
        // 时间到了 视为弃牌 下一位继续发话
        this.handler_pass();
    }

    /**
     * 包装说话数据
     * @param playerInfo
     */
    stripSpeak(playerInfo: jhPlayer) {
        this.isRobotData = playerInfo.isRobot == 2 ? playerInfo.stripRobot() : null;
        let allin = false;
        const num = playerInfo.holdStatus == 1 ? this.betNum * 2 : this.betNum;
        if (playerInfo.gold <= num) {
            allin = true;
        }
        const opts = {
            fahuaIdx: this.curr_doing_seat,
            betNum: this.betNum,// 下注额度
            totalBet: playerInfo.totalBet,
            roundTimes: this.roundTimes,// 当前轮数
            canBipai: this.get_canBipai(),// 是否可以比牌 只要加过注 才可以比牌
            canKanpai: this.get_canKanpai(),
            fahuaTime: FAHUA_TIME - (Date.now() - this.lastFahuaTime),
            member_num: this.gamePlayers.filter(m => m && m.status == 'GAME').length,
            zhuangIdx: this.zhuang_seat,
            allin: allin,
            currSumBet: this.currSumBet,
            isRobotData: playerInfo.isRobot == 2 ? this.isRobotData : null
        }
        return opts;
    }

    /**是否可以比牌 */
    get_canBipai() {
        return this.betNum >= this.lowBet && this.roundTimes >= 2;
    }
    /**是否可以看牌 */
    get_canKanpai() {
        return this.roundTimes >= 2 ? true : false;
    }


    /**
     * 比牌
     * @param Launch_pl
     * @param accept_pl
     * @param num 
     */
    async handler_bipai(Launch_pl: jhPlayer, accept_pl: jhPlayer, num: number) {
        // 先关闭定时
        clearTimeout(this.Oper_timeout);
        Launch_pl.totalBet += num;
        Launch_pl.gold -= num;
        Launch_pl.state = "PS_NONE";
        this.addSumBet(Launch_pl, num, "bipai");
        this.record_history.oper.push({ uid: Launch_pl.uid, oper_type: "bipai", update_time: utils.cDate(), msg: { Launch_pl: Launch_pl.uid, accept_pl: accept_pl.uid, num } });
        // 比牌
        let ret = GoldenFlower_logic.bipaiSole(Launch_pl, accept_pl);
        const winner = ret > 0 ? Launch_pl : accept_pl;
        // 失败者
        const failer = ret > 0 ? accept_pl : Launch_pl;
        // 先将失败者 弃牌
        failer.status = 'WAIT';
        failer.holdStatus = 3;// 标记比牌失败
        // 如果是庄要让给上一个玩家
        (this.zhuang_seat == failer.seat) && this.resetZhuang();
        //添加实况记录
        failer.settlement(this);
        // 通知比牌结果
        this.channelIsPlayer('ZJH_onOpts', {
            type: 'bipai',
            seat: Launch_pl.seat,
            gold: Launch_pl.gold,
            betNum: num,
            totalBet: Launch_pl.totalBet,
            sumBet: this.currSumBet,
            iswin: winner.uid === Launch_pl.uid,// 是否胜利
            other: accept_pl.seat,// 另外一个人
        });
        await utils.delay(3500);
        this.checkHasNextPlayer(Launch_pl.seat);
    }

    /**
     * 结算 本回合
     * @param list
     * @param auto 通比
     */
    protected async handler_complete(list: jhPlayer[], auto = false) {
        this.status = "END";
        clearTimeout(this.Oper_timeout);
        if (auto) {
            const gamePlayers = this._players.filter(pl => pl && pl.status == 'GAME');
            let winner_list = [gamePlayers[0]];
            for (const pl of gamePlayers) {
                if (pl.uid == winner_list[0].uid) continue
                let ret = GoldenFlower_logic.bipaiSole(winner_list[0], pl);
                if (ret == -1) {
                    winner_list = [pl];
                } else if (ret == 0) {
                    winner_list.push(pl);
                }
            }
            for (const pl of gamePlayers) {
                if (!winner_list.some(c => c.uid == pl.uid)) {
                    await pl.settlement(this);
                }
            }
            list = winner_list;
        }
        const tmp_winNum = this.currSumBet / list.length;
        for (let pl of list) {
            if (!pl) continue;
            const practicalWinNum = tmp_winNum;
            pl.profit = practicalWinNum;
            //添加实况记录
            await pl.settlement(this);
            //走马灯
            if (Math.floor((practicalWinNum - pl.totalBet) / this.lowBet) > 500) {
                MessageService.sendBigWinNotice(this.nid, pl.nickname, practicalWinNum, pl.isRobot, pl.headurl);
            }
        }
        await utils.delay(800);
        let opts = {
            auto,
            winner: list.map(c => {
                return {
                    uid: c.uid,
                    seat: c.seat,
                    profit: c.profit
                }
            }),
            list: this.gamePlayers.filter(pl => !!pl).map(m => !!m && m.wrapSettlement())
        }
        this.channelIsPlayer('ZJH_onSettlement', opts);
        this.record_history.info = this.gamePlayers.filter(pl => !!pl).map(pl => pl.Record_strip());
        for (const pl of this.gamePlayers) {
            pl && await pl.only_update_game(this);
        }
        this.Initialization();
    }

    /**
     * 检查 是不是还剩最后一个人了 就直接获胜
     * @param doing
     */
    checkHasNextPlayer(doing: number) {
        if (this.status == "END") return;
        /**如果一个游戏中的玩家钱不够说话  通比 */
        if (this.roundTimes >= this.maxRound) {
            return this.handler_complete(null, true);
        }
        const list = this.gamePlayers.filter(pl => pl && pl.status == 'GAME');
        if (list.length <= 1) {
            this.handler_complete([list[0]]);// 结算
        } else {// 否则如果是当前发话玩家点击弃牌 那么就要让下一个发话
            this.set_next_doing_seat(this.nextFahuaIdx());
        }
    }

    /**
     * 重置发话时间 如果时间到了 就直接跳到下一个发话
     */
    handler_pass() {
        clearTimeout(this.Oper_timeout);
        let fn = () => {
            /**0弃牌 1跟注 2 比牌 3孤注一掷*/
            let oper_type: 0 | 1 | 2 | 3 = 0;
            let playerInfo = this._players[this.curr_doing_seat];
            do {
                if (playerInfo.auto_genzhu) {
                    /**在线 跟注到底 */
                    if (playerInfo.onLine) {
                        oper_type = 1;
                        break;
                    }
                    /**不在线 且 防弃牌 走 防弃牌逻辑 */
                    if (!playerInfo.auto_no_Fold) {
                        oper_type = 1;
                        break;
                    }
                }
                if (playerInfo.auto_no_Fold) {
                    /**1论跟牌 */
                    if (this.roundTimes == 1) {
                        oper_type = 1;
                        break;
                    }
                    /**2-3看牌顺子以上跟牌 */
                    if (this.roundTimes == 2 || this.roundTimes == 3) {
                        if (playerInfo.holdStatus == 1) {
                            if (playerInfo.cardType >= 2) {
                                oper_type = 1;
                                break;
                            }
                        }
                        oper_type = 0;
                        break;
                    }
                    /**4论开始看牌后顺子以上逆时针比牌 */
                    if (playerInfo.holdStatus == 1) {
                        if (playerInfo.cardType >= 2) {
                            oper_type = 2;
                            break;
                        }
                    }
                }
                break;
            } while (0);
            // 如果看牌了 就是两倍额度 然后比牌再两倍
            const num = playerInfo.holdStatus === 1 ? this.betNum * 2 : this.betNum;
            if (playerInfo.gold <= num &&
                (oper_type == 1 || oper_type == 2)) {
                oper_type = 3;
            }
            switch (oper_type) {
                case 0:
                    playerInfo.handler_fold(this);
                    break;
                case 1:
                    let betNum = playerInfo.holdStatus === 1 ? this.betNum * 2 : this.betNum;
                    playerInfo.handler_cingl(this, betNum);
                    break;
                case 2:
                    const list = this.gamePlayers.filter(pl => pl && pl.status == 'GAME' && pl.uid !== playerInfo.uid);
                    if (list.length >= 1) {
                        this.handler_bipai(playerInfo, list[0], num);
                    }
                    break;
                case 3:
                    let ret = playerInfo.handler_Allfighting(this);
                    break;
                default:
                    break;
            }
        }
        let ms = this.getWaitTime() < KANPAI_TIME ? KANPAI_TIME : FAHUA_TIME;
        let playerInfo = this._players[this.curr_doing_seat];
        if (playerInfo.auto_genzhu) {
            ms = 1000;
        }
        this.Oper_timeout = setTimeout(() => {
            // console.warn(`jh|aoto|${utils.cDate()}|${utils.cDate(this.lastFahuaTime)}`);
            fn();
        }, ms);
        return ms;
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
            next = next <= -1 ? len - 1 : next;
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
            canBipai: this.get_canBipai(),// 是否可以比牌 只要加过注 才可以比牌
            canKanpai: this.get_canKanpai(),// 是否可以看牌
        };
    }

    /**踢掉离线玩家 */
    protected battle_kickNoOnline() {
        const offLinePlayers: jhPlayer[] = [];
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
        for (const pl of offLinePlayers) {
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

        const poker = GoldenFlower_logic.randomPoker();
        let cards = [];

        for (let i = 0; i < 10; i++) {
            poker.sort((x, y) => Math.random() - 0.5);
            const threeCards = [];

            for (let j = 0; j < 3; j++) {
                const randomNum = random(0, poker.length - 1);
                threeCards.push(poker.splice(randomNum, 1)[0])
            }
            cards.push(threeCards);
        }

        GoldenFlower_logic.sortResult(cards);
        cards = cards.slice(0, len);
        cards.sort((a, b) => Math.random() - 0.5);

        return cards;

        // 生成一副顺序牌
        // const poker = GoldenFlower_logic.randomPoker();
        // // 使用的概率模型
        // const PROBABILITY_MODEL = control ? this.CONTROL_TYPE_PROBABILITY : this.TYPE_PROBABILITY;
        // // 转换成键值对数组再顺序排序
        // const PROBABILITY_LIST: any = Object.entries(PROBABILITY_MODEL)
        //     .sort((a: any, b: any) => Number(a[0]) - Number(a[0]));
        // // 最后的牌型数组
        // let cards: any[] = [];
        //
        // for (let i = 0; i < len; i++) {
        //     let num: number = 0, randomValue: number = utils.random(0, 10001);
        //     for (let [type, value] of PROBABILITY_LIST) {
        //         num += value;
        //         if (randomValue <= num) {
        //             cards.push(jhRoom.getTypeCards(poker, type));
        //             break;
        //         }
        //     }
        // }
        // return cards;
    }

    /**
     * 给玩家设置牌
     * @param player
     * @param cards
     * @param golds
     */
    setPlayerCard(playerInfo: jhPlayer, cards) {
        const cardType = GoldenFlower_logic.getCardType(cards);
        playerInfo.initGame(this, cards, cardType, this.lowBet);
    }


    /**
     * 获取特定的牌型
     * @param poker
     * @param type
     */
    static getTypeCards(poker: any, type: string): any[] {
        switch (type) {
            case '5': return GoldenFlower_logic.getBZ(poker);
            case '4': return GoldenFlower_logic.getTHS(poker);
            case '3': return GoldenFlower_logic.getTH(poker);
            case '2': return GoldenFlower_logic.getSZ(poker);
            case '1': return GoldenFlower_logic.getDZ(poker);
            case '0': return GoldenFlower_logic.getS(poker);
            default:
                throw new Error(`非法牌型 ${type}`);
        }
    }

    /**
     * 随机发牌
     * @param params
     */
    randomDeal(list: jhPlayer[]): void {
        const cards = this.generateCards(list.length, false);
        let indexSet: Set<number> = new Set();
        while (indexSet.size !== list.length) {
            indexSet.add(GoldenFlower_logic.random(0, list.length));
        }
        // 随机发牌
        [...indexSet].forEach(index => this.setPlayerCard(list[index], cards.shift()));
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
    personalControlDeal(gamePlayers: jhPlayer[], positivePlayers: any[], negativePlayers: any[]): void {
        const cards = this.generateCards(gamePlayers.length, true);

        positivePlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));
        negativePlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));

        // 逆序排序
        GoldenFlower_logic.sortResult(cards);

        // 过滤出机器人
        const robotPlayers = gamePlayers.filter(p => p.isRobot === 2);

        // 如果这个有正调控的玩家 则正面调控的玩家获得最大的牌
        let luckPlayer;
        if (positivePlayers.length) {
            const p = positivePlayers[GoldenFlower_logic.random(0, positivePlayers.length)];
            luckPlayer = gamePlayers.find(pl => pl.uid === p.uid);
        } else {
            luckPlayer = robotPlayers[GoldenFlower_logic.random(0, robotPlayers.length)];
        }

        this.max_uid = luckPlayer.uid;
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
            indexSet.add(GoldenFlower_logic.random(0, gamePlayers.length));
        }
        // 随机发牌
        [...indexSet].forEach(index => this.setPlayerCard(gamePlayers[index], cards.shift()));
    }

    /**
     * 场控发牌
     * @param sceneControlState
     * @param gamePlayers
     * @param isPlatformControl 是否是平台调控
     */
    sceneControlDeal(sceneControlState: ControlState, gamePlayers: jhPlayer[], isPlatformControl) {
        // 如果不调控 则随机发牌
        if (sceneControlState === ControlState.NONE) {
            return this.randomDeal(gamePlayers);
        }

        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        gamePlayers.forEach(p => p.setControlType(type));

        // 获取牌并逆序排序
        let cards = this.generateCards(gamePlayers.length, sceneControlState === ControlState.SYSTEM_WIN);
        GoldenFlower_logic.sortResult(cards);

        // 如果是让系统赢 则随机一个机器人发大牌 否则则随机一个玩家发大牌
        const luckPlayer = gamePlayers.filter(p => {
            return sceneControlState === ControlState.SYSTEM_WIN ? p.isRobot === RoleEnum.ROBOT : p.isRobot === RoleEnum.REAL_PLAYER;
        }).sort((a, b) => Math.random() - 0.5)[0];
        this.setPlayerCard(luckPlayer, cards.shift());

        this.max_uid = luckPlayer.uid;

        // 其他玩家随机发牌
        gamePlayers.filter(p => p.uid !== luckPlayer.uid).sort(p => Math.random() - 0.5).map(p => {
            cards.sort((a, b) => Math.random() - 0.5);
            this.setPlayerCard(p, cards.shift());
        });
    }
}
