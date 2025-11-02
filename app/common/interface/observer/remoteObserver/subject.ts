
import {Redis} from "ioredis";
import {ISubject} from "../subject";

/**
 * 被观察者
 * @property themeName 观察的主题
 */
export interface IRemoteSubject extends ISubject{
    redis: Redis;
}