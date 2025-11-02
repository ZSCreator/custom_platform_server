'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRobot_1 = require("../../../../common/pojo/baseClass/BaseRobot");
const baicaoConst = require("../baicaoConst");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const utils = require("../../../../utils");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
class SanGongRobot extends BaseRobot_1.BaseRobot {
    constructor(opts) {
        super(opts);
        this.playRound = 0;
        this.leaveRound = commonUtil.randomFromRange(5, 20);
        this.playerGold = 0;
        this.initGold = 0;
        this.entryCond = 0;
    }
    async sanGongLoaded() {
        try {
            const loadedData = await this.requestByRoute('baicao.mainHandler.loaded', {});
            this.entryCond = loadedData.room.players.find(pl => pl && pl.uid == this.uid).gold;
        }
        catch (error) {
            robotlogger.warn(`baicao|robot|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|${error}`);
            return Promise.reject(error);
        }
    }
    async destroy() {
        await this.leaveGameAndReset(false);
    }
    registerListener() {
        this.Emitter.on(baicaoConst.route.SettleResult, initData => {
            this.onInitSanGong(initData);
        });
        this.Emitter.on(baicaoConst.route.KickPlayer, onKicked => {
            this.onSanGongKick(onKicked);
        });
    }
    onSanGongKick(onKicked) {
        if (this.uid == onKicked.uid) {
            return this.destroy();
        }
    }
    async onInitSanGong(initData) {
        setTimeout(() => {
            this.destroy();
        }, utils.random(1, 3) * 10);
    }
}
exports.default = SanGongRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFpY2FvUm9ib3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9iYWljYW8vbGliL3JvYm90L2JhaWNhb1JvYm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFHYiwyRUFBd0U7QUFDeEUsOENBQStDO0FBQy9DLG1FQUFtRTtBQUNuRSwyQ0FBNEM7QUFFNUMsK0NBQXlDO0FBQ3pDLE1BQU0sV0FBVyxHQUFHLElBQUEsd0JBQVMsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFdkQsTUFBcUIsWUFBYSxTQUFRLHFCQUFTO0lBTy9DLFlBQVksSUFBSTtRQUNaLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNaLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUdELEtBQUssQ0FBQyxhQUFhO1FBQ2YsSUFBSTtZQUNBLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQywyQkFBMkIsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM5RSxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7U0FDdEY7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNaLFdBQVcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztZQUNqRyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDaEM7SUFDTCxDQUFDO0lBR0QsS0FBSyxDQUFDLE9BQU87UUFDVCxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBR0QsZ0JBQWdCO1FBRVosSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLEVBQUU7WUFDdkQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxFQUFFO1lBQ3JELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBR0QsYUFBYSxDQUFDLFFBQVE7UUFDbEIsSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDMUIsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDekI7SUFDTCxDQUFDO0lBSUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxRQUErQjtRQUMvQyxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25CLENBQUMsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNoQyxDQUFDO0NBQ0o7QUExREQsK0JBMERDIn0=