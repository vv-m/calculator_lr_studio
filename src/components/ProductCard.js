import React from 'react';
import { Card } from 'react-bootstrap';

/**
 * Компонент карточки продукта, отображающий информацию о типе доставки,
 * сроках, ценах и маржинальности.
 */
const ProductCard = ({ name, deliveryTime, price, sellingPrice, margin }) => {
    return (
        <Card className="mb-3">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <Card.Title>{name}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">Срок доставки: {deliveryTime} дней</Card.Subtitle>
                    </div>
                    <div>
                        {!price ? (
                            <Card.Text className="fs-6 text-danger text-end mb-0">
                                Заполните все поля для расчета
                            </Card.Text>
                        ) : null}
                    </div>
                </div>
                {price ? (
                    <div className="d-flex flex-column">
                        <div className="d-flex justify-content-between">
                            <span>Себестоимость:</span>
                            <span className="fs-5">{price} ₽</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span>Цена продажи:</span>
                            <span className="fs-5 fw-bold">{sellingPrice} ₽</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span>Маржинальность:</span>
                            <span className="fs-5 text-success">{margin} ₽</span>
                        </div>
                    </div>
                ) : null}
            </Card.Body>
        </Card>
    );
};

export default ProductCard;