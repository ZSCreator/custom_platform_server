import { Redis } from "ioredis";
import { IRemoteSubject } from "../../../interface/observer/remoteObserver/subject";

/**
 * 本观察者为远程模块
 * 基于redis发布订阅模型实现
 * @property themeName 主题
 * @property redis redis连接
 */
export abstract class RemoteSubject implements IRemoteSubject {
    themeName: string;
    redis: Redis;

    protected constructor(themeName: string, redis: Redis) {
        this.themeName = themeName;
        this.redis = redis;
    }

    /**
     * 执行函数 由各个继承单独实现
     * @param msg
     */
    abstract invoke(msg?: any);


    /**
     * 注册
     */
    async registration(): Promise<void> {
        await this.redis.subscribe(this.themeName);

        this.redis.on('message', (channel, message: string) => {
            if (channel === this.themeName) {
                if (!message || !message.length) {
                    return this.invoke();
                }

                this.invoke(JSON.parse(message));
            }
        });
    }

    /**
     * 取消注册
     */
    async unregister(): Promise<any> {
        await this.redis.unsubscribe(this.themeName);
    }
}
