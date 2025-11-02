import { pinus } from 'pinus';
import MessageService = require('../../../services/MessageService');
import utils = require('../../../utils/index');
import hallConst = require('../../../consts/hallConst');
import land_Logic = require("./land_Logic");
import landPlayer from './landPlayer';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import { interface_land, Irecord_history, CardsType, Iddz_onPostCard, Iddz_chunTian, Iddz_onFahua, IoffLine, Iddz_mingCard } from "./land_interface";
import * as land_interface from "./land_interface";
import { buildRecordResult } from "./util/recordUtil";
import { RoleEnum } from '../../../common/constant/player/RoleEnum';
import roomManager, { LanRoomManger } from '../lib/landMgr';
/**等待准备时间 */
const WAIT_TIME = 3000;
/**发话时间 */
const FAHUA_TIME = 15000;

/**
 * 游戏房间
 * @property endTime 回合结束时间
 * @property zipResult 压缩结果
 */
export default class landRoom extends SystemRoom<landPlayer> {
    entryCond: number;
    /**底注 */
    lowBet: number;
    maxRound: number;
    /**状态 INWAIT.等待 CPoints 叫份 INGAME.游戏中 END.回合结束 */
    status: "NONE" | "INWAIT" | "CPoints" | "DOUBLE" | "INGAME" | "END" = "INWAIT";
    /**当前发话的人 */
    curr_doing_seat: number = -1;
    /**上次赢得玩家 */
    lastWinIdx: number = -1;
    /**记录开始等待时候的时间 */
    lastWaitTime: number = 0;
    /**记录开始发话时候的时间 */
    lastFahuaTime: number = 0;
    /** 最大赢钱 */
    bigwins: any[] = [];
    /**托管出牌定时器 */
    tuoguanTime: NodeJS.Timer = null;
    /**自动操作倒计时 */
    auto_delay = 0;
    /**一局的历史记录 */
    record_history: Irecord_history = { oper: [], info: [] };

    land_seat: number = -1;
    /**抢分 */
    points: number = 0;
    /**三张公牌 */
    publicCards: number[] = [];

    /**抢地主后的底分= lowBet*叫分*/
    lowFen: number = 0;
    /**总倍数 */
    totalBei: number = 0;
    /**农民倍数和 */
    Farmer_totalBei = 0;
    waitTimeout: NodeJS.Timer = null;
    /**自动操作 */
    Oper_timeout: NodeJS.Timer = null;
    /**玩家列表 */
    players: landPlayer[] = new Array(3).fill(null);
    /**记录上个玩家出牌 */
    lastDealPlayer: interface_land;
    /**开始一局游戏的时间 */
    startGameTime: number = 0;
    endTime: number;
    zipResult: string = '';


    constructor(opts: any) {
        super(opts);
        this.entryCond = opts.entryCond || 0; // 进入条件
        this.lowBet = opts.lowBet || 50; // 底注
        this.lowFen = this.lowBet; // 底分
        this.maxRound = opts.maxRound || 20; // 最大回合次数 --- 暂没用
        this.lastDealPlayer = {
            seat: -1,
            cards: [],
            cardType: null,
            cards_len: null
        }; //上个玩家出的牌
        this.Initialization();
    }
    close() {
        this.sendRoomCloseMessage();
        this.players = [];
    }
    Initialization() {
        this.curr_doing_seat = -1; // 当前发话的人
        this.lastFahuaTime = 0;
        this.record_history = { oper: [], info: [] };
        this.land_seat = -1;
        this.points = 0;
        this.publicCards = [];
        this.lastDealPlayer = {
            seat: -1,
            cards: [],
            cardType: null,
            cards_len: null
        };
        this.lowFen = this.lowBet;
        this.totalBei = 1; //总倍数
        this.Farmer_totalBei = 0;
        this.startGameTime = 0;
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
        this.players[i] = new landPlayer(i, dbplayer);
        // 添加到消息通道
        this.addMessage(dbplayer);
        return true;
    }

