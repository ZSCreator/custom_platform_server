import { AbstractDao } from "../ADao.abstract";
import { GameCommission } from "./entity/GameCommission.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class GameCommissionMysqlDao  extends AbstractDao<GameCommission> {
    async findList(parameter: {id?: number; nid?: string;  walletGoldToGold?: number; uid?: string;  way?: number;targetCharacter?: number; bet?: number;win?: number;settle?: number;open?: boolean;}): Promise<GameCommission[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(GameCommission)
                .find(parameter);

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: {id?: number; nid?: string;  walletGoldToGold?: number; uid?: string;  way?: number;targetCharacter?: number; bet?: number;win?: number;settle?: number;open?: boolean;}): Promise<GameCommission> {
        try {
            const gameCommission = await ConnectionManager.getConnection(true)
                .getRepository(GameCommission)
                .findOne(parameter);

            return gameCommission;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: { id?: number; nid?: string;   walletGoldToGold?: number; uid?: string;  way?: number;targetCharacter?: number; bet?: number;win?: number;settle?: number;open?: boolean;}): Promise<any> {
        try {
            const deductMoneyRepository = ConnectionManager.getConnection()
                .getRepository(GameCommission);

            const p = deductMoneyRepository.create(parameter);
            return await deductMoneyRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{id?: number; nid?: string;  walletGoldToGold?: number; uid?: string;  way?: number;targetCharacter?: number; bet?: number;win?: number;settle?: number;open?: boolean;} , partialEntity :{ id?: number; nid?: string;  walletGoldToGold?: number; uid?: string;  way?: number;targetCharacter?: number; bet?: number;win?: number;settle?: number;open?: boolean;} ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(GameCommission)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {id?: number; nid?: string;  walletGoldToGold?: number; uid?: string;  way?: number;targetCharacter?: number; bet?: number;win?: number;settle?: number;open?: boolean;}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(GameCommission)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }


    //根据时间查询分页查询  倒序
    //返回的result =  [  list, count ]
    //列子 const [  list, count] = await Dao.findListToLimitNoTime(1, 20 , 0);
    async findListToLimitNoTime(page : number , limit : number  ): Promise<any> {
        try {
            const result = await ConnectionManager.getConnection(true)
                .getRepository(GameCommission)
                .createQueryBuilder("GameCommission")
                .orderBy("GameCommission.id","DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return  result;
        } catch (e) {
            return false;
        }
    }

}

export default new GameCommissionMysqlDao();