import React from 'react';

const ProductCard = ({ name, deliveryTime, price, sellingPrice, taxDeduction, managerFee, vat, margin }) => {
    return (
        <div className="mb-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h5 className="text-lg font-semibold">{name}</h5>
                    <p className="text-sm text-gray-500">Срок доставки: {deliveryTime} дней</p>
                </div>
                {!price && (
                    <p className="text-sm text-red-400 text-right">
                        Заполните все поля для расчета
                    </p>
                )}
            </div>
            {price && (
                <div className="space-y-1 mt-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Себестоимость:</span>
                        <span className="text-lg">{price} ₽</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Минимальная цена продажи:</span>
                        <span className="text-lg font-bold">{sellingPrice} ₽</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Налоговые банковские вычеты (10%):</span>
                        <span className="text-lg text-red-500">-{taxDeduction} ₽</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Процент менеджера (6%):</span>
                        <span className="text-lg text-red-500">-{managerFee} ₽</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">НДС (5%):</span>
                        <span className="text-lg text-red-500">-{vat} ₽</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Маржинальность:</span>
                        <span className="text-lg text-emerald-600 font-medium">{margin} ₽</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductCard;
