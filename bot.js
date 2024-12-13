const { Telegraf } = require('telegraf');
const fs = require("fs");
const { message } = require('telegraf/filters');

const BOT_TOKEN = "{your bot's token}";

let todoList = JSON.parse(fs.readFileSync("todoList.json", "utf-8"));

const bot = new Telegraf(BOT_TOKEN);
const ADMIN_ID = "{your admin's id}";
bot.start((ctx) => {
    ctx.reply('Привет, амиго. Этот бот поможет тебе организовать твой день.');
    ctx.reply('Список команд:\n"/show" - показать весь список;\n"/add {имя задания}" - добавить новое задание в список;\n"/delete {номер задания}" - удалить задание;\n"/done {номер задания}" - отметить задание как выполненое;\n"/undone {номер задания}" - убрать пометку "выполненное";');
});

bot.command('show',(ctx) => {
    const showList = todoList.map((todo, index) => {
        const isDone = todo.isDone === true? "✅" : "";
        const row = `${index + 1}. ${todo.title} ${isDone};`;
        return row;
    });
    if(todoList.length === 0){
        ctx.reply("Пока что никаких заданий не было добавлено. Используй команду '/add {название}', чтобы добавить задание!");
        return;
    }
    ctx.reply(`Список дел на сегодня:\n${showList.join('\n')}`);
});

bot.command('add', (ctx) => {
    try{
        const todoTitle = ctx.message.text.split(" ").slice(1).join(" ");
        const newTodo = { title: todoTitle, isDone: false};
        todoList.push(newTodo);
        fs.writeFileSync('todoList.json', JSON.stringify(todoList, null, 2), 'utf-8'); 
        ctx.reply(`Задание '${todoTitle}' было успешно добавлено!`);
    } catch {
        ctx.reply("Что-то пошло не так. Пожалуйста, проверь правильность написания и попробуй снова!");
    }
    
});

bot.command('delete', (ctx) => {
    try{
        const todoIndex = Number(ctx.message.text.split(' ')[1]);
        const [deletedTodo] = todoList.splice(todoIndex - 1, 1);
        fs.writeFileSync('todoList.json', JSON.stringify(todoList, null, 2), 'utf-8'); 
        ctx.reply(`Задание '${deletedTodo.title}' было успешно удалено.`);
    } catch{
        ctx.reply("Мне кажется ты пытаешься удалить задание, номер которого является ошибочным. Пожалуйста, проверь правильность написания и попробуй снова!");
    }
});

bot.command('done', (ctx) => {
    try{
        const todoIndex = Number(ctx.message.text.split(' ')[1]);
        if(!todoList[todoIndex-1].isDone){
            todoList[todoIndex-1].isDone = true;
            fs.writeFileSync('todoList.json', JSON.stringify(todoList, null, 2), 'utf-8'); 
            ctx.reply(`Ты отметил, что выполнил следующее задание: '${todoList[todoIndex-1].title}'. Молодцом, так держать!`);
        } else {
            ctx.reply(`Ты уже успел отметить, что выполнил следующее задание: '${todoList[todoIndex-1].title}'. Не расслабляйся!`)
        };
    } catch{
        ctx.reply("Мне кажется ты пытаешься отметить выполненным задание, номер которого является ошибочным. Пожалуйста, проверь правильность написания и попробуй снова!")
    }
});

bot.command('undone', (ctx) => {
    const todoIndex = Number(ctx.message.text.split(' ')[1]);
    if(todoList[todoIndex-1].isDone){
        todoList[todoIndex-1].isDone = false;
        fs.writeFileSync('todoList.json', JSON.stringify(todoList, null, 2), 'utf-8'); 
        ctx.reply(`Отметка "выполненно" убрана со следующего задания: '${todoList[todoIndex-1].title}'.`);
    } else {
        ctx.reply(`Следующее задание ещё не выполненно: '${todoList[todoIndex-1].title}'. Не расслабляйся!`)
    };

    
});
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));