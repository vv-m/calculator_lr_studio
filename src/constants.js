// Типы доставки
export const railWay = {
    name: "Ж/Д 🚂",
    deliveryTime: "45-60"  // дней
};

export const auto = {
    name: "Авто 🚛",
    deliveryTime: "25-35"  // дней
};

export const air = {
    name: "Авиа ✈️",
    deliveryTime: "15-25"  // дней
};

// Сообщения об ограничениях
export const alarmWeightTextAir = "Вес превышен\n (до 50кг)";
export const alarmVolumeTextAir = "Объем превышен\n (до 1 м³)";

// Цены ЖД
export const priceRailwayForKG = 2.4;  // USD за кг ЖД
export const priceRailwayForCUB = 290;  // USD за м³ ЖД

// Цены Авто
export const priceAutoForKG = 5.8;  // USD за кг АВТО
export const priceAutoForCUB = 440;  // USD за м³ АВТО

// Цена Авиа
export const priceAirForKG = 27;  // USD за кг АВИА

// Надбавка на курс ЦБ
export const markupCBPercent = 20;  // %
export const markupCB = (markupCBPercent / 100) + 1;

// API URL для курсов валют
// export const currencyApiUrl = 'https://www.cbr-xml-daily.ru/daily_utf8.xml';
export const currencyApiUrl = 'https://api.exchangerate-api.com/v4/latest/';

// Ограничения для авиа
export const maxWeightForAir = 50; // кг
export const maxVolumeForAir = 1; // м³

// Исходное значение коэффициента наценки
export const defaultMarkupCoefficient = '1.4';