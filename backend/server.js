require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error.middleware");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", require("./routes/auth.routes"));
app.use("/api/students", require("./routes/student.routes"));

app.use(errorHandler);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
