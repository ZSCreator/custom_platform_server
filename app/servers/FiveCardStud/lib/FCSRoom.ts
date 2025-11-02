import { pinus } from 'pinus';
import FCSPlayer from './FCSPlayer';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import * as FCSConst from "./FCSConst";
import { PersonalControlPlayer } from "../../../services/newControl";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import ControlImpl from "./control";
import utils = require('../../../utils/index');
import FCS_logic = require('./FCS_logic');
import MessageService = require('../../../services/MessageService');
import roomManager, { FRoomManger } from '../lib/FCSRoomMgr';
import { deleteHolds, getCardsModel, selectPlayersCards, selectPublicCards } from "../../DZpipei/lib/util/controlUtil";
import { getControlCards } from "./FCS_logic";
import { random } from "../../../utils";


/**等待准备时间 */
const WAIT_TIME = 5000;
/**发话时间 */
const NEXT_DOING_TIME = 15000;



/**
 * 梭哈匹配模式游戏房间
 * @property startTime 回合开始时间
 * @property endTime 回合结束时间
 * @property zipResult 压缩结算结果
 */
export default class FCSRoom extends SystemRoom<FCSPlayer> {
    /**房间状态 */
    status: 'NONE' | 'INWAIT' | 'INGAME' | 'END' = 'NONE';
    /**底注 */
    lowBet: number;
    /**低池 */
    pool_List: FCSConst.pool_interface[] = [];
    /**当前牌堆52张 0-52 */
    TheCards: number[] = [];
    /**一共3轮 */
    roundTimes: number = 0;
    /**当前盘面总押注 */
    roomCurrSumBet: number = 0;
    /**最后一个下注额度 */
    lastBetNum: number = 0;
    /**当前发话的人 */
    curr_doing_seat: number = -1;
    /**庄ID */
    zhuang_seat: number = -1;
    /**记录开始等待时候的时间 */
    currWaitTime: number = 0;
    action_Timeout: NodeJS.Timer = null;
    /**自由加注 */
    freedomBet: number[];
    /**记录发话时候的时间 */
    lastFahuaTime: number;
    /**5个人 */
    players: FCSPlayer[] = new Array(5).fill(null);
    /**玩家携带金币范围 */
    canCarryGold: number[];
    record_history: {//一局的历史记录
        /**翻牌前 */
        drawBefore: { uid: string, nickname: string, bet: number, type: string }[],
        /**翻三张牌 */
        draw: { uid: string, nickname: string, bet: number, type: string }[],
        /**翻四张牌 */
        turnPoker: { uid: string, nickname: string, bet: number, type: string }[],
        /**翻五张牌 */
        riverPoker: { uid: string, nickname: string, bet: number, type: string }[],
        info: { tatalBet: number, profit: number, holds: number[], cardType: { cards: number[], type: number }, nickname: string, uid: string, isFold: boolean }[]//结果
    };
    control: ControlImpl;

    startTime: number;
    endTime: number;
    zipResult: string = '';

    // 游戏玩家
    gamePlayers: FCSPlayer[] = [];
    /**当前携带金币最少的玩家的金币 */
    min_ply_gold = 0;
    _players: FCSPlayer[] = [];
    dissolve: NodeJS.Timeout;
    maxUid: string = null;

    constructor(opts: any) {
        super(opts)
        this.canCarryGold = opts.canCarryGold;// 进入条件
        this.lowBet = opts.lowBet;
        this.control = new ControlImpl({ room: this });
        this.Initialization();
    }
    close() {
        this.sendRoomCloseMessage();
        this.players = [];
    }
    Initialization() {
        clearTimeout(this.dissolve);
        this.record_history = {//一局的历史记录
            drawBefore: [],//翻牌前
            draw: [],//翻三张牌
            turnPoker: [],//翻四张牌
            riverPoker: [],//翻五张牌
            info: []//结果
        };
        this.min_ply_gold = 0;
        this.battle_kickNoOnline();
        this.record_history = {//一局的历史记录
            drawBefore: [],//翻牌前
            draw: [],//翻三张牌
            turnPoker: [],//翻四张牌
            riverPoker: [],//翻五张牌
            info: []//结果
        };
        this.status = 'INWAIT';// 等待玩家准备
        this.curr_doing_seat = -1;// 当前发话的人
        this.roundTimes = 0;// 已经多少轮游戏了
        this.roomCurrSumBet = 0;// 当前盘面总押注
        this.lastBetNum = 0;// 最后一个下注额度
        this.currWaitTime = 0;
        this.gamePlayers = [];
        this.pool_List = [];
        this.maxUid = null;
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
        if (this.isFull())
            return false;
        const idxs = [];
        this.players.forEach((m, i) => !m && idxs.push(i));
        // 随机一个位置
        const i = idxs[utils.random(0, idxs.length - 1)];
        this.players[i] = new FCSPlayer(i, dbplayer, this.sceneId);
        this._players = this.players.slice();
        // 添加到消息通道
        this.addMessage(dbplayer);
        this.channelIsPlayer('FiveCardStud.onEntry', {
            player: this._players[i].strip(),
            status: this.status,
            waitTime: this.getWaitTime()
        });
        return true;
    }

