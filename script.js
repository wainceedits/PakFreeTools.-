"use strict";

/* =========================================================
   PakFreeTools - Main Application
   ========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const modal = $("#toolModal");
const toolContent = $("#toolContent");
const searchInput = $("#toolSearch");
const toolCards = $$(".tool-card");
const toolCount = $("#toolCount");
const noResults = $("#noResults");
const toast = $("#toast");

let activeCategory = "all";
let typingTimer = null;
let typingStart = null;
let typingStarted = false;

/* =========================================================
   BASIC HELPERS
   ========================================================= */

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadDataURL(dataURL, filename) {
  const a = document.createElement("a");
  a.href = dataURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function formatNumber(value) {
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 2
  });
}

function randomSecureInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  if (max < min) throw new Error("Invalid range.");

  const range = max - min + 1;

  if (window.crypto?.getRandomValues) {
    const maxUint = 0xFFFFFFFF;
    const limit = Math.floor((maxUint + 1) / range) * range;
    const array = new Uint32Array(1);

    do {
      crypto.getRandomValues(array);
    } while (array[0] >= limit);

    return min + (array[0] % range);
  }

  return min + Math.floor(Math.random() * range);
}

function secureRandomChar(chars) {
  return chars[randomSecureInt(0, chars.length - 1)];
}

/* =========================================================
   THEME
   ========================================================= */

function setTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");

  $("#themeButton").textContent =
    theme === "dark" ? "☀️" : "🌙";

  try {
    localStorage.setItem("pft-theme", theme);
  } catch (_) {}
}

let savedTheme = "light";

try {
  savedTheme = localStorage.getItem("pft-theme") || "light";
} catch (_) {}

setTheme(savedTheme);

$("#themeButton").addEventListener("click", () => {
  setTheme(document.body.classList.contains("dark") ? "light" : "dark");
});

/* =========================================================
   MOBILE MENU
   ========================================================= */

$("#menuButton").addEventListener("click", () => {
  $("#mobileMenu").classList.toggle("open");
});

$$(".mobile-menu a").forEach(link => {
  link.addEventListener("click", () => {
    $("#mobileMenu").classList.remove("open");
  });
});

/* =========================================================
   SEARCH + FILTER
   ========================================================= */

function filterTools() {
  const query = searchInput.value.trim().toLowerCase();

  let visible = 0;

  toolCards.forEach(card => {
    const name = card.dataset.name.toLowerCase();
    const category = card.dataset.category;

    const matchesSearch =
      !query || name.includes(query);

    const matchesCategory =
      activeCategory === "all" ||
      category === activeCategory;

    const show = matchesSearch && matchesCategory;

    card.style.display = show ? "" : "none";

    if (show) visible++;
  });

  toolCount.textContent = visible;
  noResults.classList.toggle("hidden", visible !== 0);
}

searchInput.addEventListener("input", filterTools);

$$(".filter").forEach(button => {
  button.addEventListener("click", () => {

    $$(".filter").forEach(x => x.classList.remove("active"));
    button.classList.add("active");

    activeCategory = button.dataset.filter;

    filterTools();

    $("#tools").scrollIntoView({
      behavior: "smooth"
    });
  });
});

$$(".category-card").forEach(button => {
  button.addEventListener("click", () => {

    activeCategory = button.dataset.category;

    $$(".filter").forEach(x => {
      x.classList.toggle(
        "active",
        x.dataset.filter === activeCategory
      );
    });

    filterTools();

    $("#tools").scrollIntoView({
      behavior: "smooth"
    });
  });
});

function resetTools() {
  searchInput.value = "";
  activeCategory = "all";

  $$(".filter").forEach(x => {
    x.classList.toggle("active", x.dataset.filter === "all");
  });

  filterTools();
}

/* Keyboard shortcut */
document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }

  if (event.key === "Escape" && !modal.classList.contains("hidden")) {
    closeTool();
  }
});

/* =========================================================
   MODAL
   ========================================================= */

