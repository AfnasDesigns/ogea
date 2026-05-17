/* ============================================ */
/* OGEA OUTREACH PORTAL - ADMIN JAVASCRIPT      */
/* Darul Hidaya Dawa College                    */
/* ============================================ */

let currentAchievementId = null;
let achievements = [];
let programs = [];
let publications = [];
let users = [];
let currentProgramImage = null;

function initAdmin() {
    console.log('🚀 Admin Panel Initialized');
    loadData();
    initSidebarNavigation();
    initMobileSidebar();
    initNotifications();
    initGlobalSearch();
    initAchievementFilters();
    initLogout();
    initPosterUploads();
    initProgramImageUpload();
    navigateTo('dashboard');
    updatePendingCount();
}

/* ==================== DATA MANAGEMENT ==================== */
function loadData() {
    const storedA = localStorage.getItem('ogea_achievements');
    if (storedA) achievements = JSON.parse(storedA);
    
    const storedP = localStorage.getItem('ogea_programs');
    if (storedP) programs = JSON.parse(storedP);
    else {
        programs = [
            { id: 1, title: 'USWATHUNABI', description: 'A blessed program celebrating the life of Prophet Muhammad ﷺ', status: 'upcoming', date: 'TBA', image: '' },
            { id: 2, title: 'QUIZ COMPETITION', description: 'Test your knowledge in this exciting quiz challenge', status: 'upcoming', date: 'TBA', image: '' },
            { id: 3, title: 'QURAN TALENT SHOW', description: 'Showcase your Quranic recitation talents', status: 'upcoming', date: 'TBA', image: '' },
            { id: 4, title: 'VIDEO MAKING CONTEST', description: 'Create impactful videos on Islamic themes', status: 'upcoming', date: 'TBA', image: '' },
            { id: 5, title: 'KAVALI', description: 'Traditional poetic expression competition', status: 'upcoming', date: 'TBA', image: '' },
            { id: 6, title: 'KAVITHA RAJANA', description: 'Poetry recitation and creative writing', status: 'upcoming', date: 'TBA', image: '' },
            { id: 7, title: 'KATHA MALSARAM 2026', description: 'Storytelling competition', status: 'upcoming', date: 'TBA', image: '' },
            { id: 8, title: 'INDIA HOLY QURAN AWARD 2026', description: 'National level Quran competition', status: 'upcoming', date: 'TBA', image: '' }
        ];
        localStorage.setItem('ogea_programs', JSON.stringify(programs));
    }
    
    const storedPub = localStorage.getItem('ogea_publications');
    if (storedPub) publications = JSON.parse(storedPub);
    
    const storedU = localStorage.getItem('ogea_users');
    if (storedU) users = JSON.parse(storedU);
    else {
        users = [{ id: 1, name: 'Admin User', admission: 'ADMIN001', class: 'N/A', email: 'admin@ogea.edu', role: 'admin', password: 'admin123', credits: 0, badge: 'none' }];
        localStorage.setItem('ogea_users', JSON.stringify(users));
    }
}

function saveAchievements() { localStorage.setItem('ogea_achievements', JSON.stringify(achievements)); updatePendingCount(); }
function savePrograms() { localStorage.setItem('ogea_programs', JSON.stringify(programs)); }
function savePublications() { localStorage.setItem('ogea_publications', JSON.stringify(publications)); }
function saveUsers() { localStorage.setItem('ogea_users', JSON.stringify(users)); }

/* ==================== NAVIGATION ==================== */
function navigateTo(page) {
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    const link = document.querySelector(`[data-page="${page}"]`);
    if (link) link.classList.add('active');
    document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(page + '-page');
    if (target) target.classList.add('active');
    const titles = { dashboard: 'Dashboard', achievements: 'Achievements', programs: 'Programs', posters: 'Winners Posters', publications: 'Publications', users: 'Users', 'points-config': 'Points Config', reports: 'Reports' };
    document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
    switch(page) {
        case 'dashboard': loadDashboard(); break;
        case 'achievements': loadAchievementsTable(); break;
        case 'programs': loadProgramsList(); break;
        case 'posters': loadPosters(); break;
        case 'publications': loadPublicationsTable(); break;
        case 'users': loadUsersTable(); break;
        case 'points-config': loadPointsConfig(); break;
        case 'reports': loadReports(); break;
    }
    const sidebar = document.getElementById('adminSidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');
}

function initSidebarNavigation() {
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page) navigateTo(page);
        });
    });
}

function initMobileSidebar() {
    const toggleBtn = document.getElementById('sidebarToggle');
    const closeBtn = document.getElementById('sidebarClose');
    const sidebar = document.getElementById('adminSidebar');
    if (toggleBtn) toggleBtn.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));
    if (closeBtn) closeBtn.addEventListener('click', () => sidebar.classList.remove('mobile-open'));
}

