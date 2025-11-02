import regulation = require('../../../domain/games/regulation');
import Control from "./control";
import {buildRecordResult} from "./util/recordUtil";
import { notice, sendBigWinNotice } from "../../../services/MessageService";
import Player from "./player";
import {
    crateSlotLottery,
    SlotResult,
} from './util/lotteryUtil';
import BaseSlotMachineRoom from "../../../common/classes/game/slotMachineRoom";
import createPlayerRecordService from "../../../common/dao/RecordGeneralManager";


/**
 * RotateParty房间类
 * @property _players 玩家列表
 * @property runningPool 运行池 该池只属于单个房间 不属于公共调控池 后续考虑清除
 * @property profitPool 盈利池  该池只属于单个房间 不属于公共调控池 后续考虑清除
 */
export default class RoomStandAlone extends BaseSlotMachineRoom<Player>{
    gameName: string = '旋转派对';
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
        }, 10 * 60 * 1000);
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
     * 结算
     * @param _player 玩家
     * @param result 开奖结果
     */
    async settlement(_player: Player, result: SlotResult) {
        // 添加游戏记录以及更新玩家金币
        const record = buildRecordResult(_player.baseBet, _player.lineNumber, result.winLines);
        const { playerRealWin, gold } = await createPlayerRecordService()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(_player.roundId, 1,)
            .addResult(record)
            .setControlType(_player.controlType)
            .setGameRecordLivesResult(_player.buildLiveRecord(record))
            .setGameRecordInfo(_player.totalBet, _player.totalBet,
                result.totalWin - _player.totalBet, false)
            .sendToDB(1);

        let totalWin = playerRealWin, _gold = gold;

        // 如果有免费开奖结果 抽水后再返回数据 不可删除
        if (result.freeSpin) {
            for (let i = 0, len = result.freeSpinResult.length; i < len; i++) {
                const freeSpinWin = result.freeSpinResult[i].totalWin;
                if (freeSpinWin > 0) {
                    const record = buildRecordResult(_player.baseBet, _player.lineNumber, result.freeSpinResult[i].winLines);
                    const { playerRealWin, gold } = await createPlayerRecordService()
                        .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
                        .setGameInfo(this.nid, this.sceneId, this.roomId)
                        .setGameRoundInfo(_player.roundId, 1,)
                        .addResult(record)
                        .setControlType(_player.controlType)
                        .setGameRecordLivesResult(_player.buildLiveRecord(record))
                        .setGameRecordInfo(0, 0, freeSpinWin, false)
                        .sendToDB(1);

                    result.freeSpinResult[i].totalWin = playerRealWin;
                    totalWin += playerRealWin;
                    _gold = gold;
                }
            }
        }

        // 玩家结算
        _player.settlement(totalWin, _gold);

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

