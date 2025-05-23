# Калькулятор расчета себестоимости товара для компании LR-Studio

Проект представляет собой приложение для расчета себестоимости товара, разработанное специально для компании LR-Studio. Приложение позволяет рассчитывать себестоимость с учетом различных способов доставки, включая железнодорожные, автомобильные и авиаперевозки.

## Технологии

Приложение разработано с использованием следующих технологий:

- **React** - основной фреймворк для разработки пользовательского интерфейса.
- **Material-UI (MUI)** - библиотека компонентов для React, используется для создания дизайна приложения.

## Обновить gh-pages

1. Собрать проект:

```bash 
npm run build
```

2. Коммитим и пушим:

```bash 
git add . && git commit -m "gh-pages has been added" && git push
```

3. Запускаем деплой (запросит 2 раза пароль):

```bash 
npm run deploy
```

## Установка и запуск

Для установки и запуска проекта необходимо выполнить следующие шаги:

1. Клонировать репозиторий проекта на локальную машину: 

```bash 
git clone https://github.com/your-username/calculator_lr_studio.git
```

2. Перейти в директорию проекта:

```bash 
cd calculator_lr_studio
```

3. Установить необходимые зависимости:

```bash 
npm install
```

4. Запустить проект:

```bash 
npm start
```

После выполнения данных шагов, приложение будет доступно по адресу `http://localhost:3000` в вашем браузере.

## Работа с калькулятором

Для расчета себестоимости товара необходимо выбрать тип доставки и ввести стоимость перевозчика.
Параметры и цены доставки можно настроить в файле `calculator_lr_studio/src/components/calculator_form.js`.

---

Надеюсь этот калькулятор будет Вам полезен!

