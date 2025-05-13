const API_KEY = "9e549d15494da693c6d190fb";
const API_CODES_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/codes`;
const API_CONVERT_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/pair`;

const fromCurrency = document.getElementById("from-currency");
const toCurrency = document.getElementById("to-currency");
const amountInput = document.getElementById("amount");
const resultDisplay = document.getElementById("result");

// Fonction qui effectue la conversion
function convert() {
  const amount = parseFloat(amountInput.value);
  const from = fromCurrency.value;
  const to = toCurrency.value;

  if (isNaN(amount) || amount <= 0) {
    resultDisplay.textContent = "Veuillez entrer un montant valide.";
    return;
  }

  const url = `${API_CONVERT_URL}/${from}/${to}/${amount}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.result === "success") {
        resultDisplay.textContent = `${amount} ${from} = ${data.conversion_result.toFixed(2)} ${to}`;
      } else {
        resultDisplay.textContent = "Erreur lors de la conversion.";
      }
    })
    .catch(error => {
      console.error("Erreur de conversion :", error);
      resultDisplay.textContent = "Impossible de faire la conversion.";
    });
}

// Charger les devises
fetch(API_CODES_URL)
  .then(response => response.json())
  .then(data => {
    if (data.result === "success") {
      const currencies = data.supported_codes;

      currencies.forEach(([code, name]) => {
        const option1 = document.createElement("option");
        option1.value = code;
        option1.text = `${name} (${code})`;

        const option2 = option1.cloneNode(true);

        fromCurrency.appendChild(option1);
        toCurrency.appendChild(option2);
      });

      fromCurrency.value = "EUR";
      toCurrency.value = "USD";

      // Convertir dès le chargement si un montant est déjà présent
      convert();
    } else {
      resultDisplay.textContent = "Erreur lors du chargement des devises.";
    }
  })
  .catch(error => {
    console.error("Erreur API :", error);
    resultDisplay.textContent = "Erreur de connexion à l’API.";
  });

// Écoute les changements
amountInput.addEventListener("input", convert);
fromCurrency.addEventListener("change", convert);
toCurrency.addEventListener("change", convert);


// function selectCountry(

// )