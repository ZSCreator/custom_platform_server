import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";

export async function run() {

    await RDSClient.demoInit();
    // const deleSql = `DROP TABLE log_IPL_walletRecord`;

    // await ConnectionManager.getConnection()
    //     .query(deleSql);


    const sql = `
    CREATE TABLE log_IPL_walletRecord  (
        id int(0) NOT NULL AUTO_INCREMENT,
        uid varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
        userId varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
        transfer_id varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
        customer_ref varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
        merchant_code varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
        wallet_log_id varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
        old_balance int(0) NULL DEFAULT NULL,
        new_balance int(0) NULL DEFAULT NULL,
        type varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
        `+"`change`"+` int(0) NULL DEFAULT NULL,
        createTime datetime(0) NULL DEFAULT NULL,
        PRIMARY KEY (id) USING BTREE
    ) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;
          `

    const res = await ConnectionManager.getConnection()
        .query(sql);

    console.warn('结果', res);

    process.exit();
}

run();