import { resolve } from "path";
import {Connection, createConnections} from "typeorm";
import { pinus, RESERVED } from "pinus";
import ConnectionManager from "./connectionManager";

function random(min, max, addOne = 1) {
    let count = Math.max(max - min, 0) + addOne;
    return Math.floor(Math.random() * count) + min;
}

const delay = (timeStamp: number) => new Promise(resolve => setTimeout(resolve, timeStamp))
export class RDSClient {

    private static serverConnectMap: Map<string, boolean> = new Map();
    private static connections: Connection[] = [];

    public static async init(serverId: string) {

        if (serverId === "master-server-1") {
            return;
        }

        if (RDSClient.serverConnectMap.has(serverId)) {
            console.warn(`mysql | 服务 ${serverId} | 创建连接池 | 已创建`);
            return;
        }

        const env = pinus.app.get(RESERVED.ENV) || "development";

        const cfgUrl = resolve(pinus.app.getBase(), "config", "db", "mysql.json");

        const config = require(cfgUrl)[env];

        const envCfg = config.map(singleton => {
            return {
                type: "mysql",
                entities: [resolve(__dirname, '../entity/**{.ts,.js}')],
                ...singleton
            }
        });


        await delay(random(500, 3000));

        try {
            RDSClient.connections = await createConnections(envCfg);
            ConnectionManager.init(envCfg);
            console.warn(`mysql | 服务 ${serverId} | 创建连接池 | 成功`);
        } catch (e) {
            console.warn(`mysql | 服务 ${serverId} | 创建连接池 | 出错: ${e.stack}`);
        }
    }

    /**
     * 关闭连接
     */
    public static async closeConnections() {
        RDSClient.connections.forEach(c => c.close());
    }

    public static async demoInit(maxConnections = 50) {
        const cfgUrl = resolve(__dirname, "../../../../../config/db/mysql.json");

        const tagetEnvCfg = require(cfgUrl)['production'];

        const envCfg = tagetEnvCfg.map(singleton => {
            singleton['synchronize'] = false;
            singleton['logging'] = ["warn", "error"];
            singleton['dropSchema'] = false;

            return {
                type: "mysql",
                extra: {
                    connectionLimit:  maxConnections, // 连接池最大连接数量, 查阅资料 建议是  core number  * 2 + n
                },
                entities: [resolve(__dirname, '../entity/**{.ts,.js}')],
                ...singleton
            }
        })


        // tagetEnvCfg['synchronize'] = false;
        // tagetEnvCfg['logging'] = ["warn", "error"];
        // tagetEnvCfg['dropSchema'] = false;
        // console.log(entityPath);
        try {
            RDSClient.connections = await createConnections(envCfg);
            ConnectionManager.init(envCfg);
            console.warn(`mysql | 创建连接池 | 成功`);
        } catch (e) {
            console.warn(`mysql | 创建连接池 | 出错: ${e.stack}`);
        }
    }

    public static async clearAndInit() {
        const env = "production";

        /* const cfgUrl = resolve(__filename.split("\\").slice(0,-6).join("\\"), "config", "db", "mysql.json");
        console.log(cfgUrl) */
        const tagetEnvCfg = require("/data/app/game-server/dist/config/db/mysql.json")[env];
        // await delay(random(50, 150));

        const { synchronize, dropSchema, ...rest } = tagetEnvCfg;

        try {
            RDSClient.connections = await createConnections({
                type: "mysql",
                entities: [resolve(__dirname, '../entity/**{.ts,.js}')],
                "synchronize": true,
                "dropSchema": true,
                ...rest
            });
            console.warn(`mysql | 创建连接池 | 成功`);
        } catch (e) {
            console.warn(`mysql | 创建连接池 | 出错: ${e.stack}`);
        }
    }
}


