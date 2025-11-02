'use strict';

import pokerType = require('../constant/PokerType');
import DeGameUtil = require("../../../../utils/gameUtil2");
import * as DZpipeiConst from "../../../../servers/DZpipei/lib/DZpipeiConst";

const CpokerType = pokerType.getInstance();
/**
 * 机器人游戏进程状态中，方法相关集合(不含游戏状态外的如登入等出等)
 * @function getPokerType 判断手牌类型
 * @function getPokerFace 获取手牌牌面
 */
export default class RobotPokerAction {
  /**
   * 判断手牌类型
   * @param  {string} handPoker 手牌
   * @param  {number} isSameColorFlag 1:相同颜色；2：不同颜色
   * @returns {number} pokerTypeVal 手牌类型即牌力值(0-6)
   * @description 根据手牌判断类型
   */
  static getPokerType(handPoker, isSameColorFlag) {
    let pokerTypeVal = -1;
    switch (isSameColorFlag) {
      case 1:
        pokerTypeVal = CpokerType.sameColor.reduce((result, typeList, idx) => {
          if (typeList.findIndex(pokerVal => handPoker === pokerVal) > -1) return idx;
          return result > -1 ? result : 6;
        }, pokerTypeVal);
        break;
      case 2:
        pokerTypeVal = CpokerType.diffrentColor.reduce((result, typeList, idx) => {
          if (typeList.findIndex(pokerVal => handPoker === pokerVal) > -1) return idx + 3;
          return result > -1 ? result : 6;
        }, pokerTypeVal);
        break;
      default:
        pokerTypeVal = 0;
        break;
    }
    return pokerTypeVal;
  }

  /**
   * 获取手牌牌面(单张)
   * @param  {number} pokerNum 0-12 对应 A,2,3,...J,Q,K
   * @returns {string} 如 A,2,3,...J,Q,K
   */
  static getPokerFace(pokerNum) {
    const pokerList = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    return pokerList[pokerNum] ? pokerList[pokerNum] : 'A';
  }

  /**
   * 获取手牌花色(单张)
   * @param  {number} pokerNum 0-51
   * @returns {number(0|1|2|3)}
   * @description 0.Spade 黑桃 1.Heart 红桃 2.Diamond 方块 3.Club 梅花
   */
  static getPokerColor(pokerNum) {
    const spade = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const heart = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
    const diamond = [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38];
    const club = [39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
    if (spade.indexOf(pokerNum) > -1)
      return 0;
    if (heart.indexOf(pokerNum) > -1)
      return 1;
    if (diamond.indexOf(pokerNum) > -1)
      return 2;
    if (club.indexOf(pokerNum) > -1)
      return 3;
    return 0;
  }

  /**
   * 公共牌后:获得所有玩家信息，根据手牌牌力降序排序
   * 首先将玩家身上的手牌和公牌进行组合成最大的组合进行牌力值来算
   * @param {Array<object>} allPlayer
   * @returns {Array<object>} descSortAllPlayerList
   */
  static getAllPlayerPokerPowerDescendingSort(allPlayerList: any[] ,publicCardToSort : number [] )  {
    if (allPlayerList.length === 0)
      return [];// 未开始的对局，故可能牌为空
      /**
       * step1  将玩家身上的手牌和公牌进行牌力值计算啊
       */
    return allPlayerList.map(playerInfo => {
       const  result =  this.getPlayerGoodCardGroup(playerInfo.holds, publicCardToSort);
       if(result){
           playerInfo['pokerPowerValue'] = result.value;
       }else {
           playerInfo['pokerPowerValue'] = 0;
       }
      return playerInfo;
    }).sort((firstPlayerInfo, secondPlayerInfo) => {
      if (firstPlayerInfo['pokerPowerValue'] - secondPlayerInfo['pokerPowerValue'] > 0)
        return -1;
      if (firstPlayerInfo['pokerPowerValue'] - secondPlayerInfo['pokerPowerValue'] < 0)
        return 1;
      /** 2019-4-2 添加牌力相等，机器人排序在前 */
      if (firstPlayerInfo['pokerPowerValue'] - secondPlayerInfo['pokerPowerValue'] === 0) {
        if (firstPlayerInfo['isRobot'] === 2)
          return -1;
        if (secondPlayerInfo['isRobot'] === 2)
          return 1;
        return 0;
      }
    });
  }

    /**
     * 获取玩家最好的组合牌型
     */
  static getPlayerGoodCardGroup(playerCard : number [] , publiCard : number []){
        let finallyList = [];
        for(let i = 0 ; i< 6 ; i++){
            if(i == 0){
                let arr = publiCard.slice(0,3);
                let list = playerCard.concat(arr);
                finallyList.push({
                    list,
                    value: DeGameUtil.sortPokerToType(list)
                })
            }else if(i == 1){
                let arr = publiCard.slice(0,1);
                let arr1 = publiCard.slice(2,4);
                let list = playerCard.concat(arr,arr1);
                finallyList.push({
                    list,
                    value: DeGameUtil.sortPokerToType(list)
                })
            }else if(i == 2){
                let arr = publiCard.slice(0,1);
                let arr1 = publiCard.slice(3,5);
                let list = playerCard.concat(arr,arr1);
                finallyList.push({
                    list,
                    value: DeGameUtil.sortPokerToType(list)
                })
            }else if(i == 3){
                let arr = publiCard.slice(1,4);
                let list = playerCard.concat(arr);
                finallyList.push({
                    list,
                    value: DeGameUtil.sortPokerToType(list)
                })
            }else if(i == 4){
                let arr = publiCard.slice(1,2);
                let arr1 = publiCard.slice(3,5);
                let list = playerCard.concat(arr,arr1);
                finallyList.push({
                    list,
                    value: DeGameUtil.sortPokerToType(list)
                })
            }else if(i == 5){
                let arr = publiCard.slice(2,5);
                let list = playerCard.concat(arr);
                finallyList.push({
                    list,
                    value: DeGameUtil.sortPokerToType(list)
                })
            }
        }
        const resultList = finallyList.sort((a,b)=>b.value - a.value);
        if(resultList.length > 0){
            return finallyList[0];
        }else {
            return null;
        }
  }

}
