/**
 * Google Sheets Integration pour Noépé Media
 */

const GOOGLE_SHEET_CONFIG = {
  sheetId: '1JF-RSd-JpCFdF3kk1i4DZA4OwsWkj6bY-tdk_V_7eNA',
  publishedUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTmobXa2DhKDjPkOYpw77aWkqZBjIWMRr2QzK9MIBqO9xWpyajwcusIBYhPB8YehXRBnpZWyPp4bMsT/pubhtml',
  editUrl: 'https://docs.google.com/spreadsheets/d/1JF-RSd-JpCFdF3kk1i4DZA4OwsWkj6bY-tdk_V_7eNA/edit'
};

/**
 * Convertit les valeurs spéciales de Google Sheets en format standard
 */
function formatGoogleValue(value) {
  if (value === null || value === undefined) return '';
  
  // Si c'est une date au format "Date(YYYY,M,D)" ou datetime "Date(YYYY,M,D,H,M,S)"
  if (typeof value === 'string' && value.startsWith('Date(')) {
    const match = value.match(/Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)/);
    if (match) {
      if (match[4] !== undefined) {
        // C'est une datetime (durée)
        const hours = String(match[4]).padStart(2, '0');
        const minutes = String(match[5]).padStart(2, '0');
        return `${hours}:${minutes}`;
      } else {
        // C'est une date
        const year = match[1];
        const month = String(parseInt(match[2]) + 1).padStart(2, '0'); // Mois commence à 0
        const day = String(match[3]).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
  }
  
  // Si c'est un nombre (peut être en notation scientifique)
  if (typeof value === 'number') {
    return value.toString();
  }
  
  return value;
}

async function fetchGoogleSheet(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_CONFIG.sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  
  try {
    const response = await fetch(url);
    const text = await response.text();
    
    const jsonText = text.substr(47).slice(0, -2);
    const json = JSON.parse(jsonText);
    
    if (!json.table || !json.table.cols || !json.table.rows) {
      console.warn(`Aucune donnée trouvée dans l'onglet "${sheetName}"`);
      return [];
    }
    
    const headers = json.table.cols.map(col => col.label);
    const rows = json.table.rows.map(row => {
      const obj = {};
      if (row.c) {
        row.c.forEach((cell, index) => {
          // Utiliser la valeur formatée si disponible, sinon la valeur brute
          const value = cell ? (cell.f !== undefined ? cell.f : cell.v) : '';
          obj[headers[index]] = formatGoogleValue(value);
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

async function loadActualitesFromSheet() {
  return await fetchGoogleSheet('Actualités');
}

async function loadVideosFromSheet() {
  return await fetchGoogleSheet('Vidéos');
}

async function loadAudioFromSheet() {
  return await fetchGoogleSheet('Audio');
}

async function loadOSCFromSheet() {
  return await fetchGoogleSheet('OSC');
}

async function loadAnnoncesFromSheet() {
  return await fetchGoogleSheet('Annonces');
}