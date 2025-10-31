// assets/js/admin.js

// ----------------------------------------------------
// VARIABLES GLOBALES Y UTILIDADES
// ----------------------------------------------------
let currentAdmin = {
    token: localStorage.getItem('authToken'),
    role: localStorage.getItem('userRole'),
    name: localStorage.getItem('userName')
};

let catalogData = {
    marcas: [],
    categorias: []
};
const PEDIDO_STATUS = ['Pendiente', 'En Proceso', 'Enviado', 'Completado', 'Cancelado'];

// Función auxiliar para construir opciones de SELECT (usada en formularios)
const buildOptions = (items, selectedId) => {
    return items.map(item => {
        const itemId = item.id || item.ID || item.MarcaID || item.CategoriaID;
        const itemName = item.Nombre || item.nombre;
        const isSelected = parseInt(selectedId) === itemId;
        return `<option value="${itemId}" ${isSelected ? 'selected' : ''}>${itemName}</option>`;
    }).join('');
};


// ----------------------------------------------------
// 1. FUNCIONES DE SEGURIDAD Y CIERRE DE SESIÓN
// ----------------------------------------------------
function checkAdminAuth() {
    if (!currentAdmin.token || currentAdmin.role !== 'Administrador') {
        alert('Acceso no autorizado. Por favor, inicie sesión como administrador.');
        localStorage.clear();
        window.location.href = '../login_admin.html'; 
        return false;
    }
    return true;
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    const adminNameDisplay = document.getElementById('adminNameDisplay'); 
    
    const logoutHandler = (e) => {
        e.preventDefault();
        localStorage.clear(); 
        alert('Sesión cerrada. Redirigiendo...');
        window.location.href = '../login_admin.html';
    };

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutHandler);
    }
    if (adminNameDisplay) {
        adminNameDisplay.style.cursor = 'pointer';
        adminNameDisplay.addEventListener('click', logoutHandler);
    }
}


// ----------------------------------------------------
// 2. MÓDULOS DE CATÁLOGO (APIs Auxiliares)
// ----------------------------------------------------

async function fetchMarcas() {
    try {
        // Usamos la ruta pública para cargar en SELECTs
        const res = await fetch('http://localhost:3000/api/marcas'); 
        return res.status === 200 ? res.json() : [];
    } catch (e) { return []; }
}

async function fetchCategorias() {
    try {
        // Usamos la ruta pública para cargar en SELECTs
        const res = await fetch('http://localhost:3000/api/categorias'); 
        return res.status === 200 ? res.json() : [];
    } catch (e) { return []; }
}


// ----------------------------------------------------
// 3. MÓDULO PRODUCTOS (CRUD y BÚSQUEDA)
// ----------------------------------------------------

