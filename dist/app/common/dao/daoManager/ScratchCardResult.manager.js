"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScratchCardResultManager = void 0;
const ScratchCardResult_mysql_dao_1 = require("../mysql/ScratchCardResult.mysql.dao");
class ScratchCardResultManager {
    async findOne(parameter) {
        const ScratchCardResultOnMysql = await ScratchCardResult_mysql_dao_1.default.findOne(parameter);
        let ScratchCardResult_ = {
            result: ScratchCardResultOnMysql.result.split(',').map(Number),
            cardNum: ScratchCardResultOnMysql.cardNum,
            rebate: ScratchCardResultOnMysql.rebate,
            jackpotId: ScratchCardResultOnMysql.jackpotId,
            status: ScratchCardResultOnMysql.status,
        };
        return ScratchCardResult_;
    }
    async updateOne(parameter, partialEntity) {
        await ScratchCardResult_mysql_dao_1.default.updateOne(parameter, partialEntity);
        return true;
    }
    async updateMany(parameter, partialEntity) {
        await ScratchCardResult_mysql_dao_1.default.updateMany(parameter, partialEntity);
        return true;
    }
    async findOneNotLottery(jackpotId) {
        return ScratchCardResult_mysql_dao_1.default.randomFindOneNotLottery(jackpotId);
    }
}
exports.ScratchCardResultManager = ScratchCardResultManager;
exports.default = new ScratchCardResultManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NyYXRjaENhcmRSZXN1bHQubWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL2Rhb01hbmFnZXIvU2NyYXRjaENhcmRSZXN1bHQubWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzRkFBNkU7QUFLN0UsTUFBYSx3QkFBd0I7SUFFakMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUF1QztRQUVqRCxNQUFNLHdCQUF3QixHQUFHLE1BQU0scUNBQXlCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3BGLElBQUksa0JBQWtCLEdBQUc7WUFDckIsTUFBTSxFQUFFLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUM5RCxPQUFPLEVBQUUsd0JBQXdCLENBQUMsT0FBTztZQUN6QyxNQUFNLEVBQUUsd0JBQXdCLENBQUMsTUFBTTtZQUN2QyxTQUFTLEVBQUUsd0JBQXdCLENBQUMsU0FBUztZQUM3QyxNQUFNLEVBQUUsd0JBQXdCLENBQUMsTUFBTTtTQUMxQyxDQUFBO1FBQ0QsT0FBTyxrQkFBa0IsQ0FBQztJQUM5QixDQUFDO0lBR0QsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUF1QyxFQUFFLGFBQTJDO1FBQ2hHLE1BQU0scUNBQXlCLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUNwRSxPQUFPLElBQUksQ0FBQztJQUVoQixDQUFDO0lBT0QsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUF1QyxFQUFFLGFBQTJDO1FBQ2pHLE1BQU0scUNBQXlCLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUNyRSxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBS0QsS0FBSyxDQUFDLGlCQUFpQixDQUFDLFNBQWlCO1FBQ3JDLE9BQU8scUNBQXlCLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDeEUsQ0FBQztDQUVKO0FBdkNELDREQXVDQztBQUVELGtCQUFlLElBQUksd0JBQXdCLEVBQUUsQ0FBQyJ9