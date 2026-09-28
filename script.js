/* =====================================================
   PakFreeTools
   Main JavaScript
   ===================================================== */


/* ===============================
   GLOBAL ELEMENTS
================================ */

const searchInput = document.getElementById("toolSearch");
const toolGrid = document.getElementById("toolGrid");
const toolCount = document.getElementById("toolCount");

const modal = document.getElementById("toolModal");
const toolContent = document.getElementById("toolContent");

const themeButton = document.getElementById("themeButton");


/* ===============================
   SEARCH
================================ */

if (searchInput) {

  searchInput.addEventListener("input", function () {

    const search = this.value.toLowerCase().trim();

    const cards = document.querySelectorAll(".tool-card");

    let visible = 0;

    cards.forEach(card => {

      const name =
        card.dataset.name.toLowerCase();

      const category =
        card.dataset.category.toLowerCase();

      if (
        name.includes(search) ||
        category.includes(search)
      ) {

        card.style.display = "";

        visible++;

      } else {

        card.style.display = "none";

      }

    });

    if (toolCount) {

      toolCount.textContent =
        visible + " Tools";

    }

  });

}


/* ===============================
   CATEGORY FILTER
================================ */

function filterCategory(category) {

  const cards =
    document.querySelectorAll(".tool-card");

  let visible = 0;

  cards.forEach(card => {

    if (
      card.dataset.category === category
    ) {

      card.style.display = "";

      visible++;

    } else {

      card.style.display = "none";

    }

  });

  if (toolCount) {

    toolCount.textContent =
      visible + " Tools";

  }

  document
    .getElementById("tools")
    .scrollIntoView({
      behavior: "smooth"
    });

}


/* ===============================
   SHOW ALL TOOLS
================================ */

function showAllTools() {

  const cards =
    document.querySelectorAll(".tool-card");

  cards.forEach(card => {

    card.style.display = "";

  });

  if (toolCount) {

    toolCount.textContent =
      cards.length + " Tools";

  }

}


/* ===============================
   OPEN TOOL
================================ */

