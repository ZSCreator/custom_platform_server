"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResult = void 0;
const HttpCode_enum_1 = require("../../servers/gmsApi/lib/support/code/HttpCode.enum");
class ApiResult {
    constructor(code, data = null, msg = '操作成功') {
        this.code = code;
        this.data = data;
        this.msg = msg;
        this.timeStamp = Date.now();
    }
    static SUCCESS(data = null, msg = '操作成功') {
        return new ApiResult(HttpCode_enum_1.HttpCode.SUCCESS, data, msg);
    }
    static ERROR(data = null, msg = '出错') {
        return new ApiResult(HttpCode_enum_1.HttpCode.FAIL, data, msg);
    }
}
exports.ApiResult = ApiResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBpUmVzdWx0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9wb2pvL0FwaVJlc3VsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1RkFBK0U7QUFNL0UsTUFBYSxTQUFTO0lBVWxCLFlBQVksSUFBWSxFQUFFLE9BQVksSUFBSSxFQUFFLE1BQWMsTUFBTTtRQUM1RCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFTSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQVksSUFBSSxFQUFFLE1BQWMsTUFBTTtRQUN4RCxPQUFPLElBQUksU0FBUyxDQUFDLHdCQUFRLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFZLElBQUksRUFBRSxNQUFjLElBQUk7UUFDcEQsT0FBTyxJQUFJLFNBQVMsQ0FBQyx3QkFBUSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDbkQsQ0FBQztDQUVKO0FBekJELDhCQXlCQyJ9