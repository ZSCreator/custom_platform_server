'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const utils = require("../../../../utils");
const commonUtil = require("../../../../utils/lottery/commonUtil");
class cpRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.shouldLeave = false;
        this.playRound = 0;
        this.leaveRound = commonUtil.randomFromRange(5, 10);
        this.seat = opts.seat;
    }
    async chinesePokerLoaded() {
        try {
            const loadedData = await this.requestByRoute('chinese_poker.mainHandler.loaded', { roomId: this.roomId });
            this.seat = loadedData.seat;
        }
        catch (error) {
            robotlogger.warn(`chinesePokerLoaded|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${error}`);
            return Promise.reject(error);
        }
    }
    registerListener() {
        this.Emitter.on("poker_onDeal", this.onChinesePokerDeal.bind(this));
        this.Emitter.on("poker_onSettlement", (settleData) => {
            this.onChinesePokerSettle(settleData);
        });
    }
    async onChinesePokerDeal(dealData) {
        const selfItem = dealData.players;
        if (!selfItem) {
            return;
        }
        const allCards = selfItem.card_arr;
        if (!Array.isArray(allCards) || !allCards.length) {
            return;
        }
        const cards = allCards.map(info => info.type[0]);
        const maxTip = cards.indexOf(Math.max.apply(Math, cards));
        await this.delayRequest("chinese_poker.mainHandler.BiPai", {
            roomId: this.roomId,
            cards: allCards[maxTip].cards
        }, commonUtil.randomFromRange(5000, 10000));
    }
    async onChinesePokerSettle(settleData) {
        setTimeout(() => {
            this.destroy();
        }, utils.random(1, 3) * 10);
    }
    async destroy() {
        await this.leaveGameAndReset(false);
    }
}
exports.default = cpRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3BSb2JvdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2NoaW5lc2VfcG9rZXIvbGliL3JvYm90L2NwUm9ib3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUdiLDJFQUF3RTtBQUV4RSwrQ0FBeUM7QUFDekMsTUFBTSxXQUFXLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN2RCwyQ0FBNEM7QUFDNUMsbUVBQW1FO0FBS25FLE1BQXFCLE9BQVEsU0FBUSxxQkFBUztJQVExQyxZQUFZLElBQVM7UUFDakIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRmhCLGdCQUFXLEdBQVksS0FBSyxDQUFDO1FBR3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFHRCxLQUFLLENBQUMsa0JBQWtCO1FBQ3BCLElBQUk7WUFDQSxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsa0NBQWtDLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDMUcsSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO1NBQy9CO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixXQUFXLENBQUMsSUFBSSxDQUFDLHNCQUFzQixJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDdkcsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2hDO0lBQ0wsQ0FBQztJQUdELGdCQUFnQjtRQUVaLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFcEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRTtZQUNqRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDMUMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBR0QsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFFBQStCO1FBQ3BELE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUM7UUFDbEMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNYLE9BQU87U0FDVjtRQUNELE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUM7UUFDbkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO1lBQzlDLE9BQU87U0FDVjtRQUNELE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUMxRCxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsaUNBQWlDLEVBQUU7WUFDdkQsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ25CLEtBQUssRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSztTQUNoQyxFQUFFLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQU1ELEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxVQUF1QztRQUM5RCxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25CLENBQUMsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBR0QsS0FBSyxDQUFDLE9BQU87UUFDVCxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4QyxDQUFDO0NBQ0o7QUFwRUQsMEJBb0VDIn0=