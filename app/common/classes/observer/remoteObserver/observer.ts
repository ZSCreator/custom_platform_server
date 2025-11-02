import {Redis} from "ioredis";
import {IRemoteObserver} from "../../../interface/observer/remoteObserver/observer";

/**
 * 本观察者为远程观察者
 * 基于redis的发布订阅实现
 * @property redis redis连接
 * @property themeName 观察主题
 */
export abstract class RemoteObserver implements IRemoteObserver{
    redis: Redis;
    themeName: string;

    protected constructor(themeName: string, redis: Redis) {
        this.redis = redis;
        this.themeName = themeName;
    }

    /**
     * 更新
     */
    async update(message?: string): Promise<any> {
        await this.redis.publish(this.themeName, message);
    }
}