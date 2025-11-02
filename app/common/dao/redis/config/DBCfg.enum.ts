/**
 * 数据分发
 */
export enum RedisDB {
    /** 
     * @property Persistence_DB 数据持久化
     */
    Persistence_DB,
    /**
     * @property RuntimeData 运行时数据
     * @description 会设置有效时长
     */
    RuntimeData,
    /**
     * @property SysData 配置信息
     */
    SysData,
    /**
     * @property SysData 游戏记录
     */
    GameRecordData,
}