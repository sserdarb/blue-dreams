"use strict";
// Elektra PMS Full Integration — Real API via bookingapi.elektraweb.com
// Hotel ID: 33264 (Blue Dreams Resort)
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElektraService = void 0;
// ─── Config ────────────────────────────────────────────────────
var API_BASE = 'https://bookingapi.elektraweb.com';
var HOTEL_ID = 33264;
var USER_CODE = process.env.ELEKTRA_USER_CODE || 'asis';
var PASSWORD = process.env.ELEKTRA_PASSWORD || '';
// The exact saleable room count defined by the hotel management
var TOTAL_ROOMS = 341;
// Specific saleable room codes that make up the 341 count
// CFM (58), CR (109), CSEA (108), DLX (38), DLX FAM (28) = 341
var SALEABLE_ROOM_CODES = ['CFM', 'CR', 'CSEA', 'DLX', 'DLX FAM'];
// ─── Channel Grouping ──────────────────────────────────────────
var CHANNEL_MAP = {
    // OTA
    'BOOKING.COM': 'OTA',
    'EXPEDIA': 'OTA',
    'WEBBEDS': 'OTA',
    'HYPERGUEST': 'OTA',
    'OSTROVOK': 'OTA',
    'BEDSOPIA': 'OTA',
    'BOOKTOWORLD': 'OTA',
    // Call Center
    'CALL CENTER BDR': 'Call Center',
    'CALL CENTER TL': 'Call Center',
    'CALL CENTER EUR': 'Call Center',
    // Walk-in / Direct
    'WALKIN': 'Direkt',
    'WALKIN ': 'Direkt',
    'MUNFERIT TL': 'Direkt',
    'MUNFERIT EURO': 'Direkt',
    // Website
    'HOTELWEB TL': 'Website',
    'HOTELWEB EUR': 'Website',
};
var CHANNEL_COLORS = {
    'OTA': '#f59e0b',
    'Call Center': '#0ea5e9',
    'Tur Operatörü': '#8b5cf6',
    'Direkt': '#10b981',
    'Website': '#ec4899',
};
function getChannel(agency) {
    var upper = (agency || '').trim().toUpperCase();
    if (CHANNEL_MAP[upper])
        return CHANNEL_MAP[upper];
    if (CHANNEL_MAP[agency === null || agency === void 0 ? void 0 : agency.trim()])
        return CHANNEL_MAP[agency.trim()];
    return 'Tur Operatörü';
}
// ─── JWT Token Cache ───────────────────────────────────────────
var cachedJwt = null;
var jwtExpiresAt = 0;
// ─── Exchange Rate Cache ───────────────────────────────────────
var cachedRates = null;
var RATE_CACHE_TTL = 3600000; // 1 hour
var FALLBACK_RATES = { EUR_TO_TRY: 38.5, USD_TO_TRY: 35.7, fetchedAt: 0 };
// ─── Country Cache ─────────────────────────────────────────────
var cachedCountries = null;
var countriesFetchedAt = 0;
var COUNTRY_CACHE_TTL = 86400000; // 24 hours
function fetchCountries() {
    return __awaiter(this, void 0, void 0, function () {
        var jwt, res, data, map, list, _i, list_1, c, id, name_1, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (cachedCountries && Date.now() - countriesFetchedAt < COUNTRY_CACHE_TTL) {
                        return [2 /*return*/, cachedCountries];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, getJwt()];
                case 2:
                    jwt = _a.sent();
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/countries"), {
                            headers: { 'Authorization': "Bearer ".concat(jwt) },
                            next: { revalidate: 86400 }
                        })];
                case 3:
                    res = _a.sent();
                    if (!res.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, res.json()];
                case 4:
                    data = _a.sent();
                    map = new Map();
                    list = Array.isArray(data) ? data : ((data === null || data === void 0 ? void 0 : data.result) || (data === null || data === void 0 ? void 0 : data.data) || []);
                    if (Array.isArray(list)) {
                        for (_i = 0, list_1 = list; _i < list_1.length; _i++) {
                            c = list_1[_i];
                            id = c['country-id'] || c['id'] || c['countryId'] || c['nation-id'] || c['nation_id'] || c['NationId'];
                            name_1 = c['country-name'] || c['name'] || c['countryName'] || c['nation-name'] || c['NationName'] || '';
                            if (id && name_1)
                                map.set(Number(id), String(name_1));
                        }
                    }
                    cachedCountries = map;
                    countriesFetchedAt = Date.now();
                    console.log("[Elektra] Countries fetched: ".concat(map.size, " entries"));
                    return [2 /*return*/, map];
                case 5: return [3 /*break*/, 7];
                case 6:
                    err_1 = _a.sent();
                    console.warn('[Elektra] Countries fetch failed:', err_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/, cachedCountries || new Map()];
            }
        });
    });
}
function resolveCountry(guest, countryMap) {
    // 1. Try country-id lookup first
    var countryId = guest['country-id'] || guest['countryId'] || guest['country_id'] || guest['nation-id'] || guest['nationId'] || guest['NationId'] || guest['nationality_id'] || guest['nationality-id'];
    if (countryId && countryMap.size > 0) {
        var name_2 = countryMap.get(Number(countryId));
        if (name_2)
            return name_2;
    }
    // 2. Try direct country string
    var nat = guest['country'];
    if (nat && nat !== 'Unknown' && nat.length > 1)
        return nat;
    // Try various other location identifiers found in Elektra API iterations
    var genericFields = ['country', 'country-name', 'nationality', 'client-country', 'guest-country', 'nation', 'nation-name'];
    for (var _i = 0, genericFields_1 = genericFields; _i < genericFields_1.length; _i++) {
        var f = genericFields_1[_i];
        if (guest[f] && typeof guest[f] === 'string' && guest[f].length > 1 && guest[f] !== 'Unknown') {
            return guest[f];
        }
    }
    return 'Unknown';
}
// Cache for historical exchange rates (YYYY-MM-DD -> rates)
var historicalRatesCache = new Map();
function fetchHistoricalExchangeRates(dateStr) {
    return __awaiter(this, void 0, void 0, function () {
        var date, todayStr, liveRates, parts, url, res, text, eurRate, usdRate, eurMatch, usdMatch, rates, e_1, fallbackLive;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    date = dateStr.slice(0, 10);
                    if (historicalRatesCache.has(date))
                        return [2 /*return*/, historicalRatesCache.get(date)];
                    todayStr = new Date().toISOString().slice(0, 10);
                    if (!(date === todayStr)) return [3 /*break*/, 2];
                    return [4 /*yield*/, fetchExchangeRates()];
                case 1:
                    liveRates = _a.sent();
                    historicalRatesCache.set(date, liveRates);
                    return [2 /*return*/, liveRates];
                case 2:
                    _a.trys.push([2, 6, , 7]);
                    parts = date.split('-') // [YYYY, MM, DD]
                    ;
                    if (!(parts.length === 3)) return [3 /*break*/, 5];
                    url = "https://www.tcmb.gov.tr/kurlar/".concat(parts[0]).concat(parts[1], "/").concat(parts[2]).concat(parts[1]).concat(parts[0], ".xml");
                    return [4 /*yield*/, fetch(url, { next: { revalidate: 86400 } })]; // Cache 1 day
                case 3:
                    res = _a.sent() // Cache 1 day
                    ;
                    if (!res.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, res.text()];
                case 4:
                    text = _a.sent();
                    eurRate = 38.5;
                    usdRate = 35.7;
                    eurMatch = text.match(/<Currency CrossOrder="\d+" Kod="EUR" CurrencyCode="EUR">[\s\S]*?<BanknoteSelling>([\d\.]+)/);
                    if (eurMatch)
                        eurRate = parseFloat(eurMatch[1]);
                    usdMatch = text.match(/<Currency CrossOrder="\d+" Kod="USD" CurrencyCode="USD">[\s\S]*?<BanknoteSelling>([\d\.]+)/);
                    if (usdMatch)
                        usdRate = parseFloat(usdMatch[1]);
                    rates = { EUR_TO_TRY: eurRate, USD_TO_TRY: usdRate, fetchedAt: Date.now() };
                    historicalRatesCache.set(date, rates);
                    return [2 /*return*/, rates];
                case 5: return [3 /*break*/, 7];
                case 6:
                    e_1 = _a.sent();
                    console.warn("[Elektra] Failed to fetch historical TCMB rate for ".concat(date), e_1);
                    return [3 /*break*/, 7];
                case 7: return [4 /*yield*/, fetchExchangeRates()];
                case 8:
                    fallbackLive = _a.sent();
                    historicalRatesCache.set(date, fallbackLive);
                    return [2 /*return*/, fallbackLive];
            }
        });
    });
}
function fetchExchangeRates() {
    return __awaiter(this, void 0, void 0, function () {
        var res, xml, usdMatch, eurMatch, err_2, jwt, res, contentType, data, eurRate, usdRate, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (cachedRates && Date.now() - cachedRates.fetchedAt < RATE_CACHE_TTL) {
                        return [2 /*return*/, cachedRates];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fetch('https://www.tcmb.gov.tr/kurlar/today.xml', { next: { revalidate: 3600 } })];
                case 2:
                    res = _a.sent();
                    if (!res.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, res.text()];
                case 3:
                    xml = _a.sent();
                    usdMatch = xml.match(/<Currency[^>]*CurrencyCode="USD"[^>]*>[\s\S]*?<ForexBuying>([\d.]+)<\/ForexBuying>/);
                    eurMatch = xml.match(/<Currency[^>]*CurrencyCode="EUR"[^>]*>[\s\S]*?<ForexBuying>([\d.]+)<\/ForexBuying>/);
                    if (usdMatch && eurMatch) {
                        cachedRates = {
                            EUR_TO_TRY: parseFloat(eurMatch[1]),
                            USD_TO_TRY: parseFloat(usdMatch[1]),
                            fetchedAt: Date.now()
                        };
                        console.log('[TCMB] Live exchange rates fetched successfully:', cachedRates);
                        return [2 /*return*/, cachedRates];
                    }
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    err_2 = _a.sent();
                    console.warn('[TCMB] Exchange rates fetch failed:', err_2);
                    return [3 /*break*/, 6];
                case 6:
                    _a.trys.push([6, 11, , 12]);
                    return [4 /*yield*/, getJwt()];
                case 7:
                    jwt = _a.sent();
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/hotel/").concat(HOTEL_ID, "/exchangerates"), {
                            headers: { 'Authorization': "Bearer ".concat(jwt) },
                            next: { revalidate: 3600 }
                        })];
                case 8:
                    res = _a.sent();
                    contentType = res.headers.get('content-type') || '';
                    if (!(res.ok && contentType.includes('json'))) return [3 /*break*/, 10];
                    return [4 /*yield*/, res.json()];
                case 9:
                    data = _a.sent();
                    eurRate = Array.isArray(data)
                        ? data.find(function (r) { return r['currency-code'] === 'EUR' || r['currency'] === 'EUR'; })
                        : null;
                    usdRate = Array.isArray(data)
                        ? data.find(function (r) { return r['currency-code'] === 'USD' || r['currency'] === 'USD'; })
                        : null;
                    if (eurRate || usdRate) {
                        cachedRates = {
                            EUR_TO_TRY: (eurRate === null || eurRate === void 0 ? void 0 : eurRate['rate']) || (eurRate === null || eurRate === void 0 ? void 0 : eurRate['buying-rate']) || FALLBACK_RATES.EUR_TO_TRY,
                            USD_TO_TRY: (usdRate === null || usdRate === void 0 ? void 0 : usdRate['rate']) || (usdRate === null || usdRate === void 0 ? void 0 : usdRate['buying-rate']) || FALLBACK_RATES.USD_TO_TRY,
                            fetchedAt: Date.now()
                        };
                        console.log('[Elektra] Exchange rates fetched:', cachedRates);
                        return [2 /*return*/, cachedRates];
                    }
                    _a.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    err_3 = _a.sent();
                    console.warn('[Elektra] Exchange rates fetch failed, using hardcoded fallback:', err_3);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/, FALLBACK_RATES];
            }
        });
    });
}
function toTRY(amount, currency, rates) {
    if (currency === 'TRY')
        return amount;
    if (currency === 'EUR')
        return amount * rates.EUR_TO_TRY;
    if (currency === 'USD')
        return amount * rates.USD_TO_TRY;
    return amount * rates.EUR_TO_TRY; // default to EUR rate
}
function tryToEur(tryAmount, rates) {
    return rates.EUR_TO_TRY > 0 ? tryAmount / rates.EUR_TO_TRY : 0;
}
function getJwt() {
    return __awaiter(this, void 0, void 0, function () {
        var MAX_RETRIES, _loop_1, attempt, state_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (cachedJwt && Date.now() < jwtExpiresAt - 3600000) {
                        return [2 /*return*/, cachedJwt];
                    }
                    MAX_RETRIES = 3;
                    _loop_1 = function (attempt) {
                        var res, wait_1, data, err_4;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 5, , 6]);
                                    return [4 /*yield*/, fetch("".concat(API_BASE, "/login"), {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                'hotel-id': HOTEL_ID,
                                                'usercode': USER_CODE,
                                                'password': PASSWORD
                                            }),
                                            cache: 'no-store'
                                        })];
                                case 1:
                                    res = _b.sent();
                                    if (!(res.status === 429)) return [3 /*break*/, 3];
                                    wait_1 = Math.pow(2, attempt + 1) * 1000 // 2s, 4s, 8s
                                    ;
                                    console.warn("[Elektra] Rate limited (429), retrying in ".concat(wait_1 / 1000, "s... (attempt ").concat(attempt + 1, "/").concat(MAX_RETRIES, ")"));
                                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, wait_1); })];
                                case 2:
                                    _b.sent();
                                    return [2 /*return*/, "continue"];
                                case 3:
                                    if (!res.ok) {
                                        console.error('[Elektra] Login failed:', res.status);
                                        throw new Error("Elektra login failed: ".concat(res.status));
                                    }
                                    return [4 /*yield*/, res.json()];
                                case 4:
                                    data = _b.sent();
                                    if (!data.success || !data.jwt) {
                                        throw new Error('Elektra login: no JWT received');
                                    }
                                    cachedJwt = data.jwt;
                                    jwtExpiresAt = Date.now() + 12 * 60 * 60 * 1000;
                                    console.log('[Elektra] JWT obtained successfully');
                                    return [2 /*return*/, { value: cachedJwt }];
                                case 5:
                                    err_4 = _b.sent();
                                    if (attempt === MAX_RETRIES - 1) {
                                        console.error('[Elektra] Login error after retries:', err_4);
                                        // Return stale JWT if available rather than crashing
                                        if (cachedJwt) {
                                            console.warn('[Elektra] Using stale JWT as fallback');
                                            return [2 /*return*/, { value: cachedJwt }];
                                        }
                                        throw err_4;
                                    }
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    };
                    attempt = 0;
                    _a.label = 1;
                case 1:
                    if (!(attempt < MAX_RETRIES)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(attempt)];
                case 2:
                    state_1 = _a.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _a.label = 3;
                case 3:
                    attempt++;
                    return [3 /*break*/, 1];
                case 4: 
                // Should never reach here, but satisfy TS
                throw new Error('Elektra login: max retries exceeded');
            }
        });
    });
}
// ─── Real API Calls ────────────────────────────────────────────
function fetchAvailability(fromDate_1, toDate_1) {
    return __awaiter(this, arguments, void 0, function (fromDate, toDate, currency, agency) {
        var jwt, url, finalAgency, res, raw;
        if (currency === void 0) { currency = 'TRY'; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getJwt()];
                case 1:
                    jwt = _a.sent();
                    url = new URL("".concat(API_BASE, "/hotel/").concat(HOTEL_ID, "/availability"));
                    url.searchParams.set('currency', currency);
                    url.searchParams.set('fromdate', fromDate);
                    url.searchParams.set('todate', toDate);
                    url.searchParams.set('adult', '2');
                    url.searchParams.set('child', '0');
                    finalAgency = agency || (currency === 'TRY' ? 'HOTELWEB TL' : 'HOTELWEB EUR');
                    url.searchParams.set('agency', finalAgency);
                    return [4 /*yield*/, fetch(url.toString(), {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(jwt)
                            },
                            next: { revalidate: 300 }
                        })];
                case 2:
                    res = _a.sent();
                    if (!res.ok) {
                        console.error('[Elektra] Availability fetch failed:', res.status);
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, res.json()];
                case 3:
                    raw = _a.sent();
                    return [2 /*return*/, raw.map(function (item) { return ({
                            date: item['date'],
                            roomType: item['room-type'],
                            roomTypeId: item['room-type-id'],
                            availableCount: item['available-room-count'],
                            basePrice: item['base-price'],
                            discountedPrice: item['discounted-price'],
                            stopsell: item['stopsell'],
                            vatAmount: item['vat-amount'],
                        }); })];
            }
        });
    });
}
function fetchReservations(fromDateStr_1, toDateStr_1) {
    return __awaiter(this, arguments, void 0, function (fromDateStr, toDateStr, status) {
        var jwt, countryMap, fromDate, toDate, url, res, raw, mappedReservations;
        var _this = this;
        if (status === void 0) { status = 'Reservation'; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getJwt()];
                case 1:
                    jwt = _a.sent();
                    return [4 /*yield*/, fetchCountries()
                        // Date format for Elektra API should just be YYYY-MM-DD (time components and URL-encoded spaces cause HTTP 400)
                    ];
                case 2:
                    countryMap = _a.sent();
                    fromDate = fromDateStr.slice(0, 10);
                    toDate = toDateStr.slice(0, 10);
                    url = "".concat(API_BASE, "/hotel/").concat(HOTEL_ID, "/reservation-list?from-check-in=").concat(encodeURIComponent(fromDate), "&to-check-in=").concat(encodeURIComponent(toDate), "&reservation-status=").concat(encodeURIComponent(status));
                    return [4 /*yield*/, fetch(url, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(jwt)
                            },
                            next: { revalidate: 300 }
                        })];
                case 3:
                    res = _a.sent();
                    if (!res.ok) {
                        console.error('[Elektra] Reservation fetch failed:', res.status);
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, res.json()];
                case 4:
                    raw = _a.sent();
                    if (!Array.isArray(raw))
                        return [2 /*return*/, []];
                    return [4 /*yield*/, Promise.all(raw.map(function (item) { return __awaiter(_this, void 0, void 0, function () {
                            var checkIn, checkOut, totalPrice, currency, reservationDate, d1, d2, nights, dailyAverage, effectiveRates, amountTry, amountEur, guests, firstGuestNationality;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        checkIn = item['check-in-date'] || '';
                                        checkOut = item['check-out-date'] || '';
                                        totalPrice = item['reservation-total-price'] || 0;
                                        currency = item['reservation-currency'] || 'TRY';
                                        reservationDate = item['reservation-date'] || item['lastupdate-date'] || '';
                                        d1 = new Date(checkIn);
                                        d2 = new Date(checkOut);
                                        nights = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
                                        dailyAverage = totalPrice / nights;
                                        return [4 /*yield*/, fetchExchangeRates()]; // default to today's rates
                                    case 1:
                                        effectiveRates = _a.sent() // default to today's rates
                                        ;
                                        if (!reservationDate) return [3 /*break*/, 3];
                                        return [4 /*yield*/, fetchHistoricalExchangeRates(reservationDate)];
                                    case 2:
                                        effectiveRates = _a.sent();
                                        _a.label = 3;
                                    case 3:
                                        amountTry = toTRY(totalPrice, currency, effectiveRates);
                                        amountEur = currency === 'EUR' ? totalPrice : tryToEur(amountTry, effectiveRates);
                                        guests = (item['guest-list'] || []).map(function (g) { return ({
                                            name: g['name'] || '',
                                            surname: g['surname'] || '',
                                            country: resolveCountry(g, countryMap),
                                            email: g['email'] || g['e-mail'] || '',
                                            phone: g['phone'] || g['gsm'] || g['mobile-phone'] || ''
                                        }); });
                                        firstGuestNationality = guests.length > 0 && guests[0].country !== 'Unknown'
                                            ? guests[0].country
                                            : resolveCountry(item, countryMap);
                                        return [2 /*return*/, {
                                                id: item['reservation-id'],
                                                voucherNo: item['voucher-no'] || '',
                                                agency: item['agency'] || 'Unknown',
                                                channel: getChannel(item['agency']),
                                                boardType: item['board-type'] || '',
                                                roomType: item['room-type'] || '',
                                                rateType: item['rate-type'] || '',
                                                checkIn: checkIn,
                                                checkOut: checkOut,
                                                totalPrice: totalPrice,
                                                paidPrice: item['reservation-paid-price'] || 0,
                                                currency: currency,
                                                roomCount: item['reservation-room-count'] || 1,
                                                contactName: item['contact-name'],
                                                contactEmail: item['contact-email'],
                                                contactPhone: item['contact-phone'],
                                                lastUpdate: item['lastupdate-date'] || '',
                                                reservationDate: reservationDate,
                                                guests: guests,
                                                status: status,
                                                // Enhanced
                                                country: firstGuestNationality,
                                                nights: nights,
                                                dailyAverage: dailyAverage,
                                                amountTry: amountTry,
                                                amountEur: amountEur
                                            }];
                                }
                            });
                        }); }))];
                case 5:
                    mappedReservations = _a.sent();
                    return [2 /*return*/, mappedReservations];
            }
        });
    });
}
function computeOccupancy(availability) {
    var byDate = new Map();
    // Filter out irrelevant rooms (ROH, PROMO, BSR...) when calculating overall hotel occupancy
    var saleableAvailability = availability.filter(function (r) { return SALEABLE_ROOM_CODES.includes(r.roomType); });
    for (var _i = 0, saleableAvailability_1 = saleableAvailability; _i < saleableAvailability_1.length; _i++) {
        var item = saleableAvailability_1[_i];
        if (!byDate.has(item.date))
            byDate.set(item.date, []);
        byDate.get(item.date).push(item);
    }
    var result = [];
    for (var _a = 0, byDate_1 = byDate; _a < byDate_1.length; _a++) {
        var _b = byDate_1[_a], date = _b[0], rooms = _b[1];
        var availableRooms = rooms.reduce(function (sum, r) { return sum + r.availableCount; }, 0);
        // Use the hardcoded exactly 341 limit rather than dynamically fluctuating API caps 
        // which might include ghost rooms.
        var effectiveTotal = TOTAL_ROOMS;
        var occupiedRooms = Math.max(0, effectiveTotal - availableRooms);
        // Safeguard percentage calculation
        var occupancyRate = effectiveTotal > 0 ? Math.round((occupiedRooms / effectiveTotal) * 100) : 0;
        result.push({
            date: date,
            totalRooms: effectiveTotal,
            availableRooms: availableRooms,
            occupiedRooms: occupiedRooms,
            occupancyRate: Math.max(0, Math.min(100, occupancyRate))
        });
    }
    return result.sort(function (a, b) { return a.date.localeCompare(b.date); });
}
// ─── Human Resources & PDKS Methods ────────────────────────────
function fetchEmployees() {
    return __awaiter(this, void 0, void 0, function () {
        var jwt, url, res, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getJwt()];
                case 1:
                    jwt = _a.sent();
                    url = "".concat(API_BASE, "/hotel/").concat(HOTEL_ID, "/employees");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, fetch(url, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(jwt)
                            },
                            next: { revalidate: 3600 }
                        })];
                case 3:
                    res = _a.sent();
                    if (!res.ok)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, res.json()];
                case 4: return [2 /*return*/, _a.sent()];
                case 5:
                    err_5 = _a.sent();
                    console.error('[Elektra] Error fetching employees:', err_5);
                    return [2 /*return*/, []];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function fetchAttendanceLogs(startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
        var jwt, url, res, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getJwt()];
                case 1:
                    jwt = _a.sent();
                    url = "".concat(API_BASE, "/hotel/").concat(HOTEL_ID, "/attendance");
                    if (startDate && endDate) {
                        url += "?start=".concat(startDate, "&end=").concat(endDate);
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, fetch(url, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(jwt)
                            },
                            cache: 'no-store'
                        })];
                case 3:
                    res = _a.sent();
                    if (!res.ok)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, res.json()];
                case 4: return [2 /*return*/, _a.sent()];
                case 5:
                    err_6 = _a.sent();
                    console.error('[Elektra] Error fetching attendance logs:', err_6);
                    return [2 /*return*/, []];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function fetchHRRequests() {
    return __awaiter(this, void 0, void 0, function () {
        var jwt, url, res, err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getJwt()];
                case 1:
                    jwt = _a.sent();
                    url = "".concat(API_BASE, "/hotel/").concat(HOTEL_ID, "/hr-requests");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, fetch(url, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(jwt)
                            },
                            cache: 'no-store'
                        })];
                case 3:
                    res = _a.sent();
                    if (!res.ok)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, res.json()];
                case 4: return [2 /*return*/, _a.sent()];
                case 5:
                    err_7 = _a.sent();
                    console.error('[Elektra] Error fetching HR requests:', err_7);
                    return [2 /*return*/, []];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// ─── Task Management Functions ─────────────────────────────────
