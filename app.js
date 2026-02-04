// Application State
let currentOrder = [];
let selectedPriority = 'routine';
let highlightedIndex = -1;
let searchTimeout = null;
let viewMode = 'detailed'; // 'mini' or 'detailed'

// DOM Elements
const accountInput = document.getElementById('account-input');
const accountDropdown = document.getElementById('account-dropdown');
const searchInput = document.getElementById('searchInput');
const combobox = document.getElementById('combobox');
const orderList = document.getElementById('order-list');
const orderCount = document.getElementById('order-count');
const orderTitle = document.getElementById('order-title');
const totalCost = document.getElementById('total-cost');
const totalCostBadge = document.getElementById('total-cost-badge');
const saveDraftBtn = document.getElementById('save-draft-btn');
const signOrderBtn = document.getElementById('sign-order-btn');
const orderDetailsBtn = document.getElementById('order-details-btn');
const clearAllBtn = document.getElementById('clear-all-btn');

// Keyboard shortcut hint removed

// Custom tooltip (instant, no native delay)
let customTooltipEl = null;

function initCustomTooltip() {
    customTooltipEl = document.getElementById('custom-tooltip');
}

function showCustomTooltip(text, anchorEl, variant) {
    if (!customTooltipEl || !anchorEl) return;
    customTooltipEl.textContent = text;
    customTooltipEl.classList.remove('custom-tooltip--danger');
    if (variant === 'danger') {
        customTooltipEl.classList.add('custom-tooltip--danger');
    }
    const rect = anchorEl.getBoundingClientRect();
    customTooltipEl.style.left = `${rect.left + rect.width / 2}px`;
    customTooltipEl.style.top = `${rect.top - 6}px`;
    customTooltipEl.style.transform = 'translate(-50%, -100%)';
    customTooltipEl.classList.add('visible');
}

function hideCustomTooltip() {
    if (customTooltipEl) {
        customTooltipEl.classList.remove('visible', 'custom-tooltip--danger');
    }
}

// Diagnosis code (ICD-10) combobox
let diagnosisComboboxEl = null;
let currentDiagnosisInput = null;

function initDiagnosisCombobox() {
    diagnosisComboboxEl = document.getElementById('diagnosis-combobox');
    if (!diagnosisComboboxEl) return;
    diagnosisComboboxEl.addEventListener('click', (e) => {
        const item = e.target.closest('.diagnosis-combobox-item');
        if (item && currentDiagnosisInput) {
            const code = item.dataset.code;
            if (code) {
                currentDiagnosisInput.value = code;
                currentDiagnosisInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            hideDiagnosisCombobox();
        }
    });
}

function showDiagnosisCombobox(inputEl) {
    if (!diagnosisComboboxEl || !inputEl) return;
    currentDiagnosisInput = inputEl;
    const query = (inputEl.value || '').trim();
    const suggestions = getIcd10Suggestions(query);
    const rect = inputEl.getBoundingClientRect();
    diagnosisComboboxEl.innerHTML = suggestions.length
        ? suggestions.map(code => `<div class="diagnosis-combobox-item" data-code="${code}" role="option">${code}</div>`).join('')
        : '<div class="diagnosis-combobox-item" style="color:#999;cursor:default">No suggestions</div>';
    diagnosisComboboxEl.style.left = `${rect.left}px`;
    diagnosisComboboxEl.style.top = `${rect.bottom + 4}px`;
    diagnosisComboboxEl.style.minWidth = `${Math.max(rect.width, 120)}px`;
    diagnosisComboboxEl.classList.add('show');
}

function hideDiagnosisCombobox() {
    if (diagnosisComboboxEl) {
        diagnosisComboboxEl.classList.remove('show');
    }
    currentDiagnosisInput = null;
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initCustomTooltip();
    initDiagnosisCombobox();
    initializeAccountNumber();
    initializeTabs();
    initializeViewToggle();
    initializeOrderDetailsAccordion();
    initializePickListModal();
    // Load pick lists from storage
    getPickLists();
    renderQuickSelections();
    renderOrderList();
    setupEventListeners();
    updateCost();
});

// ==================== ACCOUNT NUMBER ====================

function updateSignOrderButtonState() {
    if (!signOrderBtn || !accountInput) return;
    const hasAccount = (accountInput.value || '').trim() !== '';
    const hasTests = currentOrder.length >= 1;
    const enabled = hasAccount && hasTests;
    signOrderBtn.disabled = !enabled;
    if (enabled) {
        signOrderBtn.setAttribute('aria-label', 'Sign and submit order');
    } else if (!hasAccount) {
        signOrderBtn.setAttribute('aria-label', 'Select an account number to enable');
    } else {
        signOrderBtn.setAttribute('aria-label', 'Add at least one test to enable');
    }
}

function initializeAccountNumber() {
    if (!accountInput || !accountDropdown) return;

    // Focus on account input on load to indicate it's the first step
    setTimeout(() => {
        accountInput.focus();
    }, 100);

    // Open dropdown when account input is clicked
    accountInput.addEventListener('click', (e) => {
        e.preventDefault();
        accountDropdown.classList.toggle('show');
    });

    // Handle account selection
    const accountItems = accountDropdown.querySelectorAll('.account-dropdown-item');
    accountItems.forEach(item => {
        item.addEventListener('click', () => {
            const accountNumber = item.dataset.account;
            accountInput.value = accountNumber;
            accountDropdown.classList.remove('show');

            // Enable search field and focus on it
            searchInput.disabled = false;
            searchInput.focus();

            // Enable Sign & Order button once account is selected
            updateSignOrderButtonState();
        });
    });

    // Initial state: enable Sign & Order only if account already has a value
    updateSignOrderButtonState();

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!accountInput.contains(e.target) && !accountDropdown.contains(e.target)) {
            accountDropdown.classList.remove('show');
        }
    });
}

// ==================== PICK LIST MODAL ====================

function initializePickListModal() {
    const modal = document.getElementById('pick-list-modal');
    const nameInput = document.getElementById('pick-list-name');
    const closeBtn = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('modal-cancel');
    const saveBtn = document.getElementById('modal-save');

    if (!modal) return;

    const closeHandler = () => closePickListModal();

    if (closeBtn) {
        closeBtn.addEventListener('click', closeHandler);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeHandler);
    }

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeHandler();
        }
    });

    if (saveBtn) {
        saveBtn.addEventListener('click', handleSavePickList);
    }

    // Allow Enter key to save
    if (nameInput) {
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSavePickList();
            }
        });
    }
}

// ==================== SEARCH & COMBOBOX ====================

function setupEventListeners() {
    // Search input events
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('keydown', handleSearchKeydown);
    searchInput.addEventListener('focus', handleSearchFocus);
    searchInput.addEventListener('blur', () => {
        // Delay to allow click events on combobox items
        setTimeout(() => {
            if (!combobox.matches(':hover')) {
                hideCombobox();
            }
        }, 200);
    });

    // Priority toggle
    document.querySelectorAll('input[name="priority"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectedPriority = e.target.value;
            updateOrderPriority();
        });
    });

    // Bottom bar actions
    saveDraftBtn.addEventListener('click', handleSaveDraft);
    signOrderBtn.addEventListener('click', handleSignOrder);

    // Clear all button
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', handleClearAll);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSignOrder();
        }
        // Close sidebar with Escape
        if (e.key === 'Escape') {
            const editSidebar = document.getElementById('edit-sidebar');
            const orderDetailsSidebar = document.getElementById('order-details-sidebar');
            const reviewSidebar = document.getElementById('review-sidebar');
            if (editSidebar && editSidebar.classList.contains('open')) {
                closeEditSidebar();
            } else if (orderDetailsSidebar && orderDetailsSidebar.classList.contains('open')) {
                closeOrderDetailsSidebar();
            } else if (reviewSidebar && reviewSidebar.classList.contains('open')) {
                closeReviewSidebar();
            }
        }
    });

    // Click outside to close combobox
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !combobox.contains(e.target)) {
            hideCombobox();
        }
    });
}

function handleSearchInput(e) {
    const query = e.target.value;

    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    // Debounce search
    searchTimeout = setTimeout(() => {
        if (query.trim() === '') {
            hideCombobox();
            return;
        }

        const results = searchTests(query);
        renderCombobox(results);
        highlightedIndex = -1;
    }, 150);
}

function handleSearchKeydown(e) {
    const items = combobox.querySelectorAll('.combobox-item');

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightedIndex = Math.min(highlightedIndex + 1, items.length - 1);
        updateComboboxHighlight(items);
        scrollToHighlighted(items);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightedIndex = Math.max(highlightedIndex - 1, -1);
        updateComboboxHighlight(items);
        scrollToHighlighted(items);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0 && items[highlightedIndex]) {
            const testId = items[highlightedIndex].dataset.testId;
            addTestToOrder(testId);
        } else if (items.length > 0) {
            // Add first result if nothing highlighted
            const testId = items[0].dataset.testId;
            addTestToOrder(testId);
        }
    } else if (e.key === 'Escape') {
        hideCombobox();
        searchInput.blur();
    }
}

