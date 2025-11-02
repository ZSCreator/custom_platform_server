
import crypto = require('crypto');
import fs = require('fs');
import path = require('path');
const servers = require('./servers');

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
function create(value) {
    let msg = value + '|' + Date.now();
    let cipher = crypto.createCipheriv('aes256', key, iv);
    let enc = cipher.update(msg, 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
};

//写入文件
function writeFile(text) {
    let paths = path.resolve(__dirname, './');
    console.log('当前路径', paths);
    fs.writeFileSync(paths + '/' + 'adminServer.json', text)
}


function BuilderToken(environment) {
    const arr = [];
    if (!servers[environment]) {
        return console.error('环境错误');
    }
    const allServer = servers[environment];
    for (let key in allServer) {
        const ob = { type: null, token: null };
        ob.type = key;
        ob.token = create(key);
        arr.push(ob);
    }
    return arr;
}

let text: any = BuilderToken('production');
text = JSON.stringify(text);
writeFile(text);
