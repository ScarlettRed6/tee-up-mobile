import { addReport, getAllReports, updateReportsStatus } from "../models/reportsModel.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export async function reportListing(req, res) {
    try{
        const reporter_id = req.user.id;
        const { listing_id } = req.params;
        const { reason } = req.body;

        let photoUrl = null;
        if (req.file) {
            const uploaded = await uploadToCloudinary(req.file.buffer, "reports");
            photoUrl = uploaded.secure_url;
        }

        const report = await addReport(reporter_id, listing_id, null, reason, photoUrl);

        console.log("Listing reported successfully");
        res.json({ message: "Report submitted successfully", report: report });
    }catch(err){
        console.log(`reportListing error: ${err}`);
        res.status(500).json({ error: err.message });
    }
}//End of reportListing function

export async function reportUser(req, res) {
    try{
        const reporter_id = req.user.id;
        const { user_id } = req.params;
        const { reason } = req.body;

        let photoUrl = null;
        if (req.file) {
            const uploaded = await uploadToCloudinary(req.file.buffer, "reports");
            photoUrl = uploaded.secure_url;
        }

        const report = await addReport(reporter_id, null, user_id, reason, photoUrl);

        console.log("User reported successfully");
        res.json({ message: "Report submitted successfully", report: report });
    }catch(err){
        console.log(`reportUser error: ${err}`);
        res.status(500).json({ error: err.message });
    }
}//End of reportUser function

//ADMIN SPECIFIC CONTROLLERS
export async function getAdminReports(req, res){
    try {
        const { search, status, type } = req.query;
        const reports = await getAllReports(search, status, type);

        console.log("[REPORTS CONTROLLER] Successfully fetched reports for admin.");
        res.status(200).json({ result: reports });
    } catch (error) {
        console.error("[REPORTS CONTROLLER] Error fetching reports for admin");
        res.status(500).json({ error: error.message });
    }
}//End of getAdminReports
