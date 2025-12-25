const Backup = require('../models/backup.model');

const backupMiddleware = (collectionName, action) => {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${collectionName}.model`);

      // 🔐 Get ID from decrypted payload
      const documentId = req.decrypted?.id;

      if (!documentId) {
        return res.status(400).json({
          message: "Document ID missing in payload"
        });
      }

      const doc = await Model.findById(documentId);

      if (!doc || doc.is_deleted) {
        return res.status(404).json({
          message: `${collectionName} not found`
        });
      }

      // 🗄 Backup old data
      await Backup.create({
        collectionName,
        documentId: doc._id,
        oldData: doc.toObject(),
        action,
        updatedBy: req.user?.id || 'system'
      });

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = backupMiddleware;
