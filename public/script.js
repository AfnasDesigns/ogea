/* ============================================ */
/* OGEA OUTREACH PORTAL - COMPLETE JAVASCRIPT   */
/* Darul Hidaya Dawa College                    */
/* Now uses MongoDB via API calls               */
/* ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initMobileMenu();
    initSmoothScroll();
    initBackToTop();
    initStatsCounter();
    initAchievementForm();
    initPublicationSearch();
    initActiveNavOnScroll();
    initFileUpload();
    loadProgramsFromAdmin();
    loadPublicPosters();

});

/* ==================== NAVIGATION ==================== */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
        }
    });
}

/* ==================== MOBILE MENU ==================== */
function initMobileMenu() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    if (!mobileToggle || !navMenu) return;
    
    mobileToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) icon.className = navMenu.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            const icon = mobileToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
        });
    });
    
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            const icon = mobileToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
        }
    });
}

/* ==================== SMOOTH SCROLL ==================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navbar = document.getElementById('navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 75;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });
}

/* ==================== BACK TO TOP ==================== */
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;
    window.addEventListener('scroll', function() {
        backToTopBtn.classList.toggle('show', window.scrollY > 500);
    });
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ==================== STATS COUNTER ==================== */
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length === 0) return;
    let animated = false;
    
    function animateStats() {
        if (animated) return;
        const statsSection = document.getElementById('stats');
        if (!statsSection) return;
        const sectionTop = statsSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (sectionTop < windowHeight - 100) {
            animated = true;
            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target')) || 0;
                const duration = 1500;
                const startTime = performance.now();
                function updateCounter(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    stat.textContent = Math.floor(target * easeOut);
                    if (progress < 1) requestAnimationFrame(updateCounter);
                    else stat.textContent = target;
                }
                requestAnimationFrame(updateCounter);
            });
        }
    }
    window.addEventListener('scroll', animateStats);
    animateStats();
}

/* ==================== ACHIEVEMENT FORM ==================== */
function initAchievementForm() {
    const form = document.getElementById('achievementForm');
    const successMessage = document.getElementById('submitSuccess');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!validateForm()) return;
        
        // Use FormData to send data + file to the API
        const formData = new FormData(form);
        
        try {
            const response = await fetch('/api/achievements', {
                method: 'POST',
                body: formData  // FormData handles file upload automatically
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit achievement');
            }
            
            const result = await response.json();
            console.log('Achievement saved to MongoDB:', result);
            
            form.style.display = 'none';
            if (successMessage) successMessage.style.display = 'block';
            showAlert('Achievement submitted successfully! It will be reviewed by our team.', 'success');
            if (successMessage) successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (error) {
            console.error('Error submitting achievement:', error);
            showAlert('Failed to submit achievement. Please try again.', 'error');
        }
    });
}

function validateForm() {
    const fullName = document.getElementById('fullName');
    const studentClass = document.getElementById('class');
    const admissionNo = document.getElementById('admissionNo');
    const category = document.getElementById('category');
    const activityTitle = document.getElementById('activityTitle');
    if (!fullName || !studentClass || !admissionNo || !category || !activityTitle) return true;
    
    let isValid = true;
    clearErrors();
    
    if (!fullName.value.trim()) { showFieldError('fullName', 'Full name is required'); isValid = false; }
    if (!studentClass.value.trim()) { showFieldError('class', 'Class is required'); isValid = false; }
    if (!admissionNo.value.trim()) { showFieldError('admissionNo', 'Admission number is required'); isValid = false; }
    if (!category.value) { showFieldError('category', 'Please select a category'); isValid = false; }
    if (!activityTitle.value.trim()) { showFieldError('activityTitle', 'Activity title is required'); isValid = false; }
    
    if (!isValid) showAlert('Please fill in all required fields.', 'error');
    return isValid;
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.style.borderColor = '#ef4444';
    field.style.backgroundColor = '#fef2f2';
    const errorSpan = document.createElement('span');
    errorSpan.className = 'field-error';
    errorSpan.style.cssText = 'color:#ef4444;font-size:12px;margin-top:4px;display:block;';
    errorSpan.textContent = message;
    field.parentNode.appendChild(errorSpan);
}

function clearErrors() {
    document.querySelectorAll('#achievementForm input, #achievementForm select, #achievementForm textarea').forEach(field => {
        field.style.borderColor = '#e2e8f0';
        field.style.backgroundColor = '#f8f9fb';
    });
    document.querySelectorAll('.field-error').forEach(error => error.remove());
}

