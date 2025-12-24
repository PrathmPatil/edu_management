const Backup = require('../models/backup.model');

const backupMiddleware = (collectionName, action) => {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${collectionName}.model`);
      const doc = await Model.findById(req.params.id);
      if (!doc) return res.status(404).json({ message: `${collectionName} not found` });

      // Save old data to backup
      await Backup.create({
        collectionName,
        documentId: doc._id,
        oldData: doc.toObject(),
        action,
        updatedBy: req.user?.id || 'system'
      });

      next(); // proceed to update/delete
    } catch (err) {
      next(err);
    }
  };
};

module.exports = backupMiddleware;
