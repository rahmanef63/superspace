import { FunctionReference } from "convex/server";
import { ZodObject } from "zod";

export interface FeatureAgent {
    tools: Record<string, {
        description: string;
        args: ZodObject<any>;
        type: "mutation" | "query";
        handler: FunctionReference<any, "public">;
    }>;
}
