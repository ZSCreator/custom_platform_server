'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const ld_Logic = require("../ld_Logic");
class DouDiZhuRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.playRound = 0;
        this.seat = -1;
        this.playerGold = 0;
    }
    async ddzLoaded() {
        try {
            const loadedData = await this.requestByRoute('LuckyDice.mainHandler.loaded', {});
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
    async destroy() {
        this.leaveGameAndReset(false);
    }
    registerListener() {
        this.Emitter.on('ld.onFahua', this.onFahua.bind(this));
        this.Emitter.on('ld.bipai', this.onBipai.bind(this));
    }
    async onFahua(data) {
        for (const pl of data.min_pls) {
            if (pl.uid == this.uid) {
                let dices = [];
                let delayTime = commonUtil.randomFromRange(1000, 5000);
                const alikeCounts = ld_Logic.checkAlike(this.cards);
                if (this.cardType == ld_Logic.CardsType.SINGLE) {
                    this.cards.sort((a, b) => b - a);
                    dices.push(this.cards[0]);
                }
                else if (this.cardType == ld_Logic.CardsType.DOUBLE) {
                    const Subscript = alikeCounts.find(c => c.count == 2).Subscript;
                    for (const c of Subscript) {
                        dices.push(this.cards[c]);
                    }
                }
                else if (this.cardType == ld_Logic.CardsType.twodui) {
                    let cardss1 = [];
                    for (const cc of alikeCounts.filter(c => c.count == 2)) {
                        for (const c of cc.Subscript) {
                            cardss1.push(this.cards[c]);
                            cardss1.sort((a, b) => b - a);
                        }
                    }
                    for (let index = 0; index < 2; index++) {
                        dices.push(cardss1[index]);
                    }
                }
                else if (this.cardType == ld_Logic.CardsType.Three ||
                    this.cardType == ld_Logic.CardsType.HuLu) {
                    const Subscript = alikeCounts.find(c => c.count == 3).Subscript;
                    for (const cc of Subscript) {
                        dices.push(this.cards[cc]);
                    }
                }
                else if (this.cardType == ld_Logic.CardsType.SHUN) {
                }
                else if (this.cardType == ld_Logic.CardsType.ZaDan) {
                    const Subscript = alikeCounts.find(c => c.count == 4).Subscript;
                    for (const cc of Subscript) {
                        dices.push(this.cards[cc]);
                    }
                }
                else if (this.cardType == ld_Logic.CardsType.BAOZI) {
                }
                await this.delayRequest('LuckyDice.mainHandler.Keep', { dices: dices }, delayTime);
            }
        }
    }
    onBipai(data) {
        for (const pl of data) {
            if (pl && pl.uid == this.uid) {
                this.cardType = pl.cardType;
                this.cards = pl.cards;
            }
        }
    }
}
exports.default = DouDiZhuRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGRSb2JvdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0x1Y2t5RGljZS9saWIvcm9ib3QvbGRSb2JvdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBR2IsMkVBQXdFO0FBR3hFLG1FQUFtRTtBQUNuRSwrQ0FBeUM7QUFDekMsTUFBTSxXQUFXLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUV2RCx3Q0FBeUM7QUFNekMsTUFBcUIsYUFBYyxTQUFRLHFCQUFTO0lBTWhELFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFOaEIsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUN0QixTQUFJLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDbEIsZUFBVSxHQUFXLENBQUMsQ0FBQztJQUt2QixDQUFDO0lBR0QsS0FBSyxDQUFDLFNBQVM7UUFDWCxJQUFJO1lBQ0EsTUFBTSxVQUFVLEdBQ1YsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLDhCQUE4QixFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBRXZFO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDVixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDOUI7SUFDTCxDQUFDO0lBR0QsS0FBSyxDQUFDLE9BQU87UUFDVCxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFbEMsQ0FBQztJQUdELGdCQUFnQjtRQUVaLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMs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