/**
 * 公共池
 * @property amount 当前金额
 * @property minAmount 最低金额
 * @property maxAmount 最高金额
 * @property maxAmountInStore 最高储蓄金额
 * @property maxAmountInStoreSwitch 储蓄满时 自动/手动 将溢出金额引入"调控池"
 * @property personalReferenceValue 个人房间基准值
 * @function initConfig 初始化基本函数
 * @property amount 当前金额
 * @dete 2019年5月23日
 * @author Andy
 * @description 关于初始化函数 initConfig 目前未确立数据库表结构，故当前具体实现由研发同事自由实现；考虑项目推进，目前个人采用 根目录下 ./config/data/JSONMgr.ts 去加载同目录下 pool/游戏名.json 配置信息
 */
export abstract class BonusPoolAbstract {


  abstract amount: number;

  abstract initAmount: number;

  abstract minAmount: number;

  abstract minParameter: number;

  abstract maxAmount: number;

  abstract maxParameter: number;

  abstract maxAmountInStore: number;

  abstract maxAmountInStoreSwitch: boolean;

  abstract personalReferenceValue: number;

  abstract initConfig(parameter): void;


  // 奖金池金额变化时调用此函数
  abstract checkBonusPoolAmountAfterChange(): void;

  // 奖金池金额增加时，必实现且调用的函数
  abstract changeCorrectedValueAfterAdd(): void;

  // 奖金池金额增加时，必实现且调用的函数
  abstract changeCorrectedValueAfterReduce(): void;
}