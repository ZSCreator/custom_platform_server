export abstract class IBaseRedisDao {
    async exits(arg: any): Promise<boolean> {
        throw new Error("Method not implemented.");
    };

    async count(arg: any): Promise<number> {
        throw new Error("Method not implemented.");
    };
}
