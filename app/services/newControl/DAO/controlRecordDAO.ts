import {ControlRecord} from "../../../common/dao/mysql/entity/ControlRecord.entity";
import ConnectionManager from "../../../common/dao/mysql/lib/connectionManager";

// const model: Model<Document> = mongoManager.control_record;

/**
 * 调控记录类型
 * @property PERSONAL 个人调控
 * @property TOTAL_PERSONAL 个人调控总控
 * @property SCENE 场控
 * @property BANKER 庄杀
 * @property LOCK_JACKPOT 修改奖池锁定
 * @property REMOVE_TOTAL_PERSONAL 删除个人总控玩家
 * @property REMOVE_PERSONAL 删除游戏精控玩家
 * @property TENANT_GAME_SCENE 租户游戏场控
 * @property REMOVE_TENANT_GAME_SCENE 移除租户游戏场控
 * @property CHANGE_PLATFORM_KILL_RATE 改变平台或者平台游戏杀率
 * @property CHANGE_TENANT_KILL_RATE 改变租户或者租户游戏杀率
 */
export enum ControlRecordType {
    PERSONAL = '1',
    TOTAL_PERSONAL = '2',
    SCENE = '3',
    BANKER = '4',
    LOCK_JACKPOT = '5',
    REMOVE_TOTAL_PERSONAL = '6',
    REMOVE_PERSONAL = '7',
    TENANT_GAME_SCENE = '8',
    REMOVE_TENANT_GAME_SCENE = '9',
    CHANGE_PLATFORM_KILL_RATE = '10',
    CHANGE_TENANT_KILL_RATE = '11',
}

/**
 * 调控记录
 */
export interface IControlRecord {
    name: string,                                // 操作人的名字
    type: ControlRecordType,                     // 调控记录类型
    remark: string,                              // 调控备注
    data: object,                                // 调控数据详情
    uid?: string,                                // 被调控的玩家uid
    nid?: string,                                // 调控的游戏nid 可能为空
    createTime?: number,                         // 创建时间
}

/**
 * 创建一条记录
 * @param params
 */
export async function addRecord(params: IControlRecord): Promise<boolean> {
    const repository = ConnectionManager.getConnection().getRepository(ControlRecord);
    const record = repository.create(params);
    await repository.save(record);

    return true;
}

/**
 * 获取多条记录
 * @param where 查询条件
 * @param page 第几页
 * @param count 记录条数
 * @param timeSort 时间排序 -1 默认倒序 1为正序
 */
export async function getRecords(where: any, page: number, count: number, timeSort: -1|1 = -1): Promise<any> {
    if (Object.keys(where).length) {
        let str;
        if (where.uid && where.nid) {
            str = "record.uid = :uid AND record.game_id = :nid";
        } else if (where.uid) {
            str = "record.uid = :uid"
        } else {
            str = "record.game_id = :nid"
        }

        return ConnectionManager.getConnection()
            .getRepository(ControlRecord)
            .createQueryBuilder('record')
            .where(str, where)
            .orderBy({"record.createTime": "DESC"})
            .skip(page * count)
            .take(count)
            .getManyAndCount();
    }

    return ConnectionManager.getConnection()
        .getRepository(ControlRecord)
        .createQueryBuilder('record')
        .orderBy({"record.createTime": "DESC"})
        .skip(page * count)
        .take(count)
        .getManyAndCount();
}

/**
 * 获取查询条件的统计个数
 * @param where
 */
export async function recordsCount(where: any): Promise<number> {
    return  ConnectionManager.getConnection()
        .getRepository(ControlRecord)
        .createQueryBuilder('record')
        .getCount();
}