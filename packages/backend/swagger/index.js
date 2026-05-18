import openApiConfig from "./openapi.js";
import components from "./components.js";
import paths from "./paths.js";

const swaggerSpec = {
  ...openApiConfig,
  components,
  paths,
};

export default swaggerSpec;
