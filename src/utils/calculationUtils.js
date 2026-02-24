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
    const marginInRub = sellingPrice - costPrice;
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
 * @param {Object} settings - Настройки (priceRailwayForKG, priceRailwayForCUB)
 * @returns {number} - Общая стоимость
 */
export const calculateRailwayDelivery = (weight, volume, usdRate, markupCB, itemCostRub, settings) => {
    const costByWeight = weight * settings.priceRailwayForKG * usdRate * markupCB + itemCostRub;
    const costByVolume = volume * settings.priceRailwayForCUB * usdRate * markupCB + itemCostRub;
    return Math.max(costByWeight, costByVolume);
};

/**
 * Рассчитывает стоимость доставки автомобильным транспортом
 * @param {number} weight - Вес в кг
 * @param {number} volume - Объем в м³
 * @param {number} usdRate - Курс USD
 * @param {number} markupCB - Коэффициент наценки на курс
 * @param {number} itemCostRub - Стоимость товара в рублях
 * @param {Object} settings - Настройки (priceAutoForKG, priceAutoForCUB)
 * @returns {number} - Общая стоимость
 */
export const calculateAutoDelivery = (weight, volume, usdRate, markupCB, itemCostRub, settings) => {
    const costByWeight = weight * settings.priceAutoForKG * usdRate * markupCB + itemCostRub;
    const costByVolume = volume * settings.priceAutoForCUB * usdRate * markupCB + itemCostRub;
    return Math.max(costByWeight, costByVolume);
};

/**
 * Рассчитывает стоимость авиадоставки и проверяет ограничения
 * @param {number} weight - Вес в кг
 * @param {number} volume - Объем в м³
 * @param {number} usdRate - Курс USD
 * @param {number} markupCB - Коэффициент наценки на курс
 * @param {number} itemCostRub - Стоимость товара в рублях
 * @param {Object} settings - Настройки (priceAirForKG, maxWeightForAir, maxVolumeForAir, alarmWeightTextAir, alarmVolumeTextAir)
 * @returns {Object} - Результат расчета с цены и статусом ограничений
 */
export const calculateAirDelivery = (weight, volume, usdRate, markupCB, itemCostRub, settings) => {
    if (weight > settings.maxWeightForAir) {
        return { cost: 0, message: settings.alarmWeightTextAir, hasLimitation: true };
    } else if (volume > settings.maxVolumeForAir) {
        return { cost: 0, message: settings.alarmVolumeTextAir, hasLimitation: true };
    } else {
        const cost = weight * settings.priceAirForKG * usdRate * markupCB + itemCostRub;
        return { cost, message: '', hasLimitation: false };
    }
};