/* ==================== DASHBOARD ==================== */
function loadDashboard() {
    document.getElementById('totalAchievements').textContent = achievements.length;
    document.getElementById('pendingAchievements').textContent = achievements.filter(a => a.status === 'pending').length;
    document.getElementById('approvedAchievements').textContent = achievements.filter(a => a.status === 'approved').length;
    document.getElementById('rejectedAchievements').textContent = achievements.filter(a => a.status === 'rejected').length;
    const recent = achievements.slice(-5).reverse();
    const container = document.getElementById('recentSubmissions');
    if (recent.length === 0) {
        container.innerHTML = '<p class="empty-text">No recent submissions</p>';
    } else {
        container.innerHTML = recent.map(a => `
            <div style="padding:10px;border-bottom:1px solid #f1f5f9;cursor:pointer;" onclick="navigateTo('achievements');setTimeout(()=>viewAchievement(${achievements.indexOf(a)}),300);">
                <strong>${a.fullName}</strong> - ${a.activityTitle}<br>
                <small>${formatDate(a.submittedAt)} · <span class="status-badge status-${a.status}">${a.status}</span></small>
            </div>
        `).join('');
    }
}

/* ==================== ACHIEVEMENTS ==================== */
function loadAchievementsTable(filter = 'all', search = '') {
    let filtered = [...achievements];
    if (filter !== 'all') filtered = filtered.filter(a => a.status === filter);
    if (search) { const t = search.toLowerCase(); filtered = filtered.filter(a => a.fullName.toLowerCase().includes(t) || a.activityTitle.toLowerCase().includes(t)); }
    const tbody = document.getElementById('achievementsTableBody');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" class="empty-table">No achievements found</td></tr>';
        return;
    }
    tbody.innerHTML = filtered.map((a, i) => `
        <tr>
            <td>${achievements.indexOf(a) + 1}</td>
            <td><strong>${a.fullName}</strong></td>
            <td>${a.class || ''}</td>
            <td>${a.admissionNo}</td>
            <td>${formatCat(a.category)}</td>
            <td>${a.activityTitle}</td>
            <td>${a.level || ''}</td>
            <td>${a.result || ''}</td>
            <td><span class="status-badge status-${a.status || 'pending'}">${a.status || 'pending'}</span></td>
            <td><strong>${a.pointsAwarded || 0}</strong></td>
            <td>${formatDate(a.submittedAt)}</td>
            <td><div class="action-btns">
                <button class="btn-sm btn-view" onclick="viewAchievement(${achievements.indexOf(a)})"><i class="fas fa-eye"></i></button>
                ${a.status === 'pending' ? `<button class="btn-sm btn-edit" onclick="quickApprove(${achievements.indexOf(a)})"><i class="fas fa-check"></i></button>` : ''}
                <button class="btn-sm btn-delete" onclick="deleteAchievement(${achievements.indexOf(a)})"><i class="fas fa-trash"></i></button>
            </div></td>
        </tr>
    `).join('');
}

function initAchievementFilters() {
    const filter = document.getElementById('achievementFilter');
    const search = document.getElementById('achievementSearch');
    if (filter) filter.addEventListener('change', function() { loadAchievementsTable(this.value, search ? search.value : ''); });
    if (search) search.addEventListener('input', function() { loadAchievementsTable(filter ? filter.value : 'all', this.value); });
}

