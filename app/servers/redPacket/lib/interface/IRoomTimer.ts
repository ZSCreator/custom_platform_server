/**
 * @property gameCheck Interval 每秒确认一次执行逻辑
 * @property waitTimer 等待时间
 */
export interface IRoomTimer {
    process?: NodeJS.Timer,
    waitTimer?: NodeJS.Timer,
  }