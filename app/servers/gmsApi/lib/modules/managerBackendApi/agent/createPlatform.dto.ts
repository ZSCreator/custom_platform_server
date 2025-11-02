import { IsNotEmpty, Min } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlatform {

    @ApiProperty({ description: "平台编号" })
    @IsNotEmpty({ message: "平台名不能为空" })
    platform: string;

    @ApiProperty({ description: "平台金币" })
    @IsNotEmpty({ message: "平台金币不能为空" })
    @Min(0, { message: "平台金币应大于或等于 0" })
    gold: number;


    @ApiProperty({ description: "平台语言" })
    @IsNotEmpty({ message: "平台语言不能为空" })
    language: string;
    manager: string;
}
