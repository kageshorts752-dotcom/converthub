// ConvertHub PayU checkout (client): opens a name/email dialog for the chosen
// plan, asks the server for a signed PayU form, then posts the buyer to PayU.
// No secret ever appears in this file.
(function () {
  var PLANS = { pro: { label: "Pro", price: "₹399 / month" }, business: { label: "Business", price: "₹999 / month" } };
  var currentPlan = null;

  function ensureModal() {
    var m = document.getElementById("payuModal");
    if (m) return m;
    m = document.createElement("div");
    m.id = "payuModal";
    m.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;z-index:999;padding:16px";
    m.innerHTML = '<form id="payuForm" style="background:#fff;color:#111;border-radius:14px;padding:22px;max-width:380px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3)">'
      + '<h3 id="payuTitle" style="margin:0 0 4px">Checkout</h3>'
      + '<p id="payuPrice" style="margin:0 0 14px;color:#555"></p>'
      + '<label style="display:block;margin-bottom:10px">Your name<input name="firstname" required maxlength="60" style="width:100%;padding:10px;margin-top:4px;border:1px solid #ccc;border-radius:8px"></label>'
      + '<label style="display:block;margin-bottom:14px">Email<input name="email" type="email" required maxlength="80" style="width:100%;padding:10px;margin-top:4px;border:1px solid #ccc;border-radius:8px"></label>'
      + '<p id="payuErr" style="color:#c00;min-height:1.2em;margin:0 0 8px"></p>'
      + '<button type="submit" style="width:100%;padding:12px;border:0;border-radius:10px;background:#111;color:#fff;font-weight:700;cursor:pointer">Pay securely with PayU →</button>'
      + '<button type="button" id="payuCancel" style="width:100%;padding:10px;margin-top:8px;border:0;background:none;cursor:pointer;color:#555">Cancel</button></form>';
    document.body.appendChild(m);
    m.addEventListener("click", function (e) { if (e.target === m) m.style.display = "none"; });
    m.querySelector("#payuCancel").addEventListener("click", function () { m.style.display = "none"; });
    m.querySelector("#payuForm").addEventListener("submit", submitCheckout);
    return m;
  }

  function openCheckout(plan) {
    currentPlan = plan;
    var m = ensureModal();
    m.querySelector("#payuTitle").textContent = "Get ConvertHub " + PLANS[plan].label;
    m.querySelector("#payuPrice").textContent = PLANS[plan].price + " · paid via PayU (UPI, cards, netbanking)";
    m.querySelector("#payuErr").textContent = "";
    m.style.display = "flex";
    m.querySelector('input[name="firstname"]').focus();
  }

  async function submitCheckout(e) {
    e.preventDefault();
    var m = document.getElementById("payuModal");
    var err = m.querySelector("#payuErr");
    var fd = new FormData(e.target);
    err.textContent = "Starting secure checkout…";
    try {
      var r = await fetch("/api/payu-create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: currentPlan, firstname: fd.get("firstname"), email: fd.get("email") }),
      });
      var data = await r.json();
      if (!r.ok) throw new Error(data.error || "Checkout failed");
      var form = document.createElement("form");
      form.method = "POST"; form.action = data.action; form.style.display = "none";
      Object.keys(data.fields).forEach(function (k) {
        var inp = document.createElement("input");
        inp.type = "hidden"; inp.name = k; inp.value = data.fields[k];
        form.appendChild(inp);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (ex) {
      err.textContent = ex.message || "Could not start checkout. Please try again.";
    }
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-plan]");
    if (b) { e.preventDefault(); openCheckout(b.getAttribute("data-plan")); }
  });

  // Show the active plan, if this browser paid before.
  var plan = null;
  try { plan = localStorage.getItem("converthub_plan"); } catch (e) {}
  if (plan === "pro" || plan === "business") {
    var badge = document.createElement("span");
    badge.textContent = "✓ " + (plan === "pro" ? "Pro" : "Business") + " active";
    badge.style.cssText = "display:inline-block;margin-left:8px;padding:3px 10px;border-radius:999px;background:#16a34a;color:#fff;font-size:12px;font-weight:700;vertical-align:middle";
    var logo = document.querySelector(".logo span") || document.querySelector("header");
    if (logo) logo.appendChild(badge);
  }
})();
