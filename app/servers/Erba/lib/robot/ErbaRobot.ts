
// 推筒子 或 推筒子庄 的机器人
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import utils = require("../../../../utils");
import commonUtil = require("../../../../utils/lottery/commonUtil");
import robotBetUtil = require("../../../../utils/robot/robotBetUtil");
import RobotManagerDao from "../../../../common/dao/daoManager/Robot.manager";
import ErbaConst = require('../ErbaConst');
import mathUtil = require("../../../../utils/lottery/mathUtil");
// 推筒子下注条件
/**庄家钱是否够赔付 */
const pl_totalBets: { roomId: string, totalBet: number, flag: false }[] = [];




export default class ErbaRobot extends BaseRobot {
    playerGold: number = 0;
    playRound: number;
    leaveRound: number;
    constructor(opts) {
        super(opts);
        this.playRound = 0;                                     // 当前轮数
    }

    // 加载
    async ErbaLoaded() {
        try {
            const data = await this.requestByRoute(`Erba.mainHandler.loaded`, {});
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // 离开推筒子游戏
    async destroy() {
        await this.leaveGameAndReset(false);
    }
    /**收到通知后处理 */
    registerListener() {
        this.Emitter.on("Erba.startGrab", this.onStartGrab.bind(this));
        this.Emitter.on("Erba.startBet", this.on_handler_Bet.bind(this));
        this.Emitter.on("Erba_Lottery", this.onSettlement.bind(this));
        this.Emitter.on("Erba.over", this.destroy.bind(this));
    }

    async onStartGrab(data: ErbaConst.Erba_startGrab) {
        const Grab_num = utils.random(0, data.startGrab_List.length - 1);
        await this.requestByRoute(`Erba.mainHandler.handler_grab`, { Grab_num });
    }

    async on_handler_Bet(data: ErbaConst.Erba_startBet) {
        const bet_mul = utils.random(0, data.bet_mul_List.length - 1);
        await this.requestByRoute(`Erba.mainHandler.handler_Bet`, { bet_mul });
    }

    onSettlement() {
        let pl_totalBet = pl_totalBets.find(m => m.roomId == this.roomId);
        if (pl_totalBet) {
            pl_totalBet.totalBet = 0;
            pl_totalBet.flag = false;
        }
    }
}