function viewAchievement(index) {
    const a = achievements[index];
    if (!a) return;
    currentAchievementId = index;
    document.getElementById('achievementDetail').innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div><label style="font-weight:600;font-size:12px;color:#64748b;">Student Name</label><p style="margin:4px 0;">${a.fullName}</p></div>
            <div><label style="font-weight:600;font-size:12px;color:#64748b;">Class</label><p style="margin:4px 0;">${a.class || 'N/A'}</p></div>
            <div><label style="font-weight:600;font-size:12px;color:#64748b;">Admission No.</label><p style="margin:4px 0;">${a.admissionNo}</p></div>
            <div><label style="font-weight:600;font-size:12px;color:#64748b;">Contact</label><p style="margin:4px 0;">${a.contact || 'N/A'}</p></div>
            <div><label style="font-weight:600;font-size:12px;color:#64748b;">Category</label><p style="margin:4px 0;">${formatCat(a.category)}</p></div>
            <div><label style="font-weight:600;font-size:12px;color:#64748b;">Activity Title</label><p style="margin:4px 0;">${a.activityTitle}</p></div>
            <div><label style="font-weight:600;font-size:12px;color:#64748b;">Level</label><p style="margin:4px 0;">${a.level || 'N/A'}</p></div>
            <div><label style="font-weight:600;font-size:12px;color:#64748b;">Result</label><p style="margin:4px 0;">${a.result || 'N/A'}</p></div>
            <div><label style="font-weight:600;font-size:12px;color:#64748b;">Platform</label><p style="margin:4px 0;">${a.platform || 'N/A'}</p></div>
            <div><label style="font-weight:600;font-size:12px;color:#64748b;">Language</label><p style="margin:4px 0;">${a.language || 'N/A'}</p></div>
            <div><label style="font-weight:600;font-size:12px;color:#64748b;">Reference</label><p style="margin:4px 0;">${a.referenceLink ? `<a href="${a.referenceLink}" target="_blank" style="color:#3b82f6;">Link</a>` : 'N/A'}</p></div>
            <div><label style="font-weight:600;font-size:12px;color:#64748b;">Status</label><p style="margin:4px 0;"><span class="status-badge status-${a.status || 'pending'}">${a.status || 'pending'}</span></p></div>
            <div><label style="font-weight:600;font-size:12px;color:#64748b;">Current Points</label><p style="margin:4px 0;font-size:18px;font-weight:700;">${a.pointsAwarded || 0}</p></div>
            ${a.notes ? `<div style="grid-column:1/-1;"><label style="font-weight:600;font-size:12px;color:#64748b;">Notes</label><p style="margin:4px 0;">${a.notes}</p></div>` : ''}
        </div>
    `;
    document.getElementById('awardPoints').value = a.pointsAwarded || '';
    const footer = document.querySelector('#achievementModal .modal-footer');
    if (footer) footer.style.display = a.status === 'pending' ? 'flex' : 'none';
    openModal('achievementModal');
}

function quickApprove(index) {
    currentAchievementId = index;
    document.getElementById('awardPoints').value = '';
    viewAchievement(index);
}

function updateAchievementStatus(status) {
    if (currentAchievementId === null) return;
    const a = achievements[currentAchievementId];
    // MANUAL POINTS - Admin enters points manually
    const points = parseInt(document.getElementById('awardPoints').value) || 0;
    a.status = status;
    a.pointsAwarded = status === 'approved' ? points : 0;
    a.reviewedAt = new Date().toISOString();
    saveAchievements();
    closeModal('achievementModal');
    loadAchievementsTable();
    loadDashboard();
    showAlert(`Achievement ${status}! Points awarded: ${a.pointsAwarded}`, status === 'approved' ? 'success' : 'warning');
}

function deleteAchievement(index) {
    if (confirm('Are you sure you want to delete this achievement?')) {
        achievements.splice(index, 1);
        saveAchievements();
        loadAchievementsTable();
        loadDashboard();
        showAlert('Achievement deleted!', 'success');
    }
}

/* ==================== PROGRAMS (With Image Upload) ==================== */
function initProgramImageUpload() {
    const imageInput = document.getElementById('programImage');
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    currentProgramImage = e.target.result;
                    const preview = document.getElementById('programImagePreview');
                    const previewImg = document.getElementById('programImagePreviewImg');
                    const nameDisplay = document.getElementById('programImageName');
                    if (preview) preview.style.display = 'block';
                    if (previewImg) previewImg.src = e.target.result;
                    if (nameDisplay) nameDisplay.textContent = file.name;
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

function loadProgramsList() {
    const list = document.getElementById('programsList');
    if (programs.length === 0) {
        list.innerHTML = '<p class="empty-text">No programs added yet</p>';
        return;
    }
    list.innerHTML = programs.map((p, i) => `
        <div class="program-card" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);border:1px solid #e2e8f0;">
            <div class="program-image" style="height:160px;background:${p.image ? `url(${p.image}) center/cover` : 'linear-gradient(135deg,#1a3a5c,#2a5298)'};display:flex;align-items:center;justify-content:center;">
                ${!p.image ? `<span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:60px;color:rgba(255,255,255,0.2);font-weight:800;">${p.title.charAt(0)}</span>` : ''}
            </div>
            <div class="program-body" style="padding:20px;">
                <span class="program-status status-${p.status}" style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:#dbeafe;color:#1e40af;">${p.status}</span>
                <h3 style="margin:8px 0;font-size:16px;font-weight:700;">${p.title}</h3>
                <p style="font-size:13px;color:#64748b;"><i class="far fa-calendar"></i> ${p.date || 'TBA'}</p>
                <p style="font-size:13px;color:#475569;">${p.description || ''}</p>
                <div class="action-btns" style="margin-top:12px;">
                    <button class="btn-sm btn-edit" onclick="editProgram(${i})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-sm btn-delete" onclick="deleteProgram(${i})"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function openProgramForm(index = null) {
    const form = document.getElementById('programForm');
    if (form) form.reset();
    currentProgramImage = null;
    document.getElementById('programImagePreview').style.display = 'none';
    document.getElementById('programImageName').textContent = 'No image chosen';
    
    if (index !== null && index < programs.length) {
        const p = programs[index];
        document.getElementById('programModalTitle').textContent = 'Edit Program';
        document.getElementById('programId').value = index;
        document.getElementById('programTitle').value = p.title;
        document.getElementById('programDescription').value = p.description || '';
        document.getElementById('programStatus').value = p.status;
        document.getElementById('programDate').value = p.date !== 'TBA' ? p.date : '';
        if (p.image) {
            currentProgramImage = p.image;
            document.getElementById('programImagePreview').style.display = 'block';
            document.getElementById('programImagePreviewImg').src = p.image;
            document.getElementById('programImageName').textContent = 'Current image';
        }
    } else {
        document.getElementById('programModalTitle').textContent = 'Add Program';
        document.getElementById('programId').value = '';
    }
    openModal('programModal');
}

function editProgram(index) { openProgramForm(index); }

function saveProgram() {
    const id = document.getElementById('programId').value;
    const data = {
        id: id !== '' ? programs[parseInt(id)].id : Date.now(),
        title: document.getElementById('programTitle').value,
        description: document.getElementById('programDescription').value,
        status: document.getElementById('programStatus').value,
        date: document.getElementById('programDate').value || 'TBA',
        image: currentProgramImage || (id !== '' ? programs[parseInt(id)].image : '')
    };
    if (!data.title) { showAlert('Please enter a program title', 'error'); return; }
    if (id !== '') {
        programs[parseInt(id)] = { ...programs[parseInt(id)], ...data };
    } else {
        programs.push(data);
    }
    savePrograms();
    closeModal('programModal');
    loadProgramsList();
    showAlert('Program saved successfully!', 'success');
}

