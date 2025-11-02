'use strict';
/**
 * 服务器配置文件，用来区分不同服务器的不同功能
 */


// 服务器配置文件，是否开房游戏解锁功能
export const UNLOCK_GAME = false;
// 解锁游戏的配置文件
export const UNLOCK_GAME_LIST = [
    // {nid:"10", name : "寻宝奇航" , entryCond : 100},
    // {nid:"12", name : "埃及夺宝" , entryCond : 100},
    // {nid:"1",  name :  "幸运777" , entryCond : 100},
    {nid:"52", name : "水果机" ,   entryCond : 1000},
    {nid:"8",  name :  "百家乐" ,  entryCond : 2000},
    {nid:"20", name : "红黑大战" , entryCond : 2000},
    {nid:"42", name : "龙虎斗" ,   entryCond : 2000},
    {nid:"14", name : "奔驰宝马" , entryCond : 2000},
    {nid:"43", name : "骰宝" ,     entryCond : 5000},
    {nid:"59", name : "crash" ,    entryCond : 2000},
    {nid:"22", name : "21点" ,     entryCond : 600},
    {nid:"40", name : "德州扑克" ,  entryCond : 1000},
    {nid:"16", name : "印度三张牌", entryCond : 5000},

];


