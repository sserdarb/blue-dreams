async function test() {
    const res = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml');
    const xml = await res.text();
    const usdMatch = xml.match(/<Currency[^>]*CurrencyCode="USD"[^>]*>[\s\S]*?<ForexBuying>([\d.]+)<\/ForexBuying>/);
    const eurMatch = xml.match(/<Currency[^>]*CurrencyCode="EUR"[^>]*>[\s\S]*?<ForexBuying>([\d.]+)<\/ForexBuying>/);
    console.log('USD:', usdMatch ? parseFloat(usdMatch[1]) : null);
    console.log('EUR:', eurMatch ? parseFloat(eurMatch[1]) : null);
}
test();
