// ==========================================================
// 改行位置の印象評価実験 - データ受信用 Google Apps Script
//
// 【セットアップ手順】
// 1. 新しい Google スプレッドシートを作成する。
// 2. メニューの「拡張機能」→「Apps Script」を開く。
// 3. デフォルトで作成される Code.gs の中身を全て消し、このファイルの内容を貼り付ける。
// 4. 保存する（フロッピーのアイコン、または Ctrl+S）。
// 5. 右上の「デプロイ」→「新しいデプロイ」をクリック。
// 6. 「種類の選択」の歯車アイコンから「ウェブアプリ」を選択。
// 7. 「実行するユーザー」は自分（自分のアカウント）のままでOK。
// 8. 「アクセスできるユーザー」を「全員」に設定する。
//    （これをしないと、実験ページから送信できません）
// 9. 「デプロイ」をクリックし、表示された「ウェブアプリのURL」をコピーする。
// 10. コピーしたURLを script.js の GAS_URL に貼り付ける。
// 11. スプレッドシートの1行目には、初回のデータ送信時に自動でヘッダーが追加されます。
//     （空のシートのまま公開して問題ありません）
//
// 【注意】
// コードを変更するたびに「新しいデプロイ」を作り直すか、
// 既存のデプロイの「編集」→「バージョン：新バージョン」で更新してください。
// URLだけ更新して中身を保存し忘れると、古いコードのまま動いてしまいます。
// ==========================================================

const HEADERS = [
  "被験者番号",
  "年齢",
  "性別",
  "受講場所",
  "読書頻度",
  "スマホ利用時間",
  "文章内容",
  "提示順",
  "文節改行/不自然な改行",
  "理解度得点",
  "読みやすさ",
  "見やすさ",
  "自然さ",
  "理解しやすさ",
  "疲れにくさ",
  "まとまり感",
  "文章ページ滞在時間",
  "問題ページ滞在時間",
  "評価ページ滞在時間",
  "送信日時"
];

function doPost(e) {
  try {
    const rows = JSON.parse(e.postData.contents);
    const now = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy/MM/dd H:mm:ss");

    rows.forEach(function (row) {
      // パターンごとのシート(パターン1〜4)に保存する
      const sheet = getPatternSheet(row.patternNo);
      sheet.appendRow([
        row.participantId,
        row.age,
        row.gender,
        row.place,
        row.readingHabit,
        row.smartphoneTime,
        row.content,
        row.order,
        row.condition,
        row.quizScore,
        row.readability,
        row.visibility,
        row.naturalness,
        row.understandability,
        row.fatigue,
        row.unity,
        row.textPageTime,
        row.quizPageTime,
        row.surveyPageTime,
        now
      ]);
    });

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", rows: rows.length }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 「パターン1」〜「パターン4」のシートを返す。無ければ作成し、1行目にヘッダーを追加する。
// パターン番号が無いデータ(古いページからの送信など)は「パターン不明」シートに入れる。
function getPatternSheet(patternNo) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const name = patternNo ? "パターン" + patternNo : "パターン不明";
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

// ブラウザでこのURLを直接開いた時の動作確認用（任意）
function doGet(e) {
  return ContentService.createTextOutput("このエンドポイントはPOST専用です。実験ページから送信してください。");
}
