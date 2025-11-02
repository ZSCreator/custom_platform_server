import { QueryRunner } from "typeorm";
import { fixNoRound } from "../../utils/lottery/commonUtil";
import { GameNidEnum } from "../constant/game/GameNidEnum";
import { GameCommissionTargetObjectEnum } from "../constant/hall/GameCommissionTargetObjectEnum";
import { GameCommissionWayEnum } from "../constant/hall/GameCommissionWayEnum";
import { RoleEnum } from "../constant/player/RoleEnum";
import { Player } from "./mysql/entity/Player.entity";
import { GameRecordStatusEnum } from "./mysql/enum/GameRecordStatus.enum";
import GameCommissionManager from "../dao/daoManager/GameCommission.manager";
import AlarmEventThingMysqlDao from "./mysql/AlarmEventThing.mysql.dao";
import PlayerManager from "./daoManager/Player.manager";
import SystemConfigManager from "./daoManager/SystemConfig.manager";
import { lock, unlock } from "./redis/lib/redisManager";
import { changeBonusPoolAmount, changeControlData } from "../../services/newControl/gameControlService";
import AlarmEventThingInRedisDao from "./redis/AlarmEventThing.redis.dao";
import GameRecordDateTableMysqlDao from "./mysql/GameRecordDateTable.mysql.dao";
import ConnectionManager from "./mysql/lib/connectionManager";
import GameManager from "./daoManager/Game.manager";
import { ControlKinds, ControlTypes } from "../../services/newControl/constants";
import { LANGUAGE } from "../../consts/hallConst";

/**
 * 游戏类型   1 ： 电玩类  2 百人类   3 对战类  4 捕鱼类
 */
const gameTypeList = [
    { type: 1, nids: ['1', '7', '10', '11', '12', '41', '44', '52', '54', '15'] },
    { type: 2, nids: ['17', '19', '42', '43', '49', '51', '53', '58', '82', '14', '14', '8', '9', '3', '85', '23'] },
    { type: 3, nids: ['2', '13', '16', '20', '40', '45', '46', '47', '50', '83', '84', '21', '81', '4'] },
    { type: 4, nids: ['6'] },

];

/**
 * 可选属性
 */
class RecordOptionalProps {
    /** 基础属性 */
    roundId: string = "";

    playersNumber: number = 0;

    seat: number = -1;


    game_Records_live_result: any = null;

    /** 对局结果 */
    result: string = null;

    /** 对战游戏，玩家是否已经更新 */
    playerHadUpdateForBattleGame: boolean = false;

    /** 对战游戏,玩家更新后的金币 */
    gold: number;

    stepMine: boolean;
    redPacketGold: number = 0;
}

/**
 * 必选属性
 */
class RecordRequiredProps extends RecordOptionalProps {
    /** 基础属性 */

    player: Player;

    uid: string;

    isRobot: RoleEnum;

    robotGold: number;

    nid: GameNidEnum;

    sceneId: number;

    roomId: string;

    privateRoom: boolean;

    /** 抽利属性 */

    /**
     * @property 下注
     */
    bet: number;

    /**
     * @property 真实下注
     * @description 例如比大小，对冲下注，下注区域的差值
     */
    validBet: number;

    /**
     * @property 是否庄家
     */
    isDealer: boolean;

    /**
     * @property 赢取
     */
    win: number;

    /** 结算属性: 抽利之后 */

    /** 真实获取利 = 赢取 - 抽利 */
    playerRealWin: number;

    /** @property 佣金方式 */
    way: GameCommissionWayEnum = GameCommissionWayEnum.None;

    /** @property 抽取佣金对象 */
    targetCharacter: GameCommissionTargetObjectEnum = GameCommissionTargetObjectEnum.None;

    /** @property 下注抽利比例 */
    bet_commission: number = 0;

    /** @property 赢取抽利比例 */
    win_commission: number = 0;

    /** @property 结算抽利比例 */
    settle_commission: number = 0;

    controlType: ControlKinds = ControlKinds.NONE;

