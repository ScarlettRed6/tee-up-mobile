import { EventEmitter } from "events";
import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { deflate } from "zlib";


//Create and initialize custom emitter class
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();


const logEvent = async (message) => {
    const dateTime = `${format(new Date(), "yyyyMMdd\tHH:mm:ss")}`;
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

    try{
        const logDir = path.join(process.cwd(), "logs");
        if(!fs.existsSync(logDir)) await fsPromises.mkdir(logDir);

        await fsPromises.appendFile(path.join(logDir, "eventLog.txt"), logItem);

    }catch(err){
        console.error("Logging error:", err);
    }

};//End of logEvent async function

myEmitter.on("log", (msg) => logEvent(msg));

export default myEmitter;

