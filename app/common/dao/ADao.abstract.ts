
type Parameter<T> = { [P in keyof T]?: T[P] }

export abstract class AbstractDao<T> {

    /**
     * 查询列表
     * @param parameter 
     */
    abstract findList(parameter: Parameter<T>): Promise<Array<T>>;

    /**
     * 查询一条
     */
    abstract findOne(parameter: Parameter<T>): Promise<T>;

    /**
     * 修改一条
     */
    // abstract updateOne(tableName: string, parameter: Parameter<T>, partialEntity: Parameter<T>): Promise<any>;

    /**
     * 新增一条
     */
    abstract insertOne(parameter: Parameter<T>): Promise<any>;

    /**
     * 删除一条
     */
    abstract delete(parameter: Parameter<T>): Promise<any>;
}