function openTool(type) {

  const tools = {

    percentage: {
      title: "Percentage Calculator",
      subtitle: "Calculate percentages instantly.",
      html: `
        <div class="form-group">
          <label>What is X% of Y?</label>
          <div class="form-grid">
            <input id="pctX" type="number" placeholder="Percentage X">
            <input id="pctY" type="number" placeholder="Number Y">
          </div>
        </div>

        <button class="primary-button" onclick="calculatePercentage()">
          Calculate
        </button>

        <div id="pctResult" class="result-box hidden"></div>
      `
    },

    age: {
      title: "Age Calculator",
      subtitle: "Calculate your exact age.",
      html: `
        <div class="form-group">
          <label>Date of Birth</label>
          <input id="dob" type="date">
        </div>

        <button class="primary-button" onclick="calculateAge()">
          Calculate Age
        </button>

        <div id="ageResult" class="result-box hidden"></div>
      `
    },

    bmi: {
      title: "BMI Calculator",
      subtitle: "Calculate your Body Mass Index.",
      html: `
        <div class="form-grid">
          <div class="form-group">
            <label>Weight (kg)</label>
            <input id="bmiWeight" type="number" min="1" step="0.1">
          </div>

          <div class="form-group">
            <label>Height (cm)</label>
            <input id="bmiHeight" type="number" min="30" step="0.1">
          </div>
        </div>

        <button class="primary-button" onclick="calculateBMI()">
          Calculate BMI
        </button>

        <div id="bmiResult" class="result-box hidden"></div>
      `
    },

    discount: {
      title: "Discount Calculator",
      subtitle: "Calculate discount and final price.",
      html: `
        <div class="form-grid">
          <div class="form-group">
            <label>Original Price</label>
            <input id="originalPrice" type="number" min="0" step="0.01">
          </div>

          <div class="form-group">
            <label>Discount %</label>
            <input id="discountPct" type="number" min="0" max="100" step="0.01">
          </div>
        </div>

        <button class="primary-button" onclick="calculateDiscount()">
          Calculate
        </button>

        <div id="discountResult" class="result-box hidden"></div>
      `
    },

    profit: {
      title: "Profit / Loss Calculator",
      subtitle: "Calculate profit or loss percentage.",
      html: `
        <div class="form-grid">
          <div class="form-group">
            <label>Cost Price</label>
            <input id="costPrice" type="number" min="0" step="0.01">
          </div>

          <div class="form-group">
            <label>Selling Price</label>
            <input id="sellingPrice" type="number" min="0" step="0.01">
          </div>
        </div>

        <button class="primary-button" onclick="calculateProfit()">
          Calculate
        </button>

        <div id="profitResult" class="result-box hidden"></div>
      `
    },

    average: {
      title: "Average Calculator",
      subtitle: "Enter numbers separated by commas.",
      html: `
        <div class="form-group">
          <label>Numbers</label>
          <textarea id="averageInput" placeholder="10, 20, 30, 40"></textarea>
        </div>

        <button class="primary-button" onclick="calculateAverage()">
          Calculate Average
        </button>

        <div id="averageResult" class="result-box hidden"></div>
      `
    },

    ratio: {
      title: "Ratio Calculator",
      subtitle: "Simplify a ratio.",
      html: `
        <div class="form-grid">
          <div class="form-group">
            <label>First number</label>
            <input id="ratioA" type="number">
          </div>

          <div class="form-group">
            <label>Second number</label>
            <input id="ratioB" type="number">
          </div>
        </div>

        <button class="primary-button" onclick="calculateRatio()">
          Simplify Ratio
        </button>

        <div id="ratioResult" class="result-box hidden"></div>
      `
    },

    word: {
      title: "Word Counter",
      subtitle: "Count words, characters and sentences.",
      html: `
        <div class="form-group">
          <textarea id="wordText" placeholder="Start typing or paste your text..."></textarea>
        </div>

        <div class="typing-results">
          <div class="typing-stat"><strong id="wordCount">0</strong><span>Words</span></div>
          <div class="typing-stat"><strong id="charCount">0</strong><span>Characters</span></div>
          <div class="typing-stat"><strong id="sentenceCount">0</strong><span>Sentences</span></div>
        </div>
      `
    },

    characters: {
      title: "Character Counter",
      subtitle: "Count characters with or without spaces.",
      html: `
        <div class="form-group">
          <textarea id="characterText" placeholder="Type or paste text..."></textarea>
        </div>

        <div class="typing-results">
          <div class="typing-stat"><strong id="allChars">0</strong><span>All</span></div>
          <div class="typing-stat"><strong id="noSpaceChars">0</strong><span>No Spaces</span></div>
          <div class="typing-stat"><strong id="lineChars">0</strong><span>Lines</span></div>
        </div>
      `
    },

    case: {
      title: "Case Converter",
      subtitle: "Convert your text instantly.",
      html: `
        <div class="form-group">
          <textarea id="caseText" placeholder="Write or paste text..."></textarea>
        </div>

        <div class="tool-actions">
          <button class="secondary-action" onclick="convertCase('upper')">UPPERCASE</button>
          <button class="secondary-action" onclick="convertCase('lower')">lowercase</button>
          <button class="secondary-action" onclick="convertCase('title')">Title Case</button>
        </div>
      `
    },

    urdu: {
      title: "Urdu Writing",
      subtitle: "Write, edit and copy Urdu text.",
      html: `
        <div class="form-group">
          <textarea id="urduEditor" dir="rtl" lang="ur" style="min-height:280px" placeholder="یہاں اردو لکھیں..."></textarea>
        </div>

        <div class="tool-actions">
          <button class="primary-button" onclick="copyText('urduEditor')">Copy Text</button>
          <button class="secondary-action" onclick="clearField('urduEditor')">Clear</button>
        </div>
      `
    },

    urducounter: {
      title: "Urdu Word Counter",
      subtitle: "Count Urdu words and characters.",
      html: `
        <div class="form-group">
          <textarea id="urduCountText" dir="rtl" lang="ur" placeholder="اردو متن یہاں لکھیں..."></textarea>
        </div>

        <div class="typing-results">
          <div class="typing-stat"><strong id="urduWords">0</strong><span>Words</span></div>
          <div class="typing-stat"><strong id="urduChars">0</strong><span>Characters</span></div>
          <div class="typing-stat"><strong id="urduLines">0</strong><span>Lines</span></div>
        </div>
      `
    },

    qr: {
      title: "QR Code Generator",
      subtitle: "Generate a QR code directly in your browser.",
      html: `
        <div class="form-group">
          <label>Text or URL</label>
          <textarea id="qrText" placeholder="https://example.com"></textarea>
        </div>

        <button class="primary-button" onclick="generateQR()">
          Generate QR Code
        </button>

        <div id="qrOutput" class="qr-output">
          <span style="color:#98a2b3">Your QR code will appear here.</span>
        </div>

        <div id="qrActions" class="tool-actions hidden" style="margin-top:12px">
          <button class="secondary-action" onclick="downloadQR()">Download PNG</button>
        </div>
      `
    },

    password: {
      title: "Password Generator",
      subtitle: "Generate strong random passwords.",
      html: `
        <div class="form-grid">
          <div class="form-group">
            <label>Password Length</label>
            <input id="passLength" type="number" min="4" max="128" value="16">
          </div>

          <div class="form-group">
            <label>Options</label>
            <select id="passMode">
              <option value="all">Letters + Numbers + Symbols</option>
              <option value="letters">Letters only</option>
              <option value="numbers">Numbers only</option>
            </select>
          </div>
        </div>

        <button class="primary-button" onclick="generatePassword()">
          Generate Password
        </button>

        <div class="form-group" style="margin-top:15px">
          <input id="passwordOutput" readonly>
        </div>

        <button class="secondary-action" onclick="copyText('passwordOutput')">
          Copy Password
        </button>
      `
    },

    random: {
      title: "Random Number Generator",
      subtitle: "Generate a secure random number.",
      html: `
        <div class="form-grid">
          <div class="form-group">
            <label>Minimum</label>
            <input id="randomMin" type="number" value="1">
          </div>

          <div class="form-group">
            <label>Maximum</label>
            <input id="randomMax" type="number" value="100">
          </div>
        </div>

        <button class="primary-button" onclick="generateRandomNumber()">
          Generate
        </button>

        <div id="randomResult" class="result-box hidden"></div>
      `
    },

    cleaner: {
      title: "Text Cleaner",
      subtitle: "Remove extra spaces and clean text.",
      html: `
        <div class="form-group">
          <textarea id="cleanText" placeholder="Paste your text here..."></textarea>
        </div>

        <button class="primary-button" onclick="cleanText()">
          Clean Text
        </button>
      `
    },

    resize: {
      title: "Image Resizer",
      subtitle: "Resize your image in the browser.",
      html: `
        <div class="file-drop">
          <strong>Select an image</strong><br>
          <input id="resizeFile" type="file" accept="image/*">
        </div>

        <div class="form-grid" style="margin-top:15px">
          <div class="form-group">
            <label>Width</label>
            <input id="resizeWidth" type="number" min="1">
          </div>

          <div class="form-group">
            <label>Height</label>
            <input id="resizeHeight" type="number" min="1">
          </div>
        </div>

        <button class="primary-button" onclick="resizeImage()">
          Resize & Download
        </button>
      `
    },

    compress: {
      title: "Image Compressor",
      subtitle: "Reduce image size without server upload.",
      html: `
        <div class="file-drop">
          <strong>Select an image</strong><br>
          <input id="compressFile" type="file" accept="image/*">
        </div>

        <div class="form-group" style="margin-top:15px">
          <label>Quality: <span id="qualityValue">70</span>%</label>
          <input id="compressQuality" type="range" min="20" max="95" value="70"
                 oninput="$('#qualityValue').textContent=this.value">
        </div>

        <button class="primary-button" onclick="compressImage()">
          Compress & Download
        </button>
      `
    },

    converter: {
      title: "JPG / PNG Converter",
      subtitle: "Convert images directly in your browser.",
      html: `
        <div class="file-drop">
          <strong>Select image</strong><br>
          <input id="convertFile" type="file" accept="image/*">
        </div>

        <div class="form-group" style="margin-top:15px">
          <label>Output format</label>
          <select id="convertFormat">
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPG</option>
            <option value="image/webp">WEBP</option>
          </select>
        </div>

        <button class="primary-button" onclick="convertImage()">
          Convert & Download
        </button>
      `
    },

    crop: {
      title: "Image Cropper",
      subtitle: "Crop an image from the center.",
      html: `
        <div class="file-drop">
          <input id="cropFile" type="file" accept="image/*">
        </div>

        <div class="form-grid" style="margin-top:15px">
          <div class="form-group">
            <label>Width</label>
            <input id="cropWidth" type="number" min="1" value="500">
          </div>

          <div class="form-group">
            <label>Height</label>
            <input id="cropHeight" type="number" min="1" value="500">
          </div>
        </div>

        <button class="primary-button" onclick="cropImage()">
          Crop & Download
        </button>
      `
    },

    rotate: {
      title: "Image Rotator",
      subtitle: "Rotate your image 90°, 180° or 270°.",
      html: `
        <div class="file-drop">
          <input id="rotateFile" type="file" accept="image/*">
        </div>

        <div class="form-group" style="margin-top:15px">
          <label>Rotation</label>
          <select id="rotateAngle">
            <option value="90">90°</option>
            <option value="180">180°</option>
            <option value="270">270°</option>
          </select>
        </div>

        <button class="primary-button" onclick="rotateImage()">
          Rotate & Download
        </button>
      `
    },

    jpgpdf: {
      title: "JPG to PDF",
      subtitle: "Create a PDF from one or multiple images.",
      html: `
        <div class="file-drop">
          <strong>Select one or more images</strong><br>
          <input id="jpgPdfFiles" type="file" accept="image/*" multiple>
        </div>

        <button class="primary-button" style="margin-top:15px" onclick="imagesToPDF()">
          Create PDF
        </button>
      `
    },

    textpdf: {
      title: "Text to PDF",
      subtitle: "Create a clean PDF document from text.",
      html: `
        <div class="form-group">
          <textarea id="pdfText" placeholder="Write your document here..."></textarea>
        </div>

        <button class="primary-button" onclick="textToPDF()">
          Download PDF
        </button>
      `
    },

    wordpdf: {
      title: "Word to PDF",
      subtitle: "Convert a DOCX document in your browser.",
      html: `
        <div class="file-drop">
          <input id="wordPdfFile" type="file" accept=".docx">
        </div>

        <p class="modal-subtitle" style="margin-top:15px">
          Best for text-based DOCX files. Complex layouts may not be preserved exactly.
        </p>

        <button class="primary-button" onclick="wordToPDF()">
          Convert to PDF
        </button>
      `
    },

    pdfword: {
      title: "PDF to Word",
      subtitle: "Extract readable text from a PDF into a Word-compatible document.",
      html: `
        <div class="file-drop">
          <input id="pdfWordFile" type="file" accept=".pdf,application/pdf">
        </div>

        <button class="primary-button" style="margin-top:15px" onclick="pdfToWord()">
          Extract & Download
        </button>

        <div class="result-box">
          This browser version extracts text. Scanned/image-only PDFs require OCR and may not produce text.
        </div>
      `
    },

    wordexcel: {
      title: "Word to Excel",
      subtitle: "Extract DOCX paragraphs into an Excel workbook.",
      html: `
        <div class="file-drop">
          <input id="wordExcelFile" type="file" accept=".docx">
        </div>

        <button class="primary-button" style="margin-top:15px" onclick="wordToExcel()">
          Create Excel File
        </button>
      `
    },

    pdftext: {
      title: "PDF Text Extractor",
      subtitle: "Extract text from PDF pages.",
      html: `
        <div class="file-drop">
          <input id="pdfTextFile" type="file" accept=".pdf,application/pdf">
        </div>

        <button class="primary-button" style="margin-top:15px" onclick="extractPDFText()">
          Extract Text
        </button>

        <textarea id="pdfExtractOutput" style="margin-top:15px;min-height:220px" readonly></textarea>
      `
    },

    "typing-en": createTypingTool("en"),
    "typing-ur": createTypingTool("ur")
  };

  const selected = tools[type];

  if (!selected) {
    showToast("Tool is not available.");
    return;
  }

  toolContent.innerHTML = `
    <h2 id="modalTitle" class="modal-title">${selected.title}</h2>
    <p class="modal-subtitle">${selected.subtitle}</p>
    ${selected.html}
  `;

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";

  setTimeout(() => {
    const first = modal.querySelector("input, textarea, select, button");
    if (first) first.focus();
  }, 50);

  if (type === "word") {
    const el = $("#wordText");
    el.addEventListener("input", updateWordCounter);
  }

  if (type === "characters") {
    $("#characterText").addEventListener("input", updateCharacterCounter);
  }

  if (type === "urducounter") {
    $("#urduCountText").addEventListener("input", updateUrduCounter);
  }
}