function handleSearchFocus() {
    const query = searchInput.value.trim();
    if (query !== '') {
        const results = searchTests(query);
        if (results.length > 0) {
            renderCombobox(results);
        }
    }
}

function renderCombobox(results) {
    combobox.innerHTML = '';

    if (results.length === 0) {
        combobox.innerHTML = '<div class="combobox-item">No tests found</div>';
        combobox.classList.add('show');
        searchInput.setAttribute('aria-expanded', 'true');
        return;
    }

    results.forEach((test, index) => {
        const item = document.createElement('div');
        item.className = 'combobox-item';
        item.dataset.testId = test.id;
        item.setAttribute('role', 'option');
        item.setAttribute('id', `option-${index}`);

        // Check if test is already in order
        const isInOrder = currentOrder.some(item => item.testId === test.id);
        const addedChip = isInOrder ? `
            <span class="added-chip">
                <span class="added-chip-icon">✓</span>
                <span>Added</span>
            </span>
        ` : '';

        const comboboxStarPath = test.isFavorite
            ? '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>'
            : '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>';

        item.innerHTML = `
            <span class="combobox-item-name">${test.name}</span>
            <span class="combobox-item-code">${test.cptCode}</span>
            ${addedChip}
            <button type="button" class="combobox-favorite" aria-label="${test.isFavorite ? 'Remove from favorites' : 'Add to favorites'}" data-test-id="${test.id}" title="${test.isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${comboboxStarPath}</svg>
            </button>
        `;

        const favoriteBtn = item.querySelector('.combobox-favorite');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(test.id);
                renderQuickSelections();
            });
        }

        item.addEventListener('click', (e) => {
            if (e.target.closest('.combobox-favorite')) return;
            addTestToOrder(test.id);
        });

        item.addEventListener('mouseenter', () => {
            highlightedIndex = index;
            updateComboboxHighlight(combobox.querySelectorAll('.combobox-item'));
        });

        combobox.appendChild(item);
    });

    combobox.classList.add('show');
    searchInput.setAttribute('aria-expanded', 'true');
    searchInput.setAttribute('aria-activedescendant', highlightedIndex >= 0 ? `option-${highlightedIndex}` : '');
}

function updateComboboxHighlight(items) {
    items.forEach((item, index) => {
        if (index === highlightedIndex) {
            item.classList.add('highlighted');
            item.setAttribute('aria-selected', 'true');
            searchInput.setAttribute('aria-activedescendant', `option-${index}`);
        } else {
            item.classList.remove('highlighted');
            item.setAttribute('aria-selected', 'false');
        }
    });
}

function scrollToHighlighted(items) {
    if (highlightedIndex >= 0 && items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
    }
}

function hideCombobox() {
    combobox.classList.remove('show');
    searchInput.setAttribute('aria-expanded', 'false');
    highlightedIndex = -1;
}

// ==================== QUICK SELECTIONS ====================

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.chips-grid').forEach(grid => {
                grid.classList.remove('active-tab-content');
            });

            // Add active class to clicked tab
            button.classList.add('active');
            const tabName = button.dataset.tab;
            const targetGrid = document.getElementById(`${tabName}-chips`);
            if (targetGrid) {
                targetGrid.classList.add('active-tab-content');
            }
        });
    });
}

function renderQuickSelections() {
    renderFavorites();
    renderPanels();
    renderRecent();
}

function renderFavorites() {
    const container = document.getElementById('favorites-chips');
    const favorites = getFavorites();
    renderChips(container, favorites);
}

function renderPanels() {
    const container = document.getElementById('panels-chips');
    if (!container) return;

    // Only show user-created pick lists
    const pickLists = getPickLists();

    // Clear container
    container.innerHTML = '';

    // If no pick lists, show empty state message
    if (pickLists.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'pick-lists-empty-message';
        emptyMsg.textContent = 'No pick lists created';
        container.appendChild(emptyMsg);
        return;
    }

    // Check view mode and set grid layout (single column in Full Details to prevent overflow)
    const activeButton = document.querySelector('.segmented-button.active');
    const isDetailed = activeButton && activeButton.dataset.view === 'detailed';
    if (isDetailed) {
        container.classList.add('detailed-view');
    } else {
        container.classList.remove('detailed-view');
    }

    // Render pick lists only
    pickLists.forEach(pickList => {
        const pickListCard = document.createElement('div');
        pickListCard.className = isDetailed ? 'pick-list-card' : 'chip';
        pickListCard.dataset.pickListId = pickList.id;

        // Build acronyms for tests in this pick list (same style as test count)
        const acronyms = pickList.testIds
            .map(id => getTestById(id))
            .filter(Boolean)
            .map(test => getTestAcronym(test));
        const countText = acronyms.length > 0
            ? `${pickList.testIds.length} tests (${acronyms.join(', ')})`
            : `${pickList.testIds.length} tests`;

        if (isDetailed) {
            pickListCard.innerHTML = `
                <div class="pick-list-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="white"/>
                        <path d="M7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H13V17H7V15Z" fill="white"/>
                    </svg>
                </div>
                <div class="pick-list-content">
                    <div class="pick-list-header">
                        <span class="pick-list-name">${pickList.name}</span>
                        <span class="pick-list-count">${countText}</span>
                    </div>
                </div>
                <div class="pick-list-actions">
                    <button class="pick-list-add-btn" aria-label="Add to Order">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 3V13M3 8H13" stroke="#0066cc" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <button class="pick-list-delete-btn" aria-label="Delete ${pickList.name}" data-pick-list-id="${pickList.id}">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 4H14M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4M5.33333 4V2.66667C5.33333 2 6 1.33333 6.66667 1.33333H9.33333C10 1.33333 10.6667 2 10.6667 2.66667V4M6.66667 7.33333V11.3333M9.33333 7.33333V11.3333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            `;
        } else {
            pickListCard.innerHTML = `
                <span class="chip-acronym">${pickList.name.substring(0, 8)}</span>
                <div class="chip-actions">
                    <span class="chip-icon">+</span>
                    <button class="pick-list-delete-btn-small" aria-label="Delete ${pickList.name}" data-pick-list-id="${pickList.id}">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 4H14M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4M5.33333 4V2.66667C5.33333 2 6 1.33333 6.66667 1.33333H9.33333C10 1.33333 10.6667 2 10.6667 2.66667V4M6.66667 7.33333V11.3333M9.33333 7.33333V11.3333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            `;
        }

        pickListCard.addEventListener('click', (e) => {
            // Don't trigger if clicking buttons
            if (!e.target.closest('.pick-list-add-btn') && !e.target.closest('.pick-list-delete-btn') && !e.target.closest('.pick-list-delete-btn-small')) {
                // Add all tests from pick list
                pickList.testIds.forEach(testId => {
                    addTestToOrder(testId);
                });
            }
        });

        // Handle add button click in detailed view
        const addBtn = pickListCard.querySelector('.pick-list-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                pickList.testIds.forEach(testId => {
                    addTestToOrder(testId);
                });
            });
            addBtn.addEventListener('mouseenter', () => showCustomTooltip('Add to Order', addBtn));
            addBtn.addEventListener('mouseleave', hideCustomTooltip);
        }

        // Custom tooltip for compact pick list chip icon
        const pickListChipIcon = pickListCard.querySelector('.chip-icon');
        if (pickListChipIcon) {
            pickListChipIcon.addEventListener('mouseenter', () => showCustomTooltip('Add to Order', pickListChipIcon));
            pickListChipIcon.addEventListener('mouseleave', hideCustomTooltip);
        }

        // Handle delete button click
        const deleteBtn = pickListCard.querySelector('.pick-list-delete-btn, .pick-list-delete-btn-small');
        if (deleteBtn) {
            deleteBtn.addEventListener('mouseenter', () => showCustomTooltip('Delete', deleteBtn, 'danger'));
            deleteBtn.addEventListener('mouseleave', hideCustomTooltip);
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const pickListId = deleteBtn.dataset.pickListId;
                if (confirm(`Are you sure you want to delete "${pickList.name}"?`)) {
                    deletePickList(pickListId);
                    // Re-render panels to update the list
                    renderPanels();
                }
            });
        }

        container.appendChild(pickListCard);
    });
}

function renderRecent() {
    const container = document.getElementById('recent-chips');
    const recent = getRecentOrders();
    renderChips(container, recent);
}

function renderChips(container, tests) {
    container.innerHTML = '';

    // Check view mode from active segmented button
    const activeButton = document.querySelector('.segmented-button.active');
    const isDetailed = activeButton && activeButton.dataset.view === 'detailed';

    if (isDetailed) {
        renderDetailedCards(container, tests);
    } else {
        renderMiniChips(container, tests);
    }
}

