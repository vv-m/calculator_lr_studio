import React from 'react';
import {Card, CardContent, Typography, Grid} from '@mui/material';
import {alarmTextAir} from './calculator_form'

// Определение компонента ProductCard, который принимает props
function ProductCard({name, deliveryTime, price}) {

    let priceToCard = ''
    if (!price) {
        priceToCard = 'Заполните\n все поля'
    } else if (price === alarmTextAir) {
        priceToCard = alarmTextAir
    } else {
        priceToCard = price + " руб."
    }

    return (
        <Card sx={{maxWidth: 600, mb: 2}}>
            <CardContent>
                <Grid container spacing={2}>
                    <Grid item xs={7}>
                        <Typography gutterBottom variant="h5" component="div">
                            {name}
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                            Срок доставки: {deliveryTime} дней.
                        </Typography>
                    </Grid>
                    <Grid item xs={5} display="flex" alignItems="center" justifyContent="flex-end">
                        <Typography variant={!price && price !== alarmTextAir ? "h6" : "body3"}
                                    component="div"
                                    color={!price || price===alarmTextAir ? "red" : "black"}
                                    sx={{
                                        fontSize: price && price !== alarmTextAir ? 'inherit' : '0.75rem',
                                        whiteSpace: 'pre-line',
                                        textAlign: 'center'
                                    }}
                        >
                            {price ? priceToCard : 'Заполните\n все поля'}
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}

// Экспортирование компонента для использования в других частях приложения
export default ProductCard;
