import { resolve } from "path";
import { createConnections } from "typeorm";


async function demoInit(maxConnections = 50, entityPath: string = null) {
    if (!entityPath) {
        entityPath = resolve(__dirname, '../../app/common/dao/mysql/entity/**{.ts,.js}');
    } else {
        entityPath = resolve(__dirname.split("\\").slice(0, 1).join("\\"), "dist", "app", "common", "dao", "mysql", "entity", "*.entity{.ts,.js}");
        // entityPath = `D:\\workplace\\nodePeroject\\game_back_end\\dist\\app\\common\\dao\\mysql\\entity\\**.js`;
    }
    const cfgUrl = resolve(__dirname, "../../config/db/mysql.json");

    const tagetEnvCfg = require(cfgUrl)['development'];

    const envCfg: any[] = tagetEnvCfg.map(singleton => {
        singleton['synchronize'] = true;
        singleton['logging'] = ["warn", "error"];
        singleton['dropSchema'] = false;

        return {
            type: "mysql",
            extra: {
                connectionLimit: maxConnections, // 连接池最大连接数量, 查阅资料 建议是  core number  * 2 + n
            },
            entities: [entityPath],
            ...singleton
        }
    });

    console.log(entityPath);
    // await createConnections(envCfg.slice(0, 1));
    await createConnections(envCfg).then(() => {
        // ConnectionManager.init(envCfg);
        console.warn(`mysql | 创建连接池 | 成功`);
        process.exit();
    }).catch(e => {
        console.warn(`mysql | 创建连接池 | 出错: ${e.stack}`);
    });

    return;
}
console.warn(__dirname);
demoInit(50);