import RoomStandAlone from "./Room";
import SlotMachinePlayer from "../../../common/classes/game/slotMachinePlayer";
import { match } from "ramda";
import createPlayerRecordService from "../../../common/dao/RecordGeneralManager";
import utils = require('../../../utils');
import { buildRecordResult } from "./util/recordUtil";
import { ControlKinds } from "../../../services/newControl/constants";


/**
 * 糖果派对玩家
 * @property profit 收益
 * @property totalBet 总押注
 * @property baseBet 基础押注
 * @property betOdds 押注倍率
 * @property newer 是否是新玩家
 * @property isBigWin 是否中大奖
 * @property bonusGameProfit bonus小游戏收益
 * @property gameLevel 当前所处游戏等级
 * @property roundId  回合id
 */
export default class Player extends SlotMachinePlayer {
    profit: number = 0;
    totalBet: number = 0;
    // baseBet: number = 0;
    isSettlement = false;
    room: RoomStandAlone;
    newer: boolean = false;
    isBigWin: boolean = false;
    roundId: string;
    detonatorCount: number;
    window: {
        /**类型 */
        type: "A" | "B" | "X";
        /**0 未开 1开 */
        open: number;
    }[][] = [];
    diamond: number;
    coefficient = 0;
    coefficient2 = 0;
    Details: {
        /**类型 */
        type: string;
        X: number,
        Y: number,
    }[] = [];
    limit: number = 0;

    constructor(opts: any, room: RoomStandAlone) {
        super(opts);
        this.room = room;
    }

    /**
     * 初始化玩家数据
     */
    init() {
        this.profit = 0;
        this.totalBet = 0;
        this.isSettlement = false;
        this.isBigWin = false;
        this.diamond = 0;
        this.coefficient = 0;
        this.coefficient2 = 0;
        this.Details = [];
        this.initControlType();
    }

    /**
     * 设置回合id
     * @param roundId
     */
    setRoundId(roundId: string) {
        this.roundId = roundId;
    }

    /**
     * 押注
     * @param baseBet 基础押注
     * @param detonatorCount 押注倍率
     */
    bet(totalBet: number, detonatorCount: number) {
        this.totalBet = totalBet;
        this.detonatorCount = detonatorCount;
        // this.totalBet = baseBet;
        this.gold -= this.totalBet;
        // this.littleGameAccumulate += this.totalBet * 0.13;
    }

    lottery() {
        this.window = [
            [{ type: "A", open: 0 }, { type: "A", open: 0 }, { type: "A", open: 0 }, { type: "A", open: 0 }],
            [{ type: "A", open: 0 }, { type: "A", open: 0 }, { type: "A", open: 0 }, { type: "A", open: 0 }],
            [{ type: "A", open: 0 }, { type: "A", open: 0 }, { type: "A", open: 0 }, { type: "A", open: 0 }],
            [{ type: "A", open: 0 }, { type: "A", open: 0 }, { type: "A", open: 0 }, { type: "A", open: 0 }],
        ]
        let roundWindows: string[] = [];
        let detonatorCount = this.detonatorCount;
        for (let idx = 0; idx < 16; idx++) {
            if (detonatorCount > 0) {
                detonatorCount--;
                roundWindows.push("B")
            } else {
                roundWindows.push("A")
            }
        }
        roundWindows.sort(() => 0.5 - Math.random());
        for (const items of this.window) {
            items[0].type = roundWindows.shift() as any;
            items[1].type = roundWindows.shift() as any;
            items[2].type = roundWindows.shift() as any;
            items[3].type = roundWindows.shift() as any;
        }
        return this.window;
    }
    hideWindows(roundWindows_: { type: string; open: number; }[][]) {
        let roundWindows = utils.clone(roundWindows_)
        for (let idx = 0; idx < roundWindows.length; idx++) {
            for (let idy = 0; idy < roundWindows[idx].length; idy++) {
                if (roundWindows[idx][idy].open == 0) {
                    roundWindows[idx][idy].type = "X"
                }
            }
        }
        return roundWindows;
    }
    ChangResult(x: number, y: number, coefficient2: number) {
        if (this.controlType == ControlKinds.NONE && this.limit < coefficient2) {
            return;
        }
        let Xx = -1, Yy = -1;
        for (let idx = 0; idx < this.window.length; idx++) {
            for (let idy = 0; idy < this.window[idx].length; idy++) {
                if (this.window[idx][idy].open == 0 && this.window[idx][idy].type == "B") {
                    Xx = idx;
                    Yy = idy;
                }
            }
        }
        if (Xx != -1) {
            console.warn("调控后", `${x},${x}`, `${Xx},${Yy}`)
            this.window[x][y].type = "B";
            this.window[Xx][Yy].type = "A";
        }
    }
    /**
     * 检查是否金币不足
     * @param baseBet 基础押注
     * @param betOdds 押注倍率
     */
    isLackGold(baseBet: number): boolean {
        return this.gold < baseBet;
    }

    /**
     * 玩家结算
     * @param playerRealWin 真实赢取
     * @param gold 数据库金币
     */
    async settlement(roomInfo: RoomStandAlone, profit: number) {
        let totalWin = 0;
        let MeGold = 0;
        let validBet = this.totalBet;
        if ((profit - this.totalBet) == 0) {
            validBet = 0;
        }
        // 添加游戏记录以及更新玩家金币
        this.setRoundId(roomInfo.getRoundId(this.uid));
        const record = buildRecordResult(this);
        const { playerRealWin, gold } = await createPlayerRecordService()
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.gold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(this.roundId, 1,)
            .addResult(record)
            .setControlType(this.controlType)
            .setGameRecordInfo(this.totalBet, validBet, profit - this.totalBet, false)
            .setGameRecordLivesResult(this.buildGameLiveResult(record, profit - this.totalBet))
            .sendToDB(1);

        totalWin += playerRealWin + this.totalBet;
        MeGold = gold;
        // 玩家结算
        // this.settlement(totalWin, MeGold);

        // 扣除奖池金币
        roomInfo.deductRunningPool(playerRealWin);
        this.gold = gold;
        this.profit = playerRealWin;
    }


    /**
     * 构造开奖结果
     * @param result
     */
    buildGameLiveResult(result: string, profit: number) {
        return {
            uid: this.uid,
            result,
            totalBet: this.totalBet,
            profit: profit,
            detonatorCount: this.detonatorCount,
        }
    }
}