    /** @property 是否开启返佣模式，默认false */
    openUnlimited: boolean = false;

    /** @property 是否开启返佣模式，默认false */
    iplRebate: number = 0;

    /** @property 结算抽利比例 */
    unlimitedList: any[] = [];
}

/**
 * 抽利工具类
 */
class CommissionTool {

    private manager: RecordGeneralManager;

    constructor(manager: RecordGeneralManager) {
        this.manager = manager;
    }

    /**
     * 校验 检测
     */
    private beforeUpdatePlayerCommission() {

    }

    /**
     * 设置基础流水信息
     */
    public setBasedOnWater() {

        /** 记录纯赢取 */
        const { bet, win, nid } = this.manager;

        // this.manager.win = PURE_PROFIT_GAMES.includes(nid) ? win : win - bet;
        this.manager.win = win;

        /** 记录玩家最终盈利字段 */
        // const tmpWin = ALL_WIN_GAMES.includes(nid) ? Math.floor(this.manager.win) : this.manager.win;

        this.manager.playerRealWin = win;
        // this.manager.playerRealWin = fixNoRound(this.manager.win, 2);
    }

    /**
     * 记录最大下注额、日流水、总流水、返佣金币
     * @param player 玩家信息
     */
    public updateBetFlow(player: Player) {
        const { bet, validBet } = this.manager;
        /** 无下注，则不更新 */
        if (bet <= 0) {
            return;
        }

        /** 历史下注记录: 当前是否更高 */
        if (player.maxBetGold < validBet) {
            player.maxBetGold = Math.floor(validBet);
        }

        // 总流水
        player.flowCount = player.flowCount ? Math.floor(player.flowCount + validBet) : Math.floor(validBet);



        /** 私房和排除不计入返佣的游戏 system_config: excludeCommissionGames */

        /** 晚上12点要清零,如果刚好这个时候玩家要更新那么，玩家得码量，今日带入，今日带出 本来要设置成0，因为缓存原因就把缓存得数据存入到数据库中*/
        /** 晚上12点要清零,如果刚好这个时候玩家要更新那么，玩家得码量，今日带入，今日带出 本来要设置成0，因为缓存原因就把缓存得数据存入到数据库中*/
        /** step1 判断是00点 0 -5分钟,在这个区间，带入 addDayRmb，dailyFlow 码量，addDayTixian 设置成0*/
        // const hour = moment().format("HH");
        // const seconds = moment().format("mm");
        // if((hour == '23' && Number(seconds)> 58)|| (hour == '00' && Number(seconds) <= 5)){
        //         if( player.dailyFlow > 20000){
        //             player.dailyFlow = 0;
        //             player.addDayRmb = 0;
        //             player.addDayTixian = 0;
        //         }
        //
        // }

        // 日流水
        player.dailyFlow = player.dailyFlow ? Math.floor(player.dailyFlow + validBet) : Math.floor(validBet);
        // const vipScore = player.addRmb / 100;

        // if (validBet > 0) {
        //     const ratio = getSystemVipRatio(vipScore);
        //     // Vip返水金币
        //     player.todayVipPlayFlowCount += validBet * ratio;
        // }
    }

    /**
     * 计算玩家抽利
     */
    public async updatePlayerCommission() {
        const { nid } = this.manager;
        const gameCommissionOnMysql = await GameCommissionManager.findOne({ nid: nid });
        if (!gameCommissionOnMysql || gameCommissionOnMysql.open == false) {
            return fixNoRound(this.manager.playerRealWin);
        }

        return nid === GameNidEnum.redPacket ? this.redPacketCommission() : this.commonGameCommission();
    }

