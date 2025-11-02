import {PipeTransform, Injectable, ArgumentMetadata, BadRequestException, Logger, HttpException} from '@nestjs/common';
import * as Utils from "../../../../../utils";
import crypto = require('crypto')
import ManagerInfoRedisDao from "../../../../../common/dao/redis/ManagerInfo.redis.dao";
import SystemRoleMysqlDao from "../../../../../common/dao/mysql/SystemRole.mysql.dao";
import {managerRoute} from "../../const/managerRoute";
import ManagerLogsMysqlDao from "../../../../../common/dao/mysql/ManagerLogs.mysql.dao"; // 引用AES源码js
import { getLogger } from "pinus-logger";
import {createCipheriv} from "crypto";
const ManagerErrorLogger = getLogger('http', __filename);

const AES_conf = {
    key:  "f028f684404417b4", //密钥
    iv: 'ABCDEFH123456789', //偏移向量
};
const MD5Key = "HSYL";


@Injectable()
export class CheckTransformDataPipe implements PipeTransform<any> {
   async transform(data: any, metadata: ArgumentMetadata): Promise<any> {

        if (metadata.type === "query") {
            return data;
        }

        let { timestamp, param , key , userName , ip ,token ,path } = data;


        // console.warn(`token:${token}, ip : ${ip}, path :${path}, userName : ${userName}, param : ${JSON.stringify(param)} , key : ${key} `);
        
        if(path != "/game/gameRecordFileExprotData"){

            if(!key){
                throw new BadRequestException(JSON.stringify({ constraints: { isPositive: "验证错误" } }));
            }

            if(!userName){
                throw new BadRequestException(JSON.stringify({ constraints: { isPositive: "缺少验证参数" } }));
            }

            if (typeof timestamp !== "number" || timestamp <= 0) {
                throw new BadRequestException(JSON.stringify({ constraints: { isPositive: "时间戳必须为正整数" } }));
            }


            const md5key = MD5KEY(userName , timestamp);
            // console.warn(`MD5:${md5key}, KYE : ${key}`);
            if(md5key != key){
                throw new BadRequestException(JSON.stringify({ constraints: { isPositive: "验证错误" } }));
            }

            //解密
            param =  JSON.parse(decryption(param ,AES_conf.key , AES_conf.iv)) ;
        }




       // console.warn(`解密出来得:${JSON.stringify(param)}`);

        if(token){
            const result = await ManagerInfoRedisDao.findOne(token);

            if (!result) {
                throw new HttpException('token过期', 501);
            } else {

                if (result.ip !== ip) {
                    throw new HttpException('token过期', 501);
                }
            }

            //请求路由鉴权
            const roleItem = await SystemRoleMysqlDao.findOne({role : result.role});

            if(!roleItem){
                throw new HttpException('权限不足', 502);
            }


            if(result.userName != "xiaolaobaoban"){
                // if(roleItem.roleName != "超级管理员" || roleItem.roleLevel !== 1){

                if(!roleItem.roleRoute.includes(path)){
                    throw new HttpException('权限不足', 502);
                }
                // }
            }

            //记录操作日志
            let route = managerRoute.find(x=>x.route == path );


            if(route){

                if(route.isRecord ){

                    let requestName = route ? route.name : path;


                    let requestBody = JSON.stringify(param).substring(0, 245);

                    let logsData = {
                        mangerUserName: result.userName,
                        requestIp: ip,
                        requestName: requestName,
                        requestBody : requestBody,
                    };
                    ManagerLogsMysqlDao.insertOne(logsData);
                }

            }else {
                let requestName = route ? route.name : path;

                let requestBody = JSON.stringify(param).substring(0, 245);

                let logsData = {
                    mangerUserName: result.userName,
                    requestIp: ip,
                    requestName: requestName,
                    requestBody : requestBody,
                };
                ManagerLogsMysqlDao.insertOne(logsData);
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



}


function MD5KEY( userName :string , timestamp : number) {
    const data =  { userName , timestamp , MD5Key :  MD5Key };
    return Utils.signature(data,false,true)
}


function decryption(data ,key, iv){

    let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    let decrypted = decipher.update(data, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted;


}

function encryption(data , key , iv) {


    const cipher = createCipheriv( 'aes-128-cbc', key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');

    encrypted += cipher.final('hex');

    return (encrypted);



}

// console.warn("param")
//
// let data = { page : 1 , loginHall : true};
//
// console.warn("JSON.stringify(data)",JSON.stringify(data))
// const param = encryption(JSON.stringify(data) , AES_conf.key , AES_conf.iv);
// console.warn("param",param);
//
//
// //解密
// let data1 = JSON.parse(decryption(param ,AES_conf.key , AES_conf.iv));
//
//
// console.warn("解密param",data1)
//
//
// const md5key = MD5KEY("peter" , 1679901584215);;
// console.warn("MD5+16进制",md5key)