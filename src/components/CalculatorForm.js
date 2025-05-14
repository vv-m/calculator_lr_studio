import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';

// Компоненты
import ProductCard from './ProductCard';

// Хуки
import useExchangeRates from '../hooks/useExchangeRates';

// Утилиты
import {
    calculateRailwayDelivery,
    calculateAutoDelivery,
    calculateAirDelivery,
    calculateSellingPrice,
    calculateMargin,
    formatNumber
} from '../utils/calculationUtils';
import { handleNumberInputChange, calculateVolume } from '../utils/inputHelpers';

// Константы
import {
    railWay,
    auto,
    air,
    markupCB,
    markupCBPercent,
    defaultMarkupCoefficient
} from '../constants';

function CalculatorForm() {
    // Состояние полей ввода
    const [weight, setWeight] = useState('');
    const [size1, setSize1] = useState('');
    const [size2, setSize2] = useState('');
    const [size3, setSize3] = useState('');
    const [volume, setVolume] = useState('');
    const [coast, setCoast] = useState('');
    const [markupCoefficient, setMarkupCoefficient] = useState(defaultMarkupCoefficient);

    // Режимы расчета и валюты
    const [currency, setCurrency] = useState('USD');
    const [calcMode, setCalcMode] = useState('volume'); // dimensions или volume

    // Стоимость товара в рублях
    const [coastOfItemByRUB, setCoastOfItemByRUB] = useState(0);

    // Результаты расчетов для ЖД
    const [resultByRailway, setResultByRailway] = useState('');
    const [sellingPriceRailway, setSellingPriceRailway] = useState('');
    const [marginRailway, setMarginRailway] = useState('');

    // Результаты расчетов для Авто
    const [resultByAuto, setResultByAuto] = useState('');
    const [sellingPriceAuto, setSellingPriceAuto] = useState('');
    const [marginAuto, setMarginAuto] = useState('');

    // Результаты расчетов для Авиа
    const [resultByAir, setResultByAir] = useState('');
    const [sellingPriceAir, setSellingPriceAir] = useState('');
    const [marginAir, setMarginAir] = useState('');

    // Получение курсов валют
    const { usdValue, rmbValue } = useExchangeRates();

    // Расчет объема при изменении размеров
    useEffect(() => {
        if (calcMode === 'dimensions' && size1 && size2 && size3) {
            const calculatedVolume = calculateVolume(size1, size2, size3);
            setVolume(calculatedVolume);
        }
    }, [size1, size2, size3, calcMode]);

    // Переключение режима расчета
    useEffect(() => {
        if (calcMode === 'dimensions') {
            setVolume(''); // Очищаем поле объема при переключении на размеры
        } else {
            setSize1(''); // Очищаем поля размеров при переключении на объем
            setSize2('');
            setSize3('');
        }
    }, [calcMode]);

    const calculateResult = () => {
        // Проверка заполнения нужных полей в зависимости от режима
        if (!weight || !coast ||
            (calcMode === 'dimensions' && (!size1 || !size2 || !size3)) ||
            (calcMode === 'volume' && !volume)) {
            // Очищаем все результаты
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

        // Определяем текущий курс валюты для расчета
        let currentCurrencyValue = 0;
        if (currency === "USD") {
            currentCurrencyValue = usdValue * markupCB;
        } else if (currency === "RMB") {
            currentCurrencyValue = rmbValue * markupCB;
        }

        // Стоимость товара в рублях
        const itemCostInRub = Number(coast) * currentCurrencyValue;
        setCoastOfItemByRUB(itemCostInRub);

        // Объем - или вычисляем из размеров, или берем прямо из поля объема
        const volumeValue = calcMode === 'dimensions'
            ? Number(size1) * Number(size2) * Number(size3) / 1000000
            : Number(volume);

        // Коэффициент наценки
        const markup = Number(markupCoefficient);

        // ======= Расчет для ЖД =======
        const coastRailway = calculateRailwayDelivery(
            Number(weight),
            volumeValue,
            usdValue,
            markupCB,
            itemCostInRub
        );

        // Расчет цены продажи и маржинальности для ЖД
        const sellPriceRailway = calculateSellingPrice(coastRailway, markup);
        const marginRailwayValue = calculateMargin(sellPriceRailway, coastRailway);

        // Устанавливаем результаты для ЖД
        setResultByRailway(formatNumber(coastRailway));
        setSellingPriceRailway(formatNumber(sellPriceRailway));
        setMarginRailway(marginRailwayValue);

        // ======= Расчет для Авто =======
        const coastAuto = calculateAutoDelivery(
            Number(weight),
            volumeValue,
            usdValue,
            markupCB,
            itemCostInRub
        );

        // Расчет цены продажи и маржинальности для Авто
        const sellPriceAuto = calculateSellingPrice(coastAuto, markup);
        const marginAutoValue = calculateMargin(sellPriceAuto, coastAuto);

        // Устанавливаем результаты для Авто
        setResultByAuto(formatNumber(coastAuto));
        setSellingPriceAuto(formatNumber(sellPriceAuto));
        setMarginAuto(marginAutoValue);

        // ======= Расчет для Авиа с проверкой ограничений =======
        const airResult = calculateAirDelivery(
            Number(weight),
            volumeValue,
            usdValue,
            markupCB,
            itemCostInRub
        );

        if (airResult.hasLimitation) {
            // Если есть ограничения, показываем сообщение
            setResultByAir(airResult.message);
            setSellingPriceAir('');
            setMarginAir('');
        } else {
            // Расчет цены продажи и маржинальности для Авиа
            const sellPriceAir = calculateSellingPrice(airResult.cost, markup);
            const marginAirValue = calculateMargin(sellPriceAir, airResult.cost);

            // Устанавливаем результаты для Авиа
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
        // Не сбрасываем валюту, режим расчета и коэффициент наценки
    };

    // Пересчет при изменении любого параметра
    useEffect(() => {
        calculateResult();
    }, [weight, size1, size2, size3, volume, currency, coast, usdValue, rmbValue, calcMode, markupCoefficient]);

    // Установка заголовка страницы
    useEffect(() => {
        document.title = 'Калькулятор себестоимости товара с учетом доставки.';
    }, []);

    return (
        <Container className="py-4">
            <h3 className="mb-4 text-center">Расчет себестоимости товара с доставкой</h3>

            <Row>
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h5>Параметры расчета</h5>
                        </Card.Header>
                        <Card.Body>
                            {/* Переключатель режима расчета */}
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

                            {/* Поле веса */}
                            <Form.Group className="mb-3">
                                <Form.Label>Вес, кг</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={weight}
                                    onChange={(e) => handleNumberInputChange(e, setWeight)}
                                />
                            </Form.Group>

                            {/* Поля размеров или объема в зависимости от режима */}
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

                            {/* Цена товара */}
                            <Form.Group className="mb-3">
                                <Form.Label>Цена товара</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={coast}
                                    onChange={(e) => handleNumberInputChange(e, setCoast)}
                                />
                            </Form.Group>

                            {/* Коэффициент наценки */}
                            <Form.Group className="mb-3">
                                <Form.Label>Коэффициент наценки</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={markupCoefficient}
                                    onChange={(e) => handleNumberInputChange(e, setMarkupCoefficient)}
                                />
                            </Form.Group>

                            {/* Переключатель валюты */}
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

                            {/* Курсы валют (информационно) */}
                            <div className="mb-3 text-muted">
                                <small>
                                    Текущий курс USD: {usdValue ? (usdValue * markupCB).toFixed(2) : '...'} ₽ (с учетом наценки {markupCBPercent}%)
                                    <br />
                                    Текущий курс RMB: {rmbValue ? (rmbValue * markupCB).toFixed(2) : '...'} ₽ (с учетом наценки {markupCBPercent}%)
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
                        name={railWay.name}
                        deliveryTime={railWay.deliveryTime}
                        price={resultByRailway}
                        sellingPrice={sellingPriceRailway}
                        margin={marginRailway}
                    />
                    <ProductCard
                        name={auto.name}
                        deliveryTime={auto.deliveryTime}
                        price={resultByAuto}
                        sellingPrice={sellingPriceAuto}
                        margin={marginAuto}
                    />
                    <ProductCard
                        name={air.name}
                        deliveryTime={air.deliveryTime}
                        price={resultByAir}
                        sellingPrice={sellingPriceAir}
                        margin={marginAir}
                    />
                </Col>
            </Row>
        </Container>
    );
}

export default CalculatorForm;