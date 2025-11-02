/**
 * 构造结果记录
 * @param result 玩家房间列表
 */
export function buildRecordResult(result: string[]) {
    return result.reduce((prefix, s) => prefix += s, '');
}