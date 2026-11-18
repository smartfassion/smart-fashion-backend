
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 3000;

// Firebase Admin configuration from Render secrets
if (
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_PRIVATE_KEY
) {
  throw new Error("Firebase Admin environment variables are missing");
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  })
});

const db = admin.firestore();
const auth = admin.auth();

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : false
}));

app.use(express.json({ limit: "20kb" }));

const defaultProducts = [
  {
    id: "demo-001",
    name: "Wireless Headphone",
    description: "Demo item",
    price: 850,
    category: "Gadgets",
    inStock: true
  },
  {
    id: "demo-002",
    name: "Classic Watch",
    description: "Demo item",
    price: 1200,
    category: "Fashion",
    inStock: true
  }
];

// Create initial products only if collection is empty
async function initializeProducts() {
  const snapshot = await db.collection("products").limit(1).get();

  if (snapshot.empty) {
    const batch = db.batch();

    for (const product of defaultProducts) {
      batch.set(db.collection("products").doc(product.id), product);
    }

    await batch.commit();
  }
}

// Verify Firebase login and Admin Gmail
async function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ")
      ? header.slice(7)
      : "";

    if (!token) {
      return res.status(401).json({ error: "Login required" });
    }

    const decoded = await auth.verifyIdToken(token);

    if (!decoded.email || decoded.email_verified !== true) {
      return res.status(403).json({ error: "Verified email required" });
    }

    const admins = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map(email => email.trim().toLowerCase())
      .filter(Boolean);

    if (!admins.includes(decoded.email.toLowerCase())) {
      return res.status(403).json({ error: "Admin access denied" });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid login token" });
  }
}

app.get("/", (_req, res) => {
  res.json({
    name: "Smart Fashion & Gadgets API",
    status: "online"
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

// Public product list
app.get("/api/products", async (_req, res) => {
  try {
    await initializeProducts();

    const snapshot = await db.collection("products").get();
    const products = snapshot.docs.map(doc => doc.data());

    res.json({ data: products });
  } catch (error) {
    console.error("Products error:", error.message);
    res.status(500).json({ error: "Could not load products" });
  }
});

// Admin-only price update
app.patch("/api/products/:id/price", requireAdmin, async (req, res) => {
  try {
    const price = Number(req.body.price);

    if (!Number.isFinite(price) || price <= 0 || price > 10000000) {
      return res.status(400).json({ error: "Invalid price" });
    }

    const productRef = db.collection("products").doc(req.params.id);
    const product = await productRef.get();

    if (!product.exists) {
      return res.status(404).json({ error: "Product not found" });
    }

    await productRef.update({ price });

    res.json({
      ok: true,
      message: "Price updated",
      id: req.params.id,
      price
    });
  } catch (error) {
    console.error("Price update error:", error.message);
    res.status(500).json({ error: "Could not update price" });
  }
});

// Demo-only order endpoint
app.post("/api/demo-order", (req, res) => {
  const { items, customerName } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: "Add at least one demo item."
    });
  }

  res.status(201).json({
    ok: true,
    message: "Demo order received. No real order was placed.",
    customerName: typeof customerName === "string"
      ? customerName
      : "Demo customer",
    itemCount: items.length
  });
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