function openTool(tool) {

  modal.classList.remove("hidden");

  let html = "";


  /* -----------------------------
     Percentage Calculator
  ------------------------------ */

  if (tool === "percentage") {

    html = `

      <h2>Percentage Calculator</h2>

      <p>
        Calculate what percentage one number is of another.
      </p>

      <div class="form-group">

        <label>Value</label>

        <input
          type="number"
          id="percentageValue"
          placeholder="Example: 50"
        >

      </div>

      <div class="form-group">

        <label>Total</label>

        <input
          type="number"
          id="percentageTotal"
          placeholder="Example: 100"
        >

      </div>

      <button
        class="primary-button"
        onclick="calculatePercentage()">

        Calculate

      </button>

      <div
        id="percentageResult"
        class="result-box">

      </div>

    `;

  }


  /* -----------------------------
     Age Calculator
  ------------------------------ */

  else if (tool === "age") {

    html = `

      <h2>Age Calculator</h2>

      <p>
        Calculate your age from your date of birth.
      </p>

      <div class="form-group">

        <label>Date of Birth</label>

        <input
          type="date"
          id="birthDate"
        >

      </div>

      <button
        class="primary-button"
        onclick="calculateAge()">

        Calculate Age

      </button>

      <div
        id="ageResult"
        class="result-box">

      </div>

    `;

  }


  /* -----------------------------
     BMI Calculator
  ------------------------------ */

  else if (tool === "bmi") {

    html = `

      <h2>BMI Calculator</h2>

      <p>
        Enter your weight and height.
      </p>

      <div class="form-group">

        <label>Weight (kg)</label>

        <input
          type="number"
          id="weight"
          placeholder="Example: 70"
        >

      </div>

      <div class="form-group">

        <label>Height (cm)</label>

        <input
          type="number"
          id="height"
          placeholder="Example: 175"
        >

      </div>

      <button
        class="primary-button"
        onclick="calculateBMI()">

        Calculate BMI

      </button>

      <div
        id="bmiResult"
        class="result-box">

      </div>

    `;

  }


  /* -----------------------------
     Discount Calculator
  ------------------------------ */

  else if (tool === "discount") {

    html = `

      <h2>Discount Calculator</h2>

      <div class="form-group">

        <label>Original Price</label>

        <input
          type="number"
          id="originalPrice"
          placeholder="Example: 5000"
        >

      </div>

      <div class="form-group">

        <label>Discount (%)</label>

        <input
          type="number"
          id="discountPercent"
          placeholder="Example: 20"
        >

      </div>

      <button
        class="primary-button"
        onclick="calculateDiscount()">

        Calculate

      </button>

      <div
        id="discountResult"
        class="result-box">

      </div>

    `;

  }


  /* -----------------------------
     Profit / Loss
  ------------------------------ */

  else if (tool === "profit") {

    html = `

      <h2>Profit / Loss Calculator</h2>

      <div class="form-group">

        <label>Cost Price</label>

        <input
          type="number"
          id="costPrice"
          placeholder="Example: 1000"
        >

      </div>

      <div class="form-group">

        <label>Selling Price</label>

        <input
          type="number"
          id="sellingPrice"
          placeholder="Example: 1300"
        >

      </div>

      <button
        class="primary-button"
        onclick="calculateProfit()">

        Calculate

      </button>

      <div
        id="profitResult"
        class="result-box">

      </div>

    `;

  }


  /* -----------------------------
     Word Counter
  ------------------------------ */

  else if (tool === "word") {

    html = `

      <h2>Word Counter</h2>

      <div class="form-group">

        <label>Your Text</label>

        <textarea
          id="wordText"
          rows="8"
          placeholder="Write or paste your text here...">

        </textarea>

      </div>

      <button
        class="primary-button"
        onclick="countWords()">

        Count Words

      </button>

      <div
        id="wordResult"
        class="result-box">

      </div>

    `;

  }


  /* -----------------------------
     Character Counter
  ------------------------------ */

  else if (tool === "characters") {

    html = `

      <h2>Character Counter</h2>

      <div class="form-group">

        <label>Your Text</label>

        <textarea
          id="characterText"
          rows="8"
          placeholder="Write or paste text...">

        </textarea>

      </div>

      <button
        class="primary-button"
        onclick="countCharacters()">

        Count Characters

      </button>

      <div
        id="characterResult"
        class="result-box">

      </div>

    `;

  }


  /* -----------------------------
     Case Converter
  ------------------------------ */

  else if (tool === "case") {

    html = `

      <h2>Case Converter</h2>

      <div class="form-group">

        <textarea
          id="caseText"
          rows="8"
          placeholder="Write your text...">

        </textarea>

      </div>

      <button
        class="primary-button"
        onclick="convertCase()">

        Convert Text

      </button>

      <div
        id="caseResult"
        class="result-box">

      </div>

    `;

  }


  /* -----------------------------
     QR Generator
  ------------------------------ */

  else if (tool === "qr") {

    html = `

      <h2>QR Code Generator</h2>

      <p>
        Enter text, website URL or any information.
      </p>

      <div class="form-group">

        <input
          type="text"
          id="qrText"
          placeholder="https://example.com"
        >

      </div>

      <button
        class="primary-button"
        onclick="generateQR()">

        Generate QR Code

      </button>

      <div
        id="qrResult"
        class="result-box">

      </div>

    `;

  }


  /* -----------------------------
     Password Generator
  ------------------------------ */

  else if (tool === "password") {

    html = `

      <h2>Password Generator</h2>

      <div class="form-group">

        <label>Password Length</label>

        <input
          type="number"
          id="passwordLength"
          value="16"
          min="6"
          max="64"
        >

      </div>

      <button
        class="primary-button"
        onclick="generatePassword()">

        Generate Password

      </button>

      <div
        id="passwordResult"
        class="result-box">

      </div>

    `;

  }


  /* -----------------------------
     Random Number
  ------------------------------ */

  else if (tool === "random") {

    html = `

      <h2>Random Number Generator</h2>

      <div class="form-group">

        <label>Minimum</label>

        <input
          type="number"
          id="randomMin"
          placeholder="1"
        >

      </div>

      <div class="form-group">

        <label>Maximum</label>

        <input
          type="number"
          id="randomMax"
          placeholder="100"
        >

      </div>

      <button
        class="primary-button"
        onclick="generateRandom()">

        Generate

      </button>

      <div
        id="randomResult"
        class="result-box">

      </div>

    `;

  }


  /* -----------------------------
     Image Resizer
  ------------------------------ */

  else if (tool === "resize") {

    html = `

      <h2>Image Resizer</h2>

      <div class="form-group">

        <label>Select Image</label>

        <input
          type="file"
          id="resizeImage"
          accept="image/*"
        >

      </div>

      <button
        class="primary-button"
        onclick="resizeImage()">

        Resize Image

      </button>

      <div
        id="resizeResult"
        class="result-box">

      </div>

    `;

  }


  /* -----------------------------
     Image Compressor
  ------------------------------ */

  else if (tool === "compress") {

    html = `

      <h2>Image Compressor</h2>

      <div class="form-group">

        <label>Select Image</label>

        <input
          type="file"
          id="compressImage"
          accept="image/*"
        >

      </div>

      <button
        class="primary-button"
        onclick="compressImage()">

        Compress Image

      </button>

      <div
        id="compressResult"
        class="result-box">

      </div>

    `;

  }


  /* -----------------------------
     JPG / PNG Converter
  ------------------------------ */

  else if (tool === "converter") {

    html = `

      <h2>JPG / PNG Converter</h2>

      <div class="form-group">

        <label>Select Image</label>

        <input
          type="file"
          id="convertImage"
          accept="image/*"
        >

      </div>

      <button
        class="primary-button"
        onclick="convertImage()">

        Convert to PNG

      </button>

      <div
        id="convertResult"
        class="result-box">

      </div>

    `;

  }


  /* -----------------------------
     JPG to PDF
  ------------------------------ */

  else if (tool === "jpgpdf") {

    html = `

      <h2>JPG to PDF</h2>

      <p>
        Select an image and prepare it for PDF printing.
      </p>

      <div class="form-group">

        <input
          type="file"
          id="pdfImage"
          accept="image/*"
        >

      </div>

      <button
        class="primary-button"
        onclick="preparePDF()">

        Prepare Image

      </button>

      <div
        id="pdfResult"
        class="result-box">

      </div>

    `;

  }


  toolContent.innerHTML = html;

}


