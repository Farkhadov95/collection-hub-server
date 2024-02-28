import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import express from "express";


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(cors());
app.use(helmet());
app.use(morgan("tiny"));

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
