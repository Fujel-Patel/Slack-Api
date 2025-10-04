import express from "express";
import { sendMessage, Delete_Message, Shedule_Message, Get_Messages, Edit_Messages, List_Channels } from "../controllers/slackController.js";
const router = express.Router();

router.get('/get-messages/:channel/:messageId', Get_Messages);
router.get('/list-channels', List_Channels) //

router.post('/send-message', sendMessage); //
router.post('/schedule-message', Shedule_Message);

router.put('/edit-message', Edit_Messages);

router.delete('/delete-message', Delete_Message);

export default router;