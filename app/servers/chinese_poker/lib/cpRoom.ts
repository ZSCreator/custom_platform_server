import MessageService = require('../../../services/MessageService');
import utils = require('../../../utils/index');
import GameUtil = require('../../../utils/GameUtil');
import cp_logic = require('./cp_logic');
import GameUtil3 = require('./gameUtil3');
import cpPlayer from './cpPlayer';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import { PersonalControlPlayer } from "../../../services/newControl"
import Control from "./control";
import { pinus } from 'pinus';
import { buildRecordResult } from "./util/recordUtil";
import { ControlKinds, ControlState } from "../../../services/newControl/constants";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import roomManager, { cpRoomManger } from '../lib/chinese_pokerMgr';
/**等待准备时间 */
const WAIT_TIME = 5000;
/**配置时间 */
const configuration_TIME = 30 * 1000;

/**
 * chinese-poker - 游戏房间
 * @property cardsNumber 房间发几幅牌
 * @property specialCardProbability 出现特殊牌概率
 * @property run_Players 游戏中的玩家
 * @property control 调控逻辑
 * @property startTime 回合开始时间
 * @property endTime 回合结束时间
 * @property zipResult 压缩结果
 */
export default class cpRoom extends SystemRoom<cpPlayer> {
    entryCond: number;
    /**状态 NONE INWAIT.等待 INGAME.游戏中 END.回合结束 */
    status: 'NONE' | 'INWAIT' | 'INGAME' | 'END' = 'NONE';
    /**最后一次准备的时间 */
    lastWaitTime: number = null;
    /**发牌时间 */
    lastFahuaTime: number = null;
    /**结算时间 */
    lastSettlementTime: number = null;
    /**初始化1副牌 */
    initPais: number[] = [];
    lowBet: number;
    /**配置牌倒计时 */
    configurationTimeout: NodeJS.Timer = null;
    /**一局的历史记录 */
    record_history: any[] = [];
    // nextTimeout: NodeJS.Timer = null;
    waitTimeout: NodeJS.Timer = null;
    settTimeout: NodeJS.Timer = null;
    players: cpPlayer[] = new Array(4).fill(null);// 玩家列表
    backendServerId: string;

    cardsNumber: number = 4;
    specialCardProbability: number = 0.06;
    run_Players: cpPlayer[] = [];
    control: Control;

    startTime: number;
    endTime: number;
    zipResult: string = '';

    constructor(opts: any) {
        super(opts);
        this.backendServerId = pinus.app.getServerId();
        this.entryCond = opts.entryCond || 0; // 进入条件
        this.lowBet = opts.lowBet || 100;// 底注
        this.control = new Control({ room: this });
        this.Initialization();
    }
    close() {
        this.sendRoomCloseMessage();
        this.players = [];
    }
    /**初始化房间信息 */
    Initialization() {
        this.record_history = []; //一局的历史记录
        this.run_Players = [];
        //踢掉离线玩家
        this.battle_kickNoOnline();
        this.status = 'INWAIT';// 等待玩家准备
        this.updateRoundId();
    }

    /**添加一个玩家 */
    addPlayerInRoom(dbplayer) {
        let playerInfo = this.getPlayer(dbplayer.uid);
        if (playerInfo) {
            playerInfo.sid = dbplayer.sid;
            this.offLineRecover(playerInfo);
            return true;
        }
        if (this.isFull()) return false;
        const idxs = [];
        this.players.forEach((m, i) => !m && idxs.push(i));//空位置压入数组
        // 数组中随机一个位置
        const i = idxs[utils.random(0, idxs.length - 1)];
        this.players[i] = new cpPlayer(i, dbplayer);
        // 添加到消息通道
        this.addMessage(dbplayer);
        return true;
    }

    /**
     * 
     * @param playerInfo 
     * @param isOffLine true 离线
     */
    leave(playerInfo: cpPlayer, isOffLine: boolean) {
        this.kickOutMessage(playerInfo.uid);
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        if (this.status != 'INGAME' || playerInfo.status != 'GAME') {//玩家没有准备
            this.players[playerInfo.seat] = null;
            // 通知其他玩家有人退出
            this.channelIsPlayer('poker_onExit',
                {
                    uid: playerInfo.uid, seat: playerInfo.seat,
                    playerNum: this.players.filter(m => m !== null).length
                });
        }
        roomManager.removePlayerSeat(playerInfo.uid);
    }

