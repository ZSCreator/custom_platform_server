
// 推筒子 或 推筒子庄 的机器人
import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import utils = require("../../../../utils");
import commonUtil = require("../../../../utils/lottery/commonUtil");
import robotBetUtil = require("../../../../utils/robot/robotBetUtil");
import RobotManagerDao from "../../../../common/dao/daoManager/Robot.manager";
import { AreaBet } from '../DiceConst';
import *as DiceConst from '../DiceConst';
import mathUtil = require("../../../../utils/lottery/mathUtil");
import Dice_logic = require("../Dice_logic");


const AreaArr = [AreaBet.BAOZI, AreaBet.DALIANZI, AreaBet.XIAOLIANZI, AreaBet.HULU,
AreaBet.ZHADAN, AreaBet.SANTIAO, AreaBet.POINTS_6, AreaBet.POINTS_5,
AreaBet.POINTS_4, AreaBet.POINTS_3, AreaBet.POINTS_2, AreaBet.POINTS_1,
AreaBet.ANY];

export default class DiceRobot extends BaseRobot {
    playerGold: number = 0;
    seat: number;
    /**每回合抽奖次数*/
    // Number_draws: number;
    /**额外次数 */
    // Number_extra: number;
    /**当前保存骰子*/
    // save_DiceList: number[] = [];
    // MaxArea: number;
    area_DiceList: { idx: number, DiceList: number[], points: number, submit: boolean }[] = [];
    constructor(opts) {
        super(opts);
        // this.playRound = 0; 
        for (let idx = 0; idx < 13; idx++) {
            this.area_DiceList.push({ idx, DiceList: [], points: 0, submit: false });
        }
    }

    // 加载
    async DiceLoaded() {
        try {
            const data = await this.requestByRoute(`DicePoker.mainHandler.loaded`, {});
            this.seat = data.plys.find(pl => pl.uid == this.uid).seat;
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
        this.Emitter.on("Dice.startNextHand", this.onStartGrab.bind(this));
        this.Emitter.on("Dice.onFahua", this.on_handler_doing.bind(this));
        this.Emitter.on("Dice.Play", this.on_handler_Play.bind(this));
        this.Emitter.on("Dice.set", this.on_handler_Set.bind(this));
        this.Emitter.on("Dice.over", this.destroy.bind(this));
    }

    async onStartGrab(data: DiceConst.Dice_Play) {
        // console.warn(data);
        // const Grab_num = utils.random(0, data.startGrab_List.length - 1);
    }

    async on_handler_doing(data: DiceConst.Dice_onFahua) {
        if (data.curr_doing_seat == this.seat) {
            let delayTime = commonUtil.randomFromRange(3000, 6000);
            try {
                await this.delayRequest(`DicePoker.mainHandler.handler_Play`, {}, delayTime);
            } catch (error) {

            }

        }
    }

    async on_handler_Play(data: DiceConst.Dice_Play) {
        try {
            if (data.seat == this.seat) {
                let save_DiceList = Dice_logic.GetArr(data.save_DiceList, data.curr_DiceList);
                let Me = data.players.find(c => c.seat == this.seat);
                // this.Number_draws = Me.Number_draws;
                // this.Number_extra = Me.Number_extra;

                for (const key in Me.area_DiceList) {
                    this.area_DiceList[key].submit = Me.area_DiceList[key].submit;
                }
                let obj = new Dice_logic.DicePokerAction();
                obj.CC_DEBUG = false;
                obj.area_DiceList = utils.clone(this.area_DiceList);
                let result = obj.Get_handler_Pass(save_DiceList);
                console.warn("on_handler_Play", data.roomId, result, save_DiceList.toString());
                if (result.success) {
                    let delayTime = commonUtil.randomFromRange(3000, 6000);
                    await this.delayRequest(`DicePoker.mainHandler.handler_submit`, { Mod: true, Idx: result.idx }, delayTime);
                    return;
                }
                let delayTime = commonUtil.randomFromRange(3000, 6000);
                let tingM = obj.BuTouZi(save_DiceList);
                if (obj.Subscript.length == 4) {
                    Me.Number_draws += Me.Number_extra;
                }
                if (Me.Number_draws > 0) {
                    await utils.delay(delayTime);
                    for (const idx of [0, 1, 2, 3, 4]) {
                        // console.warn(utils.cDate(), idx);
                        if (obj.Subscript.includes(idx)) {
                            await this.delayRequest(`DicePoker.mainHandler.handler_Set`, { Mod: true, Idx: idx }, 100);
                        } else {
                            await this.delayRequest(`DicePoker.mainHandler.handler_Set`, { Mod: false, Idx: idx }, 100);
                        }
                    }
                    await this.delayRequest(`DicePoker.mainHandler.handler_Play`, {}, 200);
                    return;
                }
                let idx = obj.AnySumit(save_DiceList);
                await this.delayRequest(`DicePoker.mainHandler.handler_submit`, { Mod: true, Idx: idx }, delayTime);
                return;
            }
        } catch (error) {

        }

    }

    on_handler_Set(data: DiceConst.Dice_set) {
        // if (data.seat == this.seat) {
        //     this.save_DiceList = data.save_DiceList;
        // }
    }
}