    /**
     * 佣金计算后：当日最大盈利、累计盈利、预警
     * @param player 玩家信息
     */
    public async afterUpdatePlayerCommission(player: Player, zname: string) {
        const { playerRealWin, validBet, nid, sceneId } = this.manager;
        // 当日最大盈利
        if (player.dayMaxWin < playerRealWin) {
            player.dayMaxWin = playerRealWin;
        }

        player.instantNetProfit = player.instantNetProfit ? Math.floor(player.instantNetProfit + playerRealWin) : Math.floor(playerRealWin);
        player.oneWin = player.oneWin ? Math.floor(player.oneWin + playerRealWin) : Math.floor(playerRealWin);
        /**
         * ToDo 游戏的报警事件
         */

        /** 计算玩家的报警处理 */
        //玩家单次下注大于
        // 初始化配置信息
        let num = 0;
        const { inputGoldThan, winGoldThan, winAddRmb, unlimitedList, openUnlimited, iplRebate } = await SystemConfigManager.findOne({});
        // 设置是否开启返佣模式
        this.manager.openUnlimited = openUnlimited;
        this.manager.unlimitedList = unlimitedList;
        this.manager.iplRebate = iplRebate;


        if (inputGoldThan && inputGoldThan != 0 && validBet >= inputGoldThan) {
            num += 1
            this.addAlarm_event_thing(1, player, playerRealWin, validBet, nid, sceneId, zname);
        }
        // 当日赢取大于
        if (winGoldThan && winGoldThan != 0 && (player.addDayTixian + player.gold - player.addDayRmb) >= winGoldThan) {
            num += 1
            this.addAlarm_event_thing(2, player, playerRealWin, validBet, nid, sceneId, zname);
        }
        // 当日赢取/带入倍数大于
        if (winAddRmb && winAddRmb != 0 && player.oneWin / player.oneAddRmb >= winAddRmb) {
            num += 1
            this.addAlarm_event_thing(3, player, playerRealWin, validBet, nid, sceneId, zname);
        }
        /** step1 添加预警个数*/
        if (num > 0) {
            await AlarmEventThingInRedisDao.addLength({ length: num });
        }

    }


    /**
     *  游戏的报警事件
     */

    private async addAlarm_event_thing(type: number, player: Player, playerRealWin: number, validBet: number, nid: string, sceneId: number, zname: string) {
        const alarm_event = {
            uid: player.uid,                     // uid
            thirdUid: player.thirdUid ? player.thirdUid : '',                // 第三方uid
            gameName: zname,                // 游戏名称
            nid: nid,                     // 游戏nid
            thingType: 1,                // 报警事件,事件类型 1 为玩家事件 2 为游戏启动事件
            type: type,                     //  玩家事件类型  1为单次下注大于   2 为赢取大于  3 为赢取/带入大于
            status: 0,                     // 报警事件是否已经处理  0为未处理 1 为已处理
            input: validBet,                    //下注金额  单位为分
            win: playerRealWin,                    //赢取金额  单位为分
            oneWin: player.oneWin,                // 带入一次的累计赢取金额  单位为分
            oneAddRmb: player.oneAddRmb,             //最近一次带入金额  单位为分
            dayWin: player.addDayTixian + player.gold - player.addDayRmb,                //当日累计赢取金额
            sceneId: sceneId,                //游戏场
            managerId: ''               //处理人
        }
        AlarmEventThingMysqlDao.insertOne(alarm_event);

        // /** step1 添加预警个数*/
        // await AlarmEventThingInRedisDao.addLength({length : 1});
    }

