class Task {
    constructor(id, text, priority = 'medium', timeLimitHours = 1) {
        this.id = id;
        this.text = text;
        this.priority = priority;
        this.completed = false;
        this.createdAt = new Date();
        this.timeLimitHours = parseFloat(timeLimitHours); //обрезает лишние если польз ввел, ост только числа, парсе флот находит точку, т е десятичные наши числа и округляет, обрезает их, с плавающей точкой
        this.deadLine = new Date(this.createdAt.getTime() + (this.timeLimitHours * 60 * 60 * 1000)); //тайм лимит аур в часах, а нам надо в милисекундах, поэтому в часе 60 мин, умнож на 60, в минуте 60 сек, умн на 60, и в сек 1000 мили секунд, умн на 1000
        this.timeLeft = Math.ceil((this.deadLine - new Date()) / (1000 * 60)); //- нью дейт потому что из дедлайна вычитаем текущее время чтобы получить сколько осталось от сейчас, 1000 * 60, получаем мили секунды, матх сейл округляем вверх - перевод потолок, матх флор, округ вниз, пол
        this.isOverdue = false; //is овэр дью - просрочено ли
        this.isEditing = false;
        this.updateTime(); //метод
    }

    toggleComplete() {
        this.completed = !this.completed; //было тру - стало фолс, было фолс - стало тру, завершена задача или нет
        if (this.completed) {
            this.isOverdue = false;
        }

    }

    updateText() {
        this.text = newText;
    }

    updatePriority() {
        this.priority = newPriority;
    }

    updateTime() {
        const now = new Date();
        this.timeLeft = Math.ceil((this.deadLine - now) / (1000 * 60)) //получаем минуты оставшиейся, чтобы время обновлялось
        this.isOverdue = this.timeLeft < 0 && !this.completed; //&& - и 
        // if (this.isOverdue) {
        //     this.classList.append('overdue');//добавляем новый класс через класс лист, класс лист, это все классы, аппенд - добавление нового класса
        // } не правильно, ушли в рендер 0

        if (this.timeLeft < 60 && !this.completed) {
            this.priority = '1high'
        }

        return this.timeLeft; //функция возвращает с чем мы работаем, зис тайм лефт 

    }
}

