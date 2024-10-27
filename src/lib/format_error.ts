import { ZodError } from "zod";

export function formatZodError(error: ZodError) {
    return error.errors.map(err => ({
        path: err.path.join("."), // Join path array into a string (e.g., 'id')
        message: err.message, // Error message
        code: err.code, // Zod error code
    }));
}

export function invalidRequest(c: any, result: any) {
    if (result.error instanceof ZodError) {
        return c.json(
            {
                message: "Invalid request",
                code: 400,
                errors: formatZodError(result.error),
            },
            400,
        );
    }
    return c.json({ message: "Invalid request", code: 400 }, 400);
}