    /**
     * 有玩家离开
     * @param uid 
     * @param isExit true 掉线
     */
    exit(playerInfo: FCSPlayer, isExit: boolean) {
        //踢出消息通道
        this.kickOutMessage(playerInfo.uid);
        if (isExit) {//如果是掉线离开
            playerInfo.onLine = false;
            return;
        }
        this.players[playerInfo.seat] = null;
        if (this.status == "INWAIT") {
            this._players = this.players.slice();
            this.channelIsPlayer('FiveCardStud.onExit', { uid: playerInfo.uid, seat: playerInfo.seat });
        }
        roomManager.removePlayerSeat(playerInfo.uid);
    }


    /**获取等待状态的时间 */
    getWaitTime() {
        if (this.status == 'INWAIT')
            return Math.max(WAIT_TIME - (Date.now() - this.currWaitTime), 0);
        if (this.status == 'INGAME')
            return Math.max(NEXT_DOING_TIME - (Date.now() - this.lastFahuaTime), 0);
        return 0;
    }

    /**下一个玩家 */
    nextIdx(seat: number) {
        let count = seat, len = this._players.length;
        do {
            (count >= len) && (count = 0);
            const pl = this._players[count];
            if (pl && pl.status == "GAME" && !pl.isFold && pl.canUserGold() > 0) {
                return count;
            }
            count++;
        } while (true);
    }


    /**等待玩家准备 */
    async wait(playerInfo?: FCSPlayer) {
        if (this.status == 'NONE' || this.status == 'INWAIT') {
            // 如果只剩一个人的时候或者没有人了 就直接关闭房间
            if (this._players.filter(pl => pl && pl.canUserGold() >= this.canCarryGold[0]).length <= 1) {
                this.channelIsPlayer(`FiveCardStud.onWait`, { waitTime: 0, roomId: this.roomId });
                return;
            }
            // 通知 所有人开始准备
            if (Date.now() - this.currWaitTime < WAIT_TIME) {//5s内就不重复通知玩家
                const member = playerInfo && this.channel.getMember(playerInfo.uid);
                if (member) {
                    let waitTime = Math.max(WAIT_TIME - (Date.now() - this.currWaitTime), 0);
                    MessageService.pushMessageByUids(`FiveCardStud.onWait`, { waitTime }, member);
                }
                return;
            }
            this.currWaitTime = Date.now();
            this.channelIsPlayer('FiveCardStud.onWait', { waitTime: WAIT_TIME, roomId: this.roomId });

            clearTimeout(this.action_Timeout);
            this.action_Timeout = setTimeout(() => {
                // 人数超过2个就强行开始
                const list = this._players.filter(pl => pl && pl.canUserGold() >= this.canCarryGold[0]);
                if (list.length >= 2) {
                    this.deal_step_1(list);
                } else {
                    //再次通知前端准备
                    this.channelIsPlayer('FiveCardStud.onWait', { waitTime: 0, roomId: this.roomId });
                }
            }, WAIT_TIME);
        }
    }

