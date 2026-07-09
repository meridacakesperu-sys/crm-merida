require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Student = require('./models/Student');

const DB_FILE = path.join(__dirname, 'db.json');

const migrate = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB Atlas.');

    // Leer db.json
    if (!fs.existsSync(DB_FILE)) {
      console.log('⚠️ No se encontró db.json. No hay nada que migrar.');
      process.exit(0);
    }

    const raw = fs.readFileSync(DB_FILE);
    const db = JSON.parse(raw);
    const students = db.students || [];

    if (students.length === 0) {
      console.log('⚠️ El archivo db.json está vacío.');
      process.exit(0);
    }

    console.log(`📦 Encontrados ${students.length} estudiantes. Iniciando migración...`);

    // Limpiar base de datos destino por si acaso (Opcional, pero recomendado en primera migración)
    await Student.deleteMany({});
    console.log('🧹 Base de datos limpia.');

    // Insertar todos los estudiantes
    const result = await Student.insertMany(students);
    
    console.log(`🎉 Migración completada. Se insertaron ${result.length} estudiantes exitosamente.`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    // Cerrar conexión
    mongoose.connection.close();
    process.exit(0);
  }
};

migrate();
