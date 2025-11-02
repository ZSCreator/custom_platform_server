"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RDSClient = void 0;
const path_1 = require("path");
const typeorm_1 = require("typeorm");
const pinus_1 = require("pinus");
const connectionManager_1 = require("./connectionManager");
function random(min, max, addOne = 1) {
    let count = Math.max(max - min, 0) + addOne;
    return Math.floor(Math.random() * count) + min;
}
const delay = (timeStamp) => new Promise(resolve => setTimeout(resolve, timeStamp));
class RDSClient {
    static async init(serverId) {
        if (serverId === "master-server-1") {
            return;
        }
        if (RDSClient.serverConnectMap.has(serverId)) {
            console.warn(`mysql | 服务 ${serverId} | 创建连接池 | 已创建`);
            return;
        }
        const env = pinus_1.pinus.app.get(pinus_1.RESERVED.ENV) || "development";
        const cfgUrl = (0, path_1.resolve)(pinus_1.pinus.app.getBase(), "config", "db", "mysql.json");
        const config = require(cfgUrl)[env];
        const envCfg = config.map(singleton => {
            return Object.assign({ type: "mysql", entities: [(0, path_1.resolve)(__dirname, '../entity/**{.ts,.js}')] }, singleton);
        });
        await delay(random(500, 3000));
        try {
            RDSClient.connections = await (0, typeorm_1.createConnections)(envCfg);
            connectionManager_1.default.init(envCfg);
            console.warn(`mysql | 服务 ${serverId} | 创建连接池 | 成功`);
        }
        catch (e) {
            console.warn(`mysql | 服务 ${serverId} | 创建连接池 | 出错: ${e.stack}`);
        }
    }
    static async closeConnections() {
        RDSClient.connections.forEach(c => c.close());
    }
    static async demoInit(maxConnections = 50) {
        const cfgUrl = (0, path_1.resolve)(__dirname, "../../../../../config/db/mysql.json");
        const tagetEnvCfg = require(cfgUrl)['production'];
        const envCfg = tagetEnvCfg.map(singleton => {
            singleton['synchronize'] = false;
            singleton['logging'] = ["warn", "error"];
            singleton['dropSchema'] = false;
            return Object.assign({ type: "mysql", extra: {
                    connectionLimit: maxConnections,
                }, entities: [(0, path_1.resolve)(__dirname, '../entity/**{.ts,.js}')] }, singleton);
        });
        try {
            RDSClient.connections = await (0, typeorm_1.createConnections)(envCfg);
            connectionManager_1.default.init(envCfg);
            console.warn(`mysql | 创建连接池 | 成功`);
        }
        catch (e) {
            console.warn(`mysql | 创建连接池 | 出错: ${e.stack}`);
        }
    }
    static async clearAndInit() {
        const env = "production";
        const tagetEnvCfg = require("/data/app/game-server/dist/config/db/mysql.json")[env];
        const { synchronize, dropSchema } = tagetEnvCfg, rest = __rest(tagetEnvCfg, ["synchronize", "dropSchema"]);
        try {
            RDSClient.connections = await (0, typeorm_1.createConnections)(Object.assign({ type: "mysql", entities: [(0, path_1.resolve)(__dirname, '../entity/**{.ts,.js}')], "synchronize": true, "dropSchema": true }, rest));
            console.warn(`mysql | 创建连接池 | 成功`);
        }
        catch (e) {
            console.warn(`mysql | 创建连接池 | 出错: ${e.stack}`);
        }
    }
}
exports.RDSClient = RDSClient;
RDSClient.serverConnectMap = new Map();
RDSClient.connections = [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUkRTQ2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvbGliL1JEU0NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLCtCQUErQjtBQUMvQixxQ0FBc0Q7QUFDdEQsaUNBQXdDO0FBQ3hDLDJEQUFvRDtBQUVwRCxTQUFTLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sR0FBRyxDQUFDO0lBQ2hDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7SUFDNUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDbkQsQ0FBQztBQUVELE1BQU0sS0FBSyxHQUFHLENBQUMsU0FBaUIsRUFBRSxFQUFFLENBQUMsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUE7QUFDM0YsTUFBYSxTQUFTO0lBS1gsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBZ0I7UUFFckMsSUFBSSxRQUFRLEtBQUssaUJBQWlCLEVBQUU7WUFDaEMsT0FBTztTQUNWO1FBRUQsSUFBSSxTQUFTLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxRQUFRLGdCQUFnQixDQUFDLENBQUM7WUFDckQsT0FBTztTQUNWO1FBRUQsTUFBTSxHQUFHLEdBQUcsYUFBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsZ0JBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxhQUFhLENBQUM7UUFFekQsTUFBTSxNQUFNLEdB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