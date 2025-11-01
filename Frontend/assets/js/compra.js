// assets/js/compra.js
document.addEventListener("DOMContentLoaded", () => {
    // ---------- Helper para mensajes bonitos ----------
    function showMessage(type, title, text) {
        if (window.Swal) {
            const icon = type === "error" ? "error" : type === "warning" ? "warning" : type === "info" ? "info" : "success";
            return Swal.fire({ icon, title, text, confirmButtonColor: "#e63946" });
        } else {
            alert(`${title}\n\n${text}`);
            return Promise.resolve();
        }
    }

    // ---------- Datos iniciales ----------
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const productosMaster = JSON.parse(localStorage.getItem("productos")) || [];

    const itemsContainer = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");
    const cartCount = document.getElementById("cart-count");
    const finalizarBtn = document.getElementById("finalizarCompra");

    let pagoProcesado = false;
    let metodoUsado = null;

    // ---------- Sincronizar carrito con master ----------
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

    // ---------- Renderizar carrito ----------
    function renderCarrito() {
        syncWithMaster();

        if (!itemsContainer) return;

        if (carrito.length === 0) {
            itemsContainer.innerHTML = `<div class="carrito-vacio"><p>Tu carrito está vacío</p></div>`;
            totalElement && (totalElement.textContent = "Total: S/ 0.00");
            if (cartCount) cartCount.textContent = "0";
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
                </div>`;
            itemsContainer.appendChild(div);
        });

        totalElement && (totalElement.textContent = `Total: S/ ${total.toFixed(2)}`);
        if (cartCount) cartCount.textContent = cantidadTotal;
        localStorage.setItem("carrito", JSON.stringify(carrito));
        if (finalizarBtn) finalizarBtn.disabled = !pagoProcesado;
    }

    // ---------- Eventos sumar/restar/eliminar ----------
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

    // ---------- Métodos de pago ----------
    const metodoCards = Array.from(document.querySelectorAll(".metodo-card"));
    const visaModal = document.getElementById("visaModal");
    const yapeModal = document.getElementById("yapeModal");

    metodoCards.forEach(card => {
        card.addEventListener("click", () => {
            const radio = card.querySelector('input[name="metodoPago"]');
            if (radio) radio.checked = true;

            const val = radio ? radio.value : null;
            if (val === "Visa") {
                metodoUsado = "Visa";
                if (visaModal) visaModal.classList.add("mostrar");
            } else if (val === "Yape") {
                metodoUsado = "Yape";
                if (yapeModal) yapeModal.classList.add("mostrar");
            }
        });
    });

    function cerrarModal() {
        document.querySelectorAll(".modal").forEach(m => m.classList.remove("mostrar"));
        document.body.style.overflow = "auto";
    }
    window.cerrarModal = cerrarModal;

    document.querySelectorAll(".btn-cerrar").forEach(btn => btn.addEventListener("click", cerrarModal));
    window.addEventListener("click", e => {
        if (e.target.classList && e.target.classList.contains("modal")) {
            e.target.classList.remove("mostrar");
        }
    });

    // ---------- Pago con VISA ----------
    const visaForm = document.getElementById("visaForm");
    if (visaForm) {
        visaForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const numeroEl = document.getElementById("numeroTarjeta");
            const fechaEl = document.getElementById("fechaExp");
            const cvvEl = document.getElementById("cvv");
            const nombreEl = document.getElementById("nombreTarjeta");

            const numero = numeroEl ? numeroEl.value.replace(/\s+/g, "") : "";
            const fecha = fechaEl ? fechaEl.value.trim() : "";
            const cvv = cvvEl ? cvvEl.value.trim() : "";
            const nombre = nombreEl ? nombreEl.value.trim() : "";

            const regexNumero = /^\d{13,19}$/; // acepta Amex, Visa, MC, etc.
            const regexCVV = /^\d{3,4}$/;

            if (!regexNumero.test(numero))
                return showMessage("error", "Número inválido", "El número de tarjeta no es válido.");
            if (!fecha)
                return showMessage("error", "Fecha inválida", "Debes ingresar la fecha de expiración.");
            if (!regexCVV.test(cvv))
                return showMessage("error", "CVV inválido", "El CVV debe tener 3 o 4 números.");
            if (nombre.length < 3)
                return showMessage("error", "Nombre inválido", "Ingresa el nombre completo del titular.");

            showMessage("success", "Pago procesado", "Pago con tarjeta procesado correctamente.")
                .then(() => {
                    carrito = [];
                    localStorage.removeItem("carrito");
                    renderCarrito();
                    visaForm.reset();
                    if (visaModal) visaModal.classList.remove("mostrar");
                    showMessage("success", "Compra completada", "Tu compra fue registrada exitosamente.");
                });
        });
    }

    // ---------- Preview y detección avanzada de tarjeta ----------
    const brandMap = {
        visa: 'assets/media/visa.png',
        mastercard: 'assets/media/mastercard.png',
        amex: 'assets/media/amex.png',
        discover: 'assets/media/discover.jpg',
        diners: 'assets/media/diners.png',
        jcb: 'assets/media/jcb.jpg',
        maestro: 'assets/media/maestro.png',
        unknown: 'assets/media/credit-card-icon-png-4408.png'
    };

    function detectCardBrand(number) {
        const n = number.replace(/\D/g, '');
        if (/^4/.test(n)) return 'visa';
        if (/^(5[1-5])/.test(n) || /^(222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(n)) return 'mastercard';
        if (/^(34|37)/.test(n)) return 'amex';
        if (/^6(?:011|5)/.test(n) || /^64[4-9]/.test(n) || /^622(?:12[6-9]|1[3-9]\d|[2-8]\d{2}|9[01]\d|92[0-5])/.test(n)) return 'discover';
        if (/^3(?:0[0-5]|[68])/.test(n)) return 'diners';
        if (/^35/.test(n)) return 'jcb';
        if (/^(50|56|57|58|6[37])/.test(n)) return 'maestro';
        return 'unknown';
    }

    function formatCardNumber(value) {
        const v = value.replace(/\D/g, '');
        if (/^(34|37)/.test(v)) {
            return v.replace(/(\d{1,4})(\d{1,6})?(\d{1,5})?/, (_, a, b, c) =>
                [a, b, c].filter(Boolean).join(' ')
            );
        }
        return v.replace(/(\d{1,4})/g, '$1 ').trim();
    }

    function luhnCheck(num) {
        const digits = num.replace(/\D/g, '').split('').reverse().map(d => parseInt(d, 10));
        let sum = 0;
        for (let i = 0; i < digits.length; i++) {
            let d = digits[i];
            if (i % 2 === 1) {
                d *= 2;
                if (d > 9) d -= 9;
            }
            sum += d;
        }
        return sum % 10 === 0;
    }

    function updateCardPreview() {
        const numInput = document.getElementById('numeroTarjeta');
        const nameInput = document.getElementById('nombreTarjeta');
        const expInput = document.getElementById('fechaExp');
        const displayNum = document.getElementById('cardNumberDisplay');
        const displayName = document.getElementById('cardNameDisplay');
        const displayExp = document.getElementById('cardExpiryDisplay');
        const brandImg = document.getElementById('cardBrandImg');
        const typeText = document.getElementById('cardTypeText');
        const luhnHint = document.getElementById('luhnHint');

        if (!numInput) return;

        const formatted = formatCardNumber(numInput.value);
        numInput.value = formatted;
        displayNum.textContent = formatted || 'Número de tarjeta';
        displayName.textContent = (nameInput?.value || 'NOMBRE TITULAR').toUpperCase();
        displayExp.textContent = expInput?.value || 'MM/AA';

        const brand = detectCardBrand(formatted);
        brandImg.src = brandMap[brand] || brandMap.unknown;
        typeText.textContent = `Tipo: ${brand === 'unknown' ? 'Desconocido' : brand}`;

        const raw = formatted.replace(/\D/g, '');
        if (raw.length >= 12) {
            const ok = luhnCheck(raw);
            luhnHint.textContent = ok ? 'Número válido (Luhn)' : 'Número inválido (Luhn)';
            luhnHint.className = ok ? 'luhn-valid' : 'luhn-invalid';
        } else {
            luhnHint.textContent = '';
            luhnHint.className = '';
        }
    }

    const numeroTarjetaEl = document.getElementById('numeroTarjeta');
    const nombreTarjetaEl = document.getElementById('nombreTarjeta');
    const fechaExpEl = document.getElementById('fechaExp');

    if (numeroTarjetaEl) {
        numeroTarjetaEl.addEventListener('input', updateCardPreview);
        numeroTarjetaEl.addEventListener('paste', () => setTimeout(updateCardPreview, 0));
    }
    if (nombreTarjetaEl) nombreTarjetaEl.addEventListener('input', updateCardPreview);
    if (fechaExpEl) fechaExpEl.addEventListener('input', updateCardPreview);

    if (typeof updateCardPreview === 'function') updateCardPreview();

    // ---------- Pago con Yape ----------
    const confirmarYape = document.getElementById("confirmarYape");
    if (confirmarYape) {
        confirmarYape.addEventListener("click", () => {
            showMessage("success", "Pago confirmado", "Pago con Yape confirmado.")
                .then(() => {
                    carrito = [];
                    localStorage.removeItem("carrito");
                    renderCarrito();
                    if (yapeModal) yapeModal.classList.remove("mostrar");
                });
        });
    }

    renderCarrito();
});


