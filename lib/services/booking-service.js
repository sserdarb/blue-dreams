"use strict";
// Booking Service — Fetches room availability from Elektra API
// Provides availability grouped by room type with TRY pricing
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.BookingService = void 0;
var elektra_1 = require("./elektra");
var BookingService = /** @class */ (function () {
    function BookingService() {
    }
    BookingService.getAvailability = function (checkIn_1, checkOut_1) {
        return __awaiter(this, arguments, void 0, function (checkIn, checkOut, adults, children, currency, agency) {
            var rawAvailability, rates, eurRate_1, byRoomType, _i, rawAvailability_1, avail, key, results, _a, byRoomType_1, _b, roomType, _c, roomTypeId, dates, availableDates, prices, isAvailable, totalPrice, nights, error_1;
            if (adults === void 0) { adults = 2; }
            if (children === void 0) { children = 0; }
            if (currency === void 0) { currency = 'TRY'; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, elektra_1.ElektraService.getAvailability(new Date(checkIn), new Date(checkOut), currency, agency)];
                    case 1:
                        rawAvailability = _d.sent();
                        if (!rawAvailability || rawAvailability.length === 0) {
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, elektra_1.ElektraService.getExchangeRates()];
                    case 2:
                        rates = _d.sent();
                        eurRate_1 = rates.EUR_TO_TRY && rates.EUR_TO_TRY > 0 ? rates.EUR_TO_TRY : 38.5;
                        byRoomType = new Map();
                        for (_i = 0, rawAvailability_1 = rawAvailability; _i < rawAvailability_1.length; _i++) {
                            avail = rawAvailability_1[_i];
                            key = avail.roomType;
                            if (!byRoomType.has(key)) {
                                byRoomType.set(key, { roomTypeId: avail.roomTypeId, dates: [] });
                            }
                            byRoomType.get(key).dates.push(avail);
                        }
                        results = [];
                        for (_a = 0, byRoomType_1 = byRoomType; _a < byRoomType_1.length; _a++) {
                            _b = byRoomType_1[_a], roomType = _b[0], _c = _b[1], roomTypeId = _c.roomTypeId, dates = _c.dates;
                            availableDates = dates.map(function (d) {
                                var _a, _b;
                                var price = (_b = (_a = d.discountedPrice) !== null && _a !== void 0 ? _a : d.basePrice) !== null && _b !== void 0 ? _b : 0;
                                return {
                                    date: d.date,
                                    availableCount: d.availableCount,
                                    pricePerNight: price,
                                    pricePerNightEur: price / eurRate_1,
                                    stopsell: d.stopsell
                                };
                            });
                            prices = availableDates
                                .filter(function (d) { return !d.stopsell && d.availableCount > 0 && d.pricePerNight > 0; })
                                .map(function (d) { return d.pricePerNight; });
                            isAvailable = prices.length > 0;
                            totalPrice = prices.reduce(function (s, p) { return s + p; }, 0);
                            nights = prices.length;
                            results.push({
                                roomType: roomType,
                                roomTypeId: roomTypeId,
                                availableDates: availableDates,
                                minPrice: isAvailable ? Math.min.apply(Math, prices) : 0,
                                maxPrice: isAvailable ? Math.max.apply(Math, prices) : 0,
                                minPriceEur: isAvailable ? Math.min.apply(Math, prices) / eurRate_1 : 0,
                                maxPriceEur: isAvailable ? Math.max.apply(Math, prices) / eurRate_1 : 0,
                                totalPrice: totalPrice,
                                totalPriceEur: totalPrice / eurRate_1,
                                avgPricePerNight: nights > 0 ? totalPrice / nights : 0,
                                avgPricePerNightEur: nights > 0 ? (totalPrice / nights) / eurRate_1 : 0,
                                isAvailable: isAvailable,
                                nights: nights
                            });
                        }
                        // Sort: available first, then by price
                        return [2 /*return*/, results.sort(function (a, b) {
                                if (a.isAvailable && !b.isAvailable)
                                    return -1;
                                if (!a.isAvailable && b.isAvailable)
                                    return 1;
                                return a.minPrice - b.minPrice;
                            })];
                    case 3:
                        error_1 = _d.sent();
                        console.error('[BookingService] Availability error:', error_1);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BookingService.submitBookingRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var referenceId;
            return __generator(this, function (_a) {
                referenceId = "BDR-".concat(Date.now().toString(36).toUpperCase());
                console.log('[BookingService] New booking request:', __assign({ referenceId: referenceId }, request));
                // TODO: Integrate with Elektra reservation creation API or email notification
                return [2 /*return*/, {
                        success: true,
                        message: "Rezervasyon talebiniz al\u0131nm\u0131\u015Ft\u0131r. Referans No: ".concat(referenceId, ". En k\u0131sa s\u00FCrede sizinle ileti\u015Fime ge\u00E7ece\u011Fiz."),
                        referenceId: referenceId
                    }];
            });
        });
    };
    return BookingService;
}());
exports.BookingService = BookingService;
