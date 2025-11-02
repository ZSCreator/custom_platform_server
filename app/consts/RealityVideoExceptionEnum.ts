/**
 * 真人视讯 通信枚举
 * @property regedit 注册
 */
// const baseUrl = 'http://api-lts.hj8828.com';
const baseUrl = 'http://api-lts.epic777.com';
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
                1: true,// 创建成功
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
                0: false,// 用户不存在
                1: true,//存在指定用户
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
                1: true,// 修改成功
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

export { RealityVideoApiExceptionEnum, baseUrl };
