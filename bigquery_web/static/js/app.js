/**
 * BigQuery Release Notes - Vanilla JavaScript Application
 */

(function () {
  'use strict';

  // Application State
  const state = {
    notes: [],
    filteredNotes: [],
    metadata: {},
    activeTag: 'All',
    searchQuery: '',
    sortOrder: 'desc',
    expandedCards: new Set(),
    isLoading: false,
  };

  // DOM Elements
  const feedContainer = document.getElementById('feed-container');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const tagsContainer = document.getElementById('tags-container');
  const refreshBtn = document.getElementById('refresh-btn');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const toggleAllBtn = document.getElementById('toggle-all-btn');
  const totalCountEl = document.getElementById('total-count');
  const lastUpdatedEl = document.getElementById('last-updated');
  const lastFetchedEl = document.getElementById('last-fetched');

  /**
   * Initialize the application
   */
  function init() {
    initTheme();
    setupEventListeners();
    fetchNotes(false);
  }

  /**
   * Theme switcher
   */
  function initTheme() {
    const savedTheme = localStorage.getItem('bq-theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bq-theme', theme);
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = theme === 'dark' 
        ? '☀️ <span class="hide-mobile">Light</span>' 
        : '🌙 <span class="hide-mobile">Dark</span>';
    }
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }

  /**
   * Setup UI Event Listeners
   */
  function setupEventListeners() {
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase().trim();
        applyFilters();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        state.sortOrder = e.target.value;
        applyFilters();
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        fetchNotes(true);
      });
    }

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', toggleTheme);
    }

    if (toggleAllBtn) {
      toggleAllBtn.addEventListener('click', () => {
        const allExpanded = state.expandedCards.size === state.filteredNotes.length;
        if (allExpanded) {
          state.expandedCards.clear();
          toggleAllBtn.textContent = 'Expand All';
        } else {
          state.filteredNotes.forEach(note => state.expandedCards.add(note.id));
          toggleAllBtn.textContent = 'Collapse All';
        }
        renderFeed();
      });
    }
  }

  /**
   * Fetch notes from the Flask API
   */
  async function fetchNotes(forceRefresh = false) {
    state.isLoading = true;
    renderLoading();

    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = '🔄 Fetching...';
    }

    try {
      const url = `/api/notes${forceRefresh ? '?refresh=true' : ''}`;
      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch release notes.');
      }

      state.metadata = json.data;
      state.notes = json.data.entries || [];
      
      // Initially expand all notes
      state.expandedCards = new Set(state.notes.map(n => n.id));

      updateMetadataDisplay();
      renderTagFilters();
      applyFilters();
    } catch (err) {
      renderError(err.message);
    } finally {
      state.isLoading = false;
      if (refreshBtn) {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '🔄 Refresh Feed';
      }
    }
  }

  /**
   * Update header metadata stats
   */
  function updateMetadataDisplay() {
    if (totalCountEl) {
      totalCountEl.textContent = state.notes.length;
    }
    if (lastUpdatedEl) {
      lastUpdatedEl.textContent = state.metadata.updated_formatted || state.metadata.updated || 'N/A';
    }
    if (lastFetchedEl) {
      lastFetchedEl.textContent = state.metadata.fetched_at || 'Just now';
    }
  }

  /**
   * Render dynamic tag filter chips
   */
  function renderTagFilters() {
    if (!tagsContainer) return;

    // Collect unique tags
    const tagSet = new Set();
    state.notes.forEach(note => {
      (note.tags || []).forEach(tag => tagSet.add(tag));
    });

    const standardTags = ['All', 'Feature', 'Change', 'Preview', 'GA', 'Deprecated'];
    const otherTags = Array.from(tagSet).filter(t => !standardTags.includes(t));
    const allDisplayTags = [...standardTags, ...otherTags];

    tagsContainer.innerHTML = '';
    const label = document.createElement('span');
    label.className = 'filter-label';
    label.textContent = 'Category:';
    tagsContainer.appendChild(label);

    allDisplayTags.forEach(tag => {
      const chip = document.createElement('button');
      chip.className = `chip ${state.activeTag === tag ? 'active' : ''}`;
      chip.textContent = tag;
      chip.addEventListener('click', () => {
        state.activeTag = tag;
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        applyFilters();
      });
      tagsContainer.appendChild(chip);
    });
  }

  /**
   * Filter and sort release notes
   */
  function applyFilters() {
    let result = [...state.notes];

    // Filter by tag
    if (state.activeTag !== 'All') {
      result = result.filter(note => 
        (note.tags || []).map(t => t.toLowerCase()).includes(state.activeTag.toLowerCase())
      );
    }

    // Filter by search query
    if (state.searchQuery) {
      result = result.filter(note => {
        const titleMatch = note.title.toLowerCase().includes(state.searchQuery);
        const summaryMatch = (note.summary || '').toLowerCase().includes(state.searchQuery);
        const htmlMatch = (note.content_html || '').toLowerCase().includes(state.searchQuery);
        return titleMatch || summaryMatch || htmlMatch;
      });
    }

    // Sort order
    result.sort((a, b) => {
      const dateA = new Date(a.updated).getTime() || 0;
      const dateB = new Date(b.updated).getTime() || 0;
      return state.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    state.filteredNotes = result;
    renderFeed();
  }

  /**
   * Render the release notes list
   */
  function renderFeed() {
    if (!feedContainer) return;

    if (state.filteredNotes.length === 0) {
      feedContainer.innerHTML = `
        <div class="empty-state">
          <h3>No release notes found</h3>
          <p>Try adjusting your search keywords or category filters.</p>
        </div>
      `;
      return;
    }

    feedContainer.innerHTML = '';

    state.filteredNotes.forEach(note => {
      const isExpanded = state.expandedCards.has(note.id);
      const card = document.createElement('article');
      card.className = 'release-card';
      card.id = `note-${note.id.split('#')[1] || note.id}`;

      // Tag badges HTML
      const tagsHtml = (note.tags || []).map(tag => {
        const tagClass = getTagClass(tag);
        return `<span class="tag-badge ${tagClass}">${escapeHtml(tag)}</span>`;
      }).join(' ');

      card.innerHTML = `
        <div class="card-header">
          <div class="card-title-group">
            <h2 class="card-title">${escapeHtml(note.title)}</h2>
            <div class="card-date">Updated on: ${escapeHtml(note.date_formatted || note.updated)}</div>
            <div class="tags-row">${tagsHtml}</div>
          </div>
          <div class="card-actions">
            ${note.link ? `<a href="${escapeHtml(note.link)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-icon" title="Open official documentation">🔗</a>` : ''}
            <button class="btn btn-secondary btn-icon copy-btn" title="Copy anchor link">📋</button>
            <button class="btn btn-secondary toggle-card-btn">
              ${isExpanded ? 'Collapse ▲' : 'Expand ▼'}
            </button>
          </div>
        </div>
        <div class="card-body" style="display: ${isExpanded ? 'block' : 'none'};">
          ${note.content_html}
        </div>
      `;

      // Event listener for expand/collapse button
      const toggleBtn = card.querySelector('.toggle-card-btn');
      const cardBody = card.querySelector('.card-body');
      toggleBtn.addEventListener('click', () => {
        if (state.expandedCards.has(note.id)) {
          state.expandedCards.delete(note.id);
          cardBody.style.display = 'none';
          toggleBtn.textContent = 'Expand ▼';
        } else {
          state.expandedCards.add(note.id);
          cardBody.style.display = 'block';
          toggleBtn.textContent = 'Collapse ▲';
        }
      });

      // Event listener for copy link
      const copyBtn = card.querySelector('.copy-btn');
      copyBtn.addEventListener('click', () => {
        const linkToCopy = note.link || window.location.href;
        navigator.clipboard.writeText(linkToCopy).then(() => {
          copyBtn.textContent = '✓';
          setTimeout(() => { copyBtn.textContent = '📋'; }, 2000);
        });
      });

      feedContainer.appendChild(card);
    });
  }

  function getTagClass(tag) {
    const t = tag.toLowerCase();
    if (t.includes('feature')) return 'tag-feature';
    if (t.includes('change')) return 'tag-change';
    if (t.includes('preview')) return 'tag-preview';
    if (t.includes('ga') || t.includes('generally')) return 'tag-ga';
    if (t.includes('deprecat')) return 'tag-deprecated';
    return 'tag-default';
  }

  function renderLoading() {
    if (!feedContainer) return;
    feedContainer.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <h3>Fetching BigQuery Release Notes...</h3>
        <p>Connecting to Google Cloud feed...</p>
      </div>
    `;
  }

  function renderError(message) {
    if (!feedContainer) return;
    feedContainer.innerHTML = `
      <div class="error-state">
        <h3>Unable to load release notes</h3>
        <p>${escapeHtml(message)}</p>
        <button class="btn btn-primary" id="retry-fetch-btn" style="margin-top: 1rem;">Retry Now</button>
      </div>
    `;
    const retryBtn = document.getElementById('retry-fetch-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => fetchNotes(true));
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  // Run on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
