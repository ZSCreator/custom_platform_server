import { IsNotEmpty, Min } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAgentGoldFromPlatform {
    @ApiProperty({ description: "平台编号" })
    @IsNotEmpty({ message: "平台名不能为空" })
    plateform: string;

    @ApiProperty({ description: "代理编号" })
    @IsNotEmpty({ message: "不能为空" })
    uid: string;

    @ApiProperty({ description: "变动金币" })
    gold: number;

    manager : string;

}
