'use strict';
import crypto = require('crypto') // 引用AES源码js
import * as Utils from "../utils/index";
import * as querystring from 'querystring';
import {createCipheriv} from "crypto";
import { getLogger } from 'pinus-logger';
const encryption_aes = require('../../config/third/encryption_aes.json');
const thirdHttpLogger =  getLogger('thirdHttp', __filename);
const httpLogger =  getLogger('http', __filename);

/**
 * AES加密的配置
 * 1.密钥
 * 2.偏移向量
 * 3.算法模式CBC
 * 4.补全值
 */
const AES_conf = {
    key:  "f028f684404417b4", //密钥
    iv: 'ABCDEFH123456789', //偏移向量
}



/**
 *  MD5 key
 */
// const MD5Key = "WCPT";


/**
 * AES_64_CBC 加密
 * 64位
 * return base64
 */
 function encryption(data , key , iv) {


    const cipher = createCipheriv( 'aes-128-cbc', key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');

    encrypted += cipher.final('hex');

    return (encrypted);



}


/**
 * 解密
 * return utf8
 */
 function decryption(data ,key, iv){

    let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    let decrypted = decipher.update(data, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted;


}

/**
 * 加密生成 param
 * @param account 会员账号
 * @param money   金币
 * @param ip
 * @param KindID   游戏ID
 * @param agent    代理编号
 */

export function httpUrlEnCryPtionForParam(param : any) {
    try {

        let key = encryption_aes.AES.key;
        let iv = encryption_aes.AES.iv;
        return encryption( querystring.stringify(param),key , iv);
    }catch (error) {
        thirdHttpLogger.warn(`third加密生成出错error:${error}`)
        return Promise.reject("third加密生成出错");
    }
}





/**
 *  解密 param
 * @param param
 */

export  function httpUrlEnCryPtionObjectParam( param ) {
    try {
        // let key = AES_conf.key;
        // let iv = AES_conf.iv;
        let key = encryption_aes.AES.key;
        let iv = encryption_aes.AES.iv;

        // [Object: null prototype] 问题
        return  JSON.parse(JSON.stringify(querystring.parse(decryption(param ,key , iv))));
    }catch (error) {
        thirdHttpLogger.warn(`third解析密钥出错error:${error}`)
        return Promise.reject("third解析密钥出错");
    }

}


/**==================================================http 管理后台的加密解密=======================================**/

/**
 * 加密生成 param
 * @param param   金币
 * @param
 */

export function httpManagerEnCryPtionForParam(param : any) {
    try {
        // let key = AES_conf.key;
        // let iv = AES_conf.iv;
        let key = encryption_aes.AES.key;
        let iv = encryption_aes.AES.iv;
        return encryption( querystring.stringify(param),key , iv);
    }catch (error) {
        httpLogger.warn(`http加密出错error:${error}`)
        return Promise.reject("http加密出错");
    }
}

// const timestamp = Date.now();
// const agent = 'tycgame';
// const key = MD5KEY(agent, timestamp);
// const param = httpManagerEnCryPtionForParam({account: 'zwang420525', timestamp});
// const result = httpUrlEnCryPtionObjectParam("a572b6cafc0d3a7b13392db8d7367cdddc688149402406e055b4f1438cd167dc0385b214e9ccd088ddcbce73126f158cac0957486289d8f9c236ec753c2ef713");
// // console.log(JSON.stringify({agent, key, param: param, timestamp}));
// console.log(result);



/**
 *  解密 param
 * @param param
 */

export  function httpManagerEnCryPtionObjectParam( param ) {
    try {
        // let key = AES_conf.key;
        // let iv = AES_conf.iv;
        let key = encryption_aes.AES.key;
        let iv = encryption_aes.AES.iv;
        return  querystring.parse (decryption(param ,key , iv));
    }catch (error) {
        httpLogger.warn(`http解析密钥出错error:${error}`)
        return Promise.reject("http解析密钥出错");
    }
}


/**
 * 获取MD5的结果
 * @param agent
 * @param timestamp
 * @constructor
 */

export  function MD5KEY(agent:string , timestamp : number) {
    const data =  { agent , timestamp , MD5Key :  encryption_aes.MD5Key.key };
    return Utils.signature(data,false,true)
}


/**
 * 获取MD5的结果
 * @param agent
 * @param timestamp
 * @constructor
 */

export  function HttpManagerMD5KEY(agent:string , timestamp : number) {
    const data =  { agent , timestamp , MD5Key :  encryption_aes.MD5Key.key };
    return Utils.signature(data,false,true)
}

//
let key_ = encryption_aes.AES.key;
let iv = encryption_aes.AES.iv;
// console.log("key11",key_);
// console.log("iv111",iv);
// const data = { s: 0 , account: "wb1021qp3A878490" , language : "chinese_zh" , KindID:1 ,loginHall:true , backHall : true };
// console.log("要加密的对象",data);
// const data1 = querystring.stringify(data);
// console.log("第一步转换成json",data1);
// const data2 = encryption(data1,key_,iv);
// console.log("第二步进行加密过后",data2);
// const data5 = decryption(data2,key_,iv);
// console.log("解密过后",data5)
//
// const data6 = querystring.parse( data5 );
// console.log("解析json", data6);
//
const test = "f4ae687814c373c80e913498c413a97cafb4315345eadde61634560d6a00870c1459c229b3cde71e933c6acd0c2972816578d6491f813b06f5030314a0593b4b";
console.log("解密参数",test)
const data8 = decryption(test,key_,iv);
console.log("解密过后",data8);

//
const data3 = {agent:'bcapis' , timestamp: "1681468754538" , MD5Key :  encryption_aes.MD5Key.key};
let sign = querystring.stringify(data3);
console.log("MD5之前的json",sign)
const data4 = Utils.signature(data3,false,true);
console.log("MD5+16进制",data4)