function closeTool() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  toolContent.innerHTML = "";
  document.body.style.overflow = "";
}

/* =========================================================
   CALCULATORS
   ========================================================= */

function calculatePercentage() {
  const x = Number($("#pctX").value);
  const y = Number($("#pctY").value);

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    showToast("Please enter both numbers.");
    return;
  }

  $("#pctResult").classList.remove("hidden");
  $("#pctResult").innerHTML =
    `<div class="result-big">${formatNumber((x / 100) * y)}</div>
     ${formatNumber(x)}% of ${formatNumber(y)} = ${formatNumber((x / 100) * y)}`;
}

function calculateAge() {
  const value = $("#dob").value;

  if (!value) {
    showToast("Select your date of birth.");
    return;
  }

  const [year, month, day] = value.split("-").map(Number);

  const dob = new Date(year, month - 1, day);
  const now = new Date();

  if (dob > now) {
    showToast("Date of birth cannot be in the future.");
    return;
  }

  let years = now.getFullYear() - year;
  let months = now.getMonth() - (month - 1);
  let days = now.getDate() - day;

  if (days < 0) {
    months--;
    days += new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    ).getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  $("#ageResult").classList.remove("hidden");
  $("#ageResult").innerHTML =
    `<div class="result-big">${years} years</div>
     ${months} months and ${days} days old.`;
}

