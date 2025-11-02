import regulation = require('../../../domain/games/regulation');
import Control from "./control";
import {
    buildClayPotGameRecord,
    buildDiceGameRecord, buildOrchardGameRecord,
    buildRecordResult,
    buildTurnTableGameRecord
} from "./util/recordUtil";
import {notice, sendBigWinNotice} from "../../../services/MessageService";
import Player from "./Player";
import {
    crateSlotLottery,
    getClayPotLotteryResult,
    getDiceLotteryResult,
    getTurntableLotteryResult,
    personalInternalControl,
    SlotResult
} from './util/lotteryUtil';
import BaseSlotMachineRoom from "../../../common/classes/game/slotMachineRoom";
import createPlayerRecordService from "../../../common/dao/RecordGeneralManager";
import {ClayPotGameElementType, DICE_GAME_BONUS, OrchardGameElementType, TURNTABLE_BONUS} from "./constant";


/**
 * halloween房间类
 * @property _players 玩家列表
 * @property runningPool 运行池 该池只属于单个房间 不属于公共调控池 后续考虑清除
 * @property profitPool 盈利池  该池只属于单个房间 不属于公共调控池 后续考虑清除
 */
export default class RoomStandAlone extends BaseSlotMachineRoom<Player>{
    gameName: string = 'halloween';
    kickTimer: NodeJS.Timeout;
    control: Control;

    constructor(opts: any) {
        super(opts);

        this.control = new Control({room:this});
    }

    /**************************************  工具方法部分 ******************************************/

    init() {
        this.runJackpotTimer();
        this.kickTimer = setInterval(async () => {
            const timeoutPlayers = this.getTimeoutPlayers();
            await this.kickTimeoutPlayers(timeoutPlayers);
            timeoutPlayers.forEach(p => {
                this.removePlayer(p);
            });
        }, 30 * 1000);
    }


    /**
     * 添加玩家
     * @param player 玩家基础数据
     */
    addPlayerInRoom(player: any) {
        let currPlayer = new Player(player, this);
        this.addMessage(player);


        currPlayer.onLine = true;
        this._players.set(player.uid, currPlayer);
        return true;
    }


    /****************************************  房间开奖逻辑部分 ************************************/
    async lottery(_player: Player): Promise<SlotResult> {
        // 选择此局使用的轮盘
        _player.record.nextUse = regulation.selectRoulette(_player.record.nextUse);

        // 房间内部整体调控 属于收奖调控
        const wR = regulation.wholeRegulation(this.jackpot, this.runningPool);

        // 个体调控 属于游戏内部自然情况下的放奖调控
        const [iR1] = personalInternalControl(_player.record.recordCount,
            _player.record.nextUse, _player.winPercentage, wR);

        // 创建一个开奖类
        const lotteryUtil = crateSlotLottery(_player.newer, _player.record.nextUse);
        lotteryUtil.setBet(_player.baseBet)
            // 暂时频闭加大力度放奖调控
            .setInternalControl(wR, iR1, false)

        // 获取调控结果
        return await this.control.runControl(_player, lotteryUtil);
    }

    /**
     * 陶罐小游戏开奖
     */
    clayPotLottery(): ClayPotGameElementType {
        return getClayPotLotteryResult();
    }

