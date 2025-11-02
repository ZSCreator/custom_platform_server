'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.parameterSort = exports.signature = exports.sendHttpsGet = exports.sendHttpPostHttps = exports.sendHttpPost2 = exports.sendHttpPost = exports.authCodeHttpRequestForBaXi = exports.authCodeHttpRequestForYiDun = exports.authCodeHttpRequest = exports.httpPostSendJson = void 0;
const http = require("http");
const https = require("https");
const crypto_1 = require("crypto");
const urlencode = require("urlencode");
const querystring = require("querystring");
const pinus_logger_1 = require("pinus-logger");
const axios_1 = require("axios");
const globalErrorLogger = (0, pinus_logger_1.getLogger)('server_out', __filename);
async function httpPostSendJson({ parameter, domainName, path, port = 80 }) {
    try {
        const { status, data } = await axios_1.default.post(`http://${domainName}/${path}`, parameter);
        if (status !== 200)
            return false;
        return data;
    }
    catch (e) {
        globalErrorLogger.error(`发起支付请求出错:${e.stack}`);
        return false;
    }
}
exports.httpPostSendJson = httpPostSendJson;
;
function stringToHex(str) {
    let hash = (0, crypto_1.createHash)('sha1');
    hash.update(str);
    return hash.digest('hex');
}
async function authCodeHttpRequest(parameter) {
    try {
        let AppSecret = "225ab77828ed";
        const headers = {
            AppKey: '32553cd8603639876e73d5e9ab051688',
            Nonce: "123456",
            CurTime: (Math.round(Date.now() / 1000)).toString()
        };
        const CheckSum = AppSecret + headers.Nonce + headers.CurTime;
        const buildCheckSum = stringToHex(CheckSum);
        headers['CheckSum'] = buildCheckSum;
        headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        const { data } = await axios_1.default.post(`https://api.netease.im/sms/sendcode.action`, parameter, { headers: headers });
        if (data.code == 200) {
            return data;
        }
        else {
            return false;
        }
    }
    catch (e) {
        globalErrorLogger.error(`第三方平台网易云信短信验证码:${e.stack}`);
        return false;
    }
}
exports.authCodeHttpRequest = authCodeHttpRequest;
;
function genSignature(secretKey, paramsJson) {
    let sorter = function (paramsJson) {
        let sortedJson = {};
        let sortedKeys = Object.keys(paramsJson).sort();
        for (let i = 0; i < sortedKeys.length; i++) {
            sortedJson[sortedKeys[i]] = paramsJson[sortedKeys[i]];
        }
        return sortedJson;
    };
    let sortedParam = sorter(paramsJson);
    let needSignatureStr = "";
    for (let key in sortedParam) {
        let value = sortedParam[key];
        needSignatureStr = needSignatureStr + key + value;
    }
    needSignatureStr += secretKey;
    let md5er = (0, crypto_1.createHash)('md5');
    md5er.update(needSignatureStr, "utf8");
    return md5er.digest('hex');
}
;
async function authCodeHttpRequestForYiDun(params, paramsAppend) {
    try {
        let secretId = "827a1e6595f3f1d3f5e0fd37c1dd10b8";
        let secretKey = "a91ff6698b647d4f252596a5e8abb18b";
        let businessId = "3786723136084ebe838335de914b8403";
        let version = "v2";
        let timestamp = Date.now();
        let nonce = timestamp + "1234567";
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
        let signature = genSignature(secretKey, params);
        paramsAppend.append('signature', signature);
        let headers = {};
        headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        const { data } = await axios_1.default.post(`https://sms.dun.163.com/v2/sendsms`, paramsAppend, { headers: headers });
        if (data.code == 200) {
            return data;
        }
        else {
            return { code: 500 };
        }
    }
    catch (e) {
        globalErrorLogger.error(`第三方平台网易云信短信验证码:${e.stack}`);
        return false;
    }
}
exports.authCodeHttpRequestForYiDun = authCodeHttpRequestForYiDun;
;
async function authCodeHttpRequestForBaXi(auth_code, cellPhone) {
    try {
        let accessKey = "52ce21e3a0364107abdd64df4db548fd";
        let secretKey = "3b3883489b29460398c10ebb04d4a7ee";
        let body = {
            accessKey,
            secretKey,
            "to": `0055${cellPhone}`,
            "message": `[VB] bem-vindos! Seu código de verificação é ${auth_code}.`,
        };
        let headers = {};
        headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        const result = await axios_1.default.post(`http://api.kmicloud.com/sms/send/v1/otp`, body);
        if (result && result.data.code == 200) {
            return result.data;
        }
        else {
            return { code: 500 };
        }
    }
    catch (e) {
        globalErrorLogger.error(`第三方平台巴西短信验证码:${e.stack}`);
        return false;
    }
}
exports.authCodeHttpRequestForBaXi = authCodeHttpRequestForBaXi;
;
function sendHttpPost({ parameter, domainName, path, port = 80, isJson = false }, cb) {
    let para = '';
    let contentType = '';
    if (isJson) {
        para = JSON.stringify(parameter);
        contentType = 'application/json;charset=UTF-8';
    }
    else {
        para = querystring.stringify(parameter);
        contentType = 'application/x-www-form-urlencoded';
    }
    const options = {
        host: domainName,
        port: port,
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
        req.write(para);
        req.end();
    });
}
exports.sendHttpPost = sendHttpPost;
function sendHttpPost2({ parameter, domainName, path, port = 80, isJson = false }, cb) {
    let para = '';
    let contentType = '';
    if (isJson) {
        para = JSON.stringify(parameter);
        contentType = 'application/json;charset=UTF-8';
    }
    else {
        para = querystring.stringify(parameter);
        contentType = 'application/x-www-form-urlencoded';
    }
    const options = {
        host: domainName,
        port: port,
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
        req.write(para);
        req.end();
    });
}
exports.sendHttpPost2 = sendHttpPost2;
function sendHttpPostHttps({ parameter, domainName, path, port = 443, isJson }, cb) {
    let para;
    let contentType = '';
    if (isJson) {
        para = JSON.stringify(parameter);
        contentType = 'application/json;charset=UTF-8';
    }
    else {
        para = querystring.stringify(parameter);
        contentType = 'application/x-www-form-urlencoded';
    }
    const options = {
        host: domainName,
        port: port,
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
        req.write(para);
        req.end();
    });
}
exports.sendHttpPostHttps = sendHttpPostHttps;
function sendHttpsGet(url) {
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
        });
    });
}
exports.sendHttpsGet = sendHttpsGet;
function signature(signSource, isCapital, isStringify) {
    let sign;
    if (isStringify) {
        sign = querystring.stringify(signSource);
        sign = urlencode.decode(sign);
    }
    else {
        sign = signSource;
    }
    let md5 = (0, crypto_1.createHash)('md5');
    md5.update(sign);
    let signs = md5.digest('hex');
    if (isCapital)
        signs = signs.toUpperCase();
    return signs;
}
exports.signature = signature;
function parameterSort(obj) {
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
exports.parameterSort = parameterSort;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5VXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwcC91dGlscy9wYXlVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLFlBQVksQ0FBQzs7O0FBQ2IsNkJBQThCO0FBQzlCLCtCQUFnQztBQUNoQyxtQ0FBa0M7QUFDbEMsdUNBQXdDO0FBQ3hDLDJDQUE0QztBQUM1QywrQ0FBeUM7QUFDekMsaUNBQTBCO0FBQzFCLE1BQU0saUJBQWlCLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUV2RCxLQUFLLFVBQVUsZ0JBQWdCLENBQUcsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxJQUFJLEdBQUcsRUFBRSxFQUFFO0lBQy9FLElBQUk7UUFDQSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sZUFBSyxDQUFDLElBQUksQ0FBQyxVQUFVLFVBQVUsSUFBSSxJQUFJLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNyRixJQUFJLE1BQU0sS0FBSyxHQUFHO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDakMsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsaUJBQWlCLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDL0MsT0FBTyxLQUFLLENBQUM7S0FDaEI7QUFDTCxDQUFDO0FBVEQsNENBU0M7QUFBQSxDQUFDO0FBTUYsU0FBUyxXQUFXLENBQUMsR0FBRztJQUNwQixJQUFJLElBQUksR0FBRyxJQUFBLG1CQUFVLEVBQUMsTUFBTSxDQUFDLENBQUM7SUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNoQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUU7QUFDL0IsQ0FBQztBQVVNLEtBQUssVUFBVSxtQkFBbUIs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