import {IObserver} from "../observer";
import {Redis} from "ioredis";

/**
 * 远程观察者接口
 * @property redis redis连接
 */
export interface IRemoteObserver extends IObserver{
    redis: Redis;
}