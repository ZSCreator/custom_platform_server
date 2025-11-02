import { Injectable } from '@nestjs/common';
import ManagerInfoMysqlDao from "../../../../../../common/dao/mysql/ManagerInfo.mysql.dao";
import SystemRoleMysqlDao from "../../../../../../common/dao/mysql/SystemRole.mysql.dao";
import PlayerAgentMysqlDao from "../../../../../../common/dao/mysql/PlayerAgent.mysql.dao";
import ManagerInfoRedisDao from "../../../../../../common/dao/redis/ManagerInfo.redis.dao";
import { getLogger } from "pinus-logger";
import { createHash } from 'crypto';
import PlatformNameAgentListRedisDao from "../../../../../../common/dao/redis/PlatformNameAgentList.redis.dao";
import GameRecordMysqlDao from "../../../../../../common/dao/mysql/GameRecord.mysql.dao";
import * as moment from "moment";
import SystemConfigManager from "../../../../../../common/dao/daoManager/SystemConfig.manager";
import {signature} from "../../../../../../utils";
import ManagerLogsMysqlDao from "../../../../../../common/dao/mysql/ManagerLogs.mysql.dao";
import AutchCodeRedisDao from "../../../../../../common/dao/redis/AuthCode.redis.dao";
const agent_name = require('../../../../../../../config/data/agent_name.json');
import { authCodeHttpRequestForYiDun } from '../../../../../../utils/payUtil';
import TokenService = require('../../../../../../services/hall/tokenService');
const ManagerErrorLogger = getLogger('http', __filename);


