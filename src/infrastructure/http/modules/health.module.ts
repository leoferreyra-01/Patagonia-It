import { Module } from '@nestjs/common';
import { HealthController } from '../controllers/health.controller';
import { FileStorage } from '../../persistence/file-storage';
import { HealthReadinessService } from '../services/health-readiness.service';

@Module({
  controllers: [HealthController],
  providers: [FileStorage, HealthReadinessService],
})
export class HealthModule {}
