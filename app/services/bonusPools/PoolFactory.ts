import GameManagerDao from '../../common/dao/daoManager/Game.manager'
import { getLogger } from 'pinus-logger';
import {PoolImpl} from "./pool/PoolImpl";
const gamesConfig = require('../../../config/data/games');

const Logger = getLogger('server_out', __filename);

export class PoolFactory {

  static checkInstanceList: string[] = [];

  static instanceMap = {};

  static async getInstance(nid: string, sceneId?: number, roomId?: string): Promise<PoolImpl> {

    if (!nid) throw Error('获取奖金池实例出错: nid 是必须参数');

    const gameConfig = await GameManagerDao.findOne({nid});

    if (!gameConfig) throw Error(`奖金池|   ，请确认 config/data/games.json 文件|nid:${nid},获取信息${gameConfig}`);

    const initConstructorParamter = `${nid}|${Number.isInteger(sceneId) ? sceneId : ''}|${roomId ? roomId : ''}`;

    if (this.checkInstanceList.findIndex(constructorParamter => constructorParamter === initConstructorParamter) < 0) {

      this.checkInstanceList.push(initConstructorParamter);
      const { zname, name } = gameConfig;

      const targetIndex = gamesConfig.findIndex(info => info.name === name);
      let { serverName } = gamesConfig[targetIndex];
      let initPoolConstructorParamter = { zname, serverName };

      switch (nid) {
        // case GameNidEnum.redPacket:// 红包扫雷
        //   Object.assign(initPoolConstructorParamter, { nid, sceneId });
        //   if (!Number.isInteger(sceneId)) throw Error('获取红包扫雷奖金池实例出错: sceneId 是必须参数');
        //   this.instanceMap[initConstructorParamter] = new PoolImpl(initPoolConstructorParamter);
        //   await this.instanceMap[initConstructorParamter].initAllPoolConfig({ nid, sceneId, roomId });
        //   break;

        default:
          const source = { nid, sceneId };
          Object.assign(initPoolConstructorParamter, source);
          this.instanceMap[initConstructorParamter] = new PoolImpl(initPoolConstructorParamter);
          await this.instanceMap[initConstructorParamter].initAllPoolConfig(source);
          break;
      }
    }

    return this.instanceMap[initConstructorParamter];

  }

  /**
   * 保存当前奖池的记录
   */
  static async saveAllPoolsHistory() {
    await Promise.all(Object.values(this.instanceMap).map((instance: any) => instance.saveBonusPoolHistory()));
  }

  /**
   * 清空奖池累计值
   */
  static async clearAllPoolsAmount() {
    await Promise.all(Object.values(this.instanceMap).map((instance: any) => instance.clearAllPool()));
  }
}