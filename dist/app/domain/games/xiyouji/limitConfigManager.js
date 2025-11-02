"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitConfigManager = void 0;
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const slotsBaseConst_1 = require("../../CommonControl/config/slotsBaseConst");
const databaseService_1 = require("../../../services/databaseService");
const slotLimitConfigSubject_1 = require("../../CommonControl/slotLimitConfigSubject");
class LimitConfigManager extends slotLimitConfigSubject_1.SlotLimitConfigSubject {
    constructor() {
        super(...arguments);
        this.nid = GameNidEnum_1.GameNidEnum.xiyouji;
    }
    static async init() {
        this.instance = new LimitConfigManager(slotsBaseConst_1.mappingTheme[GameNidEnum_1.GameNidEnum.xiyouji], await (0, databaseService_1.createRedisConnection)());
        await this.instance.init();
    }
    static getInstance() {
        return this.instance;
    }
}
exports.LimitConfigManager = LimitConfigManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGltaXRDb25maWdNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2RvbWFpbi9nYW1lcy94aXlvdWppL2xpbWl0Q29uZmlnTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyRUFBc0U7QUFDdEUsOEVBQXVFO0FBQ3ZFLHVFQUF3RjtBQUN4Rix1RkFBa0Y7QUFLbEYsTUFBYSxrQkFBbUIsU0FBUSwrQ0FBc0I7SUFBOUQ7O1FBbUJJLFFBQUcsR0FBZ0IseUJBQVcsQ0FBQyxPQUFPLENBQUM7SUFDM0MsQ0FBQztJQWRHLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSTtRQUNiLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyw2QkFBWSxDQUFDLHlCQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsTUFBTSxJQUFBLHVDQUFxQixHQUFFLENBQUMsQ0FBQztRQUN6RyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUtELE1BQU0sQ0FBQyxXQUFXO1FBQ2QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7Q0FJSjtBQXBCRCxnREFvQkMifQ==