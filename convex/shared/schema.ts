import { PERMS as BASE_PERMS } from "../workspace/permissions";

export const PERMS = {
  ...BASE_PERMS,
  MANAGE_NAVIGATION: "navigation.manage",
  VIEW_USERS: "users.view",
  UPLOAD_FILES: "storage.upload",
  MANAGE_FILES: "storage.manage",
  VIEW_FILES: "storage.view",
  CART: {
    USE: "cart.use",
    CHECKOUT: "cart.checkout",
  },
  CURRENCY: {
    MANAGE: "currency.manage",
    UPDATE_RATES: "currency.update_rates",
  },
  WISHLIST: {
    MANAGE: "wishlist:manage",
  },
} as const;

export type Permission =
  | (typeof BASE_PERMS)[keyof typeof BASE_PERMS]
  | typeof PERMS.MANAGE_NAVIGATION
  | typeof PERMS.VIEW_USERS
  | typeof PERMS.UPLOAD_FILES
  | typeof PERMS.MANAGE_FILES
  | typeof PERMS.VIEW_FILES
  | (typeof PERMS.CART)[keyof typeof PERMS.CART]
  | (typeof PERMS.CURRENCY)[keyof typeof PERMS.CURRENCY]
  | (typeof PERMS.WISHLIST)[keyof typeof PERMS.WISHLIST];