    /** 通用抽利 */
    private async commonGameCommission() {
        const { nid, isDealer, bet, win, playerRealWin } = this.manager;
        let gameCommission = await GameCommissionManager.findOne({ nid });
        if (!gameCommission) {
            return this.manager.playerRealWin;
        }
        const { way, targetCharacter, bet: bet_commission, win: win_commission, settle: settle_commission } = gameCommission;
        /** Step 1: 抽利对象是否符合 */
        if (targetCharacter === GameCommissionTargetObjectEnum.None) {
            return this.manager.playerRealWin;
        }

        if (isDealer && targetCharacter === GameCommissionTargetObjectEnum.Player) {
            return this.manager.playerRealWin;
        }

        if (!isDealer && targetCharacter === GameCommissionTargetObjectEnum.Dealer) {
            return this.manager.playerRealWin;
        }

        /** Step 2: 抽利方式是否符合 */
        if (way === GameCommissionWayEnum.None) {
            return this.manager.playerRealWin;
        }
        // console.warn("抽水之前", this.manager.playerRealWin)
        /** Step 3: 计算抽利 */
        // 押注
        if (bet_commission > 0 &&
            (way === GameCommissionWayEnum.BET || way === GameCommissionWayEnum.WIN_BET)
        ) {
            this.manager.bet_commission = bet * bet_commission;
            this.manager.playerRealWin -= this.manager.bet_commission;

        }

        // 赢取
        if (win_commission > 0 &&
            (way === GameCommissionWayEnum.Win || way === GameCommissionWayEnum.WIN_BET)
        ) {
            this.manager.win_commission = win * win_commission;
            this.manager.playerRealWin -= this.manager.win_commission;

        }

        // 结算
        if (settle_commission > 0 && way === GameCommissionWayEnum.SETTLE) {
            if (win > 0) {
                this.manager.settle_commission = Math.abs(win) * settle_commission;
                if (this.manager.playerRealWin > 0) {
                    this.manager.playerRealWin -= this.manager.settle_commission;
                } else {
                    this.manager.playerRealWin += this.manager.settle_commission;
                }
            }
            // this.manager.playerRealWin -= this.manager.settle_commission;
        }
        return fixNoRound(this.manager.playerRealWin, 3);
    }

    /** 红包抽利 */
    private async redPacketCommission() {
        const { nid, isDealer, bet, win } = this.manager;
        /**
         * @data 2021/3/31
         * @description 统一此函数的 win 输入为 win-input,故此处需要加回来运算
         */
        const realWin = win + bet;

        /* if (isDealer) {
            return this.manager.playerRealWin;
        } */

        const { way, targetCharacter, bet: bet_commission, win: win_commission } = await GameCommissionManager.findOne({ nid: GameNidEnum.redPacket });
        this.manager.way = way;
        this.manager.targetCharacter = targetCharacter;

        /**
         * 庄家抽利
         *       庄 发红包，下注抽利； 结算时，根据中雷数进行 赢取抽利
         *       bet:红包金额
         *       win:中雷数(1-max) * 红包金额    Ps:无人中雷则 -bet
         */
        if (isDealer) {

            /** 押注抽水 */
            if (
                bet_commission > 0 &&
                (way === GameCommissionWayEnum.BET || way === GameCommissionWayEnum.WIN_BET)
            ) {
                this.manager.bet_commission = bet * bet_commission;
            }


            /** 赢取抽水 */
            if (
                win_commission > 0 &&
                (way === GameCommissionWayEnum.Win || way === GameCommissionWayEnum.WIN_BET)
            ) {
                this.manager.win_commission = realWin * win_commission;
            }

            /** 针对庄家:下注即发红包，在对局开始时已抽利 */
            this.manager.playerRealWin -= Math.floor(this.manager.win_commission);

            return Math.round(this.manager.playerRealWin);
        }

        /**
         * 闲家抽利
         *          : 闲 抢红包，根据红包金额抽利；
         *       bet: 红包赔付金额               Ps:未中雷 用 0 表示, >0 表示中雷，bet = 红包金额 * 赔率
         */
        if (win_commission > 0) {

            if (win < 0) {
                this.manager.win_commission = realWin * win_commission;
                // 中雷 有效投注额 
                // this.manager.validBet = realWin;
            } else {
                this.manager.win_commission = win * win_commission;
                // 未中雷展示抢得红包 => 打码量
                this.manager.bet = win;
                this.manager.validBet = win;
            }

            this.manager.playerRealWin -= Math.floor(this.manager.win_commission);
        }

        return Math.round(this.manager.playerRealWin);
    }

}

/**
 * 奖池
 */
class BonusPoolTool {

    private manager: RecordGeneralManager;

    constructor(manager: RecordGeneralManager) {
        this.manager = manager;
    }

