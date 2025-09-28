document.addEventListener("DOMContentLoaded", () => {
    // --- Datos de ejemplo (ajusta a tus productos reales) ---
    const products = [
        { id: 1, title: "Montañera Powerfly FS Gen 2", price: 19900.00, description: "Ofrece toda la potencia y características que necesitas para la aventura y para explorar nuevos destinos.", image: "assets/media/montañera.png" },
        { id: 2, title: "Madone", price: 15490.00, description: "Bicicleta de carretera aerodinámica diseñada para cortar el viento. Bicicleta de competición para carretera más rápida de todos los tiempos.", image: "assets/media/ruta.png" },
        { id: 3, title: "BMX Pro", price: 1199.00, description: "Perfecta para los mejores trucos y piruetas, es el modelo perfecto, si quieres iniciarte en el mundo del Freestyle.", image: "assets/media/bmx.png" }
        
    ];
        localStorage.setItem('productos', JSON.stringify(products));
    // --- Elementos del DOM (asegúrate que existen en tu HTML) ---
    const modal = document.getElementById("productModal");
    const modalImage = document.getElementById("modal-image");
    const modalTitle = document.getElementById("modal-title");
    const modalDescription = document.getElementById("modal-description");
    const modalPrice = document.getElementById("modal-price");
    const buyNowBtn = document.getElementById("buyNowBtn");
    const closeBtn = modal ? modal.querySelector(".close") : null;

    if (!modal || !modalImage || !modalTitle || !modalDescription || !modalPrice || !buyNowBtn || !closeBtn) {
        console.warn("Modal: faltan elementos en el DOM. Revisa IDs/clases del HTML del modal.");
        return;
    }

    // --- Función global: Comprar ahora ---
    window.buyNow = function (productId) {
        const product = products.find(p => Number(p.id) === Number(productId));
        if (!product) {
            console.warn("buyNow: producto no encontrado:", productId);
            return;
        }

        // Añadir al carrito en localStorage
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        const existente = carrito.find(it => it.id === product.id);
        if (existente) {
            existente.cantidad = (existente.cantidad || 1) + 1;
        } else {
            carrito.push({
                id: product.id,
                nombre: product.title,
                precio: product.price,
                cantidad: 1,
                imagen: product.image,
                description: product.description
            });
        }
        localStorage.setItem("carrito", JSON.stringify(carrito));

        // Debug
        console.log("buyNow — producto añadido:", product.title, "Carrito ahora tiene", carrito.length, "items");

        // Redirigir a la página de compra
        window.location.href = "carrito.html";
    };

    // --- Abrir modal con un productId ---
    function openModal(productId) {
        const p = products.find(x => Number(x.id) === Number(productId));
        if (!p) {
            console.warn("openModal: producto no encontrado:", productId);
            return;
        }

        // Establecer datos en el modal
        modalImage.src = p.image || "assets/media/placeholder.png";
        modalImage.alt = p.title;
        modalTitle.textContent = p.title;
        modalDescription.textContent = p.description;
        modalPrice.textContent = `S/ ${Number(p.price).toFixed(2)}`;

        // Botón comprar ahora → llama a buyNow
        buyNowBtn.onclick = () => window.buyNow(p.id);

        // Mostrar modal
        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
    }

    // --- Cerrar modal ---
    function closeModal() {
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
    }
    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    // --- Conectar botones "Ver más" ---
    const buttons = document.querySelectorAll(".ver-mas");
    buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const id = btn.dataset.id;
            openModal(id);
        });
    });

    // --- Imagen fallback ---
    modalImage.addEventListener("error", () => {
        modalImage.src = "assets/media/placeholder.png";
    });

    console.log("Modal script cargado. Productos disponibles:", products.length);
});