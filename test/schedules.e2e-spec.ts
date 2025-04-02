import * as request from 'supertest'; // Importando supertest
import { exec, spawn } from 'child_process'; // Importando child_process para executar comandos
import { setTimeout } from 'timers/promises';
import { CreateScheduleDto } from 'src/schedules/dto/create-schedule.dto';
import { randomUUID } from 'crypto';

describe('SchedulesController (e2e)', () => {
  const organizationId = randomUUID();
  let createdScheduleId: string;
  const baseUrl = 'http://localhost:4000';
  let serverProcess;

  beforeAll(async () => {
    // Iniciando a aplicação
    serverProcess = spawn('npm', ['run', 'start:prod']);

    serverProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    serverProcess.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });

    await setTimeout(10000)
  }, 20000);

  afterAll(async () => {
    // Encerrando a aplicação
    serverProcess.kill('SIGINT');
    await setTimeout(5000)
  }, 10000);

  const createScheduleDto: CreateScheduleDto = {
    description: 'Test Schedule',
    date: new Date().toISOString(),
    organizationId,
  };

  const updateScheduleDto = {
    description: "Updated Test Schedule",
    date: new Date(Date.now() + 86400000).toISOString(),
  };

  it('/schedules (POST) - Create a schedule', async () => {
    return request(baseUrl)
      .post('/schedules')
      .send(createScheduleDto)
      .expect(201)
      .then(response => {
        expect(response.body).toBeDefined();
        expect(response.body[0].id).toBeDefined();
        createdScheduleId = response.body[0].id;
      });
  }, 10000);

  it('/schedules (GET) - Get all schedules', async () => {
    return request(baseUrl)
      .get('/schedules')
      .expect(200)
      .then(response => {
        expect(response.body).toBeDefined();
        expect(Array.isArray(response.body)).toBeTruthy();
      });
  }, 10000);

  it('/schedules/:id (GET) - Get a schedule by ID', async () => {
    return request(baseUrl)
      .get(`/schedules/${createdScheduleId}`)
      .expect(200)
      .then(response => {
        expect(response.body).toBeDefined();
        expect(response.body.id).toEqual(createdScheduleId);
      });
  }, 10000);

  it('/schedules/:id (PUT) - Update a schedule', async () => {
    return request(baseUrl)
      .put(`/schedules/${createdScheduleId}`)
      .send(updateScheduleDto)
      .expect(200)
      .then(response => {
        expect(response.body).toBeDefined();
        expect(response.body.id).toEqual(createdScheduleId);
        expect(response.body.description).toEqual(updateScheduleDto.description);
        expect(response.body.date).toEqual(updateScheduleDto.date);
      });
  }, 10000);

  it('/schedules/:id (DELETE) - Delete a schedule', async () => {
    return request(baseUrl)
      .delete(`/schedules/${createdScheduleId}`)
      .expect(200)
      .then(async (response) => {
        expect(response.status).toBe(200);

        // await setTimeout(2000);

        // await request(baseUrl)
        //   .get(`/schedules/${createdScheduleId}`)
        //   .expect(404);
      });
  }, 10000);
});
