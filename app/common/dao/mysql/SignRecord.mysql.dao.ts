import { AbstractDao } from "../ADao.abstract";
import { SignRecord } from "./entity/SignRecord.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

type ISignRecord= { id?: number; uid?: string; type?: number; beginGold?: number; lastGold?: number; gold?: number}

export class SignRecordMysqlDao extends AbstractDao<SignRecord> {
    async findList(parameter: ISignRecord): Promise<SignRecord[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(SignRecord)
                .find(parameter);

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: ISignRecord): Promise<SignRecord> {
        try {
            const signRecord = await ConnectionManager.getConnection()
                .getRepository(SignRecord)
                .findOne(parameter);

            return signRecord;
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter: ISignRecord, partialEntity: ISignRecord): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(SignRecord)
                .update(parameter, partialEntity);

            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async insertOne(parameter: ISignRecord): Promise<any> {
        try {
            const playerRepository = ConnectionManager.getConnection()
                .getRepository(SignRecord);

            const p = playerRepository.create(parameter);

            return await playerRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async delete(parameter: ISignRecord): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(SignRecord)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }


    /** 前端获取玩家最新的一条签到记录 */
    async findSignToUid(uid:string) {
        try {

            const result = await ConnectionManager.getConnection(true)
                .getRepository(SignRecord)
                .createQueryBuilder("SignRecord")
                .where(`SignRecord.uid = ${uid}`)
                .orderBy("SignRecord.id", "DESC")
                .getOne();
            return result ;
        } catch (e) {
            return null ;
        }
    }


    /** 前端获取玩家最新的一周签到记录 */
    async findPlayerWeekSign(uid:string , startTime : string) {
        try {

            const list = await ConnectionManager.getConnection(true)
                .getRepository(SignRecord)
                .createQueryBuilder("SignRecord")
                .where(`SignRecord.uid = ${uid}`)
                .andWhere(`SignRecord.createDate >= "${startTime}"`)
                .orderBy("SignRecord.id", "DESC")
                .getMany();
            return list ;
        } catch (e) {
            return [] ;
        }
    }


    /**
     *  删除一个月前的玩家返佣记录
     * @param parameter
     * @param partialEntity
     * @returns
     */
    async deleteSignRecord(time : string) {
        try {

            const sql = `
					DELETE 
					from 
					Sp_SignRecord
	 				where
                    Sp_SignRecord.createDate < "${time}"
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



}

export default new SignRecordMysqlDao();
