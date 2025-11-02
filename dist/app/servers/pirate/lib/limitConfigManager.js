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
        this.nid = GameNidEnum_1.GameNidEnum.pirate;
    }
    static async init() {
        this.instance = new LimitConfigManager(slotsBaseConst_1.mappingTheme[GameNidEnum_1.GameNidEnum.pirate], await (0, databaseService_1.createRedisConnection)());
        await this.instance.init();
    }
    static getInstance() {
        return this.instance;
    }
}
exports.LimitConfigManager = LimitConfigManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGltaXRDb25maWdNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcGlyYXRlL2xpYi9saW1pdENvbmZpZ01hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkVBQXNFO0FBQ3RFLHdGQUFpRjtBQUNqRix1RUFBd0Y7QUFDeEYsaUdBQTRGO0FBSzVGLE1BQWEsa0JBQW1CLFNBQVEsK0NBQXNCO0lBQTlEOztRQW1CSSxRQUFHLEdBQWdCLHlCQUFXLENBQUMsTUFBTSxDQUFDO0lBQzFDLENBQUM7SUFkRyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUk7UUFDYixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksa0JBQWtCLENBQUMsNkJBQVksQ0FBQyx5QkFBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sSUFBQSx1Q0FBcUIsR0FBRSxDQUFDLENBQUM7UUFDeEcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFLRCxNQUFNLENBQUMsV0FBVztRQUNkLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0NBSUo7QUFwQkQsZ0RBb0JDIn0=