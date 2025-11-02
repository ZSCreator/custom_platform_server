import mongoManager = require('./lib/mongoManager');
const realityVideoUserInfoDao = mongoManager.reality_video_user_info;
const gameRecordDao = mongoManager.game_record;

export default class RealityVideoDao {
  /**
   * 查询视讯玩家信息
   * @param uid
   * @return {Promise<boolean>}
   */
  static async findUser(uid: string): Promise<any> {
    try {
      const hasUserInfo = await realityVideoUserInfoDao.findOne({ uid });
      return hasUserInfo;
    } catch (e) {
      console.error(`真人视讯|RealityVideoDao|findUser|查询用户出错:${e.stack}`);
      return false;
    }
  }

  /**
   * 
   * @param username 真人视讯用户名
   * @description 针对新需求补充函数：计算返利
   */
  static async findUserByUserName(username: string) {
    try {
      const hasUserInfo = await realityVideoUserInfoDao.findOne({ username });
      return hasUserInfo;
    } catch (e) {
      console.error(`真人视讯|RealityVideoDao|findUser|查询用户出错:${e.stack}`);
      return false;
    }
  }

  /**
   * 新增视讯玩家信息
   * @param uid
   * @param username
   * @param password
   * @param ratio_switch
   * @param ratio
   * @param ratio_setting
   * @param integral
   * @param lastLoginTime
   * @param createDateTime
   * @param updateDateTime
   * @param isDemoAccount
   * @return {Promise<void>}
   */
  static async saveOne({ uid, username, password, ratio_switch = 1, ratio = 0.5, ratio_setting = 0, integral = 0, lastLoginTime = Date.now(), createDateTime = Date.now(), updateDateTime = null, isDemoAccount = 1, nickname }) {
    try {
      const recordBody = {
        uid,
        username,
        password,
        ratio_switch,
        ratio,
        ratio_setting,
        integral,
        lastLoginTime,
        createDateTime,
        updateDateTime,
        isDemoAccount,
        nickname
      };
      await realityVideoUserInfoDao.create(recordBody);
    } catch (e) {
      console.error(`真人视讯|RealityVideoDao|saveOne|新增用户出错:${e.stack}`);
    }
  }

  static async updateOne({ _id }, params = {}) {
    if (Object.keys(params).length === 0) return;
    await realityVideoUserInfoDao.updateOne({ _id }, params);
  };

  /**
   *
   * @param {Object} uid:string,nid:string,playStatus:Number
   * @param {Object} otherParam (可选) game_record 其他列
   * @param {Object} ?:otherParam
   * @return {Promise<boolean>}
   */
  static async findOneGameRecord({ uid, nid, playStatus = 0 }, otherParam = {}) {
    try {
      let bodyData = { uid, nid, playStatus };
      if (Object.keys(otherParam).length > 0)
        bodyData = Object.assign({}, bodyData, otherParam);
      const hasRecord = await gameRecordDao.findOne(bodyData);
      return hasRecord ? hasRecord : false;
    } catch (e) {
      console.error(`真人视讯|RealityVideoDao|findOneGameRecord|查询游戏记录出错:${e.stack}`);
      return false;
    }
  }

  static async findLastUpdateGameRecord({ uid, nid, playStatus = 1 }, otherParam = {}) {
    try {
      let bodyData = { uid, nid, playStatus };
      if (Object.keys(otherParam).length > 0)
        bodyData = Object.assign({}, bodyData, otherParam);
      const hasRecord = await gameRecordDao.find(bodyData).sort({ 'createTime': -1 }).limit(1);
      return hasRecord ? hasRecord : false;
    } catch (e) {
      console.error(`真人视讯|RealityVideoDao|findLastUpdateGameRecord|查询游戏记录出错:${e.stack}`);
      return false;
    }
  }

  static async saveGameRecord({ uid, nid, input, profit = 0, win = 0, gold = 0, playStatus = 0, nickname, gname = '真人视讯', createTime = Date.now(), privateRoom = false, isDealer = false, multiple = 0, addRmb = 0, addTixian = 0, playerCreateTime, bet_commission = 0, win_commission = 0, settle_commission = 0, way = 0, object = 0 }) {
    try {
      const recordBody = {
        uid,
        nid,
        input,
        profit,
        win,
        gold,
        playStatus,
        nickname,
        gname,
        createTime,
        privateRoom,
        isDealer,
        multiple,
        addRmb,
        addTixian,
        playerCreateTime,
        bet_commission,
        win_commission,
        settle_commission,
        way,
        object
      };
      await gameRecordDao.create(recordBody);
    } catch (e) {
      console.error(`真人视讯|RealityVideoDao|saveRecord|新增游戏记录出错:${e.stack}`);
    }
  }

  static async updateGameRecord({ _id, input, profit, win, gold, playStatus = 1 }) {
    try {
      await gameRecordDao.updateOne({ _id }, { input, profit, win, gold, playStatus })
    } catch (e) {
      console.error(`真人视讯|RealityVideoDao|updateGameRecord|更新游戏记录出错:${e.stack}`);
    }
  }

  static async selectListForOffsetPageTotalPage({ startTime, endTime, startPage = 0, pageSize = 20 }) {
    try {
      const count = await gameRecordDao
        .countDocuments({
          nid: '59',
          playStatus: 1,
          createTime: { $gt: startTime, $lt: endTime }
        });
      return count ? Math.ceil(count / pageSize) : 0;
    } catch (e) {
      console.error(`真人视讯|RealityVideoDao|selectListForOffsetPageCount|分页查询出错:${e.stack}`)
    }
  }

  static async selectListForOffsetPage({ startTime, endTime, startPage = 0, pageSize = 20 }) {
    try {
      const totalRecord = await gameRecordDao.find({
        nid: '59',
        playStatus: 1,
        createTime: { $gt: startTime, $lt: endTime }
      }, 'uid nickname nid input profit win createTime')
        .sort({ createTime: -1 })
        .skip(pageSize * (startPage - 1))
        .limit(pageSize)
        .exec();
      return totalRecord ? totalRecord : [];
    } catch (e) {
      console.error(`真人视讯|RealityVideoDao|selectListForOffsetPage|分页查询出错:${e.stack}`)
    }
  }

  static async selectList({ startTime, endTime }) {
    try {
      const totalRecord = await gameRecordDao.find({
        nid: '59',
        playStatus: 1,
      }, 'uid nickname nid input profit win createTime')
        .find({ createTime: { $gt: startTime, $lt: endTime } })
        .sort({ createTime: -1 })
        .exec();
      return totalRecord ? totalRecord : [];
    } catch (e) {
      console.error(`真人视讯|RealityVideoDao|selectListForOffsetPage|分页查询出错:${e.stack}`)
    }
  }

}