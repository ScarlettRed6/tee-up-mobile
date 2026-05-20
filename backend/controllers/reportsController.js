import { 
    addReport, 
    getAllReports,
    getReportsByReporter,
    updateReportsStatus,
    getPendingReportsCount,
    getCompletedReportsCount
} from "../models/reportsModel.js";
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

export async function getMyReports(req, res) {
    try {
        const reporter_id = req.user.id;
        const reports = await getReportsByReporter(reporter_id);
        res.status(200).json({ reports });
    } catch (err) {
        console.log(`getMyReports error: ${err}`);
        res.status(500).json({ error: err.message });
    }
}

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

export async function adminGetPendingReportsCount(req, res) {
    try {
        const result = await getPendingReportsCount();
        res.status(200).json({ message: "Successfully fetched pending reports count", reportCount: result ?? 0 });
    } catch (error) {
        console.error(`[REPORTS CONTROLLER] Error fetching pending reports count: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
}//End of adminGetPendingReportsCount function

export async function adminGetCompletedReportsCount(req, res) {
    try {
        const result = await getCompletedReportsCount();
        res.status(200).json({ message: "Successfully fetched completed reports count", reportCount: result ?? 0 });
    } catch (error) {
        console.error(`[REPORTS CONTROLLER] Error fetching completed reports count: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
}//End of adminGetCompletedReportsCount function

export async function reviewReport(req, res) {
    try {
        const { report_id } = req.params;
        const { status } = req.body;
        const admin_id = req.user.id; 

        if(!['resolved', 'dismissed'].includes(status)){
            console.log("[REPORTS CONTROLLER] Invalid status");
            return res.status(400).json({ message: "Invalid status"});
        }

        const updated = await updateReportsStatus(report_id, status, admin_id);
        if(!updated) {
            console.log("[REPORTS CONTROLLER] Report not found");
            return res.status(404).json({ message: "Report not found" });
        }

        console.log("[REPORTS CONTROLLER] Successfully updated/reviewd a report");
        res.status(200).json({ message: "Report updated", report: updated });
    } catch (error) {
        console.error("[REPORTS CONTROLLER] Error reviewing the report");
        res.status(500).json({ error: error.message });
    }
}//End of reviewReport 