function resetForm() {
    const form = document.getElementById('achievementForm');
    const successMessage = document.getElementById('submitSuccess');
    if (form) form.reset();
    if (form) form.style.display = 'block';
    if (successMessage) successMessage.style.display = 'none';
    const fileName = document.getElementById('fileName');
    if (fileName) fileName.textContent = 'No file chosen';
    clearErrors();
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ==================== FILE UPLOAD ==================== */
function initFileUpload() {
    const fileInput = document.getElementById('proofFile');
    const fileNameDisplay = document.getElementById('fileName');
    if (!fileInput || !fileNameDisplay) return;
    fileInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            const file = this.files[0];
            fileNameDisplay.textContent = file.name + ' (' + formatFileSize(file.size) + ')';
            fileNameDisplay.style.color = '#1a3a5c';
        } else {
            fileNameDisplay.textContent = 'No file chosen';
            fileNameDisplay.style.color = '#6b7280';
        }
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/* ==================== PUBLICATION SEARCH ==================== */
function initPublicationSearch() {
    const searchInput = document.getElementById('publicationSearch');
    if (!searchInput) return;
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        document.querySelectorAll('.pub-category').forEach(category => {
            let hasMatch = false;
            category.querySelectorAll('li').forEach(item => {
                if (searchTerm === '' || item.textContent.toLowerCase().includes(searchTerm)) {
                    item.style.display = 'block';
                    hasMatch = true;
                } else {
                    item.style.display = 'none';
                }
            });
            category.style.display = (hasMatch || searchTerm === '') ? 'block' : 'none';
        });
    });
}

/* ==================== ACTIVE NAV ==================== */
function initActiveNavOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    if (sections.length === 0 || navLinks.length === 0) return;
    window.addEventListener('scroll', function() {
        let current = '';
        const navbar = document.getElementById('navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 75;
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navbarHeight - 100;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + section.offsetHeight) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) link.classList.add('active');
        });
    });
}

/* ==================== ALERT ==================== */
function showAlert(message, type) {
    type = type || 'info';
    const existing = document.querySelector('.custom-alert');
    if (existing) existing.remove();
    const colors = {
        success: { bg: '#ecfdf5', border: '#059669', text: '#065f46', icon: '✅' },
        error: { bg: '#fef2f2', border: '#dc2626', text: '#991b1b', icon: '❌' },
        info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', icon: 'ℹ️' },
        warning: { bg: '#fffbeb', border: '#d97706', text: '#92400e', icon: '⚠️' }
    };
    const c = colors[type] || colors.info;
    const div = document.createElement('div');
    div.className = 'custom-alert';
    div.style.cssText = 'position:fixed;top:90px;right:20px;max-width:400px;padding:16px 20px;background:' + c.bg + ';border-left:4px solid ' + c.border + ';color:' + c.text + ';border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.15);z-index:9999;display:flex;align-items:flex-start;gap:12px;font-size:14px;';
    div.innerHTML = '<span style="font-size:18px;">' + c.icon + '</span><span style="flex:1;">' + message + '</span><button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;font-size:18px;opacity:0.6;padding:0;">×</button>';
    document.body.appendChild(div);
    setTimeout(function() { if (div.parentElement) div.remove(); }, 5000);
}

