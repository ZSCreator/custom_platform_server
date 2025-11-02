import {getConnection, getManager, getRepository} from "typeorm";
import {EntityTarget} from "typeorm/common/EntityTarget";


interface MysqlConfig {
    name: string;
}

/**
 * mysql连接管理器
 * 之所以没用框架自带的读写分离管理 是因为易用性差了点 当需要使用master连接时需要QueryRunner指定master 且需要手动释放
 * @property master 主库的名字
 * @property slaves 从库的名字
 */
class DBConnection {
    master: string;
    slaves: string[];
    next: number;

    init(config: MysqlConfig[]) {
        if (config.length <= 0) {
            throw new Error('mysql 配置异常');
        }

        // 第一个总是mater
        this.master = config[0].name;

        this.slaves = config.filter(c => c.name !== this.master).map(c => c.name);


        this.next = 0;
    }

    /**
     * 获取连接
     * @param secondary 如果为true 则获取从库
     */
    getConnection(secondary: boolean = false) {
        if (!secondary || this.slaves.length === 0) {
            return getConnection(this.master);
        }

        const connection = getConnection(this.slaves[this.next]);

        // 下一个
        this.next += 1;

        if (this.next > (this.slaves.length - 1)) {
            this.next = 0;
        }

        return connection;
    }

    /**
     * 获取存储库
     * @param entityClass
     */
    getRepository(entityClass: EntityTarget<any>) {
        return getRepository(entityClass, this.master);
    }

    /**
     * 获取创建事务的管理器
     */
    getManager() {
        return getManager(this.master);
    }
}

export default new DBConnection();