    /**获取等待状态的时间 */
    getWaitTime() {
        if (this.status == 'INWAIT')
            return Math.max(WAIT_TIME - (Date.now() - this.lastWaitTime), 0);
        if (this.status == 'INGAME') {
            return Math.max(configuration_TIME - (Date.now() - this.lastFahuaTime), 0);
        }
        if (this.status == 'END') {
            return Date.now() - this.lastSettlementTime;
        }
        return 0;
    }

    /**等待玩家准备 */
    wait(playerInfo?: cpPlayer) {
        if (this.status != 'INWAIT') return;

        // 获取当前房间玩家
        const arr = this.players.filter(pl => pl && pl.status == `WAIT`);
        // 如果只剩一个人的时候或者没有人了 就直接关闭房间
        if (arr.length <= 1) {
            this.channelIsPlayer('poker_onWait', { waitTime: 0 });
            return;
        }
        // 通知 所有人开始准备
        if (Date.now() - this.lastWaitTime < WAIT_TIME) {//25s内就不重复通知玩家
            const member = playerInfo && this.channel.getMember(playerInfo.uid);
            if (member) {
                let waitTime = this.getWaitTime();
                MessageService.pushMessageByUids(`poker_onWait`, { waitTime: waitTime }, member);
            }
            return;
        }
        this.channelIsPlayer('poker_onWait', { waitTime: WAIT_TIME });
        this.lastWaitTime = Date.now(); // 这个记录只用于前段请求的时候用
        // 等一段时间后强行开始发牌
        clearTimeout(this.waitTimeout);
        this.waitTimeout = setTimeout(() => {
            // 人数超过2个就强行开始
            this.run_Players = this.players.filter(pl => pl);
            if (this.run_Players.length >= 2) {
                this.handler_start();
            } else {// 否则就关闭房间 因为当玩家进来的时候会再次检查
                this.channelIsPlayer('poker_onWait', { waitTime: 0 });// 通知还在的人不要准备了 等待其他人来
            }
        }, WAIT_TIME);
    }

    /**发牌 */
    async handler_start() {
        this.startTime = Date.now();
        this.status = 'INGAME';// 开始新的一轮游戏
        this.run_Players = this.players.filter(pl => pl);
        /**防止开局的时候 玩家退出 后面代码有awit */
        this.run_Players.forEach(pl => pl.status = `GAME`);
        // clearTimeout(this.waitTimeout);

        // 运行调控发牌
        await this.control.runControlDeal();

        this.run_Players.forEach(pl => {
            let cards = pl.cards;
            pl.initGame(cards, this.lowBet);
            let card_arr = this.combination22(pl.cards.slice());
            card_arr.sort((a, b) => {
                return (b.type[0] + b.type[1] + b.type[2]) - (a.type[0] + a.type[1] + a.type[2]);
            });
            pl.card_arr = card_arr.slice(0, 5);
            // try {
            pl.BiPaicards = [card_arr[0].cards.slice(0, 3), card_arr[0].cards.slice(3, 8), card_arr[0].cards.slice(8, 13)];
            // }
            // catch (error) {
            //     pl.BiPaicards = [cards.slice(0, 3), cards.slice(3, 8), cards.slice(8, 13)];
            //     console.error("error=", error, card_arr, pl.cards, cards);
            //     log_logger.info("error=", error, card_arr, pl.cards, cards);
            // }
        });
        // 通知
        for (const pl of this.players) {
            if (!pl) continue;
            const member = this.channel.getMember(pl.uid);
            if (member) {
                const opts = {
                    otherPlayers: this.players.filter(m => m && m.uid != pl.uid).map(m => m && m.toGame(pl.uid)),
                    players: pl.toGame(pl.uid),
                    configuration_TIME: configuration_TIME
                }
                MessageService.pushMessageByUids('poker_onDeal', opts, member);
            }
        }
        this.lastFahuaTime = Date.now();
        // 时间到了 强制开始比牌
        this.configurationTime();
    }

    /**配置 */
    configurationTime() {
        clearTimeout(this.configurationTimeout);
        this.configurationTimeout = setTimeout(() => {
            let pls = this.players.filter(pl => pl && pl.status == 'GAME');
            for (const pl of pls) {
                if (pl.holdStatus == 0) {
                    this.configuration(pl);
                }
            }
        }, configuration_TIME + 1000);
        return;
    }

