import app from "./app.js";
import dotenv from "dotenv";
import logger from "./utils/eventLogger.js"

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    logger.emit("log", `Server started successfully! Running on Port ${PORT}`);
});

