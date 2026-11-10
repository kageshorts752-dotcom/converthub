// ConvertHub PayU return handler — verifies PayU's response hash server-side,
// then redirects to the success or failure page. A payment counts ONLY when
// the hash matches, status is "success", and the amount matches the plan.
const crypto = require("crypto");

const PLANS = { pro: "399.00", business: "999.00" };

function verifyHash(fields, salt, key) {
  const status = fields.status || "";
  const parts = [salt, status, "", "", "", "", "", "", "", "", "", "",
    fields.email || "", fields.firstname || "", fields.productinfo || "",
    fields.amount || "", fields.txnid || "", key];
  if (fields.additionalCharges) parts.unshift(fields.additionalCharges);
  const hash = crypto.createHash("sha512").update(parts.join("|")).digest("hex");
  return hash === (fields.hash || "");
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => { data += c; });
    req.on("end", () => {
      const out = {};
      for (const pair of data.split("&")) {
        const i = pair.indexOf("=");
        if (i > 0) out[decodeURIComponent(pair.slice(0, i))] = decodeURIComponent(pair.slice(i + 1).replace(/\+/g, " "));
      }
      resolve(out);
    });
  });
}

module.exports = async (req, res) => {
  const key = (process.env.PAYU_MERCHANT_KEY || "").trim();
  const salt = (process.env.PAYU_SALT || "").trim();
  const base = "https://converthub-tools.vercel.app";
  if (req.method !== "POST" || !key || !salt) {
    res.writeHead(302, { Location: base + "/failure.html?reason=config" });
    return res.end();
  }
  const f = await readBody(req);
  const plan = (f.productinfo || "").includes("Business") ? "business" : "pro";
  const ok = f.status === "success"
    && verifyHash(f, salt, key)
    && PLANS[plan] === String(f.amount || "");
  const dest = ok
    ? "/success.html?plan=" + plan + "&txnid=" + encodeURIComponent(f.txnid || "")
    : "/failure.html?reason=" + encodeURIComponent(f.status === "success" ? "verify" : "failed");
  res.writeHead(302, { Location: base + dest });
  return res.end();
};
