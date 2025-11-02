import { Application, ChannelService, RemoterClass, FrontendSession } from 'pinus';

export default function (app: Application) {
    return new ChatRemote(app);
}

// UserRpc的命名空间自动合并
declare global {
    interface UserRpc {
        gate: {
            chatRemote: RemoterClass<FrontendSession, ChatRemote>;
        };
    }
}

export class ChatRemote {

    constructor(private app: Application) {
        this.app = app;
        this.channelService = app.get('channelService');
    }

    private channelService: ChannelService;

    /**
     * Add user into chat channel.
     *
     * @param {String} uid unique id for user
     * @param {String} sid server id
     * @param {String} name channel name
     * @param {boolean} flag channel parameter
     *
     */
    public async add(uid: string, sid: string, name: string, flag: boolean) {
        let channel = this.channelService.getChannel(name, flag);

        if (!!channel) {
            channel.add(uid, sid);
        }

        return this.get(name, flag);
    }

    /**
     * Get user from chat channel.
     *
     * @param {String} name channel name
     * @param {boolean} flag channel parameter
     *
     */
    private get(name: string, flag: boolean) {
        let users: string[] = [];
        let channel = this.channelService.getChannel(name, flag);
        if (!!channel) {
            users = channel.getMembers();
        }
        for (let i = 0; i < users.length; i++) {
            users[i] = users[i].split('*')[0];
        }
        return users;
    }

    /**
     * Kick user out chat channel.
     *
     * @param {String} uid unique id for user
     * @param {String} sid server id
     * @param {String} name channel name
     *
     */
    public async kick(uid: string, sid: string, name: string) {
    }

    /**
     * 获取session数量
     */
    public async getSessionsCount() {
        let sessionService = this.app.get('sessionService');
        return sessionService.getSessionsCount();
    }
}