"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginService = void 0;
const common_1 = require("@nestjs/common");
const ManagerInfo_mysql_dao_1 = require("../../../../../../common/dao/mysql/ManagerInfo.mysql.dao");
const SystemRole_mysql_dao_1 = require("../../../../../../common/dao/mysql/SystemRole.mysql.dao");
const PlayerAgent_mysql_dao_1 = require("../../../../../../common/dao/mysql/PlayerAgent.mysql.dao");
const ManagerInfo_redis_dao_1 = require("../../../../../../common/dao/redis/ManagerInfo.redis.dao");
const pinus_logger_1 = require("pinus-logger");
const PlatformNameAgentList_redis_dao_1 = require("../../../../../../common/dao/redis/PlatformNameAgentList.redis.dao");
const GameRecord_mysql_dao_1 = require("../../../../../../common/dao/mysql/GameRecord.mysql.dao");
const moment = require("moment");
const SystemConfig_manager_1 = require("../../../../../../common/dao/daoManager/SystemConfig.manager");
const utils_1 = require("../../../../../../utils");
const ManagerLogs_mysql_dao_1 = require("../../../../../../common/dao/mysql/ManagerLogs.mysql.dao");
const AuthCode_redis_dao_1 = require("../../../../../../common/dao/redis/AuthCode.redis.dao");
const agent_name = require('../../../../../../../config/data/agent_name.json');
const payUtil_1 = require("../../../../../../utils/payUtil");
const TokenService = require("../../../../../../services/hall/tokenService");
const ManagerErrorLogger = (0, pinus_logger_1.getLogger)('http', __filename);
let LoginService = class LoginService {
    async managerCreate(userName, passWord, agent, ip, role, rootAgent, managerRole, manager, managerIp) {
        try {
            if (!userName || !passWord) {
                return Promise.reject('请输入账号和密码');
            }
            userName = userName.replace(/\s/g, '');
            if (userName && userName.length < 6) {
                return Promise.reject('用户名请大于6位');
            }
            let manager_role_ = await SystemRole_mysql_dao_1.default.findOne({ role: managerRole });
            let role_ = await SystemRole_mysql_dao_1.default.findOne({ role: role });
            if (!role_ || !manager_role_) {
                return { code: 500, msg: "创建失败" };
            }
            if (manager_role_.roleLevel > role_.roleLevel) {
                return { code: 500, msg: "创建失败" };
            }
            const managerUser = await ManagerInfo_mysql_dao_1.default.findOne({ userName });
            if (managerUser) {
                return Promise.reject('该用户名存在');
            }
            let platformUid = null;
            if (agent) {
                const playerAgent = await PlayerAgent_mysql_dao_1.default.findOne({ platformName: agent });
                if (!playerAgent) {
                    return Promise.reject('绑定的该平台信息不存在，请重新输入');
                }
                platformUid = playerAgent.uid;
            }
            passWord = (0, utils_1.signature)(passWord, false, false);
            const info = {
                userName: userName,
                passWord: passWord,
                agent: agent ? agent : null,
                platformUid: platformUid ? platformUid : null,
                rootAgent: agent,
                parentAgent: agent,
                role: role,
                ip: ip,
            };
            await ManagerInfo_mysql_dao_1.default.insertOne(info);
            let logsData = {
                mangerUserName: manager,
                requestIp: managerIp,
                requestName: "创建管理后台的账号",
                requestBody: JSON.stringify({ userName, passWord: null, ip, }),
            };
            ManagerLogs_mysql_dao_1.default.insertOne(logsData);
            return { code: 200, msg: "创建成功" };
        }
        catch (error) {
            ManagerErrorLogger.error(`创建管理后台的账号 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }
    async platformCreateMangerUser(managerAgent, userName, passWord, agent, ip, role, manager, managerIp) {
        try {
            if (!userName || !passWord) {
                return Promise.reject('请输入账号和密码');
            }
            userName = userName.replace(/\s/g, '');
            if (userName && userName.length < 6) {
                return Promise.reject('用户名请大于6位');
            }
            const user = await ManagerInfo_mysql_dao_1.default.findOne({ userName: userName });
            if (user) {
                return Promise.reject('该用户名存在');
            }
            if (!role) {
                return Promise.reject('角色不存在');
            }
            const roleType = await SystemRole_mysql_dao_1.default.findOne({ role: role });
            if (roleType && roleType.roleName !== '代理') {
                return Promise.reject('角色不存在');
            }
            let platformUid = null;
            if (agent) {
                if (managerAgent == "459pt") {
                    agent = this.getOldAgentForChangeName(agent);
                }
                const playerAgent = await PlayerAgent_mysql_dao_1.default.findOne({ platformName: agent });
                if (!playerAgent) {
                    return Promise.reject('绑定的该代理信息不存在，请重新输入');
                }
                platformUid = playerAgent.uid;
            }
            const managerUser = await ManagerInfo_mysql_dao_1.default.findOne({ userName: manager });
            if (!managerUser) {
                return Promise.reject('登陆账号信息不存在，请重新登陆');
            }
            passWord = (0, utils_1.signature)(passWord, false, false);
            const info = {
                userName: userName,
                passWord: passWord,
                agent: agent ? agent : null,
                rootAgent: managerUser.rootAgent,
                platformUid: platformUid ? platformUid : null,
                parentAgent: managerUser.agent,
                role: role,
                ip: ip,
            };
            await ManagerInfo_mysql_dao_1.default.insertOne(info);
            let logsData = {
                mangerUserName: manager,
                requestIp: managerIp,
                requestName: "平台账号给分代创建账号",
                requestBody: JSON.stringify({ userName, passWord: null, ip, }),
            };
            ManagerLogs_mysql_dao_1.default.insertOne(logsData);
            return { code: 200, msg: "平台账号给分代创建账号成功" };
        }
        catch (error) {
            ManagerErrorLogger.error(`平台账号给分代创建账号 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }
    async managerLogin(userName, passWord, ip) {
        try {
            ManagerErrorLogger.warn(`后台账号登录 :userName: ${userName}  ,ip : ${ip} `);
            const loginUser = await ManagerInfo_mysql_dao_1.default.findOne({ userName });
            if (!loginUser) {
                return { code: 500, info: '账号不存在' };
            }
            passWord = (0, utils_1.signature)(passWord, false, false);
            if (loginUser.passWord != passWord) {
                return { code: 500, info: '密码错误' };
            }
            let list = loginUser.ip;
            if (list.length == 0) {
                return { code: 500, info: '账号ip不存在' };
            }
            const roleItem = await SystemRole_mysql_dao_1.default.findOne({ role: loginUser.role });
            if (!roleItem) {
                return { code: 500, info: '密码错误' };
            }
            let logsData = {
                mangerUserName: loginUser.userName,
                requestIp: ip,
                requestName: "后台账号登陆",
                requestBody: null,
            };
            ManagerLogs_mysql_dao_1.default.insertOne(logsData);
            const sign = TokenService.create(userName);
            ManagerErrorLogger.warn(`后台账号登录userName : ${userName} , token :${sign} , ip : ${ip}`);
            let info = {
                token: sign,
                agent: loginUser.agent ? loginUser.agent : null,
                userName: loginUser.userName,
                platformUid: loginUser.platformUid,
                rootAgent: loginUser.rootAgent,
                role: loginUser.role,
                ip: ip,
            };
            if (loginUser.token) {
                await ManagerInfo_redis_dao_1.default.deleteOne(loginUser.token);
            }
            await ManagerInfo_redis_dao_1.default.insertOne(sign, info);
            await ManagerInfo_mysql_dao_1.default.updateOne({ userName: loginUser.userName }, { token: sign });
            let role = loginUser.role;
            return {
                code: 200, msg: "登陆成功",
                role: role,
                userName: loginUser.userName,
                jwt: sign
            };
        }
        catch (error) {
            ManagerErrorLogger.error(`账号登录:${error.stack || error}`);
            return { code: 500, error: '登陆失败' };
        }
    }
    async changePassWord(manager, userName, passWord, agent, ip, role, loginIp, managerRole, managerIp) {
        try {
            const loginUser = await ManagerInfo_mysql_dao_1.default.findOne({ userName });
            if (!loginUser) {
                return { code: 500, info: '账号不存在' };
            }
            let info = {};
            if (ip) {
                info['ip'] = ip;
            }
            if (passWord) {
                passWord = (0, utils_1.signature)(passWord, false, false);
                info["passWord"] = passWord;
            }
            let manager_role_ = await SystemRole_mysql_dao_1.default.findOne({ role: managerRole });
            let role_ = await SystemRole_mysql_dao_1.default.findOne({ role: loginUser.role });
            if (!role_ || !manager_role_) {
                return { code: 500, msg: "修改失败" };
            }
            if (manager != "xiaolaobaoban") {
                if (manager_role_.roleLevel >= role_.roleLevel) {
                    return { code: 500, msg: "修改失败" };
                }
            }
            await ManagerInfo_mysql_dao_1.default.updateOne({ userName }, info);
            ManagerErrorLogger.warn(`后台修改账号IP,manager : ${manager},userName : ${userName} , loginIp : ${loginIp}`);
            let logsData = {
                mangerUserName: manager,
                requestIp: managerIp,
                requestName: "主后台修改账号",
                requestBody: JSON.stringify({ userName, passWord: null, ip }),
            };
            ManagerLogs_mysql_dao_1.default.insertOne(logsData);
            return { code: 200, msg: "修改成功", managerId: loginUser.managerId };
        }
        catch (error) {
            ManagerErrorLogger.error(`修改账号 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }
    async platformChangePassWord(manager, userName, passWord, agent, ip, role, loginIp, managerRole, managerIp) {
        try {
            const loginUser = await ManagerInfo_mysql_dao_1.default.findOne({ userName });
            if (!loginUser) {
                return { code: 500, info: '账号不存在' };
            }
            let info = {};
            if (ip) {
                info['ip'] = ip;
            }
            let manager_role_ = await SystemRole_mysql_dao_1.default.findOne({ role: managerRole });
            let role_ = await SystemRole_mysql_dao_1.default.findOne({ role: loginUser.role });
            if (!role_ || !manager_role_) {
                return { code: 500, msg: "修改失败" };
            }
            if (manager_role_.roleLevel > role_.roleLevel) {
                return { code: 500, msg: "修改失败" };
            }
            await ManagerInfo_mysql_dao_1.default.updateOne({ userName }, info);
            ManagerErrorLogger.warn(`平台账号后台修改分代账号IP,manager : ${manager},userName : ${userName} , loginIp ${loginIp}`);
            let logsData = {
                mangerUserName: manager,
                requestIp: managerIp,
                requestName: "平台账号给分代修改分代账号",
                requestBody: JSON.stringify({ userName, passWord: null, ip }),
            };
            ManagerLogs_mysql_dao_1.default.insertOne(logsData);
            return { code: 200, msg: "修改成功", managerId: loginUser.managerId };
        }
        catch (error) {
            ManagerErrorLogger.error(`修改账号 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }
    async getAllManagerUser(page, pageSize) {
        try {
            const { list, count } = await ManagerInfo_mysql_dao_1.default.findListToLimitNoTime(page, pageSize);
            const result = await SystemRole_mysql_dao_1.default.findList({});
            const resultList = list.map((info) => {
                let roleName = null;
                const role = result.find(x => x.role == info.role);
                if (role) {
                    roleName = role.roleName;
                }
                delete info.passWord;
                delete info.token;
                return Object.assign({ roleName: roleName }, info);
            });
            return { code: 200, msg: "获取成功", list: resultList, count };
        }
        catch (error) {
            ManagerErrorLogger.error(`获取成功 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }
    async getOneManagerUser(userName) {
        try {
            const { list, count } = await ManagerInfo_mysql_dao_1.default.findForWhere(userName);
            const result = await SystemRole_mysql_dao_1.default.findList({});
            const resultList = list.map((info) => {
                let roleName = null;
                const role = result.find(x => x.role == info.role);
                if (role) {
                    roleName = role.roleName;
                }
                delete info.passWord;
                delete info.token;
                return Object.assign({ roleName: roleName }, info);
            });
            return { code: 200, msg: "获取成功", list: resultList, count };
        }
        catch (error) {
            ManagerErrorLogger.error(`获取成功 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }
    async getPlatformManagerUser(page, pageSize, userName) {
        try {
            const user = await ManagerInfo_mysql_dao_1.default.findOne({ userName });
            if (!user) {
                return { code: 500, msg: "该账号信息不存在" };
            }
            let list = [];
            let count = 0;
            if (user.agent == user.rootAgent) {
                let agent = user.agent;
                const result = await ManagerInfo_mysql_dao_1.default.findListForPlatform(page, pageSize, agent);
                list = result.list;
                count = list.length;
            }
            const result = await SystemRole_mysql_dao_1.default.findList({});
            const resultList = list.map((info) => {
                let roleName = null;
                const role = result.find(x => x.role == info.role);
                info.agent = this.agentForChangeName(info.agent);
                if (role) {
                    roleName = role.roleName;
                }
                delete info.passWord;
                delete info.token;
                return Object.assign({ roleName: roleName }, info);
            });
            return { code: 200, msg: "获取成功", list: resultList, count };
        }
        catch (error) {
            ManagerErrorLogger.error(`修改账号 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }
    async deleteUserName(id, manager, managerRole) {
        try {
            const user = await ManagerInfo_mysql_dao_1.default.findOne({ id });
            if (!user) {
                return { code: 500, msg: "该账号信息不存在" };
            }
            let manager_role_ = await SystemRole_mysql_dao_1.default.findOne({ role: managerRole });
            let role_ = await SystemRole_mysql_dao_1.default.findOne({ role: user.role });
            if (!role_ || !manager_role_) {
                return { code: 500, msg: "删除失败" };
            }
            if (manager != "xiaolaobaoban") {
                if (manager_role_.roleLevel >= role_.roleLevel) {
                    return { code: 500, msg: "删除失败" };
                }
            }
            await ManagerInfo_mysql_dao_1.default.delete({ id });
            let token = user.token;
            if (token) {
                await ManagerInfo_redis_dao_1.default.deleteOne(token);
            }
            return { code: 200, msg: "删除成功" };
        }
        catch (error) {
            ManagerErrorLogger.error(`删除账号 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }
    async updateManagerSelfUser(userName, passWord, oldPassWord, ip) {
        try {
            ManagerErrorLogger.warn(`自己给自己修改密码:userName: ${userName}  ,ip : ${ip} `);
            passWord = (0, utils_1.signature)(passWord, false, false);
            oldPassWord = (0, utils_1.signature)(oldPassWord, false, false);
            if (passWord == oldPassWord) {
                return { code: 500, msg: "旧密码和新密码不能一致" };
            }
            const user = await ManagerInfo_mysql_dao_1.default.findOne({ userName });
            if (!user) {
                return { code: 500, msg: "账号信息不存在" };
            }
            let list = user.ip;
            if (list.length == 0) {
                return { code: 500, info: '账号ip不存在' };
            }
            if (!list.includes(ip)) {
                return { code: 500, info: '修改错误' };
            }
            if (user.passWord && user.passWord !== oldPassWord) {
                return { code: 500, msg: "旧密码和原始密码不匹配" };
            }
            await ManagerInfo_mysql_dao_1.default.updateOne({ userName }, { passWord });
            let logsData = {
                mangerUserName: userName,
                requestIp: ip,
                requestName: "自己给自己修改密码",
                requestBody: JSON.stringify({ userName, passWord: null, oldPassWord: null, ip }),
            };
            ManagerLogs_mysql_dao_1.default.insertOne(logsData);
            return { code: 200, msg: "修改成功" };
        }
        catch (error) {
            ManagerErrorLogger.error(`修改成功 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }
    async sendMessage(userName, ip) {
        try {
            ManagerErrorLogger.warn(`发送验证码:userName: ${userName}  ,ip : ${ip} `);
            const user = await ManagerInfo_mysql_dao_1.default.findOne({ userName });
            if (!user) {
                return { code: 500, error: "账号信息不存在" };
            }
            const autchRecord = await AuthCode_redis_dao_1.default.findOne({ phone: userName });
            if (autchRecord) {
                return { code: 500, error: "该账号验证码已存在,请稍后获取" };
            }
            const auth_code = Math.random().toString().substr(2, 6);
            const paramsAppend = new URLSearchParams();
            paramsAppend.append('mobile', "9218423512");
            paramsAppend.append('templateId', "16369");
            paramsAppend.append('paramType', "json");
            paramsAppend.append('internationalCode', "63");
            paramsAppend.append('params', JSON.stringify({ code: auth_code, time: moment().format("YYYYMMDDHHmmss") }));
            let params = {};
            params.mobile = "9662974727";
            params.templateId = "16369";
            params.params = JSON.stringify({ code: auth_code, time: moment().format("YYYYMMDDHHmmss") });
            params.paramType = "json";
            params.internationalCode = "63";
            let { code } = await (0, payUtil_1.authCodeHttpRequestForYiDun)(params, paramsAppend);
            if (code == 200) {
                await AuthCode_redis_dao_1.default.insertOne({ auth_code: auth_code, createTime: new Date(), phone: userName });
                return { code: 200 };
            }
            else {
                return { code: 500 };
            }
        }
        catch (error) {
            ManagerErrorLogger.error(`发送验证码 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }
    async checkAuthCode(userName, auth_code, ip) {
        try {
            ManagerErrorLogger.warn(`短信验证 :userName: ${userName}  ,ip : ${ip} `);
            const loginUser = await ManagerInfo_mysql_dao_1.default.findOne({ userName });
            if (!loginUser) {
                return { code: 500, error: '账号不存在' };
            }
            const autchRecord = await AuthCode_redis_dao_1.default.findOne({ phone: userName });
            if (!autchRecord) {
                return { code: 500, error: "验证码已过期" };
            }
            if (autchRecord.phone !== userName) {
                return { code: 500, error: "验证码不正确" };
            }
            if (autchRecord.auth_code != auth_code) {
                return { code: 500, error: "验证码不正确" };
            }
            await AuthCode_redis_dao_1.default.delete({ phone: userName });
            const sign = TokenService.create(userName);
            ManagerErrorLogger.warn(`后台账号短信验证登录成功userName : ${userName} , token :${sign}, ip : ${ip}`);
            let info = {
                token: sign,
                agent: loginUser.agent ? loginUser.agent : null,
                userName: loginUser.userName,
                platformUid: loginUser.platformUid,
                rootAgent: loginUser.rootAgent,
                role: loginUser.role,
                ip: ip,
            };
            if (loginUser.token) {
                await ManagerInfo_redis_dao_1.default.deleteOne(loginUser.token);
            }
            await ManagerInfo_redis_dao_1.default.insertOne(sign, info);
            await ManagerInfo_mysql_dao_1.default.updateOne({ userName: loginUser.userName }, { token: sign });
            let role = loginUser.role;
            let logsData = {
                mangerUserName: loginUser.userName,
                requestIp: ip,
                requestName: "短信验证",
                requestBody: null,
            };
            ManagerLogs_mysql_dao_1.default.insertOne(logsData);
            return {
                code: 200, msg: "验证成功",
                role: role,
                userName: loginUser.userName,
                jwt: sign
            };
        }
        catch (error) {
            ManagerErrorLogger.error(`账号登录:${error.stack || error}`);
            return { code: 500, error: '登陆失败' };
        }
    }
    async getThirdGameResultById(gameOrder, createTimeDate, groupRemark) {
        try {
            let platformTableName = await PlatformNameAgentList_redis_dao_1.default.findPlatformUidForAgent({ agent: groupRemark });
            let createTimeTable = moment(createTimeDate).format("YYYYMM");
            let table = `Sp_GameRecord_${createTimeTable}`;
            if (platformTableName) {
                table = `Sp_GameRecord_${platformTableName}_${createTimeTable}`;
            }
            let endTime = moment(createTimeDate).add(10, 'm').format("YYYY-MM-DD HH:mm:ss");
            let startTime = moment(createTimeDate).subtract(1, 'm').format("YYYY-MM-DD HH:mm:ss");
            const record = await GameRecord_mysql_dao_1.default.findForGameOrder(table, gameOrder, startTime, endTime);
            if (record) {
                let result = [];
                result.push(JSON.parse(record.result));
                return {
                    result: result,
                    id: record.id,
                    nid: record.nid,
                    gameName: record.gameName,
                    createTime: record.createTimeDate,
                    uid: record.uid,
                    status: record.status
                };
            }
            else {
                return null;
            }
        }
        catch (error) {
            ManagerErrorLogger.error(`根据前端获取的订单号和代理好来查询玩家的详情 :${error.stack || error}`);
            return Promise.reject(error);
        }
    }
    async getCustomerUrl() {
        try {
            const systemConfig = await SystemConfig_manager_1.default.findOne({});
            if (systemConfig && systemConfig.customer) {
                return systemConfig.customer;
            }
            else {
                return null;
            }
        }
        catch (error) {
            ManagerErrorLogger.error(`根据前端获取的订单号和代理好来查询玩家的详情 :${error.stack || error}`);
            return Promise.reject(error);
        }
    }
    agentForChangeName(agent) {
        const agentName = agent_name.find(x => x.old == agent);
        if (agentName) {
            return agentName.new;
        }
        else {
            return agent;
        }
    }
    getOldAgentForChangeName(agent) {
        const agentName = agent_name.find(x => x.new == agent);
        if (agentName) {
            return agentName.old;
        }
        else {
            return agent;
        }
    }
};
LoginService = __decorate([
    (0, common_1.Injectable)()
], LoginService);
exports.LoginService = LoginService;
function updateLoginSession(session, role) {
    session.account = role;
    session.lastLoginTime = Date.now();
    let updateTime = 24 * 60 * 60 * 1000;
    if (!updateTime) {
        ManagerErrorLogger.error(`updateLoginSession login  time can not get updateTime `);
        return;
    }
    session.cookie.expires = new Date(Date.now() + updateTime);
    session.cookie.maxAge = updateTime;
    session.cookie.sid = session.id;
    session.touch();
}
function raw(args) {
    let keys = Object.keys(args).sort();
    let newArgs = {};
    for (let key of keys) {
        newArgs[key] = args[key];
    }
    let string = '';
    for (let k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dtc0FwaS9saWIvbW9kdWxlcy9tYW5hZ2VyQmFja2VuZEFwaS9sb2dpbi9sb2dpbi5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLDJDQUE0QztBQUM1QyxvR0FBMkY7QUFDM0Ysa0dBQXlGO0FBQ3pGLG9HQUEyRjtBQUMzRixvR0FBMkY7QUFDM0YsK0NBQXlDO0FBRXpDLHdIQUErRztBQUMvRyxrR0FBeUY7QUFDekYsaUNBQWlDO0FBQ2pDLHVHQUErRjtBQUMvRixtREFBa0Q7QUFDbEQsb0dBQTJGO0FBQzNGLDhGQUFzRjtBQUN0RixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsa0RBQWtELENBQUMsQ0FBQztBQUMvRSw2REFBOEU7QUFDOUUsNkVBQThFO0FBQzlFLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSx3QkFBUyxFQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztBQUl6RCxJQUFhLFlBQVksR0FBekIsTUFBYSxZQUFZO0lBTXJCLEtBQUssQ0FBQyxhQUFhLENBQUMsUUFBZ0IsRUFBRSxRQUFnQixFQUFFLEtBQWEsRUFBRSxFQUFZLEVBQUUsSUFBWSxFQUFFLFNBQWtCLEVBQUUsV0FBb0IsRUFBRyxPQUFnQixFQUFHLFNBQWtCO1FBQy9LLElBQUk7WUFDQSxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUN4QixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDckM7WUFFRCxRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUMsRUFBRSxDQUFDLENBQUM7WUFFdEMsSUFBRyxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ2hDLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxV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