class TaskManager { //список задач
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all'; //фильтры 
        this.nextID = 1;
        this.init() //это метод в конструкторе
    }

    init() { //запускает еще 3 фун внутри себя, локал, рендер (отрисовка страницы, симпл пейдж апликейшен, кто работает на одной странице, чтобы отрисовывать каждый раз новое на экран)
        this.loadFromLocalStorage(); //загрузка из локал сторадж - локальное хранилище, сбор данных чисто для себя, сесион сторадж хранилище, на один раз. локал сторадж - хранится. типо как куки, но куки собирают инфу, а локал чисто на фронтенде сервер не может взаимод с этими данными
        this.bindEvents(); //bind - привязать привязка событий
        this.startTimer();
        this.render();
        //alt и выделенная строка стрелки вверх вниз перетаскивать быстро 
    }

    startTimer() {
        setInterval(() => { //принимает 2 параметра, функцию и что-то что еще будет делать. первый параметр принимает наши зизы, второй время, 60 000 - 1 минута
            this.updateAllTasksTime();
            this.render();
        }, 60000)
    }

    updateAllTasksTime() { //метод
        this.tasks.forEach(task => task.updateTime());
        this.saveToLocalStorage();
    }

    bindEvents() { //подвязывает события bind - перевод связывать 
        document.getElementById('addTask').addEventListener('click', () => this.addTask());
        this.addTask()
        document.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', (e) => { //e исп для еррора или евента сокращения
            this.setFilter(e.target.dataset.filter); //дата сет - это набор дата фильтр из эчтмл, е таргет-целевой объект, на кнопку кот нам нужна, из целевого события мы получаем значение из кнопки и сет фильр уст с нужным нам фильтром
            this.updateFilterButtons(e.target);
        }));
    }

    toggleTaskComplete(taskId) { //переключение задачи по айди состояния выполнения 
        const task = this.tasks.find(task => task.id === taskId);// ищем задачу в массиве по айди
        if (task) {
            task.toggleComplete();
            this.saveToLocalStorage();
            this.render;
        }
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const prioritySelect = document.getElementById('prioritySelect');
        const timeInput = document.getElementById('taskTime');

        const text = taskInput.value.trim(); //trim убирает лишние пробелы в начале и в конце
        if (text === '') {
            return;
        }

        const timeLimit = parseFloat(timeInput.value);

        const task = new Task(this.nextID++, text, prioritySelect.value, timeLimit); //когда новая задача уже добавится сработает ++, потому что он раб в конце, в моменте для первой задачи он равен 1
        this.tasks.push(task); //доббавл в массив



        taskInput.value = '';//обязательно чтоб поле очистилось, а не висело сообщение кот ввел пользователь 
        timeInput.value = '1';//обнулялся лимит после добавления новой задачи для новой
        //css классы не могут начинаться с цифр
        this.saveToLocalStorage();
        this.render();
    }

    sortTasks() {
        this.tasks.sort((a, b) => a.priority[0] - b.priority[0]); //???
    }

    editTask(taskID) {
        const task = this.tasks.find(task => task.id === taskID);
        if (task && !task.completed) {
            this.tasks.forEach(t => t.isEditing = false);
            task.isEditing = true;
            this.render();
        }
    }

    saveTaskText(taskID) {
        const task = this.tasks.find(task => task.id === taskID); //const не меняется лет меняется
        if (task) {
            const text = document.querySelector('.edit-input').value.trim(); 
            if (text === ''){
                alert('Введите текст');
                return;
            }

            task.text = text;
            task.isEditing = false;
            this.saveToLocalStorage();
            this.render();
        }
    }

    cancelEditing(taskID) { //кэнцел
        const task = this.tasks.find(task => task.id === taskID);
        if (task) {
            task.isEditing = false;
            this.render();
        }
    }


    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);//фильтр мы хотим оставить только те задачи кот соотв условю, айди не равен переданному нами айди, все останутся, а наш переданный удалится
        this.saveToLocalStorage();
        this.render();
    }
    render() {
        this.sortTasks();
        const taskList = document.getElementById('taskList');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<p class="no-tasks">Задачи не найдены</p>'
        } else {
            taskList.innerHTML = filteredTasks.map(task => task.isEditing && !task.completed ? `
                <div class='task-item  edit ${task.priority.slice(1)} ${task.isOverdue ? 'overdue' : ''}'>
                <input class='edit-input' type="text" value="${task.text}">
                <div>
                <button class='save-edit-btn' onclick='taskManager.saveTaskText(${task.id})'> 
                   Сохранить изм
                   </button>
                   <button class='cancel-edit-btn' onclick='taskManager.cancelEditing(${task.id})'> 
                   Галя, у нас отмена
                   </button>
                   </div>
                </div>
                
                ` : `
            <div class='task-item ${task.completed ? 'completed' : ''} ${task.priority.slice(1)} ${task.isOverdue ? 'overdue' : ''}'>
            <input
               type="checkbox"
               class"task-checkbox"
               ${task.completed ? "checked" : ""}
               onChange = taskManager.toggleTaskComplete(${task.id})
               >
               <span class="task-text">${task.text}</span>
               <span class="task-priority">${this.getPriorityText(task.priority)}</span>
               <span class="task-timeleft">${task.createdAt.getDate()}/${task.createdAt.getMonth() < 10 ? '0' + (task.createdAt.getMonth() + 1) : task.createdAt.getMonth() + 1}   
               ${task.createdAt.getHours()}:${task.createdAt.getMinutes() < 10 ? '0' + task.createdAt.getMinutes() : task.createdAt.getMinutes()} </span>
               <span class='task-timeleft'>${task.timeLeft}</span>
               <div class="task-actions"> 
                <img src='images/pen3.png' width='30' class='edit-btn' onclick='taskManager.editTask(${task.id})'> 
    
                   <button class='delete-btn' onclick='taskManager.deleteTask(${task.id})'> 
                   Удалить
                   </button>
               </div>

            </div>
        `).join('');
            //this.tasks.map(task => `<div>${task.text}</div>`).join('');//для каждого массива выполняет опред действия, у нас в html добавляет новые див рез-татом функции он выдает строку мап потом джойн присоединяем и получается норм массив, онклик - это атрибут 
            //в строке с полуением миесяца берем в скобки потому что месяц получается с нуля, и нужно сначала выполнить +1, а потом проверить и добавить 0, чтобы шло с 1го мес
            //берем объект таскс к нему применяет креайтед эт, туда попадает дата, и поэтому делаем терн оператор
            //логика названия css классов - все маленькмими буквами
        }




        this.updateStats();// метод - это функция, посколько это функция не забываем про круглые скобки
        this.updateAllTasksTime();
    }

    saveToLocalStorage() { //живет в самом браузере, похож на мап с массивами, всегда от нас ожидает строки, поэтому исп json - он делает из всего строки
        localStorage.setItem('tasks', JSON.stringify(this.tasks)); //по этому ключу загоняли задачи в хранилище . создаем джейсон чтобы массив передать в локал ст строкой
        localStorage.setItem('nextID', this.nextID.toString()); //айди это цифры, их надо передать строкой, поэтому ту стринг все() 
    }
    loadFromLocalStorage() {
        const savedTasks = localStorage.getItem('tasks'); //получаем обратно джейсон строку
        const savedNextID = localStorage.getItem('nextID');// и айди
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks).map(taskData => {
                const task = new Task(taskData.id, taskData.text, taskData.priority, taskData.timeLimitHours)
                task.completed = taskData.completed;
                task.createdAt = new Date(taskData.createdAt);
                task.deadLine = new Date(taskData.deadLine);
                // task.timeLeft = taskData.timeLeft;
                task.updateTime();
                return task;
            }); //парсим и получаем из джейсона массив обратно 
        }
        if (savedNextID) {
            this.nextID = +savedNextID; //бинарный - это обычный плюс, кот складывает, а унарный + вместо Number - это оболочка потом тоже саве и т д , поэтому просто +вплотную к чему-то приписанный делает из строки число, если к букве "а" то будет none "4"+"2"=42 +"4"++"2"=6, локал сторадже понимает только строки, поэтому мы делаем чисто 
        }
    }

    setFilter(filter) { //отрисовываем задачи сейчас стоит все current filter = all, чтобы были активные и выполненные отрисовывались 
        this.currentFilter = filter;
        this.render()
    }

    updateFilterButtons(activeButton) { //это мы обновили кнопку 
        document.querySelectorAll('.filter-btn').forEach(btn => { //в фор ич пишем название перменной любое какое хотим
            btn.classList.remove('active'); //classList список всех классов, коллекция, className (?) по классу к активе без точки
        });
        activeButton.classList.add('active');//class list берет коллекцию всего у чего есть класс . add - это метод 

        //происходит инкапсуляция потому что все задачи прописаны классами. сесион строрадж если мы не хотим чтоб сохранялись результаты, локал сохраняет. реактивность - при каждом изменении отрисовка новых данных       
        //+'123fg' и parseInt '123df1223'отличаются что в первом будет нот а намбер, а во втором цифры до первой буквы
    }
    getFilteredTasks() {
        switch (this.currentFilter) { //вместо if else или тернарного оператора исп switch case . дефолт здесь вместо элс
            case 'pending':
                return this.tasks.filter(task => !task.completed); //return работает как break брейк и сработает без него, а так он был бы нужен 
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'overdue':
                return this.tasks.filter(task => task.isOverdue);
            default:
                return this.tasks;
        }
    }

    getStats() { //получить данные
        const total = this.tasks.length; //общее кол-во задач
        const completed = this.tasks.filter(task => task.completed).length; //в результате работы фильтра получили массив готовый с нужными нам задачами , кол-во выполненных задач
        const pending = total - completed; //из всех задач вычитаем выполненные и получаем активные, в ожидании
        const overdue = this.tasks.filter(task => task.isOverdue).length;

        return { total, completed, pending, overdue };
    }

    updateStats() {
        const stats = this.getStats();
        document.getElementById('totalTasks').textContent = stats.total;
        document.getElementById('completedTasks').textContent = stats.completed;
        document.getElementById('pendingTasks').textContent = stats.pending;
        document.getElementById('overdueTasks').textContent = stats.overdue;
    }

    getPriorityText(priority) {
        const priorities = {
            '3low': "Низкий",
            '2medium': "Средний",
            '1high': "Высокий",
        }
        return priorities[priority]; //по ключу обращаемся
    }
}

const taskManager = new TaskManager();