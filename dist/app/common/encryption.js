'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpManagerMD5KEY = exports.MD5KEY = exports.httpManagerEnCryPtionObjectParam = exports.httpManagerEnCryPtionForParam = exports.httpUrlEnCryPtionObjectParam = exports.httpUrlEnCryPtionForParam = void 0;
const crypto = require("crypto");
const Utils = require("../utils/index");
const querystring = require("querystring");
const crypto_1 = require("crypto");
const pinus_logger_1 = require("pinus-logger");
const encryption_aes = require('../../config/third/encryption_aes.json');
const thirdHttpLogger = (0, pinus_logger_1.getLogger)('thirdHttp', __filename);
const httpLogger = (0, pinus_logger_1.getLogger)('http', __filename);
const AES_conf = {
    key: "f028f684404417b4",
    iv: 'ABCDEFH123456789',
};
function encryption(data, key, iv) {
    const cipher = (0, crypto_1.createCipheriv)('aes-128-cbc', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return (encrypted);
}
function decryption(data, key, iv) {
    let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
function httpUrlEnCryPtionForParam(param) {
    try {
        let key = encryption_aes.AES.key;
        let iv = encryption_aes.AES.iv;
        return encryption(querystring.stringify(param), key, iv);
    }
    catch (error) {
        thirdHttpLogger.warn(`third加密生成出错error:${error}`);
        return Promise.reject("third加密生成出错");
    }
}
exports.httpUrlEnCryPtionForParam = httpUrlEnCryPtionForParam;
function httpUrlEnCryPtionObjectParam(param) {
    try {
        let key = encryption_aes.AES.key;
        let iv = encryption_aes.AES.iv;
        return JSON.parse(JSON.stringify(querystring.parse(decryption(param, key, iv))));
    }
    catch (error) {
        thirdHttpLogger.warn(`third解析密钥出错error:${error}`);
        return Promise.reject("third解析密钥出错");
    }
}
exports.httpUrlEnCryPtionObjectParam = httpUrlEnCryPtionObjectParam;
function httpManagerEnCryPtionForParam(param) {
    try {
        let key = encryption_aes.AES.key;
        let iv = encryption_aes.AES.iv;
        return encryption(querystring.stringify(param), key, iv);
    }
    catch (error) {
        httpLogger.warn(`http加密出错error:${error}`);
        return Promise.reject("http加密出错");
    }
}
exports.httpManagerEnCryPtionForParam = httpManagerEnCryPtionForParam;
function httpManagerEnCryPtionObjectParam(param) {
    try {
        let key = encryption_aes.AES.key;
        let iv = encryption_aes.AES.iv;
        return querystring.parse(decryption(param, key, iv));
    }
    catch (error) {
        httpLogger.warn(`http解析密钥出错error:${error}`);
        return Promise.reject("http解析密钥出错");
    }
}
exports.httpManagerEnCryPtionObjectParam = httpManagerEnCryPtionObjectParam;
function MD5KEY(agent, timestamp) {
    const data = { agent, timestamp, MD5Key: encryption_aes.MD5Key.key };
    return Utils.signature(data, false, true);
}
exports.MD5KEY = MD5KEY;
function HttpManagerMD5KEY(agent, timestamp) {
    const data = { agent, timestamp, MD5Key: encryption_aes.MD5Key.key };
    return Utils.signature(data, false, true);
}
exports.HttpManagerMD5KEY = HttpManagerMD5KEY;
let key_ = encryption_aes.AES.key;
let iv = encryption_aes.AES.iv;
const test = "f4ae687814c373c80e913498c413a97cafb4315345eadde61634560d6a00870c1459c229b3cde71e933c6acd0c2972816578d6491f813b06f5030314a0593b4b";
console.log("解密参数", test);
const data8 = decryption(test, key_, iv);
console.log("解密过后", data8);
const data3 = { agent: 'bcapis', timestamp: "1681468754538", MD5Key: encryption_aes.MD5Key.key };
let sign = querystring.stringify(data3);
console.log("MD5之前的json", sign);
const data4 = Utils.signature(data3, false, true);
console.log("MD5+16进制", data4);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5jcnlwdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwcC9jb21tb24vZW5jcnlwdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUNiLGlDQUFpQztBQUNqQyx3Q0FBd0M7QUFDeEMsMkNBQTJDO0FBQzNDLG1DQUFzQztBQUN0QywrQ0FBeUM7QUFDekMsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7QUFDekUsTUFBTSxlQUFlLEdBQUksSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUM1RCxNQUFNLFVBQVUsR0FBSSxJQUFBLHdCQUFTLEVBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBU2xELE1BQU0sUUFBUSxHQUFHO0lBQ2IsR0FBRyxFQUFHLGtCQUFrQjtJQUN4QixFQUFFLEVBQUUsa0JBQWtCO0NBQ3pCLENBQUE7QUFlQSxTQUFTLFVBQVUsQ0FBQyxJQUFJLEVBQUcsR0FBRyxFQUFHLEVBQUU7SUFHaEMsTUFBTSxNQUFNLEdBQUcsSUFBQSx1QkFBYyxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFdkQsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRW5ELFNBQVMsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRWpDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUl2QixDQUFDO0FBT0EsU0FBUyxVQUFVLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBRTlCLElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQy9ELElBQUksU0FBUyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUNwRCxTQUFTLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNuQyxPQUFPLFNBQVMsQ0FBQztBQUdyQixDQUFDO0FBV0QsU0FBZ0IseUJBQXlCLENBQUMsS0FBVztJQUNqRCxJQUFJO1FBRUEsSUFBSSxHQUFHLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDakMsSUFBSSxFQUFFLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDL0IsT0FBTyxVQUFVLENBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBQyxHQUFHLEVBQUcsRUFBRSxDQUFDLENBQUM7S0FDN0Q7SUFBQSxPQUFPLEtBQUssRUFBRTtRQUNYLGVBQWUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEtBQUssRUFBRSxDQUFDLENBQUE7UUFDakQsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQ3hDO0FBQ0wsQ0FBQztBQVZELDhEQVVDO0FBV0QsU0FBaUIsNEJBQTRCLENBQUUsS0FBSztJQUNoRCxJQUFJO1FBR0EsSUFBSSxHQUFHLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDakMsSUFBSSxFQUFFLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFHL0IsT0FBUSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN0RjtJQUFBLE9BQU8sS0FBSyxFQUFFO1FBQ1gsZUFBZSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsS0FBSyxFQUFFLENBQUMsQ0FBQTtRQUNqRCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDeEM7QUFFTCxDQUFDO0FBZEQsb0VBY0M7QUFXRCxTQUFnQiw2QkFBNkIsQ0FBQyxLQUFXO0lBQ3JELElBQUk7UUFHQSxJQUFJLEdBQUcsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUNqQyxJQUFJLEVBQUUsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUMvQixPQUFPLFVBQVUsQ0FBRSxXQUFXLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFDLEdBQUcsRUFBRyxFQUFFLENBQUMsQ0FBQztLQUM3RDtJQUFBLE9BQU8sS0FBSyxFQUFFO1FBQ1gsVUFBVSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsS0FBSyxFQUFFLENBQUMsQ0FBQTtRQUN6QyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDckM7QUFDTCxDQUFDO0FBWEQsc0VBV0M7QUFpQkQsU0FBaUIsZ0NBQWdDLENBQUUsS0FBSztJQUNwRCxJQUFJO1FBR0EsSUFBSSxHQUFHLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDakMsSUFBSSxFQUFFLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDL0IsT0FBUSxXQUFXLENBQUMsS0FBSyxDQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDM0Q7SUFBQSxPQUFPLEtBQUssRUFBRTtRQUNYLFVBQVUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEtBQUssRUFBRSxDQUFDLENBQUE7UUFDM0MsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQ3ZDO0FBQ0wsQ0FBQztBQVhELDRFQVdDO0FBVUQsU0FBaUIsTUFBTSxDQUFDLEtBQVksRUFBRyxTQUFrQjtJQUNyRCxNQUFNLElBQUksR0FBSSxFQUFFLEtBQUssRUFBRyxTQUFTLEVBQUcsTUFBTSxFQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDMUUsT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksRUFBQyxLQUFLLEVBQUMsSUFBSSxDQUFDLENBQUE7QUFDM0MsQ0FBQztBQUhELHdCQUdDO0FBVUQsU0FBaUIsaUJBQWlCLENBQUMsS0FBWSxFQUFHLFNBQWtCO0lBQ2hFLE1BQU0sSUFBSSxHQUFJLEVBQUUsS0FBSyxFQUFHLFNBQVMsRUFBRyxNQUFNLEVBQUksY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUMxRSxPQUFPLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFDLEtBQUssRUFBQyxJQUFJLENBQUMsQ0FBQTtBQUMzQyxDQUFDO0FBSEQsOENBR0M7QUFHRCxJQUFJLElBQUksR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztBQUNsQyxJQUFJLEVBQUUsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQWUvQixNQUFNLElBQUksR0FBRyxrSUFBa0ksQ0FBQztBQUNoSixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBQyxJQUFJLENBQUMsQ0FBQTtBQUN4QixNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxFQUFFLENBQUMsQ0FBQztBQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBQyxLQUFLLENBQUMsQ0FBQztBQUcxQixNQUFNLEtBQUssR0FBRyxFQUFDLEtBQUssRUFBQyxRQUFRLEVBQUcsU0FBUyxFQUFFLGVBQWUsRUFBRyxNQUFNLEVBQUksY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUMsQ0FBQztBQUNsRyxJQUFJLElBQUksR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFDLElBQUksQ0FBQyxDQUFBO0FBQzlCLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxJQUFJLENBQUMsQ0FBQztBQUNoRCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBQyxLQUFLLENBQUMsQ0FBQSJ9