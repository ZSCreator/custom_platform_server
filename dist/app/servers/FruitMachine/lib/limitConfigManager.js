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
        this.nid = GameNidEnum_1.GameNidEnum.FruitMachine;
    }
    static async init() {
        this.instance = new LimitConfigManager(slotsBaseConst_1.mappingTheme[GameNidEnum_1.GameNidEnum.FruitMachine], await (0, databaseService_1.createRedisConnection)());
        await this.instance.init();
    }
    static getInstance() {
        return this.instance;
    }
}
exports.LimitConfigManager = LimitConfigManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGltaXRDb25maWdNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvRnJ1aXRNYWNoaW5lL2xpYi9saW1pdENvbmZpZ01hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkVBQXNFO0FBQ3RFLHdGQUFpRjtBQUNqRix1RUFBd0U7QUFDeEUsaUdBQTRGO0FBSzVGLE1BQWEsa0JBQW1CLFNBQVEsK0NBQXNCO0lBQTlEOztRQUdJLFFBQUcsR0FBZ0IseUJBQVcsQ0FBQyxZQUFZLENBQUM7SUFnQmhELENBQUM7SUFYRyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUk7UUFDYixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksa0JBQWtCLENBQUMsNkJBQVksQ0FBQyx5QkFBVyxDQUFDLFlBQVksQ0FBQyxFQUFFLE1BQU0sSUFBQSx1Q0FBcUIsR0FBRSxDQUFDLENBQUM7UUFDOUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFLRCxNQUFNLENBQUMsV0FBVztRQUNkLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0NBQ0o7QUFuQkQsZ0RBbUJDIn0=