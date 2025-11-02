'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.commissionHandler = void 0;
const LanguageService = require("../../../services/common/langsrv");
const CommissionServiceForJinSha = require("../../../services/commission/commissionServiceForJinSha");
const GlobalErrorLog = require('pinus-logger').getLogger('server_out', __filename);
function default_1(app) {
    return new commissionHandler(app);
}
exports.default = default_1;
class commissionHandler {
    constructor(app) {
        this.app = app;
    }
    async getPromoteDetailForJinSha({}, session) {
        try {
            const uid = session.uid;
            const promoteDetail = await CommissionServiceForJinSha.getPromoteDetailForJinSha(uid);
            return { code: 200, promoteDetail };
        }
        catch (error) {
            GlobalErrorLog.info('getPromoteDetailForJinSha', error);
            console.log('getPromoteDetailForJinSha', error);
            return { code: 500, error: LanguageService.getlanguage(null, LanguageService.Net_Message.id_14) };
        }
    }
    ;
    async getPromoteSelfProfitsRecordForJinSha({}, session) {
        try {
            const uid = session.uid;
            const selfProfitsRecords = await CommissionServiceForJinSha.getPromoteSelfProfitsRecordForJinSha(uid);
            return { code: 200, selfProfitsRecords };
        }
        catch (error) {
            GlobalErrorLog.info('getPromoteDetailForJinSha', error);
            return { code: 500, error: LanguageService.getlanguage(null, LanguageService.Net_Message.id_14) };
        }
    }
    ;
    async getPromoteSelfProfitsDetailForJinsha({ createTime, page }, session) {
        try {
            const uid = session.uid;
            const count = 3;
            const { resultList, allPage } = await CommissionServiceForJinSha.getPromoteSelfProfitsDetailForJinsha(uid, createTime, page, count);
            return { code: 200, resultList, allPage };
        }
        catch (error) {
            GlobalErrorLog.info('getPromoteDetailForJinSha', error);
            return { code: 500, error: LanguageService.getlanguage(null, LanguageService.Net_Message.id_14) };
        }
    }
    ;
    async getPlayerProfitsForJinsha({}, session) {
        try {
            const uid = session.uid;
            const [profits, alreadyTiqu] = await Promise.all([
                CommissionServiceForJinSha.getPlayerProfitsForJinsha(uid),
                CommissionServiceForJinSha.getPlayerTiquAllProfits(uid, 0, 0),
            ]);
            return { code: 200, profits, alreadyTiqu };
        }
        catch (error) {
            GlobalErrorLog.info('getPromoteDetailForJinSha', error);
            return { code: 500, error: LanguageService.getlanguage(null, LanguageService.Net_Message.id_14) };
        }
    }
    ;
    async addTiquPlayerProfitsForJinsha({ commission }, session) {
        try {
            return { code: 200, };
        }
        catch (error) {
            GlobalErrorLog.info('getPromoteDetailForJinSha', error);
            return { code: 500, error: LanguageService.getlanguage(null, LanguageService.Net_Message.id_14) };
        }
    }
}
exports.commissionHandler = commissionHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWlzc2lvbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9oYWxsL2hhbmRsZXIvY29tbWlzc2lvbkhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFJYixvRUFBcUU7QUFDckUsc0dBQXVHO0FBQ3ZHLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBR25GLG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEMsQ0FBQztBQUZELDRCQUVDO0FBR0QsTUFBYSxpQkFBaUI7SUFDMUIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtJQUNwQyxDQUFDO0lBMENELEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxFQUFHLEVBQUUsT0FBdUI7UUFDeEQsSUFBSTtZQUNBLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFFeEIsTUFBTSxhQUFhLEdBQUcsTUFBTSwwQkFBMEIsQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUd0RixPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxhQUFhLEVBQUUsQ0FBQztTQUN2QztRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osY0FBYyxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2hELE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxlQUFlLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7U0FDckc7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