// ==========================================================
// 改行位置の印象評価実験
// 4パターン(A1→B2, B2→A1, A2→B1, B1→A2)をランダムに割り当てる版
// ==========================================================

// ▼▼▼ 新しく作成したGoogle Apps ScriptのウェブアプリURLに置き換えてください ▼▼▼
const GAS_URL = "https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec";

const participantId = "P" + Date.now();

let participant = {};
let pattern = [];       // その参加者に割り当てられた2ステップの提示順
let currentIndex = 0;   // 0 = 1問目, 1 = 2問目
let results = [];

let textStartTime = 0;
let surveyStartTime = 0;
let quizStartTime = 0;

let textPageTime = 0;
let surveyPageTime = 0;
let quizPageTime = 0;

// 文章の内容(A=砂漠 / B=タコ)ごとに、2種類の改行条件を用意する。
// 条件が変わっても文章の内容・クイズ内容は同じ。
const texts = {
  sabaku: {
    label: "文章A",
    char: {
      condition: "文字数改行",
      image: "images/sabaku_char.png",
      quiz: [
        {
          question: "砂漠で夜に気温が下がる主な理由は何ですか。",
          choices: ["雨が多いため", "熱をため込みにくいため", "雲が多いため"],
          correct: "2"
        },
        {
          question: "砂漠では昼と夜でどの程度の気温差が生じることがありますか。",
          choices: ["5度程度", "10度程度", "20度以上"],
          correct: "3"
        },
        {
          question: "文章の内容として正しいものはどれですか。",
          choices: ["防寒対策は不要である", "暑さ対策だけで十分である", "暑さ対策と防寒対策の両方が必要である"],
          correct: "3"
        }
      ]
    },
    unnatural: {
      condition: "不自然改行",
      image: "images/sabaku_unnatural.png",
      quiz: [
        {
          question: "砂漠で夜に気温が下がる主な理由は何ですか。",
          choices: ["雨が多いため", "熱をため込みにくいため", "雲が多いため"],
          correct: "2"
        },
        {
          question: "砂漠では昼と夜でどの程度の気温差が生じることがありますか。",
          choices: ["5度程度", "10度程度", "20度以上"],
          correct: "3"
        },
        {
          question: "文章の内容として正しいものはどれですか。",
          choices: ["防寒対策は不要である", "暑さ対策だけで十分である", "暑さ対策と防寒対策の両方が必要である"],
          correct: "3"
        }
      ]
    }
  },
  tako: {
    label: "文章B",
    char: {
      condition: "文字数改行",
      image: "images/tako_char.png",
      quiz: [
        {
          question: "タコの心臓はいくつありますか。",
          choices: ["1つ", "2つ", "3つ"],
          correct: "3"
        },
        {
          question: "タコの血液が青く見える理由は何ですか。",
          choices: ["鉄を多く含むため", "ヘモシアニンを利用しているため", "海水を吸収しているため"],
          correct: "2"
        },
        {
          question: "文章の内容として正しいものはどれですか。",
          choices: ["タコは学習能力が低い", "タコは道具を利用することがある", "タコの血液は赤色である"],
          correct: "2"
        }
      ]
    },
    unnatural: {
      condition: "不自然改行",
      image: "images/tako_unnatural.png",
      quiz: [
        {
          question: "タコの心臓はいくつありますか。",
          choices: ["1つ", "2つ", "3つ"],
          correct: "3"
        },
        {
          question: "タコの血液が青く見える理由は何ですか。",
          choices: ["鉄を多く含むため", "ヘモシアニンを利用しているため", "海水を吸収しているため"],
          correct: "2"
        },
        {
          question: "文章の内容として正しいものはどれですか。",
          choices: ["タコは学習能力が低い", "タコは道具を利用することがある", "タコの血液は赤色である"],
          correct: "2"
        }
      ]
    }
  }
};

// 順序効果・内容による偏りを相殺するための4パターン
// A1→B2, B2→A1, A2→B1, B1→A2 をすべて用意し、参加者ごとにランダムで1つ割り当てる
const patterns = [
  [{ content: "sabaku", cond: "char" },      { content: "tako",   cond: "unnatural" }], // A1 → B2
  [{ content: "tako",   cond: "unnatural" }, { content: "sabaku", cond: "char" }],       // B2 → A1
  [{ content: "sabaku", cond: "unnatural" }, { content: "tako",   cond: "char" }],       // A2 → B1
  [{ content: "tako",   cond: "char" },      { content: "sabaku", cond: "unnatural" }]   // B1 → A2
];

const sdItems = [
  ["読みやすい", "読みにくい"],
  ["見やすい", "見にくい"],
  ["自然な", "不自然な"],
  ["理解しやすい", "理解しにくい"],
  ["疲れにくい", "疲れやすい"],
  ["まとまりがある", "まとまりがない"]
];

function showPage(id) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.add("hidden");
  });

  document.getElementById(id).classList.remove("hidden");
  window.scrollTo(0, 0);
}

function goAttribute() {
  showPage("attributePage");
}

