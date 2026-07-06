import request from "supertest";
import { describe, expect, jest, test, beforeEach, afterEach, beforeAll, afterAll } from "@jest/globals";
import { buildTestApp } from "./Utils/buildApp.js";
import { BadRequestError, ConflictError, NotFoundError } from '../../errors/AppErrors.js';
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";//sacar cuando funcion la conexion a mongo real
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { EspecialidadGenericaModel } from "../../schemas/especialidadGenericaSchema.js";
import { SedeModel } from "../../schemas/sedeSchema.js";

dotenv.config();

// Algunos entornos locales no tienen JWT_SECRET_KEY en el .env cargado por los tests;
// como acá sólo firmamos/verificamos tokens dentro del mismo proceso, un valor de fallback alcanza.
process.env.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "test-secret-key-integracion";

// El router de médicos exige verificarToken para POST/PUT/DELETE de servicios y disponibilidades;
// generamos el mismo payload que UsuarioService.login para simular al médico autenticado.
const generarTokenMedico = (medicoId) => jwt.sign(
    { userId: medicoId, userRol: "MEDICO", userName: "house" },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "10m" }
);

// crearDisponibilidad exige que la sede ya esté asignada al perfil del médico
const crearYAsignarSede = async (app, medicoId, token, nombre = 'Sede Central') => {
    const sede = await SedeModel.create({ nombre, direccion: 'Calle Falsa 123' });
    await request(app)
        .post(`/medicos/${medicoId}/sedes`)
        .set('Authorization', `Bearer ${token}`)
        .send({ sedesId: [sede._id.toString()] });
    return sede._id.toString();
};

