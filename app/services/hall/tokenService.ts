'use strict';

import crypto = require('crypto');

const config = {
    secret: '12312312412142121',
    expire: -1
};
const key = crypto.scryptSync(config.secret, '盐值', 32);
const iv = Buffer.alloc(16, 0); // 初始化向量。

/**
 * 创建token
 *
 * @param  {String} uid
 * @return {String} token string
 */
export function create(uid: string) {
    const msg = uid + '|' + Date.now();
    const cipher = crypto.createCipheriv('aes256', key, iv);
    let enc = cipher.update(msg, 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
};

/**
 * 解析token
 *
 * @param  {String} token
 * @return {Object} {id, timestamp}
 */
export function parse(token) {
    const decipher = crypto.createDecipheriv('aes256', key, iv);
    let dec: string;
    try {
        dec = decipher.update(token, 'hex', 'utf8');
        dec += decipher.final('utf8');
    } catch (err) {
        console.error('[token] fail to decrypt token. %j', token);
        return null;
    }
    const ts = dec.split('|');
    if (ts.length !== 2) {
        console.error('illegal token', dec);
        return null;
    }
    return { id: ts[0], timestamp: Number(ts[1]) };
};

/**
 * 检查是否过期
 *
 * @param: {String} {uid, timestamp}
 * @return {boolean}
 */
export function checkExpire(token) {
    if (config.expire < 0) {
        return true;
    }
    return (Date.now() - token.timestamp) < config.expire;
};

/**
 * 验证 token
 * @param: token
 */
export function auth(token) {
    const res = parse(token);
    if (!res) {
        return 'token非法';
    }
    if (!checkExpire(res)) {
        return 'token过时';
    }
    return null;
};

/**返回 md5 加密后的字符串 */
export function encryptWithMD5(content: string | Buffer | DataView) {
    if (!content) {
        return '';
    }
    const md5 = crypto.createHash('md5');
    md5.update(content);
    return md5.digest('hex');
};
