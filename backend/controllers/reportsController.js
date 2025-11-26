import { addReport, getAllReports, updateReportsStatus } from "../models/reportsModel.js";

export async function reportListing(req, res) {
    try{
        const reporter_id = req.user.id;
        const { listing_id } = req.params;
        const { reason } = req.body;

        const report = await addReport(reporter_id, listing_id, reason);

        console.log("Listing reported successfully");
        res.json({ message: "Report submitted successfully", report: report });
    }catch(err){
        console.log(`reportListing error: ${err}`);
        res.status(500).json({ error: err.message });
    }
}//End of reportListing function

