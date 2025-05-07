/** @format */

import express from 'express';
import bodyParser from 'body-parser';
import { AppDataSource } from './data-source';
import cors from 'cors';
import apiv1 from './routes/routes';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
const port = 3003;
app.use(cors());
app.use(bodyParser.json());
app.use('/api', apiv1);

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
    app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });
