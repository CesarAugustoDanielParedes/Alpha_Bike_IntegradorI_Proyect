// Frontend/assets/js/productos.js

// Almacenará los productos obtenidos de la API (sincronizados con el admin)
let catalogoProductos = []; 

// ----------------------------------------------------
// 1. FUNCIONES DE LECTURA Y RENDERIZADO
// ----------------------------------------------------

/**
 * Genera la tarjeta HTML para un producto.
 */
function buildProductCard(p) {
    const stockStatus = p.Stock > 0 ? "En stock" : "Sin stock";

    return `
        <div class="producto-card" onclick="openModal(${p.id})"> 
            <img src="${p.logo}" alt="${p.marca}" class="producto-logo">
            <img src="${p.imagen}" alt="${p.nombre}" class="producto-img">
            <div class="producto-info">
                <span class="stock">${stockStatus}</span>
                <span>${p.nombre}</span>
                <strong>S/ ${parseFloat(p.precio).toFixed(2)}</strong> 
            </div>
            <button class="btn-red" onclick="event.stopPropagation(); addToCart(${p.id})">🛒 Añadir al Carrito</button>
            </div>
    `;
}

/**
 * Renderiza la cuadrícula de productos.
 */
function renderProductos(lista) {
    const grid = document.getElementById("productosGrid");
    grid.innerHTML = "";
    
    if (!lista || lista.length === 0) {
        grid.innerHTML = '<p>No se encontraron productos disponibles en el catálogo.</p>';
        return;
    }

    lista.forEach(p => {
        // Asumiendo que el controlador de productos ya devuelve SKU y Descripción 
        // para que el modal funcione correctamente
        grid.innerHTML += buildProductCard(p);
    });
}


/**
 * Obtiene productos desde la API pública (sincronización con el admin).
 */
async function fetchProductos() {
    const grid = document.getElementById("productosGrid");
    grid.innerHTML = '<h2>Cargando Catálogo...</h2>';

    try {
        const res = await fetch('http://localhost:3000/api/productos');
        
        if (!res.ok) {
            throw new Error('El servidor no respondió correctamente al catálogo público.');
        }
        
        const data = await res.json();
        
        // 🚨 Manejo de seguridad: Siempre asegura que sea una matriz
        catalogoProductos = Array.isArray(data) ? data : []; 
        
        renderProductos(catalogoProductos); 

    } catch (error) {
        console.error('Error al cargar productos:', error);
        grid.innerHTML = '<p style="color: red;">Error al conectar con la tienda. Verifique el servidor.</p>';
    }
}


// ----------------------------------------------------
// 2. LÓGICA DE MODAL Y CARRITO
// ----------------------------------------------------

/**
 * Abre el modal y llena los detalles del producto.
 */
function openModal(productId) {
    const product = catalogoProductos.find(p => p.id === productId);
    const modal = document.getElementById('productDetailModal');

    if (!product || !modal) return;

    // Llenar el Modal con los datos del producto (se asume que el backend los proporciona)
    document.getElementById('modal-title').textContent = product.nombre;
    document.getElementById('modal-image').src = product.imagen;
    // Nota: Necesitas la columna 'SKU' y 'Descripcion' en tu consulta SQL pública
    document.getElementById('modal-sku').textContent = `SKU: ${product.SKU || 'N/D'}`;
    document.getElementById('modal-description').textContent = product.Descripcion || 'Sin descripción detallada.'; 
    document.getElementById('modal-price').textContent = `S/ ${parseFloat(product.precio).toFixed(2)}`;
    
    const stockMsg = product.Stock > 0 ? `✅ En Stock (${product.Stock} unidades)` : '❌ AGOTADO';
    document.getElementById('modal-stock-status').textContent = stockMsg;
    
    const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');
    modalAddToCartBtn.setAttribute('data-product-id', product.id);
    modalAddToCartBtn.onclick = () => addToCart(product.id); // Conecta el botón del modal
    modalAddToCartBtn.disabled = (product.Stock <= 0); 
    
    modal.style.display = 'flex'; // Muestra el modal
}

/**
 * Cierra el modal de detalle.
 */
function closeModal() {
    document.getElementById('productDetailModal').style.display = 'none';
}


/**
 * Lógica para añadir al carrito (Paso inicial de seguridad)
 */
function addToCart(productId) {
    const token = localStorage.getItem('authToken');

    if (!token) {
        alert('Debes iniciar sesión para añadir productos al carrito.');
        window.location.href = 'iniciosesion.html';
        return;
    }
    
    // 🚨 IMPLEMENTACIÓN FUTURA: Aquí iría la llamada API POST /api/carrito/agregar
    alert(`Producto ID ${productId} añadido al carrito (Lógica de API protegida en desarrollo).`);
}


// Filtro de rango (ajustado para usar datos dinámicos)
const precioRange = document.getElementById("precioRange");
if (precioRange) {
    const precioMax = document.getElementById("precioMax");
    precioRange.addEventListener("input", () => {
        precioMax.textContent = precioRange.value;
        const filtrados = catalogoProductos.filter(p => parseFloat(p.precio) <= parseFloat(precioRange.value));
        renderProductos(filtrados);
    });
}

// ----------------------------------------------------
// 3. INICIALIZACIÓN
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', fetchProductos);