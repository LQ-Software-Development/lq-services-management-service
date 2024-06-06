import * as request from 'supertest';
import { config } from 'dotenv';
import { CreateServicesDto } from '../src/services/dto/create-services.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

config({ path: '.env', override: true });
config({ path: '.env.test', override: true });

import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('Create many services and list', async () => {
    for (let i = 0; i < 10; i++) {
      const servicesCreatedOutput = await request(app.getHttpServer())
        .post('/services')
        .send(makeServicesBody());

      expect(servicesCreatedOutput.status).toBe(201);
    }

    const servicesListOutput = await request(app.getHttpServer()).get(
      '/services?page=1&limit=10',
    );

    expect(servicesListOutput.status).toBe(200);
    expect(servicesListOutput.body.services).toEqual(
      expect.arrayContaining([]),
    );
  });

  it('List services to select', async () => {
    const suppliersToSelectOutput = await request(app.getHttpServer()).get(
      '/services/selection-list',
    );

    expect(suppliersToSelectOutput.status).toBe(200);
    expect(suppliersToSelectOutput.body.services).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
        }),
      ]),
    );
  });
});

function makeServicesBody(
  override?: Partial<CreateServicesDto>,
): CreateServicesDto {
  return {
    name: 'string',
    description: 'string',
    timeExecution: 60,
    coverUrl: 'http://google.com.br',
    servicePrice: 10,
    ...override,
  };
}