function deleteProgram(index) {
    if (confirm('Are you sure you want to delete this program?')) {
        programs.splice(index, 1);
        savePrograms();
        loadProgramsList();
        showAlert('Program deleted!', 'success');
    }
}

/* ==================== POSTERS UPLOAD ==================== */
/* ==================== POSTERS MANAGEMENT (200+ Support) ==================== */
const POSTERS_PER_PAGE = 50; // Show 50 posters at a time, load more for 200+
let posterPages = { mission200: 0, mission1: 0 };
let selectedPosters = { mission200: [], mission1: [] };

function initPosterUploads() {
    setupBulkPosterUpload('mission200File', 'mission200Posters', 'mission200');
    setupBulkPosterUpload('mission1File', 'mission1Posters', 'mission1');
    initPosterSearch();
}

function setupBulkPosterUpload(inputId, containerId, storageKey) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    input.addEventListener('change', function() {
        const files = this.files;
        if (!files.length) return;
        
        const progressDiv = document.getElementById(`${storageKey}Progress`);
        const progressFill = document.getElementById(`${storageKey}ProgressFill`);
        const progressText = document.getElementById(`${storageKey}ProgressText`);
        
        if (progressDiv) progressDiv.style.display = 'block';
        
        let posters = JSON.parse(localStorage.getItem(`ogea_posters_${storageKey}`) || '[]');
        let loaded = 0;
        const total = files.length;
        
        // Process files in chunks to handle 200+ files
        function processChunk(startIndex, chunkSize) {
            const endIndex = Math.min(startIndex + chunkSize, total);
            let chunkLoaded = 0;
            
            for (let i = startIndex; i < endIndex; i++) {
                const file = files[i];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    posters.push({
                        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        src: e.target.result,
                        name: file.name,
                        uploadedAt: new Date().toISOString()
                    });
                    
                    loaded++;
                    chunkLoaded++;
                    
                    // Update progress
                    const progress = Math.round((loaded / total) * 100);
                    if (progressFill) progressFill.style.width = progress + '%';
                    if (progressText) progressText.textContent = `Uploading... ${loaded}/${total} (${progress}%)`;
                    
                    // When chunk is done, process next chunk
                    if (chunkLoaded === (endIndex - startIndex) && loaded < total) {
                        setTimeout(() => processChunk(loaded, 10), 50);
                    }
                    
                    // When all done
                    if (loaded === total) {
                        localStorage.setItem(`ogea_posters_${storageKey}`, JSON.stringify(posters));
                        posterPages[storageKey] = 0;
                        displayPostersPaginated(containerId, storageKey);
                        updatePosterCount(storageKey);
                        
                        if (progressDiv) {
                            setTimeout(() => {
                                progressDiv.style.display = 'none';
                                if (progressFill) progressFill.style.width = '0%';
                            }, 1000);
                        }
                        
                        showAlert(`✅ ${total} posters uploaded successfully! Total: ${posters.length}`, 'success');
                    }
                };
                
                reader.onerror = function() {
                    loaded++;
                    chunkLoaded++;
                };
                
                reader.readAsDataURL(file);
            }
        }
        
        // Start processing in chunks of 10 to handle 200+ files
        processChunk(0, 10);
        
        // Reset input
        this.value = '';
    });
}

function displayPostersPaginated(containerId, storageKey) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const posters = JSON.parse(localStorage.getItem(`ogea_posters_${storageKey}`) || '[]');
    const page = posterPages[storageKey] || 0;
    const start = 0;
    const end = (page + 1) * POSTERS_PER_PAGE;
    const visiblePosters = posters.slice(start, end);
    
    if (posters.length === 0) {
        container.innerHTML = '<p class="empty-text" style="grid-column:1/-1;">No posters uploaded yet. Upload 200+ posters!</p>';
        document.getElementById(`${storageKey}LoadMore`).style.display = 'none';
        document.getElementById(`${storageKey}BulkActions`).style.display = 'none';
        return;
    }
    
    container.innerHTML = visiblePosters.map((p, i) => `
        <div class="poster-item ${selectedPosters[storageKey].includes(p.id) ? 'selected' : ''}" 
             onclick="togglePosterSelection('${storageKey}', '${p.id}', event)" 
             ondblclick="openPosterLightbox('${storageKey}', ${i})">
            <div class="poster-checkbox" onclick="event.stopPropagation(); togglePosterSelection('${storageKey}', '${p.id}', event)">
                ${selectedPosters[storageKey].includes(p.id) ? '✓' : ''}
            </div>
            <img src="${p.src}" alt="${p.name}" loading="lazy">
            <button class="delete-poster" onclick="event.stopPropagation(); deleteSinglePoster('${storageKey}', '${p.id}')" title="Delete">×</button>
        </div>
    `).join('');
    
    // Show/hide load more
    const loadMoreDiv = document.getElementById(`${storageKey}LoadMore`);
    const bulkActionsDiv = document.getElementById(`${storageKey}BulkActions`);
    
    if (posters.length > end) {
        if (loadMoreDiv) {
            loadMoreDiv.style.display = 'block';
            document.getElementById(`${storageKey}Showing`).textContent = end;
            document.getElementById(`${storageKey}Total`).textContent = posters.length;
        }
    } else {
        if (loadMoreDiv) loadMoreDiv.style.display = 'none';
    }
    
    // Show bulk actions if posters exist
    if (bulkActionsDiv) {
        bulkActionsDiv.style.display = posters.length > 0 ? 'flex' : 'none';
    }
    
    updatePosterCount(storageKey);
}

