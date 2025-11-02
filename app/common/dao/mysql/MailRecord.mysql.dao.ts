import { AbstractDao } from "../ADao.abstract";
import { MailRecord } from "./entity/MailRecord.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class MailRecordMysqlDao extends AbstractDao<MailRecord> {
    async findList(parameter: {id? : number ,uid? : string,sender? : string, type? : number, name? : string, content? : string,gold? : number, isRead? : boolean,isDelete? : boolean,createDate? : Date,updatedDate? : Date}): Promise<MailRecord[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(MailRecord)
                .find(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: { id? : number ,uid? : string,sender? : string, type? : number, name? : string, content? : string,gold? : number, isRead? : boolean,isDelete? : boolean,createDate? : Date,updatedDate? : Date}): Promise<MailRecord> {
        try {
            const mailRecords = await ConnectionManager.getConnection()
                .getRepository(MailRecord)
                .findOne(parameter);
            return mailRecords;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: { id? : number ,uid? : string,sender? : string, type? : number, name? : string, content? : string,gold? : number, isRead? : boolean,isDelete? : boolean,createDate? : Date,updatedDate? : Date }): Promise<any> {
        try {
            const mailRecordsRepository = ConnectionManager.getConnection()
                .getRepository(MailRecord);

            const p = mailRecordsRepository.create(parameter);
            return await mailRecordsRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{ id? : number ,uid? : string,sender? : string, type? : number, name? : string, content? : string,gold? : number, isRead? : boolean,isDelete? : boolean,createDate? : Date,updatedDate? : Date} , partialEntity :{ id? : number ,uid? : string,sender? : string, type? : number, name? : string, content? : string,gold? : number, isRead? : boolean,isDelete? : boolean,createDate? : Date,updatedDate? : Date } ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(MailRecord)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {id? : number ,uid? : string,sender? : string, type? : number, name? : string, content? : string,gold? : number, isRead? : boolean,isDelete? : boolean,createDate? : Date,updatedDate? : Date}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(MailRecord)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    //根据时间查询分页查询
    async findListToLimit(uid: string ,page : number , limit : number ): Promise<any> {
        try {
            const [list ,count] = await ConnectionManager.getConnection(true)
                .getRepository(MailRecord)
                .createQueryBuilder("MailRecord")
                .where("MailRecord.uid = :uid" , {uid : uid })
                .orderBy("MailRecord.id","DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return  {list ,count};
        } catch (e) {
            return false;
        }
    }
    // isDelete  = false
    //根据时间查询分页查询  倒序
    //返回的result =  [  list, count ]
    //列子 const [  list, count] = await Dao.findListToLimitNoTime(1, 20 , 0);
    async findListToLimitNoTime(uid : string  ): Promise<any> {
        try {
            const  [list ,count]  = await ConnectionManager.getConnection(true)
                .getRepository(MailRecord)
                .createQueryBuilder("MailRecord")
                .where("MailRecord.uid = :uid" , {uid : uid })
                // .orderBy("MailRecord.id","DESC")
                // .skip((page - 1) * limit)
                // .take( limit)
                .getManyAndCount();
            return  {list ,count} ;
        } catch (e) {
            return false;
        }
    }

    // isRead  = false
    //根据时间查询分页查询  倒序
    //返回的result =  [  list, count ]
    //列子 const [  list, count] = await Dao.findListToLimitNoTime(1, 20 , 0);
    async findListToLimitNoTimeForNoRead(uid : string): Promise<any> {
        try {
            const  count  = await ConnectionManager.getConnection(true)
                .getRepository(MailRecord)
                .createQueryBuilder("MailRecord")
                .where("MailRecord.uid = :uid" , {uid : uid })
                .andWhere("MailRecord.isRead = :isRead" , {isRead : false })
                .getCount() ;
            return count ;
        } catch (e) {
            return false;
        }
    }

}

export default new MailRecordMysqlDao();