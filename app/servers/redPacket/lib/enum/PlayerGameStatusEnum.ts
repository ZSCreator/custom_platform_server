/**
 * 枚举玩家游戏进行时的状态
 * @property NONE
 * @property READY
 * @property GAME
 * @description 此处枚举是针对原业务里，游戏状态值和行为在业务里位置过于“离散”，根据状态不同，房间处理行为不同；不利阅读和维护。
 * @author Andy
 */
export enum PlayerGameStatusEnum {
    NONE = 1,
    READY,
    GAME
  }
  
  /**
   * 枚举玩家状态时的行为,与状态映射
   * @property noneAction
   * @property readyAction
   * @property gameAction
   */
  export enum PlayerStatusAcitonEnum {
    noneAction = 1,
    readyAction,
    gameAction
  }
  