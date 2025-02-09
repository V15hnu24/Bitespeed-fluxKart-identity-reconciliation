import express from "express";
import bodyParser from "body-parser";
import { identifyContact } from "./controllers/contactController";

const app = express();
app.use(bodyParser.json());

app.post("/identify", identifyContact);

app.get('/', (req, res) => {
  res.status(200).send('Hello, World!');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
