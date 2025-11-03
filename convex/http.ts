// @ts-nocheck - Bypass type checking due to Convex generated API type instantiation depth limits
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";
import { transformWebhookData } from "./payment/paymentAttemptTypes";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Error occured", { status: 400 });
    }
    switch ((event as any).type) {
      case "user.created": // intentional fallthrough
      case "user.updated":
        await ctx.runMutation(internal.user.users.upsertFromClerk, {
          data: event.data as any,
        });
        break;

      case "user.deleted": {
        const clerkUserId = (event.data as any).id!;
        await ctx.runMutation(internal.user.users.deleteFromClerk, { clerkUserId });
        break;
      }

      case "paymentAttempt.updated": {
        const paymentAttemptData = transformWebhookData((event as any).data);
        await ctx.runMutation(internal.payment.paymentAttempts.savePaymentAttempt, {
          paymentAttemptData,
        });
        break;
      }
      

      
      default:
        console.log("Ignored webhook event", (event as any).type);
    }

    return new Response(null, { status: 200 });
  }),
});

// Public CMS Lite API endpoint
http.route({
  path: "/hello",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      // Fetch all public CMS Lite data (no auth required)
      const [quicklinks, products, posts, portfolio] = await Promise.all([
        ctx.runQuery(api.features.cms_lite.quicklinks.api.queries.listQuicklinks, {})
          .catch(() => ({ quicklinks: [] })),
        ctx.runQuery(api.features.cms_lite.products.api.queries.listProducts, {})
          .catch(() => ({ products: [] })),
        ctx.runQuery(api.features.cms_lite.posts.api.queries.listPosts, { locale: "en" })
          .catch(() => ({ posts: [] })),
        ctx.runQuery(api.features.cms_lite.portfolio.api.queries.listPortfolio, { locale: "en" })
          .catch(() => ({ items: [] })),
      ]);

      const responseData = {
        success: true,
        data: {
          quicklinks: quicklinks.quicklinks,
          products: products.products,
          posts: posts.posts,
          portfolio: portfolio.items,
        },
        timestamp: new Date().toISOString(),
      };

      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60, s-maxage=60",
        },
      });
    } catch (error) {
      console.error('[/hello API] Error fetching CMS data:', error);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to fetch CMS data',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  }),
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook event", error);
    return null;
  }
}

export default http;
