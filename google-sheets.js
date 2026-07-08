/**
 * Google Sheets Integration pour Noépé Media
 * ID du Sheet: 2PACX-1vTmobXa2DhKDjPkOYpw77aWkqZBjIWMRr2QzK9MIBqO9xWpyajwcusIBYhPB8YehXRBnpZWyPp4bMsT
 */

const GOOGLE_SHEET_CONFIG = {
  sheetId: '2PACX-1vTmobXa2DhKDjPkOYpw77aWkqZBjIWMRr2QzK9MIBqO9xWpyajwcusIBYhPB8YehXRBnpZWyPp4bMsT',
  publishedUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTmobXa2DhKDjPkOYpw77aWkqZBjIWMRr2QzK9MIBqO9xWpyajwcusIBYhPB8YehXRBnpZWyPp4bMsT/pubhtml',
  editUrl: 'https://docs.google.com/spreadsheets/d/2PACX-1vTmobXa2DhKDjPkOYpw77aWkqZBjIWMRr2QzK9MIBqO9xWpyajwcusIBYhPB8YehXRBnpZWyPp4bMsT/edit'
};

/**
 * Lire les données d'un Google Sheet publié
 * @param {string} sheetName - Nom de l'onglet (Actualités, Vidéos, Audio, OSC)
 * @returns {Promise<Array>} - Tableau d'objets avec les données
 */
async function fetchGoogleSheet(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_CONFIG.sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  
  try {
    const response = await fetch(url);
    const text = await response.text();
    
    // Extraire le JSON de la réponse Google Sheets
    const jsonText = text.substr(47).slice(0, -2);
    const json = JSON.parse(jsonText);
    
    // Convertir en tableau d'objets
    if (!json.table || !json.table.cols || !json.table.rows) {
      console.warn(`Aucune donnée trouvée dans l'onglet "${sheetName}"`);
      return [];
    }
    
    const headers = json.table.cols.map(col => col.label);
    const rows = json.table.rows.map(row => {
      const obj = {};
      if (row.c) {
        row.c.forEach((cell, index) => {
          obj[headers[index]] = cell ? (cell.v !== null ? cell.v : '') : '';
        });
      }
      return obj;
    });
    
    console.log(`✅ Données chargées depuis "${sheetName}": ${rows.length} éléments`);
    return rows;
  } catch (error) {
    console.error(`❌ Erreur lors de la lecture du Google Sheet "${sheetName}":`, error);
    return [];
  }
}

/**
 * Charger toutes les actualités depuis Google Sheets
 */
async function loadActualitesFromSheet() {
  return await fetchGoogleSheet('Actualités');
}

/**
 * Charger toutes les vidéos depuis Google Sheets
 */
async function loadVideosFromSheet() {
  return await fetchGoogleSheet('Vidéos');
}

/**
 * Charger toutes les émissions audio depuis Google Sheets
 */
async function loadAudioFromSheet() {
  return await fetchGoogleSheet('Audio');
}

/**
 * Charger toutes les OSC depuis Google Sheets
 */
async function loadOSCFromSheet() {
  return await fetchGoogleSheet('OSC');
}

/**
 * Exemple d'utilisation dans actualites.html :
 * 
 * async function chargerActualites() {
 *   const actualites = await loadActualitesFromSheet();
 *   afficherActualites(actualites);
 * }
 */

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GOOGLE_SHEET_CONFIG,
    fetchGoogleSheet,
    loadActualitesFromSheet,
    loadVideosFromSheet,
    loadAudioFromSheet,
    loadOSCFromSheet
  };
}