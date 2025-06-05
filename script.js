// script.js

const API_KEY = "9e549d15494da693c6d190fb";
const API_CONVERT_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/pair`;

let firstSelection = null;
let secondSelection = null;

function selectTwoCountries() {
  const svgObject = document.getElementById("svgMap");
  const amountInput = document.getElementById("amountInput");
  const firstNameEl = document.getElementById("firstCountryName");
  const secondNameEl = document.getElementById("secondCountryName");

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
        handleCountryClick(countryId, countryName, path, svgPaths);
        // Met à jour l'affichage des noms
        firstNameEl.textContent = firstSelection ? firstSelection.name : "Aucun";
        secondNameEl.textContent = secondSelection ? secondSelection.name : "Aucun";
      });
    });

    amountInput.addEventListener("input", () => {
      updateConversion();
    });
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
    } catch {
      firstSelection.currency = null;
    }
  } else if (!secondSelection) {
    clearConversion();
    secondSelection = { id: countryId, name: countryName, path, currency: null };
    path.style.fill = "blue";
    try {
      secondSelection.currency = await fetchCurrency(countryId, countryName);
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
    } catch {
      firstSelection.currency = null;
    }
  }
  updateConversion();
}

async function updateConversion() {
  const amountInput = document.getElementById("amountInput");
  const value = parseFloat(amountInput.value);
  if (
    !firstSelection ||
    !secondSelection ||
    !firstSelection.currency ||
    !secondSelection.currency ||
    isNaN(value)
  ) {
    clearConversion();
    return;
  }
  try {
    const rate = await fetchExchangeRate(firstSelection.currency, secondSelection.currency);
    const converted = (value * rate).toLocaleString("fr-FR", { maximumFractionDigits: 2 });
    showConversion(`${value.toLocaleString("fr-FR")} ${firstSelection.currency} = ${converted} ${secondSelection.currency}`);
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

selectTwoCountries();
