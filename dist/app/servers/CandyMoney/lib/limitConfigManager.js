"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitConfigManager = void 0;
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const slotsBaseConst_1 = require("../../../domain/CommonControl/config/slotsBaseConst");
const databaseService_1 = require("../../../services/databaseService");
const slotLimitConfigSubject_1 = require("../../../domain/CommonControl/slotLimitConfigSubject");
class LimitConfigManager extends slotLimitConfigSubject_1.SlotLimitConfigSubject {
    constructor() {
        super(...arguments);
        this.nid = GameNidEnum_1.GameNidEnum.CandyMoney;
    }
    static async init() {
        this.instance = new LimitConfigManager(slotsBaseConst_1.mappingTheme[GameNidEnum_1.GameNidEnum.CandyMoney], await (0, databaseService_1.createRedisConnection)());
        await this.instance.init();
    }
    static getInstance() {
        return this.instance;
    }
}
exports.LimitConfigManager = LimitConfigManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGltaXRDb25maWdNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvQ2FuZHlNb25leS9saWIvbGltaXRDb25maWdNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJFQUFzRTtBQUN0RSx3RkFBaUY7QUFDakYsdUVBQXdGO0FBQ3hGLGlHQUE0RjtBQUs1RixNQUFhLGtCQUFtQixTQUFRLCtDQUFzQjtJQUE5RDs7UUFtQkksUUFBRyxHQUFnQix5QkFBVyxDQUFDLFVBQVUsQ0FBQztJQUM5QyxDQUFDO0lBZEcsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJO1FBQ2IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGtCQUFrQixDQUFDLDZCQUFZLENBQUMseUJBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRSxNQUFNLElBQUEsdUNBQXFCLEdBQUUsQ0FBQyxDQUFDO1FBQzVHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBS0QsTUFBTSxDQUFDLFdBQVc7UUFDZCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztDQUlKO0FBcEJELGdEQW9CQyJ9