function buildProductosTable(productos) {
    let html = '<table border="1"><thead><tr><th>ID</th><th>Nombre</th><th>Marca</th><th>Precio</th><th>Stock</th><th>Activo</th><th>Acciones</th></tr></thead><tbody>';
    
    productos.forEach(p => {
        const activoText = p.Activo ? '✅ Sí' : '❌ No';
        html += `
            <tr data-product-id="${p.ProductoID}">
                <td>${p.ProductoID}</td>
                <td>${p.Nombre} (${p.SKU})</td>
                <td>${p.MarcaNombre}</td>
                <td>S/ ${p.Precio.toFixed(2)}</td>
                <td>${p.Stock}</td>
                <td>${activoText}</td>
                <td class="action-buttons">
                    <button class="btn-edit" onclick="showProductForm(${p.ProductoID}, 'edit')">✏️ Editar</button>
                    <button class="btn-activate" onclick="showProductForm(${p.ProductoID}, 'descuento')">💲 Ajuste Precio</button>
                    <button class="btn-delete" onclick="handleProductDelete(${p.ProductoID}, '${p.Nombre}')">🗑️ Eliminar</button>
                </td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    return html;
}

async function loadProductosModule(searchTerm = '') {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <h2>📦 Gestión de Productos</h2>
        <div class="search-bar">
            <input type="text" id="productSearchInput" placeholder="Buscar producto por Nombre o SKU..." value="${searchTerm}">
            <button class="btn-search" id="searchProductBtn">🔍 Buscar</button>
        </div>
        <button id="addProductBtn" class="btn-activate" style="margin-bottom: 20px;">+ Agregar Nuevo Producto</button>
        <div id="productosTableContainer">Cargando productos...</div>
    `;
    
    document.getElementById('searchProductBtn').addEventListener('click', () => {
        const input = document.getElementById('productSearchInput').value.trim();
        loadProductosModule(input);
    });

    document.getElementById('addProductBtn').addEventListener('click', () => {
        showProductForm(null, 'create');
    });
    
    try {
        const token = localStorage.getItem('authToken');
        const url = `http://localhost:3000/api/admin/productos${searchTerm ? `?search=${searchTerm}` : ''}`;

        const res = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401 || res.status === 403) throw new Error('Sesión expirada o permisos insuficientes.');
        
        const productos = await res.json();
        const tableContainer = document.getElementById('productosTableContainer');

        if (productos.length === 0 && !searchTerm) {
            tableContainer.innerHTML = '<p>No hay productos registrados. Agrega uno nuevo.</p>';
        } else if (productos.length === 0 && searchTerm) {
             tableContainer.innerHTML = `<p>No se encontraron productos con el término: <strong>${searchTerm}</strong>.</p>`;
        } else {
             tableContainer.innerHTML = buildProductosTable(productos);
        }

    } catch (error) {
        document.getElementById('productosTableContainer').innerHTML = `<p style="color: red;">ERROR: No se pudieron cargar los datos. ${error.message}</p>`;
    }
}

async function showProductForm(productoId = null, mode = 'create') {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = 'Cargando formulario...';

    // Obtener datos del catálogo para los SELECTs
    catalogData.marcas = await fetchMarcas();
    catalogData.categorias = await fetchCategorias();

    let product = {};
    let isEditing = productoId !== null;
    let titulo = isEditing ? 'Editar Producto' : 'Crear Nuevo Producto';
    let submitText = isEditing ? 'Actualizar Producto' : 'Guardar Producto';

    if (isEditing) {
        // Simulación de datos: DEBES REEMPLAZAR ESTO CON UN FETCH GET /api/admin/productos/:id REAL
        if (mode === 'descuento') {
            titulo = `💲 Ajuste de Precio / Stock (#${productoId})`;
            submitText = 'Aplicar Ajuste';
        }
        // Placeholder de datos para edición (REEMPLAZAR CON FETCH REAL):
        product = {Nombre: 'Bici Test', Descripcion: 'Ligera...', Precio: 1500, Stock: 10, SKU: 'TEST-001', CategoriaID: 1, MarcaID: 1, ImagenURL: 'http://temp.com/img.jpg', Activo: true};
    }
    
    contentArea.innerHTML = `
        <h3>${titulo}</h3>
        <form id="productForm" class="product-form">
            <input type="hidden" id="productoId" value="${productoId || ''}">
            
            <input type="text" id="nombre" placeholder="Nombre del Producto" value="${product.Nombre || ''}" ${mode === 'descuento' ? 'readonly' : ''} required>
            <textarea id="descripcion" placeholder="Descripción" ${mode === 'descuento' ? 'readonly' : ''} required>${product.Descripcion || ''}</textarea>
            
            <input type="number" id="precio" placeholder="Precio (Ej: 150.00)" step="0.01" value="${product.Precio || ''}" required>
            <input type="number" id="stock" placeholder="Stock" value="${product.Stock || ''}" required>
            <input type="text" id="sku" placeholder="SKU Único (Ej: BICI-MTB-M)" value="${product.SKU || ''}" ${mode === 'descuento' ? 'readonly' : ''} required>
            
            <select id="marcaId" ${mode === 'descuento' ? 'disabled' : ''} required>
                <option value="">-- Seleccionar Marca --</option>
                ${buildOptions(catalogData.marcas, product.MarcaID)}
            </select>
            
            <select id="categoriaId" ${mode === 'descuento' ? 'disabled' : ''} required>
                <option value="">-- Seleccionar Categoría --</option>
                ${buildOptions(catalogData.categorias, product.CategoriaID)}
            </select>

            <input type="url" id="imagenUrl" placeholder="URL de la Imagen Principal" value="${product.ImagenURL || ''}" ${mode === 'descuento' ? 'readonly' : ''}>
            
            <label>
                <input type="checkbox" id="activo" ${product.Activo !== false ? 'checked' : ''} ${mode === 'descuento' ? 'disabled' : ''}> 
                Producto Activo (Visible al cliente)
            </label>
            
            <button type="submit" class="btn-primary">${submitText}</button>
            <button type="button" class="btn-secondary" onclick="loadModuleContent('productos')">Cancelar</button>
        </form>
    `;

    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('authToken');
    const form = e.target;
    const productoId = form.productoId.value;
    const isEditing = !!productoId; 

    const categoriaIdValue = form.categoriaId.value || (isEditing ? form.categoriaId.value : null);
    const marcaIdValue = form.marcaId.value || (isEditing ? form.marcaId.value : null);
    const activoValue = form.activo.checked || (isEditing ? form.activo.checked : false);


    const productData = {
        nombre: form.nombre.value,
        descripcion: form.descripcion.value,
        precio: parseFloat(form.precio.value),
        stock: parseInt(form.stock.value),
        sku: form.sku.value,
        categoriaId: parseInt(categoriaIdValue),
        marcaId: parseInt(marcaIdValue),
        imagenUrl: form.imagenUrl.value,
        activo: activoValue
    };

    const url = isEditing 
        ? `http://localhost:3000/api/admin/productos/${productoId}`
        : 'http://localhost:3000/api/admin/productos';
    const method = isEditing ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        const data = await res.json();

        if (res.status === 201 || res.status === 200) {
            alert(data.mensaje);
            loadProductosModule(); 
        } else {
            alert(data.error || 'Error desconocido al procesar el producto.');
        }
    } catch (error) {
        alert('Error de conexión con el servidor.');
    }
}

