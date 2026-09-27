const productTitleInput = document.getElementById("product-title");
const minPriceInput = document.getElementById("min-price");
const maxPriceInput = document.getElementById("max-price");
const filterSelect = document.getElementById("filterId");
const sortSelect = document.getElementById("sortId");
const productsDiv = document.querySelector(".products");
const applyFilterButton = document.querySelector(".apply-filter");
const cartQuantity = document.getElementById("cart-quantity");
const cartTotal = document.getElementById("cart-total");
const cartItems = document.getElementById("cart-items");
const modal = document.getElementById("product-modal");
const modalImage = document.getElementById("modal-image");
const modalTitle = document.getElementById("modal-title");
const modalCategory = document.getElementById("modal-category");
const modalPrice = document.getElementById("modal-price");
const modalRating = document.getElementById("modal-rating");
const modalDescription = document.getElementById("modal-description");
const closeModalButton = document.querySelector(".close-modal");

let allProducts = [];
let cart = [];

function openProductModal(product) {
  if (!modal) return;
  // console.log(product);
  modalImage.src = product.image;
  modalImage.alt = product.title;
  modalTitle.textContent = product.title;
  modalCategory.textContent = `Category: ${product.category}`;
  modalPrice.textContent = `Price: $${product.price}`;
  modalRating.textContent = `Rating: ${product.rating?.rate} (${product.rating?.count} reviews)`;
  modalDescription.textContent = product.description;
  modal.classList.remove("hidden");
}
function closeProductModal() {
  if (!modal) return;
  modal.classList.add("hidden");
}


function showCartItems() {
  if (!cart.length) {
    cartItems.innerHTML = "<p class='cart-empty'>Your cart is empty.</p>";
    return;
  }
  cartItems.innerHTML = cart.map(
      (item) => `
        <div class="cart-item-row">
          <span class="cart-item-title">${item.title}</span>
          <span class="cart-item-price">$${item.price.toFixed(2)}</span>
          <span class="cart-item-qty">Qty: ${item.quantity}</span>
          <button class="remove-item" data-id="${item.id}" type="button">Remove</button>
        </div>
      `
    ).join("");

  document.querySelectorAll(".remove-item").forEach((button) => {
    button.addEventListener("click", (e) => {
      const productId = Number(e.target.dataset.id);
      cart = cart.filter((item) => item.id !== productId);
      updateCartSummary();
    });
  });
}
function updateCartSummary() {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  cartQuantity.textContent = totalQuantity;
  cartTotal.textContent = `$${totalPrice.toFixed(2)}`;
  showCartItems();
}
function addToCart(productId) {
  const product = allProducts.find((item) => item.id === productId);
  if (!product) return;
  const existingItem = cart.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCartSummary();
}


function showProducts(items) {
  if (!items.length) {
    productsDiv.innerHTML = `<p class="err">No products match your filter.</p>`;
    return;
  }
  productsDiv.innerHTML = items
    .map(
      (product) => `
      <div class="product">
        <img src="${product.image}" alt="${product.title}">
        <h3 class="title">${product.title}</h3>
        <p class="price">Price: $${product.price}</p>
        <div class="buttons">
          <button class="view-details" type="button" data-id="${product.id}">view details</button>
          <button class="add-to-cart" type="button" data-id="${product.id}">add to cart</button>
        </div>
      </div>`
    )
    .join("");

  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", (e) => {
      const productId = Number(e.target.dataset.id);
      addToCart(productId);
    });
  });

  document.querySelectorAll(".view-details").forEach((button) => {
    button.addEventListener("click", (e) => {
      const productId = Number(e.target.dataset.id);
      const product = allProducts.find((item) => item.id === productId);
      openProductModal(product);
    });
  });
}



function populateCategories(products) {
  const categories = products.map((p) => p.category);
  filterSelect.innerHTML =
    `<option value="">All categories</option>` +
    categories.map((c) => `<option value="${c}">${c}</option>`).join("");
}

function applyFilters() {
  const title = productTitleInput.value.trim().toLowerCase();
  const minPrice = Number(minPriceInput.value) || 0;
  const maxPrice = maxPriceInput.value === "" ? Infinity : Number(maxPriceInput.value);
  const category = filterSelect.value;
  const sortBy = sortSelect.value;

  let filtered = allProducts.filter((p) => {
    const matchesTitle = !title || p.title.toLowerCase().includes(title);
    const matchesMin = p.price >= minPrice;
    const matchesMax = p.price <= maxPrice;
    const matchesCategory = !category || p.category === category;
    return matchesTitle && matchesMin && matchesMax && matchesCategory;
  });

  if (sortBy === "name") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "price") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === "rating") {
    filtered.sort((a, b) => (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0));
  }

  showProducts(filtered);
}



fetch("https://fakestoreapi.com/products")
  .then((res) => res.json())
  .then((data) => {
    allProducts = data;
    populateCategories(allProducts);
    showProducts(allProducts);
    updateCartSummary();
  })
  .catch(() => {
    productsDiv.innerHTML = `<p class="err">products not found.</p>`;
  });

applyFilterButton.addEventListener("click", applyFilters);
sortSelect.addEventListener("change", applyFilters);
closeModalButton.addEventListener("click", closeProductModal);