    public changeBonusPool(playerRealWin: number) {
        // 机器人不参与累加奖池 获取没有奖池的游戏
        if (this.manager.isRobot === RoleEnum.ROBOT) {
            return;
        }

        let type: ControlTypes = ControlTypes.none;

        switch (this.manager.controlType) {
            case ControlKinds.PERSONAL:
                type = playerRealWin < 0 ? ControlTypes.personalControlWin : ControlTypes.personalControlLoss;
                break;
            case ControlKinds.PLATFORM:
                type = playerRealWin < 0 ? ControlTypes.platformControlWin : ControlTypes.platformControlLoss;
                break;
            case ControlKinds.SCENE:
                type = playerRealWin < 0 ? ControlTypes.sceneControlWin : ControlTypes.sceneControlLoss;
                break;
            default:
                break;
        }

        const commission = this.manager.bet_commission + this.manager.win_commission + this.manager.settle_commission;


        changeControlData({
            nid: this.manager.nid,
            sceneId: this.manager.sceneId,
            betGold: this.manager.validBet,
            profit: playerRealWin,
            uid: this.manager.uid,
            groupRemark: this.manager.player.groupRemark,
            platformId: this.manager.player.group_id,
            serviceCharge: commission,
            controlType: type,
        });
    }
}

/** 记录管理类 */

/**
 * 游戏记录总管理器
 * @description Mysql版
 * 1. 流水
 * 2. 抽利
 */
export class RecordGeneralManager extends RecordRequiredProps {

    private static queryRunner: QueryRunner | null = null;

    private cTool: CommissionTool;

    private bpTool: BonusPoolTool;
    gameRecordId: number;
    tableName: string;

    constructor() {
        super();
        this.cTool = new CommissionTool(this);
        this.bpTool = new BonusPoolTool(this);
    }

    public setPlayerBaseInfo(uid: string, privateRoom: boolean, isRobot: RoleEnum, robotGold: number = 0,) {
        if (isRobot == RoleEnum.ROBOT) {
            this.robotGold = robotGold;
        } else {
            this.robotGold = 0;
        }
        this.uid = uid;
        this.privateRoom = privateRoom;
        this.isRobot = isRobot;
        return this;
    }

    /**
     * 设置游戏记录基础信息
     * @param nid 游戏编号
     * @param sceneId 场编号
     * @param roomId 房间编号
     * @description 必选
     */
    public setGameInfo(nid: GameNidEnum, sceneId: number, roomId: string) {
        this.nid = nid;

        this.sceneId = sceneId;

        this.roomId = roomId;

        return this;
    }

    /**
     * 设置调控类型
     * @param type
     */
    public setControlType(type: ControlKinds) {
        this.controlType = type;

        return this;
    }

    /**
     * 设置当前对局信息
     * @param roundId 对局轮数
     * @param playersNumber 当前房间玩家总数
     * @param seat 座位号
     * @description 可选
     */
    public setGameRoundInfo(roundId: string = "-1", playersNumber: number = -1, seat: number = -1) {
        this.roundId = roundId;

        this.playersNumber = playersNumber;

        this.seat = seat;

        return this;
    }

    /**
     * 针对红包是否中雷
     */
    public isInStepMine(stepMine: boolean = false) {
        this.stepMine = stepMine;
        return this;
    }

    /**
     * 返还红包
     * @param gold 
     */
    public redPacketAmountWithOutGrab(gold: number = 0) {
        this.redPacketGold = gold;
        return this;
    }

    // /**
    //  * 添加游戏开始时间
    //  * @param time 游戏开始时间
    //  */
    // public setStartTimeForGameRecord(time: number) {
    //     this.startTime = time;
    //     return this;
    // }
    //
    // /**
    //  * 添加游戏结束时间
    //  * @param time
    //  */
    // public setEndTimeForGameRecord(time: number) {
    //     this.endTime = time;
    //     return this;
    // }