function startExperiment() {
  const age = document.getElementById("age").value;
  const gender = document.getElementById("gender").value;
  const place = document.getElementById("place").value;
  const readingHabit = document.getElementById("readingHabit").value;
  const smartphoneTime = document.getElementById("smartphoneTime").value;

  if (!age || !gender || !place || !readingHabit || !smartphoneTime) {
    alert("すべての項目に回答してください。");
    return;
  }

  participant = {
    age: age,
    gender: gender,
    place: place,
    readingHabit: readingHabit,
    smartphoneTime: smartphoneTime
  };

  // 4パターンの中からランダムに1つを選び、この参加者に割り当てる
  pattern = patterns[Math.floor(Math.random() * patterns.length)];

  currentIndex = 0;
  results = [];
  loadText();
}

function getCurrentExp() {
  const step = pattern[currentIndex];
  return {
    step: step,
    def: texts[step.content][step.cond],
    label: texts[step.content].label
  };
}

function loadText() {
  const { label } = getCurrentExp();

  document.getElementById("textTitle").textContent = `文章${currentIndex + 1}`;
  document.getElementById("textImage").src = getCurrentExp().def.image;
  document.getElementById("textImage").alt = label;

  showPage("textPage");

  setTimeout(() => {
    textStartTime = Date.now();
  }, 100);
}

function goSurvey() {
  textPageTime = Math.round((Date.now() - textStartTime) / 1000);

  const surveyArea = document.getElementById("surveyArea");
  surveyArea.innerHTML = "";

  sdItems.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "sd-item";

    div.innerHTML = `
      <div class="sd-labels">
        <span>${item[0]}</span>
        <span>${item[1]}</span>
      </div>
      <div class="sd-scale">
        ${[1, 2, 3, 4, 5, 6].map(num => `
          <label>
            ${num}<br>
            <input type="radio" name="sd${index}" value="${num}">
          </label>
        `).join("")}
      </div>
    `;

    surveyArea.appendChild(div);
  });

  showPage("surveyPage");

  setTimeout(() => {
    surveyStartTime = Date.now();
  }, 100);
}

function goQuiz() {
  for (let i = 0; i < sdItems.length; i++) {
    if (!document.querySelector(`input[name="sd${i}"]:checked`)) {
      alert("印象評価にすべて回答してください。");
      return;
    }
  }

  surveyPageTime = Math.round((Date.now() - surveyStartTime) / 1000);

  const { def } = getCurrentExp();
  const quizArea = document.getElementById("quizArea");

  quizArea.innerHTML = "";

  def.quiz.forEach((q, index) => {
    const div = document.createElement("div");
    div.className = "question";

    div.innerHTML = `
      <p>問${index + 1}：${q.question}</p>
      ${q.choices.map((choice, i) => `
        <label>
          <input type="radio" name="q${index}" value="${i + 1}">
          <span>${choice}</span>
        </label>
      `).join("")}
    `;

    quizArea.appendChild(div);
  });

  showPage("quizPage");

  setTimeout(() => {
    quizStartTime = Date.now();
  }, 100);
}

function saveResult() {
  for (let i = 0; i < 3; i++) {
    if (!document.querySelector(`input[name="q${i}"]:checked`)) {
      alert("理解度テストにすべて回答してください。");
      return;
    }
  }

  quizPageTime = Math.round((Date.now() - quizStartTime) / 1000);

  const { step, def, label } = getCurrentExp();

  let quizScore = 0;

  def.quiz.forEach((q, index) => {
    const answer = document.querySelector(`input[name="q${index}"]:checked`).value;
    if (answer === q.correct) {
      quizScore++;
    }
  });

  const sdAnswers = sdItems.map((item, index) => {
    return document.querySelector(`input[name="sd${index}"]:checked`).value;
  });

  results.push({
    participantId: participantId,
    age: participant.age,
    gender: participant.gender,
    place: participant.place,
    readingHabit: participant.readingHabit,
    smartphoneTime: participant.smartphoneTime,
    content: label,                          // 文章内容(文章A / 文章B)
    order: `${currentIndex + 1}問目`,         // 提示順(1問目 / 2問目)
    condition: def.condition,                // 文節改行/不自然な改行
    quizScore: quizScore,
    readability: sdAnswers[0],
    visibility: sdAnswers[1],
    naturalness: sdAnswers[2],
    understandability: sdAnswers[3],
    fatigue: sdAnswers[4],
    unity: sdAnswers[5],
    textPageTime: textPageTime,
    surveyPageTime: surveyPageTime,
    quizPageTime: quizPageTime
  });

  currentIndex++;

  if (currentIndex < pattern.length) {
    loadText();
  } else {
    showPage("endPage");
  }
}

function submitData() {
  document.getElementById("sendStatus").textContent = "送信中です...";

  fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify(results)
  })
  .then(response => response.text())
  .then(text => {
    document.getElementById("sendStatus").textContent =
      "送信が完了しました。ありがとうございました。";
  })
  .catch(error => {
    document.getElementById("sendStatus").textContent =
      "送信に失敗しました。もう一度試してください。";
  });
}