// crearDisponibilidad exige al menos una especialidad o práctica propia del médico
const crearYAsignarEspecialidad = async (app, medicoId, token, nombre = 'Cardiología') => {
    const especialidadGenerica = await EspecialidadGenericaModel.create({ nombre, emoji: '🩺' });
    const servRes = await request(app)
        .post(`/medicos/${medicoId}/servicios`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            especialidad: {
                especialidadGenericaId: especialidadGenerica._id.toString(),
                duracionTurnoEnMins: 30,
                costo: 5000
            }
        });
    const especialidades = servRes.body.data.especialidades;
    return especialidades[especialidades.length - 1]._id;
};

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
            .set('Authorization', `Bearer ${generarTokenMedico(medicoId)}`)
            .send({
                nombre: 'Dr. House Updated',
                matricula: 'M-00123',
                nombreUsuario: 'house_updated',
                especialidades: [],
                practicas: [],
                sedes: [],
                disponibilidades: []
            });

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
            .delete(`/medicos/${medicoId}`)
            .set('Authorization', `Bearer ${generarTokenMedico(medicoId)}`);

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
        const token = generarTokenMedico(medicoId);
        const sedeId = await crearYAsignarSede(app, medicoId, token);
        const especialidadId = await crearYAsignarEspecialidad(app, medicoId, token);

        const response = await request(app)
            .post(`/medicos/${medicoId}/disponibilidades`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                diaSemana: 1,
                horaDesde: '10:00',
                horaHasta: '11:00',
                sede: sedeId,
                especialidades: [especialidadId]
            });

        // crearDisponibilidad devuelve al médico actualizado, con la disponibilidad recién creada anidada
        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.data.disponibilidades).toHaveLength(1);
        const dispoCreada = response.body.data.disponibilidades[0];
        expect(dispoCreada).toHaveProperty('_id');
        expect(dispoCreada.diaSemana).toBe(1);
        expect(dispoCreada.horaDesde).toBe('10:00');
        expect(dispoCreada.horaHasta).toBe('11:00');
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
        const token = generarTokenMedico(medicoId);
        const sedeId = await crearYAsignarSede(app, medicoId, token);
        const especialidadId = await crearYAsignarEspecialidad(app, medicoId, token);

        // Crear disponibilidad
        await request(app)
            .post(`/medicos/${medicoId}/disponibilidades`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                diaSemana: 1,
                horaDesde: '10:00',
                horaHasta: '11:00',
                sede: sedeId,
                especialidades: [especialidadId]
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
        const token = generarTokenMedico(medicoId);
        const sedeId = await crearYAsignarSede(app, medicoId, token);
        const especialidadId = await crearYAsignarEspecialidad(app, medicoId, token);

        const dispoRes = await request(app)
            .post(`/medicos/${medicoId}/disponibilidades`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                diaSemana: 1,
                horaDesde: '10:00',
                horaHasta: '11:00',
                sede: sedeId,
                especialidades: [especialidadId]
            });

        const dispoId = dispoRes.body.data.disponibilidades[0]._id;

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
        const token = generarTokenMedico(medicoId);
        const sedeId = await crearYAsignarSede(app, medicoId, token, 'Sede Central');
        const otraSedeId = await crearYAsignarSede(app, medicoId, token, 'Sede Norte');
        const especialidadId = await crearYAsignarEspecialidad(app, medicoId, token);

        const dispoRes = await request(app)
            .post(`/medicos/${medicoId}/disponibilidades`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                diaSemana: 1,
                horaDesde: '10:00',
                horaHasta: '11:00',
                sede: sedeId,
                especialidades: [especialidadId]
            });

        const dispoId = dispoRes.body.data.disponibilidades[0]._id;

        // El router sólo registra .patch para esta ruta (no .put); modificarDisponibilidad
        // tampoco permite reasignar el mismo dia/hora, sólo sede/especialidades/practicas
        const response = await request(app)
            .patch(`/medicos/${medicoId}/disponibilidades/${dispoId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                sede: otraSedeId
            });

        // modificarDisponibilidad también devuelve al médico actualizado completo
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        const dispoModificada = response.body.data.disponibilidades.find((d) => d._id === dispoId);
        expect(dispoModificada.sede._id).toBe(otraSedeId);
    });

    test('GET /medicos/:id/servicios - médico recién creado no tiene servicios', async () => {
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
            .get(`/medicos/${medicoId}/servicios`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.especialidades).toEqual([]);
        expect(response.body.data.practicas).toEqual([]);
    });

    test('POST /medicos/:id/servicios - agrega una especialidad y GET /servicios la refleja', async () => {
        const createRes = await request(app)
            .post('/medicos')
            .send({
                nombre: 'Dr. House',
                matricula: 'M-00123',
                nombreUsuario: 'house',
                password: 'pass123456'
            });

        const medicoId = createRes.body.data._id;

        const especialidadGenerica = await EspecialidadGenericaModel.create({
            nombre: 'Cardiología',
            emoji: '❤️'
        });

        const token = generarTokenMedico(medicoId);

        const postRes = await request(app)
            .post(`/medicos/${medicoId}/servicios`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                especialidad: {
                    especialidadGenericaId: especialidadGenerica._id.toString(),
                    duracionTurnoEnMins: 30,
                    costo: 5000
                }
            });

        expect(postRes.status).toBe(201);
        expect(postRes.body.status).toBe('success');

        const getRes = await request(app)
            .get(`/medicos/${medicoId}/servicios`);

        expect(getRes.status).toBe(200);
        expect(getRes.body.data.especialidades).toHaveLength(1);
        expect(getRes.body.data.especialidades[0].nombre).toBe('Cardiología');
        expect(getRes.body.data.practicas).toEqual([]);
    });

    test('POST /medicos/:id/servicios - rechaza si el token no pertenece al médico', async () => {
        const createRes = await request(app)
            .post('/medicos')
            .send({
                nombre: 'Dr. House',
                matricula: 'M-00123',
                nombreUsuario: 'house',
                password: 'pass123456'
            });

        const medicoId = createRes.body.data._id;

        const especialidadGenerica = await EspecialidadGenericaModel.create({
            nombre: 'Cardiología',
            emoji: '❤️'
        });

        const tokenDeOtroMedico = generarTokenMedico(new mongoose.Types.ObjectId().toString());

        const response = await request(app)
            .post(`/medicos/${medicoId}/servicios`)
            .set('Authorization', `Bearer ${tokenDeOtroMedico}`)
            .send({
                especialidad: {
                    especialidadGenericaId: especialidadGenerica._id.toString(),
                    duracionTurnoEnMins: 30,
                    costo: 5000
                }
            });

        expect(response.status).toBe(403);
        expect(response.body.status).toBe('fail');
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
            .set('Authorization', `Bearer ${generarTokenMedico(medicoId)}`)
            .send({
                diaSemana: 1,
                horaDesde: '15:00',
                horaHasta: '14:00',  // Hora final antes que inicial
                sede: new mongoose.Types.ObjectId().toString()
            });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('fail');
    });
});

