"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../../app/common/dao/mysql/lib/RDSClient");
const mocha_1 = require("mocha");
const connectionManager_1 = require("../../../app/common/dao/mysql/lib/connectionManager");
const LogTelegramCustomerRecord_entity_1 = require("../../../app/common/dao/mysql/entity/LogTelegramCustomerRecord.entity");
(0, mocha_1.describe)("测试tele客服表", function () {
    this.timeout(50000);
    (0, mocha_1.before)("初始化连接池", async () => {
        await RDSClient_1.RDSClient.demoInit();
    });
    (0, mocha_1.it)("测试count", async () => {
        const res = await connectionManager_1.default.getConnection()
            .getRepository(LogTelegramCustomerRecord_entity_1.LogTelegramCustomerRecord)
            .createQueryBuilder("lt")
            .select("SUM(lt.fk_telegramCustomer_id)", "sum")
            .getRawOne();
        console.log(res, typeof res.sum);
        return true;
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVsZWdyYW1DdXN0b21lci50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9kYW8vbXlzcWwvVGVsZWdyYW1DdXN0b21lci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkVBQXdFO0FBRXhFLGlDQUE2QztBQUM3QywyRkFBb0Y7QUFDcEYsNEhBQWtIO0FBR2xILElBQUEsZ0JBQVEsRUFBQyxXQUFXLEVBQUU7SUFDbEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwQixJQUFBLGNBQU0sRUFBQyxRQUFRLEVBQUUsS0FBSyxJQUFJLEVBQUU7UUFDeEIsTUFBTSxxQkFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQy9CLENBQUMsQ0FBQyxDQUFDO0lBYUgsSUFBQSxVQUFFLEVBQUMsU0FBUyxFQUFFLEtBQUssSUFBSSxFQUFFO1FBV3JCLE1BQU0sR0FBRyxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2FBQzlDLGFBQWEsQ0FBQyw0REFBeUIsQ0FBQzthQUN4QyxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7YUFDeEIsTUFBTSxDQUFDLGdDQUFnQyxFQUFFLEtBQUssQ0FBQzthQUMvQyxTQUFTLEVBQUUsQ0FBQztRQUVqQixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNoQyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDLENBQUMsQ0FBQTtBQUVOLENBQUMsQ0FBQyxDQUFDIn0=