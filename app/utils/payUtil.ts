/**
 * Created by 14060 on 2017/12/25.
 */
'use strict';
import http = require('http');
import https = require('https');
import {createHash} from "crypto";
import urlencode = require('urlencode');
import querystring = require('querystring');
import { getLogger } from 'pinus-logger';
import axios from "axios";
const globalErrorLogger = getLogger('server_out', __filename);
// 改造
export async function httpPostSendJson ( { parameter, domainName, path, port = 80 } ):Promise<any>  {
    try {
        const { status, data } = await axios.post(`http://${domainName}/${path}`, parameter);
        if (status !== 200) return false;
        return data;
    } catch (e) {
        globalErrorLogger.error(`发起支付请求出错:${e.stack}`);
        return false;
    }
};

/**
 * 字符串转化sha1 哈希计算，16进制转化
 * @param str
 */
function stringToHex(str){
    let hash = createHash('sha1');
    hash.update(str)
    return hash.digest('hex') ;
}


/**
 * 第三方平台网易云信短信验证码
 * @param parameter
 * @param domainName
 * @param path
 * @param port
 */
export async function authCodeHttpRequest ( parameter : any ):Promise<any>  {
    try {
        let AppSecret = "225ab77828ed"; //密钥
        const headers = {
            AppKey: '32553cd8603639876e73d5e9ab051688',
            Nonce: "123456",
            CurTime: (Math.round(Date.now() / 1000)).toString()
        };
        const CheckSum = AppSecret + headers.Nonce + headers.CurTime;

        const buildCheckSum = stringToHex(CheckSum);
        headers['CheckSum'] = buildCheckSum;
        headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        const {data} = await axios.post(`https://api.netease.im/sms/sendcode.action`, parameter, {headers: headers});
        if (data.code == 200) {
            return data;
        } else {
            return false;
        }
    } catch (e) {
        globalErrorLogger.error(`第三方平台网易云信短信验证码:${e.stack}`);
        return false;
    }
};

/**
 * 产生密钥
 * @param secretKey
 * @param paramsJson
 */
function genSignature (secretKey,paramsJson){
    let sorter= function(paramsJson){
        let sortedJson={};
        let sortedKeys=Object.keys(paramsJson).sort();
        for(let i=0;i<sortedKeys.length;i++){
            sortedJson[sortedKeys[i]] = paramsJson[sortedKeys[i]]
        }
        return sortedJson;
    }
    let sortedParam = sorter(paramsJson);
    let needSignatureStr="";
    for(let key in sortedParam){
        let value=sortedParam[key];
        needSignatureStr=needSignatureStr+key+value;
    }
    needSignatureStr+=secretKey;
    let md5er = createHash('md5');//MD5加密工具
    md5er.update(needSignatureStr,"utf8");
    return md5er.digest('hex');
};




/**
 * 第三方平台网易易盾短信验证码
 * @param parameter
 * @param domainName
 * @param path
 * @param port
 */
export async function authCodeHttpRequestForYiDun ( params : any , paramsAppend : any ):Promise<any>  {
    try {
        let secretId = "827a1e6595f3f1d3f5e0fd37c1dd10b8"; //密钥
        let secretKey = "a91ff6698b647d4f252596a5e8abb18b"; //密钥
        let businessId = "3786723136084ebe838335de914b8403";
        let version = "v2";
        let timestamp = Date.now();
        let nonce = timestamp + "1234567";
        // let params = {};
        params['secretId'] = secretId;
        params['businessId'] = businessId;
        params['version'] = version;
        params['timestamp'] = timestamp;
        params['nonce'] = nonce;



        paramsAppend.append('secretId', secretId);
        paramsAppend.append('businessId', businessId);
        paramsAppend.append('version', version);
        paramsAppend.append('timestamp', timestamp);
        paramsAppend.append('nonce', nonce);


        let signature = genSignature(secretKey,params);
        paramsAppend.append('signature', signature);
        let headers = {};
        headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        const { data } = await axios.post(`https://sms.dun.163.com/v2/sendsms`, paramsAppend ,{headers: headers});
        if (data.code == 200) {
            return data;
        } else {
            return {code: 500};
        }
        // return;
    } catch (e) {
        globalErrorLogger.error(`第三方平台网易云信短信验证码:${e.stack}`);
        return false;
    }
};



/**
 * 第三方平台巴西短信验证码
 * @param parameter
 * @param domainName
 * @param path
 * @param port
 */
export async function authCodeHttpRequestForBaXi (auth_code : string , cellPhone : string):Promise<any>  {
    try {
        let accessKey = "52ce21e3a0364107abdd64df4db548fd"; //密钥
        let secretKey = "3b3883489b29460398c10ebb04d4a7ee"; //密钥
        let body = {
            accessKey,
            secretKey,
            "to": `0055${cellPhone}`,
            "message": `[VB] bem-vindos! Seu código de verificação é ${auth_code}.`,
        };


        let headers = {};
        headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        const result = await axios.post(`http://api.kmicloud.com/sms/send/v1/otp`, body);
        // console.warn("result....",result.data);
        if (result && result.data.code == 200) {
            return result.data;
        } else {
            return {code: 500};
        }
    } catch (e) {
        globalErrorLogger.error(`第三方平台巴西短信验证码:${e.stack}`);
        return false;
    }
};

