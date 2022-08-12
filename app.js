const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const authRouter = require("./app/api/v1/auth/router");
const hamaPenyakitRouter = require("./app/api/v1/hama-penyakit/router");
const gejalaRouter = require("./app/api/v1/gejala/router");
const solusiRouter = require("./app/api/v1/solusi/router");
const basisPengetahuanRouter = require("./app/api/v1/basis-pengetahuan/router");
const penggunaRouter = require("./app/api/v1/pengguna/router");
const dashboardRouter = require("./app/api/v1/dashboard/router");
const identifikasiRouter = require("./app/api/v1/identifikasi/router");

const notFoundMiddleware = require("./app/middleware/not-found");
const handleErrorMiddleware = require("./app/middleware/handle-error");

const app = express();

app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const API_VERSION = "api/v1";

app.use(`/${API_VERSION}/auth`, authRouter);
app.use(`/${API_VERSION}/hama-penyakit`, hamaPenyakitRouter);
app.use(`/${API_VERSION}/gejala`, gejalaRouter);
app.use(`/${API_VERSION}/solusi`, solusiRouter);
app.use(`/${API_VERSION}/basis-pengetahuan`, basisPengetahuanRouter);
app.use(`/${API_VERSION}/pengguna`, penggunaRouter);
app.use(`/${API_VERSION}/dashboard`, dashboardRouter);
app.use(`/${API_VERSION}/identifikasi`, identifikasiRouter);

app.use(notFoundMiddleware);
app.use(handleErrorMiddleware);

module.exports = app;
