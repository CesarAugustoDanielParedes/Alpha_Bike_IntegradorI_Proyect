document.addEventListener('DOMContentLoaded', () => {
  const contenedor = document.getElementById('lista-productos');
  const rangoPrecio = document.getElementById('precio');
  const valorPrecio = document.getElementById('precio-valor');
  const categoriaSelect = document.getElementById('categoria');
  const radiosProductos = document.querySelectorAll('input[name="producto"]');
  const radiosMarcas = document.querySelectorAll('input[name="marca"]');

  // === 1. Mostrar valor del slider ===
  if (rangoPrecio && valorPrecio) {
    actualizarTextoPrecio();
    rangoPrecio.addEventListener('input', () => {
      actualizarTextoPrecio();
      aplicarFiltrosDebounced();
    });
  }

  function actualizarTextoPrecio() {
    if (Number(rangoPrecio.value) >= Number(rangoPrecio.max)) {
      valorPrecio.textContent = 'Todos los precios';
    } else {
      valorPrecio.textContent = `Hasta S/ ${rangoPrecio.value}`;
    }
  }

  // === 2. Hacer los radios deseleccionables ===
  function hacerRadiosToggleables(radios) {
    radios.forEach(radio => {
      radio.addEventListener('click', function () {
        if (this.previousChecked) {
          this.checked = false;
        }
        this.previousChecked = this.checked;
        aplicarFiltrosDebounced();
      });
    });
  }

  hacerRadiosToggleables(radiosProductos);
  hacerRadiosToggleables(radiosMarcas);

  // === 3. Detectar cambios en el select de categoría ===
  if (categoriaSelect) categoriaSelect.addEventListener('change', aplicarFiltrosDebounced);

  // === 4. Control de debounce (para evitar muchas peticiones seguidas) ===
  let debounceTimer = null;
  function aplicarFiltrosDebounced() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => aplicarFiltros(), 150);
  }

  // === 5. Función principal de filtrado ===
  async function aplicarFiltros() {
    const categoria = categoriaSelect?.value || '';
    const productoSeleccionado = document.querySelector('input[name="producto"]:checked');
    const marcaSeleccionada = document.querySelector('input[name="marca"]:checked');
    const precioMax = rangoPrecio ? rangoPrecio.value : '';

    const body = {
      categoria: categoria || '',
      producto: productoSeleccionado ? productoSeleccionado.value : '',
      marca: marcaSeleccionada ? marcaSeleccionada.value : '',
      precioMax
    };

    try {
      const res = await fetch('http://localhost:3000/api/productos/filtrarAvanzado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('Error al filtrar productos');
      const data = await res.json();
      renderProductos(data);
    } catch (err) {
      console.error('Error al aplicar filtros:', err);
      contenedor.innerHTML = '<p>Error cargando productos.</p>';
    }
  }

  // === 6. Renderizar los productos ===
  function renderProductos(lista) {
    contenedor.innerHTML = '';
    if (!lista || lista.length === 0) {
      contenedor.innerHTML = '<p>No se encontraron productos.</p>';
      return;
    }

    lista.forEach(p => {
      const item = document.createElement('div');
      item.className = 'producto';
      const imagenSrc = p.imagen || 'assets/media/default.jpg';
      const logoMarca = p.logo_marca || 'assets/media/logo-placeholder.png';

      item.innerHTML = `
        <img class="logo-marca" src="${logoMarca}" alt="${p.marca || 'Marca'}">
        <img src="${imagenSrc}" alt="${p.nombre}">
        <h3>${p.nombre}</h3>
        <p>${p.descripcion || ''}</p>
        <span class="etiqueta-stock">En Stock</span>
        <span class="precio">S/ ${p.precio}</span>
        <a href="producto.html?id=${p.id}"></a>
      `;

      item.addEventListener('click', () => window.location.href = `producto.html?id=${p.id}`);
      contenedor.appendChild(item);
    });
  }

  // === 7. Cargar todos los productos inicialmente ===
  aplicarFiltros();
});
