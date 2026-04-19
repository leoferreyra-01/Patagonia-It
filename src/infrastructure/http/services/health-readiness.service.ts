import { Injectable } from '@nestjs/common';
import { FileStorage } from '../../persistence/file-storage';

type ReadinessProbeEntry = {
  checkedAt: string;
};

@Injectable()
export class HealthReadinessService {
  private readonly probeFilePath = '__health/readiness-probe.json';

  constructor(private readonly storage: FileStorage) {}

  async checkPersistence(): Promise<void> {
    const currentProbe = await this.storage.readArray<ReadinessProbeEntry>(
      this.probeFilePath,
    );

    await this.storage.writeArray(this.probeFilePath, currentProbe);
  }
}