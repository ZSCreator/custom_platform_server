/**
 * 枚举房间游戏进行时的状态
 * @property NONE 房间初始化时
 * @property WAIT 红包队列为空:等待埋雷发红包
 * @property READY 等待抢红包
 * @property GAME 游戏开始
 * @property END  结算
 * @author Andy
 */
export enum GameStatusEnum {
    NONE = 1,
    WAIT,
    READY,
    GAME,
    END
  }
  
  export enum StatusAcitonEnum {
    noneAction = 1,
    waitAction,
    readyAction,
    gameAction,
    endAction
  }
  