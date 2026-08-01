const STORAGE_KEY = "inventoryflow-products";

const productForm = document.querySelector("#product-form");
const totalProducts = document.querySelector("#total-products");
const formMessage = document.querySelector("#form-message");

function getProducts() {
    const storedProducts = localStorage.getItem(STORAGE_KEY);

    if (!storedProducts) {
        return [];
    }

    try {
        return JSON.parse(storedProducts);
    } catch (error) {
        console.error("No fue posible leer los productos:", error);
        return [];
    }
}

function saveProducts(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function updateProductCounter() {
    const products = getProducts();
    totalProducts.textContent = products.length;
}

function createProductId() {
    if (typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;

    window.setTimeout(() => {
        formMessage.textContent = "";
        formMessage.className = "form-message";
    }, 3500);
}

productForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document
        .querySelector("#product-name")
        .value
        .trim();

    const category = document
        .querySelector("#product-category")
        .value;

    const price = Number(
        document.querySelector("#product-price").value
    );

    const stock = Number(
        document.querySelector("#product-stock").value
    );

    if (!name || !category || Number.isNaN(price) || Number.isNaN(stock)) {
        showMessage(
            "Completa correctamente todos los campos.",
            "error"
        );

        return;
    }

    const newProduct = {
        id: createProductId(),
        name,
        category,
        price,
        stock,
        createdAt: new Date().toISOString()
    };

    const products = getProducts();

    products.push(newProduct);
    saveProducts(products);

    productForm.reset();
    updateProductCounter();

    showMessage(
        "Producto registrado correctamente.",
        "success"
    );
});

updateProductCounter();