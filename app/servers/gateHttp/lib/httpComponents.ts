import {createPinusHttpPlugin} from 'pinus-http-plugin';
import {IComponent} from "pinus";
import loginRoute from "./route/loginRoute";

const plugin = createPinusHttpPlugin();

export default class HttpComponents extends plugin.components[0] implements IComponent{
    name: string = plugin.name;

    beforeStart(cb: any) {
        !!cb && cb();
    }

    afterStart(cb: any) {
        cb();
    }

    public loadRoutes() {
        this.http.get('/', function (req: any, res: any) {
            res.send('pinus-http-plugin ok!');
        });

        this.http.all('*', (req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });

        loginRoute(this.app, this.http);
    }
}