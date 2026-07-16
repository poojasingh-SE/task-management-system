#!/usr/bin/env node

const { createInterface } = require('readline');
const fs = require('fs');

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Mini-Notepad> '
});

// ✅ Safe read
function getTasks() {
    try {
        if (!fs.existsSync('tasks.json')) return [];
        const data = fs.readFileSync('tasks.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.log('❌ Error reading tasks file');
        return [];
    }
}

// ✅ Safe write
function saveTasks(tasks) {
    try {
        fs.writeFileSync('tasks.json', JSON.stringify(tasks, null, 2));
    } catch (err) {
        console.log('❌ Error saving tasks');
    }
}

function showMenu() {
    console.clear();
    console.log('\n======= Mini-Notepad ======');
    console.log('1. Add Task');
    console.log('2. Remove Task');
    console.log('3. Update Task');
    console.log('4. View Tasks');
    console.log('5. Exit');
    console.log('6. Clear Screen');

    rl.question('\nChoose option: ', handleChoice);
}

function handleChoice(choice) {
    switch (choice.trim()) {
        case '1': return addNewTask();
        case '2': return RemoveTask();
        case '3': return UpdateTask();
        case '4': return viewTaskList();
        case '5': return exit();
        case '6': return showMenu();
        default:
            console.log('❌ Invalid option');
            return backToMenu();
    }
}

function addNewTask() {
    rl.question('Title: ', (title) => {
        if (!title.trim()) {
            console.log('❌ Title required');
            return backToMenu();
        }

        rl.question('Description: ', (desc) => {
            let tasks = getTasks();
            let newId = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1;

            let newTask = { id: newId, title, description: desc };
            tasks.push(newTask);
            saveTasks(tasks);

            console.log('\n✅ Task Added!');
            console.log(JSON.stringify(newTask, null, 2));

            return backToMenu();
        });
    });
}

function viewTaskList(page = 1, limit = 5) {
    let taskList = getTasks();

    if (taskList.length === 0) {
        console.log('❌ No Tasks Found');
        return backToMenu();
    }

    taskList = taskList.reverse();

    let start = (page - 1) * limit;
    let end = start + limit;

    let paginatedTasks = taskList.slice(start, end);

    console.log(`\n--- Tasks (${start + 1}-${Math.min(end, taskList.length)} of ${taskList.length}) ---`);

    paginatedTasks.forEach(task => {
        let shortDesc = task.description.length > 50
            ? task.description.substring(0, 50) + '...'
            : task.description;

        console.log(`${task.id}. ${task.title} → ${shortDesc}`);
    });

    console.log('\nCommands: next | prev | back');

    rl.question('> ', (cmd) => {
        if (cmd === 'next') {
            viewTaskList(page + 1, limit);
        } else if (cmd === 'prev' && page > 1) {
            viewTaskList(page - 1, limit);
        } else {
            return backToMenu();
        }
    });
}

function UpdateTask() {
    rl.question('Task ID: ', (id) => {
        let tasks = getTasks();
        let task = tasks.find(t => t.id === Number(id));

        if (!task) {
            console.log('❌ Task not found');
            return backToMenu();
        }

        rl.question(`Updated Title [${task.title}]: `, (newTitle) => {
            rl.question(`Updated Description [${task.description}]: `, (newDesc) => {

                task.title = newTitle || task.title;
                task.description = newDesc || task.description;

                saveTasks(tasks);

                console.log('✅ Task Updated!');
                console.log(JSON.stringify(task, null, 2));

                return backToMenu();
            });
        });
    });
}

function RemoveTask() {
    rl.question('Task ID: ', (id) => {
        let tasks = getTasks();
        let newTasks = tasks.filter(t => t.id !== Number(id));

        if (tasks.length === newTasks.length) {
            console.log('❌ Task not found');
        } else {
            saveTasks(newTasks);
            console.log('✅ Task Deleted!');
        }

        return backToMenu();
    });
}

function backToMenu() {
    rl.question('\nPress Enter to continue...', () => {
        showMenu();
    });
}

function exit() {
    rl.close();
}

showMenu();

rl.on('close', () => {
    console.log('\n👋 Goodbye!');
    process.exit(0);
});