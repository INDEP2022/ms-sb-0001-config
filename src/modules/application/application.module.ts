import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm"
import { CatReasonsrevEntity } from "../infrastructure/entities/cat-reasonsrev.entity";
import { EatEventsEntity } from "../infrastructure/entities/eat-events.entity";
import { GoodsStatusrevEntity } from "../infrastructure/entities/goods-statusrev.entity";
import { ResponsibleAttentionEntity } from "../infrastructure/entities/responsible-attention.entity";
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CatReasonsrevEntity, EatEventsEntity, GoodsStatusrevEntity, ResponsibleAttentionEntity]),
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService]
})
export class ApplicationModule {}
