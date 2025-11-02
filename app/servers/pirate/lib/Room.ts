import regulation = require('../../../domain/games/regulation');
import ControlImpl from "./control";
import {notice} from "../../../services/MessageService";
import Player from "./Player";
import { createPirateLottery, PirateResult } from './util/lotteryUtil';
import BaseSlotMachineRoom from "../../../common/classes/game/slotMachineRoom";
import { genRoundId } from "../../../utils/utils";
import {
    freeSpinTreasureChest,
    goldTreasureChest,
    ITreasureChest, keyTreasureChest,
    perspectiveTreasureChest
} from "./config/treasureChest";
import { getLogger } from 'pinus-logger';
import { buildRecordResult, buildLittleGameResult } from "./util/recordUtil";
import createPlayerRecordService from "../../../common/dao/RecordGeneralManager";

/**
 * 寻宝奇航房间类
 * @property _players 玩家列表
 * @property runningPool 运行池 该池只属于单个房间 不属于公共调控池 后续考虑清除
 * @property profitPool 盈利池  该池只属于单个房间 不属于公共调控池 后续考虑清除
 */
export default class RoomStandAlone extends BaseSlotMachineRoom<Player>{
    gameName: string = '寻宝奇航';
    Logger = getLogger('server_out', __filename);
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
        return true;
    }


    /****************************************  房间开奖逻辑部分 ************************************/
    async lottery(_player: Player): Promise<PirateResult> {
        // 选择此局使用的轮盘
        _player.record.nextUse = regulation.selectRoulette(_player.record.nextUse);

        // 创建一个开奖类 如果是免费开奖次数大于0 则代表是免费开奖
        const lotteryUtil = createPirateLottery();
        lotteryUtil.setTotalBetAndMultiply(_player.totalBet, _player.multiply)
            .setFreeSpin(_player.freeSpinCount > 0);

        // 获取调控结果
        return await ControlImpl.getControlInstance().runControl(_player, lotteryUtil);
    }

    /**
     * 宝箱开奖
     * @param _player 开奖玩家
     * @param index 开奖宝箱下标
     */
    async boxLottery(_player: Player, index: number) {
        const treasureChest: ITreasureChest = _player.treasureChestList[index];

        // 一旦选择则都选为已打开和可见
        treasureChest.open = true;
        treasureChest.visible = true;
        // 钥匙-1
        _player.keyCount--;

        let profit = 0;

        // 如果是金币宝箱
        if (treasureChest.type === goldTreasureChest) {
            // 倍率 * 上一次的押注
            profit = treasureChest.specialAttributes * _player.totalBet;
        } else if (treasureChest.type === freeSpinTreasureChest) {
            // 如果是免费摇奖则添加免费摇奖的次数
            _player.freeSpinCount += treasureChest.specialAttributes;
        } else if (treasureChest.type === perspectiveTreasureChest) {
            // 如果是透视宝箱设置为可见
            _player.treasureChestList.forEach(box => box.visible = true);
        } else if (treasureChest.type === keyTreasureChest) {
            // 如果是钥匙宝箱 钥匙加1
            _player.keyCount += treasureChest.specialAttributes;
        }

        if (profit > 0) {
            // 添加游戏记录以及更新玩家金币
            const record = buildLittleGameResult(_player.totalBet, treasureChest.specialAttributes);
            const roundId = genRoundId(this.nid, this.roomId, _player.uid);
            const { playerRealWin, gold } = await createPlayerRecordService()
                .setPlayerBaseInfo(_player.uid, false, _player.isRobot , _player.gold)
                .setGameInfo(this.nid, this.sceneId, this.roomId)
                .setGameRoundInfo(roundId, 1,)
                .addResult(record)
                .setControlType(_player.controlType)
                .setGameRecordLivesResult(_player.buildLiveRecord(record))
                .setGameRecordInfo(0, 0, profit)
                .sendToDB(1);

            _player.gold = gold;
            profit = playerRealWin;
        }


        return profit
    }



    /**
     * 结算
     * @param _player 玩家
     * @param result 开奖结果
     * @param isFreeSpin 是否是免费开奖
     */
    async settlement(_player: Player, result: PirateResult, isFreeSpin: boolean = false) {
        // 如果是免费开奖押注不算
        const bet = isFreeSpin ? 0 : _player.totalBet;


        // 添加游戏记录以及更新玩家金币
        _player.setRoundId(this.getRoundId(_player.uid));
        const record = buildRecordResult(_player.multiply, result, bet);
        const { playerRealWin, gold } = await createPlayerRecordService()
            .setPlayerBaseInfo(_player.uid, false, _player.isRobot , _player.gold)
            .setGameInfo(this.nid, this.sceneId, this.roomId)
            .setGameRoundInfo(_player.roundId, 1,)
            .addResult(record)
            .setControlType(_player.controlType)
            .setGameRecordLivesResult(_player.buildLiveRecord(record))
            .setGameRecordInfo(bet, bet, result.totalWin - bet)
            .sendToDB(1);

        // 玩家结算
        _player.settlement(playerRealWin, result.goldCount, gold, isFreeSpin);

        // 如果是免费开奖次数减一
        if (isFreeSpin) {
            _player.freeSpinCount--;
        }


        // 跑马灯
        if (playerRealWin >= _player.totalBet * 25 && playerRealWin > 100000) {
            this.sendMaleScreen(_player);
        }

        // 扣除奖池金币
        this.deductRunningPool(playerRealWin + result.jackpotWin);
    }

    /**
     * 发送公频
     */
    sendMaleScreen(player: Player) {
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
            // mailModule.sendEmailFromSlot({ name: '寻宝奇航' }, {
            //     uid: player.uid,
            //     bet: player.totalBet,
            //     profit: player.profit
            // });
        }
    }
}

