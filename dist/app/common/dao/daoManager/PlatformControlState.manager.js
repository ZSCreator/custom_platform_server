"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlatformControlState_mysql_dao_1 = require("../mysql/PlatformControlState.mysql.dao");
class PlatformControlStateManager {
    async createOne(parameter) {
        return PlatformControlState_mysql_dao_1.default.insertOne(parameter);
    }
    async findOne(params) {
        return PlatformControlState_mysql_dao_1.default.findOne(params);
    }
    async updateOne(params, updateParam) {
        return PlatformControlState_mysql_dao_1.default.updateOne(params, updateParam);
    }
    async findManyByNidList(where) {
        return PlatformControlState_mysql_dao_1.default.findManyByNidList(where);
    }
    async delete(params) {
        return PlatformControlState_mysql_dao_1.default.delete(params);
    }
}
exports.default = new PlatformControlStateManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhdGZvcm1Db250cm9sU3RhdGUubWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL2Rhb01hbmFnZXIvUGxhdGZvcm1Db250cm9sU3RhdGUubWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDRGQUFtRjtBQU1uRixNQUFNLDJCQUEyQjtJQUM3QixLQUFLLENBQUMsU0FBUyxDQUFDLFNBQWdEO1FBQzVELE9BQU8sd0NBQTRCLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQW9CO1FBQzlCLE9BQU8sd0NBQTRCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQW9CLEVBQUUsV0FBa0Q7UUFDcEYsT0FBTyx3Q0FBNEIsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFNRCxLQUFLLENBQUMsaUJBQWlCLENBQUMsS0FBMkY7UUFDL0csT0FBTyx3Q0FBNEIsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBTUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFvQjtRQUM3QixPQUFPLHdDQUE0QixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2RCxDQUFDO0NBQ0o7QUFFRCxrQkFBZSxJQUFJLDJCQUEyQixFQUFFLENBQUMifQ==