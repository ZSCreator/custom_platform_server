import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";
import {signature} from "../../app/utils";

RDSClient.demoInit();
async function clean() {
      console.warn(`开始执行修改后台账号密码得脚本`);

        let sql = `select Sp_ManagerInfo.id ,Sp_ManagerInfo.userName, Sp_ManagerInfo.passWord  FROM  Sp_ManagerInfo `;
        const result = await ConnectionManager.getConnection(false)
            .query(sql);
        for(let managerinfo of result){
            let passWord = managerinfo.passWord;
            passWord = signature(passWord, false, false);
            let sql = `update Sp_ManagerInfo SET Sp_ManagerInfo.passWord = "${passWord}" WHERE Sp_ManagerInfo.id = ${managerinfo.id}`;
             await ConnectionManager.getConnection(false)
                .query(sql);
            console.warn(`修改用户名${managerinfo.userName}完成`);
        }

        console.warn(`执行修改后台账号密码得脚本===========完成`);


    process.exit();
    return;
}
setTimeout(clean, 2000);