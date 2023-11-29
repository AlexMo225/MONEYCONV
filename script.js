document.addEventListener("DOMContentLoaded", function () {
    // Chargement des devises disponibles au chargement de la page
    loadCurrencies();
});

async function loadCurrencies() {
    try {
        const response = await fetch("https://api.frankfurter.app/currencies");
        const currencies = await response.json();

        // Remplir les listes déroulantes avec les devises disponibles
        const fromCurrencySelect = document.getElementById("from");
        const toCurrencySelect = document.getElementById("to");

        // Ajouter l'option "All" pour toutes les devises
        const allCurrenciesOption = document.createElement("option");
        allCurrenciesOption.value = "all";
        allCurrenciesOption.text = "All";
        toCurrencySelect.appendChild(allCurrenciesOption);

        for (const currency in currencies) {
            const option = document.createElement("option");
            option.value = currency;
            option.text = `${currency} - ${currencies[currency]}`;
            fromCurrencySelect.add(option.cloneNode(true));
            toCurrencySelect.add(option);
        }
    } catch (error) {
        console.error("Erreur lors du chargement des devises :", error.message);
    }
}

async function convertCurrency() {
    const monnaie = document.getElementById("monnaie").value;
    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;

    try {
        // Vérifier si les devises de départ et de destination sont différentes
        if (from === to) {
            throw new Error(
                "Les devises de départ et de destination doivent être différentes."
            );
        }

        // Vérifier si le montant est positif
        if (monnaie <= 0) {
            throw new Error("Le montant doit être supérieur à zéro.");
        }

        let resultHTML = "";

        if (to === "all") {
            // Si l'option "All" est sélectionnée, récupérer toutes les devises disponibles
            const response = await fetch(
                "https://api.frankfurter.app/currencies"
            );
            const currencies = await response.json();

            resultHTML += "<table>";
            resultHTML +=
                "<thead><tr><th>Devises de destination</th><th>Résultat</th></tr></thead>";
            resultHTML += "<tbody>";

            for (const currency in currencies) {
                // Ajouter la vérification pour éviter la conversion de la même devise vers la même devise
                if (currency !== from) {
                    const response = await fetch(
                        `https://api.frankfurter.app/latest?amount=${monnaie}&from=${from}&to=${currency}`
                    );
                    const data = await response.json();
                    resultHTML += `<tr><td>${currency}</td><td>${monnaie} ${from} = ${data.rates[currency]} ${currency}</td></tr>`;
                }
            }

            resultHTML += "</tbody>";
            resultHTML += "</table>";
        } else {
            // Sinon, récupérer la devise de destination spécifiée
            const response = await fetch(
                `https://api.frankfurter.app/latest?amount=${monnaie}&from=${from}&to=${to}`
            );
            const data = await response.json();
            resultHTML = `<p>${monnaie} ${from} = ${data.rates[to]} ${to}</p>`;
        }

        // Afficher le résultat de la conversion
        const resultContainer = document.getElementById("result");
        resultContainer.innerHTML = resultHTML;
    } catch (error) {
        // Gérer les erreurs
        const resultContainer = document.getElementById("result");
        resultContainer.innerHTML = `<p style="color: red;">Erreur: ${error.message}</p>`;
    }
}
