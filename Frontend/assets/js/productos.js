// Datos de prueba (luego se reemplazan con BD)
const productos = [
  {
    id: 1,
    nombre: "Bicicleta Montañera Pro",
    precio: 3500,
    stock: true,
    tipo: "montanera",
    categoria: "bicicletas",
    marca: "Trek",
    imagen: "assets/media/montañera.png",
    logo: "assets/media/treklogo.jpg"
  },
  {
    id: 2,
    nombre: "Casco Specialized",
    precio: 450,
    stock: true,
    tipo: "accesorio",
    categoria: "cascos",
    marca: "Specialized",
    imagen: "assets/media/casco.png",
    logo: "assets/media/specializedlogo.png"
  }
];

// Renderizar productos
function renderProductos(lista) {
  const grid = document.getElementById("productosGrid");
  grid.innerHTML = "";

  lista.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("producto-card");
    card.innerHTML = `
      <img src="${p.logo}" alt="${p.marca}" class="producto-logo">
      <img src="${p.imagen}" alt="${p.nombre}" class="producto-img">
      <div class="producto-info">
        <span class="stock">${p.stock ? "En stock" : "Sin stock"}</span>
        <span>${p.nombre}</span>
        <strong>S/ ${p.precio}</strong>
      </div>
    `;
    card.onclick = () => alert("Ir a detalle de " + p.nombre);
    grid.appendChild(card);
  });
}

// Inicializar
renderProductos(productos);

// Filtro de rango
const precioRange = document.getElementById("precioRange");
const precioMax = document.getElementById("precioMax");
precioRange.addEventListener("input", () => {
  precioMax.textContent = precioRange.value;
  const filtrados = productos.filter(p => p.precio <= precioRange.value);
  renderProductos(filtrados);
});