function loadMorePosters(storageKey) {
    posterPages[storageKey] = (posterPages[storageKey] || 0) + 1;
    const containerId = storageKey === 'mission200' ? 'mission200Posters' : 'mission1Posters';
    displayPostersPaginated(containerId, storageKey);
}

function togglePosterSelection(storageKey, posterId, event) {
    if (!selectedPosters[storageKey]) selectedPosters[storageKey] = [];
    
    const index = selectedPosters[storageKey].indexOf(posterId);
    if (index > -1) {
        selectedPosters[storageKey].splice(index, 1);
    } else {
        selectedPosters[storageKey].push(posterId);
    }
    
    // Refresh display
    const containerId = storageKey === 'mission200' ? 'mission200Posters' : 'mission1Posters';
    displayPostersPaginated(containerId, storageKey);
    
    // Update select all button text
    updateBulkActionButtons(storageKey);
}

function selectAllPosters(storageKey) {
    const posters = JSON.parse(localStorage.getItem(`ogea_posters_${storageKey}`) || '[]');
    if (selectedPosters[storageKey].length === posters.length) {
        // Deselect all
        selectedPosters[storageKey] = [];
    } else {
        // Select all
        selectedPosters[storageKey] = posters.map(p => p.id);
    }
    const containerId = storageKey === 'mission200' ? 'mission200Posters' : 'mission1Posters';
    displayPostersPaginated(containerId, storageKey);
    updateBulkActionButtons(storageKey);
}

function bulkDeletePosters(storageKey) {
    if (!selectedPosters[storageKey] || selectedPosters[storageKey].length === 0) {
        showAlert('No posters selected', 'warning');
        return;
    }
    
    const count = selectedPosters[storageKey].length;
    if (confirm(`Delete ${count} selected poster(s)? This cannot be undone.`)) {
        let posters = JSON.parse(localStorage.getItem(`ogea_posters_${storageKey}`) || '[]');
        posters = posters.filter(p => !selectedPosters[storageKey].includes(p.id));
        localStorage.setItem(`ogea_posters_${storageKey}`, JSON.stringify(posters));
        selectedPosters[storageKey] = [];
        posterPages[storageKey] = 0;
        
        const containerId = storageKey === 'mission200' ? 'mission200Posters' : 'mission1Posters';
        displayPostersPaginated(containerId, storageKey);
        showAlert(`${count} posters deleted! Remaining: ${posters.length}`, 'warning');
    }
}

function deleteSinglePoster(storageKey, posterId) {
    if (confirm('Delete this poster?')) {
        let posters = JSON.parse(localStorage.getItem(`ogea_posters_${storageKey}`) || '[]');
        posters = posters.filter(p => p.id !== posterId);
        localStorage.setItem(`ogea_posters_${storageKey}`, JSON.stringify(posters));
        
        // Remove from selection
        if (selectedPosters[storageKey]) {
            selectedPosters[storageKey] = selectedPosters[storageKey].filter(id => id !== posterId);
        }
        
        const containerId = storageKey === 'mission200' ? 'mission200Posters' : 'mission1Posters';
        displayPostersPaginated(containerId, storageKey);
        showAlert('Poster deleted', 'warning');
    }
}

function updateBulkActionButtons(storageKey) {
    const btn = document.querySelector(`#${storageKey}BulkActions .btn-secondary`);
    const posters = JSON.parse(localStorage.getItem(`ogea_posters_${storageKey}`) || '[]');
    if (btn) {
        if (selectedPosters[storageKey].length === posters.length && posters.length > 0) {
            btn.innerHTML = '<i class="fas fa-square"></i> Deselect All';
        } else {
            btn.innerHTML = '<i class="fas fa-check-square"></i> Select All';
        }
    }
}

function updatePosterCount(storageKey) {
    const posters = JSON.parse(localStorage.getItem(`ogea_posters_${storageKey}`) || '[]');
    const countBadge = document.getElementById(`${storageKey}Count`);
    if (countBadge) {
        countBadge.textContent = `${posters.length} Posters`;
    }
}

function sortPosters(storageKey, order) {
    let posters = JSON.parse(localStorage.getItem(`ogea_posters_${storageKey}`) || '[]');
    
    if (order === 'newest') {
        posters.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    } else {
        posters.sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));
    }
    
    localStorage.setItem(`ogea_posters_${storageKey}`, JSON.stringify(posters));
    posterPages[storageKey] = 0;
    const containerId = storageKey === 'mission200' ? 'mission200Posters' : 'mission1Posters';
    displayPostersPaginated(containerId, storageKey);
}

