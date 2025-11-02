"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlatformControl_mysql_dao_1 = require("../mysql/PlatformControl.mysql.dao");
const constants_1 = require("../../../services/newControl/constants");
const utils_1 = require("../../../utils/utils");
class PlatformControlManager {
    async createOne(parameter) {
        return PlatformControl_mysql_dao_1.default.insertOne(parameter);
    }
    async findOneByTenantIdAndSceneId(platformId, tenantId, nid, sceneId) {
        const result = (await PlatformControl_mysql_dao_1.default.findOneByTenantIdAndSceneId(platformId, tenantId, nid, sceneId))[0];
        if (!result) {
            return null;
        }
        result.controlStateStatistical = JSON.parse(result.controlStateStatistical);
        result.betPlayersSet = JSON.parse(result.betPlayersSet);
        result.betGoldAmount = parseInt(result.betGoldAmount);
        result.profit = parseInt(result.profit);
        result.serviceCharge = parseInt(result.serviceCharge);
        return result;
    }
    async findOneBySceneId(type, platformId, nid, sceneId) {
        const result = (await PlatformControl_mysql_dao_1.default.findOneBySceneId(type, platformId, nid, sceneId))[0];
        if (!result) {
            return null;
        }
        result.controlStateStatistical = JSON.parse(result.controlStateStatistical);
        result.betPlayersSet = JSON.parse(result.betPlayersSet);
        result.betGoldAmount = parseInt(result.betGoldAmount);
        result.profit = parseInt(result.profit);
        result.serviceCharge = parseInt(result.serviceCharge);
        return result;
    }
    async deleteGoldEqualsZero() {
        await PlatformControl_mysql_dao_1.default.deleteMany({ type: constants_1.RecordTypes.SCENE, betGoldAmount: 0, time: (0, utils_1.getStartTimeOfTheDay)() });
        await PlatformControl_mysql_dao_1.default.deleteMany({ type: constants_1.RecordTypes.TENANT_SCENE, betGoldAmount: 0, time: (0, utils_1.getStartTimeOfTheDay)() });
    }
    async getPlatformDataList(type, platformId, startTime, endTime) {
        const result = await PlatformControl_mysql_dao_1.default.getPlatformByPlatformIdAndTime({ platformId, type }, startTime, endTime);
        result.map(r => {
            r.betPlayersSet = JSON.parse(r.betPlayersSet);
            r.controlStateStatistical = JSON.parse(r.controlStateStatistical);
            r.betGoldAmount = parseInt(r.betGoldAmount);
            r.profit = parseInt(r.profit);
            r.serviceCharge = parseInt(r.serviceCharge);
        });
        return result;
    }
    async getTenantDataList(platformId, tenantId, startTime, endTime) {
        const result = await PlatformControl_mysql_dao_1.default.getPlatformByPlatformIdAndTime({ platformId, tenantId, type: constants_1.RecordTypes.TENANT_SCENE }, startTime, endTime);
        result.map(r => {
            r.betPlayersSet = JSON.parse(r.betPlayersSet);
            r.controlStateStatistical = JSON.parse(r.controlStateStatistical);
            r.betGoldAmount = parseInt(r.betGoldAmount);
            r.profit = parseInt(r.profit);
            r.serviceCharge = parseInt(r.serviceCharge);
        });
        return result;
    }
    async updateSummaryData(id, updateParams) {
        return PlatformControl_mysql_dao_1.default.updateSummaryData(id, updateParams);
    }
    async getTotalPlatformDuringTheMonth(month) {
        const result = (await PlatformControl_mysql_dao_1.default.findOneByPlatform(null, constants_1.RecordTypes.ALL, (0, utils_1.getStartTimeOfTheMonth)(month), (0, utils_1.getEndTimeOfTheMonth)(month)))[0];
        if (!result) {
            return null;
        }
        result.controlStateStatistical = JSON.parse(result.controlStateStatistical);
        result.betPlayersSet = JSON.parse(result.betPlayersSet);
        result.betGoldAmount = parseInt(result.betGoldAmount);
        result.profit = parseInt(result.profit);
        result.serviceCharge = parseInt(result.serviceCharge);
        return result;
    }
    async getMonthlyGameBill(where) {
        const result = (await PlatformControl_mysql_dao_1.default.getPlatformGameBill(where, (0, utils_1.getStartTimeOfTheMonth)(), (0, utils_1.getEndTimeOfTheMonth)()))[0];
        result.betGoldAmount = Number(result.betGoldAmount);
        result.profit = Number(result.profit);
        return result;
    }
}
exports.default = new PlatformControlManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhdGZvcm1Db250cm9sLm1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9kYW9NYW5hZ2VyL1BsYXRmb3JtQ29udHJvbC5tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esa0ZBQXlFO0FBQ3pFLHNFQUFtRTtBQUNuRSxnREFBd0c7QUFJeEcsTUFBTSxzQkFBc0I7SUFDeEIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUEyQztRQUN2RCxPQUFPLG1DQUF1QixDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBU0QsS0FBSyxDQUFDLDJCQUEyQixDQUFDLFVBQWtCLEVBQUUsUUFBZ0IsRUFBRSxHQUFXLEVBQUUsT0FBZTtRQUNoRyxNQUFNLE1BQU0sR0FBRyxDQUFDLE1BQU0sbUNBQXVCLENBQUMsMkJBQTJCLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVsSCxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1QsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUVELE1BQU0sQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQzVFLE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDeEQsTUFBTSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QyxNQUFNLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFdEQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFpQixFQUFFLFVBQWtCLEVBQUUsR0FBVyxFQUFFLE9BQWU7UUFDdEYsTUFBTSxNQUFNLEdBQUcsQ0FBQyxNQUFNLG1DQUF1QixDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbkcsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNULE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxNQUFNLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUM1RSxNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN0RCxNQUFNLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEMsTUFBTSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRXRELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFLRCxLQUFLLENBQUMsb0JBQW9CO1FBQ3RCLE1BQU0sbUNBQXVCLENBQUMsVUFBVSxDQUFDLEVBQUMsSUFBSSxFQUFFLHVCQUFXLENBQUMsS0FBSyxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUEsNEJBQW9CLEdBQUUsRUFBQyxDQUFDLENBQUM7UUFDcEgsTUFBTSxtQ0FBdUIsQ0FBQyxVQUFVLENBQUMsRUFBQyxJQUFJLEVBQUUsdUJBQVcsQ0FBQyxZQUFZLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBQSw0QkFBb0IsR0FBRSxFQUFDLENBQUMsQ0FBQztJQUMvSCxDQUFDO0lBU0QsS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQWlCLEVBQUUsVUFBa0IsRUFBRSxTQUFpQixFQUFFLE9BQWU7UUFDL0YsTUFBTSxNQUFNLEdBQUksTUFBTSxtQ0FBdUIsQ0FBQyw4QkFBOEIsQ0FBQyxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUMsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFHckgsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNYLENBQUMsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDOUMsQ0FBQyxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFDbEUsQ0FBQyxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzVDLENBQUMsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDaEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBU0QsS0FBSyxDQUFDLGlCQUFpQixDQUFDLFVBQWtCLEVBQUUsUUFBZ0IsRUFBRSxTQUFpQixFQUFFLE9BQWU7UUFDNUYsTUFBTSxNQUFNLEdBQUksTUFBTSxtQ0FBdUIsQ0FBQyw4QkFBOEIsQ0FBQyxFQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLHVCQUFXLENBQUMsWUFBWSxFQUFDLEVBQy9ILFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUd4QixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ1gsQ0FBQyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUM5QyxDQUFDLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUNsRSxDQUFDLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDNUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlCLENBQUMsQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFPRCxLQUFLLENBQUMsaUJBQWlCLENBQUMsRUFBVSxFQUFFLFlBQVk7UUFDNUMsT0FBTyxtQ0FBdUIsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUtELEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxLQUFhO1FBQzlDLE1BQU0sTUFBTSxHQUFHLENBQUMsTUFBTSxtQ0FBdUIsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsdUJBQVcsQ0FBQyxHQUFHLEVBQ2pGLElBQUEsOEJBQXNCLEVBQUMsS0FBSyxDQUFDLEVBQUUsSUFBQSw0QkFBb0IsRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFcEUsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNULE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxNQUFNLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUM1RSxNQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN0RCxNQUFNLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEMsTUFBTSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBR3RELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFNRCxLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBOEU7UUFDbkcsTUFBTSxNQUFNLEdBQUcsQ0FBQyxNQUFNLG1DQUF1QixDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxJQUFBLDhCQUFzQixHQUFFLEVBQUUsSUFBQSw0QkFBb0IsR0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvSCxNQUFNLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXRDLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7Q0FDSjtBQUVELGtCQUFlLElBQUksc0JBQXNCLEVBQUUsQ0FBQyJ9