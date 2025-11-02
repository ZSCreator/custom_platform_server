"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
RDSClient_1.RDSClient.demoInit();
async function clean() {
    console.warn(`开始执行`);
    let addMysql = `alter table Sp_Player ADD withdrawalChips  double DEFAULT 0`;
    await connectionManager_1.default.getConnection(false)
        .query(addMysql);
    console.warn(`执行完成表结构：Sp_Player`);
    process.exit();
    return;
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlUGxheWVyVGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy9tb25nZGJUb015c3FsL2NoYW5nZVBsYXllclRhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0VBQXFFO0FBQ3JFLHdGQUFpRjtBQUVqRixxQkFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3JCLEtBQUssVUFBVSxLQUFLO0lBQ2QsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQVluQixJQUFJLFFBQVEsR0FBRyw2REFBNkQsQ0FBQztJQUM3RSxNQUFNLDJCQUFpQixDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7U0FDdkMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3JCLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQTJCdEMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2YsT0FBTztBQUNYLENBQUM7QUFDRCxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDIn0=