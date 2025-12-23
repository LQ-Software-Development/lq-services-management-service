import { Injectable, Logger } from '@nestjs/common';
import * as axios from 'axios';

@Injectable()
export class HrApiProvider {
  private readonly logger = new Logger(HrApiProvider.name);
  private readonly hrApiUrl: string;
  private readonly hrApiAxios: axios.Axios;

  constructor() {
    if (!process.env.HR_API_URL) {
      this.logger.warn('HR_API_URL not configured, HR API calls will be skipped');
      this.stopTimeLogByService = async () => { };
      return;
    }

    this.hrApiUrl = process.env.HR_API_URL;
    this.hrApiAxios = axios.default.create({
      baseURL: this.hrApiUrl,
    });
  }

  async stopTimeLogByService(serviceId: string, bearerToken: string): Promise<void> {
    try {
      await this.hrApiAxios.put(
        `/time-logs/stop-by-service/${serviceId}`,
        {},
        {
          headers: {
            Authorization: bearerToken,
          },
        },
      );
      this.logger.log(`Successfully stopped time log for service ${serviceId}`);
    } catch (error) {
      this.logger.warn(
        `Failed to stop time log for service ${serviceId}: ${error.message}`,
      );
    }
  }
}