function calculateBMI() {
  const weight = Number($("#bmiWeight").value);
  const height = Number($("#bmiHeight").value) / 100;

  if (weight <= 0 || height <= 0) {
    showToast("Enter valid height and weight.");
    return;
  }

  const bmi = weight / (height * height);

  let category = "";

  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal range";
  else if (bmi < 30) category = "Overweight";
  else category = "Obesity range";

  $("#bmiResult").classList.remove("hidden");
  $("#bmiResult").innerHTML =
    `<div class="result-big">${bmi.toFixed(1)}</div>
     ${category}<br>
     <small>BMI is a general screening measure, not a diagnosis.</small>`;
}

function calculateDiscount() {
  const price = Number($("#originalPrice").value);
  const discount = Number($("#discountPct").value);

  if (price < 0 || discount < 0 || discount > 100) {
    showToast("Enter a valid price and discount.");
    return;
  }

  const amount = price * discount / 100;
  const finalPrice = price - amount;

  $("#discountResult").classList.remove("hidden");
  $("#discountResult").innerHTML =
    `<strong>Discount:</strong> ${formatNumber(amount)}<br>
     <strong>Final Price:</strong> ${formatNumber(finalPrice)}`;
}

function calculateProfit() {
  const cost = Number($("#costPrice").value);
  const selling = Number($("#sellingPrice").value);

  if (cost <= 0 || selling < 0) {
    showToast("Enter valid prices.");
    return;
  }

  const difference = selling - cost;
  const percent = Math.abs(difference / cost) * 100;

  $("#profitResult").classList.remove("hidden");

  if (difference > 0) {
    $("#profitResult").innerHTML =
      `<strong>Profit:</strong> ${formatNumber(difference)}<br>
       <strong>Profit %:</strong> ${percent.toFixed(2)}%`;
  } else if (difference < 0) {
    $("#profitResult").innerHTML =
      `<strong>Loss:</strong> ${formatNumber(Math.abs(difference))}<br>
       <strong>Loss %:</strong> ${percent.toFixed(2)}%`;
  } else {
    $("#profitResult").innerHTML = "No profit and no loss.";
  }
}

