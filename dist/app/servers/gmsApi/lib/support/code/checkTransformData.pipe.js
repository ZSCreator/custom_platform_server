"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckTransformDataPipe = void 0;
const common_1 = require("@nestjs/common");
const Utils = require("../../../../../utils");
const crypto = require("crypto");
const ManagerInfo_redis_dao_1 = require("../../../../../common/dao/redis/ManagerInfo.redis.dao");
const SystemRole_mysql_dao_1 = require("../../../../../common/dao/mysql/SystemRole.mysql.dao");
const managerRoute_1 = require("../../const/managerRoute");
const ManagerLogs_mysql_dao_1 = require("../../../../../common/dao/mysql/ManagerLogs.mysql.dao");
const pinus_logger_1 = require("pinus-logger");
const crypto_1 = require("crypto");
const ManagerErrorLogger = (0, pinus_logger_1.getLogger)('http', __filename);
const AES_conf = {
    key: "f028f684404417b4",
    iv: 'ABCDEFH123456789',
};
const MD5Key = "HSYL";
let CheckTransformDataPipe = class CheckTransformDataPipe {
    async transform(data, metadata) {
        if (metadata.type === "query") {
            return data;
        }
        let { timestamp, param, key, userName, ip, token, path } = data;
        if (path != "/game/gameRecordFileExprotData") {
            if (!key) {
                throw new common_1.BadRequestException(JSON.stringify({ constraints: { isPositive: "验证错误" } }));
            }
            if (!userName) {
                throw new common_1.BadRequestException(JSON.stringify({ constraints: { isPositive: "缺少验证参数" } }));
            }
            if (typeof timestamp !== "number" || timestamp <= 0) {
                throw new common_1.BadRequestException(JSON.stringify({ constraints: { isPositive: "时间戳必须为正整数" } }));
            }
            const md5key = MD5KEY(userName, timestamp);
            if (md5key != key) {
                throw new common_1.BadRequestException(JSON.stringify({ constraints: { isPositive: "验证错误" } }));
            }
            param = JSON.parse(decryption(param, AES_conf.key, AES_conf.iv));
        }
        if (token) {
            const result = await ManagerInfo_redis_dao_1.default.findOne(token);
            if (!result) {
                throw new common_1.HttpException('token过期', 501);
            }
            else {
                if (result.ip !== ip) {
                    throw new common_1.HttpException('token过期', 501);
                }
            }
            const roleItem = await SystemRole_mysql_dao_1.default.findOne({ role: result.role });
            if (!roleItem) {
                throw new common_1.HttpException('权限不足', 502);
            }
            if (result.userName != "xiaolaobaoban") {
                if (!roleItem.roleRoute.includes(path)) {
                    throw new common_1.HttpException('权限不足', 502);
                }
            }
            let route = managerRoute_1.managerRoute.find(x => x.route == path);
            if (route) {
                if (route.isRecord) {
                    let requestName = route ? route.name : path;
                    let requestBody = JSON.stringify(param).substring(0, 245);
                    let logsData = {
                        mangerUserName: result.userName,
                        requestIp: ip,
                        requestName: requestName,
                        requestBody: requestBody,
                    };
                    ManagerLogs_mysql_dao_1.default.insertOne(logsData);
                }
            }
            else {
                let requestName = route ? route.name : path;
                let requestBody = JSON.stringify(param).substring(0, 245);
                let logsData = {
                    mangerUserName: result.userName,
                    requestIp: ip,
                    requestName: requestName,
                    requestBody: requestBody,
                };
                ManagerLogs_mysql_dao_1.default.insertOne(logsData);
            }
            if (result) {
                param.managerAgent = result.agent ? result.agent : null;
                param.manager = result.userName;
                param.managerUid = result.platformUid;
                param.rootAgent = result.rootAgent;
                param.managerRole = result.role;
                param.managerIp = result.ip;
            }
        }
        return param;
    }
};
CheckTransformDataPipe = __decorate([
    (0, common_1.Injectable)()
], CheckTransformDataPipe);
exports.CheckTransformDataPipe = CheckTransformDataPipe;
function MD5KEY(userName, timestamp) {
    const data = { userName, timestamp, MD5Key: MD5Key };
    return Utils.signature(data, false, true);
}
function decryption(data, key, iv) {
    let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
function encryption(data, key, iv) {
    const cipher = (0, crypto_1.createCipheriv)('aes-128-cbc', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return (encrypted);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tUcmFuc2Zvcm1EYXRhLnBpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL3N1cHBvcnQvY29kZS9jaGVja1RyYW5zZm9ybURhdGEucGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSwyQ0FBdUg7QUFDdkgsOENBQThDO0FBQzlDLGlDQUFpQztBQUNqQyxpR0FBd0Y7QUFDeEYsK0ZBQXNGO0FBQ3RGLDJEQUFzRDtBQUN0RCxpR0FBd0Y7QUFDeEYsK0NBQXlDO0FBQ3pDLG1DQUFzQztBQUN0QyxNQUFNLGtCQUFrQixHQUFHLElBQUEsd0JBQVMsRUFBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFekQsTUFBTSxRQUFRLEdBQUc7SUFDYixHQUFHLEVBQUcsa0JBQWtCO0lBQ3hCLEVBQUUsRUFBRSxrQkFBa0I7Q0FDekIsQ0FBQztBQUNGLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUl0QixJQUFhLHNCQUFzQixHQUFuQyxNQUFhLHNCQUFzQjtJQUNoQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQVMsRUFBRSxRQUEwQjtRQUVoRCxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFO1lBQzNCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRyxHQUFHLEVBQUcsUUFBUSxFQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBS25FLElBQUcsSUFBSSxJQUFJLGdDQUFnQyxFQUFDO1lBRXhDLElBQUcsQ0FBQyxHQUFHLEVBQUM7Z0JBQ0osTUFBTSxJQUFJLDRCQUFtQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxXQUFXLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDMUY7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