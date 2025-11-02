"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const utils = require("../../../../utils");
const pl_totalBets = [];
class ErbaRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.playerGold = 0;
        this.playRound = 0;
    }
    async ErbaLoaded() {
        try {
            const data = await this.requestByRoute(`Erba.mainHandler.loaded`, {});
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
        this.Emitter.on("Erba.startGrab", this.onStartGrab.bind(this));
        this.Emitter.on("Erba.startBet", this.on_handler_Bet.bind(this));
        this.Emitter.on("Erba_Lottery", this.onSettlement.bind(this));
        this.Emitter.on("Erba.over", this.destroy.bind(this));
    }
    async onStartGrab(data) {
        const Grab_num = utils.random(0, data.startGrab_List.length - 1);
        await this.requestByRoute(`Erba.mainHandler.handler_grab`, { Grab_num });
    }
    async on_handler_Bet(data) {
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
exports.default = ErbaRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXJiYVJvYm90LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvRXJiYS9saWIvcm9ib3QvRXJiYVJvYm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsMkVBQXdFO0FBQ3hFLDJDQUE0QztBQVE1QyxNQUFNLFlBQVksR0FBd0QsRUFBRSxDQUFDO0FBSzdFLE1BQXFCLFNBQVUsU0FBUSxxQkFBUztJQUk1QyxZQUFZLElBQUk7UUFDWixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFKaEIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUtuQixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztJQUN2QixDQUFDO0lBR0QsS0FBSyxDQUFDLFVBQVU7UUFDWixJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLHlCQUF5QixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3RFLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQzVCO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDaEM7SUFDTCxDQUFDO0lBR0QsS0FBSyxDQUFDLE9BQU87UUFDVCxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsZ0JBQWdCO1FBQ1osSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM5RCxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUE4QjtRQUM1QyxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqRSxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsK0JBQStCLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFFRCxLQUFLLENBQUMsY0FBYyxDQUFDLElBQTZCO1FBQzlDLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzlELE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyw4QkFBOEIsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVELFlBQVk7UUFDUixJQUFJLFdBQVcsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEUsSUFBSSxXQUFXLEVBQUU7WUFDYixXQUFXLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUN6QixXQUFXLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztTQUM1QjtJQUNMLENBQUM7Q0FDSjtBQWhERCw0QkFnREMifQ==