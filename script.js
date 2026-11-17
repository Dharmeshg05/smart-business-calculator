/* Smart Business Calculator — calculations and interactions */
"use strict";

const $ = (id) => document.getElementById(id);
const money = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 2
}).format(value);

const toolDetails = {
  gst: { kicker: "TAX & PRICING", title: "GST Calculator", description: "Calculate GST and see the complete price breakdown." },
  profit: { kicker: "BUSINESS PERFORMANCE", title: "Profit & Loss", description: "Find out how much you earn or lose on a sale." },
  discount: { kicker: "SALES & OFFERS", title: "Discount Calculator", description: "Calculate the savings and final selling price." },
  margin: { kicker: "BUSINESS PERFORMANCE", title: "Profit Margin", description: "Understand the percentage of revenue you keep as profit." }
};

let activeTool = "gst";
let latestResultText = "";

function readNumber(id, label, options = {}) {
  const raw = $(id).value.trim();
  if (raw === "") throw new Error(`Please enter ${label.toLowerCase()}.`);
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`Please enter a valid ${label.toLowerCase()}.`);
  if (options.min !== undefined && value < options.min) throw new Error(`${label} must be at least ${options.min}.`);
  if (options.max !== undefined && value > options.max) throw new Error(`${label} cannot be more than ${options.max}.`);
  return value;
}

function showError(message) {
  $("resultArea").innerHTML = `<p class="error-message" role="alert">${message}</p>`;
}

function renderResult({ label, main, rows, note = "" }) {
  latestResultText = [label, main, ...rows.map(([name, value]) => `${name}: ${value}`), note].filter(Boolean).join("\n");
  const rowsHtml = rows.map(([name, value]) =>
    `<div class="result-row"><span>${name}</span><strong>${value}</strong></div>`
  ).join("");
  $("resultArea").innerHTML = `
    <div class="result-top"><span class="result-label">${label}</span><button class="copy-button" id="copyResult" type="button">Copy result</button></div>
    <div class="result-main">${main}</div>
    <div class="result-rows">${rowsHtml}</div>
    ${note ? `<p class="result-note">${note}</p>` : ""}
  `;
  $("copyResult").addEventListener("click", copyResult);
}

async function copyResult() {
  if (!latestResultText) return;
  const button = $("copyResult");
  try {
    await navigator.clipboard.writeText(latestResultText);
    button.textContent = "Copied!";
  } catch {
    const area = document.createElement("textarea");
    area.value = latestResultText;
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    button.textContent = copied ? "Copied!" : "Select and copy";
  }
  window.setTimeout(() => { if (button.isConnected) button.textContent = "Copy result"; }, 1800);
}

function calculateGST() {
  const amount = readNumber("gstAmount", "Amount", { min: 0 });
  const rate = readNumber("gstRate", "GST rate", { min: 0, max: 100 });
  const taxRate = rate / 100;
  let base, gst, total;
  if ($("gstMode").value === "inclusive") {
    total = amount;
    base = amount / (1 + taxRate);
    gst = total - base;
  } else {
    base = amount;
    gst = base * taxRate;
    total = base + gst;
  }
  const halfTax = gst / 2;
  renderResult({
    label: "GST breakdown",
    main: money(total),
    rows: [
      ["Taxable amount", money(base)],
      ["CGST", money(halfTax)],
      ["SGST", money(halfTax)],
      ["Total GST", money(gst)],
      ["Final amount", money(total)]
    ],
    note: $("gstMode").value === "inclusive" ? "GST is included in the amount you entered." : `GST at ${rate}% has been added to your amount.`
  });
}

function calculateProfit() {
  const cost = readNumber("costPrice", "Cost price", { min: 0 });
  const selling = readNumber("sellingPrice", "Selling price", { min: 0 });
  const difference = selling - cost;
  const percentage = cost === 0 ? null : Math.abs(difference / cost) * 100;
  const isProfit = difference >= 0;
  renderResult({
    label: isProfit ? "Profit result" : "Loss result",
    main: `${isProfit ? "+" : "−"}${money(Math.abs(difference))}`,
    rows: [
      ["Cost price", money(cost)],
      ["Selling price", money(selling)],
      [isProfit ? "Profit percentage" : "Loss percentage", percentage === null ? "Not available (zero cost)" : `${percentage.toFixed(2)}%`]
    ],
    note: difference === 0 ? "Your selling price is equal to your cost price." : isProfit ? "Your selling price is higher than your cost price." : "Your selling price is lower than your cost price."
  });
}

function calculateDiscount() {
  const original = readNumber("originalPrice", "Original price", { min: 0 });
  const rate = readNumber("discountRate", "Discount", { min: 0, max: 100 });
  const savings = original * rate / 100;
  const finalPrice = original - savings;
  renderResult({
    label: "Discount breakdown",
    main: money(finalPrice),
    rows: [
      ["Original price", money(original)],
      ["Discount rate", `${rate}%`],
      ["You save", money(savings)],
      ["Final selling price", money(finalPrice)]
    ],
    note: `The customer saves ${money(savings)} on this purchase.`
  });
}

function calculateMargin() {
  const revenue = readNumber("revenue", "Revenue / selling price", { min: 0 });
  const cost = readNumber("totalCost", "Total cost", { min: 0 });
  if (revenue === 0) throw new Error("Revenue must be greater than zero to calculate margin.");
  const profit = revenue - cost;
  const margin = profit / revenue * 100;
  const markup = cost === 0 ? null : profit / cost * 100;
  renderResult({
    label: profit >= 0 ? "Profit margin" : "Negative margin",
    main: `${margin.toFixed(2)}%`,
    rows: [
      ["Revenue", money(revenue)],
      ["Total cost", money(cost)],
      [profit >= 0 ? "Profit" : "Loss", money(Math.abs(profit))],
      ["Markup on cost", markup === null ? "Not available (zero cost)" : `${markup.toFixed(2)}%`]
    ],
    note: "Profit margin = (Revenue − Total cost) ÷ Revenue × 100."
  });
}

const calculators = { gst: calculateGST, profit: calculateProfit, discount: calculateDiscount, margin: calculateMargin };

function switchTool(tool) {
  if (!toolDetails[tool]) return;
  activeTool = tool;
  document.querySelectorAll(".nav-item").forEach((button) => {
    const selected = button.dataset.tool === tool;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-current", selected ? "page" : "false");
  });
  document.querySelectorAll(".tool-view").forEach((form) => form.classList.toggle("active", form.id === `${tool}Form`));
  $("toolKicker").textContent = toolDetails[tool].kicker;
  $("toolTitle").textContent = toolDetails[tool].title;
  $("toolDescription").textContent = toolDetails[tool].description;
  $("resultArea").innerHTML = `<div class="result-placeholder"><span class="placeholder-icon">✦</span><div><strong>Your result will appear here</strong><p>Enter your values above and select Calculate to get started.</p></div></div>`;
  latestResultText = "";
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => switchTool(button.dataset.tool));
});

Object.keys(calculators).forEach((tool) => {
  $(`${tool}Form`).addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      calculators[tool]();
    } catch (error) {
      showError(error.message || "Something went wrong. Please check your values.");
    }
  });
});

$("themeToggle").addEventListener("click", () => {
  const isLight = document.documentElement.classList.toggle("light");
  $("themeIcon").textContent = isLight ? "☀" : "☾";
  $("themeToggle").setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
});

$("year").textContent = new Date().getFullYear();
