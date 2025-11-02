import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";
import {RDSClient} from "../../app/common/dao/mysql/lib/RDSClient";

/**
 * 修改Sp_PlayerGameHistory表结构
 */
async function changePlayerHistoryField() {
    await RDSClient.demoInit();
    console.warn(`开始修改Sp_PlayerGameHistory表结构`);
    const sql = `alter table Sp_PlayerGameHistory MODIFY column nid VARCHAR(3) NOT NULL DEFAULT '' COMMENT '游戏id'`;
    await ConnectionManager.getConnection(false)
        .query(sql);
    console.warn(`修改Sp_PlayerGameHistory表结构完成`);
    process.exit();
}

process.nextTick(changePlayerHistoryField);