/* ==================== LOAD PROGRAMS FROM API ==================== */
async function loadProgramsFromAdmin() {
    const programsGrid = document.getElementById('programsGrid');
    if (!programsGrid) return;
    
    try {
        const response = await fetch('/api/programs');
        const programs = await response.json();
        
        if (programs.length === 0) {
            programsGrid.innerHTML = '<p class="empty-text" style="grid-column:1/-1;text-align:center;padding:40px;color:#94a3b8;">No programs available yet. Check back soon!</p>';
            return;
        }
        
        const sorted = programs.sort((a, b) => {
            const order = { upcoming: 1, ongoing: 2, completed: 3 };
            return (order[a.status] || 4) - (order[b.status] || 4);
        });
        
        programsGrid.innerHTML = sorted.map(program => {
            const statusColors = {
                upcoming: { bg: '#dbeafe', text: '#1e40af' },
                ongoing: { bg: '#fef3c7', text: '#92400e' },
                completed: { bg: '#d1fae5', text: '#065f46' }
            };
            const sc = statusColors[program.status] || statusColors.upcoming;
            const safeTitle = program.title.replace(/'/g, "\\'");
            const safeImage = program.image ? program.image.replace(/'/g, "\\'") : '';
            
            return '<div class="program-card">' +
                '<div class="program-image" style="' + 
                    (program.image ? 
                        'background:url(' + safeImage + ') center/contain no-repeat;background-color:#0c1e33;' : 
                        'background:linear-gradient(135deg,#1a3a5c,#2a5298);'
                    ) + 
                    'height:280px;min-height:280px;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;"' +
                    (program.image ? ' onclick="viewProgramPoster(\'' + safeImage + '\', \'' + safeTitle + '\')" title="Click to view full poster"' : '') +
                '>' +
                (!program.image ? '<span style="font-family:\'Plus Jakarta Sans\',sans-serif;font-size:80px;color:rgba(255,255,255,0.2);font-weight:800;">' + program.title.charAt(0) + '</span>' : '') +
                (program.image ? '<div class="program-image-overlay"><i class="fas fa-search-plus"></i><span>Click to view full poster</span></div>' : '') +
                '</div>' +
                '<div class="program-body">' +
                '<span class="program-status" style="display:inline-block;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600;background:' + sc.bg + ';color:' + sc.text + ';text-transform:capitalize;">' + program.status + '</span>' +
                '<h3 class="program-title">' + program.title + '</h3>' +
                '<p class="program-date"><i class="far fa-calendar"></i> ' + (program.date || 'TBA') + '</p>' +
                '<p class="program-desc">' + (program.description || '') + '</p>' +
                (program.image ? '<button class="btn-view-poster" onclick="event.stopPropagation();viewProgramPoster(\'' + safeImage + '\', \'' + safeTitle + '\')"><i class="fas fa-expand"></i> View Full Poster</button>' : '') +
                '</div></div>';
        }).join('');
    } catch (error) {
        console.error('Error loading programs:', error);
        programsGrid.innerHTML = '<p class="empty-text" style="grid-column:1/-1;text-align:center;padding:40px;color:#94a3b8;">No programs available yet. Check back soon!</p>';
    }
}

/* ==================== VIEW PROGRAM POSTER (Full Screen) ==================== */
function viewProgramPoster(imageSrc, title) {
    // Remove existing viewer
    const existing = document.getElementById('programPosterViewer');
    if (existing) existing.remove();
    
    // Create viewer container
    const viewer = document.createElement('div');
    viewer.id = 'programPosterViewer';
    viewer.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;';
    
    // Top toolbar
    const toolbar = document.createElement('div');
    toolbar.style.cssText = 'position:absolute;top:0;left:0;right:0;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,0.7);z-index:2;flex-wrap:wrap;gap:10px;';
    toolbar.innerHTML = 
        '<span style="color:white;font-size:16px;font-weight:600;font-family:\'Plus Jakarta Sans\',sans-serif;">📋 ' + (title || 'Program Poster') + '</span>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
            '<button onclick="downloadProgramPoster(\'' + imageSrc + '\', \'' + (title || 'poster').replace(/'/g, "\\'") + '\')" style="background:#059669;color:white;border:none;padding:10px 18px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500;display:flex;align-items:center;gap:6px;transition:all 0.2s;" onmouseover="this.style.background=\'#047857\'" onmouseout="this.style.background=\'#059669\'"><i class="fas fa-download"></i> Download</button>' +
            '<button onclick="window.open(\'' + imageSrc + '\', \'_blank\')" style="background:#2a5298;color:white;border:none;padding:10px 18px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500;display:flex;align-items:center;gap:6px;transition:all 0.2s;" onmouseover="this.style.background=\'#1e3a6c\'" onmouseout="this.style.background=\'#2a5298\'"><i class="fas fa-external-link-alt"></i> Open in New Tab</button>' +
            '<button onclick="document.getElementById(\'programPosterViewer\').remove();document.body.style.overflow=\'\';" style="background:#dc2626;color:white;border:none;padding:10px 18px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500;display:flex;align-items:center;gap:6px;transition:all 0.2s;" onmouseover="this.style.background=\'#b91c1c\'" onmouseout="this.style.background=\'#dc2626\'"><i class="fas fa-times"></i> Close</button>' +
        '</div>';
    
    // Image display area
    const imageArea = document.createElement('div');
    imageArea.style.cssText = 'flex:1;display:flex;align-items:center;justify-content:center;padding:70px 20px 20px;width:100%;overflow:auto;';
    
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = title || 'Program Poster';
    img.style.cssText = 'max-width:95%;max-height:85vh;object-fit:contain;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.5);';
    
    imageArea.appendChild(img);
    viewer.appendChild(toolbar);
    viewer.appendChild(imageArea);
    
    // Close on background click
    viewer.addEventListener('click', function(e) {
        if (e.target === viewer || e.target === imageArea) {
            viewer.remove();
            document.body.style.overflow = '';
        }
    });
    
    document.body.appendChild(viewer);
    document.body.style.overflow = 'hidden';
    
    // Close with Escape key
    function closeOnEscape(e) {
        if (e.key === 'Escape') {
            viewer.remove();
            document.body.style.overflow = '';
            document.removeEventListener('keydown', closeOnEscape);
        }
    }
    document.addEventListener('keydown', closeOnEscape);
}

/* ==================== DOWNLOAD PROGRAM POSTER ==================== */
function downloadProgramPoster(imageSrc, title) {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = (title || 'poster').replace(/[^a-z0-9]/gi, '_') + '.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
/* ==================== PUBLIC LIGHTBOX ==================== */
function openPublicLightbox(src) {
    const existing = document.getElementById('publicLightbox');
    if (existing) existing.remove();
    
    const lightbox = document.createElement('div');
    lightbox.id = 'publicLightbox';
    lightbox.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;cursor:pointer;';
    lightbox.innerHTML = '<img src="' + src + '" style="max-width:90%;max-height:90%;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.5);">';
    
    lightbox.addEventListener('click', function() { lightbox.remove(); });
    document.body.appendChild(lightbox);
    
    function closeOnEscape(e) {
        if (e.key === 'Escape') {
            lightbox.remove();
            document.removeEventListener('keydown', closeOnEscape);
        }
    }
    document.addEventListener('keydown', closeOnEscape);
}

/* ==================== KEYBOARD ==================== */
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const navMenu = document.getElementById('navMenu');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            const icon = document.querySelector('#mobileToggle i');
            if (icon) icon.className = 'fas fa-bars';
        }
    }
});
/* ==================== LOAD POSTERS FROM API ==================== */
async function loadPublicPosters() {
    try {
        // Load 200 Mission posters from API
        const res200 = await fetch('/api/posters/mission200');
        const mission200Posters = await res200.json();
        
        // Load 1 Student 1 Mission posters from API
        const res1 = await fetch('/api/posters/mission1');
        const mission1Posters = await res1.json();
        
        // Update 200 Mission posters
        const container200 = document.getElementById('publicMission200Posters');
        if (container200) {
            if (mission200Posters.length === 0) {
                container200.innerHTML = '<div class="winners-empty-box"><p>No posters in "200 Mission" yet.</p></div>';
            } else {
                container200.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;">' +
                    mission200Posters.map(function(poster) {
                        return '<div class="public-poster-card" onclick="openPublicLightbox(\'' + poster.src + '\')" style="border-radius:10px;overflow:hidden;aspect-ratio:3/4;border:2px solid #e2e8f0;cursor:pointer;transition:all 0.3s;" onmouseover="this.style.transform=\'scale(1.05)\';this.style.boxShadow=\'0 4px 15px rgba(0,0,0,0.2)\'" onmouseout="this.style.transform=\'scale(1)\';this.style.boxShadow=\'none\'">' +
                                '<img src="' + poster.src + '" alt="' + (poster.name || 'Poster') + '" style="width:100%;height:100%;object-fit:cover;" loading="lazy">' +
                            '</div>';
                    }).join('') +
                    '</div>';
            }
        }
        
        // Update 1 Student 1 Mission posters
        const container1 = document.getElementById('publicMission1Posters');
        if (container1) {
            if (mission1Posters.length === 0) {
                container1.innerHTML = '<div class="winners-empty-box"><p>No posters in "1 Student 1 Mission" yet.</p></div>';
            } else {
                container1.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;">' +
                    mission1Posters.map(function(poster) {
                        return '<div class="public-poster-card" onclick="openPublicLightbox(\'' + poster.src + '\')" style="border-radius:10px;overflow:hidden;aspect-ratio:3/4;border:2px solid #e2e8f0;cursor:pointer;transition:all 0.3s;" onmouseover="this.style.transform=\'scale(1.05)\';this.style.boxShadow=\'0 4px 15px rgba(0,0,0,0.2)\'" onmouseout="this.style.transform=\'scale(1)\';this.style.boxShadow=\'none\'">' +
                                '<img src="' + poster.src + '" alt="' + (poster.name || 'Poster') + '" style="width:100%;height:100%;object-fit:cover;" loading="lazy">' +
                            '</div>';
                    }).join('') +
                    '</div>';
            }
        }
    } catch (error) {
        console.error('Error loading posters:', error);
    }
}

console.log('🚀 OGEA Outreach Portal Ready! (MongoDB Edition)');