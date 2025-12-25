const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const controller = require("../controllers/student.controller");
const backupMiddleware = require("../middleware/backup.middleware");
const upload = require('../middleware/upload.middleware');

router.use(auth);

router.get("/", controller.getStudents);
router.get("/:id", controller.getStudentById);

router.post("/", role(["Admin"]), controller.createStudent);
router.put("/:id", role(["Admin", "Student"]), backupMiddleware('student', 'update'), controller.updateStudent);
router.delete("/", role(["Admin"]), backupMiddleware('student', 'delete'), controller.deleteStudent);
router.post('/bulk-upload',backupMiddleware('student', 'insert'), upload.single('file'), controller.bulkUploadStudents);



module.exports = router;
