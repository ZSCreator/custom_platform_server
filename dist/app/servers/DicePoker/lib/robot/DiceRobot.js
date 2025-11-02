"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const utils = require("../../../../utils");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const DiceConst_1 = require("../DiceConst");
const Dice_logic = require("../Dice_logic");
const AreaArr = [DiceConst_1.AreaBet.BAOZI, DiceConst_1.AreaBet.DALIANZI, DiceConst_1.AreaBet.XIAOLIANZI, DiceConst_1.AreaBet.HULU,
    DiceConst_1.AreaBet.ZHADAN, DiceConst_1.AreaBet.SANTIAO, DiceConst_1.AreaBet.POINTS_6, DiceConst_1.AreaBet.POINTS_5,
    DiceConst_1.AreaBet.POINTS_4, DiceConst_1.AreaBet.POINTS_3, DiceConst_1.AreaBet.POINTS_2, DiceConst_1.AreaBet.POINTS_1,
    DiceConst_1.AreaBet.ANY];
class DiceRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.playerGold = 0;
        this.area_DiceList = [];
        for (let idx = 0; idx < 13; idx++) {
            this.area_DiceList.push({ idx, DiceList: [], points: 0, submit: false });
        }
    }
    async DiceLoaded() {
        try {
            const data = await this.requestByRoute(`DicePoker.mainHandler.loaded`, {});
            this.seat = data.plys.find(pl => pl.uid == this.uid).seat;
            return Promise.resolve();
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async destroy() {
        await this.leaveGameAndReset(false);
    }
    registerListener() {
        this.Emitter.on("Dice.startNextHand", this.onStartGrab.bind(this));
        this.Emitter.on("Dice.onFahua", this.on_handler_doing.bind(this));
        this.Emitter.on("Dice.Play", this.on_handler_Play.bind(this));
        this.Emitter.on("Dice.set", this.on_handler_Set.bind(this));
        this.Emitter.on("Dice.over", this.destroy.bind(this));
    }
    async onStartGrab(data) {
    }
    async on_handler_doing(data) {
        if (data.curr_doing_seat == this.seat) {
            let delayTime = commonUtil.randomFromRange(3000, 6000);
            try {
                await this.delayRequest(`DicePoker.mainHandler.handler_Play`, {}, delayTime);
            }
            catch (error) {
            }
        }
    }
    async on_handler_Play(data) {
        try {
            if (data.seat == this.seat) {
                let save_DiceList = Dice_logic.GetArr(data.save_DiceList, data.curr_DiceList);
                let Me = data.players.find(c => c.seat == this.seat);
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
                        if (obj.Subscript.includes(idx)) {
                            await this.delayRequest(`DicePoker.mainHandler.handler_Set`, { Mod: true, Idx: idx }, 100);
                        }
                        else {
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
        }
        catch (error) {
        }
    }
    on_handler_Set(data) {
    }
}
exports.default = DiceRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGljZVJvYm90LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvRGljZVBva2VyL2xpYi9yb2JvdC9EaWNlUm9ib3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSwyRUFBd0U7QUFDeEUsMkNBQTRDO0FBQzVDLG1FQUFvRTtBQUdwRSw0Q0FBdUM7QUFHdkMsNENBQTZDO0FBRzdDLE1BQU0sT0FBTyxHQUFHLENBQUMsbUJBQU8sQ0FBQyxLQUFLLEVBQUUsbUJBQU8sQ0FBQyxRQUFRLEVBQUUsbUJBQU8sQ0FBQyxVQUFVLEVBQUUsbUJBQU8sQ0FBQyxJQUFJO0lBQ2xGLG1CQUFPLENBQUMsTUFBTSxFQUFFLG1CQUFPLENBQUMsT0FBTyxFQUFFLG1CQUFPLENBQUMsUUFBUSxFQUFFLG1CQUFPLENBQUMsUUFBUTtJQUNuRSxtQkFBTyxDQUFDLFFBQVEsRUFBRSxtQkFBTyxDQUFDLFFBQVEsRUFBRSxtQkFBTyxDQUFDLFFBQVEsRUFBRSxtQkFBTyxDQUFDLFFBQVE7SUFDdEUsbUJBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUViLE1BQXFCLFNBQVUsU0FBUSxxQkFBUztJQVc1QyxZQUFZLElBQUk7UUFDWixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFYaEIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQVN2QixrQkFBYSxHQUEyRSxFQUFFLENBQUM7UUFJdkYsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUMvQixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7U0FDNUU7SUFDTCxDQUFDO0lBR0QsS0FBSyxDQUFDLFVBQVU7UUFDWixJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLDhCQUE4QixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzNFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDMUQsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDNUI7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNaLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNoQztJQUNMLENBQUM7SUFHRCxLQUFLLENBQUMsT0FBTztRQUNULE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRCxnQkFBZ0I7UUFDWixJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25FLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDOUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBeUI7SUFHM0MsQ0FBQztJQUVELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxJQUE0QjtRQUMvQyxJQUFJLElBQUksQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUNuQyxJQUFJLFNBQVMsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN2RCxJQUFJO2dCQUNBLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxvQ0FBb0MsRUFBRSxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDaEY7WUFBQyxPQUFPLEtBQUssRUFBRTthQUVmO1NBRUo7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUF5QjtRQUMzQyxJQUFJO1lBQ0EsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ3hCLElBQUksYUFBYSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQzlFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBSXJELEtBQUssTUFBTSxHQUFHLElBQUksRUFBRSxDQUFDLGFBQWEsRUFBRTtvQkFDaEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7aUJBQ2pFO2dCQUNELElBQUksR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUMzQyxHQUFHLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDckIsR0FBRyxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUNqRCxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUMvRSxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7b0JBQ2hCLElBQUksU0FBUyxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUN2RCxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsc0NBQXNDLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBQzNHLE9BQU87aUJBQ1Y7Z0JBQ0QsSUFBSSxTQUFTLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZELElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO29CQUMzQixFQUFFLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUM7aUJBQ3RDO2dCQUNELElBQUksRUFBRSxDQUFDLFlBQVksR0FBRyxDQUFDLEVBQUU7b0JBQ3JCLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDN0IsS0FBSyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTt3QkFFL0IsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTs0QkFDN0IsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLG1DQUFtQyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7eUJBQzlGOzZCQUFNOzRCQUNILE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxtQ0FBbUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO3lCQUMvRjtxQkFDSjtvQkFDRCxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsb0NBQW9DLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUN2RSxPQUFPO2lCQUNWO2dCQUNELElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxzQ0FBc0MsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUNwRyxPQUFPO2FBQ1Y7U0FDSjtRQUFDLE9BQU8sS0FBSyxFQUFFO1NBRWY7SUFFTCxDQUFDO0lBRUQsY0FBYyxDQUFDLElBQXdCO0lBSXZDLENBQUM7Q0FDSjtBQWxIRCw0QkFrSEMifQ==