async function handleProductDelete(productoId, nombreProducto) {
    if (!confirm(`¿Estás seguro de ELIMINAR permanentemente el producto: ${nombreProducto}?`)) {
        return;
    }

    const token = localStorage.getItem('authToken');
    const url = `http://localhost:3000/api/admin/productos/${productoId}`;

    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (res.status === 200) {
            alert(data.mensaje);
            loadProductosModule(); 
        } else {
            alert(data.error || 'Error al intentar eliminar el producto.');
        }
    } catch (e) {
        alert('Error de conexión al servidor.');
    }
}


// ----------------------------------------------------
// 4. MÓDULO PEDIDOS (Gestión de Estado)
// ----------------------------------------------------

function buildPedidosTable(pedidos) {
    let html = '<table border="1"><thead><tr><th>ID</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
    
    pedidos.forEach(p => {
        const statusOptions = PEDIDO_STATUS.map(status => 
            `<option value="${status}" ${p.Estado === status ? 'selected' : ''}>${status}</option>`
        ).join('');

        html += `
            <tr data-pedido-id="${p.PedidoID}" class="status-${p.Estado.replace(/\s/g, '')}">
                <td>${p.PedidoID}</td>
                <td>${new Date(p.FechaPedido).toLocaleDateString()}</td>
                <td>${p.ClienteNombre} (${p.ClienteCorreo})</td>
                <td>S/ ${p.Total.toFixed(2)}</td>
                <td>
                    <select id="status-${p.PedidoID}" data-pedido-id="${p.PedidoID}" class="status-select">
                        ${statusOptions}
                    </select>
                </td>
                <td class="action-buttons">
                    <button class="btn-edit">🔍 Ver Detalles</button>
                    <button class="btn-activate" onclick="savePedidoStatus(${p.PedidoID})">💾 Guardar Estado</button>
                </td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    return html;
}

async function loadPedidosModule() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `<h2>📜 Gestión de Pedidos</h2><div id="pedidosTableContainer">Cargando pedidos...</div>`;

    try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('http://localhost:3000/api/admin/pedidos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401 || res.status === 403) throw new Error('Sesión expirada o permisos insuficientes.');

        const pedidos = await res.json();
        document.getElementById('pedidosTableContainer').innerHTML = buildPedidosTable(pedidos);

    } catch (error) {
        contentArea.innerHTML = `<p style="color: red;">ERROR: No se pudieron cargar los pedidos. ${error.message}</p>`;
    }
}

async function savePedidoStatus(pedidoId) {
    const selectElement = document.getElementById(`status-${pedidoId}`);
    const nuevoEstado = selectElement.value;
    const token = localStorage.getItem('authToken');

    try {
        const res = await fetch(`http://localhost:3000/api/admin/pedidos/${pedidoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nuevoEstado: nuevoEstado })
        });

        const data = await res.json();

        if (res.status === 200) {
            alert(`Estado actualizado: ${data.mensaje}`);
            loadPedidosModule(); 
        } else {
            alert(data.error || 'Error al actualizar el estado del pedido.');
        }
    } catch (error) {
        alert('Error de conexión al servidor.');
    }
}