function renderMiniChips(container, tests) {
    // Remove detailed view class if present
    container.classList.remove('detailed-view');

    tests.forEach(test => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.dataset.testId = test.id;

        // Extract acronym from name (first letters or common acronym)
        const acronym = getTestAcronym(test);

        // Check if test is already in order - show only checkmark in compact view
        const isInOrder = currentOrder.some(item => item.testId === test.id);
        const addedCheckmark = isInOrder ? `
            <span class="added-chip-compact" title="Added to order">✓</span>
        ` : '';

        const chipStarPath = test.isFavorite
            ? '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>'
            : '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>';

        chip.innerHTML = `
            <span class="chip-acronym">${acronym}</span>
            <button type="button" class="chip-favorite" aria-label="${test.isFavorite ? 'Remove from favorites' : 'Add to favorites'}" data-test-id="${test.id}" title="${test.isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${chipStarPath}</svg>
            </button>
            ${addedCheckmark}
            <span class="chip-icon">+</span>
        `;

        const chipIcon = chip.querySelector('.chip-icon');
        if (chipIcon) {
            chipIcon.addEventListener('mouseenter', () => showCustomTooltip('Add to Order', chipIcon));
            chipIcon.addEventListener('mouseleave', hideCustomTooltip);
        }

        const chipFavoriteBtn = chip.querySelector('.chip-favorite');
        if (chipFavoriteBtn) {
            chipFavoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(test.id);
                renderQuickSelections();
            });
            chipFavoriteBtn.addEventListener('mouseenter', () => showCustomTooltip(test.isFavorite ? 'Remove from favorites' : 'Add to favorites', chipFavoriteBtn));
            chipFavoriteBtn.addEventListener('mouseleave', hideCustomTooltip);
        }

        chip.addEventListener('click', (e) => {
            if (e.target.closest('.chip-favorite')) return;
            addTestToOrder(test.id);
            // Visual feedback
            chip.style.transform = 'scale(0.95)';
            setTimeout(() => {
                chip.style.transform = '';
            }, 150);
        });

        container.appendChild(chip);
    });
}

function renderDetailedCards(container, tests) {
    // Add class to container for detailed view
    container.classList.add('detailed-view');

    tests.forEach(test => {
        const card = document.createElement('div');
        card.className = 'test-card';
        card.dataset.testId = test.id;

        // Format aliases
        const aliasesText = test.aliases.length > 0
            ? `aka ${test.aliases.slice(0, 3).join(', ')}${test.aliases.length > 3 ? '...' : ''}`
            : '';

        // Check if test is already in order
        const isInOrder = currentOrder.some(item => item.testId === test.id);
        const addedChip = isInOrder ? `
            <span class="added-chip">
                <span class="added-chip-icon">✓</span>
                <span>Added</span>
            </span>
        ` : '';

        const starFilled = test.isFavorite
            ? '<path class="test-card-favorite-star-filled" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>'
            : '<path class="test-card-favorite-star-outline" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>';

        card.innerHTML = `
            <div class="test-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="white"/>
                    <path d="M7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H13V17H7V15Z" fill="white"/>
                </svg>
            </div>
            <div class="test-card-content">
                <div class="test-card-header">
                    <div class="test-card-name-row">
                        <span class="test-card-name">${test.name}</span>
                        ${test.isPanel ? '<span class="test-card-panel-tag">PANEL</span>' : ''}
                        ${addedChip}
                    </div>
                    <div class="test-card-cpt">${test.cptCode}</div>
                </div>
                <div class="test-card-details">
                    <span class="test-card-category">${test.category}</span>
                    ${aliasesText ? `<span class="test-card-separator">•</span><span class="test-card-aliases">${aliasesText}</span>` : ''}
                </div>
            </div>
            <button type="button" class="test-card-favorite-btn" aria-label="${test.isFavorite ? 'Remove from favorites' : 'Add to favorites'}" data-test-id="${test.id}" title="${test.isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${starFilled}</svg>
            </button>
            <button type="button" class="test-card-add-btn" aria-label="Add to Order">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M8 3V13M3 8H13" stroke="#0066cc" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        `;

        // Add click handler to entire card and button
        const addBtn = card.querySelector('.test-card-add-btn');
        const favoriteBtn = card.querySelector('.test-card-favorite-btn');
        const cardClickHandler = () => {
            addTestToOrder(test.id);
            // Visual feedback
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        };

        card.addEventListener('click', (e) => {
            if (e.target.closest('.test-card-add-btn') || e.target.closest('.test-card-favorite-btn')) return;
            cardClickHandler();
        });

        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cardClickHandler();
        });

        addBtn.addEventListener('mouseenter', () => showCustomTooltip('Add to Order', addBtn));
        addBtn.addEventListener('mouseleave', hideCustomTooltip);

        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(test.id);
            renderQuickSelections();
        });
        favoriteBtn.addEventListener('mouseenter', () => showCustomTooltip(test.isFavorite ? 'Remove from favorites' : 'Add to favorites', favoriteBtn));
        favoriteBtn.addEventListener('mouseleave', hideCustomTooltip);

        container.appendChild(card);
    });
}

function initializeViewToggle() {
    const segmentedButtons = document.querySelectorAll('.segmented-button');
    segmentedButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Remove active class from all buttons
            segmentedButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            e.target.classList.add('active');
            // Re-render quick selections
            renderQuickSelections();
        });
    });
}

function getTestAcronym(test) {
    // Try to find a short alias first
    const shortAlias = test.aliases.find(alias => alias.length <= 5 && alias.length >= 2);
    if (shortAlias) {
        return shortAlias.toUpperCase();
    }

    // Otherwise, use first letters of words
    const words = test.name.split(' ');
    if (words.length > 1) {
        return words.map(w => w[0]).join('').toUpperCase().substring(0, 5);
    }

    return test.name.substring(0, 5).toUpperCase();
}

// ==================== ORDER MANAGEMENT ====================

function addTestToOrder(testId) {
    const test = getTestById(testId);
    if (!test) return;

    // Check for duplicates
    const existingIndex = currentOrder.findIndex(item => item.testId === testId);
    if (existingIndex >= 0) {
        // Mark as conflict
        currentOrder[existingIndex].isConflict = true;
        currentOrder[existingIndex].conflictReason = 'Duplicate Order';
        renderOrderList();
        return;
    }

    // Create order item
    const orderItem = {
        id: `order-${Date.now()}-${Math.random()}`,
        testId: testId,
        test: test,
        priority: selectedPriority,
        fasting: 'no',
        icd10: '',
        diagnosisCodes: [],
        specimen: test.requiresSpecimen ? (test.specimenOptions[0] || '') : '',
        clinicalIndication: '',
        specialInstructions: '',
        frequency: 'once',
        startDate: '',
        endDate: '',
        isConflict: false,
        conflictReason: ''
    };

    currentOrder.push(orderItem);

    // Clear search and hide combobox
    searchInput.value = '';
    hideCombobox();

    // Keep focus on search for rapid entry
    searchInput.focus();

    // Animate item flying to cart
    animateTestToCart(test);

    // Show NPI warning if this is the first test added
    if (currentOrder.length === 1) {
        showNPIWarning();
    }

    // Update UI
    renderOrderList();
    updateCost();
    updateSignOrderButtonState();
    // Re-render quick selections to show "Added" chips
    renderQuickSelections();
}

function animateTestToCart(test) {
    // Create flying element
    const flyElement = document.createElement('div');
    flyElement.className = 'flying-item';
    flyElement.textContent = test.name;

    // Get positions
    const searchRect = searchInput.getBoundingClientRect();
    const orderListRect = orderList.getBoundingClientRect();

    // Set initial position
    flyElement.style.left = searchRect.left + 'px';
    flyElement.style.top = searchRect.top + 'px';

    // Calculate destination
    const flyX = orderListRect.left - searchRect.left;
    const flyY = orderListRect.top - searchRect.top;

    flyElement.style.setProperty('--fly-x', flyX + 'px');
    flyElement.style.setProperty('--fly-y', flyY + 'px');

    document.body.appendChild(flyElement);

    // Remove after animation
    setTimeout(() => {
        flyElement.remove();
    }, 600);
}

function removeTestFromOrder(orderId) {
    currentOrder = currentOrder.filter(item => item.id !== orderId);
    renderOrderList();
    updateCost();
    updateSignOrderButtonState();
    // Re-render quick selections to update "Added" chips
    renderQuickSelections();
}

function handleClearAll() {
    if (currentOrder.length === 0) {
        return;
    }

    const confirmClear = confirm(`Are you sure you want to delete all ${currentOrder.length} test(s) from the order?`);
    if (confirmClear) {
        currentOrder = [];
        renderOrderList();
        updateCost();
        updateSignOrderButtonState();
        // Re-render quick selections to update "Added" chips
        renderQuickSelections();
    }
}

function updateOrderPriority() {
    currentOrder.forEach(item => {
        item.priority = selectedPriority;
    });
    renderOrderList();
}

