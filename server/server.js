const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
const server = require("http").createServer(app);
const cookieParser = require("cookie-parser");
// const connectDB = require("./modules/db");
const sessionMiddleware = require("./middleware/sessionMiddleware");
const circleRouter = require("./routes/circle.router");

app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
  );
  next();
});

dotenv.config();
// connectDB();

app.use(cookieParser());
app.use(sessionMiddleware);
app.use(express.static("build"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/circle", circleRouter);

app.set("trust proxy", true);

server.listen(5000, () => {
  console.log(`listening on port: 5000`);
});