@Injectable()
export class LoginService {
    /**
     * 创建管理后台的账号
     * @param money   初始化金币
     * userName, passWord, agent, ip,  role , rootAgent
     */
    async managerCreate(userName: string, passWord: string, agent: string, ip: string[], role: string ,rootAgent : string ,managerRole : string , manager : string , managerIp : string ): Promise<any> {
        try {
            if (!userName || !passWord) {
                return Promise.reject('请输入账号和密码');
            }

            userName = userName.replace(/\s/g,'');

            if(userName && userName.length < 6 ){
                return Promise.reject('用户名请大于6位');
            }

            let manager_role_ = await SystemRoleMysqlDao.findOne({role : managerRole});

            let role_ = await SystemRoleMysqlDao.findOne({role : role});

            if(!role_ || !manager_role_){
                return { code: 500, msg: "创建失败" };
            }

            if(manager_role_.roleLevel > role_.roleLevel){
                return { code: 500, msg: "创建失败" };
            }



            const managerUser = await ManagerInfoMysqlDao.findOne({ userName });

            if (managerUser) {
                return Promise.reject('该用户名存在');
            }
            // let ipList = [];
            // ipList.push(ip);
            let platformUid = null;


            if(agent){
                const playerAgent = await PlayerAgentMysqlDao.findOne({platformName: agent});
                if(!playerAgent){
                    return Promise.reject('绑定的该平台信息不存在，请重新输入');
                }
                platformUid = playerAgent.uid;
            }

            //密码转化成密文
            passWord = signature(passWord, false, false);

            const info = {
                userName: userName,                       // 用户名
                passWord: passWord,                       // 用户名密码
                agent: agent ? agent : null,                     // 代理号
                platformUid: platformUid ? platformUid : null,   // 代理ID
                rootAgent: agent,                           // 后台备注
                parentAgent: agent,                           // 后台备注
                role: role,                             //角色
                ip: ip,                               // 白名单ip
            };
            await ManagerInfoMysqlDao.insertOne(info);

            //添加服务器日志
            let logsData = {
                mangerUserName: manager,
                requestIp: managerIp,
                requestName: "创建管理后台的账号",
                requestBody : JSON.stringify({userName ,passWord : null ,ip , }),
            };

            ManagerLogsMysqlDao.insertOne(logsData);

            return { code: 200, msg: "创建成功" };
        } catch (error) {
            ManagerErrorLogger.error(`创建管理后台的账号 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }


    /**
     * 平台账号给分代创建账号
     * @param money   初始化金币
     * userName, passWord, agent, ip,  role , rootAgent
     */
    async platformCreateMangerUser(managerAgent : string ,userName: string, passWord: string, agent: string, ip: string[], role: string ,manager :string ,managerIp : string ): Promise<any> {
        try {
            if (!userName || !passWord) {
                return Promise.reject('请输入账号和密码');
            }


            userName = userName.replace(/\s/g,'');

            if(userName && userName.length < 6 ){
                return Promise.reject('用户名请大于6位');
            }

            const user = await ManagerInfoMysqlDao.findOne({ userName : userName });
            if (user) {
                return Promise.reject('该用户名存在');
            }

            if(!role){
                return Promise.reject('角色不存在');
            }
            const roleType = await  SystemRoleMysqlDao.findOne({role : role});

            if(roleType && roleType.roleName !== '代理' ){
                return Promise.reject('角色不存在');
            }

            // let ipList = [];
            // ipList.push(ip);
            let platformUid = null;

            if(agent){
                if(managerAgent == "459pt"){
                    agent = this.getOldAgentForChangeName(agent);
                }
                const playerAgent = await PlayerAgentMysqlDao.findOne({platformName: agent});
                if(!playerAgent){
                    return Promise.reject('绑定的该代理信息不存在，请重新输入');
                }
                platformUid = playerAgent.uid;
            }
            const managerUser = await ManagerInfoMysqlDao.findOne({ userName : manager});
            if(!managerUser){
                return Promise.reject('登陆账号信息不存在，请重新登陆');
            }

            //密码转化成密文
            passWord = signature(passWord, false, false);

            const info = {
                userName: userName,                       // 用户名
                passWord: passWord,                       // 用户名密码
                agent: agent ? agent : null,                     // 后台管理人员编号
                rootAgent: managerUser.rootAgent,                           // 后台备注
                platformUid: platformUid ? platformUid : null,   // 代理ID
                parentAgent: managerUser.agent,                           // 后台备注
                role: role,                             //角色
                ip: ip,                               // 白名单ip
            };
            await ManagerInfoMysqlDao.insertOne(info);


            //添加服务器日志
            let logsData = {
                mangerUserName: manager,
                requestIp: managerIp,
                requestName: "平台账号给分代创建账号",
                requestBody : JSON.stringify({userName ,passWord : null ,ip , }),
            };

            ManagerLogsMysqlDao.insertOne(logsData);

            return { code: 200, msg: "平台账号给分代创建账号成功" };
        } catch (error) {
            ManagerErrorLogger.error(`平台账号给分代创建账号 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }

    /**
     * 账号登录
     * @param money   初始化金币
     */
    async managerLogin(userName: string,passWord :string, ip: string): Promise<any> {
        try {
            ManagerErrorLogger.warn(`后台账号登录 :userName: ${userName}  ,ip : ${ip} `);
            const loginUser = await ManagerInfoMysqlDao.findOne({ userName });
            if (!loginUser) {
                return { code: 500, info: '账号不存在' };
            }

            //密码转化成密文
            passWord = signature(passWord, false, false);

            if(loginUser.passWord != passWord){
                return { code: 500, info: '密码错误' };
            }
            let list = loginUser.ip;
            if(list.length == 0){
                return { code: 500, info: '账号ip不存在' };
            }
            //
            // if (!list.includes(ip)) {
            //     return { code: 500, info: '白名单拒绝访问' };
            // }

            //请求路由鉴权
            const roleItem = await SystemRoleMysqlDao.findOne({role : loginUser.role});

            if(!roleItem ){
                return { code: 500, info: '密码错误' };
            }

            // if(roleItem.roleName == '超级管理员' || roleItem.roleName == '运营风控管理'){
            //     //如果是风控账号或者超级管理员登陆需要进行验证码登陆
            //     let logsData = {
            //         mangerUserName:  loginUser.userName,
            //         requestIp: ip,
            //         requestName: "后台账号登陆",
            //         requestBody : null,
            //     };
            //     ManagerLogsMysqlDao.insertOne(logsData);
            //
            //     return {
            //         code: 201, msg: "登陆成功", userName:loginUser.userName,
            //     };
            // }

            let logsData = {
                mangerUserName:  loginUser.userName,
                requestIp: ip,
                requestName: "后台账号登陆",
                requestBody : null,
            };
            ManagerLogsMysqlDao.insertOne(logsData);

            // 生成token
            const sign = TokenService.create(userName);

            ManagerErrorLogger.warn(`后台账号登录userName : ${userName} , token :${sign} , ip : ${ip}`);

            // 设置新的sessionId
            let info ={
                token:sign,
                agent : loginUser.agent ? loginUser.agent : null,
                userName: loginUser.userName,
                platformUid : loginUser.platformUid,
                rootAgent : loginUser.rootAgent,
                role : loginUser.role,
                ip : ip,
            };

            if(loginUser.token){
                await ManagerInfoRedisDao.deleteOne(loginUser.token);
            }
            await ManagerInfoRedisDao.insertOne(sign,info);

            await ManagerInfoMysqlDao.updateOne({userName:loginUser.userName},{token:sign});
            let role = loginUser.role;

            return {
                code: 200, msg: "登陆成功",
                role: role,
                userName:loginUser.userName,
                jwt: sign
            };
        } catch (error) {
            ManagerErrorLogger.error(`账号登录:${error.stack || error}`);

            return { code: 500, error: '登陆失败' };
        }
    }

    /**
     * 修改账号
     * @param userName   账号
     * @param passWord   密码
     * userName, passWord , agent, ip , role
     */
    async changePassWord(manager : string , userName: string, passWord: string , agent : string ,ip :string[] , role : string , loginIp : string , managerRole : string , managerIp : string): Promise<any> {
        try {

            const loginUser = await ManagerInfoMysqlDao.findOne({ userName });
            if (!loginUser) {
                return { code: 500, info: '账号不存在' };
            }
            let info = {};
            if(ip){
                info['ip'] =  ip;
            }


            if(passWord){
                //密码转化成密文
                passWord = signature(passWord, false, false);
                info["passWord"] = passWord;
            }


            let manager_role_ = await SystemRoleMysqlDao.findOne({role : managerRole});

            let role_ = await SystemRoleMysqlDao.findOne({role : loginUser.role});

            if(!role_ || !manager_role_){
                return { code: 500, msg: "修改失败" };
            }

            if(manager != "xiaolaobaoban"){
                if(manager_role_.roleLevel >= role_.roleLevel){
                    return { code: 500, msg: "修改失败" };
                }
            }


            await ManagerInfoMysqlDao.updateOne({ userName }, info);

            ManagerErrorLogger.warn(`后台修改账号IP,manager : ${manager},userName : ${userName} , loginIp : ${loginIp}`);



            //添加服务器日志
            let logsData = {
                mangerUserName: manager,
                requestIp: managerIp,
                requestName: "主后台修改账号",
                requestBody : JSON.stringify({userName ,passWord : null ,ip }),
            };

            ManagerLogsMysqlDao.insertOne(logsData);

            return { code: 200, msg: "修改成功", managerId: loginUser.managerId };
        } catch (error) {
            ManagerErrorLogger.error(`修改账号 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }


     /**
     * 分账号修改账号
     * @param userName   账号
     * @param passWord   密码
     * userName, passWord , agent, ip , role
     */
    async platformChangePassWord(  manager: string, userName: string, passWord: string , agent : string , ip :string[] , role : string , loginIp : string , managerRole : string , managerIp : string ): Promise<any> {
        try {

            const loginUser = await ManagerInfoMysqlDao.findOne({ userName });
            if (!loginUser) {
                return { code: 500, info: '账号不存在' };
            }
            let info = { };
            if(ip){
                // let ipList = [];
                // ipList.push(ip);
                info['ip'] =  ip;
            }

            let manager_role_ = await SystemRoleMysqlDao.findOne({role : managerRole});

            let role_ = await SystemRoleMysqlDao.findOne({role : loginUser.role});

            if(!role_ || !manager_role_){
                return { code: 500, msg: "修改失败" };
            }

            if(manager_role_.roleLevel > role_.roleLevel){
                return { code: 500, msg: "修改失败" };
            }


            //密码转化成密文
            // passWord = signature(passWord, false, false);
            //
            // if(passWord){
            //     info["passWord"] = passWord;
            // }
            await ManagerInfoMysqlDao.updateOne({ userName }, info);


            ManagerErrorLogger.warn(`平台账号后台修改分代账号IP,manager : ${manager},userName : ${userName} , loginIp ${loginIp}`);



            //添加服务器日志
            let logsData = {
                mangerUserName: manager,
                requestIp: managerIp,
                requestName: "平台账号给分代修改分代账号",
                requestBody : JSON.stringify({userName ,passWord : null ,ip }),
            };

            ManagerLogsMysqlDao.insertOne(logsData);


            return { code: 200, msg: "修改成功", managerId: loginUser.managerId };
        } catch (error) {
            ManagerErrorLogger.error(`修改账号 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }

     /**
     * 主后台获取所有账号信息
     * @param userName   账号
     * @param passWord   密码
     * userName, passWord , agent, ip , role
     */
    async getAllManagerUser(page: number, pageSize : number ): Promise<any> {
        try {

            const {list ,count } = await ManagerInfoMysqlDao.findListToLimitNoTime(page ,pageSize );

            const result = await SystemRoleMysqlDao.findList({});

            const resultList = list.map((info) => {
                let roleName = null;
                const role = result.find(x=>x.role == info.role);
                if(role){
                    roleName = role.roleName;
                }

                delete info.passWord;
                delete info.token;

                return {
                    roleName: roleName, ...info
                };
            });
            return { code: 200, msg: "获取成功", list : resultList, count };
        } catch (error) {
            ManagerErrorLogger.error(`获取成功 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }

    /**
     * 主后台获取所有账号信息
     * @param userName   账号
     * @param passWord   密码
     * userName, passWord , agent, ip , role
     */
    async getOneManagerUser( userName: string ): Promise<any> {
        try {

            const {list ,count } = await ManagerInfoMysqlDao.findForWhere(userName);
            const result = await SystemRoleMysqlDao.findList({});
            const resultList = list.map((info) => {
                let roleName = null;
                const role = result.find(x=>x.role == info.role);
                if(role){
                    roleName = role.roleName
                }

                delete info.passWord;
                delete info.token;

                return {
                    roleName: roleName, ...info
                };
            });
            return { code: 200, msg: "获取成功", list : resultList, count };
        } catch (error) {
            ManagerErrorLogger.error(`获取成功 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }


    /**
     * 代理后台获取所有账号信息
     * @param userName   账号
     * @param passWord   密码
     * userName, passWord , agent, ip , role
     */
    async getPlatformManagerUser(page: number, pageSize : number , userName : string): Promise<any> {
        try {
            const user = await ManagerInfoMysqlDao.findOne({userName});
            if(!user){
                return { code: 500, msg: "该账号信息不存在" };
            }
            //判断改账号是总代账号还是分代账号
            let list = [];
            let count = 0;
            if(user.agent == user.rootAgent){
                let agent = user.agent;
                //总代账号查询下面所有账号信息
                const result = await ManagerInfoMysqlDao.findListForPlatform(page ,pageSize ,agent);
                list = result.list;
                count = list.length;
            }

            // else if(user.agent !== user.rootAgent){
            //     let agent = user.agent;
            //     //分代账号查询下面所有账号信息
            //     //因为分代账号的父级没有包含自己，所以要push在里面
            //     const result = await ManagerInfoMysqlDao.findListForAgent(page ,pageSize ,agent);
            //     list = result.list;
            //     count = result.count;
            // }

            const result = await SystemRoleMysqlDao.findList({});
            const resultList = list.map((info) => {
                let roleName = null;
                const role = result.find(x=>x.role == info.role);
                info.agent = this.agentForChangeName(info.agent);
                if(role){
                    roleName = role.roleName
                }

                delete info.passWord;
                delete info.token;

                return {
                    roleName: roleName, ...info
                };
            });
            return { code: 200, msg: "获取成功", list : resultList , count };
        } catch (error) {
            ManagerErrorLogger.error(`修改账号 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }


    /**
     * 删除账号
     * @param userName    账号
     * @param passWord    密码
     */
    async deleteUserName(id: number, manager : string , managerRole : string): Promise<any> {
        try {
            const user = await ManagerInfoMysqlDao.findOne({id});
            if(!user){
                return { code: 500, msg: "该账号信息不存在" };
            }

            let manager_role_ = await SystemRoleMysqlDao.findOne({role : managerRole});

            let role_ = await SystemRoleMysqlDao.findOne({role : user.role});

            if(!role_ || !manager_role_){
                return { code: 500, msg: "删除失败" };
            }

            if(manager != "xiaolaobaoban"){
                if(manager_role_.roleLevel >= role_.roleLevel){
                    return { code: 500, msg: "删除失败" };
                }
            }

            await ManagerInfoMysqlDao.delete({ id });
            //删除redis 中得数据
            let token = user.token;
            if(token){
                await  ManagerInfoRedisDao.deleteOne(token);
            }

            return { code: 200, msg: "删除成功" };
        } catch (error) {
            ManagerErrorLogger.error(`删除账号 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }

    /**
     * 自己给自己修改密码
     * @param userName    账号
     * @param passWord    密码
     */
    async updateManagerSelfUser(userName: string ,passWord : string , oldPassWord : string , ip : string): Promise<any> {
        try {
            ManagerErrorLogger.warn(`自己给自己修改密码:userName: ${userName}  ,ip : ${ip} `);
            //密码转化成密文
            passWord = signature(passWord, false, false);
            oldPassWord = signature(oldPassWord, false, false);

            if( passWord == oldPassWord){
                return { code: 500, msg: "旧密码和新密码不能一致" };
            }
            const user = await ManagerInfoMysqlDao.findOne({ userName });


            if(!user){
                return { code: 500, msg: "账号信息不存在" };
            }


            let list = user.ip;
            if(list.length == 0){
                return { code: 500, info: '账号ip不存在' };
            }

            if (!list.includes(ip)) {
                return { code: 500, info: '修改错误' };
            }


            if( user.passWord && user.passWord !== oldPassWord){
                return { code: 500, msg: "旧密码和原始密码不匹配" };
            }

            await ManagerInfoMysqlDao.updateOne({ userName } ,{passWord});


            //添加服务器日志
            let logsData = {
                mangerUserName: userName,
                requestIp: ip,
                requestName: "自己给自己修改密码",
                requestBody : JSON.stringify({userName ,passWord : null , oldPassWord : null ,ip }),
            };

            ManagerLogsMysqlDao.insertOne(logsData);


            return { code: 200, msg: "修改成功" };
        } catch (error) {
            ManagerErrorLogger.error(`修改成功 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }




    /**
     * 发送验证码
     * @param userName    账号
     */
    async sendMessage(userName: string , ip : string): Promise<any> {
        try {
            ManagerErrorLogger.warn(`发送验证码:userName: ${userName}  ,ip : ${ip} `);

            const user = await ManagerInfoMysqlDao.findOne({ userName });

            if(!user){
                return { code: 500, error: "账号信息不存在" };
            }

            const autchRecord = await AutchCodeRedisDao.findOne({ phone: userName });
            if (autchRecord) {
                return { code: 500, error: "该账号验证码已存在,请稍后获取" }
            }
            const auth_code = Math.random().toString().substr(2, 6);


            //调用x-www-form-urlencoded 方式请求 ==========网易易盾
            const paramsAppend = new URLSearchParams();
            paramsAppend.append('mobile', "9218423512");
            paramsAppend.append('templateId', "16369");
            paramsAppend.append('paramType',  "json");
            paramsAppend.append('internationalCode',  "63");  //印度91
            paramsAppend.append('params',  JSON.stringify({code: auth_code,time: moment().format("YYYYMMDDHHmmss")}) );
            //
            // //json 对象用于加密函数试用
            let params : any = {} ;
            params.mobile = "9662974727";
            params.templateId = "16369";
            params.params = JSON.stringify({code: auth_code ,time: moment().format("YYYYMMDDHHmmss")}) ;
            params.paramType =  "json";
            params.internationalCode =  "63";  //印度91
            // 新增需求在暂时限制ID 前缀为8且无上级邀请码的玩家注册
            let { code } = await authCodeHttpRequestForYiDun(params ,paramsAppend );

            if(code == 200){
                await AutchCodeRedisDao.insertOne({ auth_code: auth_code, createTime: new Date(), phone: userName });

                return  { code: 200  };
            }else {
                return  {code : 500 };
            }


        } catch (error) {
            ManagerErrorLogger.error(`发送验证码 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }



    /**
     *  短信验证
     *  userName
     */
    async checkAuthCode(userName: string, auth_code :string, ip: string): Promise<any> {
        try {
            ManagerErrorLogger.warn(`短信验证 :userName: ${userName}  ,ip : ${ip} `);

            const loginUser = await ManagerInfoMysqlDao.findOne({ userName });

            if (!loginUser) {
                return { code: 500, error: '账号不存在' };
            }



            const autchRecord = await AutchCodeRedisDao.findOne({ phone: userName });
            // 验证码已过期
            if (!autchRecord) {
                return { code: 500, error : "验证码已过期" }
            }

            // 获取验证码的手机号不匹配
            if (autchRecord.phone !== userName) {
                return { code: 500, error : "验证码不正确" }
            }

            // 检查验证码
            if (autchRecord.auth_code != auth_code) {
                return { code: 500, error : "验证码不正确" }
            }

            //删除使用过的验证码
            await AutchCodeRedisDao.delete({ phone: userName });
            //
            // const sign = createHash('md5')
            //     .update(raw({ userName : userName , time:Date.now() }))
            //     .digest('hex');

            // 生成token
            const sign = TokenService.create(userName);

            ManagerErrorLogger.warn(`后台账号短信验证登录成功userName : ${userName} , token :${sign}, ip : ${ip}`);

            // 设置新的sessionId
            let info ={
                token:sign,
                agent : loginUser.agent ? loginUser.agent : null,
                userName: loginUser.userName,
                platformUid : loginUser.platformUid,
                rootAgent : loginUser.rootAgent,
                role : loginUser.role,
                ip : ip,
            };

            if(loginUser.token){
                await ManagerInfoRedisDao.deleteOne(loginUser.token);
            }

            await ManagerInfoRedisDao.insertOne(sign,info);

            await ManagerInfoMysqlDao.updateOne({userName:loginUser.userName},{token:sign});
            let role = loginUser.role;

            let logsData = {
                mangerUserName:  loginUser.userName,
                requestIp: ip,
                requestName: "短信验证",
                requestBody : null,
            };
            ManagerLogsMysqlDao.insertOne(logsData);

            return {
                code: 200, msg: "验证成功",
                role: role,
                userName:loginUser.userName,
                jwt: sign
            };
        } catch (error) {
            ManagerErrorLogger.error(`账号登录:${error.stack || error}`);

            return { code: 500, error: '登陆失败' };
        }
    }

    /**
     * 根据前端获取的订单号和代理好来查询玩家的详情
     * gameOrder, createTimeDate , groupRemark
     */
    async getThirdGameResultById(gameOrder: string ,createTimeDate : number , groupRemark : string): Promise<any> {
        try {
           let platformTableName = await PlatformNameAgentListRedisDao.findPlatformUidForAgent({agent : groupRemark});
            let createTimeTable = moment(createTimeDate).format("YYYYMM");
            let table = `Sp_GameRecord_${createTimeTable}`;
            if(platformTableName){
                table = `Sp_GameRecord_${platformTableName}_${createTimeTable}`;
            }
            let endTime = moment(createTimeDate).add(10,'m').format("YYYY-MM-DD HH:mm:ss");
            let startTime = moment(createTimeDate).subtract(1,'m').format("YYYY-MM-DD HH:mm:ss");
            const record = await GameRecordMysqlDao.findForGameOrder(table ,gameOrder , startTime , endTime);
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
            } else {
                return null;
            }
        } catch (error) {
            ManagerErrorLogger.error(`根据前端获取的订单号和代理好来查询玩家的详情 :${error.stack || error}`);
            return Promise.reject(error);
        }
    }




    /**
     * 根据前端获取的订单号和代理好来查询玩家的详情
     * gameOrder, createTimeDate , groupRemark
     */
    async getCustomerUrl(): Promise<any> {
        try {
           const systemConfig = await SystemConfigManager.findOne({});
           if(systemConfig && systemConfig.customer){
               return  systemConfig.customer;
           }else {
               return  null;
           }
        } catch (error) {
            ManagerErrorLogger.error(`根据前端获取的订单号和代理好来查询玩家的详情 :${error.stack || error}`);
            return Promise.reject(error);
        }
    }


    /**
     * 平台分代的表映射
     */

    agentForChangeName(agent : string ){
        const agentName = agent_name.find(x=>x.old == agent);
        if(agentName){
            return agentName.new;
        }else{
            return agent;
        }
    }

    /**
     * 根据new的代理号获取old的代理号
     */

    getOldAgentForChangeName(agent : string ){
        const agentName = agent_name.find(x=>x.new == agent);
        if(agentName){
            return agentName.old;
        }else{
            return agent;
        }
    }


}

/**
 * 更新通过手机登录的session
 * @param session
 * @param role
 * @param platform
 */

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
    // session.save();
}

function raw(args: any) {
    let keys = Object.keys(args).sort();
    let newArgs: any = {};
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