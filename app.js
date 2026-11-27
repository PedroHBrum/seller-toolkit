document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("last-updated").textContent = ETSY_CONFIG.lastUpdated;
    document.getElementById("official-fees-link").href = ETSY_CONFIG.officialUrl;

    const inputs = document.querySelectorAll("input, select");
    inputs.forEach(input => input.addEventListener("input", calculateAll));

    calculateAll();
});

function getSelectedRates() {
    const offsiteAdsOption = document.getElementById("offsite-ads").value;
    const hasCurrencyConversion = document.getElementById("currency-conversion").checked;

    let offsiteRate = 0;
    if (offsiteAdsOption === "15") offsiteRate = ETSY_CONFIG.offsiteAdsStandard;
    if (offsiteAdsOption === "12") offsiteRate = ETSY_CONFIG.offsiteAdsHighVolume;

    const conversionRate = hasCurrencyConversion ? ETSY_CONFIG.currencyConversionRate : 0;

    return {
        fixedFees: ETSY_CONFIG.listingFee + ETSY_CONFIG.processingFixed, // $0.20 + $0.25 = $0.45
        baseVariableRate: ETSY_CONFIG.transactionRate + ETSY_CONFIG.processingRate + conversionRate, // 6.5% + 3% (+ 2.5%)
        offsiteRate: offsiteRate
    };
}

function calculateAll() {
    const itemPrice = parseFloat(document.getElementById("item-price").value) || 0;
    const shippingCharged = parseFloat(document.getElementById("shipping-charged").value) || 0;
    const itemCost = parseFloat(document.getElementById("item-cost").value) || 0;
    const shippingCost = parseFloat(document.getElementById("shipping-cost").value) || 0;
    const targetMargin = parseFloat(document.getElementById("target-margin").value) || 0;

    const rates = getSelectedRates();
    const totalRevenue = itemPrice + shippingCharged;
    const totalProductCost = itemCost + shippingCost;

    // 1. Cálculo Normal (Lucro atual)
    if (totalRevenue <= 0) {
        updateUI(0, 0, 0, 0, 0, 0, 0, 0, 0);
    } else {
        const listingFee = ETSY_CONFIG.listingFee;
        const transactionFee = totalRevenue * ETSY_CONFIG.transactionRate;
        const processingFee = (totalRevenue * ETSY_CONFIG.processingRate) + ETSY_CONFIG.processingFixed;
        const conversionFee = document.getElementById("currency-conversion").checked
            ? totalRevenue * ETSY_CONFIG.currencyConversionRate
            : 0;
        const offsiteAdsFee = Math.min(totalRevenue * rates.offsiteRate, ETSY_CONFIG.offsiteAdsCap);

        const totalFees = listingFee + transactionFee + processingFee + conversionFee + offsiteAdsFee;
        const netProfit = totalRevenue - totalProductCost - totalFees;
        const profitMargin = (netProfit / totalRevenue) * 100;

        updateUI(totalRevenue, listingFee, transactionFee, processingFee, conversionFee, offsiteAdsFee, totalFees, netProfit, profitMargin);
    }

    // 2. Cálculo Reverso (Preço mínimo para atingir a margem desejada)
    calculateTargetPrice(totalProductCost, shippingCharged, targetMargin, rates);
}

function calculateTargetPrice(totalProductCost, shippingCharged, targetMarginPercent, rates) {
    const targetMargin = targetMarginPercent / 100;
    const totalVariableRateWithOffsite = rates.baseVariableRate + rates.offsiteRate + targetMargin;
    const recEl = document.getElementById("res-recommended-price");
    const noteEl = document.getElementById("res-recommended-note");

    if (totalVariableRateWithOffsite >= 1) {
        recEl.textContent = "Impossible";
        noteEl.textContent = "Target margin + Etsy fee % exceeds 100%. Lower your target margin.";
        return;
    }

    // Fórmulas: Receita = (Custos + TaxasFixas) / (1 - TaxasVariaveis - MargemAlvo)
    let requiredRevenue = (totalProductCost + rates.fixedFees) / (1 - totalVariableRateWithOffsite);

    // Verifica se o Offsite Ads bateu no teto de US$ 100
    if (rates.offsiteRate > 0 && (requiredRevenue * rates.offsiteRate) > ETSY_CONFIG.offsiteAdsCap) {
        const variableWithoutOffsite = rates.baseVariableRate + targetMargin;
        if (variableWithoutOffsite >= 1) {
            recEl.textContent = "Impossible";
            noteEl.textContent = "Target margin + Etsy fee % exceeds 100%.";
            return;
        }
        requiredRevenue = (totalProductCost + rates.fixedFees + ETSY_CONFIG.offsiteAdsCap) / (1 - variableWithoutOffsite);
    }

    const recommendedItemPrice = Math.max(0, requiredRevenue - shippingCharged);
    recEl.textContent = "$" + recommendedItemPrice.toFixed(2);
    noteEl.textContent = `Assuming $${shippingCharged.toFixed(2)} shipping charged to buyer.`;
}

function updateUI(revenue, listing, transaction, processing, conversion, offsite, totalFees, profit, margin) {
    const fmt = (val) => "$" + val.toFixed(2);

    document.getElementById("res-revenue").textContent = fmt(revenue);
    document.getElementById("res-listing").textContent = fmt(listing);
    document.getElementById("res-transaction").textContent = fmt(transaction);
    document.getElementById("res-processing").textContent = fmt(processing);
    document.getElementById("res-conversion").textContent = fmt(conversion);
    document.getElementById("res-offsite").textContent = fmt(offsite);
    document.getElementById("res-total-fees").textContent = fmt(totalFees);

    const profitEl = document.getElementById("res-profit");
    const marginEl = document.getElementById("res-margin");

    profitEl.textContent = fmt(profit);
    marginEl.textContent = margin.toFixed(1) + "%";

    if (profit < 0) {
        profitEl.style.color = "#dc2626";
        marginEl.style.color = "#dc2626";
    } else {
        profitEl.style.color = "#16a34a";
        marginEl.style.color = "#16a34a";
    }
}