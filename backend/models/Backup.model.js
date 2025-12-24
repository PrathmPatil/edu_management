const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
  collectionName: String,
  documentId: mongoose.Schema.Types.ObjectId,
  oldData: Object,
  action: String, // 'update' or 'delete'
  updatedBy: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Backup', backupSchema);