    /**发牌 */
    async deal_step_1(list: FCSPlayer[]) {
        this.status = 'INGAME';
        this.startTime = Date.now();
        this.gamePlayers = list;
        this.gamePlayers.forEach(pl => pl && (pl.status = "GAME"))
        // 洗牌
        this.TheCards = FCS_logic.getPai();
        this.gamePlayers.sort((pl1, pl2) => pl1.canUserGold() - pl2.canUserGold());
        this.min_ply_gold = this.gamePlayers[0].canUserGold();
        this.min_ply_gold = Math.floor(this.min_ply_gold / 400) * 100;

        await this.control.runControl();

        for (const pl of list) {
            let card = this.TheCards.splice(utils.random(0, this.TheCards.length - 3), 2);
            pl.execBet(this, this.lowBet);// 扣前注
        }
        this.partPool();

        // 获取庄
        this.zhuang_seat = this.getMaxPkerPl();

        let zj_pl = this._players.find(pl => pl && pl.seat == this.zhuang_seat);
        for (const pl of this._players) {
            const member = pl && this.channel.getMember(pl.uid);
            if (member) {
                const opts = {
                    zhuang: { seat: zj_pl.seat, uid: zj_pl.uid },
                    roomCurrSumBet: this.roomCurrSumBet,
                    players: list.map(c => c.toGame(pl.uid, 2)),
                }
                MessageService.pushMessageByUids(`FiveCardStud.onDeal`, opts, member);
            }
        }
        // 清空每个玩家的下注数
        this._players.forEach(pl => pl && pl.resetBet());
        this.lastBetNum = 0;// 最后下注数量清空
        // 延迟一秒玩家说话
        await utils.delay(1000);
        this.set_next_doing_seat(this.zhuang_seat);
    }

    /**发话 */
    set_next_doing_seat(doing: number) {
        let playerInfo = this._players[doing];
        playerInfo.state = "PS_OPER";
        // 记录发话时候的时间
        this.lastFahuaTime = Date.now();
        // 记录当前发话的人
        this.curr_doing_seat = doing;
        for (const pl of this._players.filter(c => !!c)) {
            const member = pl && this.channel.getMember(pl.uid);
            const opts = this.stripSpeak(playerInfo);
            if (pl.isRobot == RoleEnum.ROBOT) {
                opts['maxUid'] = this.maxUid;
            }
            member && MessageService.pushMessageByUids('FiveCardStud.msg_oper_c', opts, member);
        }
        // 时间到了 如果跟注为0 就过牌(跟注) 否则弃牌
        this.action_Timeout = setTimeout(() => {
            if (this.lastBetNum == 0) {
                playerInfo.handler_play(this, 'pass', 0);
            } else {
                playerInfo.handler_fold(this);
            }
        }, NEXT_DOING_TIME + 1000);
    }

    /**包装发话数据 */
    stripSpeak(playerInfo: FCSPlayer) {
        const cinglNum = this.lastBetNum - playerInfo.bet;
        // 每轮最大只能下this.freedomBet[1]
        this.freedomBet = [cinglNum, this.min_ply_gold - playerInfo.bet];
        const opts: FCSConst.Ionfahua = {
            curr_doing_seat: this.curr_doing_seat,
            roundTimes: this.roundTimes,
            currGold: playerInfo.canUserGold(),
            freedomBet: this.freedomBet,// 自由下注
            cinglNum: cinglNum,
            aoto_time: NEXT_DOING_TIME - (Date.now() - this.lastFahuaTime),
            recommendBet: [Math.floor(this.roomCurrSumBet / 300) * 100, Math.floor(this.roomCurrSumBet * 2 / 300) * 100, this.roomCurrSumBet],
        }
        opts["bet"] = playerInfo.bet;
        opts["min_ply_gold"] = this.min_ply_gold;
        return opts;
    }

    /**这里判断大家下注是否全部一样  如果一样就进行下一轮 */
    async nextStatus() {
        this.auto_dissolve_room();
        const list = this._players.filter(pl => pl && !pl.isFold && pl.status == 'GAME');
        const isPoker = list.every(pl => pl.canDeal(this.lastBetNum));//每个人下注
        // 如果都全下了 那么就直接发完 然后结算
        if (isPoker && list.filter(pl => pl.canUserGold() > 0).length <= 1) {
            this.partPool();
            return this.public_deal3();
        }

        if (isPoker) {
            this.partPool();
            this.public_deal2();
            return;
        }

        let next_id = this.nextIdx(this.curr_doing_seat + 1);
        this.set_next_doing_seat(next_id);
    }
    auto_dissolve_room() {
        clearTimeout(this.dissolve);
        this.dissolve = setTimeout(() => {
            console.warn("超过60s没有操作，房间卡死")
        }, 60 * 1000);
    }


