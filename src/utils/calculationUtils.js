import {
    priceRailwayForKG,
    priceRailwayForCUB,
    priceAutoForKG,
    priceAutoForCUB,
    priceAirForKG,
    maxWeightForAir,
    maxVolumeForAir,
    alarmWeightTextAir,
    alarmVolumeTextAir
} from '../constants';

/**
 * Преобразует числовое значение в форматированную строку с разделением тысяч
 * @param {number} value - Значение для форматирования
 * @returns {string} Форматированная строка
 */
export const formatNumber = (value) => {
    const result = Math.round(value).toLocaleString('ru-RU');
    return result;
};

/**
 * Рассчитывает маржинальность в рублях
 * @param {number} sellingPrice - Цена продажи
 * @param {number} costPrice - Себестоимость
 * @returns {string} - Маржинальность в рублях, форматированная строка
 */
export const calculateMargin = (sellingPrice, costPrice) => {
    // Вычисляем маржу в рублях
    const marginInRub = sellingPrice - costPrice;
    // Возвращаем форматированную строку
    return formatNumber(marginInRub);
};

/**
 * Рассчитывает цену продажи на основе себестоимости и коэффициента наценки
 * @param {number} costPrice - Себестоимость
 * @param {number} markupCoefficient - Коэффициент наценки
 * @returns {number} - Цена продажи
 */
export const calculateSellingPrice = (costPrice, markupCoefficient) => {
    const result = costPrice * markupCoefficient;
    return result;
};

/**
 * Рассчитывает стоимость доставки по железной дороге
 * @param {number} weight - Вес в кг
 * @param {number} volume - Объем в м³
 * @param {number} usdRate - Курс USD
 * @param {number} markupCB - Коэффициент наценки на курс
 * @param {number} itemCostRub - Стоимость товара в рублях
 * @returns {number} - Общая стоимость
 */
export const calculateRailwayDelivery = (weight, volume, usdRate, markupCB, itemCostRub) => {
    // Расчет по весу
    const costByWeight = weight * priceRailwayForKG * usdRate * markupCB + itemCostRub;

    // Расчет по объему
    const costByVolume = volume * priceRailwayForCUB * usdRate * markupCB + itemCostRub;

    // Логирование компонентов расчета

    // Выбираем большее значение
    return Math.max(costByWeight, costByVolume);
};

/**
 * Рассчитывает стоимость доставки автомобильным транспортом
 * @param {number} weight - Вес в кг
 * @param {number} volume - Объем в м³
 * @param {number} usdRate - Курс USD
 * @param {number} markupCB - Коэффициент наценки на курс
 * @param {number} itemCostRub - Стоимость товара в рублях
 * @returns {number} - Общая стоимость
 */
export const calculateAutoDelivery = (weight, volume, usdRate, markupCB, itemCostRub) => {
    // Расчет по весу
    const costByWeight = weight * priceAutoForKG * usdRate * markupCB + itemCostRub;

    // Расчет по объему
    const costByVolume = volume * priceAutoForCUB * usdRate * markupCB + itemCostRub;

    // Выбираем большее значение
    return Math.max(costByWeight, costByVolume);
};

/**
 * Рассчитывает стоимость авиадоставки и проверяет ограничения
 * @param {number} weight - Вес в кг
 * @param {number} volume - Объем в м³
 * @param {number} usdRate - Курс USD
 * @param {number} markupCB - Коэффициент наценки на курс
 * @param {number} itemCostRub - Стоимость товара в рублях
 * @returns {Object} - Результат расчета с цены и статусом ограничений
 */
export const calculateAirDelivery = (weight, volume, usdRate, markupCB, itemCostRub) => {
    // Проверка ограничений
    if (weight > maxWeightForAir) {
        return { cost: 0, message: alarmWeightTextAir, hasLimitation: true };
    } else if (volume > maxVolumeForAir) {
        return { cost: 0, message: alarmVolumeTextAir, hasLimitation: true };
    } else {
        // Расчет стоимости
        const cost = weight * priceAirForKG * usdRate * markupCB + itemCostRub;
        return { cost, message: '', hasLimitation: false };
    }
};