    /**配置牌型 */
    configuration(playerInfo: cpPlayer) {
        // 设置玩家为准备状态
        playerInfo.holdStatus = 1;
        // 通知
        this.channelIsPlayer('poker_configuration', { uid: playerInfo.uid, seat: playerInfo.seat });
        // 检测全部配置好牌 要开始比较大小了
        let list = this.players.filter(pl => pl && pl.status == 'GAME');
        if (list.every(m => m && m.holdStatus === 1)) {
            clearTimeout(this.configurationTimeout);
            // 获取当前参与游戏的玩家element
            const list = this.players.filter(pl => !!pl && pl.status == 'GAME');
            this.checkCanBiPai(list);
            this.settlement(list);
        }
    }

    /**开始比牌 */
    checkCanBiPai(list: cpPlayer[]) {
        for (const pl of list) {
            (pl.holdStatus == 0) && (pl.holdStatus = 1);//未配置，掉线的，强制配置
            // 计算每个玩家的牌型
            pl.cardType1 = GameUtil3.getCardtype(pl.BiPaicards[0], []);

            pl.cardType2 = cp_logic.getCardtype(pl.BiPaicards[1], []);

            pl.cardType3 = cp_logic.getCardtype(pl.BiPaicards[2], []);

            pl.specialType = cp_logic.countAlikePoker({ cards: pl.cards, type1: pl.cardType1.type, type2: pl.cardType2.type, type3: pl.cardType3.type, });
            // if (pl.uid == '91761086' || pl.uid == '58689650') {//测试代码 保留以后备用
            //     pl.cardType1.type = 3;
            //     pl.cardType2.type = 6;
            //     pl.cardType3.type = 7;
            // }
        }
        //========除恰好为“三顺子”、“三同花”、“三同花顺”外，第一墩拿到顺子、同花、同花顺均为散牌
        for (const pl of list) {
            if (pl.cardType1.type == 4 && (pl.cardType2.type != 4 || pl.cardType3.type != 4)) {//顺子
                pl.cardType1.type = 0; pl.cardType1.type = 0;
            }
            if (pl.cardType1.type == 5 && (pl.cardType2.type != 5 || pl.cardType3.type != 5)) {//同花
                pl.cardType1.type = 0; pl.cardType1.type = 0;
            }
            if (pl.cardType1.type == 8 && (pl.cardType2.type != 8 || pl.cardType3.type != 8)) {//同花顺
                pl.cardType1.type = 0; pl.cardType1.type = 0;
            }
            //==========判断是否为相公(爆牌)，相关不参与比牌 ，直接输
            const maxPoker1 = cp_logic.bipai(pl.cardType1, pl.cardType2);
            const maxPoker2 = cp_logic.bipai(pl.cardType2, pl.cardType3);
            if (maxPoker1 > 0 || maxPoker2 > 0) {
                pl.biPai_status = true;
            }
        };
        //特殊牌型不参与三道比牌
        const notSpecialType_list = list.filter(m => m.specialType == 0);
        //========开始比牌逻辑运算
        for (let i = 0; i < notSpecialType_list.length; i++) {
            for (let j = i + 1; j < notSpecialType_list.length; j++) {
                let pl1 = notSpecialType_list[i];
                let pl2 = notSpecialType_list[j];
                //比牌 判断输赢
                let maxPoker1 = GameUtil3.bipai(pl1.cardType1, pl2.cardType1);
                let maxPoker2 = cp_logic.bipai(pl1.cardType2, pl2.cardType2);
                let maxPoker3 = cp_logic.bipai(pl1.cardType3, pl2.cardType3);

                if (pl1.biPai_status == true && pl2.biPai_status == true) {
                    maxPoker1 = 0;//平局
                    maxPoker2 = 0;
                    maxPoker3 = 0;
                } else if (pl1.biPai_status == true) {
                    maxPoker1 = -1;//player1输
                    maxPoker2 = -1;
                    maxPoker3 = -1;
                } else if (pl2.biPai_status == true) {
                    maxPoker1 = 1;//player2输
                    maxPoker2 = 1;
                    maxPoker3 = 1;
                }
                let tmpgain = { gain1: 0, gain2: 0, gain3: 0 };
                //======== 第一阶段
                {
                    if (maxPoker1 != 0) {
                        let pl = pl2;
                        let symbol = false;
                        if (maxPoker1 > 0) {
                            pl = pl1;
                            symbol = true;
                        }
                        tmpgain.gain1 = symbol ? 1 : -1;
                        if (pl.cardType1.type == 3) {//冲三
                            pl.extension[0] = 1;
                            tmpgain.gain1 += symbol ? 2 : -2;
                        }
                    }
                }
                //========第二阶段
                {
                    if (maxPoker2 != 0) {
                        {
                            let pl = pl2;
                            let symbol = false;
                            if (maxPoker2 > 0) {
                                pl = pl1;
                                symbol = true;
                            }
                            tmpgain.gain2 += symbol ? 1 : -1;
                            if (pl.cardType2.type == 6) {//中墩葫芦
                                pl.extension[1] = 1;
                                tmpgain.gain2 += symbol ? 1 : -1;
                            } else if (pl.cardType2.type == 7) {//四条中墩
                                pl.extension[2] = 1;
                                tmpgain.gain2 += symbol ? 6 : -6;
                            } else if (pl.cardType2.type == 8) {//同花顺（中墩）
                                pl.extension[3] = 1;
                                tmpgain.gain2 += symbol ? 8 : -8;
                            }
                        }
                    }
                }
                //========第三阶段
                {
                    if (maxPoker3 != 0) {
                        let pl = pl2;
                        let symbol = false;
                        if (maxPoker3 > 0) {
                            pl = pl1;
                            symbol = true;
                        }
                        tmpgain.gain3 += symbol ? 1 : -1;
                        if (pl.cardType3.type == 7) {//四条（下墩）
                            pl.extension[4] = 1;
                            tmpgain.gain3 += symbol ? 3 : -3;
                        } else if (pl.cardType3.type == 8) {//同花顺（下墩）
                            pl.extension[5] = 1;
                            tmpgain.gain3 += symbol ? 4 : -4;
                        }
                    }
                }

                pl1.gain1 += tmpgain.gain1;
                pl1.gain2 += tmpgain.gain2;
                pl1.gain3 += tmpgain.gain3;

                pl2.gain1 += -tmpgain.gain1;
                pl2.gain2 += -tmpgain.gain2;
                pl2.gain3 += -tmpgain.gain3;
                //打枪逻辑
                if (maxPoker1 > 0 && maxPoker2 > 0 && maxPoker3 > 0) {//tmpgain1为正数
                    pl1.tmp_gain += (tmpgain.gain1 + tmpgain.gain2 + tmpgain.gain3);
                    pl2.tmp_gain -= (tmpgain.gain1 + tmpgain.gain2 + tmpgain.gain3);
                    pl1.shoot.push({ uid: pl2.uid, seat: pl2.seat, shoot_gain: [tmpgain.gain1, tmpgain.gain2, tmpgain.gain3] });
                } else if (maxPoker1 < 0 && maxPoker2 < 0 && maxPoker3 < 0) {//tmpgain1为负数
                    pl2.tmp_gain += -(tmpgain.gain1 + tmpgain.gain2 + tmpgain.gain3);
                    pl1.tmp_gain -= -(tmpgain.gain1 + tmpgain.gain2 + tmpgain.gain3);
                    pl2.shoot.push({ uid: pl1.uid, seat: pl1.seat, shoot_gain: [-tmpgain.gain1, -tmpgain.gain2, - tmpgain.gain3] });
                }
            }
        }

        //全垒打 全垒打自己另加36注，其他玩家各另扣12注
        for (const ply of notSpecialType_list) {
            if (ply.shoot.length == 3) {
                for (const pl of notSpecialType_list) {
                    if (ply == pl) {
                        continue;
                    }
                    let temp = utils.sum(ply.shoot.find(c => c.uid == pl.uid).shoot_gain) * 2
                    pl.tmp_gain -= temp;
                    ply.tmp_gain += temp;
                }
            }
        }

        //特殊牌型比较
        for (let i = 0; i < list.length; i++) {
            for (let j = i + 1; j < list.length; j++) {
                let player1 = list[i];
                let player2 = list[j];
                const specialType_arr = [0, 4, 3, 4, 5, 6, 10, 10, 10, 20, 20, 24, 36, 108];//特殊牌类型对应的注数
                let tmpGain1 = 0;
                let tmpGain2 = 0;
                if (player1.specialType > player2.specialType) {//
                    tmpGain1 = specialType_arr[player1.specialType];
                    tmpGain2 = -tmpGain1;
                } else if (player2.specialType > player1.specialType) {
                    tmpGain2 = specialType_arr[player2.specialType];
                    tmpGain1 = -tmpGain2
                }
                player1.specialgain += tmpGain1;
                player2.specialgain += tmpGain2;
            }
        }
        //========把注数集中起来
        for (const pl of list) {
            pl.sumgain += pl.gain1 + pl.gain2 + pl.gain3 + pl.tmp_gain + pl.specialgain;
        }
        // console.warn(this.roundId, "===================================================");
        // let res = list.map(pl => {
        //     let res = {
        //         uid: pl.uid,
        //         sumgain: pl.sumgain,
        //         gain1: pl.gain1,
        //         gain2: pl.gain2,
        //         gain3: pl.gain3,
        //         tmp_gain: pl.tmp_gain,
        //         specialgain: pl.specialgain
        //     }
        //     console.warn(JSON.stringify(res));
        // });
    }

