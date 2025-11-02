// assets/js/compra.js
document.addEventListener("DOMContentLoaded", () => {
    // helper para mensajes (Swal si existe, fallback a alert)
    function showMessage(type, title, text) {
        if (window.Swal) {
            const icon = type === "error" ? "error" : type === "warning" ? "warning" : type === "info" ? "info" : "success";
            return Swal.fire({ icon, title, text, confirmButtonColor: "#e63946" });
        } else {
            // fallback simple (sin promesas)
            if (type === "error") alert(title + "\n\n" + text);
            else alert(title + "\n\n" + text);
            return Promise.resolve();
        }
    }

    // --- lectura inicial ---
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const productosMaster = JSON.parse(localStorage.getItem("productos")) || [];

    const itemsContainer = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");
    const cartCount = document.getElementById("cart-count");
    const finalizarBtn = document.getElementById("finalizarCompra");

    // Si no existe el botón finalizar, crear referencia segura
    if (!finalizarBtn) console.warn("No se encontró #finalizarCompra en el HTML.");

    // estado: si el pago ya se procesó (Visa/Yape)
    let pagoProcesado = false;
    let metodoUsado = null;

    // ---- sincroniza con master ----
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

    // ---- render carrito ----
    function renderCarrito() {
        syncWithMaster();

        if (!itemsContainer) return;

        if (carrito.length === 0) {
            itemsContainer.innerHTML = `
        <div class="carrito-vacio">
          <p>Tu carrito está vacío</p>
        </div>`;
            totalElement && (totalElement.textContent = "Total: S/ 0.00");
            if (cartCount) cartCount.textContent = "0";
            // deshabilitar confirm si no hay items
            if (finalizarBtn) finalizarBtn.disabled = true;
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

        totalElement && (totalElement.textContent = `Total: S/ ${total.toFixed(2)}`);
        if (cartCount) cartCount.textContent = cantidadTotal;
        localStorage.setItem("carrito", JSON.stringify(carrito));

        // Si ya se procesó el pago y aún hay items (caso raro), dejar habilitado
        if (finalizarBtn) finalizarBtn.disabled = !pagoProcesado;
    }

    // ---- delegación eventos sumar/restar/eliminar ----
    if (itemsContainer) {
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
    }

    // ---- selección de método (las tarjetas .metodo-card) ----
    const metodoCards = Array.from(document.querySelectorAll(".metodo-card"));
    const visaModal = document.getElementById("visaModal");
    const yapeModal = document.getElementById("yapeModal");

    // abrir modal al hacer click sobre la tarjeta
    metodoCards.forEach(card => {
        card.addEventListener("click", () => {
            // marcar el input radio dentro (si existe) para mantener accesibilidad
            const radio = card.querySelector('input[name="metodoPago"]');
            if (radio) {
                radio.checked = true;
            }

            // abrir modal según valor del radio
            const val = radio ? radio.value : null;
            if (val === "Visa") {
                metodoUsado = "Visa";
                if (visaModal) visaModal.classList.add("mostrar");
            } else if (val === "Yape") {
                metodoUsado = "Yape";
                if (yapeModal) yapeModal.classList.add("mostrar");
            } else {
                // si no hay radio, intentamos inferir por alt/img o texto
                const txt = card.textContent || "";
                if (txt.toLowerCase().includes("visa") && visaModal) {
                    metodoUsado = "Visa";
                    visaModal.classList.add("mostrar");
                } else if (txt.toLowerCase().includes("yape") && yapeModal) {
                    metodoUsado = "Yape";
                    yapeModal.classList.add("mostrar");
                }
            }
        });
    });

    // cerrar modales (botones con .btn-cerrar o atributo onclick="cerrarModal()")
    function cerrarModal() {
        document.querySelectorAll(".modal").forEach(m => m.classList.remove("mostrar"));
        document.body.style.overflow = "auto";
    }
    // exponer para HTML inline onclick
    window.cerrarModal = cerrarModal;

    // cerrar con botones .btn-cerrar
    document.querySelectorAll(".btn-cerrar").forEach(btn => {
        btn.addEventListener("click", cerrarModal);
    });

    // cerrar clic fuera (clase .modal)
    window.addEventListener("click", e => {
        if (e.target.classList && e.target.classList.contains("modal")) {
            e.target.classList.remove("mostrar");
        }
    });

    // ---- VALIDACIONES Y PROCESAMIENTO VISA ----
    const visaForm = document.getElementById("visaForm");
    if (visaForm) {
        visaForm.addEventListener("submit", (e) => {
            e.preventDefault();

            // Inputs (IDs según tu HTML)
            const numeroEl = document.getElementById("numeroTarjeta");
            const fechaEl = document.getElementById("fechaExp");
            const cvvEl = document.getElementById("cvv");
            const nombreEl = document.getElementById("nombreTarjeta");

            const numero = numeroEl ? numeroEl.value.replace(/\s+/g, "") : "";
            const fecha = fechaEl ? fechaEl.value.trim() : "";
            const cvv = cvvEl ? cvvEl.value.trim() : "";
            const nombre = nombreEl ? nombreEl.value.trim() : "";

            const regexNumero = /^\d{16}$/;
            const regexCVV = /^\d{3}$/;

            if (!regexNumero.test(numero)) {
                return showMessage("error", "Número inválido", "El número de tarjeta debe tener 16 dígitos numéricos.");
            }
            if (!fecha) {
                return showMessage("error", "Fecha inválida", "Debes ingresar la fecha de expiración.");
            }
            if (!regexCVV.test(cvv)) {
                return showMessage("error", "CVV inválido", "El CVV debe tener exactamente 3 números.");
            }
            if (nombre.length < 3) {
                return showMessage("error", "Nombre inválido", "Ingresa el nombre completo del titular.");
            }

            // Si pasa validaciones: simular procesamiento y cerrar modal
            showMessage("success", "Pago procesado", "Pago con tarjeta Visa procesado correctamente.")
                .then(() => {
                    // Limpiar carrito tras pago exitoso
                    carrito = [];
                    localStorage.removeItem("carrito");
                    renderCarrito();

                    // Cerrar modal y reset form
                    visaForm.reset();
                    if (visaModal) visaModal.classList.remove("mostrar");

                    // Mensaje final de confirmación
                    showMessage("success", "Compra completada", "Tu compra fue registrada exitosamente.");
                });
        });
    }

    // ---- CONFIRMAR PAGO YAPE ----
    const confirmarYape = document.getElementById("confirmarYape");
    if (confirmarYape) {
        confirmarYape.addEventListener("click", () => {
            showMessage("success", "Pago confirmado", "Pago con Yape confirmado.")
                .then(() => {
                    pagoProcesado = true;
                    if (finalizarBtn) finalizarBtn.disabled = false;
                    if (yapeModal) yapeModal.classList.remove("mostrar");
                });
        });
    }

    // ---- FINALIZAR COMPRA: limpiar carrito y mostrar resumen ----
    if (finalizarBtn) {
        finalizarBtn.addEventListener("click", () => {
            if (!carrito.length) {
                return showMessage("warning", "Carrito vacío", "Agrega productos antes de continuar.");
            }
            if (!pagoProcesado) {
                return showMessage("info", "Pago pendiente", "Primero procesa el pago (Visa o Yape).");
            }

            // construir resumen breve
            const total = carrito.reduce((s, it) => s + (it.precio * it.cantidad), 0);
            const resumen = `Método: ${metodoUsado || "N/A"}\nTotal: S/ ${total.toFixed(2)}\nProductos: ${carrito.length}`;

            showMessage("success", "Pedido confirmado", `Tu compra fue registrada.\n\n${resumen}`)
                .then(() => {
                    // limpiar carrito
                    carrito = [];
                    localStorage.removeItem("carrito");
                    pagoProcesado = false;
                    metodoUsado = null;
                    if (finalizarBtn) finalizarBtn.disabled = true;
                    renderCarrito();
                });
        });
    }
    function cerrarModal() {
        const modales = document.querySelectorAll('.modal.mostrar');
        modales.forEach(modal => modal.classList.remove('mostrar'));
    }

    // render inicial
    renderCarrito();
});
