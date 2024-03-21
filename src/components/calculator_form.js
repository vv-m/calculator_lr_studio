import React, {useState, useEffect} from 'react';
import {
    TextField,
    Box,
    Typography,
    Divider,
    FormControl,
    Button,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import ProductCard from "./card_delivery";

export const alarmTextAir = "Вес превышен\n (до 50кг)"
// Цены ЖД
const priceRailwayForKG = 2.4  // USD за кг
const priceRailwayForCUB = 290  // USD за кг

// Цены Авто
const priceAutoForKG = 5.8  // USD за кг
const priceAutoForCUB = 440  // USD за кг

// Цена Авиа
const priceAirForKG = 24  // USD за кг

// Надбавка на курс ЦБ
let markupCB = 4  // %
markupCB = (markupCB / 100) + 1

//
let railWay = {
    name: "Ж/Д 🚂",
    deliveryTime: "40-60"  // дней
}
let auto = {
    name: "Авто 🚛",
    deliveryTime: "20-40"  // дней
}
let air = {
    name: "Авиа ✈️",
    deliveryTime: "12-17"  // дней
}


function CalculatorForm() {
    const [weight, setWeight] = useState('');
    const [size1, setSize1] = useState('');
    const [size2, setSize2] = useState('');
    const [size3, setSize3] = useState('');
    const [currency, setCurrency] = useState('');
    const [usdValue, setUsdValue] = useState(0);
    const [rmbValue, setRmbValue] = useState(0);
    const [coast, setCoast] = useState('');
    const [coastOfItemByRUB, setCoastOfItemByRUB] = useState(0);
    const [resultByRailway, setResultByRailway] = useState('');
    const [resultByAuto, setResultByAuto] = useState('');
    const [resultByAir, setResultByAir] = useState('');


    const handleChange = (event, setter) => {
        const value = event.target.value.replace(/\D/g, ''); // Удаляем все кроме цифр
        setter(value);
    };

    const calculateResult = () => {
        if (!weight || !size1 || !size2 || !size3 || !coast || !currency) {
            setResultByRailway('');
            setResultByAuto('');
            setResultByAir('');
            return;
        }

        let currentCurrencyValue = 0

        // Устанавливаем курс валюты для расчета стоимости товар
        if (currency === "USD") {
            currentCurrencyValue = usdValue * markupCB
        }

        if (currency === "RMB") {
            currentCurrencyValue = rmbValue * markupCB
        }

        // ======= ТОВАР =======

        // Стоимость товара в рублях
        setCoastOfItemByRUB(Number(coast) * currentCurrencyValue)
        const volume = Number(size1) * Number(size2) * Number(size3) / 1000000
        // Стоимость доставки Авто((цена за куб) + товара в рублях

        // ======= ЖД =======

        // Стоимость доставки Авто(цена за кг) + товара в рублях
        const coastRailwayKG = Number(weight) * priceRailwayForKG * usdValue * markupCB + coastOfItemByRUB
        // Стоимость доставки Авто(цена за куб) + товара в рублях
        const coastRailwayCUB = volume * priceRailwayForCUB * usdValue * markupCB + coastOfItemByRUB
        // Определяем какая стоимость дороже при расчете за кг или при расчете за кубы.
        let coastRailway = 0
        if (coastRailwayKG > coastRailwayCUB) {
            coastRailway = coastRailwayKG
        } else {
            coastRailway = coastRailwayCUB
        }

        // ======= АВТО =======

        // Стоимость доставки ЖД(цена за кг) + товара в рублях
        const coastAutoKG = Number(weight) * priceAutoForKG * usdValue * markupCB + coastOfItemByRUB
        // Стоимость доставки ЖД(цена за куб) + товара в рублях
        const coastAutoCUB = volume * priceAutoForCUB * usdValue * markupCB + coastOfItemByRUB
        // Определяем какая стоимость дороже при расчете за кг или при расчете за кубы.
        let coastAuto = 0
        if (coastAutoKG > coastAutoCUB) {
            coastAuto = coastAutoKG
        } else {
            coastAuto = coastAutoCUB
        }

        // ======= АВИА =======
        // Стоимость доставки Авто(цена за кг) + товара в рублях
        let coastAir = Number(weight) * priceAirForKG * usdValue * markupCB + coastOfItemByRUB


        setResultByRailway(Math.round(coastRailway).toLocaleString('ru-RU'));
        setResultByAuto(Math.round(coastAuto).toLocaleString('ru-RU'));
        if (weight > 50) {
            setResultByAir(alarmTextAir)
        } else {
            setResultByAir(Math.round(coastAir).toLocaleString('ru-RU'));
        }

    };

    const clearFields = () => {
        setWeight(''); // Вес
        setSize1(''); // Размер 1
        setSize2(''); // Размер 2
        setSize3(''); // Размер 3
        setCoast(''); // Цена товара
        setCurrency(''); // Валюта

        // setUsdValue(0);
        // setRmbValue(0);
        // setResultByRailway('');
    };


    useEffect(() => {
        fetch('https://www.cbr-xml-daily.ru/daily_utf8.xml')
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const xml = parser.parseFromString(data, "text/xml");
                // Получаем все элементы Valute.
                const valutes = xml.getElementsByTagName("Valute");
                for (let i = 0; i < valutes.length; i++) {
                    const charCode = valutes[i].getElementsByTagName("CharCode")[0].textContent;
                    if (charCode === "USD") {
                        // Нашли нужный элемент, получаем значение.
                        let usdValueTMP = valutes[i].getElementsByTagName("Value")[0].textContent
                        let usd = parseFloat(usdValueTMP.replace(',', '.'));
                        setUsdValue(usd)
                    }
                    if (charCode === "CNY") {
                        let rmbValueTMP = valutes[i].getElementsByTagName("Value")[0].textContent
                        let rmb = parseFloat(rmbValueTMP.replace(',', '.'));
                        // Нашли нужный элемент, получаем значение.
                        setRmbValue(rmb)
                    }
                }
            })
            .catch(error => {
                console.error('Ошибка при получении данных:', error);
            });
    }, []);

    useEffect(calculateResult, [weight, size1, size2, size3, currency, coast, coastOfItemByRUB, usdValue, rmbValue]);

    return (
        <Box
            sx={{
                // '& .MuiFormControl-root': { m: 1, minWidth: '300px' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Play, sans-serif',
                marginTop: 5,
                minWidth: "250px"
            }}
            noValidate
            autoComplete="off"
        >

            <Box sx={{minWidth: "250px"}}>
                <Typography variant="h5" sx={{fontFamily: 'Play, sans-serif', marginBottom: 3}}>Расчет
                    себестоимости</Typography>
                <FormControl variant="outlined">
                    <TextField sx={{marginBottom: 2}}
                               size="small"
                               label="Вес, кг"
                               variant="outlined"
                               value={weight}
                               onChange={(e) => handleChange(e, setWeight)}
                    />
                    <TextField sx={{marginBottom: 2}}
                               size="small"
                               label="Размер 1, см"
                               variant="outlined"
                               value={size1}
                               onChange={(e) => handleChange(e, setSize1)}
                    />
                    <TextField sx={{marginBottom: 2}}
                               size="small"
                               label="Размер 2, см"
                               variant="outlined"
                               value={size2}
                               onChange={(e) => handleChange(e, setSize2)}
                    />
                    <TextField sx={{marginBottom: 2}}
                               size="small"
                               label="Размер 3, см"
                               variant="outlined"
                               value={size3}
                               onChange={(e) => handleChange(e, setSize3)}
                    />
                    <TextField sx={{marginBottom: 2}}
                               size="small"
                               label="Цена"
                               variant="outlined"
                               value={coast}
                               onChange={(e) => handleChange(e, setCoast)}
                    />
                    <FormControl variant="outlined" sx={{marginBottom: 2}}>
                        <InputLabel size="small" id="currency-selector-label">Валюта</InputLabel>
                        <Select
                            size="small"
                            labelId="currency-selector-label"
                            id="currency-selector"
                            value={currency}
                            label="Валюта"
                            onChange={(e) => setCurrency(e.target.value)}
                        >
                            <MenuItem value="USD">USD</MenuItem>
                            <MenuItem value="RMB">RMB</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="outlined"

                            color="primary"
                            onClick={clearFields}
                            sx={{
                                marginTop: 1,
                                fontFamily: 'Play, sans-serif',
                                width: '363px',
                                height: '56px'
                            }}
                            startIcon={<ClearIcon />}
                    >
                        Очистить
                    </Button>
                    <Divider sx={{width: 'inherit', m: 2}}/>
                    <ProductCard name={railWay.name} deliveryTime={railWay.deliveryTime} price={resultByRailway}/>
                    <ProductCard name={auto.name} deliveryTime={auto.deliveryTime} price={resultByAuto}/>
                    <ProductCard name={air.name} deliveryTime={air.deliveryTime} price={resultByAir}/>

                </FormControl>
            </Box>
        </Box>
    );
}

export default CalculatorForm;
