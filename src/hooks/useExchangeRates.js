import { useState, useEffect } from 'react';
import { currencyApiUrl } from '../constants';

/**
 * Хук для получения актуальных курсов валют
 * @returns {Object} Объект с курсами валют
 */
const useExchangeRates = () => {
    const [usdValue, setUsdValue] = useState(0);
    const [rmbValue, setRmbValue] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExchangeRates = async () => {
            try {
                setIsLoading(true);

                // Получаем курс USD
                const usdResponse = await fetch(currencyApiUrl + "USD");
                const usdData = await usdResponse.json();
                setUsdValue(usdData.rates.RUB);

                // Получаем курс CNY
                const cnyResponse = await fetch(currencyApiUrl + "CNY");
                const cnyData = await cnyResponse.json();
                setRmbValue(cnyData.rates.RUB);

                setIsLoading(false);
            } catch (err) {
                console.error('Ошибка при получении данных:', err);
                setError(err);
                setIsLoading(false);
            }
        };

        void fetchExchangeRates();

    }, []);

    return { usdValue, rmbValue, isLoading, error };
};

export default useExchangeRates;