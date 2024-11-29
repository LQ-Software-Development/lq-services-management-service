import { Injectable } from '@nestjs/common';
import * as axios from 'axios';

@Injectable()
export class FinancialApiProvider {
  private readonly financialApiUrl: string;
  public readonly financialApiAxios: axios.Axios;

  constructor() {
    if (!process.env.FINANCIAL_API_URL) {
      this.generateFinanicialTransaction = async () => {};
    }

    this.financialApiUrl = process.env.FINANCIAL_API_URL;
    this.financialApiAxios = axios.default.create({
      baseURL: this.financialApiUrl,
    });
  }

  async generateFinanicialTransaction({
    amount,
    description,
    date,
    organizationId,
  }: GenerateFinanicialTransactionDto) {
    await this.financialApiAxios.post('/transactions', {
      type: 'income',
      amount,
      description,
      date,
      externalId: organizationId,
    });
  }
}

interface GenerateFinanicialTransactionDto {
  amount: number;
  description: string;
  date: Date;
  organizationId: string;
}
