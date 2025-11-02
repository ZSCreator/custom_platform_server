/**
 * @name 代理集合
 * @description parentUid 子字段 整数类型，表示 存在的 kind 目标房间集合里当前人数
 * @description 值表示 roomPool idx
 */
interface IAgentIsolationPool {
    [parentUid: string]: Array<number>
}

/**
 * @name 隔离集合
 * @description rootUid 根字段类型 对象，表示 存在的代理集合，
 */
export interface IPlatformIsolationPool {
    [rootUid: string]: IAgentIsolationPool
}