    /**结算 */
    async settlement(list: cpPlayer[]) {
        this.endTime = Date.now();
        if (list.length === 0) {
            console.error(this.nid, this.roomId, '出现错误 结算的时候没有玩家');
            return this.wait();
        }
        let totalWinNum = 0;//玩家输的钱 也就是玩家赢的钱
        let totalSumgain = 0;//总输的注数 也就是赢的注数

        this.zipResult = buildRecordResult(this.players);
        // letnum = 0;//记录回调次数
        /**扣除玩家输的钱 */
        for (const pl of list) {
            if (pl.sumgain < 0) {
                pl.profit = pl.sumgain * this.lowBet;
                totalSumgain += -pl.sumgain;
                totalWinNum += Math.abs(pl.profit);
            }
        }
        for (const pl of list) {
            if (pl.sumgain > 0) {
                pl.profit = Math.floor(totalWinNum * pl.sumgain / totalSumgain);
            }
        }
        //写记录放到房间重置的时候
        for (let pl of list) {
            await pl.settlement(this);
        }
        this.record_history = list.map(pl => pl && pl.wrapSettlement());
        for (let pl of list) {
            await pl.only_update_game(this);
        }
        let opts = {
            list: list.map(pl => pl.wrapSettlement())
        }
        this.channelIsPlayer('poker_onSettlement', opts);
        this.status = 'END';
        this.lastSettlementTime = Date.now();
        this.Initialization();
    }



