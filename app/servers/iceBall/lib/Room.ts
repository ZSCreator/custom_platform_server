import ControlImpl from "./control";
import { notice, sendBigWinNotice } from "../../../services/MessageService";
import Player from "./Player";
import BaseSlotMachineRoom from "../../../common/classes/game/slotMachineRoom";
import { crateIceBallLottery, IceBallLotteryResult } from "./util/lotteryUtil";
import {buildRecordResult} from "./util/recordUtil";
import createPlayerRecordService from "../../../common/dao/RecordGeneralManager";


/**
 * 冰球突破房间类
 * @property _players 玩家列表
 */
export default class RoomStandAlone extends BaseSlotMachineRoom<Player> {
    gameName: string = '冰球突破';
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
        return true;
    }


    /****************************************  房间开奖逻辑部分 ************************************/
    async lottery(_player: Player): Promise<IceBallLotteryResult> {
        // 创建一个开奖类
        const lotteryUtil = crateIceBallLottery(_player.newer, this.jackpot);

        lotteryUtil.setTotalBet(_player.baseBet, _player.lineNum);

        // 获取调控结果
        return await ControlImpl.getControlInstance().runControl(_player, lotteryUtil);
    }

    /**
     * 结算
     * @param _player 玩家
     * @param result 开奖结果
     */
    async settlement(_player: Player, result: IceBallLotteryResult) {
        // 添加游戏记录以及更新玩家金币
        _player.setRoundId(this.getRoundId(_player.uid));
        const record = buildRecordResult(_player.baseBet, _player.lineNum, result.roundWindows, false);
        const {playerRealWin, gold} = await createPlayerRecordService()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot , _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(_player.roundId, 1, )
            .addResult(record)
            .setControlType(_player.controlType)
            .setGameRecordInfo(_player.totalBet, _player.totalBet, result.totalWin - _player.totalBet, false)
            .setGameRecordLivesResult(_player.buildGameLiveResult(record))
            .sendToDB(1);

        let totalWin = playerRealWin + _player.totalBet, _gold = gold;

        // 如果有免费开奖结果 抽水后再返回数据 不可删除
        if (result.freeSpin) {
            for (let i = 0, len = result.freeSpinResult.length; i < len; i++) {
                const freeSpinWin = result.freeSpinResult[i].totalWin;
                if (freeSpinWin > 0) {
                    const record = buildRecordResult(_player.baseBet, _player.lineNum, result.freeSpinResult[i].roundWindows,
                        true);
                    const { playerRealWin, gold } = await createPlayerRecordService()
                        .setPlayerBaseInfo(_player.uid, false, _player.isRobot, _player.gold)
                        .setGameInfo(this.nid, this.sceneId, this.roomId)
                        .setGameRoundInfo(_player.roundId, 1,)
                        .addResult(record)
                        .setControlType(_player.controlType)
                        .setGameRecordLivesResult(_player.buildGameLiveResult(record))
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

        // 跑马灯
        if (totalWin >= _player.totalBet * 20 && totalWin > 100000) {
            // this.sendMaleScreen(_player);
        }

        // 是否中大奖
        if (totalWin >= _player.totalBet * 20) {
            _player.isBigWin = true;
            // this.sendBigWinner(_player);
        }
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
        }, function () {});
    }

    /**
     * 给离线玩家发送邮件且删除玩家
     * @param player
     */
    sendMailAndRemoveOfflinePlayer(player: Player) {
        if (!player.onLine) {
            // mailModule.sendEmailFromSlot({ name: '冰球突破' }, {
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
     * 发送宝箱大奖
     * @param result 投掷结果
     * @param player 玩家
     */
    sendBoxAwards(result: any, player: Player) {
        const type = result.bigPrizeType === 'king' ? 'colossal' : (result.bigPrizeType === 'diamond' ?
            'monster' : (result.bigPrizeType === 'platinum' ? 'mega' : 'mini'));
        notice({
            route: 'onJackpotWin',
            game: {
                nid: this.nid,
                nickname: player.nickname,
                num: Math.floor(result.jackPotGain),
                jackpotType: type,
            },
            uid: player.uid,
            language: player.language,
        });
    }

    /**
     * 设置定时删除玩家timer 如果3分钟玩家没有断线重连 则删除玩家
     * @param player 删除玩家
     */
    setRemovePlayerTimer(player: Player) {
        this.removePlayerTimers[player.uid] = setTimeout(async () => {
            // 删除定时器
            this.deleteTimer(player);

            // 移除离线玩家
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

