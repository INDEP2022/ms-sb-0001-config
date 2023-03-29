import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm"
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([/*entities here*/]),
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService]
})
export class ApplicationModule {}
