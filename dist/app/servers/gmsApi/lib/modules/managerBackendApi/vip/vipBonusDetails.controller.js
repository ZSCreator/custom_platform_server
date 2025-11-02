"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VipBonusDetailsController = void 0;
const common_1 = require("@nestjs/common");
const pinus_logger_1 = require("pinus-logger");
const VipBonusDetails_mysql_dao_1 = require("../../../../../../common/dao/mysql/VipBonusDetails.mysql.dao");
const token_guard_1 = require("../../main/token.guard");
let VipBonusDetailsController = class VipBonusDetailsController {
    constructor() {
        this.logger = (0, pinus_logger_1.getLogger)('thirdHttp', __filename);
    }
    async findList(str) {
        console.log("findList", str);
        try {
            const page = Number(str.page);
            const pageSize = Number(str.pageSize);
            const data = await VipBonusDetails_mysql_dao_1.default.findListToLimit(page, pageSize);
            if (data) {
                return { code: 200, data, msg: "操作成功" };
            }
            return { code: 200, data: { list: [], count: 0 }, msg: "异常" };
        }
        catch (error) {
            this.logger.error(`获取vip配置列表 :${error}`);
            return { code: 500, error, msg: "出错" };
        }
    }
    async updateOne(str) {
        const { id } = str, rest = __rest(str, ["id"]);
        try {
            await VipBonusDetails_mysql_dao_1.default.updateOne({ id }, rest);
            return { code: 200, data: null, msg: "操作成功" };
        }
        catch (error) {
            this.logger.error(`修改vip配置信息出错 :${error}`);
            return { code: 500, error, msg: "出错" };
        }
    }
};
__decorate([
    (0, common_1.Post)('findList'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VipBonusDetailsController.prototype, "findList", null);
__decorate([
    (0, common_1.Post)('updateOne'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VipBonusDetailsController.prototype, "updateOne", null);
VipBonusDetailsController = __decorate([
    (0, common_1.Controller)("vipBonusDetails"),
    (0, common_1.UseGuards)(token_guard_1.TokenGuard),
    __metadata("design:paramtypes", [])
], VipBonusDetailsController);
exports.VipBonusDetailsController = VipBonusDetailsController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlwQm9udXNEZXRhaWxzLmNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL21vZHVsZXMvbWFuYWdlckJhY2tlbmRBcGkvdmlwL3ZpcEJvbnVzRGV0YWlscy5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQXdFO0FBQ3hFLCtDQUF5QztBQUN6Qyw0R0FBbUc7QUFDbkcsd0RBQW9EO0FBSXBELElBQWEseUJBQXlCLEdBQXRDLE1BQWEseUJBQXlCO0lBRWxDO1FBQ0ksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFHRCxLQUFLLENBQUMsUUFBUSxDQUFTLEdBQVE7UUFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDNUIsSUFBSTtZQUVBLE1BQU0sSUFBSSxHQUFXLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEMsTUFBTSxRQUFRLEdBQVcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUU5QyxNQUFNLElBQUksR0FBRyxNQUFNLG1DQUF1QixDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFFM0UsSUFBSSxJQUFJLEVBQUU7Z0JBQ04sT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQzthQUMzQztZQUVELE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQTtTQUNoRTtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3pDLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUE7U0FDekM7SUFDTCxDQUFDO0lBR0QsS0FBSyxDQUFDLFNBQVMsQ0FBUyxHQUFRO1FBQzVCLE1BQU0sRUFBRSxFQUFFLEtBQWMsR0FBRyxFQUFaLElBQUksVUFBSyxHQUFHLEVBQXJCLE1BQWUsQ0FBTSxDQUFDO1FBQzVCLElBQUk7WUFDQSxNQUFNLG1DQUF1QixDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRXRELE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFBO1NBQ2hEO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUMzQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFBO1NBQ3pDO0lBQ0wsQ0FBQztDQUNKLENBQUE7QUFoQ0c7SUFEQyxJQUFBLGFBQUksRUFBQyxVQUFVLENBQUM7SUFDRCxXQUFBLElBQUEsYUFBSSxHQUFFLENBQUE7Ozs7eURBa0JyQjtBQUdEO0lBREMsSUFBQSxhQUFJLEVBQUMsV0FBVyxDQUFDO0lBQ0QsV0FBQSxJQUFBLGFBQUksR0FBRSxDQUFBOzs7OzBEQVV0QjtBQXRDUSx5QkFBeUI7SUFGckMsSUFBQSxtQkFBVSxFQUFDLGlCQUFpQixDQUFDO0lBQzdCLElBQUEsa0JBQVMsRUFBQyx3QkFBVSxDQUFDOztHQUNULHlCQUF5QixDQXVDckM7QUF2Q1ksOERBQXlCIn0=