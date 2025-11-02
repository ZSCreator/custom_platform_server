import ConnectionManager from "../mysql/lib/connectionManager";
import {HotGameData} from "./entity/hotGameData.entity";

class HotGameDataMysqlDao  {
    //根据时间查询分页查询
    async findListToLimit(startTime : string , endTime : string  ): Promise<any> {
        try {
            const sql = `SELECT DATE_FORMAT(Sp_HotGameData.createTime,"%Y-%m-%d %H:%i:%s")  createTime  , Sp_HotGameData.nid AS nid, Sp_HotGameData.sceneId as sceneId, Sp_HotGameData.playerNum as playerNum 
		              FROM Sp_HotGameData WHERE Sp_HotGameData.createTime >'${startTime}' AND Sp_HotGameData.createTime <'${endTime}' `;
            const result = await ConnectionManager.getConnection(true)
                .query(sql);
            return  result;
        } catch (e) {
            console.error(e)
            return false;
        }
    }


    async insertMany(parameterList: Array<HotGameData>): Promise<boolean> {
        try {
            await ConnectionManager.getConnection()
                .createQueryBuilder()
                .insert()
                .into(HotGameData)
                .values(parameterList)
                .execute();
            return true;
        } catch (e) {
            console.error(`租户运营数据 | 批量插入 | 出错:${e.stack}`)
            return false;
        }
    }


}

export default new HotGameDataMysqlDao();