/* ===============================
   CLOSE MODAL
================================ */

function closeTool() {

  modal.classList.add("hidden");

  toolContent.innerHTML = "";

}


if (modal) {

  modal.addEventListener("click", function(event) {

    if (event.target === modal) {

      closeTool();

    }

  });

}


/* ===============================
   PERCENTAGE
================================ */

function calculatePercentage() {

  const value =
    Number(
      document.getElementById("percentageValue").value
    );

  const total =
    Number(
      document.getElementById("percentageTotal").value
    );

  const result =
    document.getElementById("percentageResult");


  if (!total) {

    result.textContent =
      "Please enter valid values.";

    return;

  }


  const percentage =
    (value / total) * 100;


  result.textContent =
    `${percentage.toFixed(2)}%`;

}


/* ===============================
   AGE
================================ */

function calculateAge() {

  const date =
    document.getElementById("birthDate").value;

  const result =
    document.getElementById("ageResult");


  if (!date) {

    result.textContent =
      "Please select your date of birth.";

    return;

  }


  const birth =
    new Date(date);

  const today =
    new Date();


  let age =
    today.getFullYear() -
    birth.getFullYear();


  const month =
    today.getMonth() -
    birth.getMonth();


  if (
    month < 0 ||
    (
      month === 0 &&
      today.getDate() < birth.getDate()
    )
  ) {

    age--;

  }


  result.textContent =
    `Your age is ${age} years.`;

}


/* ===============================
   BMI
================================ */

function calculateBMI() {

  const weight =
    Number(
      document.getElementById("weight").value
    );

  const height =
    Number(
      document.getElementById("height").value
    );


  const result =
    document.getElementById("bmiResult");


  if (
    !weight ||
    !height ||
    height <= 0
  ) {

    result.textContent =
      "Please enter valid values.";

    return;

  }


  const heightMeter =
    height / 100;


  const bmi =
    weight /
    (heightMeter * heightMeter);


  let status;


  if (bmi < 18.5) {

    status = "Underweight";

  }

  else if (bmi < 25) {

    status = "Normal";

  }

  else if (bmi < 30) {

    status = "Overweight";

  }

  else {

    status = "Obesity";

  }


  result.textContent =
    `BMI: ${bmi.toFixed(1)} — ${status}`;

}


/* ===============================
   DISCOUNT
================================ */