    /**断线恢复 */
    async offLineRecover(playerInfo: landPlayer) {
        // 把玩家状态设置为在线 托管状态设置为取消托管
        playerInfo.onLine = true;
        playerInfo.trusteeshipType = 1;

        // 添加到消息通道
        this.addMessage(playerInfo);

        // 发送取消托管
        if (this.curr_doing_seat == playerInfo.seat) {
            clearTimeout(this.tuoguanTime);
        }

        this.channelIsPlayer('ddz_tuoguan', {
            seat: playerInfo.seat,
            trusteeshipType: 1
        });
    }

    /**
     * 有玩家离开 isOffLine代表是否断线 断线则不删除玩家
     * @param player 
     * @param isOffLine true是离线
     */
    leave(playerInfo: landPlayer, isOffLine: boolean) {
        /**先踢出玩家通道 */
        this.kickOutMessage(playerInfo.uid);
        if (isOffLine) {
            playerInfo.onLine = false;
            if (this.curr_doing_seat !== playerInfo.seat && this.status == "INGAME") {
                playerInfo.trusteeshipType = 2;
                this.channelIsPlayer('ddz_tuoguan', {
                    seat: playerInfo.seat,
                    trusteeshipType: playerInfo.isRobot == 2 ? 1 : playerInfo.trusteeshipType
                });
            }
            return;
        }

        this.players[playerInfo.seat] = null;
        if (this.lastWinIdx === playerInfo.seat) {
            this.lastWinIdx = -1; // 上次赢得玩家走了就改成-1
        }
        this.channelIsPlayer('ddz_onExit', { uid: playerInfo.uid, seat: playerInfo.seat });
        roomManager.removePlayerSeat(playerInfo.uid);
    }

    /**获取等待状态的时间 */
    getWaitTime() {
        if (this.status == "CPoints")
            return Math.max(FAHUA_TIME - (Date.now() - this.lastFahuaTime), 0);
        if (this.status == "INGAME") {
            return Math.max(FAHUA_TIME - (Date.now() - this.lastFahuaTime), 0);
        }
        return 0;
    }

    /**等待玩家准备 */
    wait(playerInfo?: landPlayer) {
        if (this.status != "INWAIT")
            return;
        if (this.players.filter(pl => pl && pl.status == 'WAIT').length <= 1) {
            this.channelIsPlayer('land_onWait', { waitTime: 0 });
            return;
        }
        // 通知 所有人开始准备 5s内就不重复通知玩家
        if (Date.now() - this.lastWaitTime < WAIT_TIME) {
            const member = playerInfo && this.channel.getMember(playerInfo.uid);
            if (member) {
                let waitTime = Math.max(WAIT_TIME - (Date.now() - this.lastWaitTime), 0);
                MessageService.pushMessageByUids(`land_onWait`, { waitTime }, member);
            }
            return;
        }

        this.channelIsPlayer('land_onWait', { waitTime: WAIT_TIME });

        // 最后一次通知玩家准备的时间
        this.lastWaitTime = Date.now();

        // 等一段时间后强行开始发牌
        clearTimeout(this.waitTimeout);
        this.waitTimeout = setTimeout(() => {
            const list = this.players.filter(pl => pl);
            if (list.length >= 3) {
                this.handler_start(list);
            } else {
                this.channelIsPlayer('land_onWait', { waitTime: 0 });
            }
        }, WAIT_TIME);
    }

