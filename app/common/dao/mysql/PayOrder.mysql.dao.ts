import { AbstractDao } from "../ADao.abstract";
import { PayOrder } from "./entity/PayOrder.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class PayOrderMysqlDao extends AbstractDao<PayOrder> {
    async findList(parameter: { id?: number; orderNumber?: string; uid?: string; money?: number; remark?: string; platform?: string; payType?: string; status?: number; field1?: string; shopId?: string; reissue?: boolean; isLock?: boolean; callBackTime?: Date; createDate?: Date, updatedDate?: Date }): Promise<PayOrder[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(PayOrder)
                .find(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: { id?: number; orderNumber?: string; uid?: string; money?: number; remark?: string; platform?: string; payType?: string; status?: number; field1?: string; shopId?: string; reissue?: boolean; isLock?: boolean; callBackTime?: Date; createDate?: Date, updatedDate?: Date }): Promise<PayOrder> {
        try {
            const payOrder = await ConnectionManager.getConnection()
                .getRepository(PayOrder)
                .findOne(parameter);
            return payOrder;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: { id?: number; orderNumber?: string; uid?: string; money?: number; remark?: string; platform?: string; payType?: string; status?: number; field1?: string; shopId?: string; reissue?: boolean; isLock?: boolean; callBackTime?: Date; createDate?: Date, updatedDate?: Date }): Promise<any> {
        try {
            const alarmEventThingRepository = ConnectionManager.getConnection()
                .getRepository(PayOrder);

            const p = alarmEventThingRepository.create(parameter);
            return await alarmEventThingRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter: { id?: number; orderNumber?: string; uid?: string; money?: number; remark?: string; platform?: string; payType?: string; status?: number; field1?: string; shopId?: string; reissue?: boolean; isLock?: boolean; callBackTime?: Date; createDate?: Date, updatedDate?: Date }, partialEntity: { id?: number; orderNumber?: string; uid?: string; money?: number; remark?: string; platform?: string; payType?: string; status?: number; field1?: string; shopId?: string; reissue?: boolean; isLock?: boolean; callBackTime?: Date; createDate?: Date, updatedDate?: Date }): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PayOrder)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: { id?: number; orderNumber?: string; uid?: string; money?: number; remark?: string; platform?: string; payType?: string; status?: number; field1?: string; shopId?: string; reissue?: boolean; isLock?: boolean; callBackTime?: Date; createDate?: Date, updatedDate?: Date }): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PayOrder)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    //根据时间查询分页查询
    async findListToLimitByUid(uid: string, page: number, limit: number): Promise<any> {
        try {
            const [list, count] = await ConnectionManager.getConnection()
                .getRepository(PayOrder)
                .createQueryBuilder("PayOrder")
                .where("PayOrder.fk_uid = :uid AND PayOrder.status = 1", { uid })
                .orderBy("PayOrder.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        } catch (e) {
            return false;
        }
    }

    async findListToLimit(page: number, limit: number): Promise<any> {
        try {
            const [list, count] = await ConnectionManager.getConnection()
                .getRepository(PayOrder)
                .createQueryBuilder("PayOrder")
                // .where(" PayOrder.status = 1")
                .orderBy("PayOrder.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        } catch (e) {
            return false;
        }
    }


}

export default new PayOrderMysqlDao();