    /**每轮发一张牌 */
    public_deal1() {
        // 清空每个玩家的下注数
        this._players.forEach(pl => pl && pl.resetBet());
        this.lastBetNum = 0;// 最后下注数量清空
        for (const pl of this._players) {
            if (!pl || pl.isFold) continue;
            pl.holds.push(pl.TheCards.shift());
        }
        this.roundTimes++;
        for (const pl of this._players) {
            const member = pl && this.channel.getMember(pl.uid);
            if (member) {
                const opts: FCSConst.Idz_onDeal2 = {
                    roundTimes: this.roundTimes,// 当前轮数
                    players: this._players.map(c => c && c.toGame(pl.uid, this.roundTimes + 2)),
                }
                MessageService.pushMessageByUids(`FiveCardStud.onDeal2`, opts, member);
            }
        }
        const gamePlayers = this._players.filter(pl => pl && pl.status == "GAME").sort((pl1, pl2) => pl1.canUserGold() - pl2.canUserGold());
        this.min_ply_gold = gamePlayers[0].canUserGold();
        if (this.roundTimes == 1) {
            this.min_ply_gold = Math.floor(this.min_ply_gold / 2);
        }
        this.min_ply_gold = Math.floor(this.min_ply_gold / 100) * 100;
    }
    public_deal2() {
        if (this.roundTimes >= 3) {
            return this.settlement();
        }
        // 发牌
        this.public_deal1();
        setTimeout(() => {
            this.curr_doing_seat = this.getMaxPkerPl() - 1;
            let next_id = this.nextIdx(this.curr_doing_seat + 1);
            this.set_next_doing_seat(next_id);
        }, 2000);
    }

    /**发完牌进入计算流程 */
    public_deal3() {
        if (this.roundTimes >= 3) {
            return this.settlement();
        }
        // 发牌
        this.public_deal1();
        // 延迟后 继续发
        setTimeout(() => this.public_deal3(), 2000);
    }
    /**记录翻牌前情况 */
    recordDrawBefore(playerInfo: FCSPlayer, bet: number, type: string) {
        let ob = {
            uid: playerInfo.uid,
            nickname: playerInfo.nickname,
            bet: bet,
            type: type,
            profit: playerInfo.profit
        }
        if (this.roundTimes == 0) {
            this.record_history.drawBefore.push(ob);
        } else if (this.roundTimes == 1) {
            this.record_history.draw.push(ob);
        } else if (this.roundTimes == 2) {
            this.record_history.turnPoker.push(ob);
        } else if (this.roundTimes == 3) {
            this.record_history.riverPoker.push(ob);
        }
    }

    /**记录一局结果 */
    recordResult() {
        this.record_history.info = this._players.map(pl => {
            if (pl)
                return {
                    tatalBet: pl.tatalBet,
                    profit: pl.profit,
                    holds: pl.holds,
                    cardType: pl.cardType,
                    nickname: pl.nickname,
                    uid: pl.uid,
                    isFold: pl.isFold
                }
        })
    }
    /**结算 */
    async settlement() {
        let list = this._players.filter(pl => pl && pl.status == 'GAME');
        this.status = 'END';
        this.countAlikePoker(list);//计算玩家大小
        this._players.some(pl => pl && pl.isRobot == 0) && console.warn(this.roundId, this.roomId);
        this.poolSettlement(list);//按底池结算

        //添加战绩
        for (const pl of list) {
            pl && await pl.addMilitary(this);
        }
        //记录最后结果
        this.recordResult();
        for (const pl of this._players) {
            pl && await pl.only_update_game(this);
        }
        // 延迟后通知某玩家赢了
        await utils.delay(800);
        const opts: FCSConst.Idz_onSettlement = {
            list: this._players.filter(c => !!c).map(pl => pl && pl.result(this))
        }
        this.channelIsPlayer('FiveCardStud.onSettlement', opts);

        // 延迟后进入下一局
        await utils.delay(800);
        this.Initialization();
    }

    /**踢掉离线 */
    battle_kickNoOnline() {
        const offLinePlayers: FCSPlayer[] = [];
        for (const pl of this.players) {
            if (!pl) continue;
            // 不在线移除玩家 在线则不移除 因为还在这个场中
            if (!pl.onLine) roomManager.removePlayer(pl);
            offLinePlayers.push(pl);
            this.kickOutMessage(pl.uid);
            this.players[pl.seat] = null;
            roomManager.removePlayerSeat(pl.uid);
        }
        //更新数据（前端需要切换场景）
        this.kickingPlayer(pinus.app.getServerId(), offLinePlayers);
    }

