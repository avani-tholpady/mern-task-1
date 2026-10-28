const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory array (data resets when the server restarts)
let items = [
  { id: 1, name: "Book", price: 250 },
  { id: 2, name: "Pen", price: 25 }
];
let nextId = 3;

// READ: Get all items
app.get("/api/items", (req, res) => {
  res.json(items);
});

// CREATE: Add a new item
app.post("/api/items", (req, res) => {
  const name = String(req.body.name || "").trim();
  const price = Number(req.body.price);

  if (!name || req.body.price === "" || !Number.isFinite(price) || price < 0) {
    return res.status(400).json({ message: "Enter a valid name and non-negative price." });
  }

  const newItem = { id: nextId++, name, price };
  items.push(newItem);
  res.status(201).json(newItem);
});

// UPDATE: Edit an item
app.put("/api/items/:id", (req, res) => {
  const id = Number(req.params.id);
  const item = items.find((entry) => entry.id === id);

  if (!item) {
    return res.status(404).json({ message: "Item not found." });
  }

  const name = String(req.body.name || "").trim();
  const price = Number(req.body.price);

  if (!name || req.body.price === "" || !Number.isFinite(price) || price < 0) {
    return res.status(400).json({ message: "Enter a valid name and non-negative price." });
  }

  item.name = name;
  item.price = price;
  res.json(item);
});

// DELETE: Remove an item
app.delete("/api/items/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = items.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Item not found." });
  }

  const deletedItem = items.splice(index, 1)[0];
  res.json({ message: "Item deleted successfully.", item: deletedItem });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
