import { AbstractDao } from "../ADao.abstract";
import { Announcement } from "./entity/Announcement.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class AnnouncementMysqlDao extends AbstractDao<Announcement> {
    async findList(parameter: {id? : number ,content? : string,openType? : number, sort? : number, title? : string, createDate? : Date}): Promise<Announcement[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(Announcement)
                .find(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: {id? : number ,content? : string,openType? : number, sort? : number, title? : string, createDate? : Date}): Promise<Announcement> {
        try {
            const announcement = await ConnectionManager.getConnection()
                .getRepository(Announcement)
                .findOne(parameter);
            return announcement;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: {id? : number ,content? : string,openType? : number, sort? : number, title? : string, createDate? : Date}): Promise<any> {
        try {
            const dayApiDataRepository = ConnectionManager.getConnection()
                .getRepository(Announcement);

            const p = dayApiDataRepository.create(parameter);
            return await dayApiDataRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{ id? : number ,content? : string,openType? : number, sort? : number, title? : string, createDate? : Date} , partialEntity :{id? : number ,content? : string,openType? : number, sort? : number, title? : string, createDate? : Date} ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(Announcement)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {id? : number ,content? : string,openType? : number, sort? : number, title? : string, createDate? : Date}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(Announcement)
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
                .getRepository(Announcement)
                .createQueryBuilder("Announcement")
                // .where("alarmEventThing.createTime BETWEEN :start AND :end",{start: startTime , end: endTime})
                .orderBy("Announcement.id","DESC")
                .getManyAndCount();
            return  {list ,count};
        } catch (e) {
            return false;
        }
    }


}

export default new AnnouncementMysqlDao();