import express, { Request, Response } from "express";
import routes from "./routes/routes";
import bodyParser from "body-parser";
import cors from "cors"

const app = express();
const port = process.env.PORT || 3000;

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/assets'));
app.use(routes)
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript + Express!");
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
