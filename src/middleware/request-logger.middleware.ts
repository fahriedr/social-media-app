import morgan from "morgan";
import logger from "../utils/logger";

// Custom morgan format to use winston
const stream = {
  write: (message: string) => logger.http(message.trim()),
};

// Skip logging in test environment
const skip = () => process.env.NODE_ENV === "test";

// HTTP log format
export const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip }
);
