import { AbstractDao } from "../ADao.abstract";
import { ShopGold } from "./entity/ShopGold.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class ShopGoldMysqlDao extends AbstractDao<ShopGold> {
    async findList(parameter: {id? : number ,name? : string,dese? : string, price? : number, language? : string, sort? : number,isOpen? : boolean,gold? : number ,createDate? : Date,}): Promise<ShopGold[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(ShopGold)
                .find(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: {id? : number ,name? : string,dese? : string, price? : number, language? : string, sort? : number,isOpen? : boolean,gold? : number ,createDate? : Date,}): Promise<ShopGold> {
        try {
            const shopGold = await ConnectionManager.getConnection()
                .getRepository(ShopGold)
                .findOne(parameter);
            return shopGold;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: {id? : number ,name? : string,dese? : string, price? : number, language? : string, sort? : number,isOpen? : boolean,gold? : number ,createDate? : Date,}): Promise<any> {
        try {
            const shopGoldRepository = ConnectionManager.getConnection()
                .getRepository(ShopGold);

            const p = shopGoldRepository.create(parameter);
            return await shopGoldRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{id? : number ,name? : string,dese? : string, price? : number, language? : string, sort? : number,isOpen? : boolean,gold? : number ,createDate? : Date,} , partialEntity :{ id? : number ,name? : string,dese? : string, price? : number, language? : string, sort? : number,isOpen? : boolean,gold? : number ,createDate? : Date,} ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(ShopGold)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {id? : number ,name? : string,dese? : string, price? : number, language? : string, sort? : number,isOpen? : boolean,gold? : number ,createDate? : Date,}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(ShopGold)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    //根据时间查询分页查询
    async findListToLimit(page : number , limit : number , startTime : Date , endTime: Date ): Promise<any> {
        try {
            const result = await ConnectionManager.getConnection()
                .getRepository(ShopGold)
                .createQueryBuilder("ShopGold")
                .where("ShopGold.createDate BETWEEN :start AND :end",{start: startTime , end: endTime})
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            console.warn("result",result)
            return  null;
        } catch (e) {
            return false;
        }
    }

}

export default new ShopGoldMysqlDao();