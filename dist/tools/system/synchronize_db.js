"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const typeorm_1 = require("typeorm");
async function demoInit(maxConnections = 50, entityPath = null) {
    if (!entityPath) {
        entityPath = (0, path_1.resolve)(__dirname, '../../app/common/dao/mysql/entity/**{.ts,.js}');
    }
    else {
        entityPath = (0, path_1.resolve)(__dirname.split("\\").slice(0, 1).join("\\"), "dist", "app", "common", "dao", "mysql", "entity", "*.entity{.ts,.js}");
    }
    const cfgUrl = (0, path_1.resolve)(__dirname, "../../config/db/mysql.json");
    const tagetEnvCfg = require(cfgUrl)['development'];
    const envCfg = tagetEnvCfg.map(singleton => {
        singleton['synchronize'] = true;
        singleton['logging'] = ["warn", "error"];
        singleton['dropSchema'] = false;
        return Object.assign({ type: "mysql", extra: {
                connectionLimit: maxConnections,
            }, entities: [entityPath] }, singleton);
    });
    console.log(entityPath);
    await (0, typeorm_1.createConnections)(envCfg).then(() => {
        console.warn(`mysql | 创建连接池 | 成功`);
        process.exit();
    }).catch(e => {
        console.warn(`mysql | 创建连接池 | 出错: ${e.stack}`);
    });
    return;
}
console.warn(__dirname);
demoInit(50);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luY2hyb25pemVfZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy9zeXN0ZW0vc3luY2hyb25pemVfZGIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBK0I7QUFDL0IscUNBQTRDO0FBRzVDLEtBQUssVUFBVSxRQUFRLENBQUMsY0FBYyxHQUFHLEVBQUUsRUFBRSxhQUFxQixJQUFJO0lBQ2xFLElBQUksQ0FBQyxVQUFVLEVBQUU7UUFDYixVQUFVLEdBQUcsSUFBQSxjQUFPLEVBQUMsU0FBUyxFQUFFLCtDQUErQyxDQUFDLENBQUM7S0FDcEY7U0FBTTtRQUNILFVBQVUsR0FBRyxJQUFBLGNBQU8sRUFBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLG1CQUFtQixDQUFDLENBQUM7S0FFOUk7SUFDRCxNQUFNLE1BQU0sR0FBRyxJQUFBLGNBQU8sRUFBQyxTQUFTLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztJQUVoRSxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFbkQsTUFBTSxNQUFNLEdBQVUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtRQUM5QyxTQUFTLENBQUMsYUFBYSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2hDLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6QyxTQUFTLENBQUMsWUFBWSxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBRWhDLHVCQUNJLElBQUksRUFBRSxPQUFPLEVBQ2IsS0FBSyxFQUFFO2dCQUNILGVBQWUsRUFBRSxjQUFjO2FBQ2xDLEVBQ0QsUUFBUSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQ25CLFNBQVMsRUFDZjtJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUV4QixNQUFNLElBQUEsMkJBQWlCLEVBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUV0QyxPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDbkMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ25CLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNULE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ25ELENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTztBQUNYLENBQUM7QUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3hCLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyJ9