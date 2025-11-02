
import ControlImpl from "./control";
import { buildRecordResult } from "./util/recordUtil";
import { sendBigWinNotice } from "../../../services/MessageService";
import Player from "./scratchPlayer"
import { crateSlotLottery, ScratchCardResult } from './util/lotteryUtil';
import BaseSlotMachineRoom from "../../../common/classes/game/slotMachineRoom";
import createPlayerRecordService from "../../../common/dao/RecordGeneralManager";


/**
 * scratch房间类
 * @property _players 玩家列表
 * @property runningPool 运行池 该池只属于单个房间 不属于公共调控池 后续考虑清除
 * @property profitPool 盈利池  该池只属于单个房间 不属于公共调控池 后续考虑清除
 */
export default class RoomStandAlone extends BaseSlotMachineRoom<Player>{
    gameName: string = '刮刮乐';

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
        let currPlayer = new Player(player);
        currPlayer.onLine = true;
        this._players.set(player.uid, currPlayer);
        return true;
    }


    /****************************************  房间开奖逻辑部分 ************************************/
    async lottery(_player: Player): Promise<ScratchCardResult> {
        // 创建一个开奖类
        const lotteryUtil = crateSlotLottery();

        // 获取调控结果
        return await ControlImpl.getControlInstance().runControl(_player, lotteryUtil);
    }

    /**
     * 结算
     * @param _player 玩家
     * @param result 开奖结果
     */
    async settlement(_player: Player, result: ScratchCardResult) {
        const record = buildRecordResult(_player, result.card);

        // 添加游戏记录以及更新玩家金币
        _player.setRoundId(this.getRoundId(_player.uid));
        const { playerRealWin, gold } = await createPlayerRecordService()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot , _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(_player.roundId, 1)
            .addResult(record)
            .setControlType(_player.controlType)
            .setGameRecordLivesResult(_player.buildGameLiveResult(record))
            .setGameRecordInfo(_player.bet, _player.bet, result.totalWin - _player.bet)
            .sendToDB(1);

        // 玩家结算
        _player.settlement(playerRealWin + _player.bet, gold);

        // console.warn('玩家赢取', playerRealWin, player.gold, _player.gold, _player.totalBet, _player.profit);




        // 跑马灯
        if (Math.floor(playerRealWin / _player.bet) >= 50) {
            this.sendMaleScreen(_player);
        }
    }

    /**
     * 发送公频
     */
    sendMaleScreen(player: Player) {
        sendBigWinNotice(this.nid, player.nickname, player.profit, player.isRobot, player.headurl);
    }
}

