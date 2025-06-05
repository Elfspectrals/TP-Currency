const API_KEY = "9e549d15494da693c6d190fb";
const API_CONVERT_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/pair`;

function selectCountry() {
  const svgObject = document.getElementById("svgMap");
  const countrySelect = document.querySelector("select");
  const countries = [];

  svgObject.addEventListener("load", () => {
    const svgDoc = svgObject.contentDocument;
    const svgPaths = svgDoc.querySelectorAll("path");

    svgPaths.forEach((path) => {
      // On récupère id et name (soit on a un code ISO, soit un nom complet)
      const rawId = path.getAttribute("id") || path.getAttribute("class");
      const rawName = path.getAttribute("name") || path.getAttribute("class");

      if (!rawId || !rawName) return;

      // Pour mettre dans la <select>, on stocke toujours la majuscule de l'id
      // (même si ce n'est pas un ISO, on l'affiche tel quel)
      const countryId = rawId.toUpperCase();
      const countryName = rawName;

      countries.push({ id: countryId, name: countryName });

      path.addEventListener("click", async () => {
        // 1) Mise en évidence visuelle
        svgPaths.forEach((p) => (p.style.fill = "")); // on réinitialise les autres
        path.style.fill = "red";

        // 2) On sélectionne dans la <select>
        countrySelect.value = countryId;

        // 3) On tente de récupérer la devise
        try {
          // On envoie à notre fonction à la fois l'id (qui peut être un ISO 2/3
          // ou un nom complet) et le nom
          const currencyCode = await fetchCurrencyForCountry(countryId, countryName);
          console.log(`Devise pour ${countryName} : ${currencyCode}`);

          // 4) Exemple de conversion vers EUR (vous pouvez changer "EUR" par "USD", etc.)
          const base = currencyCode;
          const target = "EUR";

          if (base !== target) {
            const rate = await fetchExchangeRate(base, target);
            console.log(`1 ${base} = ${rate} ${target}`);
            showConversionResult(
              `1 ${base} = ${rate.toLocaleString("fr-FR")} ${target}`
            );
          } else {
            showConversionResult(`La devise est déjà ${target}.`);
          }
        } catch (err) {
          console.error(err);
          showConversionResult("Impossible de récupérer la devise.");
        }
      });
    });

    // On remplit la <select> avec la liste dédoublonnée/triée
    const uniqueSorted = getSortedUniqueCountries(countries);
    uniqueSorted.forEach(({ id, name }) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = name;
      countrySelect.appendChild(option);
    });

    // Si l’utilisateur choisit directement dans le <select> (au lieu de cliquer sur la carte)
    countrySelect.addEventListener("change", async () => {
      const selectedCode = countrySelect.value;
      if (!selectedCode) {
        showConversionResult("");
        return;
      }

      // On trouve le <path> correspondant pour le surligner
      const selectedPath = svgDoc.getElementById(selectedCode.toLowerCase());
      svgPaths.forEach((p) => (p.style.fill = ""));
      if (selectedPath) {
        selectedPath.style.fill = "red";
      }

      // On cherche le nom dans notre tableau `countries`
      const countryEntry = countries.find((c) => c.id === selectedCode);
      const countryName = countryEntry ? countryEntry.name : selectedCode;

      try {
        const currencyCode = await fetchCurrencyForCountry(selectedCode, countryName);
        console.log(`Devise pour ${countryName} : ${currencyCode}`);
        const base = currencyCode;
        const target = "EUR";
        if (base !== target) {
          const rate = await fetchExchangeRate(base, target);
          showConversionResult(
            `1 ${base} = ${rate.toLocaleString("fr-FR")} ${target}`
          );
        } else {
          showConversionResult(`La devise est déjà ${target}.`);
        }
      } catch (err) {
        console.error(err);
        showConversionResult("Impossible de récupérer la devise.");
      }
    });
  });
}

/**
 * Essaie d’abord /alpha/{code} ; si réponse 400, retente /name/{nom}?fullText=true.
 * Retourne un string ISO 4217 (ex. "EUR", "USD").
 */
async function fetchCurrencyForCountry(countryId, countryName) {
  // 1) On tente /alpha/{code} si countryId fait 2 ou 3 caractères
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
    // Si on arrive ici, soit 404, soit pas de currencies, soit 400… on continue en essayant le nom.
  }

  // 2) On retente avec /name/{nom}?fullText=true
  //    (encodeURIComponent au cas où le nom a des espaces, accents, etc.)
  const nameEncoded = encodeURIComponent(countryName);
  const nameUrl = `https://restcountries.com/v3.1/name/${nameEncoded}?fullText=true`;
  const respName = await fetch(nameUrl);
  if (!respName.ok) {
    throw new Error(`Échec REST Countries (name) : ${respName.status}`);
  }
  const dataName = await respName.json();
  if (!Array.isArray(dataName) || dataName.length === 0) {
    throw new Error("Aucun résultat pour ce nom de pays");
  }
  const currencies = dataName[0].currencies || {};
  const codes = Object.keys(currencies);
  if (codes.length === 0) {
    throw new Error("Aucune devise trouvée pour ce pays");
  }
  return codes[0];
}

/**
 * Appelle ExchangeRate-API pour avoir le taux « BASE → TARGET »
 */
async function fetchExchangeRate(baseCurrency, targetCurrency) {
  const url = `${API_CONVERT_URL}/${baseCurrency}/${targetCurrency}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Échec ExchangeRate (${resp.status})`);
  }
  const json = await resp.json();
  if (json.result !== "success") {
    throw new Error("Échec de la conversion ExchangeRate");
  }
  return json.conversion_rate;
}

/**
 * Affiche (ou met à jour) un <div id="conversionResult"> en bas de page
 */
function showConversionResult(message) {
  let output = document.getElementById("conversionResult");
  if (!output) {
    output = document.createElement("div");
    output.id = "conversionResult";
    output.style.marginTop = "20px";
    output.style.fontSize = "18px";
    output.style.fontWeight = "bold";
    document.body.appendChild(output);
  }
  output.textContent = message;
}

/**
 * Dédoublonne par nom et trie alphabétiquement
 */
function getSortedUniqueCountries(countries) {
  const seen = new Set();
  const unique = [];
  countries.forEach(({ id, name }) => {
    if (!seen.has(name)) {
      seen.add(name);
      unique.push({ id, name });
    }
  });
  unique.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  return unique;
}

// Lancement
selectCountry();
