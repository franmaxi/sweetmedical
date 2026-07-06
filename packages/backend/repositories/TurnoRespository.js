import mongoose from "mongoose"
import { TurnoModel } from "../schemas/turnoSchema.js"
import { EspecialidadModel } from "../schemas/especialidadSchema.js"
import { PracticaModel } from "../schemas/practicaSchema.js"
import { EstadoTurno } from "../domain/Enumerados/EstadoTurno.js"


export class TurnoRepository {
    constructor() {
        this.model = TurnoModel;
    }

    async findById(id) {
        return await this.model.findById(id)
            .populate("medico")
            .populate("paciente")
            .populate("sede")
            .populate('especialidad')
            .populate('practica')
            .populate('historialEstados')
    }

    async findAll(filtros = {}) {
        return await this.model.find(filtros)
            .populate("medico")
            .populate("paciente")
            .populate("sede")
            .populate('disponibilidad')
            .populate('especialidad')
            .populate('practica');
    }

    async findAllDispoPopulado(filtros = {}) {
        return await this.model.find(filtros)
            .populate("disponibilidad")
            .populate("disponibilidad.practicas")
            .populate("disponibilidad.especialidades")
    }


    async obtenerSiguientesDisponibles(fechaTurno, fechaMaximo, medicoId) {

        // devuelve los turnos entre las fechas dadas, que esten disponibles, sean para el medico pasado por parametro
        // se devuelve ordenado por fechaHora de menor a mayor
        return await this.model.find({
            medico: medicoId, // estaba como medico id, pero el turno tiene atributo medico
            estado: EstadoTurno.DISPONIBLE,
            fechaHora: {
                $gt: fechaTurno,
                $lt: fechaMaximo
            }
        }).sort({ fechaHora: 1 })
    }

