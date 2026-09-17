/**
 * Notas de Atualização do BigQuery - Aplicação Vanilla JavaScript
 * Recursos: Busca em tempo real, filtros de categoria, alternador de temas, spinner no refresh e Compositor de Tweets
 */

(function () {
  'use strict';

  // Estado da Aplicação
  const state = {
    notes: [],
    filteredNotes: [],
    metadata: {},
    activeTag: 'Todos',
    searchQuery: '',
    sortOrder: 'desc',
    expandedCards: new Set(),
    isLoading: false,
    selectedNote: null,
  };

  // Elementos Principais do DOM
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

  // Elementos do Modal de Tweet
  const tweetModal = document.getElementById('tweet-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const tweetTextarea = document.getElementById('tweet-textarea');
  const charCounter = document.getElementById('char-counter');
  const sendTweetBtn = document.getElementById('send-tweet-btn');
  const copyTweetBtn = document.getElementById('copy-tweet-btn');
  const floatingTweetBtn = document.getElementById('floating-tweet-btn');

  /**
   * Inicialização da aplicação
   */
  function init() {
    initTheme();
    setupEventListeners();
    setupTweetModalListeners();
    setupTextSelectionListener();
    fetchNotes(false);
  }

  /**
   * Alternador de Tema (Claro / Escuro)
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
        ? '☀️ <span class="hide-mobile">Claro</span>' 
        : '🌙 <span class="hide-mobile">Escuro</span>';
    }
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }

  /**
   * Ouvintes de Eventos da Interface
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
          toggleAllBtn.textContent = 'Expandir Todos';
        } else {
          state.filteredNotes.forEach(note => state.expandedCards.add(note.id));
          toggleAllBtn.textContent = 'Recolher Todos';
        }
        renderFeed();
      });
    }
  }

  /**
   * Ouvintes de Eventos do Modal de Tweet
   */
  function setupTweetModalListeners() {
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeTweetModal);
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeTweetModal);

    // Fechar ao clicar fora do cartão
    if (tweetModal) {
      tweetModal.addEventListener('click', (e) => {
        if (e.target === tweetModal) closeTweetModal();
      });
    }

    // Fechar com a tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && tweetModal && tweetModal.style.display !== 'none') {
        closeTweetModal();
      }
    });

    // Contador de caracteres
    if (tweetTextarea) {
      tweetTextarea.addEventListener('input', updateCharCount);
    }

    // Botão de copiar texto
    if (copyTweetBtn) {
      copyTweetBtn.addEventListener('click', () => {
        const text = tweetTextarea.value;
        navigator.clipboard.writeText(text).then(() => {
          const original = copyTweetBtn.innerHTML;
          copyTweetBtn.innerHTML = '✓ Copiado!';
          setTimeout(() => { copyTweetBtn.innerHTML = original; }, 2000);
        });
      });
    }

    // Botão de postar no 𝕏 / Twitter
    if (sendTweetBtn) {
      sendTweetBtn.addEventListener('click', () => {
        const text = tweetTextarea.value.trim();
        if (!text) return;

        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        const width = 550;
        const height = 450;
        const left = Math.max(0, (window.screen.width - width) / 2);
        const top = Math.max(0, (window.screen.height - height) / 2);

        window.open(
          tweetUrl,
          'TweetWindow',
          `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
        );
      });
    }
  }

  /**
   * Ouvinte de seleção de texto para o botão flutuante de Tweet
   */
  function setupTextSelectionListener() {
    if (!floatingTweetBtn) return;

    document.addEventListener('mouseup', (e) => {
      if (e.target.closest('#tweet-modal') || e.target.closest('#floating-tweet-btn')) {
        return;
      }

      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      if (selectedText.length > 5 && selection.rangeCount > 0) {
        const anchorNode = selection.anchorNode;
        const cardElement = anchorNode ? (anchorNode.nodeType === 3 ? anchorNode.parentElement : anchorNode).closest('.release-card') : null;
        
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          floatingTweetBtn.style.display = 'block';
          floatingTweetBtn.style.top = `${window.scrollY + rect.top - 40}px`;
          floatingTweetBtn.style.left = `${window.scrollX + rect.left + (rect.width / 2) - 60}px`;

          floatingTweetBtn.onclick = () => {
            floatingTweetBtn.style.display = 'none';
            let matchedNote = null;
            if (cardElement && cardElement.dataset.noteId) {
              matchedNote = state.notes.find(n => n.id === cardElement.dataset.noteId);
            }
            openTweetModalWithSelection(selectedText, matchedNote);
          };
          return;
        }
      }

      floatingTweetBtn.style.display = 'none';
    });
  }

  /**
   * Composição do texto do Tweet a partir da nota
   */
  function composeTweetText(note, customExcerpt = '') {
    const title = note.date_formatted || note.title;
    const url = note.link || 'https://docs.cloud.google.com/bigquery/docs/release-notes';
    const hashtags = '#BigQuery #GoogleCloud';
    
    const prefix = `🚀 Atualização do BigQuery (${title}):\n`;
    const suffix = `\n\n🔗 ${url}\n${hashtags}`;

    const maxExcerptLen = Math.max(20, 280 - (prefix.length + suffix.length));
    let excerpt = customExcerpt || note.summary || '';
    if (excerpt.length > maxExcerptLen) {
      excerpt = excerpt.substring(0, maxExcerptLen - 3).trim() + '...';
    }

    return `${prefix}${excerpt}${suffix}`;
  }

  /**
   * Abrir o Modal de Tweet
   */
  function openTweetModal(note) {
    state.selectedNote = note;
    const initialTweet = composeTweetText(note);
    showModalWithText(initialTweet);
  }

  function openTweetModalWithSelection(selectedText, note) {
    const fallbackNote = note || (state.notes.length > 0 ? state.notes[0] : null);
    let tweetText = '';
    if (fallbackNote) {
      tweetText = composeTweetText(fallbackNote, selectedText);
    } else {
      tweetText = `💡 BigQuery: "${selectedText.substring(0, 180)}..."\n#BigQuery #GoogleCloud`;
    }
    showModalWithText(tweetText);
  }

  function showModalWithText(text) {
    if (!tweetModal || !tweetTextarea) return;
    tweetTextarea.value = text;
    updateCharCount();
    tweetModal.style.display = 'flex';
    tweetTextarea.focus();
  }

  function closeTweetModal() {
    if (tweetModal) tweetModal.style.display = 'none';
  }

  function updateCharCount() {
    if (!tweetTextarea || !charCounter) return;
    const len = tweetTextarea.value.length;
    charCounter.textContent = `${len} / 280`;

    charCounter.classList.remove('limit-near', 'limit-reached');
    if (len >= 280) {
      charCounter.classList.add('limit-reached');
    } else if (len >= 240) {
      charCounter.classList.add('limit-near');
    }
  }

  /**
   * Buscar notas de atualização com feedback de spinner no botão
   */
  async function fetchNotes(forceRefresh = false) {
    state.isLoading = true;
    renderLoading();

    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = '<span class="btn-spinner"></span> Atualizando...';
    }

    try {
      const url = `/api/notes${forceRefresh ? '?refresh=true' : ''}`;
      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Falha ao buscar as notas de atualização.');
      }

      state.metadata = json.data;
      state.notes = json.data.entries || [];
      
      // Expandir todas as notas inicialmente
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
        refreshBtn.innerHTML = '🔄 Atualizar Feed';
      }
    }
  }

  /**
   * Atualizar indicadores de metadados no cabeçalho
   */
  function updateMetadataDisplay() {
    if (totalCountEl) {
      totalCountEl.textContent = state.notes.length;
    }
    if (lastUpdatedEl) {
      lastUpdatedEl.textContent = state.metadata.updated_formatted || state.metadata.updated || 'N/D';
    }
    if (lastFetchedEl) {
      lastFetchedEl.textContent = state.metadata.fetched_at || 'Agora mesmo';
    }
  }

  /**
   * Renderizar chips de filtro por categoria
   */
  function renderTagFilters() {
    if (!tagsContainer) return;

    const tagSet = new Set();
    state.notes.forEach(note => {
      (note.tags || []).forEach(tag => tagSet.add(tag));
    });

    const standardTags = ['Todos', 'Recurso', 'Alteração', 'Prévia', 'GA', 'Descontinuado'];
    const otherTags = Array.from(tagSet).filter(t => !standardTags.includes(t));
    const allDisplayTags = [...standardTags, ...otherTags];

    tagsContainer.innerHTML = '';
    const label = document.createElement('span');
    label.className = 'filter-label';
    label.textContent = 'Categoria:';
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
   * Filtrar e ordenar notas de atualização
   */
  function applyFilters() {
    let result = [...state.notes];

    // Filtrar por tag
    if (state.activeTag !== 'Todos') {
      result = result.filter(note => 
        (note.tags || []).map(t => t.toLowerCase()).includes(state.activeTag.toLowerCase())
      );
    }

    // Filtrar por texto da busca
    if (state.searchQuery) {
      result = result.filter(note => {
        const titleMatch = note.title.toLowerCase().includes(state.searchQuery);
        const dateMatch = (note.date_formatted || '').toLowerCase().includes(state.searchQuery);
        const summaryMatch = (note.summary || '').toLowerCase().includes(state.searchQuery);
        const htmlMatch = (note.content_html || '').toLowerCase().includes(state.searchQuery);
        return titleMatch || dateMatch || summaryMatch || htmlMatch;
      });
    }

    // Ordenar por data
    result.sort((a, b) => {
      const dateA = new Date(a.updated).getTime() || 0;
      const dateB = new Date(b.updated).getTime() || 0;
      return state.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    state.filteredNotes = result;
    renderFeed();
  }

  /**
   * Renderizar cartões do feed
   */
  function renderFeed() {
    if (!feedContainer) return;

    if (state.filteredNotes.length === 0) {
      feedContainer.innerHTML = `
        <div class="empty-state">
          <h3>Nenhuma nota de atualização encontrada</h3>
          <p>Tente ajustar suas palavras-chave de busca ou filtros de categoria.</p>
        </div>
      `;
      return;
    }

    feedContainer.innerHTML = '';

    state.filteredNotes.forEach(note => {
      const isExpanded = state.expandedCards.has(note.id);
      const card = document.createElement('article');
      card.className = 'release-card';
      card.dataset.noteId = note.id;
      card.id = `note-${note.id.split('#')[1] || note.id}`;

      const tagsHtml = (note.tags || []).map(tag => {
        const tagClass = getTagClass(tag);
        return `<span class="tag-badge ${tagClass}">${escapeHtml(tag)}</span>`;
      }).join(' ');

      card.innerHTML = `
        <div class="card-header">
          <div class="card-title-group">
            <h2 class="card-title">${escapeHtml(note.title)}</h2>
            <div class="card-date">Atualizado em: ${escapeHtml(note.date_formatted || note.updated)}</div>
            <div class="tags-row">${tagsHtml}</div>
          </div>
          <div class="card-actions">
            <button class="btn btn-tweet card-tweet-btn" title="Tweetar esta atualização no 𝕏">
              𝕏 Tweetar
            </button>
            ${note.link ? `<a href="${escapeHtml(note.link)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-icon" title="Abrir documentação oficial">🔗</a>` : ''}
            <button class="btn btn-secondary btn-icon copy-btn" title="Copiar link direto">📋</button>
            <button class="btn btn-secondary toggle-card-btn">
              ${isExpanded ? 'Recolher ▲' : 'Expandir ▼'}
            </button>
          </div>
        </div>
        <div class="card-body" style="display: ${isExpanded ? 'block' : 'none'};">
          ${note.content_html}
        </div>
      `;

      const tweetBtn = card.querySelector('.card-tweet-btn');
      tweetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTweetModal(note);
      });

      const toggleBtn = card.querySelector('.toggle-card-btn');
      const cardBody = card.querySelector('.card-body');
      toggleBtn.addEventListener('click', () => {
        if (state.expandedCards.has(note.id)) {
          state.expandedCards.delete(note.id);
          cardBody.style.display = 'none';
          toggleBtn.textContent = 'Expandir ▼';
        } else {
          state.expandedCards.add(note.id);
          cardBody.style.display = 'block';
          toggleBtn.textContent = 'Recolher ▲';
        }
      });

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
    if (t.includes('recurso') || t.includes('feature')) return 'tag-feature';
    if (t.includes('alteração') || t.includes('alteracao') || t.includes('change')) return 'tag-change';
    if (t.includes('prévia') || t.includes('previa') || t.includes('preview')) return 'tag-preview';
    if (t.includes('ga') || t.includes('generally')) return 'tag-ga';
    if (t.includes('descontinuado') || t.includes('deprecat')) return 'tag-deprecated';
    return 'tag-default';
  }

  function renderLoading() {
    if (!feedContainer) return;
    feedContainer.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <h3>Buscando Notas de Atualização do BigQuery...</h3>
        <p>Conectando ao feed do Google Cloud...</p>
      </div>
    `;
  }

  function renderError(message) {
    if (!feedContainer) return;
    feedContainer.innerHTML = `
      <div class="error-state">
        <h3>Não foi possível carregar as notas de atualização</h3>
        <p>${escapeHtml(message)}</p>
        <button class="btn btn-primary" id="retry-fetch-btn" style="margin-top: 1rem;">Tentar Novamente</button>
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
