const STORAGE_KEY = "inventoryflow-products";

const productForm = document.querySelector("#product-form");
const totalProducts = document.querySelector("#total-products");
const formMessage = document.querySelector("#form-message");
const productsContainer = document.querySelector(
    "#products-container"
);

function getProducts() {
    const storedProducts = localStorage.getItem(STORAGE_KEY);

    if (!storedProducts) {
        return [];
    }

    try {
        const parsedProducts = JSON.parse(storedProducts);

        return Array.isArray(parsedProducts)
            ? parsedProducts
            : [];
    } catch (error) {
        console.error(
            "No fue posible leer los productos:",
            error
        );

        return [];
    }
}

function saveProducts(products) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(products)
    );
}

function updateProductCounter(products = getProducts()) {
    totalProducts.textContent = products.length;
}

function createProductId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;

    window.setTimeout(() => {
        formMessage.textContent = "";
        formMessage.className = "form-message";
    }, 3500);
}

function formatCurrency(value) {
    return new Intl.NumberFormat("es-DO", {
        style: "currency",
        currency: "DOP",
        minimumFractionDigits: 2
    }).format(value);
}

function formatDate(dateValue) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Fecha no disponible";
    }

    return new Intl.DateTimeFormat("es-DO", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(date);
}

function createEmptyState() {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";

    const icon = document.createElement("div");
    icon.className = "empty-icon";
    icon.textContent = "📦";

    const title = document.createElement("h4");
    title.textContent = "No hay productos registrados";

    const description = document.createElement("p");
    description.textContent =
        "Utiliza el formulario para agregar el primer producto al inventario.";

    emptyState.append(
        icon,
        title,
        description
    );

    return emptyState;
}

function createProductCard(product) {
    const article = document.createElement("article");
    article.className = "product-card";

    const header = document.createElement("div");
    header.className = "product-card-header";

    const productIdentity = document.createElement("div");
    productIdentity.className = "product-identity";

    const productIcon = document.createElement("div");
    productIcon.className = "product-icon";

    const firstLetter = String(product.name || "P")
        .charAt(0)
        .toUpperCase();

    productIcon.textContent = firstLetter;

    const productInformation = document.createElement("div");

    const productName = document.createElement("h4");
    productName.textContent =
        product.name || "Producto sin nombre";

    const productCategory = document.createElement("span");
    productCategory.className = "category-badge";
    productCategory.textContent =
        product.category || "Sin categoría";

    productInformation.append(
        productName,
        productCategory
    );

    productIdentity.append(
        productIcon,
        productInformation
    );

    const stockStatus = document.createElement("span");

    const stock = Number(product.stock) || 0;

    stockStatus.className =
        stock > 0
            ? "stock-status available"
            : "stock-status unavailable";

    stockStatus.textContent =
        stock > 0
            ? "Disponible"
            : "Agotado";

    header.append(
        productIdentity,
        stockStatus
    );

    const details = document.createElement("div");
    details.className = "product-details";

    const priceDetail = document.createElement("div");
    priceDetail.className = "product-detail";

    const priceLabel = document.createElement("span");
    priceLabel.textContent = "Precio";

    const priceValue = document.createElement("strong");
    priceValue.textContent = formatCurrency(
        Number(product.price) || 0
    );

    priceDetail.append(
        priceLabel,
        priceValue
    );

    const stockDetail = document.createElement("div");
    stockDetail.className = "product-detail";

    const stockLabel = document.createElement("span");
    stockLabel.textContent = "Existencias";

    const stockValue = document.createElement("strong");
    stockValue.textContent = stock;

    stockDetail.append(
        stockLabel,
        stockValue
    );

    details.append(
        priceDetail,
        stockDetail
    );

    const footer = document.createElement("div");
    footer.className = "product-card-footer";

    footer.textContent =
        `Registrado el ${formatDate(product.createdAt)}`;

    article.append(
        header,
        details,
        footer
    );

    return article;
}

function renderProducts() {
    const products = getProducts();

    productsContainer.replaceChildren();

    updateProductCounter(products);

    if (products.length === 0) {
        productsContainer.append(
            createEmptyState()
        );

        return;
    }

    const productsGrid = document.createElement("div");
    productsGrid.className = "products-grid";

    products.forEach((product) => {
        const productCard = createProductCard(product);

        productsGrid.append(productCard);
    });

    productsContainer.append(productsGrid);
}

function getFormValues() {
    const nameInput = document.querySelector(
        "#product-name"
    );

    const categoryInput = document.querySelector(
        "#product-category"
    );

    const priceInput = document.querySelector(
        "#product-price"
    );

    const stockInput = document.querySelector(
        "#product-stock"
    );

    return {
        name: nameInput.value.trim(),
        category: categoryInput.value,
        price: Number(priceInput.value),
        stock: Number(stockInput.value)
    };
}

function isProductValid(product) {
    const hasValidName =
        product.name.length > 0;

    const hasValidCategory =
        product.category.length > 0;

    const hasValidPrice =
        Number.isFinite(product.price) &&
        product.price >= 0;

    const hasValidStock =
        Number.isInteger(product.stock) &&
        product.stock >= 0;

    return (
        hasValidName &&
        hasValidCategory &&
        hasValidPrice &&
        hasValidStock
    );
}

productForm.addEventListener(
    "submit",
    (event) => {
        event.preventDefault();

        const formValues = getFormValues();

        if (!isProductValid(formValues)) {
            showMessage(
                "Completa correctamente todos los campos.",
                "error"
            );

            return;
        }

        const newProduct = {
            id: createProductId(),
            name: formValues.name,
            category: formValues.category,
            price: formValues.price,
            stock: formValues.stock,
            createdAt: new Date().toISOString()
        };

        const products = getProducts();

        products.push(newProduct);

        saveProducts(products);

        productForm.reset();

        renderProducts();

        showMessage(
            "Producto registrado correctamente.",
            "success"
        );
    }
);

renderProducts();