export class GraphQLError extends Error {
    constructor(res) {
        if (res.errors) {
            const messageConcat = res.errors.map((e) => e.message).join(", ");
            super(messageConcat);
            this.name = "GraphQLError";
            return;
        }

        super("Internal server error");
        this.name = "GraphQLError";
    }
}