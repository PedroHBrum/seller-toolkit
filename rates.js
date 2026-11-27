// Arquivo único de configuração de taxas do Etsy (Regra de Construção #1)
// Lembrete: Conferir na página oficial do Etsy todo dia 1º do mês.

const ETSY_CONFIG = {
    lastUpdated: "November 27, 2026",
    officialUrl: "https://www.etsy.com/legal/fees/",
    currency: "USD",
    symbol: "$",
    
    // Taxas padrão (EUA)
    listingFee: 0.20,              // US$ 0.20 por item publicado
    transactionRate: 0.065,        // 6.5% sobre o valor total (produto + frete cobrado)
    processingRate: 0.03,          // 3% de processamento de pagamento
    processingFixed: 0.25,         // + US$ 0.25 fixos por pedido
    currencyConversionRate: 0.025, // 2.5% se a moeda da loja for diferente da moeda de listagem
    
    // Offsite Ads (Anúncios externos)
    offsiteAdsStandard: 0.15,      // 15% (lojas abaixo de US$ 10k/ano)
    offsiteAdsHighVolume: 0.12,    // 12% (lojas acima de US$ 10k/ano)
    offsiteAdsCap: 100.00          // Teto máximo de US$ 100 por pedido
};