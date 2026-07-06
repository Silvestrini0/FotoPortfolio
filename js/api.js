const GITHUB_REPO = 'silvestriniluca/FotoPortfolio';
const GITHUB_BRANCH = 'main';
const CACHE_KEY = 'portfolio_data';
const CACHE_TTL = 60 * 60 * 1000;

function rawUrl(path) {
  return `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;
}

function apiUrl(path) {
  return `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
}

function isImage(name) {
  return /\.(webp|jpg|jpeg|png|gif|avif)$/i.test(name);
}

function formatName(name) {
  if (/^\d{2}-\d{2}-\d{4}$/.test(name)) return name;
  return name
    .split(/[-_]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

async function fetchFromCache() {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  const data = JSON.parse(cached);
  if (Date.now() - data.timestamp > CACHE_TTL) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
  return data.folders;
}

async function fetchFromApi() {
  const resp = await fetch(apiUrl('img'), {
    headers: { Accept: 'application/vnd.github.v3+json' }
  });
  if (!resp.ok) throw new Error('GitHub API error: ' + resp.status);

  const dirs = await resp.json();
  const folderPromises = dirs
    .filter(d => d.type === 'dir')
    .map(async (dir) => {
      const filesResp = await fetch(apiUrl(dir.path), {
        headers: { Accept: 'application/vnd.github.v3+json' }
      });
      if (!filesResp.ok) return null;
      const files = await filesResp.json();
      const images = files
        .filter(f => f.type === 'file' && isImage(f.name))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(f => rawUrl(f.path));

      return images.length ? {
        id: dir.name,
        name: formatName(dir.name),
        images,
        cover: images[0]
      } : null;
    });

  const folders = (await Promise.all(folderPromises)).filter(Boolean);
  folders.sort((a, b) => a.name.localeCompare(b.name));

  localStorage.setItem(CACHE_KEY, JSON.stringify({
    timestamp: Date.now(),
    folders
  }));

  return folders;
}

async function getPortfolioData() {
  const cached = await fetchFromCache();
  if (cached) return cached;
  return fetchFromApi();
}

async function getFolderData(folderId) {
  const data = await getPortfolioData();
  return data.find(f => f.id === folderId) || null;
}
