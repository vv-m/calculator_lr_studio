/**
 * Форматирует ввод пользователя, заменяя запятые на точки и допуская только числа и точку.
 * @param {string} value - Значение для форматирования
 * @returns {string} - Отформатированное значение
 */
export const formatNumberInput = (value) => {
    // Заменяем запятую на точку
    let formattedValue = value.replace(/,/g, '.');

    // Разрешаем цифры и одну точку
    formattedValue = formattedValue.replace(/[^\d.]/g, '');

    // Проверяем, чтобы не было более одной точки
    const parts = formattedValue.split('.');
    if (parts.length > 2) {
        // Если точек больше одной, оставляем только первую
        formattedValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // Если строка начинается с точки, добавляем перед ней ноль
    if (formattedValue.startsWith('.')) {
        formattedValue = '0' + formattedValue;
    }

    return formattedValue;
};

/**
 * Функция-обработчик изменения поля ввода
 * @param {Event} event - Событие изменения поля
 * @param {Function} setter - Функция для установки состояния
 */
export const handleNumberInputChange = (event, setter) => {
    const originalValue = event.target.value;
    const formattedValue = formatNumberInput(originalValue);
    setter(formattedValue);
};

/**
 * Рассчитывает объем на основе трех измерений
 * @param {number} size1 - Первый размер в см
 * @param {number} size2 - Второй размер в см
 * @param {number} size3 - Третий размер в см
 * @returns {string} - Объем в м³, округленный до 6 знаков
 */
export const calculateVolume = (size1, size2, size3) => {
    const s1 = Number(size1);
    const s2 = Number(size2);
    const s3 = Number(size3);
    const volumeValue = (s1 * s2 * s3 / 1000000).toFixed(6);

    return volumeValue;
};