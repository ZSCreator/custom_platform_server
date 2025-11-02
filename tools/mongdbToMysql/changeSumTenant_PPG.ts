import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import SumTenantOperationalDataMysqlDao from "../../app/common/dao/mysql/SumTenantOperationalData.mysql.dao";
import * as moment from "moment";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";

export async function run() {

    await RDSClient.demoInit();
    //首先删除ppg统计表  1-30好的统计数据
    console.warn(`首先删除ppg统计表  1-30好的统计数据 开始=============`);
    const sql = ` DELETE from Sum_TenantOperationalData
                  where 
				      Sum_TenantOperationalData.sumDate >= '2022-06-01 00:00:00'
				   AND Sum_TenantOperationalData.sumDate <= '2022-06-30 00:00:00'
				   AND Sum_TenantOperationalData.groupRemark = 'ppg001'`;
    await ConnectionManager.getConnection()
        .query(sql);

    console.warn(`首先删除ppg统计表  1-30好的统计数据 完成===========`);



    let  lastDateTime = "2022-06-01 00:00:00";
    for (let i = 0; i < 30; i++) {
        const checkTargetDate1 = moment(lastDateTime).add(i, "day").format("YYYY-MM-DD");
        const checkTargetDate2 = moment(lastDateTime).add(i + 1, "day").format("YYYY-MM-DD");
        const startDateTime = `${checkTargetDate1} 00:00:00`;
        const endDateTime = `${checkTargetDate2} 00:00:00`;
        /** Step 2.2.2: 统计租户运营数据 */
        console.warn(`开始统计=======`, startDateTime, endDateTime);
        const tableName = `Sp_GameRecord_62853180_202206`;
        const result =  await copyTenantOperationalData(tableName, startDateTime, endDateTime);
        if(result && result.length > 0){
            await SumTenantOperationalDataMysqlDao.insertMany(result);
        }

    }


    console.warn('结束');

    process.exit();
}


async function copyTenantOperationalData(table, startDateTime, endDateTime){
    try {
        const sql = `            
            WITH playerAgent  AS (
            SELECT
                    pa.parent_uid as parent_uid,
                    pa.fk_uid  as uid,
                    pa.platform_name AS platform_name
            FROM
                    Sp_Player_Agent AS pa                 
            WHERE
                    pa.role_type  = 3
            )
            SELECT
                    IFNULL(playerAgent.uid,'无') AS fk_uid,
                    IFNULL(gr.groupRemark,'无') AS groupRemark,
                    COUNT(gr.id) AS recordCount,
                    IFNULL(gr.game_id,'无') AS nid,
                    IFNULL(gr.gameName,'无') AS gameName,
                    IFNULL(SUM(gr.validBet),0) AS validBetTotal,
                    COUNT(IF(gr.profit > 0,1,null)) AS winCount,
                    SUM(IF(gr.profit>0,gr.profit,0)) AS winTotal,
                    SUM(IF(gr.profit<0,gr.profit,0)) AS loseTotal,
                    IFNULL(SUM(gr.profit),0) AS profitTotal,
                    IFNULL(SUM(gr.bet_commission),0) AS bet_commissionTotal,
                    IFNULL(SUM(gr.win_commission),0) AS win_commissionTotal,
                    IFNULL(SUM(gr.settle_commission),0) AS settle_commissionTotal,
                    "${startDateTime}" AS sumDate,
                    IFNULL(playerAgent.parent_uid,'无') AS parentUid,
                    NOW() AS createDateTime
            FROM
                    ${table} AS gr
					RIGHT JOIN playerAgent ON  playerAgent.platform_name =  gr.groupRemark 
            WHERE           
                 gr.createTimeDate >= "${startDateTime}"
                AND gr.createTimeDate < "${endDateTime}"
                AND gr.game_id not in ('t1','t2')
              GROUP BY groupRemark,parentUid,fk_uid,nid,gameName
            `;
        const result =  await ConnectionManager.getConnection()
            .query(sql);

        return result;
    } catch (e) {

        return [];
    }
}

run();