    /**发牌 */
    async handler_start(list: landPlayer[]) {
        this.status = "CPoints"; // 开始新的一轮游戏
        clearTimeout(this.waitTimeout);

        // 洗牌 先给真人发小牌，再给机器人发大牌
        let data = land_Logic.cardDataSort();
        this.publicCards = data.publicCards;
        for (const pl of list) {
            if (pl.isRobot == RoleEnum.REAL_PLAYER) {
                let cards = data.cardData.shift();
                pl.initGame(cards.cards);
            }
        }
        for (const pl of list) {
            if (pl.isRobot != RoleEnum.REAL_PLAYER) {
                let cards = data.cardData.shift();
                pl.initGame(cards.cards);
            }
        }

        // 发牌的时候记录牌局信息
        // this.inningHistory = this.players.filter(m => m && m.status == "GAME");

        // 通知 玩家说话
        for (const pl of this.players) {
            const member = pl && this.channel.getMember(pl.uid);
            const opts = pl && pl.wrapGame();
            member && MessageService.pushMessageByUids('ddz_onDeal', opts, member);
        }

        // 上次赢得玩家进行发话 延迟前端的发牌动作
        await utils.delay(list.length * 500 + 2000);
        this.set_next_doing_seat(this.nextFahuaIdx());
        return Promise.resolve();
    }

    /**发话 */
    async set_next_doing_seat(doing: number) {
        const playerInfo = this.players[doing];
        this.curr_doing_seat = doing;
        playerInfo.state = "PS_OPER";

        this.lastFahuaTime = Date.now();

        this.auto_delay = FAHUA_TIME;
        if (this.status == "INGAME" && this.tishi(playerInfo).length == 0) {
            this.auto_delay = 5000;
        }
        // 通知玩家说话
        for (const pl of this.players) {
            const member = pl && this.channel.getMember(pl.uid);
            const opts: Iddz_onFahua = this.stripSpeak(pl);
            member && MessageService.pushMessageByUids('ddz_onFahua', opts, member);
        }
        this.handler_pass();
        // 玩家掉线，视为托管  时间到了 视为托管 下一位继续发话
        if (!playerInfo.onLine || playerInfo.trusteeshipType == 2) {
            this.handler_play(playerInfo, 2);
        }
    }

    /**
     * 掉线托管 抢庄逻辑 入口
     * @param currPlayer 
     * @param tuoType 1取消托管 2托管模式
     */
    async handler_play(playerInfo: landPlayer, tuoType: number) {
        /**抢庄阶段 */
        if (this.status == "CPoints") {
            return playerInfo.handler_ShoutPoints(this, 0);
        }
        let last_pkg = this.lastDealPlayer.seat == playerInfo.seat ? [] : this.lastDealPlayer.cards;
        let tishi = land_Logic.chaipai(playerInfo.cardList, last_pkg);
        let cards = tishi.length > 0 ? tishi[0].cards : [];
        let cardType = tishi.length > 0 ? tishi[0].type : land_Logic.CardsType.CHECK_CALL;
        if (tuoType === 1) {
            playerInfo.handler_postCards(cards, cardType, this);
        }
        else {
            clearTimeout(this.tuoguanTime);
            this.tuoguanTime = setTimeout(() => {
                playerInfo.handler_postCards(cards, cardType, this);
            }, 1000);
        }
    }

    /**包装说话数据 */
    stripSpeak(playerInfo: landPlayer) {
        const opts: Iddz_onFahua = {
            status: this.status,
            curr_doing_seat: this.curr_doing_seat,
            curr_doing_uid: this.players[this.curr_doing_seat].uid,
            betNum: this.lowBet, // 底分
            /**自己显示5秒,其他人显示15秒 */
            countdown: this.curr_doing_seat == playerInfo.seat ? Math.max(this.auto_delay - (Date.now() - this.lastFahuaTime), 0) : this.getWaitTime(),
            fen: this.points,
            isRobotData: playerInfo.isRobot === 2 ? playerInfo.cardList : null,
            lastDealPlayer: this.lastDealPlayer,
            notices: this.curr_doing_seat == playerInfo.seat ? this.tishi(playerInfo) : [],
        }
        return opts;
    }

    /**
     * 提示
     * @param shoupai 手牌 1-54
     */
    tishi(currPlayer: landPlayer) {
        if (this.status == "CPoints") {
            return [];
        }
        let last_pkg = this.lastDealPlayer.seat == currPlayer.seat ? [] : this.lastDealPlayer.cards;
        let tishiArr = land_Logic.chaipai(currPlayer.cardList, last_pkg);
        return tishiArr
    }