    /**
     * 添加游戏记录必要信息
     * @param bet 下注金额
     * @param validBet 该值与 bet 相同，区别在于如龙虎斗类型的游戏，同时投，但最终生效应是差值：如投龙50，虎100，那么此时 validBet 应是50。
     * @param win 纯利润（正负）既是本局改变的金额
     * @param isDealer 是否庄家
     */
    public setGameRecordInfo(bet: number, validBet: number, win: number, isDealer: boolean = false) {
        this.bet = bet;
        this.validBet = validBet;
        this.win = win;
        this.isDealer = isDealer;

        return this;
    }

    public setGameRecordLivesResult(result: any = null) {
        if (this.isRobot !== RoleEnum.REAL_PLAYER) {
            return this;
        }

        this.game_Records_live_result = result;
        return this;
    }

    public addResult(result: string = null) {
        // 不是真人玩家允许添加
        if (this.isRobot !== RoleEnum.REAL_PLAYER) {
            return this;
        }

        this.result = result;
        return this;
    }

    /**
     * 更新进数据库
     * @param updateRecord 是否更新游戏记录，否则插入
     * @param updatePlayerGold 是否更新玩家金币
     */
    public async sendToDB(gameRecordStatus: GameRecordStatusEnum, updatePlayerGold: boolean = true) {
        // 如果是机器人走另外一套逻辑
        if (this.isRobot === RoleEnum.ROBOT) {
            return this.sendToDBForBattleByRobot();
        }
        this.cTool.setBasedOnWater();

        const _lock = await lock(this.uid);

        /** Step 1: 查询并封装基础信息 */
        ///@ts-ignore
        const playerInfo: Player = await PlayerManager.findOne({ uid: this.uid });

        if (!playerInfo) {
            throw new Error(`未查询到当前玩家: ${this.uid} 信息或游戏: ${this.nid} 配置信息`);
        }

        const playerRep = ConnectionManager.getRepository(Player);

        const player = playerRep.create(playerInfo);
        this.player = player;


        /** Step 3: 计算抽利 */
        let playerRealWin = await this.cTool.updatePlayerCommission();

        /** Step 2: 记录流水 */
        this.cTool.updateBetFlow(player);

        let updateGold = 0;
        let beResetGold = false;
        // 是否更新玩家金币
        if (updatePlayerGold) {
            const _val = parseFloat((player.gold + playerRealWin).toFixed(3));
            // console.warn(`更新前玩家金币 ${player.gold} | 计算的结果 ${_val}`);

            if (playerRealWin > 0) {
                player.gold = _val

                updateGold = playerRealWin;
            } else {
                // player.gold += playerRealWin;

                player.gold = _val

                updateGold = playerRealWin;
                if (player.gold < 0) {
                    beResetGold = true;
                    player.gold = 0;
                    console.error(`玩家: ${this.uid} | 金币不足`);
                }

            }
            // console.warn(`更新后玩家金币 ${player.gold} | 计算的结果 ${_val}`);
            if (this.redPacketGold > 0) {
                // updateGold += this.redPacketGold;

                updateGold = parseFloat((updateGold + this.redPacketGold).toFixed(3));
                playerRealWin += this.redPacketGold;
            }
        }

        /** Step 4: ToDo 改变奖池 */
        this.bpTool.changeBonusPool(playerRealWin);

        let game = await GameManager.findOne({ nid: this.nid });
        let gameName = game ? game.zname : null;
        if (gameRecordStatus == GameRecordStatusEnum.DeductingPoundage) {
            gameName = `${gameName}-下庄扣费`;
        }
        /** Step 4.2: ToDo 记录流水和预警事件 */

        await this.cTool.afterUpdatePlayerCommission(player, gameName);

        try {
            /** Step 5: 更新各记录 */
            const {
                uid,
                nid,
                sceneId,
                roomId,
                roundId,
                isDealer,
                bet,
                validBet,
                win,
                bet_commission,
                win_commission,
                settle_commission,
                game_Records_live_result,
            } = this;

            let withdrawalChips = 0;
            // 等于0表示没有充值情况
            if (player.withdrawalChips !== 0 && player.language === LANGUAGE.Portugal) {
                if (player.withdrawalChips > 0) {
                    // 距提现码量 = 该玩家上一次 减去当前游戏的有效码量;
                    withdrawalChips = player.withdrawalChips - validBet;
                } else {
                    // 表示已可提现, 超出码量无意义;
                    withdrawalChips = -1;
                }
            }
            await PlayerManager.updateOneForRecordGeneral(uid, {
                gold: updateGold,
                instantNetProfit: player.instantNetProfit,
                oneWin: player.oneWin,
                maxBetGold: player.maxBetGold,
                flowCount: player.flowCount,
                dailyFlow: player.dailyFlow,
                withdrawalChips,
            }, beResetGold);

            // 真实玩家才更新数据库各记录和日志
            if (player.isRobot === RoleEnum.REAL_PLAYER) {
                // 5.2 插入or更新游戏记录，
                const { thirdUid, groupRemark, gold, group_id } = player;

                const multiple = bet > 0 ? parseInt((win / bet).toFixed(3)) : 0;
                /** 设置订单号*/
                let gameOrder = null;
                // let time = moment().format("YYYYMMDDHHmmssSSS");
                let time = Date.now();
                if (group_id) {
                    gameOrder = `${group_id}-${uid}-${time}`;
                } else {
                    gameOrder = `888-${uid}-${time}`;
                }
                /** 获取游戏对应的游戏类型*/
                let gameType = null;
                for (let key of gameTypeList) {
                    const item = key.nids.find(x => x == nid);
                    if (item) {
                        gameType = key.type;
                        break;
                    }
                }
                // 新增
                const gameRecord = {
                    uid,
                    thirdUid: thirdUid,
                    group_id: group_id ? group_id : null,
                    nid,
                    gameName: gameName,
                    sceneId,
                    roomId,
                    roundId,
                    gameType,
                    input: bet,
                    validBet,
                    profit: playerRealWin,
                    bet_commission,
                    win_commission,
                    settle_commission,
                    gameOrder: gameOrder,
                    gold,
                    status: gameRecordStatus,
                    multiple,
                    groupRemark: groupRemark,
                    isDealer,
                    result: this.result,
                    game_Records_live_result,
                    createTimeDate: new Date()
                }

                const { tableName, insertId } = await GameRecordDateTableMysqlDao.insertOne(gameRecord);
                this.gameRecordId = insertId;
                this.tableName = tableName;

                // this.gameRecordId = id;
                //5.4 将该记录存入到redis 里面
                // const scene = await SceneManager.findOne({ nid, sceneId });
                // const sceneName = scene ? scene.name : sceneId;

                // gameRecord['sceneName'] = sceneName;
                // await GameRecordRedisDao.lPush(new GameRecordInRedis(gameRecord));
                //玩家每个游戏保留最近10条记录，保留时间7天
                // await GameRecordRedisDao.insertGameRecordForUid(new GameRecordInRedis(gameRecord));
            }
            // 判断玩家下局是否必杀
            // await changePlayerKillControl(player);

            const lastP = await PlayerManager.findOne({ uid });

            //这个临时字段，是用来，记录红包未抢完，返还的部分
            if (this.redPacketGold > 0) {
                playerRealWin -= this.redPacketGold;
            }

            let gold = lastP ? lastP.gold : 0;

            return { playerRealWin, gameRecordId: this.gameRecordId, gold: gold, tableName: this.tableName, beResetGold };
        } catch (e) {
            console.error(`游戏: ${this.nid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 玩家: ${this.uid}记录更新出错:${e.stack}`);
            return Promise.reject();
        } finally {
            await unlock(_lock);
        }
    }