    /**踢掉离线玩家 */
    battle_kickNoOnline() {
        const offLinePlayers: cpPlayer[] = [];
        for (const pl of this.players) {
            if (!pl) continue;
            // 不在线移除玩家 在线则不移除 因为还在这个场中
            if (!pl.onLine) roomManager.removePlayer(pl);
            offLinePlayers.push(pl);
            // this.leave(pl, false);
            this.kickOutMessage(pl.uid);
            roomManager.removePlayerSeat(pl.uid);
            this.players[pl.seat] = null;
        }

        //更新数据（前端需要切换场景）
        this.kickingPlayer(pinus.app.getServerId(), offLinePlayers);
    }

    /**返回最小一个 */
    GetMinPai(arr_pai: number[][], type: number) {
        if (arr_pai.length == 0) return [];
        let results = arr_pai[0];
        for (let i = 1; i < arr_pai.length; i++) {

            const pai1 = arr_pai[i];
            const maxPoker1 = cp_logic.bipai({ cards: pai1, type: type }, { cards: results, type: type });
            if (maxPoker1 < 0)
                results = pai1;
        }
        return [results];
    }

    /**返回最大一个 */
    GetMaxPai(arr_pai: number[][], type: number) {
        if (arr_pai.length == 0) return [];
        let results = arr_pai[0];
        for (let i = 1; i < arr_pai.length; i++) {
            const pai1 = arr_pai[i];
            const maxPoker1 = cp_logic.bipai({ cards: pai1, type: type }, { cards: results, type: type });
            if (maxPoker1 > 0)
                results = pai1;
        }
        return [results];
    }

