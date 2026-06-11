const express = require('express');
const cors = require('cors');

const { sequelize } = require('./models');
const routes = require('./routes');
const responseTime = require('./middleware/responseTime');
const { logger, errorLogger } = require('./middleware/logger');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(responseTime);
app.use(logger);
app.use(routes);
app.use(errorLogger);

sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  });
