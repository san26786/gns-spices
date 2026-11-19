// Vercel serverless entry point. The project's build step compiles src/ to dist/
// (`nest build`); this file reuses one Nest app per warm function instance.
const { createApp } = require('../dist/app-factory');

let handler;

module.exports = async (req, res) => {
  if (!handler) {
    const app = await createApp();
    await app.init();
    handler = app.getHttpAdapter().getInstance();
  }
  return handler(req, res);
};
