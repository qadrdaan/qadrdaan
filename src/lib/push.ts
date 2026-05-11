// VAPID public key — safe to expose in client code.
export const VAPID_PUBLIC_KEY =
  "BCYIxZhMna7a_PLKMCiyWDwICZXCFo5vgUM9yV_PU5uo9xNDzA9sIs2ME2Il-sBgFU6gEY8cqrnS4FE6hLPrwvk";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
  // Avoid registering inside Lovable preview iframes
  try { if (window.self !== window.top) return null; } catch { return null; }
  if (window.location.hostname.includes("lovableproject.com") || window.location.hostname.includes("id-preview--")) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
}

export async function subscribeUserToPush(userId: string, supabase: any): Promise<void> {
  const reg = await registerPushServiceWorker();
  if (!reg) return;
  if (Notification.permission !== "granted") return;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
    });
  }
  const json = sub.toJSON() as any;
  await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: sub.endpoint,
      p256dh: json.keys?.p256dh ?? "",
      auth: json.keys?.auth ?? "",
      user_agent: navigator.userAgent,
    },
    { onConflict: "user_id,endpoint" }
  );
}
