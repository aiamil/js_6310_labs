'use strict'

// ===== ЗАДАНИЕ 1: Базовый класс Vehicle =====
class Vehicle {
    static vehicleCount = 0;//принадлежит классу
    // Создайте базовый класс Vehicle.
    // В конструкторе принимайте и сохраняйте в this свойства:
    // make (марка), model (модель), year (год выпуска).
    constructor(make, model, year) {
        ///////////////
        if (typeof make !== "string" || make === ""){
            throw new Error("неизвестная марка")
        } else {
            this.make = make;   
        };
        //////////////
        if (typeof model  !== "string" || model === ""){
            throw new Error("неизвестная модель")
        } else {
            this.model = model;
        }
        /////////////
        if (typeof year !== "number" || !Number.isInteger(year) || year < 1886 || year > new Date().getFullYear()) {
            throw new Error("неправильный год выпуска")
        } else {
            this._year = year;
        }
        Vehicle.vehicleCount++;
    }

    // Добавьте метод displayInfo(), который выводит в консоль информацию 
    // о транспортном средстве в формате: "Марка: [make], Модель: [model], Год: [year]".
    displayInfo() {
        console.log(`Марка: ${this.make}, модель: ${this.model}, год: ${this._year}`);
    }

    // Добавьте геттер age, который возвращает возраст транспортного средства 
    // (текущий год минус год выпуска). Используйте new Date().getFullYear().
    get age() {
        return new Date().getFullYear() - this._year 
    }
    

    /////// Добавьте сеттер для года выпуска с проверкой: год не может быть больше текущего.
    set year(newYear) {
    const currentYear = new Date().getFullYear();
    if (newYear > currentYear) {
        throw new Error("год выпуска не может быть больше текущего");
    }
    this._year = newYear;
}

    get year() {
        return this._year;
        //возвращает значение из внутреннего свойства _year,где хранится настоящий год выпуска машины.
    }

    // Добавьте статический метод compareAge(vehicle1, vehicle2), 
    // который возвращает разницу в возрасте между двумя транспортными средствами.
    static compareAge(vehicle1, vehicle2) {
        return Math.abs(vehicle1.age - vehicle2.age);

    }
    static getTotalVehicles(){
        return Vehicle.vehicleCount;

    }
}



// ===== ЗАДАНИЕ 2: Класс Car (наследуется от Vehicle) =====
class Car extends Vehicle {
    // Создайте дочерний класс Car, который наследуется от Vehicle.
    // Добавьте новое свойство numDoors (количество дверей).
    constructor(make, model, year, numDoors) {
        
       if (typeof numDoors !== 'number' || isNaN(numDoors) || !Number.isInteger(numDoors) || numDoors < 1) {
            throw new Error("Некорректное кол-во дверей");
        } else {
            super(make, model, year);
        this.numDoors = numDoors;
        }
    }
// Переопределите метод displayInfo() так, чтобы он также выводил количество дверей. 
    // Используйте super.displayInfo() для вызова метода родителя.
    displayInfo() {
        super.displayInfo();
        console.log(`Всего дверей: ${this.numDoors}`);
    } 

    honk() {
        // Добавьте метод honk(), который выводит "Beep beep!".
        console.log("Beep beep!");
    }
} 




// ===== ЗАДАНИЕ 3: Класс ElectricCar (наследуется от Car) =====
class ElectricCar extends Car {
    // Создайте дочерний класс ElectricCar, который наследуется от Car.
    // Добавьте новое свойство batteryCapacity (емкость батареи в кВт·ч).
    constructor(make, model, year, numDoors, batteryCapacity) {
        if (batteryCapacity === undefined){
            throw new Error("Батарея должна быть указана")
        }
        if (typeof batteryCapacity !== 'number' || batteryCapacity < 1) {
            throw new Error("Некорректная емкость батареи");
        }
        super(make, model, year, numDoors);
        this.batteryCapacity = batteryCapacity;
    }
    // Переопределите метод displayInfo() для вывода дополнительной информации о батарее.
    displayInfo() {
        super.displayInfo();
        console.log(`Батарея: ${this.batteryCapacity} кВт·ч`); 
    }
    // Добавьте метод calculateRange(), который рассчитывает примерный запас хода 
    // (предположим, что 1 кВт·ч = 6 км).
    calculateRange() {
        return this.batteryCapacity * 6;
    }
}



// ===== ЗАДАНИЕ 4: Каррирование =====

// Создайте функцию createVehicleFactory, которая возвращает функцию 
// для создания транспортных средств определенного типа (каррирование).
const createVehicleFactory = (vehicleType) => (make, model, year, ...args) => {
    // return {};  Замените {} на варажение
    return new vehicleType(make, model, year, ...args);
};


