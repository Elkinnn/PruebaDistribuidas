export class CustomError extends Error {
    constructor(
        public readonly statusCode: number,
        public readonly message: string,
        public readonly fullError: any
    ) {
        super();
    }
}