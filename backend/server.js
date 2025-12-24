require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error.middleware");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const { decryptMiddleware } = require("./middleware/payload.middleware");
const errorLogger = require('./middleware/errorLogger.middleware');


connectDB();


const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 10, // 10 requests per IP
  message: "Too many requests, try later"
});

const corsOptions = {
  origin: ['http://172.28.208.1:3000', 'http://localhost:3000'],
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

app.use(limiter);
app.use(morgan("combined"));
app.use(decryptMiddleware);

app.use("/api", require("./routes/auth.routes"));
app.use("/api/students", require("./routes/student.routes"));
app.use(errorLogger);
app.use(errorHandler);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