function renderOrderList() {
    if (currentOrder.length === 0) {
        orderList.innerHTML = '<div class="empty-state"><p>No tests selected. Use search or quick selections to add tests.</p></div>';
        orderCount.textContent = '0';
        return;
    }

    orderList.innerHTML = '';
    orderCount.textContent = currentOrder.length;

    currentOrder.forEach((item, index) => {
        const orderItem = document.createElement('div');
        orderItem.className = `order-item ${item.isConflict ? 'conflict' : ''}`;
        orderItem.dataset.orderId = item.id;
        orderItem.setAttribute('role', 'listitem');

        const test = item.test;

        orderItem.innerHTML = `
            <div class="order-item-header">
                <div class="order-item-name">${test.name}</div>
                <div class="order-item-actions">
                    <button class="order-item-edit" data-order-id="${item.id}" aria-label="Edit additional details" title="More Options">⋯</button>
                    <button class="order-item-remove" aria-label="Remove test" title="Remove">×</button>
                    <button type="button" class="order-item-toggle" aria-expanded="true" aria-label="Collapse test details">
                        <span class="accordion-icon">▼</span>
                    </button>
                </div>
            </div>
            <div class="order-item-details">
                <div class="order-item-row">
                    <div class="order-item-field">
                        <div class="field-label-row">
                            <label class="field-label">Diagnosis code</label>
                            ${item.icd10 ? `<a href="#" class="add-to-all-link" data-order-id="${item.id}" data-field="icd10">Add to all</a>` : ''}
                        </div>
                        <input 
                            type="text" 
                            class="order-field-input" 
                            placeholder="E11.9"
                            value="${item.icd10 || ''}"
                            data-order-id="${item.id}"
                            data-field="icd10"
                            aria-label="Diagnosis code for ${test.name}"
                        >
                    </div>
                    ${test.requiresSpecimen ? `
                        <div class="order-item-field">
                            <label class="field-label">Specimen</label>
                            <select class="order-field-select" data-order-id="${item.id}" data-field="specimen" aria-label="Specimen source for ${test.name}">
                                <option value="">Select...</option>
                                ${test.specimenOptions.map(option =>
            `<option value="${option}" ${item.specimen === option ? 'selected' : ''}>${option}</option>`
        ).join('')}
                            </select>
                        </div>
                    ` : ''}
                    <div class="order-item-field">
                        <label class="field-label">Fasting</label>
                        <div class="fasting-segmented-group" data-order-id="${item.id}">
                            <button type="button" class="fasting-segmented-btn ${item.fasting === 'yes' || item.fasting === 'na' ? '' : 'active'}" data-value="no" aria-label="Fasting: No">No</button>
                            <button type="button" class="fasting-segmented-btn ${item.fasting === 'yes' ? 'active' : ''}" data-value="yes" aria-label="Fasting: Yes">Yes</button>
                            <button type="button" class="fasting-segmented-btn ${item.fasting === 'na' ? 'active' : ''}" data-value="na" aria-label="Fasting: N/A">N/A</button>
                        </div>
                    </div>
                </div>
                <div class="order-item-row">
                    <div class="order-item-field order-item-field-full">
                        <label class="field-label">Special Instructions</label>
                        <input 
                            type="text" 
                            class="order-field-input" 
                            placeholder="Enter special instructions..."
                            value="${item.clinicalIndication || ''}"
                            data-order-id="${item.id}"
                            data-field="clinicalIndication"
                            aria-label="Special instructions for ${test.name}"
                        >
                    </div>
                </div>
                ${item.isConflict ? `
                    <div class="conflict-warning">
                        ⚠ ${item.conflictReason}
                        <a href="#" class="resolve-link" data-order-id="${item.id}">Resolve</a>
                    </div>
                ` : ''}
            </div>
        `;

        // Edit button (for additional details)
        const editBtn = orderItem.querySelector('.order-item-edit');
        editBtn.addEventListener('click', () => {
            openEditSidebar(item.id);
        });

        // Remove button
        const removeBtn = orderItem.querySelector('.order-item-remove');
        removeBtn.addEventListener('click', () => {
            removeTestFromOrder(item.id);
        });

        // Collapse/expand toggle
        const toggleBtn = orderItem.querySelector('.order-item-toggle');
        const detailsEl = orderItem.querySelector('.order-item-details');
        if (toggleBtn && detailsEl) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
                toggleBtn.setAttribute('aria-expanded', !isExpanded);
                detailsEl.classList.toggle('collapsed', isExpanded);
            });
        }

        // Inline field inputs - handle all editable fields
        const fieldInputs = orderItem.querySelectorAll('.order-field-input, .order-field-select');
        fieldInputs.forEach(input => {
            const fieldName = input.dataset.field;

            if (input.tagName === 'INPUT') {
                input.addEventListener('input', (e) => {
                    item[fieldName] = e.target.value;
                    // Update diagnosis codes if ICD-10 changes
                    if (fieldName === 'icd10') {
                        if (!item.diagnosisCodes) {
                            item.diagnosisCodes = [];
                        }
                        if (e.target.value && !item.diagnosisCodes.includes(e.target.value)) {
                            item.diagnosisCodes = [e.target.value];
                        } else if (!e.target.value) {
                            item.diagnosisCodes = [];
                        }
                        showDiagnosisCombobox(input);
                    }
                });
                // Diagnosis code (ICD-10) combobox: show on focus/input, hide on blur
                if (fieldName === 'icd10') {
                    input.addEventListener('focus', () => showDiagnosisCombobox(input));
                    input.addEventListener('blur', () => setTimeout(hideDiagnosisCombobox, 200));
                }
            } else if (input.tagName === 'SELECT') {
                input.addEventListener('change', (e) => {
                    item[fieldName] = e.target.value;
                });
            }
        });

        // Handle fasting segmented buttons
        const fastingGroup = orderItem.querySelector('.fasting-segmented-group');
        if (fastingGroup) {
            const fastingButtons = fastingGroup.querySelectorAll('.fasting-segmented-btn');
            fastingButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    // Remove active class from all buttons in this group
                    fastingButtons.forEach(b => b.classList.remove('active'));
                    // Add active class to clicked button
                    e.target.classList.add('active');
                    // Update item
                    item.fasting = e.target.dataset.value;
                });
            });
        }

        // Handle "Add to all" link for ICD-10
        const addToAllLink = orderItem.querySelector('.add-to-all-link');
        if (addToAllLink) {
            addToAllLink.addEventListener('click', (e) => {
                e.preventDefault();
                const sourceValue = item.icd10;
                if (sourceValue) {
                    // Propagate to all other order items
                    currentOrder.forEach(orderItem => {
                        if (orderItem.id !== item.id) {
                            orderItem.icd10 = sourceValue;
                            // Update diagnosis codes
                            if (!orderItem.diagnosisCodes) {
                                orderItem.diagnosisCodes = [];
                            }
                            if (sourceValue && !orderItem.diagnosisCodes.includes(sourceValue)) {
                                orderItem.diagnosisCodes = [sourceValue];
                            }
                        }
                    });
                    // Re-render order list to show updated values
                    renderOrderList();
                }
            });
        }

        // Show/hide "Add to all" link based on input value
        const icd10Input = orderItem.querySelector('.order-field-input[data-field="icd10"]');
        if (icd10Input) {
            icd10Input.addEventListener('input', (e) => {
                item.icd10 = e.target.value;
                // Update "Add to all" link visibility
                const addToAllLink = orderItem.querySelector('.add-to-all-link');
                const fieldLabelRow = orderItem.querySelector('.field-label-row');
                if (fieldLabelRow) {
                    if (e.target.value.trim() && !addToAllLink) {
                        // Add the link if value exists
                        const link = document.createElement('a');
                        link.href = '#';
                        link.className = 'add-to-all-link';
                        link.dataset.orderId = item.id;
                        link.dataset.field = 'icd10';
                        link.textContent = 'Add to all';
                        link.addEventListener('click', (e) => {
                            e.preventDefault();
                            const sourceValue = item.icd10;
                            if (sourceValue) {
                                currentOrder.forEach(orderItem => {
                                    if (orderItem.id !== item.id) {
                                        orderItem.icd10 = sourceValue;
                                        if (!orderItem.diagnosisCodes) {
                                            orderItem.diagnosisCodes = [];
                                        }
                                        if (sourceValue && !orderItem.diagnosisCodes.includes(sourceValue)) {
                                            orderItem.diagnosisCodes = [sourceValue];
                                        }
                                    }
                                });
                                renderOrderList();
                            }
                        });
                        fieldLabelRow.appendChild(link);
                    } else if (!e.target.value.trim() && addToAllLink) {
                        // Remove the link if value is empty
                        addToAllLink.remove();
                    }
                }
            });
        }

        // Resolve conflict link
        const resolveLink = orderItem.querySelector('.resolve-link');
        if (resolveLink) {
            resolveLink.addEventListener('click', (e) => {
                e.preventDefault();
                // Remove conflict flag
                item.isConflict = false;
                item.conflictReason = '';
                renderOrderList();
            });
        }

        orderList.appendChild(orderItem);
    });
}

