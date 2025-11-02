"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
async function run() {
    await RDSClient_1.RDSClient.demoInit();
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
        ` + "`change`" + ` int(0) NULL DEFAULT NULL,
        createTime datetime(0) NULL DEFAULT NULL,
        PRIMARY KEY (id) USING BTREE
    ) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;
          `;
    const res = await connectionManager_1.default.getConnection()
        .query(sql);
    console.warn('结果', res);
    process.exit();
}
exports.run = run;
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkSVBMUmVjb3JkVGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy9tb25nZGJUb015c3FsL2FkZElQTFJlY29yZFRhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdFQUFxRTtBQUNyRSx3RkFBaUY7QUFFMUUsS0FBSyxVQUFVLEdBQUc7SUFFckIsTUFBTSxxQkFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBTzNCLE1BQU0sR0FBRyxHQUFHOzs7Ozs7Ozs7Ozs7U0FZUCxHQUFDLFVBQVUsR0FBQzs7OztXQUlWLENBQUE7SUFFUCxNQUFNLEdBQUcsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtTQUM5QyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFaEIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFeEIsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25CLENBQUM7QUFqQ0Qsa0JBaUNDO0FBRUQsR0FBRyxFQUFFLENBQUMifQ==