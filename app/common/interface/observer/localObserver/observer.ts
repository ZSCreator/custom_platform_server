import {IObserver} from "../observer";
import {ILocalSubject} from './subject';

/**
 * 本地观察者接口
 * @property registrants 被观察者注册列表
 */
export interface ILocalObserver<T extends ILocalSubject> extends IObserver{
    registrants: T[];

    addRegistrant(r: T): void;

    /**
     * 移除注册者
     * @param registrant
     */
    removeRegistrant(registrant: T): any;
}