import { GameStatusEnum, StatusAcitonEnum } from "../enum/GameStatusEnum";
import IRedPacket from "../interface/IRedPacket";
import { ISettledInfo } from "../interface/ISettledInfo";
import { ICurrentRedPacketInfo } from "../interface/ICurrentRedPacketInfo";
import { IHadAddRedPacket } from "../interface/IHadAddRedPacket";
import { IGraberRedPacket } from "../interface/IGraberRedPacket";

/**
 * @property roomId              房间编号
 * @property roomStatus            房间状态
 * @property countDown             计 时 器
 */
export interface RoomWaitForHandoutRedPacketDTO {
  roomId: string;
  roomStatus: GameStatusEnum;
  countDown: number;
}

/**
 * 可抢红包时消息内容
 * @property roomId              房间编号
 * @property roomStatus            房间状态
 * @property countDown             计 时 器
 * @property currentRedPacketInfo  当前红包信息
 */
export interface RoomReadyForGrabDTO {
  roomId: String;
  roomStatus: GameStatusEnum;
  countDown: number;
  currentRedPacketInfo: ICurrentRedPacketInfo;
}

/**
 * 红包队列减少时，消息内容、
 * @property redPacketList 红包队列
 */
export interface redPacketQueueWithUpdateDTO {
  redPacketList: IRedPacket[];
}

/**
 * 运行完一局
 * @property gameRound     当前房间运行第几轮
 * @property redPacketList 红包队列
 * @property canBeSettled  可否结算
 */
export interface gameOverDTO {
  gameRound: number;
  redPackQueue: IRedPacket[];
  canBeSettled: boolean;
}

/**
 *  结算信息
 * @property gameRound     当前房间运行第几轮
 * @property redPacketList 红包队列
 * @property result        结算结果
 */
export interface SettledDTO {
  gameRound: number;
  redPackQueue: IRedPacket[];
  result: {
    grabberResult:ISettledInfo[],
    handoutResult:ISettledInfo
  };
}

/**
 * 是否还在红包队里
 * @property beInRedPacketList :false 下一轮就下队列
 */
export interface BeInRedPacketQueueDTO {
  beInRedPacketList: boolean;
}

/**
 * 有人发红包时会收到此消息
 * @property roomStatus      房间状态
 * @property hadAddRedPacket 发包人的信息和红包金额
 */
export interface HandOutRedPacketDTO {
  roomStatus: GameStatusEnum;
  hadAddRedPacket: IHadAddRedPacket;
}

/**
 * 有人抢红包时会接收到此消息
 * @property uid               玩家编号
 * @property headurl           头像
 * @property nickname          玩家昵称
 * @property vipScore          vip分
 * @property redPacketAmount   红包金额
 * @property gold              玩家金币
 * @property isStepInMine      是否中雷
 */
export interface GrabRedPacketDTO {
  uid: string;
  headurl: string;
  nickname: string;
  redPacketAmount: String;
  gold: number;
  isStepInMine: boolean;
}

/**
 * 生成对局用红包时会收到此消息
 * @property currentGraberQueue 待抢红包队列
 * @property gameRound          对局轮数
 */
export interface CurrentGraberQueueDTO {
  currentGraberQueue: IGraberRedPacket[];
  gameRound: number;
}