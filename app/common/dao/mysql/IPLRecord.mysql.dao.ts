import { AbstractDao } from "../ADao.abstract";
import { IPLRecord } from "./entity/IPLRecord.entity";
import ConnectionManager from "../mysql/lib/connectionManager";
import * as moment from "moment";

export class IPLRecordMysqlDao extends AbstractDao<IPLRecord>{
    findList(parameter: { id?: number; uid?: string; userId?: string; transfer_id?: string; customer_ref?: string; merchant_code?: string; wallet_log_id?: string; old_balance?: number; new_balance?: number; type?: string; change?: number; createTime?: Date; }): Promise<IPLRecord[]> {
        throw new Error("Method not implemented.");
    }
    findOne(parameter: { id?: number; uid?: string; userId?: string; transfer_id?: string; customer_ref?: string; merchant_code?: string; wallet_log_id?: string; old_balance?: number; new_balance?: number; type?: string; change?: number; createTime?: Date; }): Promise<IPLRecord> {
        throw new Error("Method not implemented.");
    }
    async insertOne(parameter: { id?: number; uid?: string; userId?: string; transfer_id?: string; customer_ref?: string; merchant_code?: string; wallet_log_id?: string; old_balance?: number; new_balance?: number; type?: string; change?: number; createTime?: Date; }): Promise<any> {
        try {
            const recordRepository = ConnectionManager.getConnection()
                .getRepository(IPLRecord);

            const p = recordRepository.create(parameter);

            return await recordRepository.save(p);
        } catch (e) {
            return null;
        }
    }
    delete(parameter: { id?: number; uid?: string; userId?: string; transfer_id?: string; customer_ref?: string; merchant_code?: string; wallet_log_id?: string; old_balance?: number; new_balance?: number; type?: string; change?: number; createTime?: Date; }): Promise<any> {
        throw new Error("Method not implemented.");
    }

    async findLastOneByUid(uid: string) {
        try {
            return await ConnectionManager.getConnection()
                .getRepository(IPLRecord)
                .createQueryBuilder("record")
                .where("record.uid = :uid", { uid })
                .andWhere("record.type = :deposit", { deposit: "deposit" })
                .orderBy("record.createTime", "DESC")
                .getOne();
        } catch (e) {
            return false;
        }
    }

}

export default new IPLRecordMysqlDao();