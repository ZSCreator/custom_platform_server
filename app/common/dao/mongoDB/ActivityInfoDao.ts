import MongoManager = require('./lib/mongoManager');

const dao = MongoManager.activity_info;
/**
 * 创建一个活动到数据库
 */
export const findAllActivityInfos = async () => {
    return await dao.find();
};
/**
 * 创建一个活动到数据库
 */
export const findOpenActivityInfos = async () => {
    return await dao.find({ isOpen: true });
};
/**
 * 创建一个活动到数据库
 * @param activityInfo
 */
export const insertActivityInfo = async (activityInfo) => {
    let res = await dao.create(activityInfo);
};
/**
 * 更新活动数据
 * @param activityInfo
 */
export const saveOrUpdateActivityInfo = async (activityInfo) => {
    await dao.updateOne({ id: activityInfo.id }, activityInfo, { upsert: true });
};
/**
 * 删除活动配置活动数据
 * @param id
 */
export const deleteActivityInfo = async (id: string) => {
    await dao.deleteOne({ id: id });
};