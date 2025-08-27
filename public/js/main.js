// Global variables
let currentUser = null;
let currentPage = 1;
let currentFilters = {};

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

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

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showLoginModal() {
    showModal('loginModal');
}

function showRegisterModal() {
    showModal('registerModal');
}

function showUploadModal() {
    if (!currentUser) {
        showNotification('Please login to upload materials', 'error');
        showLoginModal();
        return;
    }
    showModal('uploadModal');
}

// Authentication functions
async function login(email, password) {
    try {
        // Allow any credentials when configured
        try {
            const cfgRes = await fetch('/auth.json');
            if (cfgRes.ok) {
                const cfg = await cfgRes.json();
                if (cfg && cfg.allowAny) {
                    currentUser = { name: email || 'User', email };
                    updateAuthUI();
                    closeModal('loginModal');
                    showNotification('Login successful!', 'success');
                    return true;
                }
            }
        } catch (_) {}

        // Fallback to API (if available)
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            updateAuthUI();
            closeModal('loginModal');
            showNotification('Login successful!', 'success');
            return true;
        } else {
            showNotification(data.message || 'Login failed', 'error');
            return false;
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
        return false;
    }
}

async function register(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            closeModal('registerModal');
            showNotification('Registration successful! Please login.', 'success');
            return true;
        } else {
            showNotification(data.message || 'Registration failed', 'error');
            return false;
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
        return false;
    }
}

function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    updateAuthUI();
    showNotification('Logged out successfully', 'info');
}

function updateAuthUI() {
    const navAuth = document.querySelector('.nav-auth');
    if (currentUser) {
        navAuth.innerHTML = `
            <span class="user-name">Welcome, ${currentUser.name}</span>
            <button class="btn btn-outline" onclick="logout()">Logout</button>
        `;
    } else {
        navAuth.innerHTML = `
            <button class="btn btn-outline" onclick="showLoginModal()">Login</button>
            <button class="btn btn-primary" onclick="showRegisterModal()">Register</button>
        `;
    }
}

// Material functions
async function loadMaterials(filters = {}) {
    try {
        const queryParams = new URLSearchParams();
        
        if (filters.exam) queryParams.append('exam', filters.exam);
        if (filters.type) queryParams.append('type', filters.type);
        if (filters.subject) queryParams.append('subject', filters.subject);
        if (filters.search) queryParams.append('search', filters.search);
        if (currentPage > 1) queryParams.append('page', currentPage);
        
        const response = await fetch(`${API_BASE_URL}/materials?${queryParams}`);
        const data = await response.json();

        if (response.ok) {
            displayMaterials(data.materials);
            updatePagination(data.pagination);
            updateMaterialsCount(data.pagination.totalItems);
        } else {
            showNotification('Failed to load materials', 'error');
        }
    } catch (error) {
        console.error('Load materials error:', error);
        showNotification('Failed to load materials', 'error');
    }
}

async function searchMaterials(query) {
    if (!query.trim()) {
        loadMaterials(currentFilters);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/materials/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (response.ok) {
            displayMaterials(data.materials);
            updatePagination(data.pagination);
            updateMaterialsCount(data.pagination.totalItems);
        } else {
            showNotification('Search failed', 'error');
        }
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Search failed', 'error');
    }
}

function displayMaterials(materials) {
    const container = document.getElementById('materialsContainer');
    
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
                    <span><i class="fas fa-download"></i> ${material.downloads}</span>
                    <span><i class="fas fa-eye"></i> ${material.views}</span>
                    <span><i class="fas fa-star"></i> ${material.averageRating || 0}</span>
                </div>
                <div class="material-tags">
                    ${material.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
            <div class="material-footer">
                <button class="btn btn-primary" onclick="downloadMaterial('${material._id}')">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="btn btn-outline" onclick="viewMaterial('${material._id}')">
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

async function uploadMaterial(formData) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Please login to upload materials', 'error');
            return false;
        }

        const response = await fetch(`${API_BASE_URL}/materials/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            closeModal('uploadModal');
            showNotification('Material uploaded successfully!', 'success');
            document.getElementById('uploadForm').reset();
            loadMaterials(currentFilters);
            return true;
        } else {
            showNotification(data.message || 'Upload failed', 'error');
            return false;
        }
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Upload failed. Please try again.', 'error');
        return false;
    }
}

async function downloadMaterial(materialId) {
    try {
        const response = await fetch(`${API_BASE_URL}/materials/${materialId}/download`);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = response.headers.get('content-disposition')?.split('filename=')[1] || 'material.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showNotification('Download started!', 'success');
        } else {
            showNotification('Download failed', 'error');
        }
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Download failed', 'error');
    }
}

function viewMaterial(materialId) {
    window.open(`${API_BASE_URL}/materials/${materialId}`, '_blank');
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
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            await login(email, password);
        });
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                name: document.getElementById('registerName').value,
                email: document.getElementById('registerEmail').value,
                password: document.getElementById('registerPassword').value,
                examInterests: Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
                    .map(cb => cb.value)
            };
            await register(formData);
        });
    }

    // Upload form
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData();
            formData.append('title', document.getElementById('uploadTitle').value);
            formData.append('description', document.getElementById('uploadDescription').value);
            formData.append('type', document.getElementById('uploadType').value);
            formData.append('exam', document.getElementById('uploadExam').value);
            formData.append('subject', document.getElementById('uploadSubject').value);
            formData.append('author', document.getElementById('uploadAuthor').value);
            formData.append('tags', document.getElementById('uploadTags').value);
            
            const fileInput = document.getElementById('uploadFile');
            if (fileInput.files[0]) {
                formData.append('file', fileInput.files[0]);
            }
            
            await uploadMaterial(formData);
        });
    }

    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentUser = data.user;
                updateAuthUI();
            } else {
                localStorage.removeItem('token');
            }
        })
        .catch(() => {
            localStorage.removeItem('token');
        });
    }

    // Load materials on page load
    if (window.location.pathname.includes('materials.html')) {
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
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            closeModal(modal.id);
        }
    });
}

// Mobile navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
} 