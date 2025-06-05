const API_KEY = "9e549d15494da693c6d190fb";
const API_CONVERT_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/pair`;
const API_CODES_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/codes`;

let firstSelection = null;
let secondSelection = null;

async function initialize() {
  const sourceSelect = document.getElementById("sourceCurrencySelect");
  const targetSelect = document.getElementById("targetCurrencySelect");
  const amountInput = document.getElementById("amountInput");
  const svgObject = document.getElementById("svgMap");

  const respCodes = await fetch(API_CODES_URL);
  const jsonCodes = await respCodes.json();
  const codes = jsonCodes.supported_codes || [];
  codes.forEach(([code, name]) => {
    const option1 = document.createElement("option");
    option1.value = code;
    option1.textContent = `${code} - ${name}`;
    sourceSelect.appendChild(option1);
    const option2 = document.createElement("option");
    option2.value = code;
    option2.textContent = `${code} - ${name}`;
    targetSelect.appendChild(option2);
  });

  svgObject.addEventListener("load", () => {
    const svgDoc = svgObject.contentDocument;
    const svgPaths = svgDoc.querySelectorAll("path");
    svgPaths.forEach((path) => {
      const rawId = path.getAttribute("id") || path.getAttribute("class");
      const rawName = path.getAttribute("name") || path.getAttribute("class");
      if (!rawId || !rawName) return;
      const countryId = rawId.toUpperCase();
      const countryName = rawName;
      path.addEventListener("click", async () => {
        await handleCountryClick(countryId, countryName, path, svgPaths);
      });
    });
  });

  amountInput.addEventListener("input", () => {
    updateConversion();
  });
  sourceSelect.addEventListener("change", () => {
    updateConversion();
  });
  targetSelect.addEventListener("change", () => {
    updateConversion();
  });
}

async function handleCountryClick(countryId, countryName, path, allPaths) {
  if (firstSelection && firstSelection.id === countryId) {
    path.style.fill = "";
    firstSelection = null;
    clearConversion();
    return;
  }
  if (secondSelection && secondSelection.id === countryId) {
    path.style.fill = "";
    secondSelection = null;
    clearConversion();
    return;
  }
  if (!firstSelection) {
    clearConversion();
    firstSelection = { id: countryId, name: countryName, path, currency: null };
    allPaths.forEach((p) => (p.style.fill = ""));
    path.style.fill = "red";
    try {
      firstSelection.currency = await fetchCurrency(countryId, countryName);
      document.getElementById("sourceCurrencySelect").value = firstSelection.currency;
    } catch {
      firstSelection.currency = null;
    }
  } else if (!secondSelection) {
    clearConversion();
    secondSelection = { id: countryId, name: countryName, path, currency: null };
    path.style.fill = "blue";
    try {
      secondSelection.currency = await fetchCurrency(countryId, countryName);
      document.getElementById("targetCurrencySelect").value = secondSelection.currency;
    } catch {
      secondSelection.currency = null;
    }
  } else {
    allPaths.forEach((p) => (p.style.fill = ""));
    clearConversion();
    firstSelection = { id: countryId, name: countryName, path, currency: null };
    secondSelection = null;
    path.style.fill = "red";
    try {
      firstSelection.currency = await fetchCurrency(countryId, countryName);
      document.getElementById("sourceCurrencySelect").value = firstSelection.currency;
    } catch {
      firstSelection.currency = null;
    }
  }
  updateConversion();
}

async function updateConversion() {
  const amountInput = document.getElementById("amountInput");
  const sourceSelect = document.getElementById("sourceCurrencySelect");
  const targetSelect = document.getElementById("targetCurrencySelect");
  const value = parseFloat(amountInput.value);
  const sourceCode = sourceSelect.value;
  const targetCode = targetSelect.value;
  if (!sourceCode || !targetCode || isNaN(value)) {
    clearConversion();
    return;
  }
  try {
    const rate = await fetchExchangeRate(sourceCode, targetCode);
    const converted = (value * rate).toLocaleString("fr-FR", { maximumFractionDigits: 2 });
    showConversion(`${value.toLocaleString("fr-FR")} ${sourceCode} = ${converted} ${targetCode}`);
  } catch {
    showConversion("Impossible de comparer les devises.");
  }
}

function clearConversion() {
  const existing = document.getElementById("conversionResult");
  if (existing) {
    existing.remove();
  }
}

function showConversion(message) {
  clearConversion();
  const output = document.createElement("div");
  output.id = "conversionResult";
  output.style.marginTop = "20px";
  output.style.fontSize = "18px";
  output.style.fontWeight = "bold";
  output.textContent = message;
  document.body.appendChild(output);
}

async function fetchCurrency(countryId, countryName) {
  const maybeIso = countryId.length === 2 || countryId.length === 3;
  if (maybeIso) {
    const alphaUrl = `https://restcountries.com/v3.1/alpha/${countryId}`;
    const respAlpha = await fetch(alphaUrl);
    if (respAlpha.ok) {
      const dataAlpha = await respAlpha.json();
      if (Array.isArray(dataAlpha) && dataAlpha.length > 0) {
        const currencies = dataAlpha[0].currencies || {};
        const codes = Object.keys(currencies);
        if (codes.length > 0) return codes[0];
      }
    }
  }
  const nameEncoded = encodeURIComponent(countryName);
  const nameUrl = `https://restcountries.com/v3.1/name/${nameEncoded}?fullText=true`;
  const respName = await fetch(nameUrl);
  if (!respName.ok) throw new Error();
  const dataName = await respName.json();
  if (!Array.isArray(dataName) || dataName.length === 0) throw new Error();
  const currencies = dataName[0].currencies || {};
  const codes = Object.keys(currencies);
  if (codes.length === 0) throw new Error();
  return codes[0];
}

async function fetchExchangeRate(baseCurrency, targetCurrency) {
  const url = `${API_CONVERT_URL}/${baseCurrency}/${targetCurrency}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error();
  const json = await resp.json();
  if (json.result !== "success") throw new Error();
  return json.conversion_rate;
}

initialize();
