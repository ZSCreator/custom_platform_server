import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";
RDSClient.demoInit();
async function clean() {
    let sql1= `WHEN "head1" THEN "head40" 
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
    let sql2= `WHEN "head1" THEN "head29" 
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
    let sql3= `WHEN "head1" THEN "head18" 
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
    for(let i = 0 ;i <= 40; i++){
        console.warn(`开始执行次数${i}`);
        let length = 100000 + 5000 * i;
        let idMin = length +  5000 * i;
        let idMax = length + ( 5000 * (i + 1));
        const sqlxx =  [sql1, sql2, sql3]
        let index = Math.floor((Math.random()*sqlxx.length))
        let sql = `UPDATE Sp_Player
              SET Sp_Player.headurl = CASE headurl 
                 ${sqlxx[index]}
                END
            WHERE Sp_Player.headurl in ("head1","head2","head3","head4","head5","head6","head7","head8","head9","head10","head11") AND Sp_Player.id > ${idMin} AND Sp_Player.id < ${idMax}`;
        await   ConnectionManager.getConnection(false)
            .query(sql);
    }
    console.warn(`执行完成修改玩家头像`);
    process.exit();
    return;
}
setTimeout(clean, 2000);