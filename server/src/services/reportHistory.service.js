const Report = require('../models/Report');

class ReportHistoryService {

    async saveReport(data) {
        return await Report.create(data);
    }

    async getReports() {
        return await Report.find()
            .populate('generatedBy', 'fullName role')
            .sort({ createdAt: -1 });
    }

    async getReportById(id) {
        return await Report.findById(id)
            .populate('generatedBy', 'fullName role');
    }

    async deleteReport(id) {
        return await Report.findByIdAndDelete(id);
    }
}

module.exports = new ReportHistoryService();