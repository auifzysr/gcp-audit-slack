const app = require('./app.js');

const PORT = parseInt(process.env.PORT) || 8080;

app.listen(PORT, () => {
  console.log(`started on port ${PORT}`);
});