document.addEventListener("DOMContentLoaded", () => {
    // leer carrito y productos maestro
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const productosMaster = JSON.parse(localStorage.getItem("productos")) || [];

    const itemsContainer = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");
    const cartCount = document.getElementById("cart-count");
    const finalizarBtn = document.getElementById("finalizarCompra"); // asegúrate de añadir id en el HTML

    // sincroniza nombres/precios/imagen del carrito con la lista maestra
    function syncWithMaster() {
        if (!productosMaster.length) return;
        let changed = false;
        carrito = carrito.map(item => {
            const p = productosMaster.find(x => Number(x.id) === Number(item.id));
            if (p) {
                if (item.nombre !== p.title || item.precio !== p.price || item.imagen !== p.image) {
                    item.nombre = p.title;
                    item.precio = p.price;
                    item.imagen = p.image;
                    changed = true;
                }
            }
            return item;
        });
        if (changed) localStorage.setItem("carrito", JSON.stringify(carrito));
    }

    // render
    function renderCarrito() {
        syncWithMaster();

        if (carrito.length === 0) {
            itemsContainer.innerHTML = "<p>Tu carrito está vacío 🛒</p>";
            totalElement.textContent = "Total: S/ 0.00";
            if (cartCount) cartCount.textContent = "0";
            return;
        }

        itemsContainer.innerHTML = "";
        let total = 0;
        let cantidadTotal = 0;

        carrito.forEach((item, index) => {
            const itemTotal = item.precio * item.cantidad;
            total += itemTotal;
            cantidadTotal += item.cantidad;

            const div = document.createElement("div");
            div.classList.add("cart-item");
            div.innerHTML = `
        <img src="${item.imagen}" alt="${item.nombre}" class="cart-img">
        <div class="cart-info">
        <h4>${item.nombre}</h4>
        <p class="precio">Precio: S/ ${item.precio.toFixed(2)}</p>

        <div class="cantidad-control">
            <button class="btn-cantidad" data-action="restar" data-index="${index}">-</button>
            <span class="cantidad-valor">${item.cantidad}</span>
            <button class="btn-cantidad" data-action="sumar" data-index="${index}">+</button>
        </div>

        <p><strong>Subtotal: S/ ${itemTotal.toFixed(2)}</strong></p>
        <button class="btn-eliminar" data-index="${index}">❌ Eliminar</button>
        </div>
    `;
            itemsContainer.appendChild(div);
        });

        totalElement.textContent = `Total: S/ ${total.toFixed(2)}`;
        if (cartCount) cartCount.textContent = cantidadTotal;

        // guardar cambios
        localStorage.setItem("carrito", JSON.stringify(carrito));
    }

    // delegación: sumar/restar/eliminar
    itemsContainer.addEventListener("click", (e) => {
        const t = e.target;

        if (t.classList.contains("btn-cantidad")) {
            const index = Number(t.dataset.index);
            const action = t.dataset.action;
            if (action === "sumar") carrito[index].cantidad++;
            if (action === "restar" && carrito[index].cantidad > 1) carrito[index].cantidad--;
            renderCarrito();
        }

        if (t.classList.contains("btn-eliminar")) {
            const index = Number(t.dataset.index);
            carrito.splice(index, 1);
            renderCarrito();
        }
    });

    // Finalizar compra: mostrar modal bonito, limpiar carrito y feedback
    function showConfirmation() {
        // crear modal dinámico (no necesitas tocar HTML)
        const overlay = document.createElement("div");
        overlay.id = "confirmOverlay";
        overlay.innerHTML = `
    <div class="confirm-card">
        <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
        <path class="checkmark__check" fill="none" d="M14 27l7 7 17-17"/>
        </svg>
        <h3>Compra realizada 🎉</h3>
        <p>Gracias por tu pedido. Te contactaremos pronto.</p>
        <button id="confirmOk" class="btn-red">Aceptar</button>
    </div>
    `;
        document.body.appendChild(overlay);

        // estilos inline si aún no añadiste el CSS (pero se recomienda añadir abajo en CSS)
        overlay.style.position = "fixed";
        overlay.style.inset = 0;
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.background = "rgba(0,0,0,0.6)";
        overlay.style.zIndex = 3000;

        const card = overlay.querySelector(".confirm-card");
        card.style.background = "#fff";
        card.style.padding = "28px";
        card.style.borderRadius = "12px";
        card.style.textAlign = "center";
        card.style.width = "90%";
        card.style.maxWidth = "420px";
        card.style.boxShadow = "0 12px 30px rgba(0,0,0,0.25)";

        // animación SVG
        const okBtn = overlay.querySelector("#confirmOk");

        okBtn.addEventListener("click", () => {
            // limpiar carrito y cerrar
            carrito = [];
            localStorage.removeItem("carrito");
            if (cartCount) cartCount.textContent = "0";
            renderCarrito();
            document.body.removeChild(overlay);
        });
    }

    // conectar boton finalizar (añade id="finalizarCompra" al botón en HTML)
    if (finalizarBtn) {
        finalizarBtn.addEventListener("click", () => {
            if (!carrito.length) {
                alert("Tu carrito está vacío.");
                return;
            }
            showConfirmation();
        });
    } else {
        console.warn("No se encontró botón #finalizarCompra. Añade id='finalizarCompra' al botón Finalizar Compra.");
    }

    // render inicial
    renderCarrito();
});