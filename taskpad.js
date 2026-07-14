const {createInterface} = require('readline');
const fs = require('fs');

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Taskpad> '
});

// File से सारे tasks पढ़ने का function
function getTasks() {
    if (!fs.existsSync('tasks.json')) return [];
    const data = fs.readFileSync('tasks.json', 'utf8');
    return JSON.parse(data);
}

// File में tasks save करने का function
function saveTasks(tasks) {
    fs.writeFileSync('tasks.json', JSON.stringify(tasks, null, 2));
}

rl.prompt();
rl.on('line', (command) => {
    command = command.trim().toLowerCase();

    if(command === 'add task'){
        rl.question('Title: ', (title) => {
            rl.question('Description: ', (desc) => {
                let tasks = getTasks();
                let newId = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1;
                
                let newTask = {id: newId, title, description: desc};
                tasks.push(newTask);
                saveTasks(tasks);
                
                console.log('\nTask Added!');
                console.log(JSON.stringify(newTask, null, 2));
                rl.prompt();
            });
        });

    } else if(command === 'view tasks'){
        let tasks = getTasks();
        if(tasks.length === 0) console.log('Koi task nahi hai');
        else {
            console.log('\n--- All Tasks ---');
            tasks.forEach(task => {
                console.log(`${task.id}. ${task.title} - ${task.description}`);
            });
        }
        rl.prompt();

    } else if(command === 'edit task'){
        rl.question('Kaunsa ID edit karna hai? ', (id) => {
            let tasks = getTasks();
            let task = tasks.find(t => t.id == id);
            if(!task) {
                console.log('Task nahi mila');
                return rl.prompt();
            }
            rl.question(`Naya Title [${task.title}]: `, (newTitle) => {
                rl.question(`Naya Desc [${task.description}]: `, (newDesc) => {
                    task.title = newTitle || task.title;
                    task.description = newDesc || task.description;
                    saveTasks(tasks);
                    console.log('Task Updated!');
                    rl.prompt();
                });
            });
        });

    } else if(command === 'delete task'){
        rl.question('Kaunsa ID delete karna hai? ', (id) => {
            let tasks = getTasks();
            let newTasks = tasks.filter(t => t.id != id);
            if(tasks.length === newTasks.length) {
                console.log('Task nahi mila');
            } else {
                saveTasks(newTasks);
                console.log('Task Deleted!');
            }
            rl.prompt();
        });

    } else if(command === 'exit'){
        rl.close();
    } else {
        console.log('Commands: add task / view tasks / edit task / delete task / exit');
        rl.prompt();
    }
});

rl.on('close', () => {
    console.log('Good bye!');
    process.exit(0);
});