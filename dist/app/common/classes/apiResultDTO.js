"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiResultDTO {
    constructor(opt) {
        this.code = opt.code ? opt.code : 500;
        this.msg = opt.msg ? opt.msg : '';
        if (opt.data) {
            this.data = opt.data;
        }
    }
    result() {
        switch (this.code) {
            case 200: return this._resultTwoHundred();
            case 500: return this._resultFiveHundred();
            default: return { code: 500, msg: '网络异常' };
        }
    }
    _resultFiveHundred() {
        return {
            code: this.code,
            msg: this.msg,
        };
    }
    _resultTwoHundred() {
        return {
            code: this.code,
            msg: this.msg,
            data: this.data
        };
    }
}
exports.default = ApiResultDTO;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpUmVzdWx0RFRPLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9jbGFzc2VzL2FwaVJlc3VsdERUTy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWNBLE1BQXFCLFlBQVk7SUFJN0IsWUFBWSxHQUFxRDtRQUM3RCxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUN0QyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUVqQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUU7WUFDVixJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7U0FDeEI7SUFDTCxDQUFDO0lBS00sTUFBTTtRQUNULFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNmLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUMxQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDM0MsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBQyxDQUFDO1NBQzVDO0lBQ0wsQ0FBQztJQUtPLGtCQUFrQjtRQUN0QixPQUFPO1lBQ0gsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1lBQ2YsR0FBRyxFQUFHLElBQUksQ0FBQyxHQUFHO1NBQ2pCLENBQUM7SUFDTixDQUFDO0lBTU8saUJBQWlCO1FBQ3JCLE9BQU87WUFDSCxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDZixHQUFHLEVBQUcsSUFBSSxDQUFDLEdBQUc7WUFDZCxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7U0FDbEIsQ0FBQTtJQUNMLENBQUM7Q0FDSjtBQTdDRCwrQkE2Q0MifQ==