// Автоматические тесты
function runTests() {
    console.log('Запуск тестов...');
    console.log("=== ЗАДАНИЕ №1 ===");
    // Проверка наследования
    ///1////
    const vehicle_1 = new Vehicle('Toyota', 'Camry', 2015);
    vehicle_1.displayInfo();
    // Получаем возраст машины через геттер
    console.log(`Возраст: ${vehicle_1.age} лет`);

    ///2///
    const vehicle_2 = new Vehicle('Toyota', 'Camry', 2000);
    vehicle_2.displayInfo();
    // Получаем возраст машины через геттер
    console.log(`Возраст: ${vehicle_2.age} лет`);
    console.log(" с помощью сеттреров меняет год у 2 машины ")
    vehicle_2.year = 2010; 
    // Проверяем изменения
    console.log(`Новый год выпуска: ${vehicle_2.year}`); 

    console.log(`Новый возраст машины: ${vehicle_2.age} лет`);
    vehicle_2.displayInfo();

    ///разница в возрастов
    console.log(`разница в возрасте составляет:${Vehicle.compareAge(vehicle_1,vehicle_2)}`);

   ///проверка на количество автомобилей 
   console.log(`количество авто:${Vehicle.getTotalVehicles()}`);

   console.log(`проверка агрументов Vehicle`);
    // проверка ошибок
        try{
            new Vehicle(123, 'Camry', 2015);
            console.log('ошибка при проверке марки')
            // блок catch - "если произошла ошибка, выполни этот код"
    } catch(e) {
            console.log('Правильно обработана ошибка:', e.message)
        }

        try{
            new Vehicle("", 'Camry', 2015);
            console.log('ошибка при проверке марки')

    } catch(e) {
            console.log('Правильно обработана ошибка:', e.message)
        }

        try{
            new Vehicle("Toyota", '', 2015);
            console.log('ошибка при проверке модели')

    } catch(e) {
            console.log('Правильно обработана ошибка:', e.message)
        }

// ДОБАВЛЕНО: Тесты для граничных случаев года выпуска Vehicle
    console.log("\n--- Тесты граничных случаев года выпуска Car ---");
    // Тест для минимально допустимого года (1886) + 1 МАШИНА
        try {
            const vehicle_3 = new Vehicle('Toyota', 'Camry', 1886);
            console.log('✓ 1886 год принят корректно');
            
    } catch(e) {
            console.log('✗ Ошибка для 1886 года:', e.message);
        }

// Тест для года меньше минимального (1885) - должен вызвать ошибку
        try {
            new Vehicle('Toyota', 'Camry', 1885);
            console.log(' Ошибка: 1885 год не должен быть допустим');
    } catch(e) {
            console.log('Правильно обработана ошибка для 1885 года:', e.message);
        }

// Тест для текущего года - должен работать + 1 МАШИНА
        try {
            const currentYearVehicle = new Vehicle('Toyota', 'Camry', new Date().getFullYear());
            console.log('✓ Текущий год принят корректно');
            currentYearVehicle.displayInfo();
    } catch(e) {
            console.log('✗ Ошибка для текущего года:', e.message);
        }

// Тест для года больше текущего - должен вызвать ошибку
        try {
            new Vehicle('Toyota', 'Camry', new Date().getFullYear() + 1);
            console.log('✗ Ошибка: будущий год не должен быть допустим');
    } catch(e) {
            console.log('✓ Правильно обработана ошибка для будущего года:', e.message);
        }

        try{
            new Vehicle("Toyota", 1, "2015");
            console.log('ошибка при проверке года')

    } catch(e) {
            console.log('Правильно обработана ошибка:', e.message)
        }

        try{
            new Vehicle("Toyota", 1,);
            console.log('ошибка при проверке года')

    } catch(e) {
            console.log('Правильно обработана ошибка:', e.message)
        }
        try{
            new Vehicle("Toyota", 1,120.30);
            console.log('ошибка при проверке года')

    } catch(e) {
            console.log('Правильно обработана ошибка:', e.message)
        }
        try{
            new Vehicle("Toyota", 1,2027);
            console.log('ошибка при проверке года')

    } catch(e) {
            console.log('Правильно обработана ошибка:', e.message)
        }
    console.assert(vehicle_1.make === "Toyota","не совпадает марка первоймашины");
    console.assert(vehicle_1.model === "Camry" ,"не сопадает модель ");
    console.assert(vehicle_1.year === 2015, "не совпадает код ");
    console.assert(vehicle_1.age === new Date().getFullYear() - 2015,"возраст ");
    console.assert(vehicle_2.year === 2010, "не сопадает год, если изменить");
    
    console.assert(Vehicle.getTotalVehicles() === 4, "не совпадает количество траспортов");
    console.assert(Vehicle.compareAge(vehicle_1,vehicle_2) === vehicle_1.year -vehicle_2.year, "не совпадает разница между транспортами");


    console.log();
    console.log("=== ЗАДАНИЕ 2: Класс Car ===");
   // ===== ЗАДАНИЕ 2: Класс Car (наследуется от Vehicle) =====проверка ошибок 

   const car = new Car('Honda', 'Civic', 2018, 4);
    car.displayInfo();
    console.log(`Возраст: ${vehicle_1.age} лет`);
   car.honk();
   // проверка ошибок
        try { 
        new Car(1, 'Civic', 2018, 4);
        console.log('ошибка при проверке марки');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Car("", 'Civic', 2018, 4);
        console.log('ошибка при проверке марки');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Car('Honda', 1, 2018, 4);
        console.log('ошибка при проверке модели');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Car('Honda', "", 2018, 4);
        console.log('ошибка при проверке модели');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Car('Honda', 'Civic', "2018", 4);
        console.log('ошибка припроверке года');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Car('Honda', 'Civic', 2018.5, 4);
        console.log('ошибка при проверке года');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Car('Honda', 'Civic', 5035, 4);
        console.log('ошибка при проверке года');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Car('Honda', 'Civic', 1, 4);
        console.log('ошибка при проверке года');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Car('Honda', 'Civic', 2018, "4");
        console.log('ошибка при проверке количества дверей');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Car('Honda', 'Civic', 2018, 4.5);
        console.log('ошибка при проверке количества дверей');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }
    try { 
        new Car('Honda', 'Civic', 2018, 0);
        console.log('ошибка при проверке количества дверей');
    } catch (e) { 
        console.log('Правильно обработана ошибка:', e.message);
    }


    // ДОБАВЛЕНО: Тесты для граничных случаев года выпуска Car
    console.log("\n--- Тесты граничных случаев года выпуска Car ---");
    
    // Используем существующий объект car
    try {
        car.year = 1886; // Наследует сеттер от Vehicle
        console.log('✓ Car принимает минимальный год 1886 через сеттер');
        car.year = 2018; // Возвращаем обратно
    } catch(e) {
        console.log('Ошибка при установке минимального года в Car:', e.message);
    }

    try {
        car.year = new Date().getFullYear();
        console.log(`✓ Car принимает текущий год ${new Date().getFullYear()} через сеттер`);
        car.year = 2018; // Возвращаем обратно
    } catch(e) {
        console.log('Ошибка при установке текущего года в Car:', e.message);
    }

    car.honk();
    console.assert(car.make === "Honda","Марка совпадает марка машины  car");
    console.assert(car.model === "Civic", "Модель машины не совпадает car");
    console.assert(car.year === 2018,"Год машины не совпадает car");
    console.assert(car.numDoors === 4, "Количество дверей не совпадает");
    console.assert(car.age === new Date().getFullYear() - 2018, "возраст машины не совпадает car");
    console.assert(Vehicle.getTotalVehicles() === 5, "Количество машин на car не правильное");
    car.year = 2017;
    car.displayInfo();
    console.assert(car.year === 2017,"Год машины car после изменний не правильное");
    console.log(`Общее количество созданных транспортных средств: ${Vehicle.getTotalVehicles()} шт`);




    console.log();
    console.log("=== ЗАДАНИЕ 3: Класс ElectricCar ===");
    const electricCar = new ElectricCar('Tesla', 'Model 3', 2020, 4, 75);
    electricCar.displayInfo();
    console.log(`Запас хода: ${electricCar.calculateRange()} км`);
    // проверка ошибок
        try { 
        new ElectricCar(1, 'Model 3', 2020, 4, 75);
        console.log("ошибка ElectricCar");
    } catch (e) { 
        console.log("Правильно обработана ошибка:", e.message);
    }

    try { 
        new ElectricCar("", 'Model 3', 2020, 4, 75);
        console.log("ошибка ElectricCar");
    } catch (e) { 
        console.log("Правильно обработана ошибка:", e.message);
    }

    try {
        new ElectricCar('Tesla', 1, 2020, 4, 75);
        console.log("ошибка ElectricCar");
    } catch (e) {
        console.log("Правильно обработана ошибка:", e.message);
    }

    try {
        new ElectricCar('Tesla', "", 2020, 4, 75);
        console.log("ошибка ElectricCar");
    } catch (e) {
        console.log("Правильно обработана ошибка:", e.message);
    }

    try {
        new ElectricCar('Tesla', 'Model 3', "", 4, 75);
        console.log("ошибка ElectricCar");
    } catch (e) {
        console.log("Правильно обработана ошибка:", e.message);
    }

    try {
        new ElectricCar('Tesla', 'Model 3', 2040, 4, 75);
        console.log("ошибка ElectricCar");
    } catch (e) {
        console.log("Правильно обработана ошибка:", e.message);
    }

    try {
        new ElectricCar('Tesla','Model 3', 2020.55, 4, 75);
        console.log("ошибка ElectricCar");
    } catch (e) {
        console.log("Правильно обработана ошибка:", e.message);
    }

    try {
        new ElectricCar('Tesla','Model 3', 2020, "", 75);
        console.log("ошибка ElectricCar");
    } catch (e) {
        console.log("Правильно обработана ошибка:", e.message);
    }

    try {
        new ElectricCar('Tesla','Model 3', 2020.55, "4", 75);
        console.log("ошибка ElectricCar");
    } catch (e) {
        console.log("Правильно обработана ошибка:", e.message);
    }


    try {
        new ElectricCar('Tesla','Model 3', 2020, 0, 75);
        console.log("ошибка ElectricCar");
    } catch (e) {
        console.log("Правильно обработана ошибка:", e.message);
    }

    try {
        new ElectricCar('Tesla','Model 3', 2020, 4,"");
        console.log("ошибка ElectricCar");
    } catch (e) {
        console.log("Правильно обработана ошибка:", e.message);
    }
    try {
        new ElectricCar('Tesla','Model 3', 2020, 4, "75");
        console.log("ошибка ElectricCar");
    } catch (e) {
        console.log("Правильно обработана ошибка:", e.message);
    }
    try {
        new ElectricCar('Tesla','Model 3', 2020, 4, 0);
        console.log("ошибка ElectricCar");
    } catch (e) {
        console.log("Правильно обработана ошибка:", e.message);
    }

    try {
        new ElectricCar('Tesla','Model 3', 2020, 4);
        console.log("ошибка ElectricCar");
    } catch (e) {
        console.log("Правильно обработана ошибка:", e.message);
    }


 // ДОБАВЛЕНО: Тесты для граничных случаев года выпуска ElectricCar
    console.log("\n--- Тесты граничных случаев года выпуска ElectricCar ---");
    
    // Используем существующий объект electricCar
    try {
        electricCar.year = 1886;
        console.log('✓ ElectricCar принимает минимальный год 1886 через сеттер');
        electricCar.year = 2020; // Возвращаем обратно
    } catch(e) {
        console.log('Ошибка при установке минимального года в ElectricCar:', e.message);
    }

    try {
        electricCar.year = currentYear;
        console.log(`✓ ElectricCar принимает текущий год ${currentYear} через сеттер`);
        electricCar.year = 2020; // Возвращаем обратно
    } catch(e) {
        console.log('Ошибка при установке текущего года в ElectricCar:', e.message);
    }

    console.assert(`Общее количество созданных транспортных после 3 задания: ${Vehicle.getTotalVehicles()} шт`);
    console.assert(electricCar.make === "Tesla", "не совпадает марка electricCar");
    console.assert(electricCar.model === "Model 3","не совпадает модель electricCar");
    console.assert(electricCar.year === 2020, " не совпадает год electricCar");
    console.assert(electricCar.numDoors === 4, "не совпадает количество дверей electricCar");
    console.assert(electricCar.batteryCapacity === 75, "не совпадает емкость батареи electricCar");
    console.assert(electricCar.age === (new Date().getFullYear() - electricCar.year), "не совпадает возраст electricCar");
    console.assert(electricCar.calculateRange() === electricCar.batteryCapacity *6,"не совпадает запас хода electricCar");
    console.assert(Vehicle.getTotalVehicles() === 6, 'не совпадает кол-во тр.средства');

    electricCar.year = 2010;
    electricCar.displayInfo();
    console.assert(electricCar.year === 2010, 'не совпадает год');

    console.log();
    console.log("=== ЗАДАНИЕ 4: Каррирование ===");
    
    // Проверка возраста
    const testVehicle = new Vehicle('Test', 'Model', 2010);
    console.assert(testVehicle.age === (new Date().getFullYear() - 2010), 'Тест возраста провален');
    // проверка каррирования
    // car2
    const createCarFactory_1 = createVehicleFactory(Vehicle);
    const myNewCar_1 = createCarFactory_1('BMW', 'X5', 2022);
    console.log('Создан новый автомобиль:');
    myNewCar_1.displayInfo();
    // car2
    const createCarFactory_2 = createVehicleFactory(Car);
    const myNewCar_2 = createCarFactory_2('BMW', 'X5', 2022, 4);
    console.log('Создан новый автомобиль:');
    myNewCar_2.displayInfo();
     // car3
    const createCarFactory_3 = createVehicleFactory(ElectricCar);
    const myNewCar_3 = createCarFactory_3('BMW', 'X5', 2022, 4, 60);
    console.log('Создан новый автомобиль:');
    myNewCar_3.displayInfo();

    
    
    console.log('Всего создано транспортных средств:', Vehicle.getTotalVehicles());
    
    console.log('Все тесты пройдены! ✅');
}

runTests();