// ==================== CONFLICT DETECTION ====================

function checkConflicts() {
    // Check for duplicates
    const testIdCounts = {};
    currentOrder.forEach(item => {
        testIdCounts[item.testId] = (testIdCounts[item.testId] || 0) + 1;
    });

    currentOrder.forEach(item => {
        if (testIdCounts[item.testId] > 1) {
            item.isConflict = true;
            item.conflictReason = 'Duplicate Order';
        }
    });

    renderOrderList();
}

// ==================== BOTTOM BAR ACTIONS ====================

function updateCost() {
    const total = currentOrder.reduce((sum, item) => {
        return sum + (item.test.estimatedCost || 0);
    }, 0);

    const costText = `$${total.toFixed(2)}`;
    if (totalCost) {
        totalCost.textContent = costText;
    }
    if (totalCostBadge) {
        totalCostBadge.textContent = costText;
    }

    // Update cost summary in order details sidebar if open
    updateCostSummary();
}

function handleSaveDraft() {
    if (currentOrder.length === 0) {
        alert('Please add at least one test to save as a pick list.');
        return;
    }

    // Open modal to get pick list name
    openPickListModal();
}

function openPickListModal() {
    const modal = document.getElementById('pick-list-modal');
    const nameInput = document.getElementById('pick-list-name');

    if (modal && nameInput) {
        modal.classList.add('open');
        nameInput.value = '';
        nameInput.focus();
    }
}

function closePickListModal() {
    const modal = document.getElementById('pick-list-modal');
    if (modal) {
        modal.classList.remove('open');
    }
}

function handleSavePickList() {
    const nameInput = document.getElementById('pick-list-name');
    const name = nameInput ? nameInput.value.trim() : '';

    if (!name) {
        alert('Please enter a name for the pick list.');
        return;
    }

    // Get test IDs from current order
    const testIds = currentOrder.map(item => item.testId);

    // Save pick list
    savePickList(name, testIds);

    // Close modal
    closePickListModal();

    // Re-render panels to show new pick list
    renderPanels();

    // Visual feedback
    const originalText = saveDraftBtn.textContent;
    saveDraftBtn.textContent = 'Saved!';
    saveDraftBtn.style.color = '#0066cc';

    setTimeout(() => {
        saveDraftBtn.textContent = originalText;
        saveDraftBtn.style.color = '';
    }, 2000);
}

function handleSignOrder() {
    if (currentOrder.length === 0) {
        alert('Please add at least one test to the order.');
        return;
    }

    // Open review sidebar instead of submitting directly
    openReviewSidebar();
}

function openReviewSidebar() {
    const sidebar = document.getElementById('review-sidebar');
    if (!sidebar) return;

    // Populate review content
    populateReviewContent();

    // Show sidebar
    sidebar.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Setup event listeners
    setupReviewListeners();
}

function closeReviewSidebar() {
    const sidebar = document.getElementById('review-sidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function setupReviewListeners() {
    // Close button
    const closeBtn = document.getElementById('review-close');
    const cancelBtn = document.getElementById('review-cancel');
    const sidebar = document.getElementById('review-sidebar');
    const overlay = sidebar ? sidebar.querySelector('.sidebar-overlay') : null;

    const closeHandler = () => closeReviewSidebar();

    // Remove existing listeners by cloning
    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', closeHandler);
    }

    if (cancelBtn) {
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        newCancelBtn.addEventListener('click', closeHandler);
    }

    if (overlay) {
        overlay.addEventListener('click', closeHandler);
    }

    // Submit button
    const submitBtn = document.getElementById('review-submit');
    if (submitBtn) {
        const newSubmitBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
        newSubmitBtn.addEventListener('click', () => {
            handleReviewSubmit();
        });
    }
}

