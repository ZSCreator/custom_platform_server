import regulation = require('../../../domain/games/regulation');
import ControlImpl from "./control";
import {notice, sendBigWinNotice} from "../../../services/MessageService";
import Player from "./Player";
import BaseSlotMachineRoom from "../../../common/classes/game/slotMachineRoom";
import { crateXYJLottery, FreeSpinResult, XYJLotteryResult } from "./util/lotteryUtil";
import { personalInternalControl } from "./util/lotteryUtil";
import { buildRecordResult } from "./util/recordUtil";
import createPlayerRecordService from "../../../common/dao/RecordGeneralManager";


/**
 * 猴王传奇房间类
 * @property _players 玩家列表
 */
export default class RoomStandAlone extends BaseSlotMachineRoom<Player>{
    gameName: string = '猴王传奇';
    removePlayerTimers: { [uid: string]: NodeJS.Timer } = {};

    constructor(opts: any) {
        super(opts);
    }

    /**************************************  工具方法部分 ******************************************/

    init() {
        this.runJackpotTimer();
    }

    /**
     * 添加玩家
     * @param player 玩家基础数据
     */
    addPlayerInRoom(player: any) {
        let currPlayer = new Player(player, this);
        currPlayer.onLine = true;
        this._players.set(player.uid, currPlayer);
        return true
    }


    /****************************************  房间开奖逻辑部分 ************************************/
    async lottery(_player: Player): Promise<{ result: XYJLotteryResult, freeSpinResult: FreeSpinResult }> {
        // 是否是新人玩家 回合小于5 且押注小于300分 采用第一个轮盘
        if (_player.gameRound < 5 && _player.totalBet < 300) {
            // 使用第一个轮盘
            _player.record.nextUse = '1';
            _player.newer = true;
        } else {
            _player.newer = false;
        }

        // 选择此局使用的轮盘
        _player.record.nextUse = regulation.selectRoulette(_player.record.nextUse);

        // 房间内部整体调控 属于收奖调控
        const wR = regulation.wholeRegulation(this.jackpot, this.runningPool);

        // 个体调控 属于游戏内部自然情况下的放奖调控
        const [iR1, iR2] = personalInternalControl(_player.record.recordCount,
            _player.record.nextUse, _player.winPercentage, wR);


        // 创建一个开奖类
        const lotteryUtil = crateXYJLottery(_player.newer, _player.record.nextUse, this.jackpot);
        lotteryUtil.setBetAndLineNum(_player.baseBet, _player.lineNumber)
            .setInternalControl(wR, iR1, iR2)
            .setCharacterAndWinPercentage(_player.getCurrentCharacters(), _player.winPercentage);

        // 获取调控结果
        const result: XYJLotteryResult = await ControlImpl.getControlInstance().runControl(_player, lotteryUtil);

        // 查看是否免费开奖
        let freeSpinResult: FreeSpinResult;
        if (result.characters.length === 5) {
            // 清空玩家的集字
            _player.setCharacters([]);

            // 免费开奖结果
            freeSpinResult = lotteryUtil.freeResult();
        } else {
            _player.setCharacters(result.characters);
        }

        return { freeSpinResult, result };
    }

    /**
     * 结算
     * @param _player 玩家
     * @param result 开奖结果
     * @param freeSpinResult 免费开奖的结果
     */
    async settlement(_player: Player, result: XYJLotteryResult, freeSpinResult: FreeSpinResult) {
        let totalWin = 0, _gold;

        // 添加游戏记录以及更新玩家金币
        _player.setRoundId(this.getRoundId(_player.uid));
        const record = buildRecordResult(_player.baseBet, _player.lineNumber, result);
        const { playerRealWin, gold } = await createPlayerRecordService()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot , _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(_player.roundId, 1,)
            .addResult(record)
            .setControlType(_player.controlType)
            .setGameRecordLivesResult(_player.buildLiveRecord(record))
            .setGameRecordInfo(_player.totalBet, _player.totalBet, result.allTotalWin - _player.totalBet, false)
            .sendToDB(1);

        totalWin += playerRealWin + _player.totalBet;
        _gold = gold;


        // 如果有免费开奖结果 抽水后再返回数据 不可删除
        if (freeSpinResult) {
            freeSpinResult.totalWin = 0;
            for (let i = 0, len = freeSpinResult.results.length; i < len; i++) {
                const freeSpinWin = freeSpinResult.results[i].oneFreeResult.allTotalWin;
                if (freeSpinWin > 0) {
                    const record = buildRecordResult(_player.baseBet, _player.lineNumber, freeSpinResult.results[i].oneFreeResult);
                    const { playerRealWin, gold } = await createPlayerRecordService()
                        .setPlayerBaseInfo(_player.uid, false, _player.isRobot ,_player.gold)
                        .setGameInfo(this.nid, this.sceneId, this.roomId)
                        .setGameRoundInfo(_player.roundId, 1,)
                        .addResult(record)
                        .setControlType(_player.controlType)
                        .setGameRecordLivesResult(_player.buildLiveRecord(record))
                        .setGameRecordInfo(0, 0, freeSpinWin, false)
                        .sendToDB(1);

                    freeSpinResult.results[i].oneFreeResult.allTotalWin = playerRealWin;
                    totalWin += playerRealWin;
                    freeSpinResult.totalWin += playerRealWin;
                    _gold = gold;
                }
            }
        }

        // 如果触发bonus游戏切换玩家状态
        if (result.bonusGame) {
            _player.gameState = 2;
            _player.initBonusProfit(_player.totalBet);
        }


        // 玩家结算
        _player.settlement(totalWin, _gold);

        // 如果触发bonus游戏晚些更新回合id
        // if (!result.bonusGame) {
        //     // _player.setRoundId(this.getRoundId(_player.uid));
        // }

        // 跑马灯
        if (totalWin >= _player.totalBet * 25 && totalWin > 100000) {
            this.sendMaleScreen(_player);
        }

        // 是否中大奖
        if (totalWin >= _player.totalBet * 20) {
            _player.isBigWin = true;
            this.sendBigWinner(_player);
        }

        // 扣除奖池金币
        this.deductRunningPool(playerRealWin + result.jackpotWin);
    }