    /**
     * 体验结算流程
     * @param gold 玩家先有金币
     * @param updatePlayerGold 是否更新金币
     */
    public async experienceSettlement(gold: number, updatePlayerGold: boolean = true) {
        this.cTool.setBasedOnWater();
        /** Step 3: 计算抽利 */
        let playerRealWin = await this.cTool.updatePlayerCommission();
        // 是否更新玩家金币
        if (updatePlayerGold) {
            if (playerRealWin > 0) {
                gold = gold + playerRealWin;
            } else {
                gold += playerRealWin;
                if (gold < 0) {
                    gold = 0;
                }
            }
        }
        return { playerRealWin, gameRecordId: this.gameRecordId, gold: gold };
    }

    /**
     * 对战游戏专用3
     * @description 对局结束后补充对局记录，关联玩家记录
     */
    public async Later_updateRecord(result: any) {
        this.game_Records_live_result = result;
        // 如果是机器人走另外一套逻辑
        if (this.isRobot === RoleEnum.ROBOT) {
            return;
        }

        try {
            const gameRecord = {
                game_Records_live_result: this.game_Records_live_result
            };
            GameRecordDateTableMysqlDao.updateOne(this.tableName, { id: this.gameRecordId }, gameRecord);
            return;
        } catch (e) {
            console.error(`游戏: ${this.nid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 玩家: ${this.uid}记录更新出错:${e.stack}`);
            return Promise.reject();
        }

    }



