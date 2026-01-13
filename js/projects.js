// ==================== PROJECT MANAGEMENT ====================

let currentProject = null;

// Load current project from localStorage
function loadCurrentProject() {
    const saved = localStorage.getItem('currentProject');
    if (saved) {
        try {
            currentProject = JSON.parse(saved);
            updateCurrentProjectUI();
        } catch (e) {
            console.error('Failed to load current project:', e);
        }
    }
}

// Save current project to localStorage
function saveCurrentProject() {
    if (currentProject) {
        localStorage.setItem('currentProject', JSON.stringify(currentProject));
        updateCurrentProjectUI();
    } else {
        localStorage.removeItem('currentProject');
    }
}

// Update UI to show current project
function updateCurrentProjectUI() {
    const infoDiv = document.getElementById('current-project-info');
    const nameDiv = document.getElementById('current-project-name');
    
    if (currentProject && infoDiv && nameDiv) {
        nameDiv.textContent = currentProject.name;
        infoDiv.style.display = 'block';
    } else if (infoDiv) {
        infoDiv.style.display = 'none';
    }
}

// Clear current project
function clearCurrentProject() {
    currentProject = null;
    saveCurrentProject();
    updateCurrentProjectUI();
}

// Show project modal
function showProjectModal() {
    const modal = document.getElementById('project-modal');
    if (modal) {
        modal.classList.add('show');
        document.getElementById('new-project-name').value = '';
        document.getElementById('new-project-description').value = '';
    }
}

// Hide project modal
function hideProjectModal() {
    const modal = document.getElementById('project-modal');
    if (modal) modal.classList.remove('show');
}

// Create new project
async function createNewProject() {
    const nameInput = document.getElementById('new-project-name');
    const descInput = document.getElementById('new-project-description');
    
    const name = nameInput.value.trim();
    if (!name) {
        alert('Please enter a project name');
        return;
    }
    
    currentProject = {
        name: name,
        description: descInput.value.trim(),
        timestamp: Date.now(),
        lastModified: Date.now()
    };
    
    saveCurrentProject();
    hideProjectModal();
    
    // Switch to cement tab to start calculations
    const cementTab = document.querySelector('[data-tab="cement"]');
    if (cementTab) cementTab.click();
    
    alert(`✓ Project "${name}" created! Start adding calculations.`);
}

// Save calculation to current project
async function saveCalculationToProject(type, inputs, results) {
    const projectName = document.getElementById(`${type}-project-name`).value.trim();
    
    if (!projectName) {
        alert('Please enter a project name to save');
        return;
    }
    
    const projectData = {
        name: projectName,
        type: type,
        timestamp: Date.now(),
        lastModified: Date.now(),
        inputs: inputs,
        results: results
    };
    
    try {
        const projectId = await saveProject(projectData);
        alert(`✓ Project "${projectName}" saved successfully!`);
        loadProjectsList();
        return projectId;
    } catch (error) {
        console.error('Failed to save project:', error);
        alert('Failed to save project. Please try again.');
    }
}

// Load and display all projects
async function loadProjectsList() {
    try {
        // Wait a bit for DB to be ready
        if (!db) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const projects = await getAllProjects();
        const listDiv = document.getElementById('projects-list');
        
        if (!listDiv) return;
        
        if (projects.length === 0) {
            listDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #9ca3af;">
                    <div style="font-size: 48px; margin-bottom: 12px;">📋</div>
                    <p>No saved projects yet</p>
                    <p style="font-size: 14px;">Create a project and save your calculations</p>
                </div>
            `;
            return;
        }
        
        listDiv.innerHTML = projects.map(project => createProjectCard(project)).join('');
        
        // Add event listeners to load/delete buttons
        projects.forEach(project => {
            const loadBtn = document.getElementById(`load-${project.id}`);
            const deleteBtn = document.getElementById(`delete-${project.id}`);
            
            if (loadBtn) {
                loadBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    loadProject(project);
                });
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (confirm(`Delete project "${project.name}"?`)) {
                        try {
                            await deleteProject(project.id);
                            alert('✓ Project deleted successfully!');
                            await loadProjectsList();
                        } catch (error) {
                            console.error('Delete failed:', error);
                            alert('❌ Failed to delete project. Please try again.');
                        }
                    }
                });
            }
        });
        
    } catch (error) {
        console.error('Failed to load projects:', error);
        const listDiv = document.getElementById('projects-list');
        if (listDiv) {
            listDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #ef4444;">
                    <p>❌ Failed to load projects</p>
                    <p style="font-size: 14px;">Please refresh the page</p>
                </div>
            `;
        }
    }
}