    /**返回最优组合 */
    combination22(cards: number[]) {
        let arr_pai: { cards: number[], type: number[] }[] = [];
        // 相同的个数
        let theCards = cards.map(m => cp_logic.getCardValue(m));
        const alikeCount = cp_logic.checkAlike(theCards);
        const types = [8, 7, 6, 5, 4, 3, 2, 1, 0];
        for (let i = 0; i < types.length; i++) {
            const type3 = types[i];
            if (type3 === 1 || type3 === 0) continue;
            let arr_poker3 = cp_logic.getCardArr(cards, type3);//获取该类型所有可能的3道组合

            if (type3 == 8) {//同花顺= 8
                arr_poker3 = this.GetMaxPai(arr_poker3, type3);
            }
            else if (type3 == 7 && alikeCount[4] == 1) {//铁支（铁支）四条=7
                arr_poker3 = this.GetMinPai(arr_poker3, type3);
            }
            else if (type3 == 6 && alikeCount[3] == 1) {//葫芦=6
                arr_poker3 = this.GetMinPai(arr_poker3, type3);
            } else if (type3 == 3 && alikeCount[3] == 1) {//三条=3
                arr_poker3 = this.GetMinPai(arr_poker3, type3);
            }

            for (let j = 0; j < arr_poker3.length; j++) {
                const tmp_cards3 = arr_poker3[j];
                let cards_copy3 = utils.array_diff(cards.slice(), tmp_cards3);

                for (let k = i; k < types.length; k++) {//剃出3道后 遍历2道的 可能性
                    const type2 = types[k];
                    let arr_poker2 = cp_logic.getCardArr(cards_copy3, type2);
                    //取最大的中蹲
                    if (type2 == 1 || type2 == 2 || type2 == 3 || type2 == 6 || type2 == 7) {
                        arr_poker2 = this.GetMinPai(arr_poker2, type2);
                    }
                    for (let kk = 0; kk < arr_poker2.length; kk++) {
                        const tmp_cards2 = arr_poker2[kk];
                        let tmp_cards1 = utils.array_diff(cards_copy3.slice(), tmp_cards2);
                        let type1 = GameUtil3.getCardtype(tmp_cards1).type;

                        const res_cards: number[] = [];
                        //排序1
                        tmp_cards1.sort((a, b) => cp_logic.getCardValue(b) - cp_logic.getCardValue(a));
                        //排序2
                        tmp_cards2.sort((a, b) => cp_logic.getCardValue(b) - cp_logic.getCardValue(a));
                        //排序3
                        tmp_cards3.sort((a, b) => cp_logic.getCardValue(b) - cp_logic.getCardValue(a));
                        res_cards.push(...tmp_cards1);
                        res_cards.push(...tmp_cards2);
                        res_cards.push(...tmp_cards3);
                        if (type1 == 4 && (type2 != 4 || type3 != 4)) {//顺子
                            type1 = 0;
                        }
                        if (type1 == 5 && (type2 != 5 || type3 != 5)) {//同花
                            type1 = 0;
                        }
                        if (type1 == 8 && (type2 != 8 || type3 != 8)) {//同花顺
                            type1 = 0;
                        }
                        //==========判断是否为相公，相关不参与比牌 ，直接输
                        const maxPoker1 = cp_logic.bipai({ type: type1, cards: tmp_cards1 }, { type: type2, cards: tmp_cards2 });
                        const maxPoker2 = cp_logic.bipai({ type: type2, cards: tmp_cards2 }, { type: type3, cards: tmp_cards3 });
                        if (maxPoker1 > 0 || maxPoker2 > 0) {
                            continue;
                        }
                        arr_pai.push({ cards: res_cards, type: [type1, type2, type3] });
                        if (arr_pai.length >= 25) {
                            return arr_pai;
                        }
                        break;
                    }
                }
            }
        }
        return arr_pai;
    }

    /**
     * 对牌的大小进行逆序排序
     * @param allResult
     */
    sortResult(allResult: number[][]) {
        const list: cpPlayer[] = [];//这个地方 对 玩家 来个深拷贝 赋值 ，避免 后续 出错 吧
        for (let i = 0; i < 4; i++) {
            let cards = allResult[i].slice();
            let card_arr = this.combination22(cards.slice());
            card_arr.sort((a, b) => {
                return (b.type[0] + b.type[1] + b.type[2]) - (a.type[0] + a.type[1] + a.type[2]);
            });
            let BiPaicards = [card_arr[0].cards.slice(0, 3), card_arr[0].cards.slice(3, 8), card_arr[0].cards.slice(8, 13)];
            let currPlayer = new cpPlayer(0, { uid: i.toString() });
            currPlayer.cards = cards.slice();
            currPlayer.BiPaicards = BiPaicards;
            list.push(currPlayer);
        }

        this.checkCanBiPai(list);
        list.sort((a, b) => { return b.sumgain - a.sumgain });

        list.forEach((m, i) => {
            allResult[i] = m.cards.slice();
        })
    }

