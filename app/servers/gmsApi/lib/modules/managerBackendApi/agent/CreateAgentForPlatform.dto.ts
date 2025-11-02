import { IsNotEmpty, Min } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateAgentForPlatform {

    @ApiProperty({ description: "代理编号" })
    @IsNotEmpty({ message: "代理名不能为空" })
    platform: string;

    @ApiProperty({ description: "代理或平台编号" })
    @IsNotEmpty({ message: "平台或代理编号不能为空" })
    agentUid: string;

    @ApiProperty({ description: "语言" })
    @IsNotEmpty({ message: "语言不能为空" })
    language: string;

    @ApiProperty({ description: "金币" })
    @Min(0, { message: "平台金币应大于或等于 0" })
    gold: number;
}
