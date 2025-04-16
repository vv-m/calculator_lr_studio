import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';

export const alarmTextAir = "Вес превышен\n (до 50кг)";

// Цены ЖД
const priceRailwayForKG = 2.4;  // USD за кг
const priceRailwayForCUB = 290;  // USD за кг

// Цены Авто
const priceAutoForKG = 5.8;  // USD за кг
const priceAutoForCUB = 440;  // USD за кг

// Цена Авиа
const priceAirForKG = 24;  // USD за кг

// Надбавка на курс ЦБ
const markupCBPercent = 10;  // %
const markupCB = (markupCBPercent / 100) + 1;

// Типы доставки
const railWay = {
    name: "Ж/Д 🚂",
    deliveryTime: "40-60"  // дней
};

const auto = {
    name: "Авто 🚛",
    deliveryTime: "20-40"  // дней
};

const air = {
    name: "Авиа ✈️",
    deliveryTime: "12-17"  // дней
};

// Компонент карточки продукта
const ProductCard = ({ name, deliveryTime, price }) => {
    return (
        <Card className="mb-3">
            <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                    <Card.Title>{name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">Срок доставки: {deliveryTime} дней</Card.Subtitle>
                </div>
                <div>
                    <Card.Text className={`${price ? 'fs-4' : 'fs-6 text-danger'} text-end mb-0`}>
                        {price ? `${price} ₽` : 'Заполните все поля для расчета'}
                    </Card.Text>
                </div>
            </Card.Body>
        </Card>
    );
};

function CalculatorForm() {
    const [weight, setWeight] = useState('');
    const [size1, setSize1] = useState('');
    const [size2, setSize2] = useState('');
    const [size3, setSize3] = useState('');
    const [volume, setVolume] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [calcMode, setCalcMode] = useState('volume'); // dimensions или volume
    const [usdValue, setUsdValue] = useState(0);
    const [rmbValue, setRmbValue] = useState(0);
    const [coast, setCoast] = useState('');
    const [coastOfItemByRUB, setCoastOfItemByRUB] = useState(0);
    const [resultByRailway, setResultByRailway] = useState('');
    const [resultByAuto, setResultByAuto] = useState('');
    const [resultByAir, setResultByAir] = useState('');

    const handleChange = (event, setter) => {
        // Заменяем запятую на точку
        let value = event.target.value.replace(/,/g, '.');

        // Разрешаем цифры и одну точку
        value = value.replace(/[^\d.]/g, '');

        // Проверяем, чтобы не было более одной точки
        const parts = value.split('.');
        if (parts.length > 2) {
            // Если точек больше одной, оставляем только первую
            value = parts[0] + '.' + parts.slice(1).join('');
        }

        // Если строка начинается с точки, добавляем перед ней ноль
        if (value.startsWith('.')) {
            value = '0' + value;
        }

        setter(value);
    };

    // Расчет объема при изменении размеров
    useEffect(() => {
        if (calcMode === 'dimensions' && size1 && size2 && size3) {
            const calculatedVolume = (Number(size1) * Number(size2) * Number(size3) / 1000000).toFixed(6);
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
            setResultByRailway('');
            setResultByAuto('');
            setResultByAir('');
            return;
        }

        let currentCurrencyValue = 0;

        // Устанавливаем курс валюты для расчета стоимости товара
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

        // ======= ЖД =======
        // Расчет по весу
        const coastRailwayKG = Number(weight) * priceRailwayForKG * usdValue * markupCB + itemCostInRub;
        // Расчет по объему
        const coastRailwayCUB = volumeValue * priceRailwayForCUB * usdValue * markupCB + itemCostInRub;
        // Выбираем большее значение
        const coastRailway = Math.max(coastRailwayKG, coastRailwayCUB);

        // ======= АВТО =======
        // Расчет по весу
        const coastAutoKG = Number(weight) * priceAutoForKG * usdValue * markupCB + itemCostInRub;
        // Расчет по объему
        const coastAutoCUB = volumeValue * priceAutoForCUB * usdValue * markupCB + itemCostInRub;
        // Выбираем большее значение
        const coastAuto = Math.max(coastAutoKG, coastAutoCUB);

        // ======= АВИА =======
        // Только по весу
        const coastAir = Number(weight) * priceAirForKG * usdValue * markupCB + itemCostInRub;

        // Устанавливаем результаты
        setResultByRailway(Math.round(coastRailway).toLocaleString('ru-RU'));
        setResultByAuto(Math.round(coastAuto).toLocaleString('ru-RU'));

        // Проверка веса для авиа
        if (Number(weight) > 50) {
            setResultByAir(alarmTextAir);
        } else {
            setResultByAir(Math.round(coastAir).toLocaleString('ru-RU'));
        }
    };

    const clearFields = () => {
        setWeight('');
        setSize1('');
        setSize2('');
        setSize3('');
        setVolume('');
        setCoast('');
        // Не сбрасываем валюту и режим расчета
    };

    // Получение курсов валют
    useEffect(() => {
        fetch('https://www.cbr-xml-daily.ru/daily_utf8.xml')
            .then(response => response.text())
            .then(data => {
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
                        console.log("USD", usd * markupCB);
                    }
                    if (charCode === "CNY") {
                        let rmbValueTMP = valutes[i].getElementsByTagName("Value")[0].textContent;
                        let rmb = parseFloat(rmbValueTMP.replace(',', '.'));
                        setRmbValue(rmb);
                        console.log("CNY", rmb * markupCB);
                    }
                }
            })
            .catch(error => {
                console.error('Ошибка при получении данных:', error);
            });
    }, []);

    // Пересчет при изменении любого параметра
    useEffect(() => {
        calculateResult();
    }, [weight, size1, size2, size3, volume, currency, coast, usdValue, rmbValue, calcMode]);

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
                                    onChange={(e) => handleChange(e, setWeight)}
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
                                            onChange={(e) => handleChange(e, setSize1)}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Размер 2, см</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={size2}
                                            onChange={(e) => handleChange(e, setSize2)}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Размер 3, см</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={size3}
                                            onChange={(e) => handleChange(e, setSize3)}
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
                                        onChange={(e) => handleChange(e, setVolume)}
                                    />
                                </Form.Group>
                            )}

                            {/* Цена товара */}
                            <Form.Group className="mb-3">
                                <Form.Label>Цена товара</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={coast}
                                    onChange={(e) => handleChange(e, setCoast)}
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
                    <ProductCard name={railWay.name} deliveryTime={railWay.deliveryTime} price={resultByRailway} />
                    <ProductCard name={auto.name} deliveryTime={auto.deliveryTime} price={resultByAuto} />
                    <ProductCard name={air.name} deliveryTime={air.deliveryTime} price={resultByAir} />
                </Col>
            </Row>
        </Container>
    );
}

export default CalculatorForm;