// ----------------------------------------------------
// 5. MÓDULO CLIENTES (Gestión de Estado)
// ----------------------------------------------------

function buildClientesTable(clientes) {
    let html = '<table border="1"><thead><tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Registro</th><th>Activo</th><th>Acciones</th></tr></thead><tbody>';
    
    clientes.forEach(c => {
        const estadoActual = c.Activo;
        const btnClass = estadoActual ? 'btn-delete' : 'btn-activate';
        const btnText = estadoActual ? '❌ Desactivar' : '✅ Activar';

        html += `
            <tr data-cliente-id="${c.Id}">
                <td>${c.Id}</td>
                <td>${c.NombreCompleto} ${c.Apellido || ''}</td>
                <td>${c.Correo}</td>
                <td>${c.Telefono || 'N/A'}</td>
                <td>${new Date(c.FechaRegistro).toLocaleDateString()}</td>
                <td>${estadoActual ? '✅ Activo' : '❌ Inactivo'}</td>
                <td class="action-buttons">
                    <button class="${btnClass}" onclick="handleClientStatusChange(${c.Id}, ${estadoActual})">${btnText}</button>
                </td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    return html;
}

async function loadClientesModule(searchTerm = '') {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <h2>👥 Gestión de Clientes</h2>
        <div class="search-bar">
            <input type="text" id="clientSearchInput" placeholder="Buscar por Nombre o Correo..." value="${searchTerm}">
            <button class="btn-search" id="searchClientBtn">🔍 Buscar</button>
        </div>
        <div id="clientesTableContainer">Cargando clientes...</div>
    `;
    
    document.getElementById('searchClientBtn').addEventListener('click', () => {
        const input = document.getElementById('clientSearchInput').value.trim();
        loadClientesModule(input);
    });

    try {
        const token = localStorage.getItem('authToken');
        const url = `http://localhost:3000/api/admin/clientes${searchTerm ? `?search=${searchTerm}` : ''}`;
        
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        
        if (res.status === 401 || res.status === 403) throw new Error('Sesión expirada o permisos insuficientes.');

        const clientes = await res.json();
        document.getElementById('clientesTableContainer').innerHTML = buildClientesTable(clientes);

    } catch (error) {
        contentArea.innerHTML = `<p style="color: red;">ERROR: No se pudieron cargar los clientes. ${error.message}</p>`;
    }
}

async function handleClientStatusChange(clienteId, esActivo) {
    const nuevoEstado = !esActivo; 
    const accion = nuevoEstado ? 'Activar' : 'Desactivar';
    
    if (!confirm(`¿Estás seguro de ${accion} la cuenta del cliente #${clienteId}?`)) return;

    const token = localStorage.getItem('authToken');
    try {
        const res = await fetch(`http://localhost:3000/api/admin/clientes/${clienteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ activo: nuevoEstado })
        });

        const data = await res.json();

        if (res.status === 200) {
            alert(data.mensaje);
            loadClientesModule(); 
        } else {
            alert(data.error || `Error al intentar ${accion} la cuenta.`);
        }
    } catch (e) {
        alert('Error de conexión al servidor.');
    }
}


// ----------------------------------------------------
// 6. MÓDULOS AUXILIARES (Marcas, Categorías)
// ----------------------------------------------------

// Lógica de lectura compartida para tablas simples (Marcas/Categorías)
async function fetchSimpleTable(endpoint, title, idField, nameField, extraFields = []) {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `<h2>${title}</h2><div id="tableContainer">Cargando datos...</div>`;
    
    try {
        const token = localStorage.getItem('authToken');
        const url = `http://localhost:3000/api/admin/${endpoint}`; 

        const res = await fetch(url, { 
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401 || res.status === 403) throw new Error('Permisos insuficientes.');
        
        const data = await res.json();
        const tableContainer = document.getElementById('tableContainer');
        
        let html = `<button class="btn-activate" style="margin-bottom: 20px;" onclick="showAuxForm('${endpoint}', null)">+ Agregar Nueva</button>`;
        
        if (data.length === 0) {
            tableContainer.innerHTML = html + '<p>No hay registros. Crea uno nuevo.</p>';
            return;
        }

        let headerHtml = extraFields.map(f => `<th>${f.header}</th>`).join('');

        html += `<table><thead><tr><th>ID</th><th>Nombre</th>${headerHtml}<th>Acciones</th></tr></thead><tbody>`;
        data.forEach(item => {
            const itemId = item[idField];
            const itemName = item[nameField];
            
            let itemExtraHtml = extraFields.map(f => `<td>${item[f.field] || 'N/A'}</td>`).join('');

            html += `
                <tr>
                    <td>${itemId}</td>
                    <td>${itemName}</td>
                    ${itemExtraHtml}
                    <td class="action-buttons">
                        <button class="btn-edit" onclick="showAuxForm('${endpoint}', ${itemId})">✏️ Editar</button>
                        <button class="btn-delete" onclick="handleAuxDelete('${endpoint}', ${itemId}, '${itemName}')">🗑️ Eliminar</button>
                    </td>
                </tr>
            `;
        });
        html += '</tbody></table>';
        tableContainer.innerHTML = html;

    } catch (error) {
        contentArea.innerHTML = `<h2>${title}</h2><p style="color: red;">ERROR: No se pudo cargar la tabla. Verifica el servidor. ${error.message}</p>`;
    }
}

// Función genérica para mostrar formularios de Marcas/Categorías
async function showAuxForm(endpoint, itemId = null) {
    const contentArea = document.getElementById('contentArea');
    const isEditing = itemId !== null;
    let item = {};
    const isMarca = endpoint === 'marcas';
    const title = isMarca ? 'Marca' : 'Categoría';

    contentArea.innerHTML = 'Cargando formulario...';

    if (isEditing) {
        // Placeholder: En un proyecto real, harías un fetch GET /api/admin/endpoint/:id
        item = isMarca 
            ? { Nombre: 'Marca Ejemplo', LogoURL: 'http://temp.com/logo.jpg' }
            : { Nombre: 'Categoría Ejemplo', Descripcion: 'Descripción de la categoría.' };
    }

    const extraField = isMarca
        ? `<label for="logoUrl">URL del Logo:</label>
           <input type="url" id="extraField" placeholder="http://dominio.com/logo.png" value="${item.LogoURL || ''}">`
        : `<label for="descripcion">Descripción:</label>
           <textarea id="extraField" placeholder="Describe brevemente la categoría">${item.Descripcion || ''}</textarea>`;

    contentArea.innerHTML = `
        <h3>${isEditing ? `✏️ Editar ${title}` : `+ Crear Nueva ${title}`}</h3>
        <form id="auxForm" class="product-form" data-endpoint="${endpoint}">
            <input type="hidden" id="itemId" value="${itemId || ''}">
            
            <label for="nombreItem">Nombre de la ${title}:</label>
            <input type="text" id="nombreItem" placeholder="Ej: Mountain Bike" value="${item.Nombre || ''}" required>
            
            ${extraField}
            
            <button type="submit" class="btn-primary">${isEditing ? `Actualizar ${title}` : `Guardar ${title}`}</button>
            <button type="button" class="btn-secondary" onclick="loadModuleContent('${endpoint}')">Cancelar</button>
        </form>
    `;

    document.getElementById('auxForm').addEventListener('submit', handleAuxSubmit);
}

// Función genérica para manejar el envío (POST/PUT)
async function handleAuxSubmit(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('authToken');
    const form = e.target;
    const endpoint = form.getAttribute('data-endpoint');
    const itemId = form.itemId.value;
    const isEditing = !!itemId;
    const isMarca = endpoint === 'marcas';

    const itemData = {
        nombre: form.nombreItem.value,
    };
    
    // Añadir el campo extra (LogoURL o Descripcion)
    if (isMarca) {
        itemData.logoUrl = form.extraField.value;
    } else {
        itemData.descripcion = form.extraField.value;
    }

    const url = isEditing 
        ? `http://localhost:3000/api/admin/${endpoint}/${itemId}`
        : `http://localhost:3000/api/admin/${endpoint}`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(itemData)
        });

        const data = await res.json();

        if (res.status === 201 || res.status === 200) {
            alert(data.mensaje);
            loadModuleContent(endpoint); // Recargar la lista
        } else {
            alert(data.error || 'Error al procesar la solicitud.');
        }
    } catch (error) {
        alert('Error de conexión con el servidor.');
    }
}

// Función genérica para manejar la eliminación
async function handleAuxDelete(endpoint, itemId, itemName) {
    const title = endpoint === 'marcas' ? 'Marca' : 'Categoría';
    
    if (!confirm(`¿Estás seguro de ELIMINAR permanentemente la ${title}: ${itemName}? Esto fallará si está asociada a productos.`)) {
        return;
    }

    const token = localStorage.getItem('authToken');
    const url = `http://localhost:3000/api/admin/${endpoint}/${itemId}`;

    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (res.status === 200) {
            alert(data.mensaje);
            loadModuleContent(endpoint); 
        } else {
            alert(data.error || `Error al intentar eliminar la ${title}.`);
        }
    } catch (e) {
        alert('Error de conexión al servidor.');
    }
}


