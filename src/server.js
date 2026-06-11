const express = require('express');
const cors = require('cors');

const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(routes);

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