function calculateAverage() {
  const values = $("#averageInput").value
    .split(",")
    .map(x => Number(x.trim()))
    .filter(Number.isFinite);

  if (!values.length) {
    showToast("Enter numbers separated by commas.");
    return;
  }

  const average =
    values.reduce((a,b) => a + b, 0) / values.length;

  $("#averageResult").classList.remove("hidden");
  $("#averageResult").innerHTML =
    `<div class="result-big">${formatNumber(average)}</div>
     Average of ${values.length} numbers.`;
}

function gcd(a,b) {
  a = Math.abs(a);
  b = Math.abs(b);

  while (b) {
    [a,b] = [b,a % b];
  }

  return a || 1;
}

function calculateRatio() {
  const a = Number($("#ratioA").value);
  const b = Number($("#ratioB").value);

  if (!Number.isFinite(a) || !Number.isFinite(b) || a === 0 || b === 0) {
    showToast("Enter two valid non-zero numbers.");
    return;
  }

  const divisor = gcd(a,b);

  $("#ratioResult").classList.remove("hidden");
  $("#ratioResult").innerHTML =
    `<div class="result-big">${a / divisor} : ${b / divisor}</div>
     Simplified ratio`;
}

/* =========================================================
   TEXT TOOLS
   ========================================================= */

function updateWordCounter() {
  const text = $("#wordText").value;

  const words = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  const chars = Array.from(text).length;

  const sentences = text.trim()
    ? (text.match(/[.!?۔]+(?=\s|$)/g) || []).length
    : 0;

  $("#wordCount").textContent = words;
  $("#charCount").textContent = chars;
  $("#sentenceCount").textContent = sentences;
}

function updateCharacterCounter() {
  const text = $("#characterText").value;

  $("#allChars").textContent = Array.from(text).length;
  $("#noSpaceChars").textContent =
    Array.from(text.replace(/\s/g, "")).length;

  $("#lineChars").textContent =
    text ? text.split(/\r?\n/).length : 0;
}

function updateUrduCounter() {
  const text = $("#urduCountText").value;

  const words = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  $("#urduWords").textContent = words;
  $("#urduChars").textContent = Array.from(text).length;
  $("#urduLines").textContent = text ? text.split(/\r?\n/).length : 0;
}

function convertCase(mode) {
  const field = $("#caseText");

  if (mode === "upper") {
    field.value = field.value.toUpperCase();
  }

  if (mode === "lower") {
    field.value = field.value.toLowerCase();
  }

  if (mode === "title") {
    field.value = field.value.toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  }
}

function clearField(id) {
  const field = document.getElementById(id);

  if (field) {
    field.value = "";
    field.focus();
  }
}

async function copyText(id) {
  const field = document.getElementById(id);

  if (!field) return;

  try {
    await navigator.clipboard.writeText(field.value);
    showToast("Copied to clipboard.");
  } catch (_) {
    field.select();
    document.execCommand("copy");
    showToast("Copied.");
  }
}

function cleanText() {
  const field = $("#cleanText");

  field.value = field.value
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  showToast("Text cleaned.");
}

/* =========================================================
   PASSWORD
   ========================================================= */

function generatePassword() {
  let length = Number($("#passLength").value);

  length = Math.min(128, Math.max(4, length));

  const mode = $("#passMode").value;

  let chars = "";

  if (mode === "numbers") {
    chars = "0123456789";
  } else if (mode === "letters") {
    chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  } else {
    chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}";
  }

  let password = "";

  for (let i = 0; i < length; i++) {
    password += secureRandomChar(chars);
  }

  $("#passwordOutput").value = password;
}

/* =========================================================
   RANDOM
   ========================================================= */

function generateRandomNumber() {
  const min = Number($("#randomMin").value);
  const max = Number($("#randomMax").value);

  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min > max) {
    showToast("Enter valid whole numbers.");
    return;
  }

  const result = randomSecureInt(min,max);

  $("#randomResult").classList.remove("hidden");
  $("#randomResult").innerHTML =
    `<div class="result-big">${result}</div>`;
}

/* =========================================================
   IMAGE HELPERS
   ========================================================= */

function loadImage(file) {
  return new Promise((resolve,reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read image."));
    };

    img.src = url;
  });
}

function canvasDownload(canvas, type, filename, quality = .9) {
  canvas.toBlob(blob => {
    if (!blob) {
      showToast("Could not create image.");
      return;
    }

    downloadBlob(blob, filename);
  }, type, quality);
}

