import { AbstractDao } from "../ADao.abstract";
import { WalletRecord } from "./entity/WalletRecord.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class WalletRecordMysqlDao extends AbstractDao<WalletRecord> {
    async findList(parameter: {id? : number ,uid? : string,op_type? : number, changed_gold? : number, curr_gold? : number, curr_wallet_gold? : number,createDate? : Date,}): Promise<WalletRecord[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(WalletRecord)
                .find(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: {id? : number ,uid? : string,op_type? : number, changed_gold? : number, curr_gold? : number, curr_wallet_gold? : number,createDate? : Date,}): Promise<WalletRecord> {
        try {
            const walletRecord = await ConnectionManager.getConnection()
                .getRepository(WalletRecord)
                .findOne(parameter);
            return walletRecord;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: {id? : number ,uid? : string,op_type? : number, changed_gold? : number, curr_gold? : number, curr_wallet_gold? : number,createDate? : Date,}): Promise<any> {
        try {
            const walletRecordRepository = ConnectionManager.getConnection()
                .getRepository(WalletRecord);

            const p = walletRecordRepository.create(parameter);
            return await walletRecordRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{ id? : number ,uid? : string,op_type? : number, changed_gold? : number, curr_gold? : number, curr_wallet_gold? : number,createDate? : Date,} , partialEntity :{ id? : number ,uid? : string,op_type? : number, changed_gold? : number, curr_gold? : number, curr_wallet_gold? : number,createDate? : Date,} ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(WalletRecord)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(WalletRecord)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }



    //定时清理红包记录
    async findListToLimit(page : number , limit : number , startTime : Date , endTime: Date ): Promise<any> {
        try {
            const [list ,count] = await ConnectionManager.getConnection(true)
                .getRepository(WalletRecord)
                .createQueryBuilder("WalletRecord")
                .where("WalletRecord.createDate BETWEEN :start AND :end",{start: startTime , end: endTime})
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return  {list ,count};
        } catch (e) {
            return false;
        }
    }


    /**
     * 删除一段时间的数据
     */
    async deletData(startTime : string ): Promise<any> {
        try {
            const list = await ConnectionManager.getConnection()
                .createQueryBuilder()
                .delete()
                .from(WalletRecord)
                .where(`Sp_WalletRecord.createDate < "${startTime}"` )
                .execute();
            return  list;
        } catch (e) {
            return false;
        }
    }


}

export default new WalletRecordMysqlDao();