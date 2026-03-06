async function test() {
    const res = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml');
    const xml = await res.text();
    const usdMatch = xml.match(/<Currency CrossOrder="\d+" Kod="USD" CurrencyCode="USD">[\s\S]*?<BanknoteSelling>([\d.]+)<\/BanknoteSelling>/);
    const eurMatch = xml.match(/<Currency CrossOrder="\d+" Kod="EUR" CurrencyCode="EUR">[\s\S]*?<BanknoteSelling>([\d.]+)<\/BanknoteSelling>/);
    console.log('USD:', usdMatch ? parseFloat(usdMatch[1]) : null);
    console.log('EUR:', eurMatch ? parseFloat(eurMatch[1]) : null);
}
test();