async function resizeImage() {
  const file = $("#resizeFile").files[0];

  if (!file) {
    showToast("Select an image.");
    return;
  }

  try {
    const img = await loadImage(file);

    const width =
      Number($("#resizeWidth").value) || img.naturalWidth;

    const height =
      Number($("#resizeHeight").value) || img.naturalHeight;

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    canvas.getContext("2d").drawImage(
      img,0,0,width,height
    );

    canvasDownload(
      canvas,
      "image/jpeg",
      "resized-image.jpg",
      .92
    );
  } catch (_) {
    showToast("Could not process image.");
  }
}

async function compressImage() {
  const file = $("#compressFile").files[0];

  if (!file) {
    showToast("Select an image.");
    return;
  }

  try {
    const img = await loadImage(file);
    const canvas = document.createElement("canvas");

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    canvas.getContext("2d").drawImage(img,0,0);

    const quality =
      Number($("#compressQuality").value) / 100;

    canvasDownload(
      canvas,
      "image/jpeg",
      "compressed-image.jpg",
      quality
    );

  } catch (_) {
    showToast("Could not compress image.");
  }
}

async function convertImage() {
  const file = $("#convertFile").files[0];

  if (!file) {
    showToast("Select an image.");
    return;
  }

  try {
    const img = await loadImage(file);

    const canvas = document.createElement("canvas");

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    canvas.getContext("2d").drawImage(img,0,0);

    const type = $("#convertFormat").value;

    const ext =
      type === "image/png" ? "png" :
      type === "image/webp" ? "webp" : "jpg";

    canvasDownload(
      canvas,
      type,
      `converted-image.${ext}`,
      .92
    );

  } catch (_) {
    showToast("Could not convert image.");
  }
}

async function cropImage() {
  const file = $("#cropFile").files[0];

  if (!file) {
    showToast("Select an image.");
    return;
  }

  try {
    const img = await loadImage(file);

    const cropW = Math.min(
      Number($("#cropWidth").value),
      img.naturalWidth
    );

    const cropH = Math.min(
      Number($("#cropHeight").value),
      img.naturalHeight
    );

    const sx = (img.naturalWidth - cropW) / 2;
    const sy = (img.naturalHeight - cropH) / 2;

    const canvas = document.createElement("canvas");

    canvas.width = cropW;
    canvas.height = cropH;

    canvas.getContext("2d").drawImage(
      img,
      sx, sy, cropW, cropH,
      0, 0, cropW, cropH
    );

    canvasDownload(
      canvas,
      "image/jpeg",
      "cropped-image.jpg",
      .92
    );

  } catch (_) {
    showToast("Could not crop image.");
  }
}

async function rotateImage() {
  const file = $("#rotateFile").files[0];

  if (!file) {
    showToast("Select an image.");
    return;
  }

  try {
    const img = await loadImage(file);
    const angle = Number($("#rotateAngle").value);

    const swap = angle === 90 || angle === 270;

    const canvas = document.createElement("canvas");

    canvas.width = swap
      ? img.naturalHeight
      : img.naturalWidth;

    canvas.height = swap
      ? img.naturalWidth
      : img.naturalHeight;

    const ctx = canvas.getContext("2d");

    ctx.translate(canvas.width / 2,canvas.height / 2);
    ctx.rotate(angle * Math.PI / 180);

    ctx.drawImage(
      img,
      -img.naturalWidth / 2,
      -img.naturalHeight / 2
    );

    canvasDownload(
      canvas,
      "image/jpeg",
      "rotated-image.jpg",
      .92
    );

  } catch (_) {
    showToast("Could not rotate image.");
  }
}

/* =========================================================
   QR
   ========================================================= */

let lastQRDataURL = "";

function generateQR() {
  const text = $("#qrText").value.trim();

  if (!text) {
    showToast("Enter text or URL.");
    return;
  }

  try {
    const qr = qrcode(0,"M");

    qr.addData(text);
    qr.make();

    const dataURL = qr.createDataURL(7,4);

    lastQRDataURL = dataURL;

    $("#qrOutput").innerHTML =
      `<img src="${dataURL}" alt="Generated QR code">`;

    $("#qrActions").classList.remove("hidden");

  } catch (_) {
    showToast("Could not generate QR code.");
  }
}

function downloadQR() {
  if (!lastQRDataURL) {
    showToast("Generate a QR code first.");
    return;
  }

  downloadDataURL(lastQRDataURL,"pakfreetools-qr.png");
}

/* =========================================================
   PDF
   ========================================================= */

function getJsPDF() {
  return window.jspdf?.jsPDF || null;
}