    /**
     * bonus游戏开奖
     * @param _player 房间玩家
     * @param over 是否放弃游戏
     * @param selectTime 选择时间
     */
    async bonusGameLottery(_player: Player, over: boolean, selectTime: number):
        Promise<{ isOver: boolean, profit: number }> {

        // 结果  isOver代表小游戏是否结束 profit 收益
        const result: { isOver: boolean, profit: number } = { isOver: false, profit: 0 };

        // 如果不放弃 则进行概率判断输赢
        if (!over) {
            // 如果赢了 收益翻倍
            if (Math.random() < (selectTime > 1 ? 0.3 : 0.5)) {
                _player.bonusGameProfit *= 2;
                result.profit = _player.bonusGameProfit;
            } else {
                // 否则收益清零
                _player.bonusGameProfit = 0;

                // 小游戏结束
                result.isOver = true;

                // 游戏状态重置为 spin
                _player.gameState = 1;
            }
        } else {
            _player.record.totalWin += _player.bonusGameProfit;
            _player.record.recordCount++;

            // 减去运行池
            this.deductRunningPool(_player.bonusGameProfit);

            const { playerRealWin, gold } = await createPlayerRecordService()
                .setPlayerBaseInfo(_player.uid, false, _player.isRobot , _player.gold)
                .setGameInfo(this.nid, this.sceneId, this.roomId)
                .setGameRoundInfo(_player.roundId, 1)
                .setControlType(_player.controlType)
                .setGameRecordInfo(_player.totalBet, _player.totalBet, _player.bonusGameProfit)
                .setGameRecordLivesResult(_player.buildLiveRecord('w'))
                .sendToDB(1);

            // 游戏结束
            result.isOver = true;
            // 真实收益
            result.profit = playerRealWin;

            _player.gold = gold;

            // 玩家游戏状态设置为spin
            _player.gameState = 1;
            // 玩家的小游戏清零
            _player.bonusGameProfit = 0;
        }



        return result;
    }

    /**
     * 发送公频
     */
    sendMaleScreen(player: Player) {
        sendBigWinNotice(this.nid, player.nickname, player.profit, player.isRobot,player.headurl);
    }

    /**
     * 发送大赢家
     * @param player
     */
    sendBigWinner(player: Player) {
        notice({
            route: 'onBigWin',
            game: {
                nid: this.nid, nickname: player.nickname,
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
            // mailModule.sendEmailFromSlot({ name: getlanguage(player.language, Net_Message.id_game_name.nid_7) }, {
            //     uid: player.uid,
            //     bet: player.totalBet,
            //     profit: player.profit
            // });

            // 如果没有定时删除 则直接删除玩家
            if (!Reflect.has(this.removePlayerTimers, player.uid)) {
                this.removePlayer(player);
            }
        }
    }

    /**
     * 设置定时删除玩家timer 如果3分钟玩家没有断线重连 则删除玩家
     * @param player 删除玩家
     */
    setRemovePlayerTimer(player: Player) {
        this.removePlayerTimers[player.uid] = setTimeout(async () => {
            // 删除定时器
            this.deleteTimer(player);

            // 移除玩家
            await this.removeOfflinePlayer(player);
        }, 60 * 1000);
    }

    /**
     * 删除定时删除玩家定时器
     * @param player
     */
    deleteTimer(player: Player) {
        clearTimeout(this.removePlayerTimers[player.uid]);
        Reflect.deleteProperty(this.removePlayerTimers, player.uid);
    }
}

