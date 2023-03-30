import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm"
import { AssetsStatusrevEntity } from '../infrastructure/entities/assets-statusrev.entity';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssetsStatusrevEntity]),
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService]
})
export class ApplicationModule {}
