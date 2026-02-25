import { isValidObjectId } from "../utils/helper.util.js";

/**
 * Middleware to validate MongoDB ObjectIds in specified request locations.
 * @param {string} field - The key to look for (e.g., 'id', 'parentId').
 * @param {string} location - The req property to check: 'params', 'query', or 'body'. Defaults to 'params'.
 */
export const validateId = (field = "id", location = "params") => {
    return (req, res, next) => {
        const id = req[location][field];

        // If ID is missing or null, it's considered valid (e.g. root) or not present
        if (id === undefined || id === null || id === "") {
            return next();
        }

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: `Invalid ID`,
            });
        }

        next();
    };
};