function imageToDataURL(file) {
  return new Promise((resolve,reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

async function imagesToPDF() {
  const files = [...$("#jpgPdfFiles").files];

  if (!files.length) {
    showToast("Select at least one image.");
    return;
  }

  const JsPDF = getJsPDF();

  if (!JsPDF) {
    showToast("PDF library is not available.");
    return;
  }

  const pdf = new JsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  for (let i = 0; i < files.length; i++) {

    if (i > 0) pdf.addPage();

    const data = await imageToDataURL(files[i]);
    const img = await loadImage(files[i]);

    const pageW = 210;
    const pageH = 297;
    const margin = 10;

    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;

    const ratio = Math.min(
      maxW / img.naturalWidth,
      maxH / img.naturalHeight
    );

    const width = img.naturalWidth * ratio;
    const height = img.naturalHeight * ratio;

    const x = (pageW - width) / 2;
    const y = (pageH - height) / 2;

    const format =
      files[i].type.includes("png") ? "PNG" : "JPEG";

    pdf.addImage(
      data,
      format,
      x,
      y,
      width,
      height
    );
  }

  pdf.save("pakfreetools-images.pdf");
  showToast("PDF downloaded.");
}

function textToPDF() {
  const text = $("#pdfText").value.trim();

  if (!text) {
    showToast("Enter some text.");
    return;
  }

  const JsPDF = getJsPDF();

  if (!JsPDF) {
    showToast("PDF library is not available.");
    return;
  }

  const pdf = new JsPDF();

  const lines = pdf.splitTextToSize(text,180);

  let y = 20;

  lines.forEach(line => {

    if (y > 280) {
      pdf.addPage();
      y = 20;
    }

    pdf.text(line,15,y);
    y += 7;
  });

  pdf.save("pakfreetools-document.pdf");
  showToast("PDF downloaded.");
}

async function wordToPDF() {
  const file = $("#wordPdfFile").files[0];

  if (!file) {
    showToast("Select a DOCX file.");
    return;
  }

  if (!window.mammoth) {
    showToast("Word library is not available.");
    return;
  }

  const JsPDF = getJsPDF();

  if (!JsPDF) {
    showToast("PDF library is not available.");
    return;
  }

  try {

    const arrayBuffer = await file.arrayBuffer();

    const result =
      await mammoth.extractRawText({
        arrayBuffer
      });

    const text = result.value.trim();

    if (!text) {
      showToast("No readable text found.");
      return;
    }

    const pdf = new JsPDF();

    const lines =
      pdf.splitTextToSize(text,180);

    let y = 20;

    lines.forEach(line => {

      if (y > 280) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(line,15,y);
      y += 7;
    });

    pdf.save("word-to-pdf.pdf");

    showToast("PDF downloaded.");

  } catch (_) {
    showToast("Could not read this Word file.");
  }
}

/* =========================================================
   PDF TEXT EXTRACTION
   Uses PDF.js loaded dynamically.
   ========================================================= */

async function loadPDFJS() {

  if (window.pdfjsLib) {
    return window.pdfjsLib;
  }

  return new Promise((resolve,reject) => {

    const script = document.createElement("script");

    script.src =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/legacy/build/pdf.min.mjs";

    script.type = "module";

    script.onload = () => resolve(window.pdfjsLib);
    script.onerror = reject;

    document.head.appendChild(script);
  });
}

/*
  Some browsers do not expose PDF.js from a module
  script in the same way. The fallback below provides
  a friendly message instead of pretending conversion worked.
*/

async function extractPDFText() {

  const file = $("#pdfTextFile").files[0];

  if (!file) {
    showToast("Select a PDF file.");
    return;
  }

  showToast("Reading PDF...");

  try {

    if (!window.pdfjsLib) {
      showToast("For PDF extraction, refresh the page once and try again.");
      return;
    }

    const buffer = await file.arrayBuffer();

    const pdf =
      await window.pdfjsLib.getDocument({
        data: buffer
      }).promise;

    let output = "";

    for (let i = 1; i <= pdf.numPages; i++) {

      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const text =
        content.items.map(item => item.str).join(" ");

      output += `\n--- Page ${i} ---\n${text}\n`;
    }

    $("#pdfExtractOutput").value =
      output.trim();

  } catch (_) {
    showToast("Could not extract this PDF.");
  }
}

async function pdfToWord() {

  const file = $("#pdfWordFile").files[0];

  if (!file) {
    showToast("Select a PDF.");
    return;
  }

  if (!window.pdfjsLib) {
    showToast("PDF reader library is not loaded. Refresh once and try again.");
    return;
  }

  try {

    const buffer = await file.arrayBuffer();

    const pdf =
      await window.pdfjsLib.getDocument({
        data: buffer
      }).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {

      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      text +=
        content.items.map(item => item.str).join(" ") +
        "\n\n";
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body>
      ${escapeHTML(text).replace(/\n/g,"<br>")}
      </body>
      </html>
    `;

    const blob =
      new Blob([html], {
        type: "application/msword"
      });

    downloadBlob(blob,"pdf-to-word.doc");

    showToast("Word-compatible document downloaded.");

  } catch (_) {
    showToast("Could not process this PDF.");
  }
}

/* =========================================================
   WORD TO EXCEL
   Creates a simple spreadsheet from paragraphs.
   ========================================================= */

async function wordToExcel() {

  const file = $("#wordExcelFile").files[0];

  if (!file) {
    showToast("Select a DOCX file.");
    return;
  }

  if (!window.mammoth) {
    showToast("Word library is not available.");
    return;
  }

  try {

    const arrayBuffer =
      await file.arrayBuffer();

    const result =
      await mammoth.extractRawText({
        arrayBuffer
      });

    const lines =
      result.value
        .split(/\r?\n/)
        .map(x => x.trim())
        .filter(Boolean);

    if (!lines.length) {
      showToast("No readable text found.");
      return;
    }

    /*
      If SheetJS is available, create real XLSX.
      Otherwise download CSV.
    */

    if (window.XLSX) {

      const rows = [
        ["No.","Text"],
        ...lines.map((text,index) => [
          index + 1,
          text
        ])
      ];

      const worksheet =
        XLSX.utils.aoa_to_sheet(rows);

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Document"
      );

      XLSX.writeFile(
        workbook,
        "word-to-excel.xlsx"
      );

      showToast("Excel file downloaded.");

    } else {

      const csv = [
        ["No.","Text"],
        ...lines.map((text,index) => [
          index + 1,
          `"${text.replaceAll('"','""')}"`
        ])
      ]
      .map(row => row.join(","))
      .join("\n");

      downloadBlob(
        new Blob([csv],{type:"text/csv;charset=utf-8"}),
        "word-to-excel.csv"
      );

      showToast("CSV spreadsheet downloaded.");

    }

  } catch (_) {
    showToast("Could not read this Word file.");
  }
}

