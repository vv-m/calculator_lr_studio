import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import * as defaults from '../constants';

export const EXPECTED_KEYS = {
    priceRailwayForKG: { label: 'Цена ЖД за кг', defaultValue: defaults.priceRailwayForKG },
    priceRailwayForCUB: { label: 'Цена ЖД за м³', defaultValue: defaults.priceRailwayForCUB },
    priceAutoForKG: { label: 'Цена Авто за кг', defaultValue: defaults.priceAutoForKG },
    priceAutoForCUB: { label: 'Цена Авто за м³', defaultValue: defaults.priceAutoForCUB },
    priceAirForKG: { label: 'Цена Авиа за кг', defaultValue: defaults.priceAirForKG },
    markupCBPercent: { label: 'Надбавка на курс ЦБ (%)', defaultValue: defaults.markupCBPercent },
    maxWeightForAir: { label: 'Макс. вес для авиа', defaultValue: defaults.maxWeightForAir },
    maxVolumeForAir: { label: 'Макс. объём для авиа', defaultValue: defaults.maxVolumeForAir },
    defaultMarkupCoefficient: { label: 'Коэффициент наценки', defaultValue: defaults.defaultMarkupCoefficient },
    railWayName: { label: 'Название ЖД', defaultValue: defaults.railWay.name },
    railWayDeliveryTime: { label: 'Срок доставки ЖД', defaultValue: defaults.railWay.deliveryTime },
    autoName: { label: 'Название Авто', defaultValue: defaults.auto.name },
    autoDeliveryTime: { label: 'Срок доставки Авто', defaultValue: defaults.auto.deliveryTime },
    airName: { label: 'Название Авиа', defaultValue: defaults.air.name },
    airDeliveryTime: { label: 'Срок доставки Авиа', defaultValue: defaults.air.deliveryTime },
};

function parseRows(rows) {
    const data = {};
    for (const row of rows) {
        const { key, value } = row;
        if (!key || value === undefined || value === '') continue;
        const numValue = Number(value);
        data[key] = (value !== '' && !isNaN(numValue)) ? numValue : value;
    }
    return data;
}

function findMissingKeys(data) {
    return Object.entries(EXPECTED_KEYS)
        .filter(([key]) => data[key] === undefined || data[key] === '')
        .map(([, { label, defaultValue }]) => ({ label, defaultValue }));
}

function buildSettings(data) {
    const markupCBPercent = data.markupCBPercent ?? defaults.markupCBPercent;

    return {
        railWay: {
            name: data.railWayName ?? defaults.railWay.name,
            deliveryTime: data.railWayDeliveryTime ?? defaults.railWay.deliveryTime,
        },
        auto: {
            name: data.autoName ?? defaults.auto.name,
            deliveryTime: data.autoDeliveryTime ?? defaults.auto.deliveryTime,
        },
        air: {
            name: data.airName ?? defaults.air.name,
            deliveryTime: data.airDeliveryTime ?? defaults.air.deliveryTime,
        },
        priceRailwayForKG: data.priceRailwayForKG ?? defaults.priceRailwayForKG,
        priceRailwayForCUB: data.priceRailwayForCUB ?? defaults.priceRailwayForCUB,
        priceAutoForKG: data.priceAutoForKG ?? defaults.priceAutoForKG,
        priceAutoForCUB: data.priceAutoForCUB ?? defaults.priceAutoForCUB,
        priceAirForKG: data.priceAirForKG ?? defaults.priceAirForKG,
        markupCBPercent,
        markupCB: (markupCBPercent / 100) + 1,
        maxWeightForAir: data.maxWeightForAir ?? defaults.maxWeightForAir,
        maxVolumeForAir: data.maxVolumeForAir ?? defaults.maxVolumeForAir,
        defaultMarkupCoefficient: String(data.defaultMarkupCoefficient ?? defaults.defaultMarkupCoefficient),
        alarmWeightTextAir: defaults.alarmWeightTextAir,
        alarmVolumeTextAir: defaults.alarmVolumeTextAir,
    };
}

const useSettings = () => {
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [missingKeys, setMissingKeys] = useState([]);

    const loadSettings = useCallback(async (initial = false) => {
        try {
            if (initial) setIsLoading(true);
            const { data, error } = await supabase
                .from('calculator_settings')
                .select('key, value');

            if (error) throw error;
            if (!data || data.length === 0) throw new Error('Таблица пуста');

            const parsed = parseRows(data);
            const missing = findMissingKeys(parsed);
            setMissingKeys(missing);
            setSettings(buildSettings(parsed));
            setLoadError(false);
        } catch (err) {
            console.error('Ошибка загрузки настроек из Supabase:', err);
            setLoadError(true);
            setSettings(buildSettings({}));
        } finally {
            if (initial) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSettings(true);
    }, [loadSettings]);

    return { settings, isLoading, loadError, missingKeys, refetch: loadSettings };
};

export default useSettings;