    /***抢地主 计算倍数 设置地主 发牌 */
    gameStart() {
        this.status = "DOUBLE";
        let land_pl = this.players[this.land_seat];
        // 构建压缩记录 必须在添加地主牌前构建
        this.players.forEach(pl => pl && pl.robDeal(this.land_seat));
        this.zipResult = buildRecordResult(this.players, this.publicCards);
        land_pl.cards.push(...this.publicCards)
        land_pl.cards = land_Logic.sort_CardList(land_pl.cards);
        land_pl.cardList = land_pl.cards.slice();
        this.lowFen = this.points * this.lowBet;


        for (const pl of this.players) {
            let opts: land_interface.Iland_qiang = {
                land_seat: this.land_seat,
                uid: land_pl.uid,
                fen: this.points,
                publicCards: this.publicCards,
                lowFen: this.lowFen,
                JiPaiQi: this.getJiPaiQi(pl.uid),
                countdown: 5000
            }
            const member = pl && this.channel.getMember(pl.uid);
            member && MessageService.pushMessageByUids('land_qiang', opts, member);
            if (pl.seat != this.land_seat) {
                pl.state = "PS_OPER";
            }
        }
        // 代表开始游戏了
        this.startGameTime = Date.now();
        this.lastDealPlayer.seat = this.land_seat;

        this.waitTimeout = setTimeout(() => {
            for (const pl of this.players) {
                if (pl.seat == this.land_seat || pl.state == "PS_NONE") continue;
                pl.handler_Double(this, 1);
            }
        }, 5000);
    }



    /**通知玩家倍数 */
    note_pls() {
        let opts: { uid: string, seat: number, totalBei: number }[] = [];
        for (const pl of this.players) {
            if (!pl) continue;
            let opt = { uid: pl.uid, seat: pl.seat, totalBei: this.totalBei * pl.isDOUBLE };
            if (pl.seat == this.land_seat) {
                opt.totalBei = opt.totalBei * (this.Farmer_totalBei > 0 ? this.Farmer_totalBei : 1);
            }
            opts.push(opt);
        }
        this.channelIsPlayer("land_note_pls", opts);
    }

    /**
     * 整理手牌 推送出牌情况
     * @param cardType 手牌类型
     * @param postCardList 手牌
     * @param playerInfo 玩家
     */
    onPostCard(cardType: land_Logic.CardsType, postCardList: number[], playerInfo: landPlayer) {
        this.record_history.oper.push({ uid: playerInfo.uid, oper_type: "onPostCard", update_time: utils.cDate(), msg: `${postCardList.toString()}` });
        clearTimeout(this.tuoguanTime);
        clearTimeout(this.Oper_timeout);
        playerInfo.state = "PS_NONE";

        for (const pl of this.players) {
            let opts: Iddz_onPostCard = {
                cardType: cardType,
                seat: playerInfo.seat,
                postCardList: postCardList,
                mingCardPlayer: this.players.filter(pl => pl.isMing).map(pl => {
                    return {
                        uid: pl.uid,
                        seat: pl.seat,
                        cards: pl.cardList
                    }
                }),
                cards: pl.uid == playerInfo.uid ? land_Logic.sort_CardList(playerInfo.cardList) : [],
                cards_len: playerInfo.cardList.length,
                JiPaiQi: this.getJiPaiQi(pl.uid)
            }
            const member = pl && this.channel.getMember(pl.uid);
            member && MessageService.pushMessageByUids('ddz_onPostCard', opts, member);
        }
        this.note_pls();
        this.nextStatus(playerInfo);
    }

    async nextStatus(playerInfo: landPlayer) {
        await utils.delay(100);
        if (playerInfo.cardList.length == 0) {
            this.settlement(playerInfo.seat);
        } else {
            this.set_next_doing_seat(this.nextFahuaIdx());
        }
    }

