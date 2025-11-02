"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
RDSClient_1.RDSClient.demoInit();
async function clean() {
    let sql1 = `WHEN "head1" THEN "head40" 
                WHEN "head2" THEN "head39" 
                WHEN "head3" THEN "head38" 
                WHEN "head4" THEN "head37" 
                WHEN "head5" THEN "head36" 
                WHEN "head6" THEN "head35" 
                WHEN "head7" THEN "head34" 
                WHEN "head8" THEN "head33" 
                WHEN "head9" THEN "head32" 
                WHEN "head10" THEN "head31" 
                WHEN "head11" THEN "head30" `;
    let sql2 = `WHEN "head1" THEN "head29" 
                WHEN "head2" THEN "head28" 
                WHEN "head3" THEN "head27" 
                WHEN "head4" THEN "head26" 
                WHEN "head5" THEN "head25" 
                WHEN "head6" THEN "head24" 
                WHEN "head7" THEN "head23" 
                WHEN "head8" THEN "head22" 
                WHEN "head9" THEN "head21" 
                WHEN "head10" THEN "head20" 
                WHEN "head11" THEN "head19" `;
    let sql3 = `WHEN "head1" THEN "head18" 
                WHEN "head2" THEN "head17" 
                WHEN "head3" THEN "head16" 
                WHEN "head4" THEN "head15" 
                WHEN "head5" THEN "head14" 
                WHEN "head6" THEN "head13" 
                WHEN "head7" THEN "head12" 
                WHEN "head8" THEN "head22" 
                WHEN "head9" THEN "head21" 
                WHEN "head10" THEN "head20" 
                WHEN "head11" THEN "head19" `;
    for (let i = 0; i <= 40; i++) {
        console.warn(`开始执行次数${i}`);
        let length = 100000 + 5000 * i;
        let idMin = length + 5000 * i;
        let idMax = length + (5000 * (i + 1));
        const sqlxx = [sql1, sql2, sql3];
        let index = Math.floor((Math.random() * sqlxx.length));
        let sql = `UPDATE Sp_Player
              SET Sp_Player.headurl = CASE headurl 
                 ${sqlxx[index]}
                END
            WHERE Sp_Player.headurl in ("head1","head2","head3","head4","head5","head6","head7","head8","head9","head10","head11") AND Sp_Player.id > ${idMin} AND Sp_Player.id < ${idMax}`;
        await connectionManager_1.default.getConnection(false)
            .query(sql);
    }
    console.warn(`执行完成修改玩家头像`);
    process.exit();
    return;
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlUGxheWVySGVhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL21vbmdkYlRvTXlzcWwvY2hhbmdlUGxheWVySGVhZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdFQUFxRTtBQUNyRSx3RkFBaUY7QUFDakYscUJBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNyQixLQUFLLFVBQVUsS0FBSztJQUNoQixJQUFJLElBQUksR0FBRTs7Ozs7Ozs7Ozs2Q0FVK0IsQ0FBQztJQUMxQyxJQUFJLElBQUksR0FBRTs7Ozs7Ozs7Ozs2Q0FVK0IsQ0FBQztJQUMxQyxJQUFJLElBQUksR0FBRTs7Ozs7Ozs7Ozs2Q0FVK0IsQ0FBQztJQUMxQyxLQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFDO1FBQ3hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzNCLElBQUksTUFBTSxHQUFHLE1BQU0sR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLElBQUksS0FBSyxHQUFHLE1BQU0sR0FBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLElBQUksS0FBSyxHQUFHLE1BQU0sR0FBRyxDQUFFLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sS0FBSyxHQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUNqQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO1FBQ3BELElBQUksR0FBRyxHQUFHOzttQkFFQyxLQUFLLENBQUMsS0FBSyxDQUFDOzt3SkFFeUgsS0FBSyx1QkFBdUIsS0FBSyxFQUFFLENBQUM7UUFDcEwsTUFBUSwyQkFBaUIsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO2FBQ3pDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNuQjtJQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDM0IsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2YsT0FBTztBQUNYLENBQUM7QUFDRCxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDIn0=