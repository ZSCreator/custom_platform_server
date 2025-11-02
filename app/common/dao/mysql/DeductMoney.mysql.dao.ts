import { AbstractDao } from "../ADao.abstract";
import { DeductMoney } from "./entity/DeductMoney.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class DeductMoneyMysqlDao extends AbstractDao<DeductMoney> {
    async findList(parameter: {id?: number; total_fee?: number; walletGoldToGold?: number; uid?: string;  remark?: string;addGold?: number; gold?: number;customerId?: string;lastGold?: number;lastWalletGold?: number;createDate?: Date;}): Promise<DeductMoney[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(DeductMoney)
                .find(parameter);

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: {id?: number; total_fee?: number; walletGoldToGold?: number; uid?: string;  remark?: string;addGold?: number; gold?: number;customerId?: string;lastGold?: number;lastWalletGold?: number;createDate?: Date;}): Promise<DeductMoney> {
        try {
            const deductMoney = await ConnectionManager.getConnection(true)
                .getRepository(DeductMoney)
                .findOne(parameter);

            return deductMoney;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: { id?: number; total_fee?: number; walletGoldToGold?: number; uid?: string;  remark?: string;addGold?: number; gold?: number;customerId?: string;lastGold?: number;lastWalletGold?: number;createDate?: Date;}): Promise<any> {
        try {
            const deductMoneyRepository = ConnectionManager.getConnection()
                .getRepository(DeductMoney);

            const p = deductMoneyRepository.create(parameter);
            return await deductMoneyRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{id?: number; total_fee?: number; walletGoldToGold?: number; uid?: string;  remark?: string;addGold?: number; gold?: number;customerId?: string;lastGold?: number;lastWalletGold?: number;createDate?: Date;} , partialEntity :{ id?: number; total_fee?: number; walletGoldToGold?: number; uid?: string;  remark?: string;addGold?: number; gold?: number;customerId?: string;lastGold?: number;lastWalletGold?: number;createDate?: Date;} ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(DeductMoney)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {id?: number; total_fee?: number; walletGoldToGold?: number; uid?: string;  remark?: string;addGold?: number; gold?: number;customerId?: string;lastGold?: number;lastWalletGold?: number;createDate?: Date;}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(DeductMoney)
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
            const [list ,count ] = await ConnectionManager.getConnection(true)
                .getRepository(DeductMoney)
                .createQueryBuilder("deductMoney")
                .orderBy("deductMoney.id","DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return  {list ,count};
        } catch (e) {
            return false;
        }
    }

}

export default new DeductMoneyMysqlDao();