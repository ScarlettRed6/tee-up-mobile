import { storeMessage } from "../models/chatModel";

export async function saveSentMessage(conversation_id, senderId, message){
    try{
        const result = await storeMessage(conversation_id, senderId, message);

        return result;
    }catch(err){
        console.log('CHATCONTROLLER, ERROR: ', err.message);
        throw new Error("Error saving message");
    }
}
