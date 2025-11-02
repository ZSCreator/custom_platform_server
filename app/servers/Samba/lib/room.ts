import regulation = require('../../../domain/games/regulation');
import Control from "./control";
import {buildRecordResult} from "./util/recordUtil";
import { notice, sendBigWinNotice } from "../../../services/MessageService";
import Player from "./player";
import {
    crateSlotLottery,
    SlotResult,
    BoResult,
    createBoLottery, removeOneElement,
} from './util/lotteryUtil';
import BaseSlotMachineRoom from "../../../common/classes/game/slotMachineRoom";
import createPlayerRecordService from "../../../common/dao/RecordGeneralManager";
import {ColorType} from "./constant";
import {random} from "../../../utils";
import {free} from "../../pharaoh/lib/old/config";


/**
 * Samba房间类
 * @property _players 玩家列表
 * @property runningPool 运行池 该池只属于单个房间 不属于公共调控池 后续考虑清除
 * @property profitPool 盈利池  该池只属于单个房间 不属于公共调控池 后续考虑清除
 */
export default class RoomStandAlone extends BaseSlotMachineRoom<Player>{
    gameName: string = '桑巴嘉年华';
    kickTimer: NodeJS.Timeout;
    control: Control;

    constructor(opts: any) {
        super(opts);
        this.control = new Control({room: this})
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
        }, 50 * 1000);
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

        // 创建一个开奖类
        const lotteryUtil = crateSlotLottery(_player.newer, _player.record.nextUse);
        lotteryUtil.setBetAndLineNum(_player.baseBet, _player.lineNumber);
        // 设置总押注
        lotteryUtil.setTotalBet(_player.totalBet);

        // 获取调控结果
        return await this.control.runControl(_player, lotteryUtil);
    }

    /**
     * 博一博开奖
     * @param _player
     * @param color
     */
    async boLottery(_player: Player, color: ColorType): Promise<BoResult> {
        const lotteryUtil = createBoLottery(_player.disCards, _player.profit + _player.boProfit);
        lotteryUtil.setColor(color);

        return this.control.boControl(_player, lotteryUtil);
    }

    /**
     * 结算
     * @param _player 玩家
     */
    async settlement(_player: Player) {
        const result = _player.result;
        // 添加游戏记录以及更新玩家金币
        const record = buildRecordResult(_player.baseBet, result.winLines, _player.freeOdds, _player.freeProfit);
        const { playerRealWin, gold } = await createPlayerRecordService()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(_player.roundId, 1,)
            .addResult(record)
            .setControlType(_player.controlType)
            .setGameRecordLivesResult(_player.buildLiveRecord(record))
            .setGameRecordInfo(_player.totalBet, _player.totalBet,
                result.totalWin + _player.boProfit + _player.freeProfit - _player.totalBet, false)
            .sendToDB(1);

        // 玩家结算
        _player.settlement(playerRealWin, gold);

        // console.warn('玩家赢取', playerRealWin, player.gold, _player.gold, _player.totalBet, _player.profit);

        // 跑马灯
        if (playerRealWin >= _player.totalBet * 25 && playerRealWin > 100000) {
            this.sendMaleScreen(_player);
        }

        // 是否中大奖
        if (playerRealWin >= _player.totalBet * 20) {
            _player.isBigWin = true;
            this.sendBigWinner(_player);
        }

        // 扣除奖池金币
        this.deductRunningPool(playerRealWin);
    }

    /**
     * 桑巴游戏结算
     * @param _player 玩家
     */
    async sambaSettlement(_player: Player) {
        const netProfit = _player.getNetProfit();
        let odds, fakeList = [];

        if (netProfit <= 0) {
            const list = [1, 2, 3, 4, 5];
            odds = removeOneElement(list);
            fakeList.push(removeOneElement(list), removeOneElement(list));
        } else {
            let min = Math.floor(netProfit * 0.8 / _player.totalBet);
            let max = Math.floor(netProfit * 0.9 / _player.totalBet);

            if (min < 1) min = 1;
            if (max < 1) max = 1;
            if (max > 120) max = 120;

            if (max === 1 && min === 1) {
                odds = 1;
                fakeList.push(1, 1);
            } else {
                odds = random(min, max);
                fakeList.push(random(min, max), random(min, max));
            }
        }

        _player.setFreeInfo(odds);

        return {odds, fakeList};
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
            // mailModule.sendEmailFromSlot({ name: '幸运777' }, {
            //     uid: player.uid,
            //     bet: player.totalBet,
            //     profit: player.profit
            // });

            this.removePlayer(player);
        }
    }

    /**
     * 设置回合id
     * @param player
     */
    setRoundId(player: Player) {
        player.setRoundId(this.getRoundId(player.uid));
    }

    /**
     * 获取超时玩家
     * @private
     */
    private getTimeoutPlayers() {
        const now = Date.now();
        return this.getPlayers().filter(p => (now - p.lastOperationTime) > 300 * 1000);
    }
}

