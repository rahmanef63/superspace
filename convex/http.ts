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

// =============================================================================
// OAuth Callback Handler
// =============================================================================

http.route({
  path: "/oauth/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      return new Response(`OAuth Error: ${error}`, { status: 400 });
    }

    if (!code || !state) {
      return new Response("Missing code or state parameter", { status: 400 });
    }

    // Parse state to get workspace ID and integration info
    const [workspaceId, timestamp, integrationId] = state.split("_");

    if (!workspaceId || !integrationId) {
      return new Response("Invalid state parameter", { status: 400 });
    }

    // Store the OAuth code for later exchange
    // In a real implementation, you'd exchange the code for tokens here
    // using an action that can make HTTP requests

    try {
      await ctx.runMutation(internal.features.integrations.oauthCallback.handleCallback, {
        workspaceId: workspaceId as any,
        integrationId,
        code,
        state,
      });

      // Redirect back to the integrations page
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://app.superspace.app"}/dashboard/settings/integrations?success=true&integration=${integrationId}`;

      return new Response(null, {
        status: 302,
        headers: { Location: redirectUrl },
      });
    } catch (err) {
      console.error("OAuth callback error:", err);
      const errorUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://app.superspace.app"}/dashboard/settings/integrations?error=true&message=${encodeURIComponent(err instanceof Error ? err.message : "Unknown error")}`;

      return new Response(null, {
        status: 302,
        headers: { Location: errorUrl },
      });
    }
  }),
});

// =============================================================================
// Integration Webhook Handler
// =============================================================================

http.route({
  path: "/webhooks/:workspaceId/:integrationId/:secret",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/").filter(Boolean);

    if (pathParts.length < 4) {
      return new Response("Invalid webhook path", { status: 400 });
    }

    const [, workspaceId, integrationId, secret] = pathParts;

    try {
      const payload = await request.json();

      await ctx.runMutation(internal.features.integrations.webhookHandler.handleIncoming, {
        workspaceId: workspaceId as any,
        integrationId,
        secret,
        eventType: payload.type || payload.event || "unknown",
        payload,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Webhook processing error:", err);
      return new Response(
        JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

export default http;
