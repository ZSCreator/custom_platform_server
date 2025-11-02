import { pinus } from 'pinus';
import { getLogger } from 'pinus-logger';
import dzPlayer from './dzPlayer';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import * as DZpipeiConst from "./DZpipeiConst";
import { PersonalControlPlayer } from "../../../services/newControl";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import ControlImpl from "./control";
import RobotPokerAction from "../../../services/robotService/DZpipei/services/RobotPokerAction";
import { deleteHolds, getCardsModel, selectPlayersCards, selectPublicCards } from "./util/controlUtil";
import utils = require('../../../utils/index');
import dz_logic = require('./dz_logic');
import dzpipeiConst = require('./DZpipeiConst');
import MessageService = require('../../../services/MessageService');
import roomManager, { DzRoomManger } from '../lib/dzRoomMgr';
const Logger = getLogger('server_out', __filename);


/**等待准备时间 */
const WAIT_TIME = 3000;
/**发话时间 */
const FAHUA_TIME = 14000;



/**
 * 德州匹配模式游戏房间
 * @property startTime 回合开始时间
 * @property endTime 回合结束时间
 * @property zipResult 压缩结算结果
 */
export default class dzRoom extends SystemRoom<dzPlayer> {
    /**房间状态 */
    status: 'NONE' | 'INWAIT' | 'INGAME' | 'END' = 'NONE';
    isquanxia: boolean = false;
    /**桌面公共牌 递增的*/
    publicCards: number[] = [];
    /**低池 */
    pool_List: DZpipeiConst.pool_interface[] = [];
    record_history: {//一局的历史记录
        /**底注 */
        lowbet: { uid: string, nickname: string, bet: number }[],
        blindBet: { payerType: 'SB' | 'BB' | '', uid: string, nickname: string, bet: number, type: string }[],//盲注
        /**翻牌前 */
        drawBefore: { uid: string, nickname: string, bet: number, type: string }[],
        /**翻三张牌 */
        draw: { uid: string, nickname: string, bet: number, type: string }[],
        /**翻四张牌 */
        turnPoker: { uid: string, nickname: string, bet: number, type: string }[],
        /**翻五张牌 */
        riverPoker: { uid: string, nickname: string, bet: number, type: string }[],
        info: { playerType: 'SB' | 'BB' | '', tatalBet: number, profit: number, holds: number[], type: number, nickname: string, uid: string, isFold: boolean }[]//结果
    };
    /**小盲/大盲 */
    blindBet: number[];
    /**当前牌堆52张 0-52 */
    TheCards: number[] = [];
    /**翻牌前 翻牌圈 转牌圈 河牌圈 */
    roundTimes: number = 0;
    /**当前盘面总押注 */
    roomCurrSumBet: number = 0;
    /**最后一个下注额度 */
    lastBetNum: number = 0;
    /**当前发话的人 */
    curr_doing_seat: number = -1;
    /**庄ID */
    zhuang_seat: number = -1;
    /**小盲位置 */
    minBlindIdx: number = -1;
    /**记录开始等待时候的时间 */
    currWaitTime: number = 0;
    offLineFahua: {
        /**发话id */
        idx: number,
        /**跟注额度 */
        cinglNum: number
    } = { idx: -1, cinglNum: 0 };
    /**5张公牌 */
    publicCard: number[] = [];
    /**5张公牌 （不会缩减的公牌）*/
    publicCardToSort: number[] = [];
    Oper_timeout: NodeJS.Timer = null;
    waitTimeout: NodeJS.Timer = null;
    /**自由加注 */
    freedomBet: number[];
    /**记录发话时候的时间 */
    lastFahuaTime: number;
    /**9个人 */
    players: dzPlayer[] = new Array(9).fill(null);
    /**玩家携带金币范围 */
    canCarryGold: number[];

    control: ControlImpl;

    startTime: number;
    endTime: number;
    zipResult: string = '';

    /** 默认赢家 */
    default: string = '';

