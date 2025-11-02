'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopHandler = void 0;
const MongoManager = require("../../../common/dao/mongoDB/lib/mongoManager");
const langsrv = require("../../../services/common/langsrv");
const pinus_logger_1 = require("pinus-logger");
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const payOrder = MongoManager.pay_order;
function default_1(app) {
    return new shopHandler(app);
}
exports.default = default_1;
class shopHandler {
    constructor(app) {
        this.app = app;
    }
    async getCustomerPayInfo(msg, session) {
        let language1 = null;
        try {
            return { code: 200, customerPayInfo: [], customerText: null };
        }
        catch (error) {
            Logger.error('hall.shopHandler.getCustomerPayInfo ==>', error);
            return { code: 500, error: langsrv.getlanguage(language1, langsrv.Net_Message.id_14) };
        }
    }
    ;
}
exports.shopHandler = shopHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hvcEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9oYWxsL2hhbmRsZXIvc2hvcEhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFLYiw2RUFBOEU7QUFDOUUsNERBQTZEO0FBQzdELCtDQUF5QztBQUV6QyxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ25ELE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUM7QUFFeEMsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBYSxXQUFXO0lBQ3BCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7SUFDcEMsQ0FBQztJQXdJRCxLQUFLLENBQUMsa0JBQWtCLENBQUcsR0FBTyxFQUFFLE9BQXVCO1FBQ3ZELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJO1lBQ0EsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsZUFBZSxFQUFFLEVBQUUsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLENBQUE7U0FDaEU7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNaLE1BQU0sQ0FBQyxLQUFLLENBQUMseUNBQXlDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDL0QsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUMsQ0FBQTtTQUN4RjtJQUNMLENBQUM7SUFBQSxDQUFDO0NBR0w7QUFySkQsa0NBcUpDIn0=