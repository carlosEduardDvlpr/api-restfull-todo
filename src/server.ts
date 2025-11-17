import 'dotenv/config';
import express from 'express';
import { routes } from './routes';
import { errorHandling } from './middleware/error-handling';

const PORT = process.env.PORT;

const app = express();
app.use(express.json());

app.use(routes);
app.use(errorHandling);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