    /**结算 本回合 先停掉房间 */
    async settlement(winSeat: number) {
        clearTimeout(this.Oper_timeout);
        clearTimeout(this.waitTimeout);
        clearTimeout(this.tuoguanTime);
        // clearTimeout(this.fahuaTimer);
        // clearTimeout(this.flowTime);

        this.channelIsPlayer('ddz_liangpai', {
            cardLists: this.players.filter(pl => !!pl).map(pl => {
                return { seat: pl.seat, cardlist: pl.cardList }
            }),
        });


        let wtime = 800;
        // 判断是否是春天
        let chuntian = this.isChunTian(winSeat);
        if (chuntian) {
            wtime = 2000;
            this.totalBei = this.totalBei * 2;
            let opts: Iddz_chunTian = {
                type: chuntian,
                totalBei: this.totalBei
            }
            this.channelIsPlayer('ddz_chunTian', opts);
        }
        /**本局带入多少游戏币,本局最多输赢多少游戏币 */
        if (winSeat == this.land_seat) {
            let totalWin = 0;
            for (const pl of this.players) {
                if (pl.seat == this.land_seat)
                    continue;
                totalWin += pl.isDOUBLE * this.lowFen * this.totalBei;
            }

            let diff = totalWin - this.players[this.land_seat].gold;
            if (diff > 0) {
                totalWin = totalWin - diff;
            }
            for (const pl of this.players) {
                if (pl.seat == winSeat) continue;
                pl.profit = -totalWin / 2;
                let diff_pl = totalWin / 2 - pl.gold;
                if (diff_pl > 0) {
                    pl.profit = -pl.gold;
                    totalWin -= diff_pl;
                }
            }
            this.players[this.land_seat].profit = totalWin;
        } else {
            let totalWin = 0;
            for (const pl of this.players) {
                if (pl.seat == this.land_seat) continue;
                pl.profit = this.lowFen * this.totalBei * pl.isDOUBLE;
                let diff_pl = pl.profit - pl.gold;
                if (diff_pl > 0) {
                    pl.profit = diff_pl;
                }
                totalWin += pl.profit;
            }
            let diff = totalWin - this.players[this.land_seat].gold;
            if (diff > 0) {
                let totalWin_temp = totalWin;
                totalWin = totalWin - diff;
                let pls = this.players.filter(pl => pl.seat != this.land_seat);
                for (const pll of pls) {
                    pll.profit = (pll.profit / totalWin_temp) * totalWin;
                }
            }
            this.players[this.land_seat].profit = - totalWin;
        }
        this.lastWinIdx = winSeat;
        this.endTime = Date.now();
        // 金币结算
        await Promise.all(this.players.map(async (pl) => await pl.updateGold(this)));
        await utils.delay(wtime);
        const opts: land_interface.Iland_onSettlement = {
            land_seat: this.land_seat,
            winSeat: winSeat,
            entryCond: this.entryCond,
            list: this.players.map(pl => {
                let opt = {
                    uid: pl.uid,
                    seat: pl.seat,
                    profit: pl.profit,
                    gold: pl.gold,
                    nickname: encodeURI(pl.nickname),
                    lowFen: this.lowFen,
                    totalBei: this.totalBei * pl.isDOUBLE
                }
                if (pl.seat == this.land_seat) {
                    opt.totalBei = opt.totalBei * (this.Farmer_totalBei > 0 ? this.Farmer_totalBei : 1);
                }
                return opt;
            })
        };
        this.channelIsPlayer('land_onSettlement', opts);
        this.record_history.info = opts.list;
        for (const pl of this.players) {
            pl && await pl.only_update_game(this);
        }
        this.status = "END";
        this.Initialization();
    }

    /**0 啥也不是 1 春天 2 反春天 */
    isChunTian(winSeat: number) {
        /**农民出牌次数为0 则为春天 */
        if (this.land_seat == winSeat && this.players[this.land_seat].postCardNum >= 1) {
            const sum = this.players.filter(pl => pl.seat != this.land_seat).reduce((total, Value) => total + Value.postCardNum, 0);
            return sum == 0 ? 1 : 0;
        }
        /**斗地主出牌次数为1 且 输掉了 为 反春天 */
        if (winSeat != this.land_seat && this.players[this.land_seat].postCardNum == 1) {
            return 2;
        }
        return 0;
    }

