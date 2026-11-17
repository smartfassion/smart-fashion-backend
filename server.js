const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// In production, set FRONTEND_ORIGIN to your published website URL.
// Example: https://your-site.netlify.app
const allowedOrigin = process.env.FRONTEND_ORIGIN;
app.use(cors({
  origin: allowedOrigin ? allowedOrigin.split(",").map(s => s.trim()) : true
}));
app.use(express.json());

const products = [
  {
    id: "demo-001",
    name: "Wireless Headphone",
    description: "Demo item — replace with approved product data later.",
    price: 850,
    category: "Gadgets",
    inStock: true
  },
  {
    id: "demo-002",
    name: "Classic Watch",
    description: "Demo item — replace with approved product data later.",
    price: 1200,
    category: "Fashion",
    inStock: true
  }
];

app.get("/", (_req, res) => {
  res.json({ name: "Smart Fashion & Gadgets Demo API", status: "online" });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

app.get("/api/products", (_req, res) => {
  res.json({ data: products });
});

// Demo-only endpoint. It does not create a real order or charge money.
app.post("/api/demo-order", (req, res) => {
  const { items, customerName } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Add at least one demo item." });
  }
  return res.status(201).json({
    ok: true,
    message: "Demo order received. No real order was placed.",
    customerName: typeof customerName === "string" ? customerName : "Demo customer",
    itemCount: items.length
  });
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
