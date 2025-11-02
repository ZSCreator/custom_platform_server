import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";

RDSClient.demoInit();
async function alter() {
    console.warn(`开始执行`);

    console.warn(`Sp_PayInfo 新增字段 groupRemark | 开始`);
    let addMysql = `alter table Sp_PayInfo ADD COLUMN groupRemark VARCHAR(20) DEFAULT NULL`;
    await ConnectionManager.getConnection(false)
        .query(addMysql);

        console.warn(`Sp_PayInfo 新增字段 groupRemark | 成功`);


    process.exit();
}

setTimeout(alter, 2000);