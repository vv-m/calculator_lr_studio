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
                const response = await fetch(currencyApiUrl);
                const data = await response.text();

                const parser = new DOMParser();
                const xml = parser.parseFromString(data, "text/xml");

                // Получаем все элементы Valute
                const valutes = xml.getElementsByTagName("Valute");

                for (let i = 0; i < valutes.length; i++) {
                    const charCode = valutes[i].getElementsByTagName("CharCode")[0].textContent;

                    if (charCode === "USD") {
                        let usdValueTMP = valutes[i].getElementsByTagName("Value")[0].textContent;
                        let usd = parseFloat(usdValueTMP.replace(',', '.'));
                        setUsdValue(usd);
                    }

                    if (charCode === "CNY") {
                        let rmbValueTMP = valutes[i].getElementsByTagName("Value")[0].textContent;
                        let rmb = parseFloat(rmbValueTMP.replace(',', '.'));
                        setRmbValue(rmb);
                    }
                }

                setIsLoading(false);
            } catch (err) {
                console.error('Ошибка при получении данных:', err);
                setError(err);
                setIsLoading(false);
            }
        };

        fetchExchangeRates();
    }, []);

    return { usdValue, rmbValue, isLoading, error };
};

export default useExchangeRates;