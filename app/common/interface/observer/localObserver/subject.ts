import {ISubject} from "../subject";

/**
 * 本地被观察者接口
 */
export interface ILocalSubject extends ISubject{
    id: number;
}