function loadMarcasModule() {
    // Usamos el campo extra: LogoURL
    fetchSimpleTable('marcas', '🏷️ Gestión de Marcas', 'MarcaID', 'Nombre', [{ field: 'LogoURL', header: 'Logo URL' }]); 
}

function loadCategoriasModule() {
    // Usamos el campo extra: Descripcion
    fetchSimpleTable('categorias', '📂 Gestión de Categorías', 'CategoriaID', 'Nombre', [{ field: 'Descripcion', header: 'Descripción' }]); 
}


// ----------------------------------------------------
// 7. MÓDULO BANNERS (CRUD Frontend)
// ----------------------------------------------------

// 🔑 NUEVA FUNCIÓN: Genera la tabla de Banners
function buildBannersTable(banners) {
    let html = '<table border="1"><thead><tr><th>ID</th><th>Título</th><th>URL Imagen</th><th>URL Destino</th><th>Orden</th><th>Activo</th><th>Acciones</th></tr></thead><tbody>';
    
    banners.forEach(b => {
        const activoText = b.Activo ? '✅ Sí' : '❌ No';
        html += `
            <tr data-banner-id="${b.BannerID}">
                <td>${b.BannerID}</td>
                <td>${b.Titulo}</td>
                <td><a href="${b.ImagenURL}" target="_blank" title="Ver imagen">${b.ImagenURL.substring(0, 30)}...</a></td>
                <td><a href="${b.URLDestino}" target="_blank">${b.URLDestino || 'N/A'}</a></td>
                <td>${b.Orden}</td>
                <td>${activoText}</td>
                <td class="action-buttons">
                    <button class="btn-edit" onclick="showBannerForm(${b.BannerID})">✏️ Editar</button>
                    <button class="btn-delete" onclick="handleBannerDelete(${b.BannerID}, '${b.Titulo}')">🗑️ Eliminar</button>
                </td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    return html;
}

// 🔑 FUNCIÓN CORREGIDA: Llama a la API y Renderiza la tabla de Banners
async function loadBannersModule() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <h2>🖼️ Gestión de Banners</h2>
        <button id="addBannerBtn" class="btn-activate" style="margin-bottom: 20px;">+ Agregar Nuevo Banner</button>
        <div id="bannersTableContainer">Cargando banners...</div>
    `;
    
    // Conectar el botón al formulario real
    document.getElementById('addBannerBtn').addEventListener('click', () => showBannerForm(null));

    try {
        const token = localStorage.getItem('authToken');
        // Llama a la API protegida para obtener TODOS los banners
        const res = await fetch('http://localhost:3000/api/admin/banners', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401 || res.status === 403) throw new Error('Sesión expirada o permisos insuficientes.');

        const banners = await res.json();
        const tableContainer = document.getElementById('bannersTableContainer');
        
        if (banners.length === 0) {
            tableContainer.innerHTML = '<p>No hay banners registrados. Agrega uno nuevo.</p>';
        } else {
            // Muestra la tabla generada
            tableContainer.innerHTML = buildBannersTable(banners);
        }

    } catch (error) {
        contentArea.innerHTML = `<p style="color: red;">ERROR: No se pudieron cargar los banners. ${error.message}</p>`;
    }
}


async function showBannerForm(bannerId = null) {
    const contentArea = document.getElementById('contentArea');
    const isEditing = bannerId !== null;
    let banner = {};
    let titulo = isEditing ? '✏️ Editar Banner' : '+ Crear Nuevo Banner';
    let submitText = isEditing ? 'Actualizar Banner' : 'Guardar Banner';

    if (isEditing) {
        // Placeholder de datos (REEMPLAZAR CON FETCH REAL):
        banner = { Titulo: 'Promo Test', ImagenURL: 'http://temp.com/img.jpg', URLDestino: '/oferta', Orden: 1, Activo: true };
    }

    contentArea.innerHTML = `
        <h3>${titulo}</h3>
        <form id="bannerForm" class="product-form">
            <input type="hidden" id="bannerId" value="${bannerId || ''}">
            
            <label for="titulo">Título Principal:</label>
            <input type="text" id="titulo" placeholder="Título que aparece en grande" value="${banner.Titulo || ''}" required>
            
            <label for="imagenUrl">URL de la Imagen (o Video):</label>
            <input type="url" id="imagenUrl" placeholder="http://dominio.com/banner.jpg" value="${banner.ImagenURL || ''}" required>
            
            <label for="urlDestino">URL de Destino (Clic):</label>
            <input type="text" id="urlDestino" placeholder="Ej: /productos.html?cat=ruta o http://..." value="${banner.URLDestino || ''}">
            
            <label for="orden">Orden de Visualización:</label>
            <input type="number" id="orden" placeholder="Número (1 será el primero)" value="${banner.Orden || 0}">
            
            <label>
                <input type="checkbox" id="activo" ${banner.Activo !== false ? 'checked' : ''}> 
                Banner Activo (Visible al cliente)
            </label>
            
            <button type="submit" class="btn-primary">${submitText}</button>
            <button type="button" class="btn-secondary" onclick="loadModuleContent('banners')">Cancelar</button>
        </form>
    `;

    document.getElementById('bannerForm').addEventListener('submit', handleBannerSubmit);
}

async function handleBannerSubmit(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('authToken');
    const form = e.target;
    const bannerId = form.bannerId.value;
    const isEditing = !!bannerId;

    const bannerData = {
        titulo: form.titulo.value,
        imagenUrl: form.imagenUrl.value,
        urlDestino: form.urlDestino.value,
        orden: parseInt(form.orden.value),
        activo: form.activo.checked
    };

    const url = isEditing 
        ? `http://localhost:3000/api/admin/banners/${bannerId}`
        : 'http://localhost:3000/api/admin/banners';
    const method = isEditing ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bannerData)
        });

        const data = await res.json();

        if (res.status === 201 || res.status === 200) {
            alert(data.mensaje);
            loadModuleContent('banners'); // Recargar la lista de banners
        } else {
            alert(data.error || 'Error al procesar el banner.');
        }
    } catch (error) {
        alert('Error de conexión con el servidor.');
    }
}

