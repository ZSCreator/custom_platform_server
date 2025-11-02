import { AbstractDao } from "../ADao.abstract";
import { PlayerRebate } from "./entity/PlayerRebate.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class PlayerRebateMysqlDao extends AbstractDao<PlayerRebate> {
    async findList(parameter: {uid? : string, allRebate? : number, todayRebate? : number, yesterdayRebate? : number, sharePeople? : number,dayPeople? : number, createDate? : Date}): Promise<PlayerRebate[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(PlayerRebate)
                .find(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: { uid? : string , allRebate? : number,}): Promise<PlayerRebate> {
        try {
            const playerRebate = await ConnectionManager.getConnection(true)
                .getRepository(PlayerRebate)
                .findOne(parameter);
            return playerRebate;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: { uid? : string, allRebate? : number, iplRebate? : number, todayRebate? : number, yesterdayRebate? : number, sharePeople? : number,dayPeople? : number, createDate? : Date }): Promise<any> {
        try {

            const mailRecordsRepository = ConnectionManager.getConnection()
                .getRepository(PlayerRebate);

            const p = mailRecordsRepository.create(parameter);
            return await mailRecordsRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{ uid? : string} , partialEntity :{ id? : number ,uid? : string, iplRebate? : number, allRebate? : number, todayRebate? : number, yesterdayRebate? : number, sharePeople? : number,dayPeople? : number, createDate? : Date } ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PlayerRebate)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {uid? : string}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PlayerRebate)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }


    /**
     * 对玩家佣金的增加
     * @param parameter
     * @param partialEntity
     * @returns
     */
    async updateAddRebate(uid: string, rebate : number ) {
        try {
            // const sql = `
            //     UPDATE Sp_PlayerRebate
            //         SET
            //             todayRebate = todayRebate + ${rebate}
            //         WHERE uid = "${uid}"
            // `;
             const sql = `
            INSERT INTO Sp_PlayerRebate (uid,todayRebate)
            VALUES(${uid},${rebate})
            ON DUPLICATE KEY UPDATE todayRebate = todayRebate+ ${rebate}
            `;

            const res = await ConnectionManager
                .getConnection()
                .query(sql);

            const isSuccess = !!res.affectedRows;
            return isSuccess;
        } catch (e) {
            console.error(e.stack);
            return false;
        }
    }


    /**
     * 对玩家今日新增人数
     * @param parameter
     * @param partialEntity
     * @returns
     */
    async updateAddDayPeople(uid: string, dayPeople : number ) {
        try {
            const sql = `
            INSERT INTO Sp_PlayerRebate (uid,dayPeople,sharePeople)
            VALUES(${uid},${dayPeople},${dayPeople})
            ON DUPLICATE KEY UPDATE dayPeople = dayPeople+ ${dayPeople},sharePeople = sharePeople + ${dayPeople}
            `;
            console.warn("updateAddDayPeople_sql",sql)
            const res = await ConnectionManager
                .getConnection()
                .query(sql);

            const isSuccess = !!res.affectedRows;
            return isSuccess;
        } catch (e) {
            console.error(e.stack);
            return false;
        }
    }



    /**
     * 对玩家每把有效下注的佣金的增加
     * @param parameter
     * @param partialEntity
     * @returns
     */
    async updateAddIplRebate(uid: string, iplRebate : number ) {
        try {
            // const sql = `
            //     UPDATE Sp_PlayerRebate
            //         SET
            //             iplRebate = iplRebate + ${iplRebate}
            //         WHERE uid = "${uid}"
            // `;
            const sql = `
            INSERT INTO Sp_PlayerRebate (uid,iplRebate)
            VALUES(${uid},${iplRebate})
            ON DUPLICATE KEY UPDATE iplRebate = iplRebate+ ${iplRebate}
            `;
            const res = await ConnectionManager
                .getConnection()
                .query(sql);

            const isSuccess = !!res.affectedRows;
            return isSuccess;
        } catch (e) {
            console.error(e);
            return false;
        }
    }


    /**
     * 对玩家每把有效下注的佣金的增加
     * @param parameter
     * @param partialEntity
     * @returns
     */
    async updateDelIplRebate(uid: string, iplRebate : number ) {
        try {
            const sql = `
                UPDATE Sp_PlayerRebate 
                    SET
                        iplRebate = iplRebate - ${iplRebate}
                    WHERE uid = "${uid}"
            `;
            const res = await ConnectionManager
                .getConnection()
                .query(sql);

            const isSuccess = !!res.affectedRows;
            return isSuccess;
        } catch (e) {
            console.error(e.stack);
            return false;
        }
    }



    /**
     * 对玩家领取了今日佣金
     * @param parameter
     * @param partialEntity
     * @returns
     */
    async updateDelRebate(uid: string, todayRebate : number ) {
        try {

            const sql = `
                UPDATE Sp_PlayerRebate 
                    SET
                        dayPeople = 0,
                        todayRebate = 0,
                        iplRebate = 0,
                        yesterdayRebate = ${todayRebate},
                        allRebate = allRebate + ${todayRebate}
                    WHERE uid = "${uid}"
            `;

             await ConnectionManager
                .getConnection()
                .query(sql);
            return true;
        } catch (e) {
            console.error(e.stack);
            return false;
        }
    }


    /**
     * 查询玩家 iplRebate 这个 >0  和 todayRebate > 0的玩家
     * @param parameter
     * @param partialEntity
     * @returns
     */
    async getPlayerRebate() {
        try {

            const sql = `
              SELECT
				spa.uid,
                spa.todayRebate,
                spa.iplRebate
              FROM
                Sp_PlayerRebate  AS spa
                WHERE spa.todayRebate > 0 OR spa.iplRebate > 0
            `;

            const res = await ConnectionManager
                .getConnection()
                .query(sql);
            return res;
        } catch (e) {
            console.error(e.stack);
            return false;
        }
    }



}

export default new PlayerRebateMysqlDao();