/**
 * @name 代理集合
 * @description parentUid 子字段 整数类型，表示 存在的 kind 目标房间集合里当前人数
 * @description 值表示 timer
 */
interface ISubTimer {
    [parentUid: string]: NodeJS.Timeout
}

/**
 * @name 隔离集合
 * @description rootUid 根字段类型 对象，表示 存在的代理集合，
 */
export interface ITimerPool {
    [rootUid: string]: ISubTimer
}