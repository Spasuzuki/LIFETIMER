import {
  Purchases,
  PurchasesPackage,
  LOG_LEVEL,
} from "@revenuecat/purchases-capacitor";
import { Capacitor } from "@capacitor/core";

export const ENTITLEMENT_ID = "premium"; // RevenueCatで設定したEntitlement ID

export class RevenueCatService {
  private static initialized = false;

  private static isNative() {
    return Capacitor.isNativePlatform();
  }

  static async initialize() {
    if (this.initialized || !this.isNative()) return;

    const apiKey = import.meta.env.VITE_REVENUECAT_API_KEY_IOS || "";
    //const apiKey = process.env.VITE_REVENUECAT_API_KEY_IOS || 'REVENUECAT_API_KEY_IOS';

    try {
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
      await Purchases.configure({ apiKey });
      this.initialized = true;
      console.log("RevenueCat initialized successfully");
    } catch (error) {
      console.error("Failed to initialize RevenueCat:", error);
    }
  }

  static async getOfferings() {
    if (!this.isNative()) {
      console.log("RevenueCat: Offerings not available on Web");
      return null;
    }
    try {
      const offerings = await Purchases.getOfferings();
      if (
        offerings.current !== null &&
        offerings.current.availablePackages.length !== 0
      ) {
        return offerings.current;
      }
    } catch (error) {
      console.error("Error fetching offerings:", error);
    }
    return null;
  }

  static async purchasePackage(pkg: PurchasesPackage) {
    if (!this.isNative()) {
      console.log("RevenueCat: Purchase not supported on Web");
      return false;
    }
    try {
      const { customerInfo } = await Purchases.purchasePackage({
        aPackage: pkg,
      });
      return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error("Purchase failed:", error);
      }
      return false;
    }
  }

  static async restorePurchases() {
    if (!this.isNative()) {
      console.log("RevenueCat: Restore not supported on Web");
      return false;
    }
    try {
      const { customerInfo } = await Purchases.restorePurchases();
      return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    } catch (error) {
      console.error("Restore failed:", error);
      return false;
    }
  }

  static async isPremium() {
    if (!this.isNative()) {
      // プレビュー（Web）環境では、開発・確認用に常にプレミアムとして扱う
      return true;
    }
    try {
      const { customerInfo } = await Purchases.getCustomerInfo();
      return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    } catch (error) {
      console.error("Error checking premium status:", error);
      return false;
    }
  }
}
