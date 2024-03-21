// Предполагается, что у вас есть переменная `xmlString`, содержащая XML в виде строки.
const xmlString = `Ваш XML контент`;

// Используем DOMParser для преобразования строки в XML Document.
const parser = new DOMParser();
const xml = parser.parseFromString(xmlString, "text/xml");

// Получаем все элементы Valute.
const valutes = xml.getElementsByTagName("Valute");

// Перебираем все элементы Valute в поисках GBP.
let gbpValue = null;

for (let i = 0; i < valutes.length; i++) {
  const charCode = valutes[i].getElementsByTagName("CharCode")[0].textContent;
  if (charCode === "GBP") {
    // Нашли нужный элемент, получаем значение.
    gbpValue = valutes[i].getElementsByTagName("Value")[0].textContent;
    break;
  }
}

if (gbpValue) {
  console.log(`Значение Фунта стерлингов Соединенного королевства: ${gbpValue}`);
} else {
  console.log("Значение Фунта стерлингов Соединенного королевства не найдено.");
}
