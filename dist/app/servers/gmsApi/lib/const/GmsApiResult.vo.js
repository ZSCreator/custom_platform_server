"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GmsApiResultVO = void 0;
const HttpCode_enum_1 = require("../support/code/HttpCode.enum");
class GmsApiResultVO {
    constructor(status, data = null, msg = "") {
        this.status = status;
        this.data = data;
        this.msg = msg;
    }
    static SUCCESS(data = null, msg = '操作成功') {
        return new GmsApiResultVO(HttpCode_enum_1.HttpCode.SUCCESS, data, msg);
    }
    static ERROR(data = null, msg = '出错') {
        return new GmsApiResultVO(HttpCode_enum_1.HttpCode.FAIL, data, msg);
    }
}
exports.GmsApiResultVO = GmsApiResultVO;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR21zQXBpUmVzdWx0LnZvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZ21zQXBpL2xpYi9jb25zdC9HbXNBcGlSZXN1bHQudm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUVBQXlEO0FBRXpELE1BQWEsY0FBYztJQU92QixZQUFZLE1BQWMsRUFBRSxPQUFZLElBQUksRUFBRSxNQUFjLEVBQUU7UUFDMUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDbkIsQ0FBQztJQUVNLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBWSxJQUFJLEVBQUUsTUFBYyxNQUFNO1FBQ3hELE9BQU8sSUFBSSxjQUFjLENBQUMsd0JBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFTSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQVksSUFBSSxFQUFFLE1BQWMsSUFBSTtRQUNwRCxPQUFPLElBQUksY0FBYyxDQUFDLHdCQUFRLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN4RCxDQUFDO0NBRUo7QUFyQkQsd0NBcUJDIn0=