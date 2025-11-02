import { AbstractDao } from "../ADao.abstract";
import { PlatformForAgentGold } from "./entity/PlatformForAgentGold.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class ThirdGoldRecordMysqlDao extends AbstractDao<PlatformForAgentGold> {
    async findList(parameter: {id?: number; userName? : string ; platformName?: string; agentName?: string; goldChangeBefore?: number;  gold?: number;goldChangeAfter?: number; remark?: string;createDate?: Date;}): Promise<PlatformForAgentGold[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(PlatformForAgentGold)
                .find(parameter);

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: {id?: number; userName? : string ; platformName?: string; agentName?: string; goldChangeBefore?: number;  gold?: number;goldChangeAfter?: number; remark?: string;createDate?: Date;}): Promise<PlatformForAgentGold> {
        try {
            const platformForAgentGold = await ConnectionManager.getConnection()
                .getRepository(PlatformForAgentGold)
                .findOne(parameter);

            return platformForAgentGold;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: { id?: number; userName? : string ; platformName?: string; agentName?: string; goldChangeBefore?: number;  gold?: number;goldChangeAfter?: number; remark?: string;createDate?: Date; }): Promise<any> {
        try {

            const thirdGoldRecordRepository = ConnectionManager.getConnection()
                .getRepository(PlatformForAgentGold);

            const p = thirdGoldRecordRepository.create(parameter);
            return await thirdGoldRecordRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{id?: number; userName? : string ; platformName?: string; agentName?: string; goldChangeBefore?: number;  gold?: number;goldChangeAfter?: number; remark?: string;createDate?: Date;} , partialEntity :{ id?: number; userName? : string ; platformName?: string; agentName?: string; goldChangeBefore?: number;  gold?: number;goldChangeAfter?: number; remark?: string;createDate?: Date;} ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PlatformForAgentGold)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {id?: number; userName? : string ; platformName?: string; agentName?: string; goldChangeBefore?: number;  gold?: number;goldChangeAfter?: number; remark?: string;createDate?: Date;}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PlatformForAgentGold)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }






    //根据时间查询分页查询  倒序
    async findListToLimitNoTime( page : number , limit : number  ): Promise<any> {
        try {
            const [list ,count] = await ConnectionManager.getConnection()
                .getRepository(PlatformForAgentGold)
                .createQueryBuilder("PlatformForAgentGold")
                .orderBy("PlatformForAgentGold.id","DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return  {list ,count};
        } catch (e) {
            console.warn(e)
            return false;
        }
    }

    //根据uid 惊醒查询 最近得一条记录
    async findListForUid(uid : string ,page : number , limit : number): Promise<any> {
        try {
            const [list ,count] = await ConnectionManager.getConnection()
                .getRepository(PlatformForAgentGold)
                .createQueryBuilder("PlatformForAgentGold")
                .where("PlatformForAgentGold.uid = :uid" , {uid : uid })
                .orderBy("PlatformForAgentGold.id","DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return  {list ,count};
        } catch (e) {
            return false;
        }
    }


    // //查看平台给代理添加金币的记录
    // async getPlatformToAgentGoldRecordList( managerAgent : string ,page : number , limit : number): Promise<any> {
    //     try {
    //         const [list ,count] = await ConnectionManager.getConnection()
    //             .getRepository(PlatformForAgentGold)
    //             .createQueryBuilder("PlatformForAgentGold")
    //             .where("PlatformForAgentGold.type = :type" , {type : 2 })
    //             .andWhere("PlatformForAgentGold.agentRemark  IN (:...agentRemarks)", { agentRemarks: agentList })
    //             .orderBy("PlatformForAgentGold.id","DESC")
    //             .skip((page - 1) * limit)
    //             .take( limit)
    //             .getManyAndCount();
    //
    //         return  {list ,count};
    //     } catch (e) {
    //         return false;
    //     }
    // }



    //查看平台给代理添加金币的记录
    async getPlatformToAgentGoldRecordList(platformName : string , page : number , limit : number): Promise<any> {
        try {
            const [list ,count] = await ConnectionManager.getConnection(true)
                .getRepository(PlatformForAgentGold)
                .createQueryBuilder("PlatformForAgentGold")
                .where("PlatformForAgentGold.platformName = :platformName" , {platformName : platformName })
                .orderBy("PlatformForAgentGold.id","DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();

            return  {list ,count};
        } catch (e) {
            return false;
        }
    }



    //查看平台给代理添加金币的记录
    async searchPlatformToAgentGoldRecordList(platformName : string , agentSearch : string , page : number , limit : number): Promise<any> {
        try {
            const [list ,count] = await ConnectionManager.getConnection(true)
                .getRepository(PlatformForAgentGold)
                .createQueryBuilder("PlatformForAgentGold")
                .where("PlatformForAgentGold.agentName = :agentName" , {agentName : agentSearch })
                .orderBy("PlatformForAgentGold.id","DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();

            return  {list ,count};
        } catch (e) {
            return false;
        }
    }












}

export default new ThirdGoldRecordMysqlDao();