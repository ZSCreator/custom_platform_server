import {ElementsEnum} from "./elemenets";

export const award = {
  [ElementsEnum.Ghost]: [2, 30],
  [ElementsEnum.Zombie]: [2, 5, 7, 30],
  [ElementsEnum.Vampire]: [2, 5, 30, 75],
  [ElementsEnum.Wizard]: [7, 100, 150],
  [ElementsEnum.Scarecrow]: [10, 50, 200],
  [ElementsEnum.ClayPot]: [1, 2, 3],
  [ElementsEnum.Witch]: [1, 2, 2000],
  [ElementsEnum.Magician]: [250, 500, 2000],
  [ElementsEnum.Demon]: [500, 100, 2000],
  [ElementsEnum.Pumpkin]: [200, 2000, 10000],
};

export const awardRow = {
  [ElementsEnum.Ghost]: 20,
  [ElementsEnum.Zombie]: 20,
  [ElementsEnum.Scarecrow]: 100,
  [ElementsEnum.Magician]: 200,
  [ElementsEnum.Demon]: 250,
  [ElementsEnum.Pumpkin]: 300,
}