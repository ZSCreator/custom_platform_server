import Player from "./player";
import BaseSlotMachineRoom from "../../../common/classes/game/slotMachineRoom";
import createPlayerRecordService from "../../../common/dao/RecordGeneralManager";
import { AttResult, createLotteryUtil, getRandomOfCards } from "./util/lotteryUtil";
import { GameState } from "./attConst";
import Control from "./control";
import { buildRecordResult } from "./util/roomUtil";
import { pinus } from "pinus";
import {notice} from "../../../services/MessageService";


/**
 * 皇家连环炮房间类
 * @property players 玩家列表
 * @property runningPool 运行池 该池只属于单个房间 不属于公共调控池 后续考虑清除
 * @property profitPool 盈利池  该池只属于单个房间 不属于公共调控池 后续考虑清除
 */
export default class RoomStandAlone extends BaseSlotMachineRoom<Player>{
    gameName: string = '皇家连环炮';
    offlinePlayersMap: Map<string, NodeJS.Timeout> = new Map();

    constructor(opts: any) {
        super(opts);
    }

    /**************************************  工具方法部分 ******************************************/

    init() {
    }

    /**
     * 添加离线玩家
     * @param player
     */
    addOfflinePlayer(player: Player) {
        player.isOnLine = false;
        const timer = setTimeout(async () => {
            // 先结算
            player.conversionRetainCards(player.cards.slice());
            await this.lottery(player);
            await this.settlement(player, true);

            // 提出玩家
            await this.kickingPlayer(pinus.app.getServerId(), [player]);
            this.removePlayer(player);
            this.offlinePlayersMap.delete(player.uid);
        }, 180 * 1000);

        this.offlinePlayersMap.set(player.uid, timer);
    }

    /**
     * 移除定时器
     * @param uid
     */
    removeOfflineTimer(uid: string) {
        clearTimeout(this.offlinePlayersMap.get(uid));
    }

    /**
     * 添加玩家
     * @param player 玩家基础数据
     */
    addPlayerInRoom(player: any) {
        let currPlayer = new Player(player, this);
        currPlayer.onLine = true;
        this._players.set(player.uid, currPlayer);
        return true;
    }


    /****************************************  房间开奖逻辑部分 ************************************/
    /**
     * 根据调控结果初始化玩家手牌
     * @param player
     */
    async initPlayerCards(player: Player) {
        const lotteryUtil = createLotteryUtil(GameState.Deal, player.baseBet, player.roundCount);
        // 调控结果
        const result = await Control.getControlInstance(this).runControl(player, lotteryUtil);

        player.cards = result.cards;
        player.gameState = GameState.Deal;
        // 变更回合id
        player.setRoundId(this.getRoundId(player.uid));
    }

    /**
     * 开奖
     * @param player
     */
    async lottery(player: Player): Promise<AttResult> {
        const lotteryUtil = createLotteryUtil(GameState.Again, player.baseBet, player.roundCount);

        lotteryUtil.setCards(player.retainCards);

        let result;
        // 如果全保留则直接进行结算
        if (player.retainCards.length === 5) {
            result = lotteryUtil.result();
        } else {
            result = await Control.getControlInstance(this).runControl(player, lotteryUtil);
        }

        player.setProfit(result.totalWin);
        player.cardsList = result.resultList;

        return result;
    }

    /**
     * 结算
     * @param player 玩家
     * @param end 开奖结果
     */
    async settlement(player: Player, end: boolean) {

        // 如果收益零则直接结算
        if (end) {
            const record = buildRecordResult(player);
            const { playerRealWin, gold } = await createPlayerRecordService()
                .setPlayerBaseInfo(player.uid, false, player.isRobot , player.gold)
                .setGameInfo(this.nid, this.sceneId, this.roomId)
                .setGameRoundInfo(player.roundId, 1,)
                .addResult(record)
                .setControlType(player.controlType)
                .setGameRecordLivesResult(player.buildLiveRecord(record))
                .setGameRecordInfo(player.totalBet, player.totalBet, player.profit - player.totalBet, false)
                .sendToDB(1);
            player.settlement(playerRealWin + player.totalBet, gold);
            // 初始化
            player.init();

            // 跑马灯
            if (playerRealWin >= player.totalBet * 25 && playerRealWin > 100000) {
                this.sendBigWinner(player);
            }
        }
    }

    /**
     * 搏一搏开奖
     * @param player
     * @param color 选择的花色
     */
    async boLottery(player: Player, color: number): Promise<AttResult> {
        const lotteryUtil = createLotteryUtil(GameState.Bo, player.baseBet, player.roundCount);
        lotteryUtil.setBoCurrentProfit(player.profit)
            .setDisCardsAndColor(player.foldCards, color);

        // 调控结果
        const result = await Control.getControlInstance(this).runControl(player, lotteryUtil);

        // 记录
        player.boRecords.push({ color, profit: result.totalWin, multiple: result.multiple, card: result.card });

        player.setProfit(result.totalWin);
        // 添加入弃牌堆
        player.foldCards.push(result.card);

        return result;
    }

    /**
     * 玩家准备搏一搏状态
     * @param player
     */
    playerReadyBo(player: Player) {
        player.gameState = GameState.Bo;

        // 给玩家设置弃牌堆
        player.foldCards = getRandomOfCards(5);
    }

    /**
     * 发送大赢家
     * @param player
     */
    sendBigWinner(player: Player) {
        notice({
            route: 'onBigWin',
            game: {
                nid: this.nid,
                nickname: player.nickname,
                num: player.profit,
                odd: Math.floor(player.profit / player.totalBet),
            },
            uid: player.uid,
            nickname: player.nickname,
            content: '',
            des: '',
            language: player.language,
        });
    }
}

