"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.luaRun = void 0;
const pinus_logger_1 = require("pinus-logger");
const databaseService = require("../../../../services/databaseService");
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
let instance = {
    script: {
        setAndGetPlayer: {},
        luaScript: {}
    }
};
let bufferScript = {};
instance.script.setAndGetPlayer = {
    code: `
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
    keysLength: 1
};
instance.script.luaScript = {
    code: `
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
    keysLength: 1
};
const luaRun = async function (name, ...param) {
    const redisClient = await databaseService.getRedisClient();
    return new Promise((resolve, reject) => {
        if (!redisClient) {
            Logger.error('客户端未连接');
            reject('客户端未连接');
        }
        else if (!instance.script[name]) {
            Logger.error('不支持此命令');
            reject('不支持此命令');
        }
        else {
            if (bufferScript[name]) {
                redisClient.evalsha(bufferScript[name], instance.script[name].keysLength, ...param, (err, result) => {
                    if (err) {
                        Logger.error('redisLuaManager.luaRun.evalsha==>', err);
                        return reject(err);
                    }
                    resolve(result);
                });
            }
            else {
                redisClient.script('load', instance.script[name].code, (err, sha) => {
                    if (err) {
                        Logger.error('redisLuaManager.luaRun.script==>', err);
                        return reject(err);
                    }
                    else {
                        bufferScript[name] = sha;
                        redisClient.evalsha(sha, instance.script[name].keysLength, ...param, (err, result) => {
                            if (err) {
                                Logger.error('redisLuaManager.luaRun.evalsha==>', err);
                                return reject(err);
                            }
                            resolve(result);
                        });
                    }
                });
            }
        }
    });
};
exports.luaRun = luaRun;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkaXNMdWFNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvbGliL3JlZGlzTHVhTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFRQSwrQ0FBeUM7QUFDekMsd0VBQXlFO0FBRXpFLE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFHbkQsSUFBSSxRQUFRLEdBQUc7SUFDWCxNQUFNLEVBQUc7UUFDTCxlQUFlLEVBQUMsRUFBRTtRQUNsQixTQUFTLEVBQUMsRUFBRTtLQUNmO0NBQ0osQ0FBQztBQUdGLElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztBQUV0QixRQUFRLENBQUMsTUFBTSxDQUFDLGVBQWUsR0FBRztJQUM5QixJQUFJLEVBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUJSO0lBQ0MsVUFBVSxFQUFHLENBQUM7Q0FDakIsQ0FBQztBQUVGLFFBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHO0lBQ3hCLElBQUksRUFBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0JSO0lBQ0MsVUFBVSxFQUFHLENBQUM7Q0FDakIsQ0FBQztBQVVLLE1BQU0sTUFBTSxHQUFHLEtBQUssV0FBVSxJQUFJLEVBQUUsR0FBRyxLQUFLO0lBQy9DLE1BQU0sV0FBVyxHQUFHLE1BQU0sZUFBZSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQzNELE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDbkMsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNkLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdkIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3BCO2FBQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDL0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDcEI7YUFBTTtZQUNILElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNwQixXQUFXLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsRUFBRSxHQUFHLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRTtvQkFFaEcsSUFBSSxHQUFHLEVBQUU7d0JBQ0wsTUFBTSxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFDdkQsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7cUJBQ3RCO29CQUNELE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDcEIsQ0FBQyxDQUFDLENBQUM7YUFFTjtpQkFBTTtnQkFDSCxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtvQkFDaEUsSUFBSSxHQUFHLEVBQUU7d0JBQ0wsTUFBTSxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsRUFBQyxHQUFHLENBQUMsQ0FBQzt3QkFDckQsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7cUJBQ3RCO3lCQUFNO3dCQUNILFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUM7d0JBQ3pCLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxFQUFFLEdBQUcsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFOzRCQUNqRixJQUFJLEdBQUcsRUFBRTtnQ0FDTCxNQUFNLENBQUMsS0FBSyxDQUFDLG1DQUFtQyxFQUFDLEdBQUcsQ0FBQyxDQUFDO2dDQUN0RCxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs2QkFDdEI7NEJBQ0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUNwQixDQUFDLENBQUMsQ0FBQztxQkFDTjtnQkFDTCxDQUFDLENBQUMsQ0FBQzthQUNOO1NBQ0o7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQTtBQXZDWSxRQUFBLE1BQU0sVUF1Q2xCIn0=