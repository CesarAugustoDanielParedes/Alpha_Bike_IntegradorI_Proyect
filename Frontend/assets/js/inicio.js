// assets/js/inicio.js

// ----------------------------------------------------
// LÓGICA DEL CARRUSEL DE BANNERS (DINÁMICO)
// ----------------------------------------------------
let slideIndex = 0;
let slidesData = []; // Almacenará los banners obtenidos de la API
const container = document.getElementById("carouselContainer");

/**
 * Muestra el slide actual moviendo el contenedor.
 */
function showSlide(index) {
    if (slidesData.length === 0) return;
    
    // 1. Normaliza el índice (wrap-around)
    if (index >= slidesData.length) index = 0;
    if (index < 0) index = slidesData.length - 1;

    slideIndex = index;

    // 2. Mueve el contenedor.
    container.style.transform = `translateX(-${slideIndex * 100}%)`;
}

/**
 * Función para mover el slide al hacer clic en los botones.
 */
function moveSlide(step) {
    showSlide(slideIndex + step);
}


/**
 * Obtiene los banners activos del backend y los renderiza.
 */
async function fetchAndRenderBanners() {
    try {
        // Llama a la API pública (No requiere token)
        const res = await fetch('http://localhost:3000/api/banners');
        
        if (!res.ok) {
            throw new Error(`Error ${res.status}: No se pudo cargar los banners.`);
        }
        
        slidesData = await res.json(); // Almacena los datos activos
        
        if (slidesData.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 50px;">No hay promociones activas actualmente.</p>';
            return;
        }
        
        // 1. Renderiza la estructura
        container.innerHTML = ''; // Limpia el contenido de "Cargando..."
        slidesData.forEach(banner => {
            const item = document.createElement("div");
            item.classList.add("carousel-item");
            
            // Si tiene URL, el texto se convierte en un enlace "Ver Promoción"
            const linkButton = banner.URLDestino ? 
                `<a href="${banner.URLDestino}" class="btn-red" target="_blank">Ver Promoción</a>` : 
                `<p>${banner.Subtitulo || ''}</p>`;

            item.innerHTML = `
                <div class="carousel-text">
                    <h2>${banner.Titulo}</h2>
                    ${linkButton}
                </div>
                <div class="carousel-img">
                    <img src="${banner.ImagenURL}" alt="${banner.Titulo}">
                </div>
            `;
            container.appendChild(item);
        });

        // 2. Inicializa el carrusel
        showSlide(0); 

    } catch (error) {
        console.error('Error cargando banners desde la API:', error);
        container.innerHTML = '<p style="text-align: center; color: red; padding: 50px;">Error al cargar promociones.</p>';
    }
}


// ----------------------------------------------------
// LÓGICA DEL CARRUSEL DE MARCAS (SE MANTIENE, SIN MODIFICAR)
// ----------------------------------------------------
let brandIndex = 0;

function moveBrand(direction) {
    const carousel = document.getElementById("marcasCarousel");
    const items = document.querySelectorAll(".marca-item");
    const totalItems = items.length;
    const visibleItems = 3; 

    brandIndex += direction;

    if (brandIndex < 0) brandIndex = 0;
    if (brandIndex > totalItems - visibleItems) {
        brandIndex = totalItems - visibleItems;
    }

    const moveX = -(brandIndex * (carousel.clientWidth / visibleItems));
    carousel.style.transform = `translateX(${moveX}px)`;
}

// ----------------------------------------------------
// INICIALIZACIÓN GLOBAL
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', fetchAndRenderBanners); // Llama a la función de Banners