function populateReviewContent() {
    const reviewBody = document.getElementById('review-body');
    if (!reviewBody) return;

    // Load order details data
    loadOrderDetailsData();

    let html = '';

    // Order Details Summary (compact)
    html += `
        <div class="review-section">
            <h3 class="review-section-title">Order Details</h3>
            <div class="review-details">
                <div class="review-detail-row">
                    <span class="review-label">Patient:</span>
                    <span class="review-value" contenteditable="true" data-field="patient.name">${orderDetailsData.patient.name || 'Simpson, Olga'}</span>
                </div>
                <div class="review-detail-row">
                    <span class="review-label">DOB:</span>
                    <span class="review-value" contenteditable="true" data-field="patient.dob">${formatDate(orderDetailsData.patient.dob || '1978-12-16')}</span>
                </div>
                <div class="review-detail-row">
                    <span class="review-label">Provider:</span>
                    <span class="review-value" contenteditable="true" data-field="provider.name">${orderDetailsData.provider.name || 'Dr. Smith, John'}</span>
                </div>
                <div class="review-detail-row">
                    <span class="review-label">NPI:</span>
                    <span class="review-value" contenteditable="true" data-field="provider.npi">${orderDetailsData.provider.npi || '1234567890'}</span>
                </div>
                <div class="review-detail-row">
                    <span class="review-label">Account Number:</span>
                    <span class="review-value">${accountInput ? accountInput.value || '12764098' : '12764098'}</span>
                </div>
            </div>
        </div>
    `;

    // Tests Summary - compact two-line cards
    html += `
        <div class="review-section">
            <h3 class="review-section-title">Tests (${currentOrder.length})</h3>
            <div class="review-tests">
    `;

    currentOrder.forEach((item, index) => {
        const test = item.test;
        const primaryDx = (item.diagnosisCodes && item.diagnosisCodes.length > 0)
            ? item.diagnosisCodes[0]
            : (item.icd10 || '');
        const dxDescription = getIcd10Description(primaryDx);
        html += `
            <div class="review-test-item" data-order-id="${item.id}">
                <div class="review-test-line-primary">
                    <span class="review-test-name">${test.name}</span>
                    <span class="review-test-code">${test.cptCode}</span>
                </div>
                <div class="review-test-line-secondary">
                    <span class="review-test-dx-label">ICD-10</span>
                    <span class="review-test-dx-value review-value" contenteditable="true" data-order-id="${item.id}" data-field="icd10">${primaryDx}</span>${dxDescription ? ` <span class="review-test-dx-desc">${dxDescription}</span>` : ''}
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    // AOEs Section (if any tests have AOEs)
    const hasAOEs = currentOrder.some(item => item.specialInstructions || item.clinicalIndication);
    if (hasAOEs) {
        html += `
            <div class="review-section">
                <h3 class="review-section-title">AOEs</h3>
                <div class="review-aoes">
        `;

        currentOrder.forEach((item) => {
            if (item.specialInstructions || item.clinicalIndication) {
                html += `
                    <div class="review-aoes-item">
                        <div class="review-detail-row">
                            <span class="review-label">${item.test.name}:</span>
                            <span class="review-value" contenteditable="true" data-order-id="${item.id}" data-field="specialInstructions">${item.specialInstructions || item.clinicalIndication || ''}</span>
                        </div>
                    </div>
                `;
            }
        });

        html += `
                </div>
            </div>
        `;
    }

    reviewBody.innerHTML = html;

    // Setup inline editing
    setupReviewInlineEditing();
}

function setupReviewInlineEditing() {
    const editableElements = document.querySelectorAll('#review-body [contenteditable="true"]');
    editableElements.forEach(element => {
        element.addEventListener('blur', (e) => {
            const field = e.target.dataset.field;
            const orderId = e.target.dataset.orderId;

            if (orderId) {
                // Update order item
                const orderItem = currentOrder.find(item => item.id === orderId);
                if (orderItem) {
                    orderItem[field] = e.target.textContent.trim();
                }
            } else {
                // Update order details
                const parts = field.split('.');
                if (parts.length === 2) {
                    orderDetailsData[parts[0]][parts[1]] = e.target.textContent.trim();
                }
            }
        });

        // Add visual feedback
        element.addEventListener('focus', (e) => {
            e.target.style.backgroundColor = '#f0f7ff';
            e.target.style.outline = '2px solid #0066cc';
        });

        element.addEventListener('blur', (e) => {
            e.target.style.backgroundColor = '';
            e.target.style.outline = '';
        });
    });
}

function handleReviewSubmit() {
    // Check for unresolved conflicts
    const conflicts = currentOrder.filter(item => item.isConflict);
    if (conflicts.length > 0) {
        const proceed = confirm(`There are ${conflicts.length} conflict(s) in your order. Do you want to proceed anyway?`);
        if (!proceed) {
            return;
        }
    }

    // Prepare order data for submission
    const orderData = {
        accountNumber: accountInput ? accountInput.value : '12764098',
        orderDetails: orderDetailsData,
        tests: currentOrder.map(item => ({
            testId: item.testId,
            testName: item.test.name,
            cptCode: item.test.cptCode,
            priority: item.priority,
            fasting: item.fasting,
            icd10: item.icd10,
            diagnosisCodes: item.diagnosisCodes || [],
            specimen: item.specimen || null,
            clinicalIndication: item.clinicalIndication || '',
            specialInstructions: item.specialInstructions || '',
            frequency: item.frequency || 'once',
            startDate: item.startDate || '',
            endDate: item.endDate || ''
        })),
        totalCost: currentOrder.reduce((sum, item) => sum + (item.test.estimatedCost || 0), 0),
        timestamp: new Date().toISOString()
    };

    // Log to console (in real app, this would send to EHR API)
    console.log('Order submitted:', orderData);

    // Close review sidebar
    closeReviewSidebar();

    // Show success notification
    showSuccessNotification(`Order submitted successfully!\n\n${currentOrder.length} test(s) ordered.`);

    // Clear order
    currentOrder = [];
    renderOrderList();
    updateCost();
    if (searchInput && !searchInput.disabled) {
        searchInput.focus();
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    // Convert YYYY-MM-DD to MM/DD/YYYY
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

function showSuccessNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">✓</span>
            <span class="notification-message">${message.replace(/\n/g, '<br>')}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Hide and remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// ==================== EDIT SIDEBAR ====================

let currentEditingOrderId = null;

function openEditSidebar(orderId) {
    const orderItem = currentOrder.find(item => item.id === orderId);
    if (!orderItem) return;

    currentEditingOrderId = orderId;
    const sidebar = document.getElementById('edit-sidebar');
    const test = orderItem.test;

    // Update sidebar title
    document.getElementById('sidebar-title').textContent = `Edit: ${test.name}`;

    // Populate form fields
    document.getElementById('edit-test-name').value = test.name;
    document.getElementById('edit-cpt-code').value = test.cptCode;
    document.getElementById('edit-priority').value = orderItem.priority;
    document.getElementById('edit-clinical-indication').value = orderItem.clinicalIndication || '';
    document.getElementById('edit-special-instructions').value = orderItem.specialInstructions || '';
    document.getElementById('edit-frequency').value = orderItem.frequency || 'once';
    document.getElementById('edit-start-date').value = orderItem.startDate || '';
    document.getElementById('edit-end-date').value = orderItem.endDate || '';

    // Populate specimen dropdown
    const specimenSelect = document.getElementById('edit-specimen');
    specimenSelect.innerHTML = '<option value="">N/A</option>';
    if (test.requiresSpecimen && test.specimenOptions) {
        test.specimenOptions.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option;
            optionEl.textContent = option;
            if (orderItem.specimen === option) {
                optionEl.selected = true;
            }
            specimenSelect.appendChild(optionEl);
        });
    }

    // Populate diagnosis codes
    renderDiagnosisCodes(orderItem.diagnosisCodes || (orderItem.icd10 ? [orderItem.icd10] : []));

    // Clear upload documents list and file input when opening
    const fileInput = document.getElementById('edit-supporting-documents');
    const docsList = document.getElementById('edit-supporting-documents-list');
    if (fileInput) fileInput.value = '';
    if (docsList) docsList.innerHTML = '';

    // OmniSeq INSIGHT: show/hide and populate specific AOE section
    const omniseqSection = document.getElementById('omniseq-aoes-section');
    const specimenGroup = document.getElementById('edit-specimen-group');
    const isOmniSeq = test.id === 'omniseq-insight-001';
    if (omniseqSection) omniseqSection.style.display = isOmniSeq ? 'block' : 'none';
    if (specimenGroup) specimenGroup.style.display = isOmniSeq ? 'none' : 'block';
    if (isOmniSeq) {
        const o = orderItem.omniseqAoes || {};
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
        set('edit-omniseq-hospital-status', o.hospitalStatus || 'non-hospital');
        set('edit-omniseq-specimen', orderItem.specimen || '');
        set('edit-omniseq-treating-physician', o.treatingPhysicianSame);
        set('edit-omniseq-sample-collection-site', o.sampleCollectionSite);
        set('edit-omniseq-clinical-info', o.clinicalInfo);
        set('edit-omniseq-tumor-type', o.tumorType);
        set('edit-omniseq-submitting-specimen', o.submittingSpecimen);
        set('edit-omniseq-specimen-id', o.specimenId);
        set('edit-omniseq-specimen-type', o.specimenType || 'paraffin-block');
        set('edit-omniseq-block-quantity', o.blockQuantity || 'test-best-block');
        // Populate OmniSeq specimen dropdown (same options as main specimen when test has specimen options)
        const omniseqSpecimenEl = document.getElementById('edit-omniseq-specimen');
        if (omniseqSpecimenEl) {
            omniseqSpecimenEl.innerHTML = '<option value="">N/A</option>';
            if (test.requiresSpecimen && test.specimenOptions && test.specimenOptions.length) {
                test.specimenOptions.forEach(opt => {
                    const optionEl = document.createElement('option');
                    optionEl.value = opt;
                    optionEl.textContent = opt;
                    if (orderItem.specimen === opt) optionEl.selected = true;
                    omniseqSpecimenEl.appendChild(optionEl);
                });
            }
        }
    }

    // Show sidebar
    sidebar.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Setup sidebar event listeners
    setupSidebarListeners();
}

function closeEditSidebar() {
    const sidebar = document.getElementById('edit-sidebar');
    sidebar.classList.remove('open');
    document.body.style.overflow = '';
    currentEditingOrderId = null;
}

function setupSidebarListeners() {
    // Close button
    const closeBtn = document.getElementById('sidebar-close');
    const cancelBtn = document.getElementById('sidebar-cancel');
    const sidebar = document.getElementById('edit-sidebar');
    const overlay = sidebar ? sidebar.querySelector('.sidebar-overlay') : null;

    const closeHandler = () => closeEditSidebar();

    // Remove existing listeners by cloning
    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', closeHandler);
    }

    if (cancelBtn) {
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        newCancelBtn.addEventListener('click', closeHandler);
    }

    if (overlay) {
        overlay.addEventListener('click', closeHandler);
    }

    // Add diagnosis code button
    const addDiagnosisBtn = document.getElementById('add-diagnosis-btn');
    const newAddBtn = addDiagnosisBtn.cloneNode(true);
    addDiagnosisBtn.parentNode.replaceChild(newAddBtn, addDiagnosisBtn);
    newAddBtn.addEventListener('click', () => {
        addDiagnosisCodeInput();
    });

    // Save button
    const saveBtn = document.getElementById('sidebar-save');
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    newSaveBtn.addEventListener('click', () => {
        saveEditSidebar();
    });

    // Upload Supporting Documents: trigger button opens file picker
    const uploadTrigger = document.getElementById('edit-upload-docs-trigger');
    const supportingDocsInput = document.getElementById('edit-supporting-documents');
    const supportingDocsList = document.getElementById('edit-supporting-documents-list');
    if (uploadTrigger && supportingDocsInput) {
        uploadTrigger.addEventListener('click', () => supportingDocsInput.click());
    }
    if (supportingDocsInput && supportingDocsList) {
        supportingDocsInput.addEventListener('change', () => {
            const files = Array.from(supportingDocsInput.files || []);
            supportingDocsList.innerHTML = files.length === 0
                ? ''
                : files.map(f => `<div class="edit-doc-item">${(f.name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`).join('');
        });
    }

    // Handle diagnosis code removal
    document.querySelectorAll('.diagnosis-code-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const container = e.target.closest('.diagnosis-code-item');
            container.remove();
        });
    });
}

function renderDiagnosisCodes(codes) {
    const container = document.getElementById('diagnosis-codes-container');
    container.innerHTML = '';

    if (codes.length === 0) {
        addDiagnosisCodeInput();
    } else {
        codes.forEach(code => {
            addDiagnosisCodeInput(code);
        });
    }
}

function addDiagnosisCodeInput(value = '') {
    const container = document.getElementById('diagnosis-codes-container');
    const codeItem = document.createElement('div');
    codeItem.className = 'diagnosis-code-item';

    codeItem.innerHTML = `
        <input 
            type="text" 
            class="diagnosis-code-input" 
            placeholder="E11.9"
            value="${value}"
            aria-label="Diagnosis code"
        >
        <button type="button" class="diagnosis-code-remove" aria-label="Remove diagnosis code">×</button>
    `;

    const removeBtn = codeItem.querySelector('.diagnosis-code-remove');
    removeBtn.addEventListener('click', () => {
        codeItem.remove();
    });

    container.appendChild(codeItem);
}

function saveEditSidebar() {
    if (!currentEditingOrderId) return;

    const orderItem = currentOrder.find(item => item.id === currentEditingOrderId);
    if (!orderItem) return;

    // Collect form data
    orderItem.priority = document.getElementById('edit-priority').value;
    orderItem.specimen = document.getElementById('edit-specimen').value || '';
    orderItem.clinicalIndication = document.getElementById('edit-clinical-indication').value;
    orderItem.specialInstructions = document.getElementById('edit-special-instructions').value;
    orderItem.frequency = document.getElementById('edit-frequency').value;
    orderItem.startDate = document.getElementById('edit-start-date').value;
    orderItem.endDate = document.getElementById('edit-end-date').value;

    // Collect diagnosis codes
    const diagnosisInputs = document.querySelectorAll('.diagnosis-code-input');
    const diagnosisCodes = Array.from(diagnosisInputs)
        .map(input => input.value.trim())
        .filter(code => code !== '');

    orderItem.diagnosisCodes = diagnosisCodes;
    // Keep backward compatibility with icd10 field
    orderItem.icd10 = diagnosisCodes[0] || '';

    // OmniSeq INSIGHT: save specific AOE fields
    const test = orderItem.test;
    if (test && test.id === 'omniseq-insight-001') {
        const get = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
        orderItem.specimen = get('edit-omniseq-specimen') || '';
        orderItem.omniseqAoes = {
            hospitalStatus: get('edit-omniseq-hospital-status') || 'non-hospital',
            treatingPhysicianSame: get('edit-omniseq-treating-physician'),
            sampleCollectionSite: get('edit-omniseq-sample-collection-site'),
            clinicalInfo: get('edit-omniseq-clinical-info'),
            tumorType: get('edit-omniseq-tumor-type'),
            submittingSpecimen: get('edit-omniseq-submitting-specimen'),
            specimenId: get('edit-omniseq-specimen-id'),
            specimenType: get('edit-omniseq-specimen-type') || 'paraffin-block',
            blockQuantity: get('edit-omniseq-block-quantity') || 'test-best-block'
        };
    }

    // Update priority if it changed
    if (orderItem.priority !== selectedPriority) {
        // If this was the only item, update global priority
        const allSamePriority = currentOrder.every(item => item.priority === orderItem.priority);
        if (allSamePriority) {
            selectedPriority = orderItem.priority;
            document.querySelector(`input[name="priority"][value="${orderItem.priority}"]`).checked = true;
        }
    }

    // Re-render order list to reflect changes
    renderOrderList();

    // Close sidebar
    closeEditSidebar();
}

// ==================== ORDER DETAILS SIDEBAR ====================

// Order details state
let orderDetailsData = {
    patient: {
        firstName: 'Olga',
        lastName: 'Simpson',
        name: 'Simpson, Olga',
        dob: '1978-12-16',
        gender: 'female',
        address: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
        phone: '(555) 123-4567',
        email: 'olga.simpson@example.com'
    },
    provider: {
        name: 'Dr. Smith, John',
        npi: '1234567890',
        dept: 'Internal Medicine',
        phone: '(555) 987-6543',
        address: '123 Medical Center Drive, Suite 200, Springfield, IL 62701'
    },
    insurance: {
        primary: 'Blue Cross Blue Shield',
        memberId: 'BC123456789',
        group: 'GRP-98765',
        policyHolder: 'Simpson, Olga',
        relationship: 'self',
        secondary: 'Medicare'
    },
    order: {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        location: '',
        notes: '',
        urgent: false,
        billMethod: 'patient',
        workmansComp: 'no',
        ehrControlNumber: ''
    },
    guarantor: {
        addGuarantor: false,
        lastName: '',
        firstName: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        email: '',
        relationship: ''
    }
};

function initializeOrderDetailsAccordion() {
    const accordionToggle = document.getElementById('order-details-accordion-toggle');
    const accordionContent = document.getElementById('order-details-accordion-content');

    if (accordionToggle && accordionContent) {
        // Check if we have old empty data in localStorage and clear it to use new defaults
        try {
            const saved = localStorage.getItem('orderDetailsData');
            if (saved) {
                const savedData = JSON.parse(saved);
                // If saved data has empty patient name, clear it to use new defaults
                const p = savedData.patient;
                if (!p || ((!p.firstName || p.firstName.trim() === '') && (!p.lastName || p.lastName.trim() === '') && (!p.name || p.name.trim() === ''))) {
                    localStorage.removeItem('orderDetailsData');
                }
            }
        } catch (e) {
            // Ignore errors
        }

        // Load saved data (only if exists with actual data, otherwise use defaults)
        loadOrderDetailsData();

        // Populate form fields with current data (defaults or saved)
        populateOrderDetailsForm();

        // Update cost summary
        updateCostSummary();

        // Setup accordion toggle
        accordionToggle.addEventListener('click', () => {
            const isExpanded = accordionToggle.getAttribute('aria-expanded') === 'true';
            accordionToggle.setAttribute('aria-expanded', !isExpanded);

            if (!isExpanded) {
                accordionContent.classList.add('expanded');
                // Hide NPI warning when accordion is expanded
                hideNPIWarning();
            } else {
                accordionContent.classList.remove('expanded');
            }
        });

        // Setup form auto-save
        const form = document.getElementById('order-details-form');
        if (form) {
            form.addEventListener('input', () => {
                saveOrderDetailsData();
            });
            form.addEventListener('change', () => {
                saveOrderDetailsData();
            });
        }

        // Add Guarantor checkbox: show/hide Guarantor Information section
        const addGuarantorCheckbox = document.getElementById('add-guarantor-checkbox');
        const guarantorSection = document.getElementById('guarantor-section');
        if (addGuarantorCheckbox && guarantorSection) {
            addGuarantorCheckbox.addEventListener('change', () => {
                guarantorSection.style.display = addGuarantorCheckbox.checked ? 'block' : 'none';
            });
        }
    }
}

function openOrderDetailsSidebar() {
    // Legacy function - now handled by accordion
    // Keep for backward compatibility if needed
    const accordionToggle = document.getElementById('order-details-accordion-toggle');
    const accordionContent = document.getElementById('order-details-accordion-content');

    if (accordionToggle && accordionContent) {
        const isExpanded = accordionToggle.getAttribute('aria-expanded') === 'true';
        if (!isExpanded) {
            accordionToggle.click();
        }
    }
}

function closeOrderDetailsSidebar() {
    const sidebar = document.getElementById('order-details-sidebar');
    sidebar.classList.remove('open');
    document.body.style.overflow = '';
}

function setupOrderDetailsListeners() {
    // This function is now handled by initializeOrderDetailsAccordion
    // Keeping for backward compatibility
}

function populateOrderDetailsForm() {
    // Patient Demographics
    const firstNameEl = document.getElementById('patient-first-name');
    const lastNameEl = document.getElementById('patient-last-name');
    if (firstNameEl) firstNameEl.value = orderDetailsData.patient.firstName || '';
    if (lastNameEl) lastNameEl.value = orderDetailsData.patient.lastName || '';
    document.getElementById('patient-dob').value = orderDetailsData.patient.dob || '';
    document.getElementById('patient-gender').value = orderDetailsData.patient.gender || '';
    document.getElementById('patient-address').value = orderDetailsData.patient.address || '';
    document.getElementById('patient-city').value = orderDetailsData.patient.city || '';
    document.getElementById('patient-state').value = orderDetailsData.patient.state || '';
    document.getElementById('patient-zip').value = orderDetailsData.patient.zip || '';
    document.getElementById('patient-phone').value = orderDetailsData.patient.phone || '';
    document.getElementById('patient-email').value = orderDetailsData.patient.email || '';

    // Add Guarantor checkbox and Guarantor Information
    const addGuarantorCheckbox = document.getElementById('add-guarantor-checkbox');
    const guarantorSection = document.getElementById('guarantor-section');
    if (addGuarantorCheckbox) {
        addGuarantorCheckbox.checked = orderDetailsData.guarantor && orderDetailsData.guarantor.addGuarantor;
    }
    if (guarantorSection && addGuarantorCheckbox) {
        guarantorSection.style.display = addGuarantorCheckbox.checked ? 'block' : 'none';
    }
    const g = orderDetailsData.guarantor || {};
    const guarantorLast = document.getElementById('guarantor-last-name');
    const guarantorFirst = document.getElementById('guarantor-first-name');
    if (guarantorLast) guarantorLast.value = g.lastName || '';
    if (guarantorFirst) guarantorFirst.value = g.firstName || '';
    const guarantorAddr = document.getElementById('guarantor-address');
    if (guarantorAddr) guarantorAddr.value = g.address || '';
    const guarantorCity = document.getElementById('guarantor-city');
    if (guarantorCity) guarantorCity.value = g.city || '';
    const guarantorState = document.getElementById('guarantor-state');
    if (guarantorState) guarantorState.value = g.state || '';
    const guarantorZip = document.getElementById('guarantor-zip');
    if (guarantorZip) guarantorZip.value = g.zip || '';
    const guarantorPhone = document.getElementById('guarantor-phone');
    if (guarantorPhone) guarantorPhone.value = g.phone || '';
    const guarantorEmail = document.getElementById('guarantor-email');
    if (guarantorEmail) guarantorEmail.value = g.email || '';
    const guarantorRel = document.getElementById('guarantor-relationship');
    if (guarantorRel) guarantorRel.value = g.relationship || '';

    // Provider Information
    document.getElementById('provider-name').value = orderDetailsData.provider.name || '';
    document.getElementById('provider-npi').value = orderDetailsData.provider.npi || '';

    // Insurance
    document.getElementById('insurance-primary').value = orderDetailsData.insurance.primary || '';
    document.getElementById('insurance-member-id').value = orderDetailsData.insurance.memberId || '';
    document.getElementById('insurance-group').value = orderDetailsData.insurance.group || '';
    document.getElementById('insurance-policy-holder').value = orderDetailsData.insurance.policyHolder || '';
    document.getElementById('insurance-relationship').value = orderDetailsData.insurance.relationship || 'self';
    document.getElementById('insurance-secondary').value = orderDetailsData.insurance.secondary || '';

    // Order Information
    const orderDateEl = document.getElementById('order-date');
    if (orderDateEl) orderDateEl.value = orderDetailsData.order.date || new Date().toISOString().split('T')[0];
    const collectionDtEl = document.getElementById('order-collection-datetime');
    if (collectionDtEl) {
        const d = orderDetailsData.order.date || new Date().toISOString().split('T')[0];
        const t = orderDetailsData.order.time || new Date().toTimeString().slice(0, 5);
        collectionDtEl.value = d + 'T' + t;
    }
    const orderLocationEl = document.getElementById('order-location');
    if (orderLocationEl) orderLocationEl.value = orderDetailsData.order.location || '';
    const workmansCompEl = document.getElementById('order-workmans-comp');
    if (workmansCompEl) workmansCompEl.value = orderDetailsData.order.workmansComp || 'no';
    const ehrControlNumberEl = document.getElementById('order-ehr-control-number');
    if (ehrControlNumberEl) ehrControlNumberEl.value = orderDetailsData.order.ehrControlNumber || '';
    document.getElementById('order-notes').value = orderDetailsData.order.notes || '';

    // Bill Method
    const billMethodEl = document.getElementById('bill-method');
    if (billMethodEl) {
        billMethodEl.value = orderDetailsData.order.billMethod || 'patient';
    }
}

function saveOrderDetails() {
    // Collect form data
    const firstNameEl = document.getElementById('patient-first-name');
    const lastNameEl = document.getElementById('patient-last-name');
    orderDetailsData.patient.firstName = firstNameEl ? firstNameEl.value : '';
    orderDetailsData.patient.lastName = lastNameEl ? lastNameEl.value : '';
    orderDetailsData.patient.name = [orderDetailsData.patient.lastName, orderDetailsData.patient.firstName].filter(Boolean).join(', ') || '';
    orderDetailsData.patient.dob = document.getElementById('patient-dob').value;
    orderDetailsData.patient.gender = document.getElementById('patient-gender').value;
    orderDetailsData.patient.address = document.getElementById('patient-address').value;
    orderDetailsData.patient.city = document.getElementById('patient-city').value;
    orderDetailsData.patient.state = document.getElementById('patient-state').value;
    orderDetailsData.patient.zip = document.getElementById('patient-zip').value;
    orderDetailsData.patient.phone = document.getElementById('patient-phone').value;
    orderDetailsData.patient.email = document.getElementById('patient-email').value;

    const addGuarantorEl = document.getElementById('add-guarantor-checkbox');
    if (orderDetailsData.guarantor) {
        orderDetailsData.guarantor.addGuarantor = addGuarantorEl ? addGuarantorEl.checked : false;
        orderDetailsData.guarantor.lastName = (document.getElementById('guarantor-last-name') || {}).value || '';
        orderDetailsData.guarantor.firstName = (document.getElementById('guarantor-first-name') || {}).value || '';
        orderDetailsData.guarantor.address = (document.getElementById('guarantor-address') || {}).value || '';
        orderDetailsData.guarantor.city = (document.getElementById('guarantor-city') || {}).value || '';
        orderDetailsData.guarantor.state = (document.getElementById('guarantor-state') || {}).value || '';
        orderDetailsData.guarantor.zip = (document.getElementById('guarantor-zip') || {}).value || '';
        orderDetailsData.guarantor.phone = (document.getElementById('guarantor-phone') || {}).value || '';
        orderDetailsData.guarantor.email = (document.getElementById('guarantor-email') || {}).value || '';
        orderDetailsData.guarantor.relationship = (document.getElementById('guarantor-relationship') || {}).value || '';
    }

    orderDetailsData.provider.name = document.getElementById('provider-name').value;
    orderDetailsData.provider.npi = document.getElementById('provider-npi').value;

    orderDetailsData.insurance.primary = document.getElementById('insurance-primary').value;
    orderDetailsData.insurance.memberId = document.getElementById('insurance-member-id').value;
    orderDetailsData.insurance.group = document.getElementById('insurance-group').value;
    orderDetailsData.insurance.policyHolder = document.getElementById('insurance-policy-holder').value;
    orderDetailsData.insurance.relationship = document.getElementById('insurance-relationship').value;
    orderDetailsData.insurance.secondary = document.getElementById('insurance-secondary').value;

    const orderDateEl = document.getElementById('order-date');
    const collectionDtEl = document.getElementById('order-collection-datetime');
    if (orderDateEl && orderDateEl.value) {
        orderDetailsData.order.date = orderDateEl.value;
    }
    if (collectionDtEl && collectionDtEl.value) {
        const v = collectionDtEl.value;
        orderDetailsData.order.date = v.slice(0, 10);
        orderDetailsData.order.time = v.slice(11, 16);
    }
    const orderLocationEl = document.getElementById('order-location');
    orderDetailsData.order.location = orderLocationEl ? orderLocationEl.value : '';
    const workmansCompEl = document.getElementById('order-workmans-comp');
    orderDetailsData.order.workmansComp = workmansCompEl ? workmansCompEl.value : 'no';
    const ehrControlNumberEl = document.getElementById('order-ehr-control-number');
    orderDetailsData.order.ehrControlNumber = ehrControlNumberEl ? ehrControlNumberEl.value : '';
    orderDetailsData.order.notes = document.getElementById('order-notes').value;

    const billMethodEl = document.getElementById('bill-method');
    if (billMethodEl) {
        orderDetailsData.order.billMethod = billMethodEl.value;
    }

    // Save to localStorage
    saveOrderDetailsData();

    // Show confirmation (if save button exists in sidebar)
    const saveBtn = document.getElementById('order-details-save');
    if (saveBtn) {
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saved!';
        saveBtn.style.backgroundColor = '#3D9B3D';

        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.backgroundColor = '';
        }, 1500);
    }
}

function saveOrderDetailsData() {
    try {
        localStorage.setItem('orderDetailsData', JSON.stringify(orderDetailsData));
    } catch (e) {
        console.warn('Could not save order details to localStorage:', e);
    }
}

function loadOrderDetailsData() {
    try {
        const saved = localStorage.getItem('orderDetailsData');
        if (saved) {
            const savedData = JSON.parse(saved);
            // Only merge if there's actual saved data with patient name
            // If saved data has empty patient name, use our defaults instead
            const p = savedData.patient;
            const hasPatientName = p && (p.name && p.name.trim() !== '' || p.firstName && p.firstName.trim() !== '' || p.lastName && p.lastName.trim() !== '');
            if (hasPatientName) {
                // Deep merge to preserve defaults for fields not in saved data
                const merged = { ...savedData.patient };
                if (merged.name && (!merged.firstName || !merged.lastName)) {
                    const parts = merged.name.split(',').map(s => s.trim());
                    if (parts.length >= 2) {
                        merged.lastName = merged.lastName || parts[0];
                        merged.firstName = merged.firstName || parts[1];
                    }
                }
                orderDetailsData = {
                    patient: { ...orderDetailsData.patient, ...merged },
                    provider: { ...orderDetailsData.provider, ...savedData.provider },
                    insurance: { ...orderDetailsData.insurance, ...savedData.insurance },
                    order: { ...orderDetailsData.order, ...savedData.order }
                };
            }
            // If saved data has empty patient name, keep defaults (don't merge)
        }
    } catch (e) {
        console.warn('Could not load order details from localStorage:', e);
    }
}

function updateCostSummary() {
    const subtotal = currentOrder.reduce((sum, item) => {
        return sum + (item.test.estimatedCost || 0);
    }, 0);

    // Mock insurance coverage (80% coverage)
    const coverage = subtotal * 0.8;
    const patientCost = subtotal - coverage;

    const subtotalEl = document.getElementById('cost-subtotal');
    const coverageEl = document.getElementById('cost-coverage');
    const patientCostEl = document.getElementById('cost-patient');

    if (subtotalEl) {
        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    }
    if (coverageEl) {
        coverageEl.textContent = `$${coverage.toFixed(2)}`;
    }
    if (patientCostEl) {
        patientCostEl.textContent = `$${patientCost.toFixed(2)}`;
    }
}

// ==================== NPI WARNING ====================

function showNPIWarning() {
    const npiWarning = document.getElementById('npi-warning');
    if (npiWarning) {
        npiWarning.style.display = 'flex';
    }
}

function hideNPIWarning() {
    const npiWarning = document.getElementById('npi-warning');
    if (npiWarning) {
        npiWarning.style.display = 'none';
    }
}
