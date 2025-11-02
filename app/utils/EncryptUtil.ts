'use strict';
const crypto = require('crypto');
const querystring = require('querystring');
const urlencode = require('urlencode');
const EncryptoUtil = module.exports;

/**
 * MD5签名
 * @param content String  签名参数
 * @returns {*}
 */
export const encryptMD5 = (content) => {
    try {
        const md5 = crypto.createHash('md5');
        md5.update(content + ''); // 解决Number类型报错
        let result = md5.digest('hex');
        return result
    } catch (e) {
        console.log("encryptMD5 error: " + e);
    }

};

/**
 * 把对象按字典排序
 * @param sortObj
 * @returns {{}}
 */
export const parameterSort = (sortObj) => {
    let arr = [];
    let obj = {};
    for (let i in sortObj) {
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
        obj[m] = obj[m];
    });
    return obj;
};
/**
 * 签名MD5签名
 * @param signSource            代签名的object/string
 * @param isUpper               是否大写
 * @param isStringify           是否序列化
 * @returns {*}
 */
export const signature = (signSource, isUpper, isStringify) => {
    let sign;
    //如果是对象需要序列化
    if (isStringify) {
        sign = querystring.stringify(signSource);
        sign = urlencode.decode(sign);
    } else {
        sign = signSource;
    }
    let md5 = crypto.createHash('md5');
    md5.update(sign);
    let signs = md5.digest('hex');
    if (isUpper) signs = signs.toUpperCase();
    return signs
};
/**
 * 验证签名
 * @param signSource            签名对象
 * @param sign                  待验证的签名值
 * @param key                   密钥
 * @param keyName               密钥键名
 * @param isUpper               是否大写
 * @param isStringify           是否序列化
 * @returns {boolean}
 */
export const verifyMD5Sign = (signSource, sign, key, keyName, isUpper, isStringify) => {
    let mySign = EncryptoUtil.signatureMD5Sign(signSource, key, keyName, isUpper, isStringify);
    return sign === mySign
};
/**
 * 签名
 * @param signSource            签名对象
 * @param key                   密钥
 * @param keyName               密钥键名
 * @param isUpper               是否大写
 * @param isStringify           是否序列化
 * @returns {*}
 */
export const signatureMD5Sign = (signSource, key, keyName, isUpper, isStringify) => {
    signSource = parameterSort(signSource);
    signSource[keyName] = key;
    return EncryptoUtil.signature(signSource, isUpper, isStringify)
};
/**
 * 验证签名大写
 * @param signSourceObj         待签名对象
 * @param sign                  对比的签名值
 * @param key                   密钥
 * @param keyName               密钥键名
 * @returns {*}
 */
export const verifyMD5SignUpper = (signSourceObj, sign, key, keyName) => {
    return EncryptoUtil.verifyMD5Sign(signSourceObj, sign, key, keyName, true, true)
};
/**
 * @param signSourceObj         待签名对象
 * @param sign                  对比的签名值
 * @param key                   密钥
 * @param keyName               密钥键名
 * @returns {*}
 */
export const verifyMD5SignLower = (signSourceObj, sign, key, keyName) => {
    return EncryptoUtil.verifyMD5Sign(signSourceObj, sign, key, keyName, false, true)
};

