const app = require('./app');
const env = require('./config/env');

app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${env.PORT}`);
});