// Create HTML for project card
function createProjectCard(project) {
    const date = new Date(project.lastModified).toLocaleDateString('en-GB');
    const typeIcon = {
        'cement': '📦 Cement',
        'brick': '🧱 Brick',
        'area': '📐 Area',
        'volume': '📊 Volume'
    };
    
    // Get key result values
    let details = '';
    if (project.type === 'cement') {
        details = `
            <div class="project-card-detail"><strong>Volume:</strong> <span>${project.results.Volume || 'N/A'}</span></div>
            <div class="project-card-detail"><strong>Cement:</strong> <span>${project.results['Cement Bags'] || 'N/A'}</span></div>
        `;
    } else if (project.type === 'brick') {
        details = `
            <div class="project-card-detail"><strong>Area:</strong> <span>${project.results['Wall Area'] || 'N/A'}</span></div>
            <div class="project-card-detail"><strong>Bricks:</strong> <span>${project.results['Bricks Needed'] || 'N/A'}</span></div>
        `;
    } else if (project.type === 'area') {
        details = `
            <div class="project-card-detail"><strong>Area:</strong> <span>${project.results.Area || 'N/A'}</span></div>
        `;
    } else if (project.type === 'volume') {
        details = `
            <div class="project-card-detail"><strong>Volume:</strong> <span>${project.results.Volume || 'N/A'}</span></div>
        `;
    }
    
    return `
        <div class="project-card">
            <div class="project-card-header">
                <div>
                    <div class="project-card-name">${project.name}</div>
                    <div class="project-card-date">Last modified: ${date}</div>
                </div>
                <span class="project-card-type">${typeIcon[project.type] || project.type}</span>
            </div>
            ${project.description ? `<p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">${project.description}</p>` : ''}
            <div class="project-card-details">
                ${details}
            </div>
            <div class="project-card-actions">
                <button id="load-${project.id}" class="btn-load">Load</button>
                <button id="delete-${project.id}" class="btn-delete">Delete</button>
            </div>
        </div>
    `;
}

// Load project into calculator
function loadProject(project) {
    const { type, inputs, name } = project;
    
    // Switch to the appropriate tab
    const tab = document.querySelector(`[data-tab="${type}"]`);
    if (tab) tab.click();
    
    // Fill in project name
    const nameInput = document.getElementById(`${type}-project-name`);
    if (nameInput) nameInput.value = name;
    
    // Fill in inputs based on type
    if (type === 'cement') {
        document.getElementById('cement-length').value = inputs.length || '';
        document.getElementById('cement-width').value = inputs.width || '';
        document.getElementById('cement-thickness').value = inputs.thickness || '';
        document.getElementById('cement-ratio').value = inputs.ratio || '1:2:4';
    } else if (type === 'brick') {
        document.getElementById('brick-length').value = inputs.length || '';
        document.getElementById('brick-height').value = inputs.height || '';
        document.getElementById('brick-mortar').value = inputs.mortarThickness || '';
    } else if (type === 'area') {
        document.getElementById('area-shape').value = inputs.shape || 'rectangle';
        document.getElementById('area-length').value = inputs.length || '';
        document.getElementById('area-width').value = inputs.width || '';
    } else if (type === 'volume') {
        document.getElementById('volume-shape').value = inputs.shape || 'cuboid';
        document.getElementById('vol-length').value = inputs.length || '';
        document.getElementById('vol-width').value = inputs.width || '';
        document.getElementById('vol-height').value = inputs.height || '';
    }
    
    alert(`✓ Project "${name}" loaded!`);
}

// Initialize projects on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for database to be ready
    let retries = 0;
    while (!db && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
    }
    
    if (!db) {
        console.error('Database not ready after waiting');
        return;
    }
    
    loadCurrentProject();
    await loadProjectsList();
    
    // New project button
    const newProjectBtn = document.getElementById('new-project-btn');
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', showProjectModal);
    }
    
    // Create project button in modal
    const createBtn = document.getElementById('create-project-btn');
    if (createBtn) {
        createBtn.addEventListener('click', createNewProject);
    }
    
    // Cancel button in project modal
    const cancelBtns = document.querySelectorAll('.project-cancel-btn');
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', hideProjectModal);
    });
    
    // Clear current project button
    const clearBtn = document.getElementById('clear-current-project');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearCurrentProject);
    }
    
    // Save project buttons
    const saveCementBtn = document.getElementById('save-cement-project');
    if (saveCementBtn) {
        saveCementBtn.addEventListener('click', () => {
            const inputs = {
                length: parseFloat(document.getElementById('cement-length').value),
                width: parseFloat(document.getElementById('cement-width').value),
                thickness: parseFloat(document.getElementById('cement-thickness').value),
                ratio: document.getElementById('cement-ratio').value
            };
            // Get results from last calculation (stored in result div)
            const resultDiv = document.getElementById('cement-result');
            if (resultDiv.innerHTML) {
                // Extract results - this is a simplified approach
                // In production, you'd want to store results in a variable
                const results = window.lastCementResults || {};
                saveCalculationToProject('cement', inputs, results);
            }
        });
    }
    
    const saveBrickBtn = document.getElementById('save-brick-project');
    if (saveBrickBtn) {
        saveBrickBtn.addEventListener('click', () => {
            const inputs = {
                length: parseFloat(document.getElementById('brick-length').value),
                height: parseFloat(document.getElementById('brick-height').value),
                mortarThickness: parseFloat(document.getElementById('brick-mortar').value)
            };
            const results = window.lastBrickResults || {};
            saveCalculationToProject('brick', inputs, results);
        });
    }
    
    // Reload projects list when Projects tab is clicked
    const projectsTab = document.querySelector('[data-tab="projects"]');
    if (projectsTab) {
        projectsTab.addEventListener('click', loadProjectsList);
    }
});
