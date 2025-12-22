const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const controller = require("../controllers/student.controller");

router.use(auth);

router.get("/", controller.getStudents);
router.get("/:id", controller.getStudentById);

router.post("/", role(["Admin"]), controller.createStudent);
router.put("/:id", role(["Admin", "Student"]), controller.updateStudent);
router.delete("/:id", role(["Admin"]), controller.deleteStudent);

module.exports = router;
