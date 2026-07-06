const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://sweet-medical-12.netlify.app",
    supportFile: false,
    defaultCommandTimeout: 10000,
    viewportWidth: 1280,
    viewportHeight: 800,
  },
});
