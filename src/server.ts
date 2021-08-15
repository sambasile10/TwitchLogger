import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";

dotenv.config();
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

export default app;