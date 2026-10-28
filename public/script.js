const form = document.getElementById("item-form");
const idInput = document.getElementById("item-id");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const itemsBody = document.getElementById("items-body");
const formTitle = document.getElementById("form-title");
const submitButton = document.getElementById("submit-button");
const cancelButton = document.getElementById("cancel-button");
const message = document.getElementById("message");

function showMessage(text, type = "success") {
  message.textContent = text;
  message.className = type;
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }
  return data;
}

// READ: Fetch items from the Express REST API and show them in the table.
async function loadItems() {
  try {
    const items = await apiRequest("/api/items");
    itemsBody.replaceChildren();

    items.forEach((item) => {
      const row = document.createElement("tr");

      [item.id, item.name, item.price].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });

      const actionCell = document.createElement("td");
      const actionGroup = document.createElement("div");
      actionGroup.className = "action-buttons";

      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.className = "edit-button";
      editButton.addEventListener("click", () => startEdit(item));

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.className = "delete-button";
      deleteButton.addEventListener("click", () => deleteItem(item.id));

      actionGroup.append(editButton, deleteButton);
      actionCell.appendChild(actionGroup);
      row.appendChild(actionCell);
      itemsBody.appendChild(row);
    });
  } catch (error) {
    showMessage(error.message, "error");
  }
}

// CREATE or UPDATE, depending on whether an item ID is present.
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = idInput.value;
  const item = {
    name: nameInput.value.trim(),
    price: priceInput.value
  };

  try {
    if (id) {
      await apiRequest(`/api/items/${id}`, {
        method: "PUT",
        body: JSON.stringify(item)
      });
      showMessage("Item updated successfully.");
    } else {
      await apiRequest("/api/items", {
        method: "POST",
        body: JSON.stringify(item)
      });
      showMessage("Item added successfully.");
    }

    resetForm();
    await loadItems();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

// Fill the form with the selected item so it can be edited.
function startEdit(item) {
  idInput.value = item.id;
  nameInput.value = item.name;
  priceInput.value = item.price;
  formTitle.textContent = "Edit Item";
  submitButton.textContent = "Update";
  cancelButton.classList.remove("hidden");
  showMessage(`Editing item ${item.id}.`);
  nameInput.focus();
}

// DELETE: Ask for confirmation, then call the DELETE endpoint.
async function deleteItem(id) {
  if (!window.confirm("Are you sure you want to delete this item?")) return;

  try {
    await apiRequest(`/api/items/${id}`, { method: "DELETE" });
    if (idInput.value === String(id)) resetForm();
    showMessage("Item deleted successfully.");
    await loadItems();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function resetForm() {
  form.reset();
  idInput.value = "";
  formTitle.textContent = "Add Item";
  submitButton.textContent = "Submit";
  cancelButton.classList.add("hidden");
}

cancelButton.addEventListener("click", resetForm);

// Initial table load
loadItems();
