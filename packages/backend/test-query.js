import mongoose from 'mongoose';

async function main() {
    await mongoose.connect('mongodb+srv://nscatolon:FE3CK8RvZSQwNF9X@cluster0.uvoxkxg.mongodb.net/sweet-medical');
    
    const Especialidad = mongoose.model('Especialidad', new mongoose.Schema({
        especialidadGenerica: mongoose.Schema.Types.ObjectId
    }, { collection: 'especialidades' }));

    const Turno = mongoose.model('Turno', new mongoose.Schema({
        especialidad: [mongoose.Schema.Types.ObjectId]
    }, { collection: 'turnos' }));

    const ids = await Especialidad.find({ especialidadGenerica: '6a0b5138544283eee122e587' }).distinct('_id');
    console.log('Especialidades concretas encontradas:', ids);

    const turnos = await Turno.find({ especialidad: { $in: ids } });
    console.log('Turnos encontrados con esas especialidades:', turnos.length);

    process.exit(0);
}

main().catch(console.error);