    _toPersistence(turno) {
        // se llama justo antes de persistir el turno
        // esta funcion se asegura que el dato que pasemos este en formato ObjectID si asi debe serlo
        if (!turno) return null;

        const getId = (val) => {
            if (!val) return null;
            if (typeof val === 'string') return val;
            if (typeof val === 'object') {
                if (val._id) return val._id.toString();
                if (val.constructor && val.constructor.name === 'ObjectId') return val.toString();
            }
            return val;
        };

        const mapToArray = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) {
                return val.map(item => getId(item)).filter(Boolean);
            }
            return [getId(val)];
        };

        return {
            _id: turno._id,
            medico: getId(turno.medico),
            paciente: getId(turno.paciente),
            fechaHora: turno.fechaHora,
            sede: getId(turno.sede),
            practica: mapToArray(turno.practica),
            especialidad: mapToArray(turno.especialidad),
            estado: turno.estado,
            historialEstados: turno.historialEstados,
            costo: turno.costo,
            disponibilidad: getId(turno.disponibilidad),
            modificado: turno.modificado,
            solicitudCambio: turno.solicitudCambio
        };
    }

    async save(turno) {
        const persistenceTurno = this._toPersistence(turno);
        const nuevoTurno = new this.model(persistenceTurno);
        return await nuevoTurno.save();
    }

    async update(id, turnoModificado) {
        const persistenceTurno = this._toPersistence(turnoModificado);
        return await this.model.findByIdAndUpdate(id, persistenceTurno, { new: true });
    }

        async findByMedicoAndFechaHora(medicoId, fechaHora) {
        return await this.model.findOne({
            medico: medicoId,
            fechaHora: fechaHora
        });
    }

    /**
     * Update ATÓMICO condicionado a que el turno siga DISPONIBLE.
     * Devuelve el turno actualizado, o null si otro proceso ya lo tomó
     * (control de concurrencia: la transición DISPONIBLE -> X es atómica en Mongo).
     */
    async updateSiDisponible(id, turnoModificado) {
        const persistenceTurno = this._toPersistence(turnoModificado);
        return await this.model.findOneAndUpdate(
            { _id: id, estado: EstadoTurno.DISPONIBLE },
            persistenceTurno,
            { new: true }
        );
    }

    /** Libera turnos dejándolos DISPONIBLE otra vez (para revertir reservas parciales). */
    async liberarTurnos(ids) {
        if (!ids?.length) return;
        return await this.model.updateMany(
            { _id: { $in: ids } },
            { $set: { estado: EstadoTurno.DISPONIBLE, paciente: null, costo: null, modificado: false } }
        );
    }

    async updateMany(ids, datosAActualizar) {
        return await this.model.updateMany(
            { _id: { $in: ids } },
            { $set: datosAActualizar }
        );
    }

    async delete(id) {
        return await this.model.findByIdAndDelete(id);
    }

    async eliminarTurnosDisponibles(disponibilidadId, fecha) {
        return await this.model.deleteMany({
            disponibilidad: disponibilidadId,
            estado: EstadoTurno.DISPONIBLE,
            fechaHora: { $gt: fecha }
        });
    }

    async desvincularDisponibilidad(disponibilidadId) {
        return await this.model.updateMany(
            { disponibilidad: disponibilidadId },
            { $set: { disponibilidad: null } }
        );
    }

    async obtenerPaginados(numeroPagina, limitePorPagina, filtros = {}, ordenamiento = [], coberturaOrden = null) {

        const match = await this.construirMatch(filtros);
        const ordenarPorCosto = ordenamiento.some(o => o.campo === 'costoFinal');

        if (ordenarPorCosto) {
            return this.obtenerPaginadosPorCosto(numeroPagina, limitePorPagina, match, ordenamiento, filtros, coberturaOrden);
        }

        // Por mas que no pasen un ordenamiento, se lo vamos a devolver ordenado por fecha asc
        const sort = this.construirSort(ordenamiento);
        const skip = (numeroPagina - 1) * limitePorPagina;
        const totalTurnos = await this.model.countDocuments(match);
        const totalPaginas = totalTurnos === 0 ? 0 : Math.ceil(totalTurnos / limitePorPagina);

        const turnos = await this.model.find(match)
            .sort(sort)
            .populate('medico')
            .populate('sede')
            .populate('especialidad')
            .populate('practica')
            .skip(skip)
            .limit(limitePorPagina);

        return { turnos, totalTurnos, totalPaginas };
    }

    construirSort(ordenamiento, aliases = {}) {
        // Armamos el ordenamiento, agregue que podamos ordenar por mas de un parametro,
        // podemos ordenar por fecha y hora, costoFinal o ambos al mismo tiempo
        if (!ordenamiento.length) return { fechaHora: 1 };

        return ordenamiento.reduce((sort, { campo, direccion }) => {
            const campoFinal = aliases[campo] ?? campo;
            sort[campoFinal] = direccion === 'desc' ? -1 : 1;
            return sort;
        }, {});
    }

    async obtenerPaginadosPorCosto(numeroPagina, limitePorPagina, match, ordenamiento, filtros, coberturaOrden = null) {
        const esEspecialidad = !!filtros.especialidadId;
        const sort = this.construirSort(ordenamiento, { costoFinal: 'costoFinalOrdenamiento' });
        const skip = (numeroPagina - 1) * limitePorPagina;

        // Calcular el multiplicador de cobertura del paciente para esta especialidad/práctica.
        // Se computa en JS y se embebe como constante en el pipeline de MongoDB.
        // Ejemplos: TOTAL → 0, PARCIAL 60% → 0.40 (paciente paga el 40%), sin cobertura → 1
        let multiplicadorCobertura = 1;
        if (coberturaOrden) {
            if (coberturaOrden.nivel === 'TOTAL') {
                multiplicadorCobertura = 0;
            } else if (coberturaOrden.nivel === 'PARCIAL') {
                multiplicadorCobertura = 1 - coberturaOrden.pocentajeDescuento / 100;
            }
        }

        const pipeline = [
            { $match: match },

            {
                $lookup: {
                    from: esEspecialidad ? 'especialidades' : 'practicas',
                    let: { ids: { $ifNull: [esEspecialidad ? '$especialidad' : '$practica', []] } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $in: ['$_id', '$$ids'] },
                                        { $in: [{ $toString: '$_id' }, '$$ids'] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'itemsParaOrdenar'
                }
            },

            {
                $addFields: {
                    // Aplicar el multiplicador de cobertura del paciente sobre el costo base
                    // de la especialidad/práctica para obtener el costoFinal real post-descuento
                    costoFinalOrdenamiento: {
                        $multiply: [{ $min: '$itemsParaOrdenar.costo' }, multiplicadorCobertura]
                    }
                }
            },

            { $sort: sort },

            {
                $facet: {
                    ids: [{ $skip: skip }, { $limit: limitePorPagina }, { $project: { _id: 1 } }],
                    total: [{ $count: 'count' }]
                }
            }
        ];

        const [resultado] = await this.model.aggregate(pipeline);
        const totalTurnos = resultado.total[0]?.count ?? 0;
        const totalPaginas = totalTurnos === 0 ? 0 : Math.ceil(totalTurnos / limitePorPagina);

        if (totalTurnos === 0) return { turnos: [], totalTurnos, totalPaginas };

        // Re-fetcheamos los turnos por ID con populate completo, preservando el orden del aggregation
        const idsOrdenados = resultado.ids.map(t => t._id);
        const turnosSinOrden = await this.model
            .find({ _id: { $in: idsOrdenados } })
            .populate('medico')
            .populate('sede')
            .populate('especialidad')
            .populate('practica');

        // Reordenamos según el orden del aggregation (find no garantiza el orden de $in)
        const turnosMap = new Map(turnosSinOrden.map(t => [t._id.toString(), t]));
        const turnos = idsOrdenados.map(id => turnosMap.get(id.toString())).filter(Boolean);

        return { turnos, totalTurnos, totalPaginas };
    }

    async construirMatch(filtros) {
        const match = {};

        if (filtros.estado) {
            if (Array.isArray(filtros.estado)) {
                match.estado = { $in: filtros.estado };
            } else {
                match.estado = filtros.estado;
            }
        } else {
            match.estado = { $ne: EstadoTurno.COMBINADO };
        }

        if (filtros.paciente) {
            match.paciente = new mongoose.Types.ObjectId(filtros.paciente);
        }

        const idMedico = filtros.medicoId || filtros.medico;
        if (idMedico) {
            match.medico = new mongoose.Types.ObjectId(idMedico);
        }

        if (filtros.sedeId) {
            match.sede = new mongoose.Types.ObjectId(filtros.sedeId);
        }


        if (filtros.especialidadId) {
            const ids = await EspecialidadModel
                .find({ especialidadGenerica: filtros.especialidadId })
                .distinct('_id');
            const stringIds = ids.map(id => id.toString());
            match.especialidad = { $in: [...ids, ...stringIds] };
        }

        if (filtros.practicaId) {
            const ids = await PracticaModel
                .find({ practicaGenerica: filtros.practicaId })
                .distinct('_id');
            const stringIds = ids.map(id => id.toString());
            match.practica = { $in: [...ids, ...stringIds] };
        }

        if (filtros.desde || filtros.hasta) {
            match.fechaHora = {};
            if (filtros.desde) match.fechaHora.$gte = filtros.desde;
            if (filtros.hasta) match.fechaHora.$lte = filtros.hasta;
        }

        // Filtro adicional: solo devolver turnos que tengan al menos una especialidad o una práctica
        match.$or = [
            { 'especialidad.0': { $exists: true } },
            { 'practica.0': { $exists: true } }
        ];

        return match;
    }
    async obtenerCombinados(turno) {
        const duracion = turno.especialidad?.[0]?.duracionTurnoEnMins ?? turno.practica?.[0]?.duracionTurnoEnMins
        const fechaFin = new Date(turno.fechaHora.getTime() + duracion * 60 * 1000)
        return await this.model.find({
            medico: turno.medico._id,
            estado: EstadoTurno.COMBINADO,
            fechaHora: { $gt: turno.fechaHora, $lt: fechaFin }
        })
            .sort({ fechaHora: 1 })
            .populate('medico')
            .populate('paciente')
    }

    async saveAllBatch(turnos) {
        if (!turnos || turnos.length === 0) return [];
        const persistenceTurnos = turnos.map(t => this._toPersistence(t));
        return await this.model.insertMany(persistenceTurnos);
    }

    async deleteAllDisponiblesBefore(fecha){
        // me tiene que llegar la fecha con la hora en 23:59 para que borre ese dia incluido
        const resultado = await this.model.deleteMany({
            estado: EstadoTurno.DISPONIBLE,
            fechaHora: { $lt: fecha } // menor que pero no inclusive
        });
        // resultado devolverá un objeto con este formato: { acknowledged: true, deletedCount: 50 }
        return resultado;
    }
}