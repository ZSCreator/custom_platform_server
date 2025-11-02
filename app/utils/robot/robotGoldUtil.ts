'use strict';

// 机器人金币相关
import commonUtil = require('../lottery/commonUtil');
import robotConst = require("../../consts/robotConst");
import JsonMgr = require('../../../config/data/JsonMgr');
import commonRobotAction = require("../../services/robotService/common/robotAction");
import { betAstrict } from '../../../config/data/gamesBetAstrict';
import utils = require('../../utils/index');
import { gold_config } from "../../../config/data/robot/gold_config";



/**根据概率获取金币 */
export function getRanomByWeight(nid: string, sceneId: number) {
  // let weights = gold_config["40_0"];
  let weights = gold_config.find(c => c.nid == nid).config_arr[sceneId];
  let sum = 0;
  for (const c of weights) {
    sum = sum + c.prob;
  }

  let compareWeight = utils.random(1, sum);
  let weightIndex = 0;
  while (sum > 0) {
    sum = sum - weights[weightIndex].prob
    if (sum < compareWeight) {
      let c = weights[weightIndex];
      return utils.random(c.min, c.max) + utils.random(0, 100) / 100;
    }
    weightIndex = weightIndex + 1;
  }
  return;
}



// 一百万
const oneMillion = 100000;


/**获取可以下注的最小金币 */
export function getBetLowLimit(nid: string, sceneId: number) {
  try {
    // 押注下限的配置
    let sceneId_: string = sceneId + '';
    if (betAstrict[`nid_${nid}`] && betAstrict[`nid_${nid}`][`sceneId_${sceneId}`]) {
      return betAstrict[`nid_${nid}`][`sceneId_${sceneId}`]
    }
    return 0;
  } catch (error) {
    return 0;
  }
};

/**
 * 获取机器人随机押注金币和随机因子
 * @param ChipList 筹码列表
 */
export function randomBetGold(ChipList: number[], playerGold: number, ranFactor: number) {
  if (playerGold < ChipList[0]) return 0;
  // 随机数取模，选一个投注下标
  let betSelectionIdx = ranFactor % ChipList.length;
  betSelectionIdx = betSelectionIdx >= 3 ? betSelectionIdx : 3;
  let index = betSelectionIdx;
  let betGold = 0;
  do {
    if (playerGold < (betGold + ChipList[betSelectionIdx])) {
      betSelectionIdx--;
    }
    betGold += ChipList[betSelectionIdx];
    --index;
  } while (index > 0);
  return betGold;
};

