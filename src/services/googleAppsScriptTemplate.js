export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ========================================================
 * FBB CUP 2026 - GOOGLE APPS SCRIPT WEBHOOK SYNC
 * ========================================================
 * 
 * CARA SETUP:
 * 1. Buka Google Sheets baru di https://sheets.new
 * 2. Klik menu 'Extensions' (Ekstensi) > 'Apps Script'
 * 3. Hapus semua kode default, lalu PASTE kode ini ke editor
 * 4. Klik icon Save (Simpan)
 * 5. Klik tombol 'Deploy' (Terapkan) di pojok kanan atas > 'New deployment' (Penerapan baru)
 * 6. Pilih tipe 'Web app' (Aplikasi web)
 * 7. Isi:
 *    - Description: FBB Cup 2026 Sync
 *    - Execute as: Me (email Anda)
 *    - Who has access: Anyone (Siapa saja)  <--- PENTING!
 * 8. Klik 'Deploy' dan salin URL Web App yang dihasilkan.
 * 9. Paste URL tersebut ke tab Pengaturan Cloud Sync di aplikasi FBB Cup 2026!
 */

function doGet(e) {
  try {
    var sheet = getOrCreateTournamentSheet();
    var cellValue = sheet.getRange("A1").getValue();
    var data = cellValue ? JSON.parse(cellValue) : null;
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: data
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var parsed = JSON.parse(rawData);
    var sheet = getOrCreateTournamentSheet();
    
    // Simpan raw JSON di cell A1 untuk query cepat
    sheet.getRange("A1").setValue(JSON.stringify(parsed.payload));
    
    // Format juga ke dalam tabel visual yang rapi di Google Sheets
    exportToVisualTables(parsed.payload);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data FBB Cup 2026 berhasil disinkronkan ke Google Sheets!",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateTournamentSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("_DATA_FBB_JSON");
  if (!sheet) {
    sheet = ss.insertSheet("_DATA_FBB_JSON");
    sheet.hideSheet();
  }
  return sheet;
}

function exportToVisualTables(data) {
  if (!data) return;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Sheet Daftar Tim & Peserta
  var teamSheet = ss.getSheetByName("TIM_DAN_PESERTA");
  if (!teamSheet) {
    teamSheet = ss.insertSheet("TIM_DAN_PESERTA");
  }
  teamSheet.clear();
  teamSheet.getRange("A1").setValue("👥 DAFTAR TIM & PESERTA FBB CUP 2026").setFontWeight("bold").setFontSize(14);
  teamSheet.getRange(3, 1, 1, 6).setValues([["ID Tim", "Nama Tim", "Singkatan", "Kapten", "No WA", "Jumlah Peserta"]])
    .setFontWeight("bold").setBackground("#E06020").setFontColor("#ffffff");
  
  var tRow = 4;
  var teamsMap = {};
  (data.teams || []).forEach(function(t) {
    teamsMap[t.id] = t;
    teamSheet.getRange(tRow, 1, 1, 6).setValues([[
      t.id, t.name, t.shortName || "-", t.captain || "-", t.phone || "-", (t.members || []).length
    ]]);
    tRow++;
  });

  // 2. Sheet Pertandingan & Skor
  var matchSheet = ss.getSheetByName("JADWAL_DAN_SKOR");
  if (!matchSheet) {
    matchSheet = ss.insertSheet("JADWAL_DAN_SKOR");
  }
  matchSheet.clear();
  matchSheet.getRange("A1").setValue("⚽ JADWAL & SKOR PERTANDINGAN FBB CUP 2026").setFontWeight("bold").setFontSize(14);
  matchSheet.getRange(3, 1, 1, 8).setValues([["ID Match", "Putaran", "Tanggal", "Waktu", "Tim 1", "Skor", "Tim 2", "Status"]])
    .setFontWeight("bold").setBackground("#E06020").setFontColor("#ffffff");
  
  var mRow = 4;
  (data.matches || []).forEach(function(m) {
    var t1 = teamsMap[m.team1Id] ? teamsMap[m.team1Id].name : m.team1Id;
    var t2 = teamsMap[m.team2Id] ? teamsMap[m.team2Id].name : m.team2Id;
    var scoreText = (m.team1Score !== null && m.team2Score !== null) ? (m.team1Score + " - " + m.team2Score) : "vs";
    
    matchSheet.getRange(mRow, 1, 1, 8).setValues([[
      m.id, m.round || "Matchday", m.date || "-", m.time || "-", t1, scoreText, t2, m.status || "scheduled"
    ]]);
    mRow++;
  });
}
`;
