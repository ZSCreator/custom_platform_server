'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const utils = require("../../../../utils");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
class DZpipeirobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.filling_num = 0;
        this.cingl_num = 0;
        this.playerType = '';
        this.status = "no";
        this.winner = false;
        this.roundTimes = 0;
        this.seat = 0;
        this.sceneId = 0;
        this.roundCount = 0;
        this.af = 0;
        this.allbet = 0;
    }
    async loaded() {
        let data;
        try {
            data = await this.requestByRoute("DZpipei.mainHandler.loaded", {});
            this.sceneId = data.sceneId;
            for (let pl of data.room.players) {
                if (pl && pl.uid == this.uid) {
                    this.seat = pl.seat;
                    this.currGold = pl.currGold;
                    this.canCarryGold = data.room.canCarryGold;
                }
            }
            return Promise.resolve(data);
        }
        catch (error) {
            return Promise.reject(`${error}|${data}`);
        }
    }
    registerListener() {
        this.Emitter.on("dz_onDeal", this.onDeal.bind(this));
        this.Emitter.on("dz_onFahua", this.onfahua.bind(this));
        this.Emitter.on("dz_onSettlement", this.onSettlement.bind(this));
        this.Emitter.on("dz_onDeal2", this.onDeal2.bind(this));
        this.Emitter.on("dz_onOpts", this.onOpts.bind(this));
    }
    onSettlement(data) {
        this.winner = false;
        setTimeout(() => {
            this.destroy();
        }, utils.random(1, 3) * 10);
    }
    onDeal(deal) {
        this.status = "dz_onDeal";
        const Me = deal.players.find(c => c && c.uid == this.uid);
        this.playerType = Me.playerType;
        if (deal.default === this.uid)
            this.winner = true;
        this.fahuaIdx = deal.fahuaIdx;
        this.roundCount = 0;
    }
    onDeal2(pubpo) {
        this.status = "dz_onDeal2";
        this.roundCount++;
        this.allbet = 0;
        this.cingl_num = 0;
        this.filling_num = 0;
    }
    async onfahua(data) {
        const { fahuaIdx, currGold, freedomBet, recommBet, cinglNum, roundTimes, round_action } = data;
        this.roundTimes = roundTimes;
        const t1 = utils.cDate();
        if (this.winner) {
            const ran = Math.random();
            if (ran > 0.5) {
                await this.action_cingl();
            }
            else {
                if (Math.random() < 0.6) {
                    await this.action_filling1(recommBet, currGold, cinglNum, 0);
                }
                else {
                    await this.action_filling1(recommBet, currGold, cinglNum, 1);
                }
            }
            return;
        }
        try {
            if (fahuaIdx != this.seat)
                return;
            let sendMsgTimeout = utils.random(1000, 4000);
            let ran = utils.random(1, 10);
            let ran2 = utils.random(1, 10);
            if (roundTimes == 0) {
                if (round_action == "Y1") {
                    if (this.playerType == "SB") {
                        await this.action_fold();
                        return;
                    }
                    else if (this.playerType == "BB") {
                        if (cinglNum == 0) {
                            this.action_cingl();
                            return;
                        }
                        else {
                            await this.action_fold();
                            return;
                        }
                    }
                    else {
                        await this.action_fold();
                        return;
                    }
                }
                else if (round_action == "Y2") {
                    if (this.playerType == "SB") {
                        if (this.cingl_num >= 2) {
                            await this.action_fold();
                            return;
                        }
                        else if (this.cingl_num == 1) {
                            this.action_cingl();
                            return;
                        }
                        if (this.filling_num <= 1) {
                            this.action_cingl();
                            return;
                        }
                        else {
                            await this.action_fold();
                            return;
                        }
                    }
                    else if (this.playerType == "BB") {
                        if (this.cingl_num == 1 || cinglNum == 0) {
                            this.action_cingl();
                            return;
                        }
                        else {
                            await this.action_fold();
                            return;
                        }
                    }
                    else {
                        if (this.cingl_num <= 2 || cinglNum == 0) {
                            this.action_cingl();
                            return;
                        }
                        else {
                            await this.action_fold();
                            return;
                        }
                    }
                }
                else if (round_action == "Y3") {
                    if (this.playerType == "SB") {
                        if (this.cingl_num <= 3) {
                            if (ran < 7) {
                                this.action_cingl();
                                return;
                            }
                            else {
                                if (ran2 < 6) {
                                    await this.action_filling1(recommBet, currGold, cinglNum, 0);
                                    return;
                                }
                                else {
                                    await this.action_filling1(recommBet, currGold, cinglNum, 1);
                                    return;
                                }
                            }
                        }
                        if (this.filling_num >= 2) {
                            await this.action_fold();
                            return;
                        }
                        else {
                            await this.action_fold();
                            return;
                        }
                    }
                    else if (this.playerType == "BB") {
                        if (this.cingl_num >= 2) {
                            this.action_cingl();
                            return;
                        }
                        else if (this.cingl_num == 1) {
                            if (ran < 6) {
                                this.action_cingl();
                                return;
                            }
                            else {
                                if (ran2 < 6) {
                                    await this.action_filling1(recommBet, currGold, cinglNum, 0);
                                    return;
                                }
                                else {
                                    await this.action_filling1(recommBet, currGold, cinglNum, 1);
                                    return;
                                }
                            }
                        }
                        if (this.filling_num <= 2) {
                            this.action_cingl();
                            return;
                        }
                        else {
                            await this.action_fold();
                            return;
                        }
                    }
                    else {
                        if (this.filling_num <= 2) {
                            this.action_cingl();
                            return;
                        }
                        else {
                            await this.action_fold();
                            return;
                        }
                    }
                }
                else if (round_action == "Y4") {
                    if (this.playerType == "SB") {
                        if (this.filling_num == 0) {
                            if (ran < 3) {
                                this.action_cingl();
                                return;
                            }
                            else {
                                if (ran2 < 4) {
                                    await this.action_filling1(recommBet, currGold, cinglNum, 1);
                                    return;
                                }
                                else if (ran2 < 8 && ran2 >= 4) {
                                    await this.action_filling1(recommBet, currGold, cinglNum, 2);
                                    return;
                                }
                                else {
                                    await this.action_allin();
                                    return;
                                }
                            }
                        }
                        if (this.filling_num > 0) {
                            if (ran <= 5) {
                                this.action_cingl();
                                return;
                            }
                            if (ran2 < 5) {
                                await this.action_filling1(recommBet, currGold, cinglNum, 1);
                                return;
                            }
                            else if (ran2 < 8 && ran2 >= 4) {
                                await this.action_filling1(recommBet, currGold, cinglNum, 2);
                                return;
                            }
                            else {
                                await this.action_allin();
                                return;
                            }
                        }
                    }
                    else if (this.playerType == "BB") {
                        if (this.filling_num == 0) {
                            if (ran < 3) {
                                this.action_cingl();
                                return;
                            }
                            else {
                                if (ran2 < 4) {
                                    await this.action_filling1(recommBet, currGold, cinglNum, 1);
                                    return;
                                }
                                else if (ran2 < 8 && ran2 >= 4) {
                                    await this.action_filling1(recommBet, currGold, cinglNum, 2);
                                    return;
                                }
                                else {
                                    await this.action_allin();
                                    return;
                                }
                            }
                        }
                        if (this.filling_num > 0) {
                            if (ran <= 5) {
                                this.action_cingl();
                                return;
                            }
                            if (ran2 < 5) {
                                await this.action_filling1(recommBet, currGold, cinglNum, 1);
                                return;
                            }
                            else if (ran2 < 8 && ran2 >= 4) {
                                await this.action_filling1(recommBet, currGold, cinglNum, 2);
                                return;
                            }
                            else {
                                await this.action_allin();
                                return;
                            }
                        }
                    }
                    else {
                        if (this.filling_num == 0) {
                            if (ran < 3) {
                                this.action_cingl();
                                return;
                            }
                            else {
                                if (ran2 < 4) {
                                    await this.action_filling1(recommBet, currGold, cinglNum, 1);
                                    return;
                                }
                                else if (ran2 < 8 && ran2 >= 4) {
                                    await this.action_filling1(recommBet, currGold, cinglNum, 2);
                                    return;
                                }
                                else {
                                    await this.action_allin();
                                    return;
                                }
                            }
                        }
                        if (this.filling_num > 0) {
                            if (ran <= 5) {
                                this.action_cingl();
                                return;
                            }
                            if (ran2 < 5) {
                                await this.action_filling1(recommBet, currGold, cinglNum, 1);
                                return;
                            }
                            else if (ran2 < 8 && ran2 >= 4) {
                                await this.action_filling1(recommBet, currGold, cinglNum, 2);
                                return;
                            }
                            else {
                                await this.action_allin();
                                return;
                            }
                        }
                    }
                }
                console.warn("round_action_AI", this.status, round_action);
                return;
            }
            if (round_action == "y1b") {
                if (cinglNum == 0) {
                    await this.action_cingl();
                    return;
                }
                else {
                    await this.action_fold();
                    return;
                }
            }
            else if (round_action == "y2b") {
                if (cinglNum == 0) {
                    this.action_cingl();
                    return;
                }
                if (this.filling_num <= 2 && cinglNum < this.canCarryGold[0] * 0.3) {
                    this.action_cingl();
                    return;
                }
                else {
                    await this.action_fold();
                    return;
                }
            }
            else if (round_action == "y3b") {
                if (this.filling_num == 0) {
                    if (ran < 7) {
                        this.action_cingl();
                        return;
                    }
                    else {
                        if (ran2 < 6) {
                            await this.action_filling1(recommBet, currGold, cinglNum, 0);
                            return;
                        }
                        else {
                            await this.action_filling1(recommBet, currGold, cinglNum, 1);
                            return;
                        }
                    }
                }
                else if (this.filling_num <= 3 && this.canCarryGold[0] * 0.3) {
                    if (ran < 7) {
                        this.action_cingl();
                        return;
                    }
                    else {
                        if (ran2 < 6) {
                            await this.action_filling1(recommBet, currGold, cinglNum, 0);
                            return;
                        }
                        else {
                            await this.action_filling1(recommBet, currGold, cinglNum, 1);
                            return;
                        }
                    }
                }
                else {
                    this.action_cingl();
                    return;
                }
            }
            else if (round_action == "y4b") {
                if (this.filling_num == 0) {
                    if (ran < 3) {
                        this.action_cingl();
                        return;
                    }
                    else {
                        if (ran2 <= 3) {
                            await this.action_filling1(recommBet, currGold, cinglNum, 0);
                            return;
                        }
                        else if (ran2 > 3 && ran2 <= 7) {
                            await this.action_filling1(recommBet, currGold, cinglNum, 1);
                            return;
                        }
                        else {
                            await this.action_filling1(recommBet, currGold, cinglNum, 2);
                            return;
                        }
                        await this.action_allin();
                        return;
                    }
                }
                else if (this.filling_num <= 3) {
                    if (ran <= 3) {
                        this.action_cingl();
                        return;
                    }
                    else {
                        if (ran2 <= 1) {
                            await this.action_filling1(recommBet, currGold, cinglNum, 0);
                            return;
                        }
                        else if (ran2 == 2 || ran2 == 3) {
                            await this.action_filling1(recommBet, currGold, cinglNum, 1);
                            return;
                        }
                        else if (ran2 == 4 || ran2 == 5 || ran2 == 6) {
                            await this.action_filling1(recommBet, currGold, cinglNum, 2);
                            return;
                        }
                        else {
                            await this.action_allin();
                            return;
                        }
                        await this.action_allin();
                        return;
                    }
                }
                else {
                    this.action_cingl();
                    return;
                }
            }
            else if (round_action == "y5b") {
                if (ran <= 1) {
                    await this.action_filling1(recommBet, currGold, cinglNum, 0);
                    return;
                }
                else if (ran > 1 && ran <= 4) {
                    await this.action_filling1(recommBet, currGold, cinglNum, 1);
                    return;
                }
                else if (ran > 4 && ran <= 8) {
                    await this.action_filling1(recommBet, currGold, cinglNum, 2);
                    return;
                }
                await this.action_allin();
                return;
            }
            console.warn("round_action_AI", round_action);
            return;
        }
        catch (error) {
            const t2 = utils.cDate();
            robotlogger.warn('DZpipei|发话阶段出错:', error, t1, t2, this.roomId, this.uid);
        }
    }
    async action_filling1(recommBet, currGold, cinglNum, type) {
        let sendMsgTimeout = utils.random(0, 3);
        const arr = [1 * 1000, 3 * 1000, 4 * 1000, 6 * 1000];
        if (recommBet[1] <= currGold && cinglNum <= recommBet[type]) {
            await this.delayRequest(`DZpipei.mainHandler.filling1`, { type }, arr[sendMsgTimeout]);
            return;
        }
        else {
            await this.action_allin();
        }
    }
    async action_allin() {
        let sendMsgTimeout = utils.random(0, 3);
        const arr = [1 * 1000, 3 * 1000, 4 * 1000, 6 * 1000];
        await this.delayRequest(`DZpipei.mainHandler.allin`, {}, arr[sendMsgTimeout]);
    }
    async action_cingl() {
        let sendMsgTimeout = utils.random(0, 3);
        const arr = [1 * 1000, 3 * 1000, 4 * 1000, 6 * 1000];
        await this.delayRequest(`DZpipei.mainHandler.cingl`, {}, arr[sendMsgTimeout]);
    }
    async action_fold() {
        let sendMsgTimeout = utils.random(0, 3);
        const arr = [1 * 1000, 3 * 1000, 4 * 1000, 6 * 1000];
        await this.delayRequest(`DZpipei.mainHandler.fold`, {}, arr[sendMsgTimeout]);
    }
    onOpts(opt) {
        if (opt.type == 'cingl' || opt.type == "allin" || opt.type == "filling") {
            this.allbet++;
            if (opt.type == 'cingl' && this.roundTimes == 0) {
                this.cingl_num++;
            }
            if (opt.type == 'cingl' && this.roundTimes > 0) {
                this.filling_num++;
            }
            if (opt.type == "allin" || opt.type == "filling") {
                this.filling_num++;
            }
        }
    }
    destroy() {
        this.leaveGameAndReset(false);
    }
}
exports.default = DZpipeirobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRkZGX0R6Um9ib3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9EWnBpcGVpL2xpYi9yb2JvdC9GRkZfRHpSb2JvdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBQ2IsMkVBQXdFO0FBQ3hFLDJDQUEyQztBQUkzQywrQ0FBeUM7QUFFekMsTUFBTSxXQUFXLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQU12RCxNQUFxQixZQUFhLFNBQVEscUJBQVM7SUEyQmpELFlBQVksSUFBSTtRQUNkLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQWxCZCxnQkFBVyxHQUFXLENBQUMsQ0FBQztRQUV4QixjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBUXRCLGVBQVUsR0FBcUIsRUFBRSxDQUFDO1FBRWxDLFdBQU0sR0FBc0MsSUFBSSxDQUFDO1FBRWpELFdBQU0sR0FBWSxLQUFLLENBQUM7UUFFeEIsZUFBVSxHQUFHLENBQUMsQ0FBQztRQUdiLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDWixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUdsQixDQUFDO0lBQ0QsS0FBSyxDQUFDLE1BQU07UUFDVixJQUFJLElBQTZDLENBQUM7UUFDbEQsSUFBSTtZQUNGLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsNEJBQTRCLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQzVCLEtBQUssSUFBSSxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2hDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtvQkFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO29CQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUM7b0JBQzVCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7aUJBQzVDO2FBQ0Y7WUFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDOUI7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNkLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEtBQUssSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQzNDO0lBQ0gsQ0FBQztJQUlELGdCQUFnQjtRQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDakUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUdELFlBQVksQ0FBQyxJQUFtQztRQUM5QyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNwQixVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ2QsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUMsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBR0QsTUFBTSxDQUFDLElBQTZCO1FBQ2xDLElBQUksQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFBO1FBQ3pCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQztRQUVoQyxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLEdBQUc7WUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUVsRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDOUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUdELE9BQU8sQ0FBQyxLQUErQjtRQUNyQyxJQUFJLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQztRQUMzQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFDbkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQWFELEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBMkI7UUFDdkMsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxHQUFHLElBQUksQ0FBQztRQUMvRixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFHekIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBR2YsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRTFCLElBQUksR0FBRyxHQUFHLEdBQUcsRUFBRTtnQkFDYixNQUFNLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzthQUMzQjtpQkFBTTtnQkFDTCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLEVBQUU7b0JBQ3ZCLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDOUQ7cUJBQU07b0JBQ0wsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUM5RDthQUNGO1lBRUQsT0FBTztTQUNSO1FBRUQsSUFBSTtZQUNGLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJO2dCQUFFLE9BQU87WUFDbEMsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDOUMsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDOUIsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDL0IsSUFBSSxVQUFVLElBQUksQ0FBQyxFQUFFO2dCQUNuQixJQUFJLFlBQVksSUFBSSxJQUFJLEVBQUU7b0JBQ3hCLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLEVBQUU7d0JBQzNCLE1BQU0sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO3dCQUN6QixPQUFPO3FCQUNSO3lCQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLEVBQUU7d0JBQ2xDLElBQUksUUFBUSxJQUFJLENBQUMsRUFBRTs0QkFFakIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDOzRCQUNwQixPQUFPO3lCQUNSOzZCQUFNOzRCQUNMLE1BQU0sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDOzRCQUN6QixPQUFPO3lCQUNSO3FCQUNGO3lCQUFNO3dCQUNMLE1BQU0sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO3dCQUN6QixPQUFPO3FCQUNSO2lCQUNGO3FCQUFNLElBQUksWUFBWSxJQUFJLElBQUksRUFBRTtvQkFDL0IsSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksRUFBRTt3QkFDM0IsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsRUFBRTs0QkFDdkIsTUFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7NEJBQ3pCLE9BQU87eUJBQ1I7NkJBQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsRUFBRTs0QkFDOUIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDOzRCQUNwQixPQUFPO3lCQUNSO3dCQUNELElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLEVBQUU7NEJBQ3pCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzs0QkFDcEIsT0FBTzt5QkFDUjs2QkFBTTs0QkFDTCxNQUFNLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzs0QkFDekIsT0FBTzt5QkFDUjtxQkFDRjt5QkFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxFQUFFO3dCQUNsQyxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLFFBQVEsSUFBSSxDQUFDLEVBQUU7NEJBQ3hDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzs0QkFDcEIsT0FBTzt5QkFDUjs2QkFBTTs0QkFDTCxNQUFNLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzs0QkFDekIsT0FBTzt5QkFDUjtxQkFDRjt5QkFBTTt3QkFDTCxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLFFBQVEsSUFBSSxDQUFDLEVBQUU7NEJBQ3hDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzs0QkFDcEIsT0FBTzt5QkFDUjs2QkFBTTs0QkFDTCxNQUFNLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzs0QkFDekIsT0FBTzt5QkFDUjtxQkFDRjtpQkFDRjtxQkFBTSxJQUFJLFlBQVksSUFBSSxJQUFJLEVBQUU7b0JBQy9CLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLEVBQUU7d0JBQzNCLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLEVBQUU7NEJBQ3ZCLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtnQ0FDWCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0NBQ3BCLE9BQU87NkJBQ1I7aUNBQU07Z0NBQ0wsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFO29DQUNaLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztvQ0FDN0QsT0FBTztpQ0FDUjtxQ0FBTTtvQ0FDTCxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0NBQzdELE9BQU87aUNBQ1I7NkJBQ0Y7eUJBQ0Y7d0JBQ0QsSUFBSSxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsRUFBRTs0QkFDekIsTUFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7NEJBQ3pCLE9BQU87eUJBQ1I7NkJBQU07NEJBQ0wsTUFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7NEJBQ3pCLE9BQU87eUJBQ1I7cUJBQ0Y7eUJBQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksRUFBRTt3QkFDbEMsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsRUFBRTs0QkFDdkIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDOzRCQUNwQixPQUFPO3lCQUNSOzZCQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLEVBQUU7NEJBQzlCLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtnQ0FDWCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0NBQ3BCLE9BQU87NkJBQ1I7aUNBQU07Z0NBQ0wsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFO29DQUNaLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztvQ0FDN0QsT0FBTztpQ0FDUjtxQ0FBTTtvQ0FDTCxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0NBQzdELE9BQU87aUNBQ1I7NkJBQ0Y7eUJBRUY7d0JBQ0QsSUFBSSxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsRUFBRTs0QkFDekIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDOzRCQUNwQixPQUFPO3lCQUNSOzZCQUFNOzRCQUNMLE1BQU0sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDOzRCQUN6QixPQUFPO3lCQUNSO3FCQUNGO3lCQUFNO3dCQUNMLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLEVBQUU7NEJBQ3pCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzs0QkFDcEIsT0FBTzt5QkFDUjs2QkFBTTs0QkFDTCxNQUFNLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzs0QkFDekIsT0FBTzt5QkFDUjtxQkFDRjtpQkFFRjtxQkFBTSxJQUFJLFlBQVksSUFBSSxJQUFJLEVBQUU7b0JBQy9CLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLEVBQUU7d0JBQzNCLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLEVBQUU7NEJBQ3pCLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtnQ0FDWCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0NBQ3BCLE9BQU87NkJBQ1I7aUNBQU07Z0NBQ0wsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFO29DQUNaLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztvQ0FDN0QsT0FBTztpQ0FDUjtxQ0FBTSxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRTtvQ0FDaEMsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO29DQUM3RCxPQUFPO2lDQUNSO3FDQUFNO29DQUNMLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO29DQUMxQixPQUFPO2lDQUNSOzZCQUNGO3lCQUNGO3dCQUNELElBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLEVBQUU7NEJBQ3hCLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRTtnQ0FDWixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0NBQ3BCLE9BQU87NkJBQ1I7NEJBQ0QsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFO2dDQUNaLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztnQ0FDN0QsT0FBTzs2QkFDUjtpQ0FBTSxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRTtnQ0FDaEMsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dDQUM3RCxPQUFPOzZCQUNSO2lDQUFNO2dDQUNMLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dDQUMxQixPQUFPOzZCQUNSO3lCQUNGO3FCQUNGO3lCQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLEVBQUU7d0JBQ2xDLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLEVBQUU7NEJBQ3pCLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtnQ0FDWCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0NBQ3BCLE9BQU87NkJBQ1I7aUNBQU07Z0NBQ0wsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFO29DQUNaLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztvQ0FDN0QsT0FBTztpQ0FDUjtxQ0FBTSxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRTtvQ0FDaEMsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO29DQUM3RCxPQUFPO2lDQUNSO3FDQUFNO29DQUNMLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO29DQUMxQixPQUFPO2lDQUNSOzZCQUNGO3lCQUNGO3dCQUNELElBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLEVBQUU7NEJBQ3hCLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRTtnQ0FDWixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0NBQ3BCLE9BQU87NkJBQ1I7NEJBQ0QsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFO2dDQUNaLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztnQ0FDN0QsT0FBTzs2QkFDUjtpQ0FBTSxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRTtnQ0FDaEMsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dDQUM3RCxPQUFPOzZCQUNSO2lDQUFNO2dDQUNMLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dDQUMxQixPQUFPOzZCQUNSO3lCQUNGO3FCQUNGO3lCQUFNO3dCQUNMLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLEVBQUU7NEJBQ3pCLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtnQ0FDWCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0NBQ3BCLE9BQU87NkJBQ1I7aUNBQU07Z0NBQ0wsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFO29DQUNaLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztvQ0FDN0QsT0FBTztpQ0FDUjtxQ0FBTSxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRTtvQ0FDaEMsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO29DQUM3RCxPQUFPO2lDQUNSO3FDQUFNO29DQUNMLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO29DQUMxQixPQUFPO2lDQUNSOzZCQUNGO3lCQUNGO3dCQUNELElBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLEVBQUU7NEJBQ3hCLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRTtnQ0FDWixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0NBQ3BCLE9BQU87NkJBQ1I7NEJBQ0QsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFO2dDQUNaLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztnQ0FDN0QsT0FBTzs2QkFDUjtpQ0FBTSxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRTtnQ0FDaEMsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dDQUM3RCxPQUFPOzZCQUNSO2lDQUFNO2dDQUNMLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dDQUMxQixPQUFPOzZCQUNSO3lCQUNGO3FCQUNGO2lCQUNGO2dCQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDM0QsT0FBTzthQUNSO1lBQ0QsSUFBSSxZQUFZLElBQUksS0FBSyxFQUFFO2dCQUN6QixJQUFJLFFBQVEsSUFBSSxDQUFDLEVBQUU7b0JBRWpCLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUMxQixPQUFPO2lCQUNSO3FCQUFNO29CQUNMLE1BQU0sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUN6QixPQUFPO2lCQUNSO2FBQ0Y7aUJBQU0sSUFBSSxZQUFZLElBQUksS0FBSyxFQUFFO2dCQUNoQyxJQUFJLFFBQVEsSUFBSSxDQUFDLEVBQUU7b0JBRWpCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztvQkFDcEIsT0FBTztpQkFDUjtnQkFDRCxJQUFJLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRTtvQkFDbEUsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUNwQixPQUFPO2lCQUNSO3FCQUFNO29CQUNMLE1BQU0sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUN6QixPQUFPO2lCQUNSO2FBQ0Y7aUJBQU0sSUFBSSxZQUFZLElBQUksS0FBSyxFQUFFO2dCQUNoQyxJQUFJLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxFQUFFO29CQUN6QixJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7d0JBQ1gsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO3dCQUNwQixPQUFPO3FCQUNSO3lCQUFNO3dCQUNMLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRTs0QkFDWixNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7NEJBQzdELE9BQU87eUJBQ1I7NkJBQU07NEJBQ0wsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDOzRCQUM3RCxPQUFPO3lCQUNSO3FCQUNGO2lCQUNGO3FCQUFNLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUU7b0JBQzlELElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTt3QkFDWCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7d0JBQ3BCLE9BQU87cUJBQ1I7eUJBQU07d0JBQ0wsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFOzRCQUNaLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQzs0QkFDN0QsT0FBTzt5QkFDUjs2QkFBTTs0QkFDTCxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7NEJBQzdELE9BQU87eUJBQ1I7cUJBQ0Y7aUJBQ0Y7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUNwQixPQUFPO2lCQUNSO2FBQ0Y7aUJBQU0sSUFBSSxZQUFZLElBQUksS0FBSyxFQUFFO2dCQUNoQyxJQUFJLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxFQUFFO29CQUN6QixJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7d0JBQ1gsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO3dCQUNwQixPQUFPO3FCQUNSO3lCQUFNO3dCQUNMLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRTs0QkFDYixNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7NEJBQzdELE9BQU87eUJBQ1I7NkJBQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEVBQUU7NEJBQ2hDLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQzs0QkFDN0QsT0FBTzt5QkFDUjs2QkFBTTs0QkFDTCxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7NEJBQzdELE9BQU87eUJBQ1I7d0JBQ0QsTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7d0JBQzFCLE9BQU87cUJBQ1I7aUJBQ0Y7cUJBQU0sSUFBSSxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsRUFBRTtvQkFDaEMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFO3dCQUNaLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzt3QkFDcEIsT0FBTztxQkFDUjt5QkFBTTt3QkFDTCxJQUFJLElBQUksSUFBSSxDQUFDLEVBQUU7NEJBQ2IsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDOzRCQUM3RCxPQUFPO3lCQUNSOzZCQUFNLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFFOzRCQUNqQyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7NEJBQzdELE9BQU87eUJBQ1I7NkJBQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRTs0QkFDOUMsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDOzRCQUM3RCxPQUFPO3lCQUNSOzZCQUFNOzRCQUNMLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDOzRCQUMxQixPQUFPO3lCQUNSO3dCQUNELE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO3dCQUMxQixPQUFPO3FCQUNSO2lCQUNGO3FCQUFNO29CQUNMLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztvQkFDcEIsT0FBTztpQkFDUjthQUNGO2lCQUFNLElBQUksWUFBWSxJQUFJLEtBQUssRUFBRTtnQkFDaEMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFO29CQUNaLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDN0QsT0FBTztpQkFDUjtxQkFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRTtvQkFDOUIsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUM3RCxPQUFPO2lCQUNSO3FCQUFNLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFO29CQUM5QixNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQzdELE9BQU87aUJBQ1I7Z0JBQ0QsTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQzFCLE9BQU87YUFDUjtZQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDOUMsT0FBTztTQUNSO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZCxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDekIsV0FBVyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUMzRTtJQUNILENBQUM7SUFFRCxLQUFLLENBQUMsZUFBZSxDQUFDLFNBQW1CLEVBQUUsUUFBZ0IsRUFBRSxRQUFnQixFQUFFLElBQVk7UUFDekYsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDeEMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDckQsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksUUFBUSxJQUFJLFFBQVEsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDM0QsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLDhCQUE4QixFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFDdkYsT0FBTztTQUNSO2FBQU07WUFDTCxNQUFNLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztTQUMzQjtJQUNILENBQUM7SUFFRCxLQUFLLENBQUMsWUFBWTtRQUNoQixJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN4QyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNyRCxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsMkJBQTJCLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFDRCxLQUFLLENBQUMsWUFBWTtRQUNoQixJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN4QyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNyRCxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsMkJBQTJCLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFDRCxLQUFLLENBQUMsV0FBVztRQUNmLElBQUksY0FBYyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3JELE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQywwQkFBMEIsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7SUFDL0UsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFHO1FBRVIsSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLE9BQU8sSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLE9BQU8sSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLFNBQVMsRUFBRTtZQUN2RSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDZCxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksT0FBTyxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxFQUFFO2dCQUMvQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7YUFDbEI7WUFDRCxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksT0FBTyxJQUFJLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxFQUFFO2dCQUM5QyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDcEI7WUFDRCxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksU0FBUyxFQUFFO2dCQUNoRCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDcEI7U0FDRjtJQUlILENBQUM7SUFHRCxPQUFPO1FBQ0wsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLENBQUM7Q0FFRjtBQTFnQkQsK0JBMGdCQyJ9