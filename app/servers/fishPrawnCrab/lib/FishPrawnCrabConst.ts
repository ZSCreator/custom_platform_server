import * as hallConst from '../../../consts/hallConst';

export const CHANNEL_NAME = 'FishPrawnCrab';

//下注区域得标识
export const AREA = {
    ONE:'ONE',   //任一围骰
    HL:'HL',   //葫芦
    PX:'PX',  //螃蟹
    FISH:'FISH',   //鱼
    GOLD:'GOLD',  //钱币
    JI:'JI',      //鸡
    XIA:'XIA',    //虾
    FISH_XIA:'FISH_XIA',   //鱼-虾
    XIA_HL:'XIA_HL',   //虾-葫芦
    HL_PX:'HL_PX',   //葫芦- 螃蟹
    FISH_HL:'FISH_HL',  //鱼——葫芦
    XIA_GOLD:'XIA_GOLD',  //虾-钱币
    HL_JI:'HL_JI',   //葫芦-鸡
    FISH_GOLD:'FISH_GOLD',  //鱼_钱币
    XIA_PX:'XIA_PX',  //虾——螃蟹
    GOLD_PX:'GOLD_PX',  //金币_螃蟹
    FISH_PX:'FISH_PX',  //鱼_螃蟹
    XIA_JI:'XIA_JI',  //虾——鸡
    GOLD_JI:'GOLD_JI',  //钱币-鸡
    FISH_JI:'FISH_JI',  //鱼_鸡
    HL_GOLD:'HL_GOLD',  //葫芦_钱币
    PX_JI:'PX_JI',  //螃蟹——鸡

}

//限红
export const XIAN_HONG = {
    one : 300000,
    two : 1000000,
    three : 3000000,
}


//是否记录机器人日志
export const LOG_ISROBOT = hallConst.LOG_ISROBOT !== null ? hallConst.LOG_ISROBOT : true;


// 对押区域
export const mapping = {
    play: 'bank',
    bank: 'play',
    small: 'big',
    big: 'small',
};

/**  骰子得标识
 *    HL:'HL',   //葫芦
     PX:'PX',  //螃蟹
     FISH:'FISH',   //鱼
     GOLD:'GOLD',  //钱币
     JI:'JI',      //鸡
     XIA:'XIA',    //虾
  */

/**
 * 下注种类
 */
export const AREA_TYPE = ['one', 'two', 'three'];

export const DICE_AREA = ['HL', 'PX', 'FISH', 'GOLD','XIA','JI'];

export const DOUBLE_AREA = ['FISH_XIA', 'XIA_HL', 'HL_PX', 'FISH_HL','XIA_GOLD','HL_JI', 'FISH_GOLD','XIA_PX',
                            'GOLD_PX','FISH_PX','XIA_JI','GOLD_JI','FISH_JI','HL_GOLD','PX_JI'];

export const ALL_AREA = ['FISH_XIA', 'XIA_HL', 'HL_PX', 'FISH_HL','XIA_GOLD','HL_JI', 'FISH_GOLD','XIA_PX',
                        'GOLD_PX','FISH_PX','XIA_JI','GOLD_JI','FISH_JI','HL_GOLD','PX_JI','HL', 'PX', 'FISH', 'GOLD','XIA','JI','ONE'];
/**
 * 赔率得设置
 * 任意围骰：1：31
 * 单骰：1：2
 * 双骰：1：3
 * 三骰：1：4
 * 各为单骰：1：6
 * 任一为双骰：1：8
 */

export const DICE_ODDS = {
    one :  31,
    single : 2,
    double : 3,
    three  : 4,
    doubleSingle: 6,
    doubleTwo: 8,
 };



