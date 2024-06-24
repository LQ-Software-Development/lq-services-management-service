import { Module } from '@nestjs/common';
import { BoardsController } from './boards.controller';

@Module({
  controllers: [BoardsController],
  providers: [],
})
export class BoardsModule {}