/**
 *
 * @param parameter
 * @param domainName
 * @param path
 * @param port
 * @param isJson
 * @param cb
 */

//发送支付请求post
export function sendHttpPost({ parameter, domainName, path, port = 80, isJson = false }, cb?): Promise<string> {
    let para = '';//序列化请求参数
    let contentType = '';
    if (isJson) {
        para = JSON.stringify(parameter);//json字符串
        contentType = 'application/json;charset=UTF-8';
    } else {
        para = querystring.stringify(parameter);//序列化请求参数
        contentType = 'application/x-www-form-urlencoded';
    }
    const options = {
        host: domainName,//域名
        port: port,//端口默认80
        path: '/' + path,
        method: 'POST',
        headers: {
            'Content-Type': contentType
        }
    };
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            globalErrorLogger.info(`http请求状态码: ${res.statusCode}`);
            if (res.statusCode != 200) {
                cb && cb(res.statusCode);
                return reject(`状态码错误${res.statusCode}`);
            }
            res.setEncoding('utf8');
            let resData = '';
            res.on('data', (chunk) => {
                resData += chunk;
            });
            res.on('end', () => {
                cb && cb(null, resData);
                return resolve(resData);
            });
        });

        req.on('error', (e) => {
            cb && cb(`请求遇到问题: ${e.message}`);
            return reject(`请求遇到问题${e.message}`);
        });

        // 写入数据到请求主体
        req.write(para);
        req.end();
    });
}
export function sendHttpPost2({ parameter, domainName, path, port = 80, isJson = false }, cb?): Promise<string> {
    let para = '';//序列化请求参数
    let contentType = '';
    if (isJson) {
        para = JSON.stringify(parameter);//json字符串
        contentType = 'application/json;charset=UTF-8';
    } else {
        para = querystring.stringify(parameter);//序列化请求参数
        contentType = 'application/x-www-form-urlencoded';
    }
    const options = {
        host: domainName,//域名
        port: port,//端口默认80
        path: '/' + path,
        method: 'POST',
        headers: {
            'Content-Type': contentType
        }
    };
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            globalErrorLogger.info(`http请求状态码: ${res.statusCode}`);
            if (res.statusCode != 200) {
                cb && cb(res.statusCode);
                return reject(`状态码错误${res.statusCode}`);
            }
            res.setEncoding('utf8');
            let resData = '';
            res.on('data', (chunk) => {
                resData += chunk;
            });
            res.on('end', () => {
                cb && cb(null, resData);
                return resolve(resData);
            });
        });

        req.on('error', (e) => {
            cb && cb(`请求遇到问题: ${e.message}`);
            return reject(`请求遇到问题${e.message}`);
        });

        // 写入数据到请求主体
        req.write(para);
        req.end();
    });
}
//发送支付请求post(https)
export function sendHttpPostHttps({ parameter, domainName, path, port = 443, isJson }, cb?): Promise<string> {

    let para;
    let contentType = '';
    if (isJson) {
        para = JSON.stringify(parameter);//json字符串
        contentType = 'application/json;charset=UTF-8';
    } else {
        para = querystring.stringify(parameter);//序列化请求参数
        contentType = 'application/x-www-form-urlencoded';
    }
    const options = {
        host: domainName,//域名
        port: port,//端口默认80
        path: '/' + path,
        method: 'POST',
        headers: {
            'Content-Type': contentType
        }
    };
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                cb && cb(res.statusCode);
                return reject(`状态码错误${res.statusCode}`);
            }
            res.setEncoding('utf8');
            let resData = '';
            res.on('data', (chunk) => {
                resData += chunk;
            });
            res.on('end', () => {
                cb && cb(null, resData);
                return resolve(resData);
            });
        });

        req.on('error', (e) => {
            cb && cb(`请求遇到问题: ${e.message}`);
            return reject(`请求遇到问题: ${e.message}`);
        });

        // 写入数据到请求主体
        req.write(para);
        req.end();
    });
}

//https get请求
export function sendHttpsGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, function (res) {
            if (res.statusCode !== 200) {
                return reject(`状态码错误${res.statusCode}`);
            }
            res.on('data', (d) => {
                return resolve(d);
            });
        }).on('error', function (err) {
            globalErrorLogger.info(`获取验证码异常,异常原因${err}`);
            return reject(err);
        })
    });

}

//加密MD5
export function signature(signSource, isCapital, isStringify) {
    let sign;
    if (isStringify) {
        sign = querystring.stringify(signSource);
        sign = urlencode.decode(sign);
    } else {
        sign = signSource;
    }
    let md5 = createHash('md5');
    md5.update(sign);
    let signs = md5.digest('hex')
    if (isCapital) signs = signs.toUpperCase();
    return signs
}

//字典排序
export function parameterSort(obj) {
    let arr = [];
    let objs = {};
    for (let i in obj) {
        arr.push(i);
    }
    arr.sort(function (a, b) {
        let aa;
        let bb;
        let n = 0;
        aa = a[0].charCodeAt();
        bb = b[0].charCodeAt();
        while (aa == bb) {
            n++;
            aa = a[n] !== undefined ? a[n].charCodeAt() : 0;
            bb = b[n] !== undefined ? b[n].charCodeAt() : 0;
        }
        return aa - bb;
    });
    arr.forEach(m => {
        objs[m] = obj[m];
    });
    return objs;
}