/* =========================================================
   TYPING TEST
   ========================================================= */

const EN_PASSAGE =
  "Success comes from consistent practice. Every small improvement matters. Stay focused, type carefully, and keep improving your speed and accuracy.";

const UR_PASSAGE =
  "محنت کامیابی کی بنیاد ہے۔ ہر روز تھوڑی سی مشق انسان کی رفتار اور درستگی میں بہتری پیدا کرتی ہے۔ مستقل مزاجی کامیابی کی طرف لے جاتی ہے۔";

function createTypingTool(language) {

  const isUrdu = language === "ur";

  return {
    title: isUrdu
      ? "Urdu Typing Test"
      : "English Typing Test",

    subtitle:
      "Test your typing speed, accuracy and performance.",

    html: `
      <div class="typing-passage" dir="${isUrdu ? "rtl" : "ltr"}">
        ${isUrdu ? UR_PASSAGE : EN_PASSAGE}
      </div>

      <div class="form-group" style="margin-top:15px">
        <label>Type the passage above</label>
        <textarea
          id="typingInput"
          class="typing-area"
          ${isUrdu ? 'dir="rtl" lang="ur"' : ""}
          placeholder="Start typing..."
        ></textarea>
      </div>

      <div class="typing-results">
        <div class="typing-stat">
          <strong id="typingWPM">0</strong>
          <span>WPM</span>
        </div>

        <div class="typing-stat">
          <strong id="typingAccuracy">100%</strong>
          <span>Accuracy</span>
        </div>

        <div class="typing-stat">
          <strong id="typingTime">0s</strong>
          <span>Time</span>
        </div>
      </div>

      <button
        class="secondary-action"
        style="margin-top:15px"
        onclick="resetTyping()">
        Reset Test
      </button>
    `
  };
}

function startTypingTest() {

  if (typingStarted) return;

  typingStarted = true;
  typingStart = Date.now();

  typingTimer = setInterval(() => {

    const elapsed =
      Math.floor((Date.now() - typingStart) / 1000);

    $("#typingTime").textContent =
      `${elapsed}s`;

    updateTypingStats();

  },1000);
}

function updateTypingStats() {

  const input =
    $("#typingInput")?.value || "";

  if (!$("#typingInput")) return;

  const passage =
    $("#typingInput").closest(".modal-box")
      .querySelector(".typing-passage")
      .textContent.trim();

  if (!input) {
    $("#typingWPM").textContent = "0";
    $("#typingAccuracy").textContent = "100%";
    return;
  }

  let correct = 0;

  for (let i = 0; i < input.length; i++) {

    if (input[i] === passage[i]) {
      correct++;
    }
  }

  const accuracy =
    Math.max(
      0,
      Math.min(
        100,
        (correct / input.length) * 100
      )
    );

  const elapsedMinutes =
    Math.max(
      1 / 60,
      (Date.now() - typingStart) / 60000
    );

  const words =
    input.trim().split(/\s+/).filter(Boolean).length;

  const wpm =
    words / elapsedMinutes;

  $("#typingAccuracy").textContent =
    `${accuracy.toFixed(0)}%`;

  $("#typingWPM").textContent =
    Math.round(wpm);

  if (input.length >= passage.length) {
    clearInterval(typingTimer);
  }
}

function resetTyping() {

  clearInterval(typingTimer);

  typingStarted = false;
  typingStart = null;

  const field = $("#typingInput");

  if (field) {
    field.value = "";
    field.focus();
  }

  if ($("#typingWPM")) {
    $("#typingWPM").textContent = "0";
  }

  if ($("#typingAccuracy")) {
    $("#typingAccuracy").textContent = "100%";
  }

  if ($("#typingTime")) {
    $("#typingTime").textContent = "0s";
  }
}

document.addEventListener("input", event => {

  if (event.target.id === "typingInput") {

    if (!typingStarted) {
      startTypingTest();
    }

    updateTypingStats();
  }
});

/* =========================================================
   INITIALIZATION
   ========================================================= */

$("#year").textContent =
  new Date().getFullYear();

filterTools();

/*
  Important:
  Load PDF.js separately after the page is ready.
  This keeps the initial page lighter.
*/

const pdfScript =
  document.createElement("script");

pdfScript.src =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/legacy/build/pdf.min.js";

pdfScript.onload = () => {

  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/legacy/build/pdf.worker.min.js";
  }

};

document.head.appendChild(pdfScript);

/*
  SheetJS is loaded lazily only when Word → Excel is used.
*/

const sheetScript =
  document.createElement("script");

sheetScript.src =
  "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";

sheetScript.onerror = () => {
  console.log("SheetJS unavailable; Word to Excel will use CSV fallback.");
};

document.head.appendChild(sheetScript);
