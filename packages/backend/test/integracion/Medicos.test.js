import request from "supertest";
import { describe, expect, jest, test, beforeEach, afterEach, beforeAll, afterAll } from "@jest/globals";
import { buildTestApp } from "./Utils/buildApp.js";
import { BadRequestError, ConflictError, NotFoundError } from '../../errors/AppErrors.js';
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";//sacar cuando funcion la conexion a mongo real
import dotenv from "dotenv";

dotenv.config();

describe("Medicos API - Integración", () => {
    let app;
    let medicoCreado;
    let usuarioCreado;
    let mongoServer;

beforeAll(async () => {
    // Iniciar servidor MongoDB en memoria
    mongoServer = await MongoMemoryServer.create();  //todo: sacar cuando funcione la conexion a mongo real
    const mongoUri = mongoServer.getUri();
    
    // Conectar mongoose a la instancia en memoria
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri, {
            dbName: 'test-medicos'
        });
    }
});

    afterAll(async () => {
        // Desconectar mongoose
        await mongoose.connection.close();
        // Detener servidor MongoDB en memoria
        await mongoServer.stop();
    });

    beforeEach(async () => {
        app = buildTestApp();

        // Limpiar colecciones antes de cada test
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    });

    afterEach(async () => {
        // Limpiar después de cada test
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    });

    test('POST /medicos - crea un nuevo médico', async () => {
        const response = await request(app)
            .post('/medicos')
            .send({
                nombre: 'Dr. House',
                matricula: 'M-00123',
                nombreUsuario: 'house',
                password: 'pass123456'
            });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveProperty('_id');
        expect(response.body.data.nombre).toBe('Dr. House');
        expect(response.body.data.matricula).toBe('M-00123');
        
        medicoCreado = response.body.data;
    });

    test('POST /medicos - rechaza matrícula duplicada', async () => {
        // Crear primer médico
        await request(app)
            .post('/medicos')
            .send({
                nombre: 'Dr. House',
                matricula: 'M-00123',
                nombreUsuario: 'house',
                password: 'pass123456'
            });

        // Intentar crear con misma matrícula
        const response = await request(app)
            .post('/medicos')
            .send({
                nombre: 'Dr. Wilson',
                matricula: 'M-00123',
                nombreUsuario: 'wilson',
                password: 'pass123456'
            });

        expect(response.status).toBe(409);
        expect(response.body.status).toBe('fail');
    });

    test('GET /medicos - obtiene lista de médicos', async () => {
        // Crear dos médicos
        await request(app)
            .post('/medicos')
            .send({
                nombre: 'Dr. House',
                matricula: 'M-001',
                nombreUsuario: 'house',
                password: 'pass123456'
            });

        await request(app)
            .post('/medicos')
            .send({
                nombre: 'Dr. Wilson',
                matricula: 'M-002',
                nombreUsuario: 'wilson',
                password: 'pass123456'
            });

        const response = await request(app)
            .get('/medicos')
            .query({ page: 1, limit: 10 });
        
        console.log("GET /medicos response.body:", response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(2);
        expect(response.body.paginacion.totalMedicos).toBe(2);
    });

    test('GET /medicos/:id - obtiene un médico específico', async () => {
        const createRes = await request(app)
            .post('/medicos')
            .send({
                nombre: 'Dr. House',
                matricula: 'M-00123',
                nombreUsuario: 'house',
                password: 'pass123456'
            });

        const medicoId = createRes.body.data._id;

        const response = await request(app)
            .get(`/medicos/${medicoId}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data._id).toBe(medicoId);
        expect(response.body.data.nombre).toBe('Dr. House');
    });

    test('GET /medicos/:id - retorna 404 si no existe', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .get(`/medicos/${fakeId}`);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('fail');
    });

    test('PUT /medicos/:id - actualiza un médico', async () => {
        const createRes = await request(app)
            .post('/medicos')
            .send({
                nombre: 'Dr. House',
                matricula: 'M-00123',
                nombreUsuario: 'house',
                password: 'pass123456'
            });

        const medicoId = createRes.body.data._id;

        const response = await request(app)
            .put(`/medicos/${medicoId}`)
            .send({
                nombre: 'Dr. House Updated',
                matricula: 'M-00123',
                nombreUsuario: 'house_updated',
                password: 'newpass123456',
                especialidades: [],
                practicas: [],
                sedes: [],
                disponibilidades: [],
                usuario: createRes.body.data.usuario
            });
        
        console.log(response)
            
        console.log("PUT /medicos/:id response.body:", response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.nombre).toBe('Dr. House Updated');
    });

    test('DELETE /medicos/:id - elimina un médico', async () => {
        const createRes = await request(app)
            .post('/medicos')
            .send({
                nombre: 'Dr. House',
                matricula: 'M-00123',
                nombreUsuario: 'house',
                password: 'pass123456'
            });

        const medicoId = createRes.body.data._id;

        const deleteRes = await request(app)
            .delete(`/medicos/${medicoId}`);
            
        console.log("DELETE /medicos/:id response.body:", deleteRes.body);

        expect(deleteRes.status).toBe(200);
        expect(deleteRes.body.status).toBe('success');

        // Verificar que ya no existe
        const getRes = await request(app)
            .get(`/medicos/${medicoId}`);

        expect(getRes.status).toBe(404);
    });

    test('POST /medicos/:id/disponibilidades - crea disponibilidad', async () => {
        const createRes = await request(app)
            .post('/medicos')
            .send({
                nombre: 'Dr. House',
                matricula: 'M-00123',
                nombreUsuario: 'house',
                password: 'pass123456'
            });

        const medicoId = createRes.body.data._id;

        const response = await request(app)
            .post(`/medicos/${medicoId}/disponibilidades`)
            .send({
                diaSemana: 1,
                horaDesde: '10:00',
                horaHasta: '11:00',
                sede: {
                    _id: new mongoose.Types.ObjectId(),
                    nombre: 'Sede Central'
                }
            });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveProperty('_id');
        expect(response.body.data.diaSemana).toBe(1);
        expect(response.body.data.horaDesde).toBe('10:00');
        expect(response.body.data.horaHasta).toBe('11:00');
    });

    test('GET /medicos/:id/disponibilidades - lista disponibilidades', async () => {
        const createRes = await request(app)
            .post('/medicos')
            .send({
                nombre: 'Dr. House',
                matricula: 'M-00123',
                nombreUsuario: 'house',
                password: 'pass123456'
            });

        const medicoId = createRes.body.data._id;

        // Crear disponibilidad
        await request(app)
            .post(`/medicos/${medicoId}/disponibilidades`)
            .send({
                diaSemana: 1,
                horaDesde: '10:00',
                horaHasta: '11:00',
                sede: {
                    _id: new mongoose.Types.ObjectId(),
                    nombre: 'Sede Central'
                }
            });

        const response = await request(app)
            .get(`/medicos/${medicoId}/disponibilidades`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('GET /medicos/:id/disponibilidades/:disponibilidadId - obtiene disponibilidad', async () => {
        const createRes = await request(app)
            .post('/medicos')
            .send({
                nombre: 'Dr. House',
                matricula: 'M-00123',
                nombreUsuario: 'house',
                password: 'pass123456'
            });

        const medicoId = createRes.body.data._id;

        const dispoRes = await request(app)
            .post(`/medicos/${medicoId}/disponibilidades`)
            .send({
                diaSemana: 1,
                horaDesde: '10:00',
                horaHasta: '11:00',
                sede: {
                    _id: new mongoose.Types.ObjectId(),
                    nombre: 'Sede Central'
                }
            });
        
        console.log("dispoRes.body:", dispoRes.body);


        const dispoId = dispoRes.body.data._id;

        const response = await request(app)
            .get(`/medicos/${medicoId}/disponibilidades/${dispoId}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data._id).toBe(dispoId);
    });

    test('PUT /medicos/:id/disponibilidades/:disponibilidadId - modifica disponibilidad', async () => {
        const createRes = await request(app)
            .post('/medicos')
            .send({
                nombre: 'Dr. House',
                matricula: 'M-00123',
                nombreUsuario: 'house',
                password: 'pass123456'
            });

        const medicoId = createRes.body.data._id;

        const dispoRes = await request(app)
            .post(`/medicos/${medicoId}/disponibilidades`)
            .send({
                diaSemana: 1,
                horaDesde: '10:00',
                horaHasta: '11:00',
                sede: {
                    _id: new mongoose.Types.ObjectId(),
                    nombre: 'Sede Central'
                }
            });

        const dispoId = dispoRes.body.data._id;

        const response = await request(app)
            .put(`/medicos/${medicoId}/disponibilidades/${dispoId}`)
            .send({
                diaSemana: 2,
                horaDesde: '14:00',
                horaHasta: '15:00',
                sede: {
                    _id: new mongoose.Types.ObjectId(),
                    nombre: 'Sede Central'
                }
            });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.diaSemana).toBe(2);
        expect(response.body.data.horaDesde).toBe('14:00');
    });

    test('POST /medicos - rechaza datos inválidos', async () => {
        const response = await request(app)
            .post('/medicos')
            .send({
                nombre: '',
                matricula: '',
                nombreUsuario: 'house',
                password: 'short'
            });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
    });

    test('POST /medicos/:id/disponibilidades - rechaza horario inválido', async () => {
        const createRes = await request(app)
            .post('/medicos')
            .send({
                nombre: 'Dr. House',
                matricula: 'M-00123',
                nombreUsuario: 'house',
                password: 'pass123456'
            });

        const medicoId = createRes.body.data._id;

        const response = await request(app)
            .post(`/medicos/${medicoId}/disponibilidades`)
            .send({
                diaSemana: 1,
                horaDesde: '15:00',
                horaHasta: '14:00',  // Hora final antes que inicial
                sede: {
                    _id: new mongoose.Types.ObjectId(),
                    nombre: 'Sede Central'
                }
            });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
    });
});

