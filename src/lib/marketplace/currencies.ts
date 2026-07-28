export interface Currency { code: string; name: string; symbol: string; flag: string; rate: number; }
const C = (code:string,name:string,symbol:string,flag:string,rate:number):Currency=>({code,name,symbol,flag,rate});
export const CURRENCIES: Currency[] = [
  C("USD","US Dollar","$","🇺🇸",1),C("EUR","Euro","€","🇪🇺",0.92),C("GBP","British Pound","£","🇬🇧",0.79),
  C("INR","Indian Rupee","₹","🇮🇳",83.5),C("AED","UAE Dirham","د.إ","🇦🇪",3.67),C("SAR","Saudi Riyal","﷼","🇸🇦",3.75),
  C("JPY","Japanese Yen","¥","🇯🇵",156),C("CNY","Chinese Yuan","¥","🇨🇳",7.25),C("KRW","South Korean Won","₩","🇰🇷",1380),
  C("AUD","Australian Dollar","A$","🇦🇺",1.52),C("CAD","Canadian Dollar","C$","🇨🇦",1.37),C("CHF","Swiss Franc","CHF","🇨🇭",0.89),
  C("SGD","Singapore Dollar","S$","🇸🇬",1.34),C("HKD","Hong Kong Dollar","HK$","🇭🇰",7.81),C("NZD","NZ Dollar","NZ$","🇳🇿",1.65),
  C("ZAR","South African Rand","R","🇿🇦",18.2),C("NGN","Nigerian Naira","₦","🇳🇬",1530),C("KES","Kenyan Shilling","KSh","🇰🇪",129),
  C("BRL","Brazilian Real","R$","🇧🇷",5.4),C("MXN","Mexican Peso","Mex$","🇲🇽",18.6),C("ARS","Argentine Peso","AR$","🇦🇷",1180),
  C("CLP","Chilean Peso","CL$","🇨🇱",950),C("COP","Colombian Peso","CO$","🇨🇴",4150),C("PEN","Peruvian Sol","S/","🇵🇪",3.75),
  C("TRY","Turkish Lira","₺","🇹🇷",34.2),C("EGP","Egyptian Pound","E£","🇪🇬",48.5),C("NOK","Norwegian Krone","kr","🇳🇴",10.8),
  C("SEK","Swedish Krona","kr","🇸🇪",10.6),C("DKK","Danish Krone","kr","🇩🇰",6.86),C("PLN","Polish Złoty","zł","🇵🇱",3.95),
  C("CZK","Czech Koruna","Kč","🇨🇿",23.4),C("HUF","Hungarian Forint","Ft","🇭🇺",362),C("RON","Romanian Leu","lei","🇷🇴",4.58),
  C("RUB","Russian Ruble","₽","🇷🇺",88),C("UAH","Ukrainian Hryvnia","₴","🇺🇦",41.5),C("THB","Thai Baht","฿","🇹🇭",34.5),
  C("VND","Vietnamese Dong","₫","🇻🇳",25400),C("IDR","Indonesian Rupiah","Rp","🇮🇩",16200),C("MYR","Malaysian Ringgit","RM","🇲🇾",4.42),
  C("PHP","Philippine Peso","₱","🇵🇭",58.5),C("PKR","Pakistani Rupee","₨","🇵🇰",278),C("BDT","Bangladeshi Taka","৳","🇧🇩",120),
  C("LKR","Sri Lankan Rupee","Rs","🇱🇰",298),C("NPR","Nepalese Rupee","रू","🇳🇵",133),C("QAR","Qatari Riyal","ر.ق","🇶🇦",3.64),
  C("KWD","Kuwaiti Dinar","د.ك","🇰🇼",0.307),C("BHD","Bahraini Dinar","ب.د","🇧🇭",0.376),C("OMR","Omani Rial","ر.ع.","🇴🇲",0.384),
  C("JOD","Jordanian Dinar","د.ا","🇯🇴",0.709),C("ILS","Israeli Shekel","₪","🇮🇱",3.65),
];
export const DEFAULT_CURRENCY = CURRENCIES[0];
export const findCurrency = (code: string): Currency => CURRENCIES.find((c) => c.code === code) ?? DEFAULT_CURRENCY;
export function parseUsd(raw: string | number): number {
  if (typeof raw === "number") return raw;
  const n = Number(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}
export function formatFromUsd(usd: string | number, currency: Currency): string {
  const amount = parseUsd(usd) * currency.rate;
  const digits = amount >= 1000 ? 0 : 2;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.code, maximumFractionDigits: digits }).format(amount);
  } catch { return currency.symbol + amount.toFixed(digits); }
}