    /**计算牌型 typeSize赋值 */
    countAlikePoker(list: FCSPlayer[]) {
        for (const pl of list) {
            if (pl.isFold) {
                // pl.type = -1;
                pl.typeSize = -1;
            }
            if (!pl.isFold) {
                let cards = (pl.holds.length != 0 && pl.holds) ? pl.holds : null;
                if (cards) {
                    pl.cardType.type = FCS_logic.GetCardType(pl.holds.slice());
                    pl.cardType.cards = pl.holds.slice();
                    pl.typeSize = FCS_logic.sortPokerToType(pl.holds.slice());
                }
            }
        }
    }

    /**返回 当前最大牌玩家 */
    getMaxPkerPl() {
        let seat = -1;
        let _typeSize = -1;
        // let TheCard: number[] = [];
        let TheCards = FCS_logic.getPai();
        for (const pl of this._players) {
            if (!pl) continue;
            for (const card of pl.holds) {
                for (let index = 1; index < TheCards.length; index++) {
                    if (TheCards[index] == card) {
                        TheCards[index] = null;
                        break;
                    }
                }
            }
        }
        TheCards = TheCards.filter(c => !!c);

        for (const pl of this._players) {
            if (!pl || pl.isFold) continue;
            pl._typeSize = FCS_logic.sortPokerToType(pl.holds.slice(1, 5));
            if (pl.holds.length == 5) {
                pl._typeSize = FCS_logic.maybe_sortPokerToType(TheCards, pl.holds.slice(1, 5));
            }
            if (pl._typeSize > _typeSize) {
                _typeSize = pl._typeSize;
                seat = pl.seat;
            }
        }
        // this.channelIsPlayer("FiveCardStud.print", this._players.map(pl => {
        //     if (pl && !pl.isFold) {
        //         return {
        //             // uid: pl.uid,
        //             seat: pl.seat,
        //             holds: pl.holds.slice(1, 5).map(c => FCS_logic.pukes[c]).toString(),
        //             _typeSize: pl._typeSize,
        //             holdss: pl.holds.slice(1, 5)
        //         }
        //     }
        // }))
        return seat;
    }

    /**记录一次 池子 */
    partPool() {
        do {
            let pool: FCSConst.pool_interface = { bet: 0, uids: [] };
            let list = this._players.filter(pl => pl && pl.bet > 0).sort((pl1, pl2) => { return pl1.bet - pl2.bet; });
            /**全让牌的情况下 */
            if (list.length == 0)
                break;
            let bet = list[0].bet;
            for (const pl of list) {
                pool.bet += bet;
                pool.uids.push({ uid: pl.uid, typeSize: 0 });
                pl.bet -= bet;
            }
            this.pool_List.push(pool);
            if (list.every(pl => pl.bet == 0)) {
                break;
            }
        } while (true);

        console.log('当前底池', this.roomId, this.pool_List.map(m => {
            return { bet: m.bet, uids: JSON.stringify(m.uids) };
        }));
    }

    /**按底池结算 */
    poolSettlement(list: FCSPlayer[]) {
        for (const pool of this.pool_List) {
            let uids = pool.uids.sort((c1, c2) => {
                let pl1 = this.getPlayer(c1.uid);
                c1.typeSize = (pl1 && !pl1.isFold) ? pl1.typeSize : 0;

                let pl2 = this.getPlayer(c2.uid);
                c2.typeSize = (pl2 && !pl2.isFold) ? pl2.typeSize : 0;

                return c2.typeSize - c1.typeSize;
            });
            let pls = uids.filter(c => c.typeSize == uids[0].typeSize);
            for (const pl of pls) {
                let playerInfo = this.getPlayer(pl.uid);
                playerInfo.profit += Math.floor(pool.bet / pls.length);
            }
        }
    }

    /**跑马灯 */
    addNote(player: FCSPlayer, num: number) {
        if (num >= FCSConst.FAN_JIANG * this.lowBet) {
            //播放跑马灯
            MessageService.sendBigWinNotice(this.nid, player.nickname, num, player.isRobot,player.headurl);
        }
    }

    /**
     * 随机发牌
     */
    randomDeal() {
        const cards = [], tc = this.TheCards;
        for (let i = 0, len = this.gamePlayers.length; i < len; i++) {
            const c = [];
            for (let j = 0; j < 5; j++) {
                c.push(tc.splice(random(0, tc.length - 1), 1)[0]);
            }
            cards.push(c);
        }

        // 给每个人发两张手牌 顺便扣除前注
        this.gamePlayers.forEach(player => {
            cards.sort((x, y) => Math.random() - 0.5);
            player.initGame(cards.shift());
        });
    }


