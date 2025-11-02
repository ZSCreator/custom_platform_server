import { Module } from '@nestjs/common';
import { SystemController } from './system.controller';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { SystemService } from './system.service';

@Module({
    controllers: [SystemController, GameController],
    providers: [SystemService, GameService],
})
export class SystemModule { }