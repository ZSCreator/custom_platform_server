import ControlImpl from "./control";
import { notice, sendBigWinNotice } from "../../../services/MessageService";
import Player from "./Player";
import BaseSlotMachineRoom from "../../../common/classes/game/slotMachineRoom";
import { cratePharaohLottery, getThrowingCount, PharaohLotteryResult, throwingDiceResult } from "./util/lotteryUtil";
import { littleGameLayout } from "./config/littleGame";
import { sum } from "../../../utils";
import {buildRecordResult, buildLittleGameResult} from "./util/recordUtil";
import createPlayerRecordService from "../../../common/dao/RecordGeneralManager";


/**
 * 埃及夺宝房间类
 * @property _players 玩家列表
 */
export default class RoomStandAlone extends BaseSlotMachineRoom<Player> {
    gameName: string = '埃及夺宝';
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
    async lottery(_player: Player): Promise<PharaohLotteryResult> {
        // 创建一个开奖类
        const lotteryUtil = cratePharaohLottery(_player.newer, this.jackpot);

        // 设置押注额 和 雷管的数量
        lotteryUtil.setTotalBet(_player.totalBet)
            .setDetonatorCount(_player.detonatorCount);

        // 获取调控结果
        return await ControlImpl.getControlInstance().runControl(_player, lotteryUtil);
    }

    /**
     * 结算
     * @param _player 玩家
     * @param result 开奖结果
     */
    async settlement(_player: Player, result: PharaohLotteryResult) {
        let totalWin = 0;

        // 添加游戏记录以及更新玩家金币
        _player.setRoundId(this.getRoundId(_player.uid));
        const record = buildRecordResult(_player.gameLevel, result.winningDetails);
        const {playerRealWin, gold} = await createPlayerRecordService()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot , _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(_player.roundId, 1, )
            .addResult(record)
            .setControlType(_player.controlType)
            .setGameRecordInfo(_player.totalBet, _player.totalBet, result.totalWin - _player.totalBet, false)
            .setGameRecordLivesResult(_player.buildGameLiveResult(record))
            .sendToDB(1);

        totalWin += playerRealWin + _player.totalBet;

        // 玩家结算
        _player.settlement(totalWin, gold);

        // 跑马灯
        if (totalWin >= _player.totalBet * 20 && totalWin > 100000) {
            this.sendMaleScreen(_player);
        }

        // 是否中大奖
        if (totalWin >= _player.totalBet * 20) {
            _player.isBigWin = true;
            this.sendBigWinner(_player);
        }

        // 如果奖池出奖了
        // if (result.jackpotTypeList.length) {
        //     this.sendJackpotPrizeNotice(_player, result);
        // }

        // 累加雷管数量
        _player.addDetonator(result.roundDetonatorCount);


        // 如果雷管数量大于等于45个 说明通关 初始化累积
        if (_player.detonatorCount >= 45) {
            _player.initDetonatorCount();
        }

        // 更新游戏关卡和玩家小游戏信息
        _player.updateGameLevelAndPlayerGameState();

        // 扣除奖池金币
        this.deductRunningPool(playerRealWin + result.jackpotWin)
            .deductJackpot(result.jackpotWin);
    }

    /**
     * bonus游戏开奖
     * @param _player 房间玩家
     */
    async littleGameLottery(_player: Player):
        Promise<any> {

        // 获取随机投掷的点数
        const count = getThrowingCount();
        _player.currentPosition += count;
        _player.throwCount = count;

        // 如果超限了说则通关
        if (_player.currentPosition > littleGameLayout[_player.littleGameLevel].length) {
            _player.currentPosition = littleGameLayout[_player.littleGameLevel].length;
        }

        // 记录历史位置
        _player.historyPosition.push(_player.currentPosition);

        // 当前位置的开奖类型 比如金币 银币 或者空位
        const awardType = littleGameLayout[_player.littleGameLevel][_player.currentPosition - 1];
        _player.currentAwardType = awardType;

        // 根据投掷结果结算开奖类型
        const result = throwingDiceResult(_player.totalBet, awardType,
            _player.littleGameAccumulate, this.jackpot);

        // 修改投掷次数
        _player.throwNum += (result.throwNum - 1);

        // 平时流出的走普通奖池 有奖池的走奖池
        this.deductRunningPool(result.award[0]).deductJackpot(result.jackPotGain);

        // 有收益才进行统计
        if (sum(result.award) > 0) {
            const record = buildLittleGameResult(_player.gameLevel, awardType);
            // 添加游戏记录以及更新玩家金币
            const {playerRealWin, gold} = await createPlayerRecordService()
                .setPlayerBaseInfo(_player.uid, false, _player.isRobot ,_player.gold)
                .setGameInfo(this.nid, this.sceneId, this.roomId)
                .setGameRoundInfo(_player.roundId, 1, )
                .addResult(record)
                .setControlType(_player.controlType)
                .setGameRecordInfo(0, 0, sum(result.award))
                .setGameRecordLivesResult(_player.buildLittleGameLiveResult(record))
                .sendToDB(1);

            _player.littleGameSettlement(playerRealWin, gold);
        } else {
            _player.littleGameWin = 0;
        }


        // 如果中了宝箱
        if (result.bigPrizeType) {
            this.sendBoxAwards(result, _player);
        }

        // 如果投掷次数为零或者位置为最后一个位置代表结束
        if (_player.throwNum === 0 || _player.currentPosition === littleGameLayout[_player.littleGameLevel].length) {
            // 改变玩家状态
            _player.setSpinState();

            // 如果小游戏等级为3关则代表通关
            if (_player.littleGameLevel === 3) {
                _player.customsClearance = true;
            }
        }

        return result;
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
     * 发送奖池出奖公告
     * @param player 玩家
     * @param result 开奖结果
     */
    sendJackpotPrizeNotice(player: Player, result: PharaohLotteryResult) {
        result.jackpotTypeList.forEach((type, i) => {
            const jackpotType = type === 'king' ? 'colossal' : (type === 'diamond' ?
                'monster' : (type === 'platinum' ? 'mega' : 'mini'));
            notice({
                route: 'onJackpotWin',
                game: {
                    nid: this.nid,
                    nickname: player.nickname,
                    name: '埃及夺宝',
                    num: result.jackpotWinList[i],
                    jackpotType,
                },
                uid: player.uid,
                language: player.language,
            });
        });
    }

    /**
     * 给离线玩家发送邮件且删除玩家
     * @param player
     */
    sendMailAndRemoveOfflinePlayer(player: Player) {
        if (!player.onLine) {
            // mailModule.sendEmailFromSlot({ name: '埃及夺宝' }, {
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