    /**
     * 小游戏结算
     * @param player
     * @param profit
     * @param record
     */
    async subGameSettlement(player: Player, profit: number, record: string) {
        const { playerRealWin, gold } = await createPlayerRecordService()
            .setPlayerBaseInfo(player.uid, false, player.isRobot, player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(player.roundId, 1,)
            .addResult(record)
            .setGameRecordLivesResult(player.buildLiveRecord(record))
            .setGameRecordInfo(0, 0, profit, false)
            .sendToDB(1);

        // 玩家结算
        player.settlement(playerRealWin, gold);
    }

    /**
     * 陶罐小游戏结算
     * @param player
     * @param result
     */
    async clayPotSettlement(player: Player, result: ClayPotGameElementType) {
        if (result === ClayPotGameElementType.Bonus) {
            player.clayPotGameBonusCount *= 2;
            return;
        }

        const profit = result * player.baseBet * player.clayPotGameBonusCount;
        await this.subGameSettlement(player, profit,
            buildClayPotGameRecord(player.baseBet, profit, player.clayPotGameBonusCount, result));
        player.setSubGameType(null);
    }

    /**
     * 骰子小游戏
     */
    diceGameLottery() {
        return getDiceLotteryResult();
    }

    /**
     * 骰子小游戏结算
     * @param player
     * @param result
     */
    async diceSettlement(player: Player, result: number) {
        const profit = result * player.baseBet * DICE_GAME_BONUS;

        await this.subGameSettlement(player, profit,
            buildDiceGameRecord(player.baseBet, profit, DICE_GAME_BONUS, result));

        player.setSubGameType(null);
    }

    /**
     * 转盘小游戏开奖
     */
    turntableGameLottery() {
        return getTurntableLotteryResult();
    }

    /**
     * 转盘小游戏结算
     * @param player
     * @param result
     */
    async turntableSettlement(player: Player, result: number) {
        const profit = result * player.baseBet * TURNTABLE_BONUS; 100 * 70 * 21

        await this.subGameSettlement(player, profit,
            buildTurnTableGameRecord(player.baseBet, profit, TURNTABLE_BONUS, result));
        player.setSubGameType(null);
    }

    /**
     * 果园小游戏结算
     * @param player
     * @param result
     */
    async orchardSettlement(player: Player, result: OrchardGameElementType) {
        player.orchardGameResults.push(result);
        if (result === OrchardGameElementType.None) {
            await this.subGameSettlement(player, player.orchardProfit,
                buildOrchardGameRecord(player.baseBet, player.orchardProfit, player.orchardProfit / player.baseBet, player.orchardGameResults));
            player.setSubGameType(null);
            return;
        }

        const profit = result * player.baseBet;
        player.orchardProfit += profit
        player.profit = profit;
    }

    /**
     * 结算
     * @param _player 玩家
     * @param result 开奖结果
     */
    async settlement(_player: Player, result: SlotResult) {
        // 添加游戏记录以及更新玩家金币
        _player.setRoundId(this.getRoundId(_player.uid))
        const record = buildRecordResult(_player.baseBet, result);
        const { playerRealWin, gold } = await createPlayerRecordService()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(_player.roundId, 1,)
            .addResult(record)
            .setControlType(_player.controlType)
            .setGameRecordLivesResult(_player.buildLiveRecord(record))
            .setGameRecordInfo(_player.totalBet, _player.totalBet, result.totalWin - _player.totalBet, false)
            .sendToDB(1);


        // console.warn('金币2', gold, playerRealWin, result.totalWin - _player.totalBet);
        // 玩家结算
        _player.settlement(playerRealWin, gold);

        // 玩家结果
        _player.setSubGameType(result.subGame.type);

        // console.warn('玩家赢取', playerRealWin, player.gold, _player.gold, _player.totalBet, _player.profit);

        // 跑马灯
        if (playerRealWin >= _player.totalBet * 25 && playerRealWin > 100000) {
            // this.sendMaleScreen(_player);
        }

        // 是否中大奖
        if (playerRealWin >= _player.totalBet * 20) {
            _player.isBigWin = true;
            // this.sendBigWinner(_player);
        }

        // 扣除奖池金币
        this.deductRunningPool(playerRealWin);
    }

    /**
     * 发送公频
     */
    sendMaleScreen(player: Player) {
        sendBigWinNotice(this.nid, player.nickname, player.profit, player.isRobot, player.headurl);
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
        }, function () { });
    }

    /**
     * 给离线玩家发送邮件且删除玩家
     * @param player
     */
    sendMailAndRemoveOfflinePlayer(player: Player) {
        if (!player.onLine) {
            this.removePlayer(player);
        }
    }

    /**
     * 获取奖池
     */
    getPrizePool(): number {
        return 500000000 + this.runningPool;
    }

    /**
     * 获取超时玩家 如果在小游戏中就不算他超时
     * @private
     */
    private getTimeoutPlayers() {
        const now = Date.now();
        return this.getPlayers().filter(p => {
            return (!p.subGameType || !p.isOnLine) && (now - p.lastOperationTime) > 300 * 1000
        });
    }
}

