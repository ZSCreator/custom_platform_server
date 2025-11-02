import {PlatformControlEntity} from "../mysql/entity/PlatformControl.entity";
import PlatformControlMysqlDao from '../mysql/PlatformControl.mysql.dao';
import {RecordTypes} from "../../../services/newControl/constants";
import {getEndTimeOfTheMonth, getStartTimeOfTheDay, getStartTimeOfTheMonth} from "../../../utils/utils";

type Parameter<T> = { [P in keyof T]?: T[P] };

class PlatformControlManager {
    async createOne(parameter: Parameter<PlatformControlEntity>) {
        return PlatformControlMysqlDao.insertOne(parameter);
    }

    /**
     * 获取租户场的一调数据
     * @param platformId
     * @param tenantId
     * @param nid
     * @param sceneId
     */
    async findOneByTenantIdAndSceneId(platformId: string, tenantId: string, nid: string, sceneId: number): Promise<PlatformControlEntity> {
        const result = (await PlatformControlMysqlDao.findOneByTenantIdAndSceneId(platformId, tenantId, nid, sceneId))[0];

        if (!result) {
            return null;
        }

        result.controlStateStatistical = JSON.parse(result.controlStateStatistical);
        result.betPlayersSet = JSON.parse(result.betPlayersSet);
        result.betGoldAmount = parseInt(result.betGoldAmount);
        result.profit = parseInt(result.profit);
        result.serviceCharge = parseInt(result.serviceCharge);

        return result;
    }

    async findOneBySceneId(type: RecordTypes, platformId: string, nid: string, sceneId: number): Promise<PlatformControlEntity> {
        const result = (await PlatformControlMysqlDao.findOneBySceneId(type, platformId, nid, sceneId))[0];

        if (!result) {
            return null;
        }

        result.controlStateStatistical = JSON.parse(result.controlStateStatistical);
        result.betPlayersSet = JSON.parse(result.betPlayersSet);
        result.betGoldAmount = parseInt(result.betGoldAmount);
        result.profit = parseInt(result.profit);
        result.serviceCharge = parseInt(result.serviceCharge);

        return result;
    }

    /**
     * 删除金币等于零的记录
     */
    async deleteGoldEqualsZero() {
        await PlatformControlMysqlDao.deleteMany({type: RecordTypes.SCENE, betGoldAmount: 0, time: getStartTimeOfTheDay()});
        await PlatformControlMysqlDao.deleteMany({type: RecordTypes.TENANT_SCENE, betGoldAmount: 0, time: getStartTimeOfTheDay()});
    }

    /**
     * 获取平台数据
     * @param platformId 平台号
     * @param type 记录类型
     * @param startTime
     * @param endTime
     */
    async getPlatformDataList(type: RecordTypes, platformId: string, startTime: number, endTime: number): Promise<PlatformControlEntity[]> {
        const result =  await PlatformControlMysqlDao.getPlatformByPlatformIdAndTime({platformId, type}, startTime, endTime);


        result.map(r => {
            r.betPlayersSet = JSON.parse(r.betPlayersSet);
            r.controlStateStatistical = JSON.parse(r.controlStateStatistical);
            r.betGoldAmount = parseInt(r.betGoldAmount);
            r.profit = parseInt(r.profit);
            r.serviceCharge = parseInt(r.serviceCharge);
        });

        return result;
    }

    /**
     * 获取租户数据
     * @param platformId 平台号
     * @param tenantId 记录类型
     * @param startTime
     * @param endTime
     */
    async getTenantDataList(platformId: string, tenantId: string, startTime: number, endTime: number): Promise<PlatformControlEntity[]> {
        const result =  await PlatformControlMysqlDao.getPlatformByPlatformIdAndTime({platformId, tenantId, type: RecordTypes.TENANT_SCENE},
            startTime, endTime);


        result.map(r => {
            r.betPlayersSet = JSON.parse(r.betPlayersSet);
            r.controlStateStatistical = JSON.parse(r.controlStateStatistical);
            r.betGoldAmount = parseInt(r.betGoldAmount);
            r.profit = parseInt(r.profit);
            r.serviceCharge = parseInt(r.serviceCharge);
        });

        return result;
    }

    /**
     * 更新所有平台汇总数据
     * @param updateParams
     * @param id
     */
    async updateSummaryData(id: number, updateParams) {
        return PlatformControlMysqlDao.updateSummaryData(id, updateParams);
    }

    /**
     * 获取平台这个月的汇总记录
     */
    async getTotalPlatformDuringTheMonth(month: number): Promise<PlatformControlEntity> {
        const result = (await PlatformControlMysqlDao.findOneByPlatform(null, RecordTypes.ALL,
            getStartTimeOfTheMonth(month), getEndTimeOfTheMonth(month)))[0];

        if (!result) {
            return null;
        }

        result.controlStateStatistical = JSON.parse(result.controlStateStatistical);
        result.betPlayersSet = JSON.parse(result.betPlayersSet);
        result.betGoldAmount = parseInt(result.betGoldAmount);
        result.profit = parseInt(result.profit);
        result.serviceCharge = parseInt(result.serviceCharge);


        return result;
    }

    /**
     * 获取这个月的打码量和账单
     * @param where
     */
    async getMonthlyGameBill(where: {platformId: string, type: RecordTypes, tenantId: string, nid?: string}) {
        const result = (await PlatformControlMysqlDao.getPlatformGameBill(where, getStartTimeOfTheMonth(), getEndTimeOfTheMonth()))[0];
        result.betGoldAmount = Number(result.betGoldAmount);
        result.profit = Number(result.profit);

        return result;
    }
}

export default new PlatformControlManager();