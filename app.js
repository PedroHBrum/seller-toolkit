document.addEventListener("DOMContentLoaded", () => {
    // Preenche a data de atualização e o link oficial automaticamente (Regra #2)
    document.getElementById("last-updated").textContent = ETSY_CONFIG.lastUpdated;
    document.getElementById("official-fees-link").href = ETSY_CONFIG.officialUrl;

    const inputs = document.querySelectorAll("input, select");
    inputs.forEach(input => input.addEventListener("input", calculate));

    // Roda o cálculo inicial com os valores de exemplo
    calculate();
});

function calculate() {
    // 1. Pegar valores digitados pelo vendedor
    const itemPrice = parseFloat(document.getElementById("item-price").value) || 0;
    const shippingCharged = parseFloat(document.getElementById("shipping-charged").value) || 0;
    const itemCost = parseFloat(document.getElementById("item-cost").value) || 0;
    const shippingCost = parseFloat(document.getElementById("shipping-cost").value) || 0;
    const offsiteAdsOption = document.getElementById("offsite-ads").value;
    const hasCurrencyConversion = document.getElementById("currency-conversion").checked;

    // Receita total que passa pelo carrinho do Etsy
    const totalRevenue = itemPrice + shippingCharged;
    const totalProductCost = itemCost + shippingCost;

    // Se o preço for 0, zera tudo
    if (totalRevenue <= 0) {
        updateUI(0, 0, 0, 0, 0, 0, 0, 0);
        return;
    }

    // 2. Cálculo das taxas do Etsy
    const listingFee = ETSY_CONFIG.listingFee;
    const transactionFee = totalRevenue * ETSY_CONFIG.transactionRate;
    const processingFee = (totalRevenue * ETSY_CONFIG.processingRate) + ETSY_CONFIG.processingFixed;
    
    const conversionFee = hasCurrencyConversion 
        ? totalRevenue * ETSY_CONFIG.currencyConversionRate 
        : 0;

    let offsiteAdsFee = 0;
    if (offsiteAdsOption === "15") {
        offsiteAdsFee = Math.min(totalRevenue * ETSY_CONFIG.offsiteAdsStandard, ETSY_CONFIG.offsiteAdsCap);
    } else if (offsiteAdsOption === "12") {
        offsiteAdsFee = Math.min(totalRevenue * ETSY_CONFIG.offsiteAdsHighVolume, ETSY_CONFIG.offsiteAdsCap);
    }

    const totalFees = listingFee + transactionFee + processingFee + conversionFee + offsiteAdsFee;

    // 3. Resultado final
    const netProfit = totalRevenue - totalProductCost - totalFees;
    const profitMargin = (netProfit / totalRevenue) * 100;

    updateUI(totalRevenue, listingFee, transactionFee, processingFee, conversionFee, offsiteAdsFee, totalFees, netProfit, profitMargin);
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

    // Muda a cor se estiver no prejuízo
    if (profit < 0) {
        profitEl.style.color = "#dc2626";
        marginEl.style.color = "#dc2626";
    } else {
        profitEl.style.color = "#16a34a";
        marginEl.style.color = "#16a34a";
    }
}