    // 游戏玩家
    gamePlayers: dzPlayer[] = [];
    /**游戏牌局 推出不删除得玩家列表 */
    _players: dzPlayer[] = [];
    RobotPokerAction: RobotPokerAction = new RobotPokerAction();
    //所有玩家手牌+ 公牌 最好的组合的牌力值顺序
    descSortAllPlayer: any[];
    /**前注 */
    ante: number;
    constructor(opts: any) {
        super(opts)
        this.canCarryGold = opts.canCarryGold;// 进入条件
        this.blindBet = opts.blindBet;// 小盲/大盲
        this.ante = opts.ante;
        this.record_history = {//一局的历史记录
            lowbet: [],
            blindBet: [],//盲注
            drawBefore: [],//翻牌前
            draw: [],//翻三张牌
            turnPoker: [],//翻四张牌
            riverPoker: [],//翻五张牌
            // holds: [],//每个人的手牌
            info: []//结果
        };

        this.control = new ControlImpl({ room: this });
        this.Initialization();
    }
    close() {
        this.sendRoomCloseMessage();
        this.players = [];
    }
    Initialization() {
        //踢掉离线玩家
        this.battle_kickNoOnline();
        this.status = 'INWAIT';// 等待玩家准备
        this.default = '';
        this.publicCard = [];
        this.publicCardToSort = [];
        this.descSortAllPlayer = [];
        this.curr_doing_seat = -1;// 当前发话的人
        this.roundTimes = 0;// 已经多少轮游戏了
        this.roomCurrSumBet = 0;// 当前盘面总押注
        this.lastBetNum = 0;// 最后一个下注额度
        this.currWaitTime = 0;
        this.publicCards.length = 0;
        this.gamePlayers = [];
        this._players = [];
        this.record_history = {//一局的历史记录
            lowbet: [],
            blindBet: [],//盲注
            drawBefore: [],//翻牌前
            draw: [],//翻三张牌
            turnPoker: [],//翻四张牌
            riverPoker: [],//翻五张牌
            // holds: [],//每个人的手牌
            info: []//结果
        };
        this.isquanxia = false;
        this.pool_List = [];
        this.updateRoundId();
        // this.wait();
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
        const idxs = [];
        this.players.forEach((m, i) => !m && idxs.push(i));
        // 随机一个位置
        const i = idxs[utils.random(0, idxs.length - 1)];
        if (!dbplayer.currGold) {
            dbplayer.currGold = this.canCarryGold[0];
            const ran = utils.random(0, 3);
            if (ran >= 2) {
                if (ran == 3) {
                    dbplayer.currGold = this.canCarryGold[1] / 2;
                } else {
                    dbplayer.currGold = Math.floor(utils.random(this.canCarryGold[0], this.canCarryGold[1]) / 100) * 100;
                }
            }
        }
        this.players[i] = new dzPlayer(i, dbplayer, this);
        this._players = this.players.slice();
        // 添加到消息通道
        this.addMessage(dbplayer);
        // 通知其他玩家有人加入房间
        this.channelIsPlayer('dz_onEntry', {
            player: this.players[i].strip(),
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
    exit(playerInfo: dzPlayer, isExit: boolean, msg: string = "") {
        //踢出消息通道
        this.kickOutMessage(playerInfo.uid);
        if (isExit) {//如果是掉线离开
            playerInfo.onLine = false;
            return;
        }
        this.players[playerInfo.seat] = null;
        if (this.status == "INWAIT") {
            this._players = this.players.slice();
            // 通知其他玩家有人退出
            this.noticeExit(playerInfo.uid, playerInfo.seat, msg);
        }

        roomManager.removePlayerSeat(playerInfo.uid);
    }
    /**获取等待状态的时间 */
    getWaitTime() {
        if (this.status == 'INWAIT')
            return Math.max(WAIT_TIME - (Date.now() - this.currWaitTime), 0);
        if (this.status == 'INGAME')
            return Math.max(FAHUA_TIME - (Date.now() - this.lastFahuaTime), 0);
        return 0;
    }

    /**下一个玩家 */
    nextIdx(idx: number) {
        let next = idx + 1;
        let len = this._players.length;
        do {
            next = next >= len ? 0 : next;
            if (next == idx) {
                next = -1;
                break;
            }
            let pl = this._players[next];
            if (pl && pl.status == 'GAME' && pl.canUserGold() > 0 && !pl.isFold) {
                break;
            }
            next++;
        } while (true);
        return next;
    }

    /**刷新小盲位置 */
    updateMinBlind() {
        const playerInfo = this._players[this.minBlindIdx];
        if (!playerInfo || playerInfo.status != 'GAME' || playerInfo.isFold || playerInfo.canUserGold() == 0) {
            this.minBlindIdx = this.nextIdx(this.minBlindIdx);
        }
    }

    /**等待玩家准备 */
    async wait(playerInfo?: dzPlayer) {
        if (this.status != 'NONE' && this.status != 'INWAIT') {
            return;
        }
        // 如果只剩一个人的时候或者没有人了 就直接关闭房间
        // if (this._players.filter(pl => pl && pl.canUserGold() >= this.canCarryGold[0]).length <= 1) {
        //     this.channelIsPlayer(`dz_onWait`, { waitTime: 0, roomId: this.roomId });
        //     return;
        // }
        // 通知 所有人开始准备
        // if (Date.now() - this.currWaitTime < WAIT_TIME) {//5s内就不重复通知玩家
        //     const member = playerInfo && this.channel.getMember(playerInfo.uid);
        //     if (member) {
        //         let waitTime = Math.max(WAIT_TIME - (Date.now() - this.currWaitTime), 0);
        //         MessageService.pushMessageByUids(`dz_onWait`, { waitTime }, member);
        //     }
        //     return;
        // }
        this.currWaitTime = Date.now();
        this.channelIsPlayer('dz_onWait', { waitTime: WAIT_TIME, roomId: this.roomId });

        clearTimeout(this.waitTimeout);
        this.waitTimeout = setTimeout(() => {
            // 人数超过2个就强行开始
            const list = this._players.filter(pl => pl && pl.canUserGold() >= this.canCarryGold[0]);
            if (list.length >= 2) {
                this.handler_start(list);
            } else {
                //再次通知前端准备
                this.channelIsPlayer('dz_onWait', { waitTime: 0, roomId: this.roomId });
            }
        }, WAIT_TIME);
    }

    /**发牌 */
    async handler_start(list: dzPlayer[]) {
        this.status = 'INGAME';
        this.startTime = Date.now();
        this.gamePlayers = list;
        this.gamePlayers.forEach(pl => pl && (pl.status = "GAME"));
        // 洗牌
        this.TheCards = dz_logic.getPai();
        // 调控发牌 给每个人发两张手牌 顺便扣除前注
        await this.control.runControl();
        // for (const pl of list) {
        //     let card = this.TheCards.splice(utils.random(0, this.TheCards.length - 3), 2);
        //     pl.initGame(card);
        //     pl.execBet(this, this.blindBet[0]);// 扣前注
        // }
        for (const pl of list) {
            this.record_history.lowbet.push({ uid: pl.uid, nickname: pl.nickname, bet: pl.bet })
        }
        this.partPool();
        this.lastBetNum = 0;
        // 获取庄
        this.zhuang_seat = this._players.findIndex(pl => pl && pl.status == 'GAME');

        /**庄的下一个玩家为小盲 (只有两个玩家的时候 庄就是小盲) */
        this.minBlindIdx = list.length == 2 ? this.zhuang_seat : this.nextIdx(this.zhuang_seat);

        const sb_pl = this._players[this.minBlindIdx];
        sb_pl.execBet(this, this.blindBet[0]);//扣小盲
        sb_pl.playerType = "SB";
        this.recordBlindBet(sb_pl);

        // 下一个大盲
        let doing = this.nextIdx(this.minBlindIdx);
        const bb_pl = this._players[doing];
        bb_pl.execBet(this, this.blindBet[1]);// 扣大盲
        bb_pl.playerType = "BB";
        this.recordBlindBet(bb_pl);

        // 第一个说话玩家(大盲的下一个)
        doing = this.nextIdx(doing);

        let zj_pl = this._players.find(pl => pl && pl.seat == this.zhuang_seat);
        //给准备好的玩家发手牌
        for (const pl of this._players) {
            if (!pl) continue;
            let poker = dz_logic.getCardsType(pl.holds.slice(), this.publicCards.slice());
            pl.cardType = poker;
            pl.type = poker.type == -1 ? 0 : poker.type;
            const member = this.channel.getMember(pl.uid);
            const opts = {
                zhuang: { seat: zj_pl.seat, uid: zj_pl.uid },
                roomCurrSumBet: this.roomCurrSumBet,
                fahuaIdx: doing,// 当前发话玩家
                cardType: pl.cardType,
                type: pl.type,
                players: list.map(c => c.toGame(pl.uid)),
                default: this.default,
            }
            if (pl.isRobot == 0) delete opts["default"];
            member && MessageService.pushMessageByUids('dz_onDeal', opts, member);
        }
        //根据手牌+公牌获取牌力值
        let allPlayerList = this.stripRobotNeed();
        this.descSortAllPlayer = RobotPokerAction.getAllPlayerPokerPowerDescendingSort(allPlayerList, this.publicCardToSort);
        // 延迟一秒玩家说话
        setTimeout(() => this.set_next_doing_seat(doing), 1500);
    }

    /**发话 */
    set_next_doing_seat(doing: number) {
        let playerInfo = this._players[doing];
        playerInfo.state = "PS_OPER";
        // 记录发话时候的时间
        this.lastFahuaTime = Date.now();
        /**跟注额度 */
        const cinglNum = this.lastBetNum - playerInfo.bet;

        // const tempNum = this.roomCurrSumBet + cinglNum;
        playerInfo.recommendBet = [Math.floor(this.roomCurrSumBet / 3), Math.floor(this.roomCurrSumBet / 3 * 2), this.roomCurrSumBet];
        this.offLineFahua.idx = doing;
        this.offLineFahua.cinglNum = cinglNum;
        // 记录当前发话的人
        this.curr_doing_seat = doing;
        // console.warn(this.roomId, doing, playerInfo.uid, utils.cDate());
        const opts = this.stripSpeak(playerInfo);
        const AiInfo = this.getAiInfo(playerInfo);
        // for (const pl of this._players) {
        //     if (!pl) continue
        //     const member = pl && this.channel.getMember(pl.uid);
        //     const temp = utils.clone(opts)
        //     if (pl.isRobot == 2) {
        //         Object.assign(temp, AiInfo);
        //     }
        //     MessageService.pushMessageByUids(`dz_onFahua`, temp, member);
        // }
        const temp = utils.clone(opts)
        Object.assign(temp, AiInfo);
        this.channelIsPlayer("dz_onFahua", temp);

        // 时间到了 如果跟注为0 就过牌(跟注) 否则弃牌
        this.Oper_timeout = setTimeout(() => {
            if (this.lastBetNum == 0) {
                this.handler_oper('pass', playerInfo, 0);
            } else {
                playerInfo.handler_fold(this, 'fold');
            }
        }, FAHUA_TIME + 1000);
    }

    /**包装发话数据 */
    stripSpeak(playerInfo: dzPlayer) {
        this.freedomBet = [0, 0];
        let betmin = this.lastBetNum - playerInfo.bet;
        let betmax = playerInfo.canUserGold();
        if (betmax > betmin) {
            this.freedomBet = [betmin, betmax];
        }
        const opts: DZpipeiConst.Ionfahua = {
            roundTimes: this.roundTimes,
            fahuaIdx: this.offLineFahua.idx,
            lastBetNum: this.lastBetNum,
            currGold: playerInfo.canUserGold(),
            cinglNum: this.offLineFahua.cinglNum,// 跟注额度
            freedomBet: this.freedomBet,// 自由下注
            recommBet: playerInfo.recommendBet,// 推荐下注
            fahuaTime: FAHUA_TIME - (Date.now() - this.lastFahuaTime),
            round_action: ""
        }
        return opts;
    }
    getAiInfo(playerInfo: dzPlayer) {
        const opts = { round_action: "", win_Probability: 0 };
        if (this.roundTimes == 0) {
            opts.round_action = dz_logic.getY1_4(playerInfo.holds);
            return opts;
        }
        let total_num = 0;
        let pl1_win = 0;
        for (let index = 0; index < 100; index++) {
            let temp = this.TheCards.map(c => c);
            temp.sort(() => 0.5 - Math.random());
            const publicCards = temp.splice(0, 5 - this.publicCards.length);
            publicCards.push(...this.publicCards);
            total_num++;
            const list = this._players.filter(pl => pl && !pl.isFold && pl.status == 'GAME');
            const aipoke = list.map(c => {
                return {
                    uid: c.uid,
                    holds: c.holds,
                    cardSize: 0
                }
            })
            for (const c of aipoke) {
                let { cards, type } = dz_logic.getCardsType(c.holds.slice(), publicCards.slice());
                c.cardSize = dz_logic.sortPokerToType(cards.slice());
            }
            aipoke.sort((a, b) => {
                return b.cardSize - a.cardSize;
            });

            if (aipoke[0].uid == playerInfo.uid) {
                pl1_win++;
            }
        }
        const win_Probability = pl1_win / total_num * 100;
        opts.win_Probability = win_Probability;
        if (win_Probability >= 0 && win_Probability <= 14) {
            opts.round_action = "y1b"
        } else if (win_Probability > 14 && win_Probability <= 39) {
            opts.round_action = "y2b"
        } else if (win_Probability > 36 && win_Probability <= 59) {
            opts.round_action = "y3b"
        } else if (win_Probability > 59 && win_Probability <= 99) {
            opts.round_action = "y4b"
        } else if (win_Probability == 100) {
            opts.round_action = "y5b"
        }
        return opts;
    }

    /**玩家操作 */
    handler_oper(type: 'cingl' | 'pass' | 'allin' | 'filling', playerInfo: dzPlayer, currBet: number) {
        clearTimeout(this.Oper_timeout);
        // 玩家下注
        playerInfo.execBet(this, currBet);
        //记录翻牌玩家操作
        this.recordDrawBefore(playerInfo, currBet, type);

        playerInfo.state = "PS_NONE";
        // 通知
        this.channelIsPlayer('dz_onOpts', {
            type: type,
            seat: playerInfo.seat,
            uid: playerInfo.uid,
            currGold: playerInfo.canUserGold(),
            currBet: currBet, // 下注金额
            bet: playerInfo.bet, // 当前已经下注金额
            roomCurrSumBet: this.roomCurrSumBet,
        });
        this.nextStatus(playerInfo);
    }

    /**这里判断大家下注是否全部一样  如果一样就进行下一轮 */
    nextStatus(playerInfo: dzPlayer) {
        const list = this._players.filter(pl => pl && !pl.isFold && pl.status == 'GAME');
        const isPoker = list.every(pl => pl.canDeal(this.lastBetNum));//每个人下注
        // 如果都全下了 那么就直接发完 然后结算
        if (isPoker && list.filter(pl => pl.canUserGold() > 0).length <= 1) {
            // this.status = 'END';
            this.isquanxia = true;
            this.partPool();
            this.public_deal3();// 一次性发完公共牌
            return;
        }
        if (isPoker) {
            this.partPool();
            this.public_deal2();
            return;
        }
        // 下一个发话
        let next_id = this.nextIdx(playerInfo.seat);
        this.set_next_doing_seat(next_id);
    }



    /**发牌 补牌 */
    public_deal1() {
        const cards = this.publicCard.splice(0, dz_logic.getPaiCount(this.roundTimes));
        this.publicCards = this.publicCards.concat(cards);
        // 计算每个玩家的牌型
        this._players.filter(pl => pl && pl.holds != null).forEach(pl => {
            let poker = dz_logic.getCardsType(pl.holds.slice(), this.publicCards.slice());
            pl.cardType = poker;
            pl.type = poker.type;
        });
        //通知
        for (const pl of this._players) {
            if (!pl) continue;
            const member = this.channel.getMember(pl.uid);
            const opts: DZpipeiConst.Idz_onDeal2 = {
                publicCards: this.publicCards, // 发的牌
                roundTimes: this.roundTimes,// 当前轮数
                cardType: pl.cardType,
                isFold: pl.isFold,
                allPlayer: this._players.filter(pl => pl && pl.holds != null).map(pl => pl.robotStrip()),
            }
            if (pl.isRobot == 0) delete opts.allPlayer;
            member && MessageService.pushMessageByUids('dz_onDeal2', opts, member);
        }
        // 累加轮数
        ++this.roundTimes;
    }

    /**发公共牌 */
    public_deal2() {
        // 如果最后一轮了 就开始结算
        if (this.roundTimes >= 3) {
            return this.settlement();
        }
        // 清空每个玩家的下注数
        this._players.forEach(pl => pl && pl.resetBet());
        this.lastBetNum = 0;// 最后下注数量清空
        // 发牌
        this.public_deal1();
        // 获取小盲位置
        this.updateMinBlind();
        // 延迟后小盲发话
        // this.deal2Timeout = setTimeout(() => this.fahua(this.minBlindIdx), 2000);
        setTimeout(() => {
            // let next_id = this.nextIdx(this.minBlindIdx);
            this.set_next_doing_seat(this.minBlindIdx);
        }, 2000);
    }

    /**一次性发完剩余的 公共牌 然后结算 */
    public_deal3() {
        if (this.roundTimes >= 3) {
            return this.settlement();
        }
        // 发牌
        this.public_deal1();
        // 延迟后 继续发
        setTimeout(() => this.public_deal3(), 2000);
    }

    /**结算 */
    async settlement() {
        let list = this._players.filter(pl => pl && pl.status == 'GAME' && !pl.isFold);

        await utils.delay(1000);
        this.countAlikePoker();//计算玩家大小

        this.poolSettlement();//按底池结算

        //添加战绩
        for (const pl of list) {
            await pl.addMilitary(this);
        }
        //记录最后结果
        this.recordResult();
        for (const pl of this._players) {
            pl && await pl.only_update_game(this);
        }
        await utils.delay(800);
        // 延迟后通知某玩家赢了
        const results = list.map(pl => pl && pl.result(this));
        const opts: DZpipeiConst.Idz_onSettlement = {
            list: results,
        }
        this.channelIsPlayer('dz_onSettlement', opts);
        this.status = 'END';
        if (this._players.some(pl => pl && pl.isOnLine == true)) {
            await utils.delay(30 * 1000);
        }
        this.Initialization();
    }

    /**返回游戏 数据 */
    strip() {
        let zj_pl = this._players.find(pl => pl && pl.seat == this.zhuang_seat);
        return {
            nid: this.nid,
            sceneId: this.sceneId,
            roomId: this.roomId,
            players: this._players.map(pl => pl && pl.strip()),
            status: this.status,
            waitTime: this.getWaitTime(),
            fahuaIdx: this.curr_doing_seat,
            roomCurrSumBet: this.roomCurrSumBet,
            blindBet: this.blindBet,
            canCarryGold: this.canCarryGold,
            publicCard: this.publicCards,
            zhuang: zj_pl && { uid: zj_pl.uid, seat: zj_pl.seat }
        };
    }

    /**踢掉离线 */
    battle_kickNoOnline() {
        const offLinePlayers: dzPlayer[] = [];
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

    /**通知有玩家离开 */
    noticeExit(uid: string, seat: number, msg: string = '') {
        const opts = {
            uid: uid,
            seat: seat,
            msg,
            status: this.status,
            playerNum: this._players.filter(pl => pl).length
        }
        this.channelIsPlayer('dz_onExit', opts);
    }

    /**记录盲注情况 */
    recordBlindBet(playerInfo: dzPlayer) {
        let ob = {
            payerType: playerInfo.playerType,
            uid: playerInfo.uid,
            nickname: playerInfo.nickname,
            bet: playerInfo.bet,
            type: playerInfo.playerType
        }
        this.record_history.blindBet.push(ob);
    }

    /**记录翻牌前情况 */
    recordDrawBefore(playerInfo: dzPlayer, bet: number, type: string) {
        let ob = {
            payerType: playerInfo.playerType,
            uid: playerInfo.uid,
            nickname: playerInfo.nickname,
            bet: bet,
            type: type
        }
        if (this.publicCards.length == 0) {
            this.record_history.drawBefore.push(ob);
        } else if (this.publicCards.length == 3) {
            this.record_history.draw.push(ob);
        } else if (this.publicCards.length == 4) {
            this.record_history.turnPoker.push(ob);
        } else if (this.publicCards.length == 5) {
            this.record_history.riverPoker.push(ob);
        }
    }

    /**记录一局结果 */
    recordResult() {
        this.record_history.info = this._players.map(pl => {
            if (pl) {
                let arr: number[] = [];
                arr.push(...pl.holds);
                arr.push(...this.publicCards);
                return {
                    playerType: pl.playerType,
                    tatalBet: pl.tatalBet,
                    profit: pl.profit,
                    holds: arr,
                    type: pl.type,
                    nickname: pl.nickname,
                    uid: pl.uid,
                    isFold: pl.isFold
                }
            }
        })
    }

    /**计算牌型 typeSize赋值 */
    countAlikePoker() {
        for (const pl of this._players) {
            if (!pl) continue
            if (pl.isFold) {
                pl.type = -1;
                pl.typeSize = -1;
            } else {
                let cards = (pl.holds.length != 0 && pl.holds) ? pl.holds : null;
                if (cards)
                    pl.typeSize = dz_logic.sortPokerToType(pl.cardType.cards.slice());
            }
        }
    }

    /**记录一次 池子 */
    partPool() {
        do {
            let pool: DZpipeiConst.pool_interface = { bet: 0, uids: [] };
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

        // console.warn('当前底池', this.roomId, this.pool_List.map(m => {
        //     return { bet: m.bet, uids: JSON.stringify(m.uids) };
        // }));
    }

    /**按底池结算 */
    poolSettlement() {
        for (const pool of this.pool_List) {
            let uids = pool.uids.sort((c1, c2) => {
                let pl1 = this._players.find(c => c && c.uid == c1.uid);
                c1.typeSize = pl1.typeSize;

                let pl2 = this._players.find(c => c && c.uid == c2.uid);
                c2.typeSize = pl2.typeSize;

                return c2.typeSize - c1.typeSize;
            });
            let pls = uids.filter(c => c.typeSize == uids[0].typeSize);
            for (const pl of pls) {
                let playerInfo = this._players.find(c => c && c.uid == pl.uid);
                playerInfo.profit += Math.floor(pool.bet / pls.length);
            }
            // console.warn(`uid:${playerInfo.nickname}|${playerInfo.profit}`);
        }
        // this._players.some(pl => pl && pl.isRobot == 0) && console.warn('当前底池', this.roomId, this.pool_List.map(m => {
        //     return { bet: m.bet, uids: JSON.stringify(m.uids) };
        // }));
    }

    /**获取其他玩家手牌 */
    getPlayerHolds() {
        return this._players.filter(m => m && m.holds != null).map(m => m.stripHolds());
    }

    /**断线重连获取数据 */
    getOffLineData(playerInfo: dzPlayer) {
        let data = {
            onFahua: this._players[this.curr_doing_seat] ? this.stripSpeak(this._players[this.curr_doing_seat]) : null,
            onLine: playerInfo.onLine,
            selfHolds: playerInfo.stripSelfPoker()
        }

        if (this.isquanxia) data['otherHolds'] = this.getPlayerHolds()
        return data;
    }

    /**服务器关闭通知 */
    serverNotice() {
        //如果房间处于关闭中
        if (this.status == 'NONE') {
            Logger.info(`服务器即将维护，踢掉玩家`);
        }
    }

    sortResult(publicCards: any[]) {
        publicCards.sort((a, b) => {
            let a_ = this.sortPlyaerCard(a);
            let b_ = this.sortPlyaerCard(b);
            return a_ - b_;
        });
    }

    /**给玩家和机器人的的牌排序 */
    sortPlyaerCard(result) {
        let { cards, type } = dz_logic.getCardsType(result.selfCard.slice(), result.publicCard.slice());
        const cardSize = dz_logic.sortPokerToType(cards.slice());
        result.cardSize = cardSize;
        return cardSize
    }

    /**找出最大位置的牌 */
    getMaxSeatCard(publicCard: number[]) {
        const allCard = [];
        this._players.filter(x => x && x.holds != null).forEach(m => {
            const cardObj = { uid: null, seat: null, isRobot: null, cards: null, holds: null, publicCard: null, cardSize: null };
            let { cards, type } = dz_logic.getCardsType(m.holds.slice(), publicCard.slice());
            const cardSize = dz_logic.sortPokerToType(cards.slice());
            cardObj.uid = m.uid;
            cardObj.seat = m.seat;
            cardObj.isRobot = m.isRobot;
            cardObj.cards = cards;//手牌和公牌组合的最优牌型
            cardObj.holds = m.holds;//玩家的手牌
            cardObj.publicCard = publicCard;//公牌
            cardObj.cardSize = cardSize;//牌型大小
            allCard.push(cardObj);
        });
        allCard.sort((a, b) => {
            return a.cardSize - b.cardSize;
        });
        return allCard;
    }

    /**跑马灯 */
    addNote(player: dzPlayer, num: number) {
        if (num >= dzpipeiConst.FAN_JIANG * this.blindBet[0]) {
            //播放跑马灯
            MessageService.sendBigWinNotice(this.nid, player.nickname, num, player.isRobot, player.headurl);
        }
    }

    /**
     * 机器人所需的游戏信息
     */
    stripRobotNeed() {
        if (this.status !== 'INGAME') {
            return [];
        }
        const inGamePlayers = this._players.filter(m => m && m.status == 'GAME');
        return inGamePlayers.map(m => m && m.stripRobotNeed());
    }

    /**
     * 随机发牌
     */
    randomDeal() {
        // 设置公牌
        this.setPublicCards(this.TheCards.splice(utils.random(0, this.TheCards.length - 6), 5));
        // 给每个人发两张手牌 顺便扣除前注
        this.gamePlayers.forEach(player => {
            let card = this.TheCards.splice(utils.random(0, this.TheCards.length - 3), 2);
            this.setPlayerHolds(player, card);
        });
    }

    /**
     * 个控发牌
     * @param positivePlayers 正调控玩家 让他赢的
     * @param negativePlayers 负调控的玩家  让他输
     */
    personalControlDeal(positivePlayers: PersonalControlPlayer[], negativePlayers: PersonalControlPlayer[]) {
        // 获取调控的牌模型
        const model = getCardsModel();

        positivePlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));
        negativePlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));

        // 设置公牌
        const publicCards = selectPublicCards(this.TheCards, model);
        this.setPublicCards(publicCards);
        // 从手
        deleteHolds(this.TheCards, publicCards);

        let gamePlayers = this.gamePlayers;

        // 获取玩家人数的牌
        const cards = selectPlayersCards(this.TheCards, model, publicCards, gamePlayers.length);

        // 过滤出机器人
        const robotPlayers = gamePlayers.filter(p => p.isRobot === RoleEnum.ROBOT);


        // 如果这个有正调控的玩家 则正面调控的玩家获得最大的牌
        let luckPlayer;
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

        console.warn(`德州个控 调控牌型:${model}, 公牌:${publicCards}, 幸运玩家:${luckPlayer.uid}, 第一幅手牌: ${cards[0]}, 第二幅:${cards[1]}`)
        // 给调控玩家或机器人发最大的牌
        this.setPlayerHolds(luckPlayer, cards.shift());

        // 默认赢家
        this.default = luckPlayer.uid;


        // 过滤掉该玩家
        gamePlayers = gamePlayers.filter(player => player.uid !== luckPlayer.uid);

        // 如果有负调控的玩家
        if (negativePlayers.length) {
            // 打乱随机发牌
            negativePlayers.sort((a, b) => Math.random() - 0.5);
            negativePlayers.forEach(p => {
                const pl = gamePlayers.find(player => player.uid === p.uid);
                const card = cards.shift();
                this.setPlayerHolds(pl, card);
                // 过滤掉该玩家
                gamePlayers = gamePlayers.filter(player => player.uid !== p.uid);
            });
        }

        // 剩余的玩家随机发
        gamePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
            cards.sort((a, b) => Math.random() - 0.5);
            // 从尾部去小牌
            this.setPlayerHolds(p, cards.pop());
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

        // 获取调控的牌模型
        const model = getCardsModel();

        // 设置公牌
        const publicCards = selectPublicCards(this.TheCards, model);
        this.setPublicCards(publicCards);
        // 从牌组中删除公牌
        deleteHolds(this.TheCards, publicCards);

        let gamePlayers = this.gamePlayers;

        // 获取玩家人数的牌
        const cards = selectPlayersCards(this.TheCards, model, publicCards, gamePlayers.length);

        // 降序排序
        // this.sortCards(cards);


        // 如果系统赢则取一个机器人发最大的牌 其他随机发
        // 反之如果玩家赢则取一个玩家发最大的牌 其他随机发
        const winnerType = sceneControlState === ControlState.SYSTEM_WIN ? RoleEnum.ROBOT : RoleEnum.REAL_PLAYER;
        const possibleWinPlayers = gamePlayers.filter(p => p.isRobot === winnerType);
        possibleWinPlayers.sort((a, b) => Math.random() - 0.5);
        const winPlayer = possibleWinPlayers.shift();

        console.warn(`德州场控 调控牌型:${model}, 公牌:${publicCards}, 幸运玩家:${winPlayer.uid}, 第一幅手牌: ${cards[0]}, 第二幅:${cards[1]}`)


        // 发牌
        this.setPlayerHolds(winPlayer, cards.shift());
        // 默认赢家
        this.default = winPlayer.uid;

        // 过滤掉那个发牌的玩家
        gamePlayers = gamePlayers.filter(p => p.uid !== winPlayer.uid);
        // 剩余的玩家随机发
        gamePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
            cards.sort((a, b) => Math.random() - 0.5);
            // 从尾部去小牌
            this.setPlayerHolds(p, cards.pop());
        });
    }

    /**
     * 设置玩家手牌
     * @param player
     * @param cards
     */
    setPlayerHolds(player: dzPlayer, cards: number[]) {
        player.initGame(cards);
        // 扣前注
        player.execBet(this, this.ante);
    }

    /**
     * 对玩家的几副牌进行降序排序
     * @param cards
     */
    sortCards(cards: number[][]) {
        cards.sort((a, b) => {
            return this.getCardNumber(b) - this.getCardNumber(a);
        });
    }

    /**
     * 获取牌的牌值
     * @param card
     */
    getCardNumber(card: number[]) {
        let { cards } = dz_logic.getCardsType(card.slice(), this.publicCardToSort.slice());
        return dz_logic.sortPokerToType(cards.slice());
    }

    /**
     * 获取几幅手牌
     * @param len
     */
    getCards(len: number) {
        const cards: number[][] = [];
        for (let i = 0; i < len; i++) {
            cards.push(this.TheCards.splice(utils.random(0, this.TheCards.length - 3), 2));
        }

        return cards;
    }

    /**
     * 设置公牌
     * @param cards
     */
    setPublicCards(cards: number[]) {
        //先初始化好公牌
        this.publicCard = cards;
        //将初始化好的公牌加入到不会变的数组里面
        this.publicCardToSort = this.publicCardToSort.concat(this.publicCard);
    };
    /**
     * 获取一开始组合好的牌力值组合
     */
    getDescSortAllPlayer() {
        return this.descSortAllPlayer;
    };
}


