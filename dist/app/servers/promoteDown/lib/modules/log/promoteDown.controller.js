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
Object.defineProperty(exports, "__esModule", { value: true });
exports.promoteDownController = void 0;
const common_1 = require("@nestjs/common");
const PromoteDown_mysql_dao_1 = require("../../../../../common/dao/mysql/PromoteDown.mysql.dao");
let promoteDownController = class promoteDownController {
    async getAllGames(str) {
        const { platformName, rom_type, phoneId } = str;
        try {
            if (!platformName) {
                return { code: 500, error: "邀请标识不存在" };
            }
            if (!rom_type) {
                return { code: 500, error: "设备信息不存在" };
            }
            if (!phoneId) {
                return { code: 500, error: "手机ID不存在" };
            }
            await PromoteDown_mysql_dao_1.default.insertOne({ platformName, rom_type, phoneId });
            return { code: 200 };
        }
        catch (e) {
            return { code: 500 };
        }
    }
};
__decorate([
    (0, common_1.Post)('promoteDown'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], promoteDownController.prototype, "getAllGames", null);
promoteDownController = __decorate([
    (0, common_1.Controller)('app')
], promoteDownController);
exports.promoteDownController = promoteDownController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvbW90ZURvd24uY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3Byb21vdGVEb3duL2xpYi9tb2R1bGVzL2xvZy9wcm9tb3RlRG93bi5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJDQUFzRDtBQUN0RCxpR0FBd0Y7QUFJeEYsSUFBYSxxQkFBcUIsR0FBbEMsTUFBYSxxQkFBcUI7SUFPOUIsS0FBSyxDQUFDLFdBQVcsQ0FBUyxHQUFTO1FBQy9CLE1BQU0sRUFBQyxZQUFZLEVBQUcsUUFBUSxFQUFHLE9BQU8sRUFBRSxHQUFHLEdBQUcsQ0FBQztRQUNqRCxJQUFJO1lBQ0EsSUFBRyxDQUFDLFlBQVksRUFBQztnQkFDYixPQUFPLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRyxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUE7YUFDekM7WUFFRCxJQUFHLENBQUMsUUFBUSxFQUFFO2dCQUNWLE9BQU8sRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFHLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQTthQUN6QztZQUVELElBQUcsQ0FBQyxPQUFPLEVBQUU7Z0JBQ1QsT0FBTyxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUcsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFBO2FBQ3pDO1lBQ0QsTUFBTSwrQkFBbUIsQ0FBQyxTQUFTLENBQUMsRUFBQyxZQUFZLEVBQUcsUUFBUSxFQUFHLE9BQU8sRUFBRSxDQUFDLENBQUE7WUFDekUsT0FBTyxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUMsQ0FBQztTQUN0QjtRQUFBLE9BQU8sQ0FBQyxFQUFFO1lBQ1AsT0FBTyxFQUFDLElBQUksRUFBRyxHQUFHLEVBQUUsQ0FBQTtTQUN2QjtJQUNMLENBQUM7Q0FDSixDQUFBO0FBcEJHO0lBREMsSUFBQSxhQUFJLEVBQUMsYUFBYSxDQUFDO0lBQ0QsV0FBQSxJQUFBLGFBQUksR0FBRSxDQUFBOzs7O3dEQW1CeEI7QUExQlEscUJBQXFCO0lBRGpDLElBQUEsbUJBQVUsRUFBQyxLQUFLLENBQUM7R0FDTCxxQkFBcUIsQ0EyQmpDO0FBM0JZLHNEQUFxQiJ9