document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    document.getElementById('detalle-producto').innerHTML = '<p>Producto no encontrado.</p>';
    return;
  }

  try {
    // 📦 1. Obtener producto individual (con imágenes de referencia)
    const res = await fetch(`http://localhost:3000/api/productos/${id}`);
    const producto = await res.json();

    // Mostrar datos principales
    document.getElementById('nombre-producto').textContent = producto.nombre;
    document.getElementById('descripcion-producto').textContent = producto.descripcion;
    document.getElementById('precio-producto').textContent = producto.precio;

    // Imagen principal
    const imgPrincipal = document.getElementById('imagen-producto');
    imgPrincipal.src = producto.imagen || 'assets/media/default.jpg';

    // Logo marca
    const logo = document.getElementById('logo-marca');
    logo.src = producto.logo_marca || 'assets/media/default_logo.png';

    // 🖼️ 2. Cargar imágenes de referencia dinámicamente
    const contMiniaturas = document.getElementById('miniaturas-referencia');
    contMiniaturas.innerHTML = '';

    // Combinar imagen principal + imágenes de referencia
    const imagenes = [
      producto.imagen,
      ...(producto.imagenes_referencia || [])
    ].filter(Boolean); // elimina valores nulos

    imagenes.forEach((url, index) => {
      const mini = document.createElement('img');
      mini.src = url;
      mini.alt = `Referencia ${index + 1}`;
      mini.classList.add('mini');
      if (index === 0) mini.classList.add('activa');
      mini.addEventListener('click', () => {
        document.querySelectorAll('.mini').forEach(m => m.classList.remove('activa'));
        mini.classList.add('activa');
        imgPrincipal.src = url;
      });
      contMiniaturas.appendChild(mini);
    });

    // 🛒 3. Productos relacionados (misma categoría)
    // 🛒 3. Productos relacionados (misma categoría)
    const resProd = await fetch(`http://localhost:3000/api/productos/${id}`);
    const productoActual = await resProd.json();

    const resRel = await fetch('http://localhost:3000/api/productos');
    const productos = await resRel.json();

    // Filtrar productos de la misma categoría
    const relacionados = productos
      .filter(p => p.id != id && p.categorias === productoActual.categorias)
      .slice(0, 10);

    const contenedor = document.getElementById('lista-relacionados');
    contenedor.innerHTML = '';

    relacionados.forEach(p => {
      const card = document.createElement('div');
      card.classList.add('producto-rel');
      card.innerHTML = `
    <img src="${p.imagen || 'assets/media/default.jpg'}" alt="${p.nombre}">
    <div class="info-rel">
      <p>${p.nombre.toUpperCase()}</p>
      <span>S/ ${p.precio}</span>
    </div>
  `;
      card.addEventListener('click', () => {
        window.location.href = `producto.html?id=${p.id}`;
      });
      contenedor.appendChild(card);
    });

    // 🎠 Carrusel funcional
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    let scrollPos = 0;
    const scrollAmount = 250; // píxeles por clic

    btnNext.addEventListener('click', () => {
      contenedor.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    btnPrev.addEventListener('click', () => {
      contenedor.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    // 🖐 Deslizamiento con el mouse o táctil
    let isDown = false;
    let startX;
    let scrollLeft;

    contenedor.addEventListener('mousedown', e => {
      isDown = true;
      contenedor.classList.add('active');
      startX = e.pageX - contenedor.offsetLeft;
      scrollLeft = contenedor.scrollLeft;
    });

    contenedor.addEventListener('mouseleave', () => {
      isDown = false;
      contenedor.classList.remove('active');
    });

    contenedor.addEventListener('mouseup', () => {
      isDown = false;
      contenedor.classList.remove('active');
    });

    contenedor.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - contenedor.offsetLeft;
      const walk = (x - startX) * 1.5; // velocidad
      contenedor.scrollLeft = scrollLeft - walk;
    });


  } catch (error) {
    console.error('Error al cargar el producto:', error);
  }
});
