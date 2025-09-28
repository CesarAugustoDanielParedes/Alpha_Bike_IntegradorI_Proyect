// --- CARRUSEL PRINCIPAL ---
let slideIndex = 0;
const slides = document.querySelectorAll(".carousel-item");
const container = document.querySelector(".carousel-container");

function showSlide(index) {
  // normaliza el índice (wrap-around)
  if (index >= slides.length) index = 0;
  if (index < 0) index = slides.length - 1;

  // guarda el índice actual
  slideIndex = index;

  // mueve el contenedor usando porcentajes (1 slide = 100%)
  container.style.transform = `translateX(-${slideIndex * 100}%)`;
}

function moveSlide(step) {
  showSlide(slideIndex + step);
}

// inicializa
if (slides.length > 0) {
  showSlide(0);
}

// --- CARRUSEL DE MARCAS ---
let brandIndex = 0;

function moveBrand(direction) {
  const carousel = document.getElementById("marcasCarousel");
  const items = document.querySelectorAll(".marca-item");
  const totalItems = items.length;
  const visibleItems = 3; // mostramos 3 logos a la vez

  // mover 1 item por clic (puedes cambiar a 3 para saltar por "pantallas")
  brandIndex += direction;

  // límites
  if (brandIndex < 0) brandIndex = 0;
  if (brandIndex > totalItems - visibleItems) {
    brandIndex = totalItems - visibleItems;
  }

  // ancho de cada item (con base en el tamaño del carrusel / visibles)
  const moveX = -(brandIndex * (carousel.clientWidth / visibleItems));
  carousel.style.transform = `translateX(${moveX}px)`;
}