function calculateDiscount() {

  const price =
    Number(
      document.getElementById("originalPrice").value
    );

  const discount =
    Number(
      document.getElementById("discountPercent").value
    );


  const result =
    document.getElementById("discountResult");


  if (
    !price ||
    discount < 0
  ) {

    result.textContent =
      "Please enter valid values.";

    return;

  }


  const saved =
    price * discount / 100;


  const finalPrice =
    price - saved;


  result.textContent =
    `You save: ${saved.toFixed(2)}
Final Price: ${finalPrice.toFixed(2)}`;

}


/* ===============================
   PROFIT / LOSS
================================ */

function calculateProfit() {

  const cost =
    Number(
      document.getElementById("costPrice").value
    );

  const selling =
    Number(
      document.getElementById("sellingPrice").value
    );


  const result =
    document.getElementById("profitResult");


  if (!cost) {

    result.textContent =
      "Please enter a valid cost price.";

    return;

  }


  const difference =
    selling - cost;


  const percentage =
    Math.abs(difference / cost * 100);


  if (difference > 0) {

    result.textContent =
      `Profit: ${difference.toFixed(2)}
Profit Percentage: ${percentage.toFixed(2)}%`;

  }

  else if (difference < 0) {

    result.textContent =
      `Loss: ${Math.abs(difference).toFixed(2)}
Loss Percentage: ${percentage.toFixed(2)}%`;

  }

  else {

    result.textContent =
      "No Profit, No Loss.";

  }

}


/* ===============================
   WORD COUNTER
================================ */

function countWords() {

  const text =
    document.getElementById("wordText").value.trim();


  const result =
    document.getElementById("wordResult");


  if (!text) {

    result.textContent =
      "Words: 0";

    return;

  }


  const words =
    text.split(/\s+/);


  result.textContent =
    `Words: ${words.length}`;

}


/* ===============================
   CHARACTER COUNTER
================================ */

function countCharacters() {

  const text =
    document.getElementById("characterText").value;


  const result =
    document.getElementById("characterResult");


  result.textContent =
    `Characters: ${text.length}`;

}


/* ===============================
   CASE CONVERTER
================================ */

function convertCase() {

  const text =
    document.getElementById("caseText").value;


  const result =
    document.getElementById("caseResult");


  if (!text) {

    result.textContent =
      "Please enter some text.";

    return;

  }


  result.textContent =
    "UPPERCASE:\n" +
    text.toUpperCase() +
    "\n\n" +
    "lowercase:\n" +
    text.toLowerCase();

}


/* ===============================
   QR CODE
================================ */

function generateQR() {

  const text =
    document.getElementById("qrText").value.trim();


  const result =
    document.getElementById("qrResult");


  if (!text) {

    result.textContent =
      "Please enter text or a URL.";

    return;

  }


  const encoded =
    encodeURIComponent(text);


  result.innerHTML = `

    <img
      src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encoded}"
      alt="QR Code"
      style="max-width:250px;display:block;margin:auto;"
    >

    <br>

    <a
      href="https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encoded}"
      target="_blank">

      Open / Save QR Code

    </a>

  `;

}


/* ===============================
   PASSWORD
================================ */

function generatePassword() {

  const length =
    Number(
      document.getElementById("passwordLength").value
    );


  const result =
    document.getElementById("passwordResult");


  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ" +
    "abcdefghijkmnopqrstuvwxyz" +
    "23456789!@#$%^&*";


  let password = "";


  for (
    let i = 0;
    i < length;
    i++
  ) {

    const random =
      Math.floor(
        Math.random() *
        characters.length
      );

    password +=
      characters[random];

  }


  result.textContent =
    password;

}


/* ===============================
   RANDOM NUMBER
================================ */

function generateRandom() {

  const min =
    Number(
      document.getElementById("randomMin").value
    );

  const max =
    Number(
      document.getElementById("randomMax").value
    );


  const result =
    document.getElementById("randomResult");


  if (
    isNaN(min) ||
    isNaN(max) ||
    min > max
  ) {

    result.textContent =
      "Please enter a valid range.";

    return;

  }


  const number =
    Math.floor(
      Math.random() *
      (max - min + 1)
    ) + min;


  result.textContent =
    number;

}


/* ===============================
   IMAGE RESIZER
================================ */

