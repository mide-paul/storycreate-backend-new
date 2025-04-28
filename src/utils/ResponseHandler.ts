class ResponseHandler {
    static successResponse(res, message = "Success", data = {}) {
        return res.status(200).json({
            success: true,
            message,
            data,
        });
    }

    static errorResponse(res, statusCode = 500, message = "An error occurred", error = null) {
        return res.status(statusCode).json({
            success: false,
            message,
            error,
        });
    }
}

module.exports = { ResponseHandler };