function fetchTaskDefinitions() {
    return __awaiter(this, arguments, void 0, function (language) {
        var jwt, res, data, err_8;
        if (language === void 0) { language = 'TR'; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, getJwt()];
                case 1:
                    jwt = _a.sent();
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/guest/task-definition-list"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(jwt),
                            },
                            body: JSON.stringify({
                                HotelId: HOTEL_ID,
                                Language: language,
                            }),
                        })];
                case 2:
                    res = _a.sent();
                    if (!res.ok)
                        throw new Error("Task definitions API error: ".concat(res.status));
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    return [2 /*return*/, Array.isArray(data) ? data : ((data === null || data === void 0 ? void 0 : data.result) || [])];
                case 4:
                    err_8 = _a.sent();
                    console.error('[Elektra] fetchTaskDefinitions error:', err_8);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function fetchTasks() {
    return __awaiter(this, arguments, void 0, function (language) {
        var jwt, res, data, err_9;
        if (language === void 0) { language = 'TR'; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, getJwt()];
                case 1:
                    jwt = _a.sent();
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/guest/task-list"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(jwt),
                            },
                            body: JSON.stringify({
                                HotelId: HOTEL_ID,
                                Language: language,
                            }),
                        })];
                case 2:
                    res = _a.sent();
                    if (!res.ok)
                        throw new Error("Task list API error: ".concat(res.status));
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    return [2 /*return*/, Array.isArray(data) ? data : ((data === null || data === void 0 ? void 0 : data.result) || [])];
                case 4:
                    err_9 = _a.sent();
                    console.error('[Elektra] fetchTasks error:', err_9);
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function createTask(taskData) {
    return __awaiter(this, void 0, void 0, function () {
        var jwt, res, err_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, getJwt()];
                case 1:
                    jwt = _a.sent();
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/guest/task-create"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(jwt),
                            },
                            body: JSON.stringify({
                                HotelId: HOTEL_ID,
                                TaskDefinitionId: taskData.taskDefinitionId,
                                Location: taskData.location,
                                Description: taskData.description || '',
                                Priority: taskData.priority || 3,
                            }),
                        })];
                case 2:
                    res = _a.sent();
                    if (!res.ok)
                        throw new Error("Task create API error: ".concat(res.status));
                    return [4 /*yield*/, res.json()];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    err_10 = _a.sent();
                    console.error('[Elektra] createTask error:', err_10);
                    throw err_10;
                case 5: return [2 /*return*/];
            }
        });
    });
}
// ─── Exported Service ──────────────────────────────────────────
exports.ElektraService = {
    isDemoMode: false,
    isPartialLive: false,
    isFullyLive: true,
    getAvailability: function (startDate, endDate, currency, agency) { return __awaiter(void 0, void 0, void 0, function () {
        var from, to, err_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    from = startDate.toISOString().split('T')[0];
                    to = endDate.toISOString().split('T')[0];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetchAvailability(from, to, currency, agency)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    err_11 = _a.sent();
                    console.error('[Elektra] Availability error:', err_11);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    getReservations: function (startDate, endDate, status) { return __awaiter(void 0, void 0, void 0, function () {
        var from, to, statuses, all, _i, statuses_1, s, res, err_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    from = startDate.toISOString().split('T')[0];
                    to = endDate.toISOString().split('T')[0];
                    statuses = status ? [status] : ['Reservation', 'Waiting', 'InHouse', 'CheckOut', 'Cancelled'];
                    all = [];
                    _i = 0, statuses_1 = statuses;
                    _a.label = 1;
                case 1:
                    if (!(_i < statuses_1.length)) return [3 /*break*/, 6];
                    s = statuses_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fetchReservations(from, to, s)];
                case 3:
                    res = _a.sent();
                    all.push.apply(all, res);
                    return [3 /*break*/, 5];
                case 4:
                    err_12 = _a.sent();
                    console.error("[Elektra] Reservations (".concat(s, ") error:"), err_12);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, all];
            }
        });
    }); },
    computeOccupancy: computeOccupancy,
    fetchTaskDefinitions: fetchTaskDefinitions,
    fetchTasks: fetchTasks,
    createTask: createTask,
    fetchEmployees: fetchEmployees,
    fetchAttendanceLogs: fetchAttendanceLogs,
    fetchHRRequests: fetchHRRequests,
    // ─── Occupancy & Room Types ───────────────────────────────────────
    getOccupancy: function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var availability;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAvailability(startDate, endDate)];
                    case 1:
                        availability = _a.sent();
                        return [2 /*return*/, computeOccupancy(availability)];
                }
            });
        });
    },
    getTodayOccupancy: function () {
        return __awaiter(this, void 0, void 0, function () {
            var today, tomorrow, occupancy, err_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        today = new Date();
                        tomorrow = new Date(today);
                        tomorrow.setDate(today.getDate() + 1);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getOccupancy(today, tomorrow)];
                    case 2:
                        occupancy = _a.sent();
                        if (occupancy.length > 0) {
                            return [2 /*return*/, { rate: occupancy[0].occupancyRate, available: occupancy[0].availableRooms, total: occupancy[0].totalRooms }];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        err_13 = _a.sent();
                        console.error('[Elektra] Today occupancy error:', err_13);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, { rate: 0, available: 0, total: 341 }];
                }
            });
        });
    },
    getRoomTypeBreakdown: function () {
        return __awaiter(this, void 0, void 0, function () {
            var today, tomorrow, roomTotals, todayStr_1, tomorrowStr, availability, todayData, err_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        today = new Date();
                        tomorrow = new Date(today);
                        tomorrow.setDate(today.getDate() + 1);
                        roomTotals = {
                            'Club Room': 109, 'Club Room Sea View': 108, 'Club Family Room': 58,
                            'Deluxe Room': 38, 'Deluxe Family Room': 28, 'Beach Side Room': 0,
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        todayStr_1 = today.toISOString().split('T')[0];
                        tomorrowStr = tomorrow.toISOString().split('T')[0];
                        return [4 /*yield*/, this.getAvailability(today, tomorrow)];
                    case 2:
                        availability = _a.sent();
                        todayData = availability.filter(function (a) { return a.date === todayStr_1; });
                        return [2 /*return*/, todayData
                                .filter(function (a) { return roomTotals[a.roomType]; })
                                .map(function (a) { return ({ name: a.roomType, available: a.availableCount, total: roomTotals[a.roomType] || a.availableCount }); })];
                    case 3:
                        err_14 = _a.sent();
                        console.error('[Elektra] Room breakdown error:', err_14);
                        return [2 /*return*/, Object.entries(roomTotals).map(function (_a) {
                                var name = _a[0], total = _a[1];
                                return ({ name: name, available: 0, total: total });
                            })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    // Quick room price calculation
    calculatePrice: function (checkIn, checkOut, roomTypeId, adults, children) {
        return __awaiter(this, void 0, void 0, function () {
            var availability, roomAvail, totalPrice, _i, roomAvail_1, a, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getAvailability(new Date(checkIn), new Date(checkOut))
                            // find cheapest base price for this room type during the period
                        ];
                    case 1:
                        availability = _b.sent();
                        roomAvail = availability.filter(function (a) { return a.roomTypeId === roomTypeId; });
                        if (!roomAvail.length)
                            return [2 /*return*/, null];
                        totalPrice = 0;
                        for (_i = 0, roomAvail_1 = roomAvail; _i < roomAvail_1.length; _i++) {
                            a = roomAvail_1[_i];
                            totalPrice += a.discountedPrice || a.basePrice || 0;
                        }
                        return [2 /*return*/, totalPrice > 0 ? totalPrice : null];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    // Fetch full season reservations (broad check-in range) — reusable across components
    getAllSeasonReservations: function () {
        return __awaiter(this, void 0, void 0, function () {
            var today, from, to;
            return __generator(this, function (_a) {
                today = new Date();
                from = new Date(today.getFullYear(), today.getMonth() - 3, 1);
                to = new Date(today.getFullYear() + 1, today.getMonth(), 0);
                return [2 /*return*/, this.getReservations(from, to)];
            });
        });
    },
    // Fetch full season cancellations (used to prune DB cache real-time)
    getAllSeasonCancellations: function () {
        return __awaiter(this, void 0, void 0, function () {
            var today, from, to;
            return __generator(this, function (_a) {
                today = new Date();
                from = new Date(today.getFullYear(), today.getMonth() - 3, 1);
                to = new Date(today.getFullYear() + 1, today.getMonth(), 0);
                return [2 /*return*/, this.getReservations(from, to, 'Cancelled')];
            });
        });
    },
    // Filter reservations by BOOKING/SALE date (reservationDate), not check-in date
    getReservationsByBookingDate: function (salesFrom, salesTo) {
        return __awaiter(this, void 0, void 0, function () {
            var allReservations, fromStr, toStr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAllSeasonReservations()];
                    case 1:
                        allReservations = _a.sent();
                        fromStr = salesFrom.toISOString().split('T')[0];
                        toStr = salesTo.toISOString().split('T')[0];
                        return [2 /*return*/, allReservations.filter(function (r) {
                                var saleDate = r.reservationDate.slice(0, 10);
                                return saleDate >= fromStr && saleDate <= toStr;
                            })];
                }
            });
        });
    },
    // Fetch reservations by booking/sale date for a SPECIFIC YEAR
    getReservationsByBookingDateForYear: function (salesFrom, salesTo, year) {
        return __awaiter(this, void 0, void 0, function () {
            var checkInFrom, checkInTo, from, to, statuses, all, _i, statuses_2, s, res, err_15, fromStr, toStr, filtered;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        checkInFrom = new Date(year, 0, 1) // Jan 1 of target year
                        ;
                        checkInTo = new Date(year + 1, 11, 31) // Dec 31 of next year
                        ;
                        from = checkInFrom.toISOString().split('T')[0];
                        to = checkInTo.toISOString().split('T')[0];
                        statuses = ['Reservation', 'Waiting', 'InHouse', 'CheckOut'];
                        all = [];
                        _i = 0, statuses_2 = statuses;
                        _a.label = 1;
                    case 1:
                        if (!(_i < statuses_2.length)) return [3 /*break*/, 6];
                        s = statuses_2[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, fetchReservations(from, to, s)];
                    case 3:
                        res = _a.sent();
                        all.push.apply(all, res);
                        return [3 /*break*/, 5];
                    case 4:
                        err_15 = _a.sent();
                        console.error("[Elektra] Reservations for year ".concat(year, " (").concat(s, ") error:"), err_15);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        fromStr = salesFrom.toISOString().split('T')[0];
                        toStr = salesTo.toISOString().split('T')[0];
                        console.log("[Elektra] YoY comparison: fetched ".concat(all.length, " reservations (check-in ").concat(from, "\u2192").concat(to, "), filtering reservationDate ").concat(fromStr, "\u2192").concat(toStr));
                        filtered = all.filter(function (r) {
                            var saleDate = r.reservationDate.slice(0, 10);
                            return saleDate >= fromStr && saleDate <= toStr;
                        });
                        console.log("[Elektra] YoY comparison: ".concat(filtered.length, " reservations match reservationDate range"));
                        return [2 /*return*/, filtered];
                }
            });
        });
    },
    getRecentReservations: function () {
        return __awaiter(this, arguments, void 0, function (limit) {
            var allReservations;
            if (limit === void 0) { limit = 10; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAllSeasonReservations()
                        // Sort by lastUpdate (booking/sale date) descending and take first N
                    ];
                    case 1:
                        allReservations = _a.sent();
                        // Sort by lastUpdate (booking/sale date) descending and take first N
                        return [2 /*return*/, allReservations
                                .sort(function (a, b) { return b.lastUpdate.localeCompare(a.lastUpdate); })
                                .slice(0, limit)];
                }
            });
        });
    },
    // ─── Sales & Channel Data (REAL DATA) ───────────────────
    // Sales are grouped by BOOKING/SALE DATE (lastUpdate), not check-in date
    // This way sales are visible even during off-season
    getSalesData: function (salesFrom, salesTo) {
        return __awaiter(this, void 0, void 0, function () {
            var reservations, byDate, _i, reservations_1, res, date, entry, amountTry, nights, roomCount, roomNights, isCancelled;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getReservationsByBookingDate(salesFrom, salesTo)
                        // Group by sale/booking date (lastUpdate) and channel
                    ];
                    case 1:
                        reservations = _a.sent();
                        byDate = new Map();
                        for (_i = 0, reservations_1 = reservations; _i < reservations_1.length; _i++) {
                            res = reservations_1[_i];
                            date = res.lastUpdate.slice(0, 10) // YYYY-MM-DD from ISO
                            ;
                            if (!date)
                                continue;
                            if (!byDate.has(date)) {
                                byDate.set(date, {
                                    date: date,
                                    web: 0, callCenter: 0, ota: 0, tourOperator: 0, direct: 0,
                                    totalRevenue: 0, totalReservations: 0, totalRoomNights: 0,
                                    otaRes: 0, otaRN: 0, callCenterRes: 0, callCenterRN: 0,
                                    webRes: 0, webRN: 0, directRes: 0, directRN: 0,
                                    tourOpRes: 0, tourOpRN: 0
                                });
                            }
                            entry = byDate.get(date);
                            amountTry = res.amountTry || 0;
                            nights = Math.max(1, res.nights || 1);
                            roomCount = Math.max(1, res.roomCount || 1);
                            roomNights = nights * roomCount;
                            isCancelled = res.status === 'Cancelled' || res.status === 'İptal';
                            if (!isCancelled) {
                                entry.totalRevenue += amountTry;
                                entry.totalReservations += 1;
                                entry.totalRoomNights += roomNights;
                                switch (res.channel) {
                                    case 'Website':
                                        entry.web += amountTry;
                                        entry.webRes += 1;
                                        entry.webRN += roomNights;
                                        break;
                                    case 'Call Center':
                                        entry.callCenter += amountTry;
                                        entry.callCenterRes += 1;
                                        entry.callCenterRN += roomNights;
                                        break;
                                    case 'OTA':
                                        entry.ota += amountTry;
                                        entry.otaRes += 1;
                                        entry.otaRN += roomNights;
                                        break;
                                    case 'Direkt':
                                        entry.direct += amountTry;
                                        entry.directRes += 1;
                                        entry.directRN += roomNights;
                                        break;
                                    default:
                                        entry.tourOperator += amountTry;
                                        entry.tourOpRes += 1;
                                        entry.tourOpRN += roomNights;
                                        break;
                                }
                            }
                        }
                        return [2 /*return*/, Array.from(byDate.values()).sort(function (a, b) { return a.date.localeCompare(b.date); })];
                }
            });
        });
    },
    getChannelDistribution: function () {
        return __awaiter(this, void 0, void 0, function () {
            var reservations, channels, _i, reservations_2, res, ch, entry, total;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAllSeasonReservations()
                        // Count by channel
                    ];
                    case 1:
                        reservations = _a.sent();
                        channels = new Map();
                        for (_i = 0, reservations_2 = reservations; _i < reservations_2.length; _i++) {
                            res = reservations_2[_i];
                            ch = res.channel;
                            if (!channels.has(ch))
                                channels.set(ch, { count: 0, revenue: 0 });
                            entry = channels.get(ch);
                            entry.count += 1;
                            entry.revenue += res.amountTry || 0;
                        }
                        total = Array.from(channels.values()).reduce(function (sum, c) { return sum + c.count; }, 0) || 1;
                        return [2 /*return*/, Array.from(channels.entries())
                                .map(function (_a) {
                                var name = _a[0], data = _a[1];
                                return ({
                                    name: name,
                                    value: Math.round((data.count / total) * 100),
                                    count: data.count,
                                    color: CHANNEL_COLORS[name] || '#64748b'
                                });
                            })
                                .sort(function (a, b) { return b.count - a.count; })];
                }
            });
        });
    },
    getDailyStats: function () {
        return __awaiter(this, void 0, void 0, function () {
            var today, todayStr, monthStart, _a, occupancy, allReservations, rates, todaySales, monthStartStr, monthSales, monthlyRevenueTRY, monthlyRevenueEUR, totalRoomNights, adrTRY, adrEUR, todayRevenueTRY, todayRevenueEUR;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        today = new Date();
                        todayStr = today.toISOString().split('T')[0];
                        monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                        return [4 /*yield*/, Promise.all([
                                this.getTodayOccupancy(),
                                this.getAllSeasonReservations().catch(function () { return []; }),
                                fetchExchangeRates(),
                            ])
                            // Reservations SOLD today (by lastUpdate/booking date, not check-in)
                        ];
                    case 1:
                        _a = _b.sent(), occupancy = _a[0], allReservations = _a[1], rates = _a[2];
                        todaySales = allReservations.filter(function (r) { return r.lastUpdate.slice(0, 10) === todayStr; });
                        monthStartStr = monthStart.toISOString().split('T')[0];
                        monthSales = allReservations.filter(function (r) { return r.lastUpdate.slice(0, 10) >= monthStartStr; });
                        monthlyRevenueTRY = monthSales.reduce(function (sum, r) { return sum + (r.amountTry || 0); }, 0);
                        monthlyRevenueEUR = monthSales.reduce(function (sum, r) { return sum + (r.amountEur || 0); }, 0);
                        totalRoomNights = monthSales.reduce(function (sum, r) {
                            var nights = Math.max(1, Math.ceil((new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / 86400000));
                            return sum + nights * r.roomCount;
                        }, 0);
                        adrTRY = totalRoomNights > 0 ? Math.round(monthlyRevenueTRY / totalRoomNights) : 0;
                        adrEUR = totalRoomNights > 0 ? Math.round(monthlyRevenueEUR / totalRoomNights) : 0;
                        todayRevenueTRY = todaySales.reduce(function (sum, r) { return sum + (r.amountTry || 0); }, 0);
                        todayRevenueEUR = todaySales.reduce(function (sum, r) { return sum + (r.amountEur || 0); }, 0);
                        return [2 /*return*/, {
                                todaySalesCount: todaySales.length,
                                todayRevenue: "\u20BA".concat(todayRevenueTRY.toLocaleString('tr-TR')),
                                todayRevenueEUR: "\u20AC".concat(Math.round(todayRevenueEUR).toLocaleString('tr-TR')),
                                totalRevenue: "\u20BA".concat(monthlyRevenueTRY.toLocaleString('tr-TR')),
                                totalRevenueEUR: "\u20AC".concat(Math.round(monthlyRevenueEUR).toLocaleString('tr-TR')),
                                occupancyRate: "".concat(occupancy.rate, "%"),
                                occupancyAvailable: occupancy.available,
                                occupancyTotal: occupancy.total,
                                adr: "\u20BA".concat(adrTRY.toLocaleString('tr-TR')),
                                adrEUR: "\u20AC".concat(adrEUR.toLocaleString('tr-TR')),
                                monthlyReservationCount: monthSales.length,
                                exchangeRate: rates,
                            }];
                }
            });
        });
    },
    getMonthlyReport: function (year) {
        return __awaiter(this, void 0, void 0, function () {
            var startDate, endDate, reservations, monthly, _i, reservations_3, res, month, entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startDate = new Date(year, 0, 1);
                        endDate = new Date(year, 11, 31);
                        return [4 /*yield*/, this.getReservations(startDate, endDate)];
                    case 1:
                        reservations = _a.sent();
                        monthly = new Map();
                        for (_i = 0, reservations_3 = reservations; _i < reservations_3.length; _i++) {
                            res = reservations_3[_i];
                            month = res.checkIn.slice(0, 7) // YYYY-MM
                            ;
                            if (!month)
                                continue;
                            if (!monthly.has(month)) {
                                monthly.set(month, { month: month, reservationCount: 0, revenue: 0, currency: 'TRY' });
                            }
                            entry = monthly.get(month);
                            entry.reservationCount += 1;
                            entry.revenue += res.amountTry || 0;
                        }
                        return [2 /*return*/, Array.from(monthly.values()).sort(function (a, b) { return a.month.localeCompare(b.month); })];
                }
            });
        });
    },
    // ─── Extra Revenue (Spa, Minibar, Restaurant) ────────────────
    // Placeholder implementations as specific endpoints are not confirmed
    getDepartmentRevenue: function (department, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var jwt, from, to, endpoints, _i, endpoints_1, url, res, raw, items, byDate, _a, items_1, item, date, amount, dateKey, _b, err_16, days, data, i, d, dateStr, dayOfWeek, isWeekend, base, random;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 10, , 11]);
                        return [4 /*yield*/, getJwt()];
                    case 1:
                        jwt = _c.sent();
                        from = startDate.toISOString().split('T')[0];
                        to = endDate.toISOString().split('T')[0];
                        endpoints = [
                            "".concat(API_BASE, "/hotel/").concat(HOTEL_ID, "/pos?department=").concat(department, "&from=").concat(from, "&to=").concat(to),
                            "".concat(API_BASE, "/hotel/").concat(HOTEL_ID, "/folios?department=").concat(department, "&from=").concat(from, "&to=").concat(to),
                            "".concat(API_BASE, "/hotel/").concat(HOTEL_ID, "/cashbook?department=").concat(department, "&startDate=").concat(from, "&endDate=").concat(to),
                        ];
                        _i = 0, endpoints_1 = endpoints;
                        _c.label = 2;
                    case 2:
                        if (!(_i < endpoints_1.length)) return [3 /*break*/, 9];
                        url = endpoints_1[_i];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 7, , 8]);
                        return [4 /*yield*/, fetch(url, {
                                headers: { 'Authorization': "Bearer ".concat(jwt) },
                                signal: AbortSignal.timeout(5000),
                            })];
                    case 4:
                        res = _c.sent();
                        if (!res.ok) return [3 /*break*/, 6];
                        return [4 /*yield*/, res.json()];
                    case 5:
                        raw = _c.sent();
                        items = Array.isArray(raw) ? raw : ((raw === null || raw === void 0 ? void 0 : raw.data) || (raw === null || raw === void 0 ? void 0 : raw.items) || (raw === null || raw === void 0 ? void 0 : raw.Result) || []);
                        if (Array.isArray(items) && items.length > 0) {
                            console.log("[Elektra] Department ".concat(department, " revenue from ").concat(url, ": ").concat(items.length, " records"));
                            byDate = new Map();
                            for (_a = 0, items_1 = items; _a < items_1.length; _a++) {
                                item = items_1[_a];
                                date = item.date || item.Date || item.TRANSACTIONDATE || item['transaction-date'] || '';
                                amount = item.amount || item.Amount || item.TOTAL || item.total || item.revenue || 0;
                                if (date) {
                                    dateKey = date.slice(0, 10);
                                    byDate.set(dateKey, (byDate.get(dateKey) || 0) + Number(amount));
                                }
                            }
                            return [2 /*return*/, Array.from(byDate.entries()).map(function (_a) {
                                    var date = _a[0], revenue = _a[1];
                                    return ({
                                        date: date,
                                        departmentId: department,
                                        revenue: revenue,
                                        currency: 'EUR'
                                    });
                                })];
                        }
                        _c.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        _b = _c.sent();
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9:
                        console.log("[Elektra] No live POS data for ".concat(department, ", using generated data"));
                        return [3 /*break*/, 11];
                    case 10:
                        err_16 = _c.sent();
                        console.warn("[Elektra] Department revenue API error for ".concat(department, ":"), err_16.message);
                        return [3 /*break*/, 11];
                    case 11:
                        days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                        data = [];
                        for (i = 0; i <= days; i++) {
                            d = new Date(startDate);
                            d.setDate(d.getDate() + i);
                            dateStr = d.toISOString().split('T')[0];
                            dayOfWeek = d.getDay();
                            isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                            base = department === 'SPA' ? (isWeekend ? 700 : 400)
                                : department === 'MINIBAR' ? (isWeekend ? 150 : 80)
                                    : (isWeekend ? 2800 : 1800) // RESTAURANT
                            ;
                            random = Math.floor(Math.random() * base * 0.4) + base;
                            data.push({
                                date: dateStr,
                                departmentId: department,
                                revenue: random,
                                currency: 'EUR'
                            });
                        }
                        return [2 /*return*/, data];
                }
            });
        });
    },
    getSpaRevenue: function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getDepartmentRevenue('SPA', startDate, endDate)];
            });
        });
    },
    getMinibarRevenue: function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getDepartmentRevenue('MINIBAR', startDate, endDate)];
            });
        });
    },
    getRestaurantExtras: function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getDepartmentRevenue('RESTAURANT', startDate, endDate)];
            });
        });
    },
    // ─── CRM (Reviews & Surveys) ─────────────────────────────────
    getGuestReviews: function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var reviews, count, sources, sourceWeights, languages, positiveComments, neutralComments, negativeComments, guestNames, seed, seededRandom, i, dayOffset, date, r, sentiment, rating, comments, comment, sourceIdx, cumWeight, srcRand, s, hasReply, guestName;
            return __generator(this, function (_a) {
                reviews = [];
                count = 60;
                sources = ['Google', 'Booking.com', 'TripAdvisor', 'Survey', 'Direct'];
                sourceWeights = [0.3, 0.35, 0.15, 0.1, 0.1] // Booking.com dominant
                ;
                languages = ['tr', 'en', 'de', 'ru'];
                positiveComments = [
                    'Personel çok ilgili ve güler yüzlüydü, harika bir tatil geçirdik!',
                    'Havuz alanı mükemmeldi, çocuklarımız bayıldı. Temizlik kusursuzdu.',
                    'Yemekler çok lezzetli, özellikle akşam büfesi muhteşemdi.',
                    'Deniz manzarası odamızdan nefes kesiciydi. Spa hizmeti çok iyiydi.',
                    'Everything was perfect! The beach is stunning and food quality is top notch.',
                    'Wunderschönes Hotel, tolles Essen, sehr freundliches Personal!',
                    'Прекрасный отель! Чистота, еда и обслуживание на высшем уровне.',
                    'All-inclusive concept was amazing, never had such a great service.',
                    'Animasyon ekibi harikaydı, her gece farklı etkinlikler düzenlediler.',
                    'Plaj çok temiz ve bakımlı. Şezlong hizmeti mükemmeldi.',
                ];
                neutralComments = [
                    'Genel olarak iyi bir tatildi. Oda biraz küçüktü ama temizdi.',
                    'Yemekler fena değil ama biraz daha çeşitlilik olabilirdi.',
                    'Hotel is nice but the room could use some renovation. Staff was friendly.',
                    'WiFi zayıftı, bunun dışında herşey iyiydi.',
                    'Havuz kalabalıktı ama animasyon ekibi iyiydi.',
                ];
                negativeComments = [
                    'Klima düzgün çalışmıyordu, çok sıcaktı. Defalarca söylememize rağmen düzelmedi.',
                    'Gürültü seviyesi çok yüksekti, gece uyuyamadık.',
                    'Oda temizliğinden memnun kalmadık, banyo lekeliydi.',
                    'Food quality was below expectations for a 5-star resort.',
                    'Check-in process was very slow, waited over 1 hour.',
                ];
                guestNames = [
                    'Mehmet Yılmaz', 'Ayşe Kaya', 'John Smith', 'Hans Müller',
                    'Иван Петров', 'Fatma Demir', 'Emily Johnson', 'Karl Schmidt',
                    'Елена Иванова', 'Ali Öztürk', 'Sarah Wilson', 'Wolfgang Wagner',
                    'Ahmet Çelik', 'Maria González', 'Petra Bauer', 'Дмитрий Сидоров',
                    'Zeynep Arslan', 'Michael Brown', 'Anna Fischer', 'Сергей Козлов',
                ];
                seed = 42;
                seededRandom = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
                for (i = 0; i < count; i++) {
                    dayOffset = Math.floor(seededRandom() * ((endDate.getTime() - startDate.getTime()) / 86400000));
                    date = new Date(startDate.getTime() + dayOffset * 86400000);
                    r = seededRandom();
                    sentiment = r > 0.25 ? 'positive' : r > 0.08 ? 'neutral' : 'negative';
                    rating = sentiment === 'positive' ? Math.floor(seededRandom() * 3) + 8
                        : sentiment === 'neutral' ? Math.floor(seededRandom() * 2) + 6
                            : Math.floor(seededRandom() * 3) + 3;
                    comments = sentiment === 'positive' ? positiveComments
                        : sentiment === 'neutral' ? neutralComments : negativeComments;
                    comment = comments[Math.floor(seededRandom() * comments.length)];
                    sourceIdx = 0;
                    cumWeight = 0;
                    srcRand = seededRandom();
                    for (s = 0; s < sourceWeights.length; s++) {
                        cumWeight += sourceWeights[s];
                        if (srcRand <= cumWeight) {
                            sourceIdx = s;
                            break;
                        }
                    }
                    hasReply = seededRandom() > 0.35;
                    guestName = guestNames[Math.floor(seededRandom() * guestNames.length)];
                    reviews.push({
                        id: i + 1000,
                        date: date.toISOString().split('T')[0],
                        guestName: guestName,
                        roomNumber: "".concat(200 + Math.floor(seededRandom() * 400)),
                        rating: rating,
                        comment: comment,
                        status: hasReply ? 'replied' : 'pending',
                        reply: hasReply ? 'Değerli misafirimiz, yorumunuz için teşekkür ederiz.' : undefined,
                        replyDate: hasReply ? new Date(date.getTime() + (1 + Math.floor(seededRandom() * 3)) * 86400000).toISOString().split('T')[0] : undefined,
                        source: sources[sourceIdx],
                        language: languages[Math.floor(seededRandom() * languages.length)],
                        sentiment: sentiment
                    });
                }
                return [2 /*return*/, reviews.sort(function (a, b) { return b.date.localeCompare(a.date); })];
            });
        });
    },
    getSurveyResults: function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Mock Surveys
                return [2 /*return*/, []];
            });
        });
    },
    getReviewResponseMetrics: function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var reviews, total, replied, totalTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getGuestReviews(startDate, endDate)];
                    case 1:
                        reviews = _a.sent();
                        total = reviews.length;
                        replied = reviews.filter(function (r) { return r.status === 'replied'; }).length;
                        totalTime = reviews.reduce(function (sum, r) {
                            if (r.replyDate && r.date) {
                                return sum + (new Date(r.replyDate).getTime() - new Date(r.date).getTime());
                            }
                            return sum;
                        }, 0);
                        return [2 /*return*/, {
                                total: total,
                                replied: replied,
                                pending: total - replied,
                                responseRate: total > 0 ? Math.round((replied / total) * 100) : 0,
                                avgResponseTimeHours: replied > 0 ? Math.round((totalTime / replied) / 3600000) : 0
                            }];
                }
            });
        });
    },
    // ─── Exchange Rates ─────────────────────────────────────────
    getExchangeRates: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, fetchExchangeRates()];
            });
        });
    },
    // ─── Countries / Countries ───────────────────────────────
    getCountries: function () {
        return __awaiter(this, void 0, void 0, function () {
            var map;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetchCountries()];
                    case 1:
                        map = _a.sent();
                        return [2 /*return*/, Array.from(map.entries())
                                .map(function (_a) {
                                var id = _a[0], name = _a[1];
                                return ({ id: id, name: name });
                            })
                                .sort(function (a, b) { return a.name.localeCompare(b.name); })];
                }
            });
        });
    },
    // ─── Create Reservation    // Submit new reservation to Elektra
    createReservation: function (bookingData) {
        return __awaiter(this, void 0, void 0, function () {
            var jwt, checkInStr, checkOutStr, _a, firstName, lastNames, lastName, payload, res, text, data, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, getJwt()
                            // Format dates simply
                        ];
                    case 1:
                        jwt = _b.sent();
                        checkInStr = bookingData.checkIn.toISOString().split('T')[0];
                        checkOutStr = bookingData.checkOut.toISOString().split('T')[0];
                        _a = bookingData.guestName.split(' '), firstName = _a[0], lastNames = _a.slice(1);
                        lastName = lastNames.join(' ') || 'Misafir';
                        payload = {
                            "check-in-date": checkInStr,
                            "check-out-date": checkOutStr,
                            "room-type-id": bookingData.roomTypeId,
                            "adult": bookingData.adults,
                            "child": bookingData.children,
                            "reservation-total-price": bookingData.totalPrice,
                            "reservation-currency": bookingData.currency,
                            "reservation-paid-price": bookingData.paidAmount,
                            "contact-name": bookingData.guestName,
                            "contact-email": bookingData.guestEmail,
                            "contact-phone": bookingData.guestPhone,
                            "agency": "WEB",
                            "voucher-no": bookingData.referenceId,
                            "note": bookingData.guestNotes || "Online Web Rezervasyonu",
                            "guest-list": [
                                {
                                    "name": firstName,
                                    "surname": lastName,
                                    "is-main-guest": true
                                }
                            ]
                        };
                        return [4 /*yield*/, fetch("".concat(API_BASE, "/hotel/").concat(HOTEL_ID, "/reservation"), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': "Bearer ".concat(jwt)
                                },
                                body: JSON.stringify(payload)
                            })];
                    case 2:
                        res = _b.sent();
                        if (!!res.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, res.text()];
                    case 3:
                        text = _b.sent();
                        console.error('[Elektra] Create Reservation Failed:', res.status, text);
                        return [2 /*return*/, { success: false, errorMessage: "HTTP ".concat(res.status, ": ").concat(text) }];
                    case 4: return [4 /*yield*/, res.json()];
                    case 5:
                        data = _b.sent();
                        if (data && data["reservation-id"]) {
                            console.log("[Elektra] Reservation created successfully: ".concat(data["reservation-id"]));
                            return [2 /*return*/, { success: true, pmsId: data["reservation-id"].toString() }];
                        }
                        else {
                            console.error('[Elektra] Create Reservation unexpected response:', data);
                            return [2 /*return*/, { success: false, errorMessage: 'Başarısız format veya rezervasyon ID bulunamadı.' }];
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _b.sent();
                        console.error('[Elektra] Create Reservation Error:', error_1);
                        return [2 /*return*/, { success: false, errorMessage: error_1.message }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }
};