// 🔑 NUEVA FUNCIÓN: Eliminar Banner
async function handleBannerDelete(bannerId, bannerTitle) {
    if (!confirm(`¿Estás seguro de ELIMINAR permanentemente el banner: ${bannerTitle}?`)) {
        return;
    }

    const token = localStorage.getItem('authToken');
    const url = `http://localhost:3000/api/admin/banners/${bannerId}`;

    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (res.status === 200) {
            alert(data.mensaje);
            loadModuleContent('banners'); 
        } else {
            alert(data.error || 'Error al intentar eliminar el banner.');
        }
    } catch (e) {
        alert('Error de conexión al servidor.');
    }
}


// ----------------------------------------------------
// 9. FUNCIÓN CLAVE DE NAVEGACIÓN
// ----------------------------------------------------

function loadModuleContent(moduleName) {
    // Lógica para actualizar la clase 'active' en el menú
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    menuItems.forEach(i => i.classList.remove('active'));
    
    const activeItem = document.querySelector(`.sidebar-menu a[data-module="${moduleName}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }

    const contentArea = document.getElementById('contentArea');
    
    switch (moduleName) {
        case 'productos':
            loadProductosModule();
            break;
        case 'pedidos':
            loadPedidosModule(); 
            break;
        case 'clientes':
            loadClientesModule(); 
            break;
        case 'banners':
            loadBannersModule(); // ⬅️ Ahora carga la tabla real
            break;
        case 'marcas':
            loadMarcasModule(); 
            break;
        case 'categorias':
            loadCategoriasModule(); 
            break;
        case 'dashboard':
        default:
            contentArea.innerHTML = `
                <h2>Dashboard Principal</h2>
                <p>Bienvenido al Panel de Gestión de AlphaBike. Tu rol: <strong>${currentAdmin.role}</strong>.</p>
                <p>Usa el menú lateral para gestionar la tienda AlphaBike. Solo los productos con STOCK > 0 y ACTIVOS se mostrarán al cliente.</p>
            `;
            break;
    }
}


// ----------------------------------------------------
// 10. INICIALIZACIÓN GLOBAL
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAuth()) {
        return; 
    }

    setupLogout();

    const adminNameDisplay = document.getElementById('adminNameDisplay');
    if (adminNameDisplay && currentAdmin.name) {
        adminNameDisplay.textContent = currentAdmin.name;
    }
    
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    
    loadModuleContent('dashboard'); 

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const moduleName = e.currentTarget.getAttribute('data-module');
            if (moduleName) {
                loadModuleContent(moduleName); 
            }
        });
    });
});