    canReady(uid: string) {
        let member = this.channel.getMember(uid);
        member && MessageService.pushMessageByUids('ddz_onCanReady', {}, member);
    }

    /**重置发话时间 如果时间到了 就直接跳到下一个发话 */
    handler_pass() {
        clearTimeout(this.Oper_timeout);
        this.Oper_timeout = setTimeout(() => {
            let playerInfo = this.players[this.curr_doing_seat];
            playerInfo.trusteeshipType = 2;
            this.channelIsPlayer('ddz_tuoguan', {
                seat: this.players[this.curr_doing_seat].seat,
                trusteeshipType: playerInfo.isRobot == 2 ? 1 : playerInfo.trusteeshipType
            });
            this.handler_play(this.players[this.curr_doing_seat], 1);

            console.warn(this.roundId, this.auto_delay, playerInfo.uid, utils.cDate());
        }, this.auto_delay);
    }

    /**下一个玩家 找不到玩家返回-1 */
    nextFahuaIdx() {
        do {
            let curr_doing_seat = this.curr_doing_seat;
            if (curr_doing_seat == -1) {
                curr_doing_seat = utils.random(0, 2);
            }
            let idx = curr_doing_seat + 1;
            if (idx >= this.players.length) {
                idx = 0;
            }
            return idx;
        } while (true);
    }

    strip() {
        return {
            nid: this.nid,
            sceneId: this.sceneId,
            roomId: this.roomId,
            players: this.players.map(pl => pl && pl.strip()),
            status: this.status,
            lastWinIdx: this.lastWinIdx,        // 上次赢的玩家
            curr_doing_seat: this.curr_doing_seat,
            lowFen: this.lowFen,
            lowBet: this.lowBet
        };
    }

    /**踢掉离线玩家 */
    battle_kickNoOnline() {
        const offLinePlayers: landPlayer[] = [];
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

    /**记牌器 */
    getJiPaiQi(uid: string) {
        let fillCards: number[] = [0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1];
        for (const pl of this.players) {
            let cards = land_Logic.delCardList(pl.cards.map(m => m), pl.cardList.map(m => m));
            if (pl.uid == uid) {
                cards = pl.cards.map(c => c);
            }
            for (const card of cards) {
                fillCards[land_Logic.getCardValue(card)]--;
            }
        }
        return fillCards;
    }

    /**断线重连获取数据 */
    getOffLineData(playerInfo: landPlayer) {
        let arr: { seat: number, len: number, trusteeshipType: number }[] = []
        let mingCardPlayer: Iddz_mingCard[] = [];
        for (const pl of this.players) {
            if (!!pl) {
                arr.push({
                    seat: pl.seat,
                    len: pl.cardList.length,
                    trusteeshipType: pl.trusteeshipType
                });
                if (pl.isMing) {
                    mingCardPlayer.push({ uid: pl.uid, seat: pl.seat, cards: pl.cardList });
                }
            }
        }

        const opts: IoffLine = {
            overCards: playerInfo.cardList,                 // 剩余手牌
            publicCards: this.publicCards,                        // 底牌
            shoupaiLen: arr,                            // 三家手牌长度
            curr_doing_seat: this.curr_doing_seat,            // 发话ID
            land_seat: this.land_seat,                      // 地主id
            status: this.status,
            lastDealPlayer: this.lastDealPlayer,
            mingCardPlayer: mingCardPlayer,
            jiaofen: {
                points: this.points,
                seat: this.land_seat
            },
            notices: this.tishi(playerInfo),       // 提示
            countdown: this.getWaitTime(),
            JiPaiQi: this.status != "INWAIT" ? this.getJiPaiQi(playerInfo.uid) : []
        }
        return opts;
    }
}