function initPosterSearch() {
    ['mission200', 'mission1'].forEach(key => {
        const searchInput = document.getElementById(`${key}Search`);
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const term = this.value.toLowerCase();
                const containerId = key === 'mission200' ? 'mission200Posters' : 'mission1Posters';
                const container = document.getElementById(containerId);
                const items = container.querySelectorAll('.poster-item');
                
                items.forEach(item => {
                    const img = item.querySelector('img');
                    const name = img ? img.alt.toLowerCase() : '';
                    item.style.display = (term === '' || name.includes(term)) ? 'block' : 'none';
                });
            });
        }
    });
}

function openPosterLightbox(storageKey, index) {
    const posters = JSON.parse(localStorage.getItem(`ogea_posters_${storageKey}`) || '[]');
    if (posters.length === 0) return;
    
    // Create lightbox
    let lightbox = document.getElementById('posterLightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'posterLightbox';
        lightbox.className = 'poster-lightbox';
        lightbox.innerHTML = `
            <button class="lightbox-close" onclick="closePosterLightbox()">×</button>
            <button class="lightbox-nav lightbox-prev" onclick="navigateLightbox(-1)">❮</button>
            <img src="" alt="Poster" id="lightboxImg">
            <button class="lightbox-nav lightbox-next" onclick="navigateLightbox(1)">❯</button>
        `;
        document.body.appendChild(lightbox);
    }
    
    lightbox.currentStorageKey = storageKey;
    lightbox.currentIndex = index;
    
    const img = document.getElementById('lightboxImg');
    img.src = posters[index].src;
    img.alt = posters[index].name;
    
    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closePosterLightbox() {
    const lightbox = document.getElementById('posterLightbox');
    if (lightbox) {
        lightbox.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function navigateLightbox(direction) {
    const lightbox = document.getElementById('posterLightbox');
    if (!lightbox) return;
    
    const storageKey = lightbox.currentStorageKey;
    const posters = JSON.parse(localStorage.getItem(`ogea_posters_${storageKey}`) || '[]');
    
    lightbox.currentIndex = (lightbox.currentIndex + direction + posters.length) % posters.length;
    
    const img = document.getElementById('lightboxImg');
    img.src = posters[lightbox.currentIndex].src;
    img.alt = posters[lightbox.currentIndex].name;
}

// Close lightbox with Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePosterLightbox();
    }
    if (e.key === 'ArrowLeft') {
        const lightbox = document.getElementById('posterLightbox');
        if (lightbox && lightbox.classList.contains('show')) navigateLightbox(-1);
    }
    if (e.key === 'ArrowRight') {
        const lightbox = document.getElementById('posterLightbox');
        if (lightbox && lightbox.classList.contains('show')) navigateLightbox(1);
    }
});

// Update loadPosters function
function loadPosters() {
    ['mission200', 'mission1'].forEach(key => {
        const containerId = key === 'mission200' ? 'mission200Posters' : 'mission1Posters';
        displayPostersPaginated(containerId, key);
        updatePosterCount(key);
    });
}
/* ==================== PUBLICATIONS ==================== */
function loadPublicationsTable() {
    const tbody = document.getElementById('publicationsTableBody');
    if (publications.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-table">No publications added yet</td></tr>';
        return;
    }
    tbody.innerHTML = publications.map((p, i) => `
        <tr>
            <td><strong>${p.name}</strong></td>
            <td>${p.category}</td>
            <td>${p.website ? `<a href="${p.website}" target="_blank" style="color:#3b82f6;">Link</a>` : 'N/A'}</td>
            <td>${p.email || 'N/A'}</td>
            <td>${p.language || 'N/A'}</td>
            <td><button class="btn-sm btn-delete" onclick="deletePublication(${i})"><i class="fas fa-trash"></i></button></td>
        </tr>
    `).join('');
}

function openPublicationForm(index = null) {
    const form = document.getElementById('publicationForm');
    if (form) form.reset();
    if (index !== null) {
        const p = publications[index];
        document.getElementById('publicationModalTitle').textContent = 'Edit Publication';
        document.getElementById('publicationId').value = index;
        document.getElementById('pubName').value = p.name;
        document.getElementById('pubCategory').value = p.category;
        document.getElementById('pubLanguage').value = p.language || '';
        document.getElementById('pubWebsite').value = p.website || '';
        document.getElementById('pubEmail').value = p.email || '';
    } else {
        document.getElementById('publicationModalTitle').textContent = 'Add Publication';
        document.getElementById('publicationId').value = '';
    }
    openModal('publicationModal');
}

function savePublication() {
    const id = document.getElementById('publicationId').value;
    const data = {
        id: id ? publications[id].id : Date.now(),
        name: document.getElementById('pubName').value,
        category: document.getElementById('pubCategory').value,
        language: document.getElementById('pubLanguage').value,
        website: document.getElementById('pubWebsite').value,
        email: document.getElementById('pubEmail').value
    };
    if (!data.name) { showAlert('Name required', 'error'); return; }
    if (id) publications[id] = { ...publications[id], ...data };
    else publications.push(data);
    savePublications();
    closeModal('publicationModal');
    loadPublicationsTable();
    showAlert('Saved!', 'success');
}

function deletePublication(index) {
    if (confirm('Delete?')) { publications.splice(index, 1); savePublications(); loadPublicationsTable(); showAlert('Deleted!', 'success'); }
}

