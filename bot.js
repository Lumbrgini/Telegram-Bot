const { Telegraf } = require('telegraf');
const fs = require("fs");
const { message } = require('telegraf/filters');

const BOT_TOKEN = "{your bot's token}";

let todoList = JSON.parse(fs.readFileSync("todoList.json", "utf-8"));

const bot = new Telegraf(BOT_TOKEN);
const ADMIN_ID = "{your admin's id}";

bot.start((ctx) => {
    ctx.reply('Hello, amigo. This bot will help you organize your day.');
    ctx.reply('List of commands:\n"/show" - show the whole list;\n"/add {task name}" - add a new task to the list;\n"/delete {task number}" - delete a task;\n"/done {task number}" - mark a task as done;\n"/undone {task number}" - remove the "done" mark;');
});

bot.command('show',(ctx) => {
    const showList = todoList.map((todo, index) => {
        const isDone = todo.isDone === true? "✅" : "";
        const row = `${index + 1}. ${todo.title} ${isDone};`;
        return row;
    });
    if(todoList.length === 0){
        ctx.reply("No tasks have been added yet. Use the '/add {title}' command to add a task!");
        return;
    }
    ctx.reply(`Today's to-do list:\n${showList.join('\n')}`);
});

bot.command('add', (ctx) => {
    try{
        const todoTitle = ctx.message.text.split(" ").slice(1).join(" ");
        const newTodo = { title: todoTitle, isDone: false};
        todoList.push(newTodo);
        fs.writeFileSync('todoList.json', JSON.stringify(todoList, null, 2), 'utf-8'); 
        ctx.reply(`Task '${todoTitle}' was successfully added!`);
    } catch {
        ctx.reply("Something went wrong. Please check your input and try again!");
    }
});

bot.command('delete', (ctx) => {
    try{
        const todoIndex = Number(ctx.message.text.split(' ')[1]);
        const [deletedTodo] = todoList.splice(todoIndex - 1, 1);
        fs.writeFileSync('todoList.json', JSON.stringify(todoList, null, 2), 'utf-8'); 
        ctx.reply(`Task '${deletedTodo.title}' was successfully deleted.`);
    } catch{
        ctx.reply("It seems you are trying to delete a task with an invalid number. Please check your input and try again!");
    }
});

bot.command('done', (ctx) => {
    try{
        const todoIndex = Number(ctx.message.text.split(' ')[1]);
        if(!todoList[todoIndex-1].isDone){
            todoList[todoIndex-1].isDone = true;
            fs.writeFileSync('todoList.json', JSON.stringify(todoList, null, 2), 'utf-8'); 
            ctx.reply(`You marked the following task as completed: '${todoList[todoIndex-1].title}'. Great job, keep it up!`);
        } else {
            ctx.reply(`You have already marked the following task as completed: '${todoList[todoIndex-1].title}'. Stay focused!`)
        };
    } catch{
        ctx.reply("It seems you are trying to mark as done a task with an invalid number. Please check your input and try again!")
    }
});

bot.command('undone', (ctx) => {
    const todoIndex = Number(ctx.message.text.split(' ')[1]);
    if(todoList[todoIndex-1].isDone){
        todoList[todoIndex-1].isDone = false;
        fs.writeFileSync('todoList.json', JSON.stringify(todoList, null, 2), 'utf-8'); 
        ctx.reply(`The "done" mark was removed from the following task: '${todoList[todoIndex-1].title}'.`);
    } else {
        ctx.reply(`The following task is not yet completed: '${todoList[todoIndex-1].title}'. Stay on track!`)
    };
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
