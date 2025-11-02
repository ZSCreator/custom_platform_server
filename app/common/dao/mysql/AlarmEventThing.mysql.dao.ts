import { AbstractDao } from "../ADao.abstract";
import { AlarmEventThing } from "./entity/AlarmEventThing.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class AlarmEventThingMysqlDao extends AbstractDao<AlarmEventThing> {
    async findList(parameter: {id? : number ,uid? : string,thirdUid? : string, gameName? : string, nid? : string, thingType? : number,type? : number, status? : number,input? : number,win? : number,oneWin? : number,oneAddRmb? : number, dayWin? : number,sceneId? : number,managerId? : string , createTime? : Date ,updatedDate ?: Date}): Promise<AlarmEventThing[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(AlarmEventThing)
                .find(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: {id? : number ,uid? : string,thirdUid? : string, gameName? : string, nid? : string, thingType? : number,type? : number, status? : number,input? : number,win? : number,oneWin? : number,oneAddRmb? : number, dayWin? : number,sceneId? : number,managerId? : string}): Promise<AlarmEventThing> {
        try {
            const alarmEventThing = await ConnectionManager.getConnection(true)
                .getRepository(AlarmEventThing)
                .findOne(parameter);
            return alarmEventThing;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: {id? : number ,uid? : string,thirdUid? : string, gameName? : string, nid? : string, thingType? : number,type? : number, status? : number,input? : number,win? : number,oneWin? : number,oneAddRmb? : number, dayWin? : number,sceneId? : number,managerId? : string}): Promise<any> {
        try {

            /** step2 mysql生成预警记录*/
            const alarmEventThingRepository = ConnectionManager.getConnection()
                .getRepository(AlarmEventThing);

            const p = alarmEventThingRepository.create(parameter);
            return await alarmEventThingRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{ id? : number ,uid? : string,thirdUid? : string, gameName? : string, nid? : string, thingType? : number,type? : number, status? : number,input? : number,win? : number,oneWin? : number,oneAddRmb? : number, dayWin? : number,sceneId? : number,managerId? : string} , partialEntity :{ id? : number ,uid? : string,thirdUid? : string, gameName? : string, nid? : string, thingType? : number,type? : number, status? : number,input? : number,win? : number,oneWin? : number,oneAddRmb? : number, dayWin? : number,sceneId? : number,managerId? : string} ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(AlarmEventThing)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(AlarmEventThing)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    //根据时间查询分页查询
    async findListToLimit(page : number , limit : number  ): Promise<any> {
        try {
            const [list ,count] = await ConnectionManager.getConnection(true)
                .getRepository(AlarmEventThing)
                .createQueryBuilder("alarmEventThing")
                // .where("alarmEventThing.createTime BETWEEN :start AND :end",{start: startTime , end: endTime})
                .orderBy("alarmEventThing.id","DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return  {list ,count};
        } catch (e) {
            return false;
        }
    }
    // status  = 0为未处理 1 为已处理
    //根据时间查询分页查询  倒序
    //返回的result =  [  list, count ]
    //列子 const [  list, count] = await Dao.findListToLimitNoTime(1, 20 , 0);
    async findListToLimitNoTime(page : number , limit : number , status : number ): Promise<any> {
        try {
            const  [list ,count]  = await ConnectionManager.getConnection(true)
                .getRepository(AlarmEventThing)
                .createQueryBuilder("alarmEventThing")
                .where("alarmEventThing.status = :status" , {status : status })
                .orderBy("alarmEventThing.id","DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return  {list ,count} ;
        } catch (e) {
            return false;
        }
    }

    // status  = 0为未处理 1 为已处理
    //根据时间查询分页查询  倒序
    //返回的result =  [  list, count ]
    //列子 const [  list, count] = await Dao.findListToLimitNoTime(1, 20 , 0);
    async findListToLimitStatus(status : number ): Promise<any> {
        try {
            const  count  = await ConnectionManager.getConnection(true)
                .getRepository(AlarmEventThing)
                .createQueryBuilder("alarmEventThing")
                .where("alarmEventThing.status = :status" , {status : status })
                .getCount();
            return  count ;
        } catch (e) {
            return 0;
        }
    }


    /**
     * 删除一段时间的数据
     */
    async deletData(startTime : string ): Promise<any> {
        try {
            await ConnectionManager.getConnection()
                .createQueryBuilder()
                .delete()
                .from(AlarmEventThing)
                .where(`Sp_AlarmEventThing.createDate < "${startTime}" ` )
                .execute();
            return  true;
        } catch (e) {
            return false;
        }
    }

}

export default new AlarmEventThingMysqlDao();