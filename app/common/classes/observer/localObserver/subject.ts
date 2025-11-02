import {ILocalSubject} from "../../../interface/observer/localObserver/subject";
import {ILocalObserver} from "../../../interface/observer/localObserver/observer";

export abstract class LocalSubject implements ILocalSubject{
    themeName: string;
    id: number;

    protected constructor(themeName: string) {
        this.themeName = themeName;
    }

    /**
     * 更新调用
     * @param msg
     */
    abstract invoke(msg?: any): any;

    /**
     * 注册
     * @param observer 注册的主题
     */
    registration(observer?: ILocalObserver<LocalSubject>): any {
        return observer.addRegistrant(this);
    }

    /**
     * 取消注册
     * @param observer 取消注册的主题
     */
    unregister(observer?: ILocalObserver<LocalSubject>): any {
        return observer.removeRegistrant(this);
    }
}