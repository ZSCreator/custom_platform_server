"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseUrl = exports.RealityVideoApiExceptionEnum = void 0;
const baseUrl = 'http://api-lts.epic777.com';
exports.baseUrl = baseUrl;
const RealityVideoApiExceptionEnum = {
    regedit: 1,
    finduser: 2,
    editpwd: 3,
    addintegral: 4,
    reduceintegral: 5,
    query: 6,
    betlist: 7,
    loginThird: 8,
    query_xibu: 9,
    new_password: 10,
    query_integral: 11,
    ip_info: 12,
    logoff_user: 13,
    balance: 14,
    properties: {
        1: {
            name: '用户注册',
            path: '/api/regedit',
            url: `${baseUrl}/api/regedit`,
            method: ['GET', 'POST'],
            responseStatus: {
                1: true,
                2: '授权码为空',
                3: '授权码非法',
                4: '代理被禁用',
                5: '代理授权码对应的客户端ip 列表非法',
                6: '代理商信息未找到',
                7: '接口请求参数为空',
                8: '系统保留账号前缀(hjtry 是系统保留账号前缀)，账号创建失败',
                9: '用户名已存在'
            }
        },
        2: {
            name: '用户账号查询',
            path: '/api/finduser',
            url: `${baseUrl}/api/finduser`,
            method: ['GET', 'POST'],
            responseStatus: {
                0: false,
                1: true,
                2: '授权码为空',
                3: '授权码非法',
                4: '代理被禁用',
                5: '代理授权码对应的客户端ip 列表非法',
                6: '接口请求参数为空'
            }
        },
        3: {
            name: '用户账户修改',
            path: '/api/editpwd',
            url: `${baseUrl}/api/editpwd`,
            method: ['GET', 'POST'],
            responseStatus: {
                1: true,
                2: '授权码为空',
                3: '授权码非法',
                4: '代理被禁用',
                5: '代理授权码对应的客户端ip 列表非法',
                6: '接口请求参数为空',
                7: '新旧密码一致，不需要修改'
            }
        },
        4: {
            name: '用户加分',
            path: '/api/addintegral',
            url: `${baseUrl}/api/addintegral`,
            method: ['GET', 'POST'],
            responseStatus: {
                1: true,
                2: '授权码为空',
                3: '授权码非法',
                4: '代理被禁用',
                5: '代理授权码对应的客户端ip 列表非法',
                6: '接口请求参数为空',
                7: '金币不足1，无法进入',
                8: '未找到指定的用户信息',
                9: '没有权限操作当前用户',
                10: '代理余额不足',
                11: '数据库操作失败'
            }
        },
        5: {
            name: '用户减分',
            path: '/api/reduceintegral',
            url: `${baseUrl}/api/reduceintegral`,
            method: ['GET', 'POST'],
            responseStatus: {
                1: true,
                2: '授权码为空',
                3: '授权码非法',
                4: '代理被禁用',
                5: '代理授权码对应的客户端ip 列表非法',
                6: '接口请求参数为空',
                7: '上下分金额非法',
                8: '未找到指定的用户信息',
                9: '没有权限操作当前用户',
                10: '用户余额不足',
                11: '数据库操作失败'
            }
        },
        6: {
            name: '用户查分',
            path: '/api/query',
            url: `${baseUrl}/api/query`,
            method: ['GET', 'POST'],
            responseStatus: {
                1: true,
                2: '授权码为空',
                3: '授权码非法',
                4: '代理被禁用',
                5: '代理授权码对应的客户端ip 列表非法',
                6: '接口请求参数为空',
                7: '未找到指定用户',
                8: '没有权限查询此用户信息'
            }
        },
        7: {
            name: '代理下属所有用户投注数据报表',
            path: '/api/betlist',
            url: `${baseUrl}/api/betlist`,
            method: ['GET', 'POST'],
            responseStatus: {
                1: true,
                2: '授权码为空',
                3: '授权码非法',
                4: '代理被禁用',
                5: '代理授权码对应的客户端ip 列表非法',
                6: '接口请求参数为空',
                7: '时间间隔大于7天'
            }
        },
        8: {
            name: '用户登录',
            path: '/login-third.html',
            url: `http://app.wbyy100.com/login-third.html`,
            method: ['GET']
        },
        9: {
            name: '代理上下分记录查询(返回最近的一条上下分记录)',
            path: '/api/query_xibu',
            url: `${baseUrl}/api/query_xibu`,
            method: ['GET', 'POST'],
            responseStatus: {
                1: true,
                2: '授权码为空',
                3: '授权码非法',
                4: '代理被禁用',
                5: '代理授权码对应的客户端ip 列表非法',
                6: '接口请求参数为空',
                7: '未找到对应的上下分记录信息'
            }
        },
        10: {
            name: '用户密码修改(无原密码版)',
            path: '/api/new_password',
            url: `${baseUrl}/api/new_password`,
            method: ['GET', 'POST'],
            responseStatus: {
                1: true,
                2: '授权码为空',
                3: '授权码非法',
                4: '代理被禁用',
                5: '代理授权码对应的客户端ip 列表非法',
                6: '接口请求参数为空',
                7: '未找到指定的用户信息',
                8: '没有权限操作当前用户',
                9: '数据库操作失败'
            }
        },
        11: {
            name: '查询上下分交易订单',
            path: '/api/query_integral',
            url: `${baseUrl}/api/query_integral`,
            method: ['GET', 'POST'],
            responseStatus: {
                1: true,
                2: '授权码为空',
                3: '授权码非法',
                4: '代理被禁用',
                5: '代理授权码对应的客户端ip 列表非法',
                6: '接口请求参数为空',
                7: '未找到上下分信息',
                8: '没有权限操作当前用户'
            }
        },
        12: {
            name: '获取代理所在服务器ip地址',
            path: '/api/ip_info',
            url: `${baseUrl}/api/ip_info`,
            method: ['GET', 'POST'],
            responseStatus: {
                1: true
            }
        },
        13: {
            name: '踢出在线用户',
            path: '/api/logoff_user',
            url: `${baseUrl}/api/logoff_user`,
            method: ['GET', 'POST'],
            responseStatus: {
                1: true,
                2: '授权码为空',
                3: '授权码非法',
                4: '代理被禁用',
                5: '代理授权码对应的客户端ip 列表非法',
                6: '接口请求参数为空',
                7: '未找到指定的用户信息',
                8: '没有权限操作当前用户',
                9: '数据库操作失败'
            }
        },
        14: {
            name: '获取代理商余额',
            path: '/api/balance',
            url: `${baseUrl}/api/balance`,
            method: ['GET', 'POST'],
            responseStatus: {
                1: true,
                2: '授权码为空',
                3: '授权码非法',
                4: '代理被禁用',
                5: '代理授权码对应的客户端ip 列表非法',
                6: '接口请求参数为空',
                7: '未找到指定的用户信息',
                8: '没有权限操作当前用户',
                9: '数据库操作失败'
            }
        }
    }
};
exports.RealityVideoApiExceptionEnum = RealityVideoApiExceptionEnum;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVhbGl0eVZpZGVvRXhjZXB0aW9uRW51bS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwcC9jb25zdHMvUmVhbGl0eVZpZGVvRXhjZXB0aW9uRW51bS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSxNQUFNLE9BQU8sR0FBRyw0QkFBNEIsQ0FBQztBQXlPTiwwQkFBTztBQXhPOUMsTUFBTSw0QkFBNEIsR0FBRztJQUNqQyxPQUFPLEVBQUUsQ0FBQztJQUNWLFFBQVEsRUFBRSxDQUFDO0lBQ1gsT0FBTyxFQUFFLENBQUM7SUFDVixXQUFXLEVBQUUsQ0FBQztJQUNkLGNBQWMsRUFBRSxDQUFDO0lBQ2pCLEtBQUssRUFBRSxDQUFDO0lBQ1IsT0FBTyxFQUFFLENBQUM7SUFDVixVQUFVLEVBQUUsQ0FBQztJQUNiLFVBQVUsRUFBRSxDQUFDO0lBQ2IsWUFBWSxFQUFFLEVBQUU7SUFDaEIsY0FBYyxFQUFFLEVBQUU7SUFDbEIsT0FBTyxFQUFFLEVBQUU7SUFDWCxXQUFXLEVBQUUsRUFBRTtJQUNmLE9BQU8sRUFBRSxFQUFFO0lBQ1gsVUFBVSxFQUFFO1FBQ1IsQ0FBQyxFQUFFO1lBQ0MsSUFBSSxFQUFFLE1BQU07WUFDWixJQUFJLEVBQUUsY0FBYztZQUNwQixHQUFHLEVBQUUsR0FBRyxPQUFPLGNBQWM7WUFDN0IsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQztZQUN2QixjQUFjLEVBQUU7Z0JBQ1osQ0FBQyxFQUFFLElBQUk7Z0JBQ1AsQ0FBQyxFQUFFLE9BQU87Z0JBQ1YsQ0FBQyxFQUFFLE9BQU87Z0JBQ1YsQ0FBQyxFQUFFLE9BQU87Z0JBQ1YsQ0FBQyxFQUFFLG9CQUFvQjtnQkFDdkIsQ0FBQyxFQUFFLFVBQVU7Z0JBQ2IsQ0FBQyxFQUFFLFVBQVU7Z0JBQ2IsQ0FBQyxFQUFFLGtDQUFrQztnQkFDckMsQ0FBQyxFQUFFLFFBQVE7YUFDZDtTQUNKO1FBQ0QsQ0FBQyxFQUFFO1lBQ0MsSUFBSSxFQUFF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