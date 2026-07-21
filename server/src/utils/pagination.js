/**
 * Pagination Utility
 * Handles pagination for list endpoints
 */
const paginate = (query, options = {}) => {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10;
    const skip = (page - 1) * limit;

    return {
        skip,
        limit,
        page,
        limit: Math.min(limit, 100) // Max 100 items per page
    };
};

/**
 * Create pagination metadata
 */
const paginationMeta = (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
};

module.exports = {
    paginate,
    paginationMeta
};