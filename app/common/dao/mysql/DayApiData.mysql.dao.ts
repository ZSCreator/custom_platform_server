import { AbstractDao } from "../ADao.abstract";
import { DayApiData } from "./entity/DayApiData.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class AlarmEventThingMysqlDao extends AbstractDao<DayApiData> {
    async findList(parameter: {id? : number ,createDate? : Date ,maxOnline? : number, selfGold? : number ,entryGold? : number ,leaveGold? : number , loginLength? : number,createLength? : number, betNum? : number, backRate? : number, entryAndLeave? : number}): Promise<DayApiData[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(DayApiData)
                .find(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: {id? : number ,createDate? : Date , maxOnline? : number, selfGold? : number ,entryGold? : number ,leaveGold? : number , loginLength? : number,createLength? : number, betNum? : number, backRate? : number, entryAndLeave? : number}): Promise<DayApiData> {
        try {
            const dayApiData = await ConnectionManager.getConnection()
                .getRepository(DayApiData)
                .findOne(parameter);
            return dayApiData;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: {id? : number ,createDate? : Date ,maxOnline? : number, selfGold? : number ,entryGold? : number ,leaveGold? : number , loginLength? : number,createLength? : number, betNum? : number, backRate? : number, entryAndLeave? : number}): Promise<any> {
        try {
            const dayApiDataRepository = ConnectionManager.getConnection()
                .getRepository(DayApiData);

            const p = dayApiDataRepository.create(parameter);
            return await dayApiDataRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{ id? : number , createDate? : Date , maxOnline? : number, selfGold? : number ,entryGold? : number ,leaveGold? : number , loginLength? : number,createLength? : number, betNum? : number, backRate? : number, entryAndLeave? : number} , partialEntity :{id? : number ,createDate? : Date , maxOnline? : number, selfGold? : number ,loginLength? : number,createLength? : number, betNum? : number, backRate? : number, entryAndLeave? : number} ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(DayApiData)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(DayApiData)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    //根据时间查询分页查询
    async findListToLimit(startTime : string , endTime : string ): Promise<any> {
        try {
            const [list ,count] = await ConnectionManager.getConnection(true)
                .getRepository(DayApiData)
                .createQueryBuilder("DayApiData")
                .where("DayApiData.createDate BETWEEN :start AND :end",{start: startTime , end: endTime})
                .getManyAndCount();
            return  {list ,count};
        } catch (e) {
            return false;
        }
    }


}

export default new AlarmEventThingMysqlDao();