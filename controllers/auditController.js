const { getAuditLogs } = require('../services/auditService');

const listAuditLogs = async (req, res, next) => {
    try {
        const { page, limit, action, search } = req.query;
        const result = await getAuditLogs({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            action,
            search,
        });
        res.json(result);
    } catch (err) {
        next(err);
    }
};

module.exports = { listAuditLogs };
