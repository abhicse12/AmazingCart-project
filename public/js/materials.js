// Materials page functionality (no upload, render from server-provided list)
let currentPage = 1;
let currentFilters = {};
let allMaterials = [];
const PAGE_SIZE = 12;

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Modal helpers are retained in main.js if needed

// Material functions
function loadMaterials(filters = {}) {
    const filtered = filterMaterials(allMaterials, filters);
    const byExam = {
        JEE: filtered.filter(m => (m.exam || '').toUpperCase() === 'JEE'),
        NEET: filtered.filter(m => (m.exam || '').toUpperCase() === 'NEET'),
        UPSC: filtered.filter(m => (m.exam || '').toUpperCase() === 'UPSC')
    };

    displayMaterialsInto('materialsContainerJEE', byExam.JEE);
    displayMaterialsInto('materialsContainerNEET', byExam.NEET);
    displayMaterialsInto('materialsContainerUPSC', byExam.UPSC);
    updateMaterialsCount(filtered.length);
}

function searchMaterials(query) {
    currentFilters.search = query;
    currentPage = 1;
    loadMaterials(currentFilters);
}

function filterMaterials(materials, filters) {
    let result = materials.slice();
    if (filters.exam) {
        result = result.filter(m => (m.exam || '').toLowerCase() === String(filters.exam).toLowerCase());
    }
    if (filters.type) {
        result = result.filter(m => (m.type || '').toLowerCase() === String(filters.type).toLowerCase());
    }
    if (filters.search) {
        const q = String(filters.search).toLowerCase();
        result = result.filter(m =>
            (m.title || '').toLowerCase().includes(q) ||
            (m.description || '').toLowerCase().includes(q) ||
            (m.author || '').toLowerCase().includes(q) ||
            (m.subject || '').toLowerCase().includes(q) ||
            (Array.isArray(m.tags) ? m.tags.join(' ').toLowerCase().includes(q) : false)
        );
    }
    return result;
}

function paginate(items, page, pageSize) {
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const current = Math.min(Math.max(1, page), totalPages);
    const start = (current - 1) * pageSize;
    const end = start + pageSize;
    return { items: items.slice(start, end), currentPage: current, totalPages };
}

function displayMaterialsInto(containerId, materials) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!materials || materials.length === 0) {
        container.innerHTML = `
            <div class="no-materials">
                <i class="fas fa-file-pdf"></i>
                <h3>No materials found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    container.innerHTML = materials.map(material => `
        <div class="material-card" data-id="${material._id}">
            <div class="material-header">
                <div class="material-type-badge ${material.type}">
                    ${material.type.toUpperCase()}
                </div>
                <div class="material-exam-badge ${material.exam.toLowerCase()}">
                    ${material.exam}
                </div>
            </div>
            <div class="material-content">
                <h3 class="material-title">${material.title}</h3>
                <p class="material-description">${material.description}</p>
                <div class="material-meta">
                    <span><i class="fas fa-user"></i> ${material.author}</span>
                    <span><i class="fas fa-book"></i> ${material.subject}</span>
                </div>
                <div class="material-stats">
                    <span><i class="fas fa-download"></i> ${material.downloads || 0}</span>
                    <span><i class="fas fa-eye"></i> ${material.views || 0}</span>
                    <span><i class="fas fa-star"></i> ${material.averageRating || 0}</span>
                </div>
                <div class="material-tags">
                    ${material.tags ? material.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
            </div>
            <div class="material-footer">
                <button class="btn btn-primary" onclick="downloadMaterial('${material.pdfUrl}')">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="btn btn-outline" onclick="viewMaterial('${material.pdfUrl}')">
                    <i class="fas fa-eye"></i> View
                </button>
            </div>
        </div>
    `).join('');
}

function updatePagination(pagination) {
    const paginationContainer = document.getElementById('pagination');
    
    if (!pagination || pagination.totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '';
    
    if (pagination.hasPrevPage) {
        paginationHTML += `<button class="page-btn" onclick="changePage(${pagination.currentPage - 1})">Previous</button>`;
    }
    
    const startPage = Math.max(1, pagination.currentPage - 2);
    const endPage = Math.min(pagination.totalPages, pagination.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="page-btn ${i === pagination.currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">${i}</button>
        `;
    }
    
    if (pagination.hasNextPage) {
        paginationHTML += `<button class="page-btn" onclick="changePage(${pagination.currentPage + 1})">Next</button>`;
    }
    
    paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
    currentPage = page;
    loadMaterials(currentFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateMaterialsCount(count) {
    const countElement = document.getElementById('materialsCount');
    if (countElement) {
        countElement.textContent = `${count} materials found`;
    }
}

function downloadMaterial(pdfUrl) {
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function viewMaterial(pdfUrl) {
    window.open(pdfUrl, '_blank');
}

// Event handlers
function handleSearch() {
    const query = document.getElementById('searchInput').value;
    searchMaterials(query);
}

function handleFilter() {
    const exam = document.getElementById('examFilter').value;
    const type = document.getElementById('typeFilter').value;
    
    currentFilters = {};
    if (exam) currentFilters.exam = exam;
    if (type) currentFilters.type = type;
    
    currentPage = 1;
    loadMaterials(currentFilters);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize materials from server-rendered data
    allMaterials = Array.isArray(window.MATERIALS) ? window.MATERIALS : [];

    // Load materials on page load with URL filters
    const urlParams = new URLSearchParams(window.location.search);
    const exam = urlParams.get('exam');
    const type = urlParams.get('type');
    
    if (exam) {
        document.getElementById('examFilter').value = exam;
        currentFilters.exam = exam;
    }
    if (type) {
        document.getElementById('typeFilter').value = type;
        currentFilters.type = type;
    }
    
    loadMaterials(currentFilters);
});
