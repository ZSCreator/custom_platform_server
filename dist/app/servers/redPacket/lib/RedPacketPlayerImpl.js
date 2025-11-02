"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const PlayerGameStatusEnum_1 = require("./enum/PlayerGameStatusEnum");
const BlackListLevelEnum_1 = require("./enum/BlackListLevelEnum");
class RedPacketPlayerImpl extends PlayerInfo_1.PlayerInfo {
    constructor(opt) {
        super(opt);
        this.seat = -1;
        this.status = PlayerGameStatusEnum_1.PlayerGameStatusEnum.READY;
        this.controlState = null;
        this.gain = 0;
        this.correctedValue = 1;
        this.minCorrectedValue = 1.25;
        this.maxCorrectedValue = 0.75;
        this.blackListLevel = BlackListLevelEnum_1.BlackListLevelEnum.NONE;
        this.BlackListLevelValue = [1, 1.25, 1.5, 2];
        this.profitAmount = 0;
    }
    async initGame() {
        this.controlState = null;
    }
    changePlayerStatus(_status) {
        this.status = _status;
    }
    sendPlayerInfoForFrontEnd() {
        return {
            uid: this.uid,
            gold: this.gold,
            gain: this.gain,
            nickname: this.nickname,
            headurl: this.headurl,
            status: this.status
        };
    }
    sendInfoForPlayerList() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            profitAmount: this.gain,
        };
    }
    getPersonalCorrectedValue() {
        return this.correctedValue;
    }
    getBlackListCorrectedValue() {
        return this.BlackListLevelValue[this.blackListLevel];
    }
}
exports.default = RedPacketPlayerImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVkUGFja2V0UGxheWVySW1wbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3JlZFBhY2tldC9saWIvUmVkUGFja2V0UGxheWVySW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVFQUFrRTtBQUNsRSxzRUFBMkY7QUFDM0Ysa0VBQThEO0FBVTlELE1BQXFCLG1CQUFvQixTQUFRLHVCQUFVO0lBcUJ6RCxZQUFZLEdBQUc7UUFDYixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFwQmIsU0FBSSxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBRWxCLFdBQU0sR0FBeUIsMkNBQW9CLENBQUMsS0FBSyxDQUFDO1FBRTFELGlCQUFZLEdBQXVCLElBQUksQ0FBQztRQUV4QyxTQUFJLEdBQVcsQ0FBQyxDQUFDO1FBQ2pCLG1CQUFjLEdBQVcsQ0FBQyxDQUFDO1FBQzNCLHNCQUFpQixHQUFXLElBQUksQ0FBQztRQUNqQyxzQkFBaUIsR0FBVyxJQUFJLENBQUM7UUFDakMsbUJBQWMsR0FBdUIsdUNBQWtCLENBQUMsSUFBSSxDQUFDO1FBQzdELHdCQUFtQixHQUFhLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFNbEQsaUJBQVksR0FBVyxDQUFDLENBQUM7SUFJekIsQ0FBQztJQUVELEtBQUssQ0FBQyxRQUFRO1FBQ1osSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7SUFDM0IsQ0FBQztJQU1ELGtCQUFrQixDQUFDLE9BQTZCO1FBQzlDLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDO0lBQ3hCLENBQUM7SUFLRCx5QkFBeUI7UUFDdkIsT0FBTztZQUNMLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztZQUNiLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUN2QixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDckIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1NBQ3BCLENBQUM7SUFDSixDQUFDO0lBS0QscUJBQXFCO1FBQ25CLE9BQU87WUFDTCxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7WUFDYixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7WUFDdkIsWUFBWSxFQUFFLElBQUksQ0FBQyxJQUFJO1NBQ3hCLENBQUM7SUFDSixDQUFDO0lBTUQseUJBQXlCO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUM3QixDQUFDO0lBS0QsMEJBQTBCO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUN2RCxDQUFDO0NBRUY7QUE3RUQsc0NBNkVDIn0=