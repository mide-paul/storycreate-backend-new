// global-async-handler.ts

export async function globalAsyncHandler<T>(
    asyncFn: () => Promise<T>,
    errorMessage: string = 'An unexpected error occurred.',
): Promise<{ data?: T; error?: string }> {
    try {
        const data = await asyncFn();
        return { data };
    } catch (error) {
        console.error('Global async handler error:', error);
        return { error: errorMessage };
    }
}