// ConvertHub PayU checkout — creates a PayU payment form.
// Keys come ONLY from Vercel env vars (PAYU_MERCHANT_KEY, PAYU_SALT).
// The salt never leaves the server: the hash is computed here, not in the browser.
const crypto = require("crypto");

const PLANS = {
  pro: { amount: "399.00", name: "ConvertHub Pro — 1 month" },
  business: { amount: "999.00", name: "ConvertHub Business — 1 month" },
};

function payuUrl() {
  if (process.env.PAYU_BASE_URL) return process.env.PAYU_BASE_URL.replace(/\/$/, "");
  if (process.env.PAYU_TEST_MODE === "1") return "https://test.payu.in/_payment";
  return "https://secure.payu.in/_payment";
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const key = (process.env.PAYU_MERCHANT_KEY || "").trim();
  const salt = (process.env.PAYU_SALT || "").trim();
  if (!key || !salt) return res.status(503).json({ error: "PayU is not configured yet" });

  let body = req.body || {};
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const plan = PLANS[body.plan];
  const firstname = String(body.firstname || "").trim().slice(0, 60);
  const email = String(body.email || "").trim().slice(0, 80);
  if (!plan) return res.status(400).json({ error: "Unknown plan" });
  if (!firstname || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Name and a valid email are required" });
  }

  const txnid = "CH" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 8).toUpperCase();
  const amount = plan.amount;
  const productinfo = plan.name;
  // PayU request hash: key|txnid|amount|productinfo|firstname|email|udf1..udf10|salt
  const hashString = [key, txnid, amount, productinfo, firstname, email, "", "", "", "", "", "", "", "", "", "", salt].join("|");
  const hash = crypto.createHash("sha512").update(hashString).digest("hex");
  const base = "https://converthub-tools.vercel.app";
  return res.status(200).json({
    action: payuUrl(),
    fields: {
      key, txnid, amount, productinfo, firstname, email,
      phone: "", surl: base + "/api/payu-return",
      furl: base + "/api/payu-return",
      hash, service_provider: "payu_paisa",
    },
  });
};