    /**
     * 个控发牌
     * @param positivePlayers 正调控玩家 在这里的玩家赢得概率高
     * @param negativePlayers 负调控玩家 在这里的玩家赢得概率高
     */
    controlPersonalDeal(positivePlayers: PersonalControlPlayer[], negativePlayers: PersonalControlPlayer[]): void {
        // 洗牌
        let allResult = this.shuffleDeck();

        positivePlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));
        negativePlayers.forEach(p => this.getPlayer(p.uid).setControlType(ControlKinds.PERSONAL));

        // 对牌进行逆序排序
        this.sortResult(allResult);

        // 未发牌的玩家
        let dealtPlayers = this.run_Players;

        // 如果玩家在正调控里 则从头部取大牌给玩家 不用关心同时有负调控玩家 因为大牌已经被正调控玩家取了
        if (positivePlayers.length) {
            positivePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                const player = this.getPlayer(p.uid);
                player.cards = allResult.shift();
                dealtPlayers = dealtPlayers.filter(dealtPlayer => p.uid !== dealtPlayer.uid);
            })
        } else {
            // 如果玩家在负调控里 则从尾部去小牌给玩家
            negativePlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
                const player = this.getPlayer(p.uid);
                player.cards = allResult.pop();
                dealtPlayers = dealtPlayers.filter(dealtPlayer => p.uid !== dealtPlayer.uid);
            });
        }

        // 剩余的玩家随机发牌
        dealtPlayers.sort((a, b) => Math.random() - 0.5).forEach(p => {
            p.cards = allResult.shift();
        });
    }

    sceneControl(sceneControlState: ControlState, isPlatformControl) {
        // 洗牌
        const allResult = this.shuffleDeck();

        // 如果不调控 随机发牌
        if (sceneControlState === ControlState.NONE) {
            return this.randomDeal(allResult);
        }

        const type = isPlatformControl ? ControlKinds.PLATFORM : ControlKinds.SCENE;
        this.run_Players.forEach(p => p.setControlType(type));

        // 对牌的大小逆序排序
        this.sortResult(allResult);

        const gamePlayers = this.run_Players;

        // 如果是让系统赢 则随机一个机器人发大牌 否则则随机一个玩家发大牌
        const luckPlayer = gamePlayers.filter(p => {
            return sceneControlState === ControlState.SYSTEM_WIN ? p.isRobot === RoleEnum.ROBOT : p.isRobot === RoleEnum.REAL_PLAYER;
        }).sort((a, b) => Math.random() - 0.5)[0];

        luckPlayer.cards = allResult.shift();

        // 其他玩家随机发牌
        gamePlayers.filter(p => p.uid !== luckPlayer.uid).sort(p => Math.random() - 0.5).map(p => {
            allResult.sort((a, b) => Math.random() - 0.5);
            p.cards = allResult.shift();
        });
    }

    /**
     * 随机发牌
     * @param allResult 洗牌结果
     */
    randomDeal(allResult: number[][]) {
        this.run_Players.sort((a, b) => Math.random() - 0.5).forEach(pl => {
            pl.cards = allResult.shift();
        });
    }
    /**
     * 洗牌 并返回四幅牌
     */
    shuffleDeck(): number[][] {
        let cards = GameUtil.getPai(1);
        // 如果需要开出一副特殊牌型
        if (Math.random() < this.specialCardProbability) {
            for (let i = 0; i < 10000; i++) {
                const poker = GameUtil.getPai(1);
                const copyCards = [...poker];

                while (copyCards.length > 0) {
                    const onePoker = copyCards.splice(0, 13);
                    const type = cp_logic.countAlikePoker({ cards: onePoker });

                    if (type > 0) {
                        cards = [...poker];
                        break;
                    }
                }
            }
        }

        // 洗牌
        this.initPais = [...cards];
        let allResult: number[][] = [];
        for (let i = 0; i < this.cardsNumber; i++) {
            let finallyCard = this.initPais.splice(0, 13);
            allResult.push(finallyCard);
        }

        return allResult;
    }
}
