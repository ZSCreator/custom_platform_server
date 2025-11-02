import { sendBigWinNotice } from "../../../services/MessageService";
import Player from "./Player";
import BaseSlotMachineRoom from "../../../common/classes/game/slotMachineRoom";
import {createLWLottery, LWLotteryResult} from "./util/lotteryUtil";
import { buildRecordResult } from "./util/recordUtil";
import createPlayerRecordService from "../../../common/dao/RecordGeneralManager";
import Control from "./control";


/**
 * 幸运转盘房间类
 * @property _players 玩家列表
 */
export default class RoomStandAlone extends BaseSlotMachineRoom<Player>{
    gameName: string = '幸运转盘';
    removePlayerTimers: { [uid: string]: NodeJS.Timer } = {};
    control: Control = new Control({room: this});

    constructor(opts: any) {
        super(opts);
    }

    /**************************************  工具方法部分 ******************************************/

    init() {
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
    async lottery(_player: Player): Promise<LWLotteryResult> {
        // 创建一个开奖类
        const lotteryUtil = createLWLottery(_player.totalBet);

        return await this.control.runControl(_player, lotteryUtil);
    }

    /**
     * 结算
     * @param _player 玩家
     * @param result 开奖结果
     */
    async settlement(_player: Player, result: LWLotteryResult) {
        let totalWin = 0, _gold;

        // 添加游戏记录以及更新玩家金币
        _player.setRoundId(this.getRoundId(_player.uid));
        const record = buildRecordResult(_player.totalBet, result);
        const { playerRealWin, gold } = await createPlayerRecordService()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot , _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(_player.roundId, 1,)
            .addResult(record)
            .setControlType(_player.controlType)
            .setGameRecordLivesResult(_player.buildLiveRecord(record, result.result))
            .setGameRecordInfo(_player.totalBet, _player.totalBet, result.profit - _player.totalBet, false)
            .sendToDB(1);

        totalWin += playerRealWin + _player.totalBet;
        _gold = gold;

        // 玩家结算
        _player.settlement(totalWin, _gold);

        // 跑马灯
        // if (totalWin >= _player.totalBet * 25 && totalWin > 100000) {
        //     this.sendMaleScreen(_player);
        // }

        // 是否中大奖
        // if (totalWin >= _player.totalBet * 20) {
        //     _player.isBigWin = true;
        //     this.sendBigWinner(_player);
        // }
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
        // notice({
        //     route: 'onBigWin',
        //     game: {
        //         nid: this.nid, nickname: player.nickname, name:  getlanguage(player.language, Net_Message.id_game_name.nid_7),
        //         num: player.profit, gold: '金币',
        //         odd: Math.floor(player.profit / player.totalBet),
        //     },
        //     uid: player.uid,
        //     nickname: player.nickname,
        //     content: '',
        //     des: ''
        // }, function () { });
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

