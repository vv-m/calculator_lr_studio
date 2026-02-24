import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';

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
            <Container className="py-4 text-center">
                <Spinner animation="border" role="status" className="mb-3" />
                <p>Загрузка настроек...</p>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {showError && (
                <Alert variant="danger" dismissible onClose={() => setShowError(false)}>
                    Не удалось загрузить настройки из Supabase. Используются настройки по умолчанию.
                    Обратитесь к администратору.
                </Alert>
            )}

            {showMissingWarning && !showError && (
                <Alert variant="warning" dismissible onClose={() => setShowMissingWarning(false)}>
                    В Supabase отсутствуют следующие параметры (взяты из настроек по умолчанию):
                    <ul className="mb-0 mt-1">
                        {missingKeys.map((item, i) => (
                            <li key={i}>{item.label}: <strong>{item.defaultValue}</strong></li>
                        ))}
                    </ul>
                    Обратитесь к администратору.
                </Alert>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div style={{ width: '100px' }} />
                <h3 className="mb-0 text-center flex-grow-1">Расчет себестоимости товара с доставкой</h3>
                <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowSettings(true)}
                    style={{ width: '100px' }}
                >
                    Настройки
                </Button>
            </div>

            <Row>
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h5>Параметры расчета</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Способ расчета:</Form.Label>
                                <div>
                                    <Form.Check
                                        inline
                                        type="radio"
                                        id="volume-mode"
                                        label="По объему"
                                        name="calcMode"
                                        checked={calcMode === 'volume'}
                                        onChange={() => setCalcMode('volume')}
                                    />
                                    <Form.Check
                                        inline
                                        type="radio"
                                        id="dimensions-mode"
                                        label="По размерам"
                                        name="calcMode"
                                        checked={calcMode === 'dimensions'}
                                        onChange={() => setCalcMode('dimensions')}
                                    />
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Вес, кг</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={weight}
                                    onChange={(e) => handleNumberInputChange(e, setWeight)}
                                />
                            </Form.Group>

                            {calcMode === 'dimensions' ? (
                                <>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Размер 1, см</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={size1}
                                            onChange={(e) => handleNumberInputChange(e, setSize1)}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Размер 2, см</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={size2}
                                            onChange={(e) => handleNumberInputChange(e, setSize2)}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Размер 3, см</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={size3}
                                            onChange={(e) => handleNumberInputChange(e, setSize3)}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Объем, м³</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={volume}
                                            disabled
                                        />
                                    </Form.Group>
                                </>
                            ) : (
                                <Form.Group className="mb-3">
                                    <Form.Label>Объем, м³</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={volume}
                                        onChange={(e) => handleNumberInputChange(e, setVolume)}
                                    />
                                </Form.Group>
                            )}

                            <Form.Group className="mb-3">
                                <Form.Label>Цена товара</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={coast}
                                    onChange={(e) => handleNumberInputChange(e, setCoast)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Коэффициент наценки</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={markupCoefficient}
                                    onChange={(e) => handleNumberInputChange(e, setMarkupCoefficient)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Валюта:</Form.Label>
                                <div>
                                    <Form.Check
                                        inline
                                        type="radio"
                                        id="usd-currency"
                                        label="USD"
                                        name="currency"
                                        checked={currency === 'USD'}
                                        onChange={() => setCurrency('USD')}
                                    />
                                    <Form.Check
                                        inline
                                        type="radio"
                                        id="rmb-currency"
                                        label="RMB"
                                        name="currency"
                                        checked={currency === 'RMB'}
                                        onChange={() => setCurrency('RMB')}
                                    />
                                </div>
                            </Form.Group>

                            <div className="mb-3 text-muted">
                                <small>
                                    Текущий курс USD: {usdValue ? (usdValue * settings.markupCB).toFixed(2) : '...'} ₽ (с учетом наценки {settings.markupCBPercent}%)
                                    <br />
                                    Текущий курс RMB: {rmbValue ? (rmbValue * settings.markupCB).toFixed(2) : '...'} ₽ (с учетом наценки {settings.markupCBPercent}%)
                                </small>
                            </div>

                            <Button
                                variant="outline-secondary"
                                onClick={clearFields}
                                className="w-100"
                            >
                                Очистить поля
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <h5 className="mb-3">Результаты расчета:</h5>
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
                </Col>
            </Row>

            <SettingsPanel
                show={showSettings}
                onClose={() => setShowSettings(false)}
                onSaved={refetch}
            />
        </Container>
    );
}

export default CalculatorForm;