function resizeImage() {

  const file =
    document.getElementById("resizeImage").files[0];

  const result =
    document.getElementById("resizeResult");


  if (!file) {

    result.textContent =
      "Please select an image.";

    return;

  }


  const image =
    new Image();

  const url =
    URL.createObjectURL(file);


  image.onload = function () {

    const canvas =
      document.createElement("canvas");


    const maxWidth = 1200;

    const scale =
      Math.min(
        1,
        maxWidth / image.width
      );


    canvas.width =
      image.width * scale;

    canvas.height =
      image.height * scale;


    const context =
      canvas.getContext("2d");


    context.drawImage(
      image,
      0,
      0,
      canvas.width,
      canvas.height
    );


    canvas.toBlob(function(blob) {

      const download =
        URL.createObjectURL(blob);


      result.innerHTML = `

        Image resized successfully.

        <br><br>

        <a
          class="primary-button"
          href="${download}"
          download="resized-image.jpg">

          Download Image

        </a>

      `;

    }, "image/jpeg", 0.90);

  };


  image.src = url;

}


/* ===============================
   IMAGE COMPRESSOR
================================ */

function compressImage() {

  const file =
    document.getElementById("compressImage").files[0];

  const result =
    document.getElementById("compressResult");


  if (!file) {

    result.textContent =
      "Please select an image.";

    return;

  }


  const image =
    new Image();

  const url =
    URL.createObjectURL(file);


  image.onload = function () {

    const canvas =
      document.createElement("canvas");


    canvas.width =
      image.width;

    canvas.height =
      image.height;


    const context =
      canvas.getContext("2d");


    context.drawImage(
      image,
      0,
      0
    );


    canvas.toBlob(function(blob) {

      const download =
        URL.createObjectURL(blob);


      result.innerHTML = `

        Image compressed successfully.

        <br><br>

        <a
          class="primary-button"
          href="${download}"
          download="compressed-image.jpg">

          Download Image

        </a>

      `;

    }, "image/jpeg", 0.65);

  };


  image.src = url;

}


/* ===============================
   IMAGE CONVERTER
================================ */

function convertImage() {

  const file =
    document.getElementById("convertImage").files[0];

  const result =
    document.getElementById("convertResult");


  if (!file) {

    result.textContent =
      "Please select an image.";

    return;

  }


  const image =
    new Image();

  const url =
    URL.createObjectURL(file);


  image.onload = function () {

    const canvas =
      document.createElement("canvas");


    canvas.width =
      image.width;

    canvas.height =
      image.height;


    const context =
      canvas.getContext("2d");


    context.drawImage(
      image,
      0,
      0
    );


    canvas.toBlob(function(blob) {

      const download =
        URL.createObjectURL(blob);


      result.innerHTML = `

        Image converted to PNG.

        <br><br>

        <a
          class="primary-button"
          href="${download}"
          download="converted-image.png">

          Download PNG

        </a>

      `;

    }, "image/png");

  };


  image.src = url;

}


/* ===============================
   JPG TO PDF PREVIEW
================================ */

function preparePDF() {

  const file =
    document.getElementById("pdfImage").files[0];

  const result =
    document.getElementById("pdfResult");


  if (!file) {

    result.textContent =
      "Please select an image.";

    return;

  }


  const url =
    URL.createObjectURL(file);


  result.innerHTML = `

    <img
      src="${url}"
      style="
        max-width:100%;
        max-height:400px;
        display:block;
        margin:auto;
      "
    >

    <br>

    <p>
      Image ready. Use your browser's
      <strong>Print → Save as PDF</strong>
      option.
    </p>

    <button
      class="primary-button"
      onclick="window.print()">

      Print / Save as PDF

    </button>

  `;

}


/* ===============================
   DARK MODE
================================ */

if (themeButton) {

  themeButton.addEventListener(
    "click",
    function () {

      document.body.classList.toggle("dark");


      if (
        document.body.classList.contains("dark")
      ) {

        themeButton.textContent = "☀️";

        localStorage.setItem(
          "theme",
          "dark"
        );

      }

      else {

        themeButton.textContent = "🌙";

        localStorage.setItem(
          "theme",
          "light"
        );

      }

    }
  );

}


/* ===============================
   LOAD SAVED THEME
================================ */

if (
  localStorage.getItem("theme") === "dark"
) {

  document.body.classList.add("dark");

  if (themeButton) {

    themeButton.textContent = "☀️";

  }

}


/* ===============================
   ESC KEY CLOSE MODAL
================================ */

document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key === "Escape" &&
      !modal.classList.contains("hidden")
    ) {

      closeTool();

    }

  }
);