"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const mocha_1 = require("mocha");
(0, mocha_1.describe)("查询租户所属的玩家游戏记录 ", function () {
    (0, mocha_1.before)(async () => {
        await RDSClient_1.RDSClient.demoInit();
    });
    (0, mocha_1.describe)("dao 层操作", () => {
        let consoleResult;
        (0, mocha_1.afterEach)(() => {
            if (!!consoleResult)
                console.log(consoleResult);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyQWdlbnRBbmRHYW1lUmVjb3JkLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L3NlcnZpY2UvcGxheWVyQWdlbnRBbmRHYW1lUmVjb3JkLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3RUFBcUU7QUFDckUsaUNBQWtEO0FBRWxELElBQUEsZ0JBQVEsRUFBQyxnQkFBZ0IsRUFBRTtJQUV2QixJQUFBLGNBQU0sRUFBQyxLQUFLLElBQUksRUFBRTtRQUNkLE1BQU0scUJBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMvQixDQUFDLENBQUMsQ0FBQztJQUVILElBQUEsZ0JBQVEsRUFBQyxTQUFTLEVBQUUsR0FBRyxFQUFFO1FBQ3JCLElBQUksYUFBYSxDQUFDO1FBRWxCLElBQUEsaUJBQVMsRUFBQyxHQUFHLEVBQUU7WUFDWCxJQUFJLENBQUMsQ0FBQyxhQUFhO2dCQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=