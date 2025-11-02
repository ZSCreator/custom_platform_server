import { AbstractDao } from "../ADao.abstract";
import { PromoteDown } from "./entity/PromoteDown.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class PromoteDownMysqlDao extends AbstractDao<PromoteDown> {
    async findList(parameter: {id? : number ,inviteCode? : string,platformName? : string, rom_type? : string, status? : number, phoneId? : string, createDate? : Date}): Promise<PromoteDown[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(PromoteDown)
                .find(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: {id? : number ,inviteCode? : string,platformName? : string, rom_type? : string, status? : number, phoneId? : string, createDate? : Date}): Promise<PromoteDown> {
        try {
            const promoteDownOne = await ConnectionManager.getConnection(true)
                .getRepository(PromoteDown)
                .findOne(parameter);
            return promoteDownOne;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: {id? : number ,inviteCode? : string,platformName? : string, rom_type? : string, status? : number, phoneId? : string, createDate? : Date}): Promise<any> {
        try {
            const dayApiDataRepository = ConnectionManager.getConnection()
                .getRepository(PromoteDown);

            const p = dayApiDataRepository.create(parameter);
            return await dayApiDataRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{ id? : number ,inviteCode? : string,platformName? : string, rom_type? : string, status? : number, phoneId? : string, createDate? : Date} , partialEntity :{id? : number ,inviteCode? : string,platformName? : string, rom_type? : string, status? : number, phoneId? : string, createDate? : Date} ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PromoteDown)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {id? : number ,inviteCode? : string,platformName? : string, rom_type? : string, status? : number, phoneId? : string, createDate? : Date}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PromoteDown)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    //根据时间查询分页查询
    async findListToLimit( ): Promise<any> {
        try {
            const [list ,count] = await ConnectionManager.getConnection(true)
                .getRepository(PromoteDown)
                .createQueryBuilder("PromoteDown")
                // .where("alarmEventThing.createTime BETWEEN :start AND :end",{start: startTime , end: endTime})
                .orderBy("PromoteDown.id","DESC")
                .getManyAndCount();
            return  {list ,count};
        } catch (e) {
            return false;
        }
    }


}

export default new PromoteDownMysqlDao();