import { IsNotEmpty, Min } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGoldForPlatform {

    @ApiProperty({ description: "平台编号" })
    @IsNotEmpty({ message: "平台平台不能为空" })
    platfromUid: string;

    @ApiProperty({ description: "变动金币" })
    gold: number;

    manager: string;

}