/* ==================== USERS ==================== */
function loadUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-table">No users yet</td></tr>';
        return;
    }
    tbody.innerHTML = users.map((u, i) => `
        <tr>
            <td><strong>${u.name}</strong></td><td>${u.admission}</td><td>${u.class||''}</td><td>${u.email||''}</td>
            <td><span class="status-badge ${u.role==='admin'?'status-approved':'status-pending'}">${u.role}</span></td>
            <td><strong>${u.credits||0}</strong></td><td>${u.badge!=='none'?u.badge:'—'}</td>
            <td>${u.role!=='admin'?`<button class="btn-sm btn-delete" onclick="deleteUser(${i})"><i class="fas fa-trash"></i></button>`:''}</td>
        </tr>
    `).join('');
}

function openUserForm() { /* Simplified */ }
function deleteUser(index) { if (confirm('Delete?')) { users.splice(index, 1); saveUsers(); loadUsersTable(); } }

/* ==================== POINTS CONFIG ==================== */
const defaultPointsConfig = [
    { category: 'Academic', activity: 'Paper Presentation', level: 'International', points: 30 },
    { category: 'Academic', activity: 'Paper Presentation', level: 'National', points: 20 },
    { category: 'Academic', activity: 'Paper Presentation', level: 'Local', points: 10 },
    { category: 'Research', activity: 'Research Article', level: 'ISSN Journal', points: 30 },
    { category: 'Research', activity: 'Research Article', level: 'Periodicals', points: 20 },
    { category: 'Research', activity: 'Research Article', level: 'Magazines', points: 15 },
    { category: 'Literary', activity: 'Poem/Story/Essay', level: 'Magazines', points: 12 },
    { category: 'Literary', activity: 'Poem/Story/Essay', level: 'Periodicals', points: 12 },
    { category: 'Literary', activity: 'Poem/Story/Essay', level: 'Online', points: 8 },
    { category: 'Blogs', activity: 'Academic blog post', level: 'Educational blog', points: 5 },
    { category: 'Books', activity: 'Academic with ISBN', level: '—', points: 40 },
    { category: 'Books', activity: 'Academic without ISBN', level: '—', points: 30 },
    { category: 'Books', activity: 'Literary Book', level: '—', points: 20 },
    { category: 'Media', activity: 'Article/Essay', level: 'Newspaper', points: 25 },
    { category: 'Media', activity: 'Letter', level: '—', points: 8 },
    { category: 'Media', activity: 'Opinions', level: '—', points: 8 },
    { category: 'Creative', activity: 'Art/Photo', level: 'Recognised', points: 10 },
    { category: 'Competition', activity: '1st Prize', level: 'International', points: 30 },
    { category: 'Competition', activity: '2nd Prize', level: 'International', points: 25 },
    { category: 'Competition', activity: '3rd Prize', level: 'International', points: 20 },
    { category: 'Competition', activity: '1st Prize', level: 'National', points: 25 },
    { category: 'Competition', activity: '2nd Prize', level: 'National', points: 20 },
    { category: 'Competition', activity: '3rd Prize', level: 'National', points: 15 },
    { category: 'Competition', activity: '1st Prize', level: 'State', points: 20 },
    { category: 'Competition', activity: '2nd Prize', level: 'State', points: 15 },
    { category: 'Competition', activity: '3rd Prize', level: 'State', points: 10 },
    { category: 'Competition', activity: '1st Prize', level: 'Local', points: 10 },
    { category: 'Competition', activity: '2nd Prize', level: 'Local', points: 8 },
    { category: 'Competition', activity: '3rd Prize', level: 'Local', points: 6 }
];

function loadPointsConfig() {
    let config = JSON.parse(localStorage.getItem('ogea_points_config') || 'null') || [...defaultPointsConfig];
    const tbody = document.getElementById('pointsConfigBody');
    tbody.innerHTML = config.map((item, i) => `
        <tr>
            <td>${item.category}</td><td>${item.activity}</td><td>${item.level}</td>
            <td><input type="number" value="${item.points}" onchange="updatePointValue(${i},this.value)" style="width:80px;padding:8px;border:1px solid #e2e8f0;border-radius:6px;text-align:center;"></td>
        </tr>
    `).join('');
}

function updatePointValue(index, value) {
    let config = JSON.parse(localStorage.getItem('ogea_points_config') || 'null') || [...defaultPointsConfig];
    config[index].points = parseInt(value) || 0;
    localStorage.setItem('ogea_points_config', JSON.stringify(config));
}

function resetPointsConfig() {
    if (confirm('Reset all points to default?')) {
        localStorage.removeItem('ogea_points_config');
        loadPointsConfig();
        showAlert('Points reset!', 'success');
    }
}

