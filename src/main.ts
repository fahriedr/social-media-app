import express, { Request, Response } from "express";
import routes from "./routes/routes";
import bodyParser from "body-parser";
import cors from "cors"
import { errorHandler } from "./middleware/error-handling.middleware";
import { errorLogger } from "./middleware/error-logger.middleware";
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT || 3000;

const FRONTEND_URL = process.env.FRONTEND_ORIGIN

app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
  }))
app.use(bodyParser.json())
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/assets'));
app.use(routes)
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript + Express!");
});

app.use(errorLogger);
app.use(errorHandler);


app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
