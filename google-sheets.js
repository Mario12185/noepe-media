/**
 * Google Sheets Integration pour Noépé Media
 */

const GOOGLE_SHEET_CONFIG = {
  sheetId: '1JF-RSd-JpCFdF3kk1i4DZA4OwsWkj6bY-tdk_V_7eNA',
  publishedUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTmobXa2DhKDjPkOYpw77aWkqZBjIWMRr2QzK9MIBqO9xWpyajwcusIBYhPB8YehXRBnpZWyPp4bMsT/pubhtml',
  editUrl: 'https://docs.google.com/spreadsheets/d/1JF-RSd-JpCFdF3kk1i4DZA4OwsWkj6bY-tdk_V_7eNA/edit'
};

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