/* ==================== REPORTS ==================== */
function loadReports() {
    document.getElementById('reportTotal').textContent = achievements.length;
    document.getElementById('reportApproved').textContent = achievements.filter(a => a.status === 'approved').length;
    document.getElementById('reportPending').textContent = achievements.filter(a => a.status === 'pending').length;
    document.getElementById('reportRejected').textContent = achievements.filter(a => a.status === 'rejected').length;
    document.getElementById('reportPoints').textContent = achievements.reduce((s, a) => s + (a.pointsAwarded || 0), 0);
    
    const top = document.getElementById('topAchievers');
    const topList = achievements.filter(a => a.status === 'approved').sort((a, b) => (b.pointsAwarded || 0) - (a.pointsAwarded || 0)).slice(0, 5);
    top.innerHTML = topList.length === 0 ? '<p class="empty-text">No data</p>' : topList.map((a, i) => `
        <div class="report-stat"><span>${i+1}. ${a.fullName}</span><span class="gold">${a.pointsAwarded||0} pts</span></div>
    `).join('');
}

/* ==================== MODAL FUNCTIONS ==================== */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) { modal.classList.add('show'); document.body.style.overflow = 'hidden'; }
}
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) { modal.classList.remove('show'); document.body.style.overflow = ''; currentAchievementId = null; currentProgramImage = null; }
}
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        const modal = e.target.closest('.modal');
        if (modal) { modal.classList.remove('show'); document.body.style.overflow = ''; currentAchievementId = null; }
    }
});
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.show').forEach(m => { m.classList.remove('show'); document.body.style.overflow = ''; currentAchievementId = null; });
    }
});

/* ==================== NOTIFICATIONS ==================== */
function initNotifications() {
    const btn = document.getElementById('notificationBtn');
    const dropdown = document.getElementById('notificationDropdown');
    if (btn && dropdown) {
        btn.addEventListener('click', function(e) { e.stopPropagation(); dropdown.classList.toggle('show'); loadNotifications(); });
        document.addEventListener('click', function(e) { if (!dropdown.contains(e.target) && e.target !== btn) dropdown.classList.remove('show'); });
    }
}
function loadNotifications() {
    const pending = achievements.filter(a => a.status === 'pending');
    const list = document.getElementById('notificationList');
    const dot = document.getElementById('notificationDot');
    if (pending.length === 0) {
        list.innerHTML = '<p class="no-notifications">No new notifications</p>';
        if (dot) dot.style.display = 'none';
    } else {
        if (dot) dot.style.display = 'block';
        list.innerHTML = pending.slice(-5).map(a => `
            <div class="notification-item unread" style="padding:10px;border-bottom:1px solid #f1f5f9;background:#eff6ff;border-radius:6px;margin-bottom:4px;">
                <p style="font-size:13px;margin:0;"><strong>${a.fullName}</strong> - ${a.activityTitle}</p>
                <span style="font-size:11px;color:#64748b;">${formatDate(a.submittedAt)} · Pending</span>
            </div>
        `).join('');
    }
}

/* ==================== SEARCH & LOGOUT ==================== */
function initGlobalSearch() {
    const input = document.getElementById('globalSearch');
    if (input) {
        input.addEventListener('input', function() {
            const term = this.value.toLowerCase();
            if (term.length >= 2) {
                const results = achievements.filter(a => a.fullName.toLowerCase().includes(term) || a.activityTitle.toLowerCase().includes(term));
                if (results.length > 0) { navigateTo('achievements'); loadAchievementsTable('all', term); }
            }
        });
    }
}
function initLogout() {
    const btn = document.getElementById('logoutBtn');
    if (btn) btn.addEventListener('click', () => { 
        if (confirm('Logout?')) {
            localStorage.removeItem('ogea_admin_session');
            window.location.href = 'admin-login.html'; 
        }
    });
}

/* ==================== UTILITIES ==================== */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
function formatCat(cat) {
    if (!cat) return 'N/A';
    return cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
function updatePendingCount() {
    const pending = achievements.filter(a => a.status === 'pending').length;
    const badge = document.getElementById('pendingCount');
    if (badge) { badge.textContent = pending; badge.style.display = pending > 0 ? 'inline' : 'none'; }
}
function exportData() {
    const data = { achievements, programs, publications, users: users.map(u => ({...u, password:'***'})), exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `ogea_export_${new Date().toISOString().split('T')[0]}.json`; a.click();
    showAlert('Data exported!', 'success');
}
function showAlert(message, type = 'info') {
    const existing = document.querySelector('.custom-alert');
    if (existing) existing.remove();
    const colors = { success: { bg: '#ecfdf5', border: '#059669', text: '#065f46', icon: '✅' }, error: { bg: '#fef2f2', border: '#dc2626', text: '#991b1b', icon: '❌' }, warning: { bg: '#fffbeb', border: '#d97706', text: '#92400e', icon: '⚠️' }, info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', icon: 'ℹ️' } };
    const c = colors[type] || colors.info;
    const div = document.createElement('div');
    div.className = 'custom-alert';
    div.style.cssText = `position:fixed;top:90px;right:20px;max-width:400px;padding:16px 20px;background:${c.bg};border-left:4px solid ${c.border};color:${c.text};border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.15);z-index:9999;display:flex;align-items:flex-start;gap:12px;font-size:14px;`;
    div.innerHTML = `<span>${c.icon}</span><span style="flex:1;">${message}</span><button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;font-size:18px;opacity:0.6;">×</button>`;
    document.body.appendChild(div);
    setTimeout(() => { if (div.parentElement) div.remove(); }, 4000);
}

console.log('👑 OGEA Admin JS Loaded - Manual Points | Poster Uploads | Program Images');