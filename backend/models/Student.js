const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  fecha: { type: String, required: true },
  monto: { type: String, required: true },
  moneda: { type: String, required: true },
  concepto: { type: String, required: true },
  planAnterior: { type: String }
}, { _id: false });

const studentSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // Keep the old ID for compatibility
  wpId: { type: Number },
  nombre: { type: String, required: true },
  email: { type: String },
  usuario: { type: String },
  password: { type: String },
  numero: { type: String },
  pais: { type: String },
  plan: { type: String },
  plataforma: { type: String },
  otraPlataforma: { type: String },
  cantidadCuotas: { type: String },
  montoPago: { type: String },
  monedaPago: { type: String },
  fechaPago: { type: String },
  fechaInicio: { type: String },
  fechaPendiente: { type: String },
  estatus: { type: String, default: 'Activo' },
  pagosAtrasados: { type: Number, default: 0 },
  historialPagos: [paymentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
