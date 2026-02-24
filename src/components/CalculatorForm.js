import React, { useState, useEffect } from 'react';

import ProductCard from './ProductCard';
import SettingsPanel from './SettingsPanel';

import useExchangeRates from '../hooks/useExchangeRates';
import useSettings from '../hooks/useSettings';

import {
    calculateRailwayDelivery,
    calculateAutoDelivery,
    calculateAirDelivery,
    calculateSellingPrice,
    calculateMargin,
    formatNumber
} from '../utils/calculationUtils';
import { handleNumberInputChange, calculateVolume } from '../utils/inputHelpers';

function CalculatorForm() {
    const { settings, isLoading: settingsLoading, loadError: settingsError, missingKeys, refetch } = useSettings();
    const [showSettings, setShowSettings] = useState(false);

    const [weight, setWeight] = useState('');
    const [size1, setSize1] = useState('');
    const [size2, setSize2] = useState('');
    const [size3, setSize3] = useState('');
    const [volume, setVolume] = useState('');
    const [coast, setCoast] = useState('');
    const [markupCoefficient, setMarkupCoefficient] = useState('');

    const [currency, setCurrency] = useState('USD');
    const [calcMode, setCalcMode] = useState('volume');

    const [coastOfItemByRUB, setCoastOfItemByRUB] = useState(0);

    const [resultByRailway, setResultByRailway] = useState('');
    const [sellingPriceRailway, setSellingPriceRailway] = useState('');
    const [marginRailway, setMarginRailway] = useState('');

    const [resultByAuto, setResultByAuto] = useState('');
    const [sellingPriceAuto, setSellingPriceAuto] = useState('');
    const [marginAuto, setMarginAuto] = useState('');

    const [resultByAir, setResultByAir] = useState('');
    const [sellingPriceAir, setSellingPriceAir] = useState('');
    const [marginAir, setMarginAir] = useState('');

    const [showError, setShowError] = useState(false);
    const [showMissingWarning, setShowMissingWarning] = useState(false);

    const { usdValue, rmbValue } = useExchangeRates();

    useEffect(() => {
        if (settings) {
            setMarkupCoefficient(settings.defaultMarkupCoefficient);
        }
    }, [settings]);

    useEffect(() => {
        if (settingsError) setShowError(true);
    }, [settingsError]);

    useEffect(() => {
        if (missingKeys.length > 0) setShowMissingWarning(true);
    }, [missingKeys]);

    useEffect(() => {
        if (calcMode === 'dimensions' && size1 && size2 && size3) {
            const calculatedVolume = calculateVolume(size1, size2, size3);
            setVolume(calculatedVolume);
        }
    }, [size1, size2, size3, calcMode]);

    useEffect(() => {
        if (calcMode === 'dimensions') {
            setVolume('');
        } else {
            setSize1('');
            setSize2('');
            setSize3('');
        }
    }, [calcMode]);

    const calculateResult = () => {
        if (!settings) return;

        if (!weight || !coast ||
            (calcMode === 'dimensions' && (!size1 || !size2 || !size3)) ||
            (calcMode === 'volume' && !volume)) {
            setResultByRailway('');
            setResultByAuto('');
            setResultByAir('');
            setSellingPriceRailway('');
            setSellingPriceAuto('');
            setSellingPriceAir('');
            setMarginRailway('');
            setMarginAuto('');
            setMarginAir('');
            return;
        }

        let currentCurrencyValue = 0;
        if (currency === "USD") {
            currentCurrencyValue = usdValue * settings.markupCB;
        } else if (currency === "RMB") {
            currentCurrencyValue = rmbValue * settings.markupCB;
        }

        const itemCostInRub = Number(coast) * currentCurrencyValue;
        setCoastOfItemByRUB(itemCostInRub);

        const volumeValue = calcMode === 'dimensions'
            ? Number(size1) * Number(size2) * Number(size3) / 1000000
            : Number(volume);

        const markup = Number(markupCoefficient);

        const coastRailway = calculateRailwayDelivery(
            Number(weight), volumeValue, usdValue, settings.markupCB, itemCostInRub, settings
        );
        const sellPriceRailway = calculateSellingPrice(coastRailway, markup);
        const marginRailwayValue = calculateMargin(sellPriceRailway, coastRailway);
        setResultByRailway(formatNumber(coastRailway));
        setSellingPriceRailway(formatNumber(sellPriceRailway));
        setMarginRailway(marginRailwayValue);

        const coastAuto = calculateAutoDelivery(
            Number(weight), volumeValue, usdValue, settings.markupCB, itemCostInRub, settings
        );
        const sellPriceAuto = calculateSellingPrice(coastAuto, markup);
        const marginAutoValue = calculateMargin(sellPriceAuto, coastAuto);
        setResultByAuto(formatNumber(coastAuto));
        setSellingPriceAuto(formatNumber(sellPriceAuto));
        setMarginAuto(marginAutoValue);

        const airResult = calculateAirDelivery(
            Number(weight), volumeValue, usdValue, settings.markupCB, itemCostInRub, settings
        );

        if (airResult.hasLimitation) {
            setResultByAir(airResult.message);
            setSellingPriceAir('');
            setMarginAir('');
        } else {
            const sellPriceAir = calculateSellingPrice(airResult.cost, markup);
            const marginAirValue = calculateMargin(sellPriceAir, airResult.cost);
            setResultByAir(formatNumber(airResult.cost));
            setSellingPriceAir(formatNumber(sellPriceAir));
            setMarginAir(marginAirValue);
        }
    };

    const clearFields = () => {
        setWeight('');
        setSize1('');
        setSize2('');
        setSize3('');
        setVolume('');
        setCoast('');
    };

    useEffect(() => {
        calculateResult();
    }, [weight, size1, size2, size3, volume, currency, coast, usdValue, rmbValue, calcMode, markupCoefficient, settings]);

    useEffect(() => {
        document.title = 'Калькулятор себестоимости товара с учетом доставки.';
    }, []);

    if (settingsLoading || !settings) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                <p className="mt-4 text-gray-500">Загрузка настроек...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-6">
            {showError && (
                <div className="mb-4 flex items-start justify-between rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-700">
                        Не удалось загрузить настройки из Supabase. Используются настройки по умолчанию.
                        Обратитесь к администратору.
                    </p>
                    <button onClick={() => setShowError(false)} className="ml-4 text-red-400 hover:text-red-600">&times;</button>
                </div>
            )}

            {showMissingWarning && !showError && (
                <div className="mb-4 flex items-start justify-between rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="text-sm text-amber-700">
                        В Supabase отсутствуют следующие параметры (взяты из настроек по умолчанию):
                        <ul className="mt-1 list-disc pl-5">
                            {missingKeys.map((item, i) => (
                                <li key={i}>{item.label}: <strong>{item.defaultValue}</strong></li>
                            ))}
                        </ul>
                        Обратитесь к администратору.
                    </div>
                    <button onClick={() => setShowMissingWarning(false)} className="ml-4 text-amber-400 hover:text-amber-600">&times;</button>
                </div>
            )}

            <div className="mb-6 flex items-center justify-between">
                <div className="w-24" />
                <h1 className="flex-1 text-center text-2xl font-bold text-gray-800">
                    Расчет себестоимости товара с доставкой
                </h1>
                <button
                    onClick={() => setShowSettings(true)}
                    className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                    Настройки
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Левая колонка — параметры */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-5 py-3">
                        <h2 className="text-lg font-semibold text-gray-700">Параметры расчета</h2>
                    </div>
                    <div className="space-y-4 p-5">
                        {/* Способ расчёта */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Способ расчета:</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        name="calcMode"
                                        checked={calcMode === 'volume'}
                                        onChange={() => setCalcMode('volume')}
                                        className="accent-blue-600"
                                    />
                                    По объему
                                </label>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        name="calcMode"
                                        checked={calcMode === 'dimensions'}
                                        onChange={() => setCalcMode('dimensions')}
                                        className="accent-blue-600"
                                    />
                                    По размерам
                                </label>
                            </div>
                        </div>

                        {/* Вес */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Вес, кг</label>
                            <input
                                type="text"
                                value={weight}
                                onChange={(e) => handleNumberInputChange(e, setWeight)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                            />
                        </div>

                        {/* Объём / Размеры */}
                        {calcMode === 'dimensions' ? (
                            <>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Размер 1, см</label>
                                    <input
                                        type="text"
                                        value={size1}
                                        onChange={(e) => handleNumberInputChange(e, setSize1)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Размер 2, см</label>
                                    <input
                                        type="text"
                                        value={size2}
                                        onChange={(e) => handleNumberInputChange(e, setSize2)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Размер 3, см</label>
                                    <input
                                        type="text"
                                        value={size3}
                                        onChange={(e) => handleNumberInputChange(e, setSize3)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Объем, м³</label>
                                    <input
                                        type="text"
                                        value={volume}
                                        disabled
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                                    />
                                </div>
                            </>
                        ) : (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Объем, м³</label>
                                <input
                                    type="text"
                                    value={volume}
                                    onChange={(e) => handleNumberInputChange(e, setVolume)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                />
                            </div>
                        )}

                        {/* Цена товара */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Цена товара</label>
                            <input
                                type="text"
                                value={coast}
                                onChange={(e) => handleNumberInputChange(e, setCoast)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                            />
                        </div>

                        {/* Коэффициент наценки */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Коэффициент наценки</label>
                            <input
                                type="text"
                                value={markupCoefficient}
                                onChange={(e) => handleNumberInputChange(e, setMarkupCoefficient)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                            />
                        </div>

                        {/* Валюта */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Валюта:</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        name="currency"
                                        checked={currency === 'USD'}
                                        onChange={() => setCurrency('USD')}
                                        className="accent-blue-600"
                                    />
                                    USD
                                </label>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        name="currency"
                                        checked={currency === 'RMB'}
                                        onChange={() => setCurrency('RMB')}
                                        className="accent-blue-600"
                                    />
                                    RMB
                                </label>
                            </div>
                        </div>

                        {/* Курсы */}
                        <div className="text-xs text-gray-400">
                            Текущий курс USD: {usdValue ? (usdValue * settings.markupCB).toFixed(2) : '...'} ₽ (с учетом наценки {settings.markupCBPercent}%)
                            <br />
                            Текущий курс RMB: {rmbValue ? (rmbValue * settings.markupCB).toFixed(2) : '...'} ₽ (с учетом наценки {settings.markupCBPercent}%)
                        </div>

                        {/* Очистить */}
                        <button
                            onClick={clearFields}
                            className="w-full rounded-lg border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
                        >
                            Очистить поля
                        </button>
                    </div>
                </div>

                {/* Правая колонка — результаты */}
                <div>
                    <h2 className="mb-3 text-lg font-semibold text-gray-700">Результаты расчета:</h2>
                    <ProductCard
                        name={settings.railWay.name}
                        deliveryTime={settings.railWay.deliveryTime}
                        price={resultByRailway}
                        sellingPrice={sellingPriceRailway}
                        margin={marginRailway}
                    />
                    <ProductCard
                        name={settings.auto.name}
                        deliveryTime={settings.auto.deliveryTime}
                        price={resultByAuto}
                        sellingPrice={sellingPriceAuto}
                        margin={marginAuto}
                    />
                    <ProductCard
                        name={settings.air.name}
                        deliveryTime={settings.air.deliveryTime}
                        price={resultByAir}
                        sellingPrice={sellingPriceAir}
                        margin={marginAir}
                    />
                </div>
            </div>

            <SettingsPanel
                show={showSettings}
                onClose={() => setShowSettings(false)}
                onSaved={refetch}
            />
        </div>
    );
}

export default CalculatorForm;