    /**
     * 机器人专用
     * @description
     */
    public async sendToDBForBattleByRobot(updatePlayerGold: boolean = true) {
        this.cTool.setBasedOnWater();
        /** Step 3: 计算抽利 */
        let playerRealWin = await this.cTool.updatePlayerCommission();
        let beResetGold = false;
        // if(this.robotGold !== 0){
        if (updatePlayerGold) {
            if (playerRealWin > 0) {
                this.robotGold = this.robotGold + playerRealWin;
            } else {
                const temp_gold = this.robotGold;
                this.robotGold += playerRealWin;
                if (this.robotGold < 0) {
                    this.robotGold = 0;
                    beResetGold = true;
                    console.warn(`机器人: ${this.uid} | 金币不足|${this.bet}|${temp_gold}|${playerRealWin}|${this.isDealer}`);
                }
            }
        }
        return { playerRealWin, gold: this.robotGold, beResetGold };
        // }

        /** Step 1: 查询并封装基础信息 */
        /// @ts-ignore
        // const robotInfo: Robot = await RobotManager.findOne({ uid: this.uid });
        //
        // if (!robotInfo) {
        //     throw new Error(`未查询到当前玩家: ${this.uid} 信息或游戏: ${this.nid} 配置信息`);
        // }
        //
        // const playerRep = ConnectionManager.getRepository(Robot);
        //
        // const robot = playerRep.create(robotInfo);
        //
        //
        //
        // // 是否更新玩家金币
        // // let beResetGold = false;
        // if (updatePlayerGold) {
        //     if (playerRealWin > 0) {
        //         robot.gold = robot.gold + playerRealWin;
        //     } else {
        //         const temp_gold = robot.gold;
        //         robot.gold += playerRealWin;
        //         if (robot.gold < 0) {
        //             robot.gold = 0;
        //             beResetGold = true;
        //             console.error(`机器人: ${this.uid} | 金币不足|${this.bet}|${temp_gold}|${playerRealWin}|${this.isDealer}`);
        //         }
        //     }
        // }

        /** Step 4: ToDo 改变奖池 */
        // this.bpTool.changeBonusPool();
        // console.warn("机器人gold",robot.gold ,playerRealWin );
        /** Step 5: 更新机器人信息 */
        try {
            // await RobotRedisDao.updateOne({ uid: this.uid }, { gold: robot.gold });
            // return { playerRealWin, gold: robot.gold, beResetGold };
        } catch (e) {
            // console.error(`游戏: ${this.nid} | 场: ${this.sceneId} | 房间: ${this.roomId} | 机器人: ${this.uid}|robot.gold:${robot.gold}|playerRealWin:${playerRealWin}记录更新出错:${e.stack}`);
            return Promise.reject();
        }
    }



}

export default function createPlayerRecordService() {
    return new RecordGeneralManager();
}
// export default new RecordGeneralManager();
