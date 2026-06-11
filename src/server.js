const express = require('express');
const cors = require('cors');

const { sequelize } = require('./models');
const routes = require('./routes');
const responseTime = require('./middleware/responseTime');
const { logger, errorLogger } = require('./middleware/logger');
const { seedAdminUser } = require('./seed/adminUser');

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
  .then(seedAdminUser)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