    /**
     * 个控发牌
     * @param positivePlayers 正调控玩家 让他赢的
     * @param negativePlayers 负调控的玩家  让他输
     */
    personalControlDeal(positivePlayers: PersonalControlPlayer[], negativePlayers: PersonalControlPlayer[]) {
        positivePlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));
        negativePlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));

        let gamePlayers = this.gamePlayers;
        // 调控玩家数量
        const controlPlayersCount = positivePlayers.length + negativePlayers.length + 1;
        // 获取玩家人数的牌
        const cards = getControlCards(gamePlayers.length, controlPlayersCount, this.TheCards);

        // 过滤出机器人
        const robotPlayers = gamePlayers.filter(p => p.isRobot === RoleEnum.ROBOT);

        // 如果这个有正调控的玩家 则正面调控的玩家获得最大的牌
        let luckPlayer: FCSPlayer;
        if (positivePlayers.length) {
            const p = positivePlayers[utils.random(0, positivePlayers.length - 1)];
            luckPlayer = gamePlayers.find(pl => pl.uid === p.uid);
        } else {
            // 从金币最多的两个机器人中抽取一人做调控
            if (robotPlayers.length > 1) {
                robotPlayers.sort((a, b) => b.canUserGold() - a.canUserGold());

                luckPlayer = Math.random() < 0.85 ? robotPlayers[0] : robotPlayers[1];
            } else {
                luckPlayer = robotPlayers[0];
            }
        }

        luckPlayer.initGame(cards.shift());
        this.maxUid = luckPlayer.uid;

        // 过滤掉该玩家
        gamePlayers = gamePlayers.filter(player => player.uid !== luckPlayer.uid);

        // 如果有调控输的玩家
        if (negativePlayers.length) {
            // 打乱随机发牌
            negativePlayers.sort((a, b) => Math.random() - 0.5);
            negativePlayers.forEach(p => {
                const pl = gamePlayers.find(player => player.uid === p.uid);
                pl.initGame(cards.shift());
                // 过滤掉该玩家
                gamePlayers = gamePlayers.filter(player => player.uid !== p.uid);
            });
        }

        // 剩余的玩家随机发
        gamePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
            cards.sort((a, b) => Math.random() - 0.5);
            p.initGame(cards.pop());
        });
    }

    /**
     * 场控发牌
     * @param sceneControlState
     * @param isPlatformControl
     */
    sceneControlDeal(sceneControlState: ControlState, isPlatformControl) {
        // 没有则随机发牌
        if (sceneControlState === ControlState.NONE) {
            return this.randomDeal();
        }

        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        this.gamePlayers.forEach(p => p.setControlType(type));
        let gamePlayers = this.gamePlayers;

        // 如果系统赢则取一个机器人发最大的牌 其他随机发
        // 反之如果玩家赢则取一个玩家发最大的牌 其他随机发
        const winnerType = sceneControlState === ControlState.SYSTEM_WIN ? RoleEnum.ROBOT : RoleEnum.REAL_PLAYER;
        const possibleWinPlayers = gamePlayers.filter(p => p.isRobot === winnerType);
        const lossPlayers = gamePlayers.filter(p => p.isRobot !== winnerType);
        possibleWinPlayers.sort((a, b) => Math.random() - 0.5);

        // 调控玩家数量
        const controlPlayersCount = lossPlayers.length + 1;
        // 获取玩家人数的牌
        const cards = getControlCards(gamePlayers.length, controlPlayersCount, this.TheCards);
        const winPlayer = possibleWinPlayers.shift();
        winPlayer.initGame(cards.shift());

        this.maxUid = winPlayer.uid;

        // 过滤掉那个发牌的玩家
        gamePlayers = gamePlayers.filter(p => p.uid !== winPlayer.uid);

        lossPlayers.sort((a, b) => Math.random() - 0.5);
        lossPlayers.forEach(p => {
            p.initGame(cards.shift());
            // 过滤掉该玩家
            gamePlayers = gamePlayers.filter(player => player.uid !== p.uid);
        });

        // 剩余的玩家随机发
        gamePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
            cards.sort((a, b) => Math.random() - 0.5);
            // 从尾部去小牌
            p.initGame(cards.shift());
        });
    }
}


