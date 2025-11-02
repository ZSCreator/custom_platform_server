import {ILocalObserver} from "../../../interface/observer/localObserver/observer";
import {LocalSubject} from "./subject";

/**
 * 本地观察者
 * 基于redis的发布订阅实现
 * @property themeName 观察主题
 * @property registrants 被观察者列表
 * @property idCount id计数
 */
export abstract class Observer<T extends LocalSubject> implements ILocalObserver<T>{
    themeName: string;
    registrants: T[] = [];
    idCount: number = 0;

    protected constructor(themeName: string) {
        this.themeName = themeName;
    }

    /**
     * 添加注册者
     * @param registrant 注册者
     */
    addRegistrant(registrant: T): void {
        registrant.id = this.idCount;
        this.registrants.push(registrant);
        this.idCount++;
    }

    /**
     * 删除注册者
     * @param registrant 注册者
     */
    removeRegistrant(registrant: T): any {
        const index = this.registrants.findIndex(r => r.id === registrant.id);

        if (index !== -1) {
            this.registrants.splice(index, 1);
        }
    }

    /**
     * 通知被观察者更新
     * 采用拉取式， 只通知更新，具体拉取什么由被观察者自己决定
     */
    async update(): Promise<any> {
        this.registrants.forEach(r => r.invoke());
    }
}