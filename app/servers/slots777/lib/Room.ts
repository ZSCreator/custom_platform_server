import regulation = require('../../../domain/games/regulation');
import { maxAward } from "./constant";
import ControlImpl from "./ControlImpl";
import { buildRecordResult } from "./util/recordUtil";
import { notice, sendBigWinNotice } from "../../../services/MessageService";
import Player from "./Player";
import { crateSlotLottery, SlotResult, personalInternalControl } from './util/lotteryUtil';
import BaseSlotMachineRoom from "../../../common/classes/game/slotMachineRoom";
import createPlayerRecordService from "../../../common/dao/RecordGeneralManager";


/**
 * slots777房间类
 * @property _players 玩家列表
 * @property runningPool 运行池 该池只属于单个房间 不属于公共调控池 后续考虑清除
 * @property profitPool 盈利池  该池只属于单个房间 不属于公共调控池 后续考虑清除
 */
export default class RoomStandAlone extends BaseSlotMachineRoom<Player>{
    gameName: string = '幸运777';
    experience: boolean;
    kickTimer: NodeJS.Timeout;

    constructor(opts: any) {
        super(opts);

        // this.experience = opts.experience;
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
        // 如果是体验场 玩家金币为10000
        if (this.experience) {
            player.gold = 10000 * 100;
        }

        let currPlayer = new Player(player, this);
        this.addMessage(player);


        currPlayer.onLine = true;
        this._players.set(player.uid, currPlayer);
        return true;
    }


    /****************************************  房间开奖逻辑部分 ************************************/
    async lottery(_player: Player): Promise<SlotResult> {
        // 是否开放奖池奖励
        // TODO 没想到好办法，(这里当奖池不够赔付一次最大奖励连线时,就不开最大奖,但实际上一次spin可能出现多个最大奖连线而击穿奖池)
        const openPoolAward = this.jackpot > (maxAward * _player.baseBet);

        // 是否是新人玩家 且前3把押注小于1块 使用放奖轮盘一
        // if (_player.gameRound < 3 && _player.totalBet < 100) {
        //     // 使用第一个轮盘
        //     _player.record.nextUse = '1';
        //     _player.newer = true;
        // } else {
        //     _player.newer = false;
        // }

        // 选择此局使用的轮盘
        _player.record.nextUse = regulation.selectRoulette(_player.record.nextUse);

        // 房间内部整体调控 属于收奖调控
        const wR = regulation.wholeRegulation(this.jackpot, this.runningPool);

        // 个体调控 属于游戏内部自然情况下的放奖调控
        const [iR1, iR2] = personalInternalControl(_player.record.recordCount,
            _player.record.nextUse, _player.winPercentage, wR);

        // 创建一个开奖类
        const lotteryUtil = crateSlotLottery(_player.newer, _player.record.nextUse);
        lotteryUtil.setBetAndLineNum(_player.baseBet, _player.lineNumber)
            // 暂时频闭加大力度放奖调控
            .setInternalControl(wR, iR1, false)
            // .setInternalControl(wR, false, false)
            .setOpenPoolAward(openPoolAward);

        // 获取调控结果
        return await ControlImpl.getControlInstance(this).runControl(_player, lotteryUtil);
    }

    /**
     * 结算
     * @param _player 玩家
     * @param result 开奖结果
     */
    async settlement(_player: Player, result: SlotResult) {
        // 体验房结算
        if (this.experience) {
            return this.experienceRoomSettlement(_player, result);
        }

        // const { player, lock } = await getPlayer({ uid: _player.uid, isRobot: _player.isRobot }, true);

        // 数据库玩家金币 减除内存押注金币
        // player.gold -= _player.totalBet;

        // console.warn('玩家金币', player.gold, player.gold);

        // 添加游戏记录以及更新玩家金币
        _player.setRoundId(this.getRoundId(_player.uid))
        const record = buildRecordResult(_player.baseBet, _player.lineNumber, result.winLines);
        const { playerRealWin, gold } = await createPlayerRecordService()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(_player.roundId, 1,)
            .addResult(record)
            .setControlType(_player.controlType)
            .setGameRecordLivesResult(_player.buildLiveRecord(record))
            .setGameRecordInfo(_player.totalBet, _player.totalBet, result.totalWin - _player.totalBet, false)
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
        this.deductRunningPool(playerRealWin + result.jackpotWin);
    }

    /**
     * 体验场结算
     * @param _player
     * @param result
     */
    async experienceRoomSettlement(_player: Player, result: SlotResult) {
        // 添加游戏记录以及更新玩家金币
        _player.setRoundId(this.getRoundId(_player.uid))
        const { playerRealWin, gold } = await createPlayerRecordService()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRecordInfo(_player.totalBet, _player.totalBet, result.totalWin - _player.totalBet, false)
            .experienceSettlement(_player.gold);

        let totalWin = playerRealWin, _gold = gold;

        // 如果有免费开奖结果 抽水后再返回数据 不可删除
        if (result.freeSpin) {
            for (let i = 0, len = result.freeSpinResult.length; i < len; i++) {
                const freeSpinWin = result.freeSpinResult[i].totalWin;
                if (freeSpinWin > 0) {
                    const { playerRealWin, gold } = await createPlayerRecordService()
                        .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
                        .setGameInfo(this.nid, this.sceneId, this.roomId)
                        .setGameRecordInfo(0, 0, freeSpinWin, false)
                        .experienceSettlement(_player.gold);

                    result.freeSpinResult[i].totalWin = playerRealWin;
                    totalWin += playerRealWin;
                    _gold = gold;
                }
            }
        }

        // 玩家结算
        _player.settlement(totalWin, _gold);
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
     * 获取超时玩家
     * @private
     */
    private getTimeoutPlayers() {
        const now = Date.now();
        return this.getPlayers().filter(p => (now - p.lastOperationTime) > 300 * 1000);
    }
}

