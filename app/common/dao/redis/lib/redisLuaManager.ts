/**
 *
 * lua脚本集合
 *
 * 用于一些对redis原有数据有执行依赖的事务
 *
 */

import { getLogger } from 'pinus-logger';
import databaseService = require('../../../../services/databaseService');

const Logger = getLogger('server_out', __filename);


let instance = {
    script : {
        setAndGetPlayer:{},
        luaScript:{}
    }
};

// 用于记录已在redis缓存过的脚本sha码
let bufferScript = {};

instance.script.setAndGetPlayer = {
    code : `
    local isAdd=tonumber(ARGV[2])
    local udpateJson=ARGV[1]
    if(redis.call("get",KEYS[1]))
    then
        local rs = redis.call("get",KEYS[1])
        local urs = cjson.decode(rs)
        if(isAdd==1)
        then
            urs.data.gold= urs.data.gold + cjson.decode(udpateJson).gold
        else
            urs.data=cjson.decode(udpateJson)
        end
        redis.call("set",KEYS[1],cjson.encode(urs))
        return 1
    end
    return 0
  `,
    keysLength : 1
};

instance.script.luaScript = {
    code : `
    local udpateJson=ARGV[1]
    local rs = redis.call("get",KEYS[1])
    if(rs)
    then
        local oldData = cjson.decode(rs)
        local newData = cjson.decode(udpateJson)    
        for i,v in pairs(newData) do
            if(v.update) then
                oldData.data[v.attr]=oldData.data[v.attr]+v.value
            else
                oldData.data[v.attr]=v.value
            end
        end    
        redis.call("set",KEYS[1],cjson.encode(oldData))
        return 1
    end
    return 0
  `,
    keysLength : 1
};


/**
 *
 * lua执行器 自动判断是否已经缓存过  从而决定是向redis传递脚本还是sha
 *
 * @param name    本脚本所支持的指令  位于 instance.script 下
 * @param ...param  该指令所期待的参数, 按照KEYS到ARGV的顺序罗列
 */
export const luaRun = async function(name, ...param) {
    const redisClient = await databaseService.getRedisClient();
    return new Promise((resolve, reject) => {
        if (!redisClient) {
            Logger.error('客户端未连接');
            reject('客户端未连接');
        } else if (!instance.script[name]) {
            Logger.error('不支持此命令');
            reject('不支持此命令');
        } else {
            if (bufferScript[name]) {
                redisClient.evalsha(bufferScript[name], instance.script[name].keysLength, ...param, (err, result) => {

                    if (err) {
                        Logger.error('redisLuaManager.luaRun.evalsha==>', err);
                        return reject(err);
                    }
                    resolve(result);
                });

            } else {
                redisClient.script('load', instance.script[name].code, (err, sha) => {
                    if (err) {
                        Logger.error('redisLuaManager.luaRun.script==>',err);
                        return reject(err);
                    } else {
                        bufferScript[name] = sha;
                        redisClient.evalsha(sha, instance.script[name].keysLength, ...param, (err, result) => {
                            if (err) {
                                Logger.error('redisLuaManager.luaRun.evalsha==>',err);
                                return reject(err);
                            }
                            resolve(result);
                        });
                    }
                });
            }
        }
    });
}

