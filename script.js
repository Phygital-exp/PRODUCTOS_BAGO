let debounceTimer;
let fuse = null;
let fullData = [];
let filteredData = [];
let currentGrilla = '';

// URL base de la API (proxy en Railway que agrega el token de autenticación)
const API_BASE_URL = 'https://productosbago-production.up.railway.app/api/Bago/productos';

// Cargar datos de la API
async function loadData() {
    try {
        const apiUrl = API_BASE_URL;

        console.log(`Cargando datos desde: ${apiUrl}`);

        // Mostrar indicador de carga
        showLoadingState();

        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();
        fullData = Array.isArray(data) ? data : (data.result || data.data || []);
        currentGrilla = '';
        filteredData = [];

        console.log(`Datos cargados:`, fullData.length, 'registros');

        // Ocultar indicador de carga
        hideLoadingState();

        // Poblar el selector de grillas
        populateGrillaSelect();

        // Limpiar resultados anteriores
        document.getElementById('results').innerHTML = '';

    } catch (error) {
        console.error("Error al cargar los datos:", error);
        hideLoadingState();
        showError(`No se pudieron cargar los datos. Inténtalo más tarde.`);
    }
}

// Poblar el <select> de grillas con los valores únicos de los datos
function populateGrillaSelect() {
    const select = document.getElementById('grillaSelect');
    const grillas = [...new Set(fullData.map(item => item.GRILLA).filter(Boolean))].sort();

    select.innerHTML = '<option value="">Seleccione la grilla</option>' +
        grillas.map(grilla => `<option value="${grilla}">${grilla}</option>`).join('');
}

// Manejar el cambio de grilla seleccionada
function handleGrillaChange() {
    const select = document.getElementById('grillaSelect');
    const searchInput = document.getElementById('searchInput');
    currentGrilla = select.value;

    document.getElementById('results').innerHTML = '';
    searchInput.value = '';

    if (currentGrilla === '') {
        filteredData = [];
        fuse = null;
        searchInput.disabled = true;
        searchInput.placeholder = 'Selecciona primero una grilla';
        return;
    }

    filteredData = fullData.filter(item => item.GRILLA === currentGrilla);
    initializeFuse();

    searchInput.disabled = false;
    searchInput.placeholder = 'Ingresa palabra clave del producto';
}

// Inicializar Fuse.js para búsqueda rápida
function initializeFuse() {
    const options = {
        keys: ['MARCA', 'CATEGORIA', 'SUBCATEGORIA', 'PRODUCTO', 'SKPRODUCTOS'],
        threshold: 0.3,
    };
    fuse = new Fuse(filteredData, options);
}

// Manejo de la entrada de búsqueda con debounce
function handleInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        performFilteredSearch();
    }, 300);
}

// Realizar búsqueda en los datos cargados
function performFilteredSearch() {
    if (!currentGrilla) return;

    const query = document.getElementById('searchInput').value.trim();

    // Si hay texto de búsqueda, aplicar búsqueda con Fuse
    if (query && filteredData.length > 0) {
        const results = fuse.search(query).map(result => result.item);
        renderResults(results);
    } else if (query === '') {
        // Limpiar resultados si no hay búsqueda
        document.getElementById('results').innerHTML = '';
    }
}

// Renderizar los resultados en HTML con animaciones
function renderResults(results) {
    let output = `<h2>Resultados (${results.length} encontrados):</h2>`;

    if (results.length > 0) {
        results.forEach(result => {
            const precio = result['PV PUBLICO CON IVA'];
            output += `
                <div class="result-item">
                    <h3>${result.PRODUCTO || 'N/A'}</h3>
                    <ul>
                        <li><strong>ID:</strong> ${result.ID ?? 'N/A'}
                        <i class="material-icons copy-icon" onclick="copyToClipboard('${result.ID}')">content_copy</i>
                        </li>
                        <li><strong>Marca:</strong> ${result.MARCA || 'N/A'}</li>
                        <li><strong>Categoría:</strong> ${result.CATEGORIA || 'N/A'}</li>
                        <li><strong>Subcategoría:</strong> ${result.SUBCATEGORIA || 'N/A'}</li>
                        <li><strong>SK Productos:</strong> ${result.SKPRODUCTOS || 'N/A'}</li>
                        <li><strong>Grilla:</strong> ${result.GRILLA || 'N/A'}</li>
                        <li><strong>PV Público con IVA:</strong> ${typeof precio === 'number' ? `$ ${precio.toFixed(2)}` : 'N/A'}</li>
                    </ul>
                </div>
            `;
        });
    } else {
        output += '<p>No se encontraron resultados.</p>';
    }

    document.getElementById('results').innerHTML = output;
}

// Copiar al portapapeles
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => alert('ID copiado al portapapeles'))
        .catch(err => console.error('Error:', err));
}

// Mostrar estado de carga
function showLoadingState() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Cargando datos...</p>
        </div>
    `;
}

// Ocultar estado de carga
function hideLoadingState() {
    // El estado se limpia cuando se muestran los resultados o errores
}

// Mostrar error
function showError(message) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <p>${message}</p>
        </div>
    `;
}

// Modo Oscuro
document.getElementById("darkModeToggle").addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");

    // Cambiar el texto del botón según el modo
    const isDarkMode = document.body.classList.contains("dark-mode");
    this.innerHTML = isDarkMode ? "☀️ Modo claro" : "🌙 Modo oscuro";
});

// Cargar datos al inicio
loadData();
