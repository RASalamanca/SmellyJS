import {SmellyComponent} from '../lib/Smelly.js';

class Task extends SmellyComponent {
    constructor(taskName) {
        super(`<div pn='this' class="task" draggable="true">
            <span class="task-text">${taskName}</span>
            <button pn="delete" class="task-button">X</button>
        </div>`);
        this.delete.instance.addEventListener('click', () => {
            this.remove();
            this.signals.send('deleteTask', this.UUID);
        });
        this.instance.addEventListener('dragstart', () => {
            this.signals.send('select', this.UUID);
        });
        this.instance.addEventListener('dragover', (event) => {
            event.preventDefault();
            this.signals.send('setDrag', this.UUID);
        });
        this.instance.addEventListener('drop', () => {
            this.signals.send('setSelection');
        });
     
        this.UUID = self.crypto.randomUUID();
    }
}

class TaskQueue extends SmellyComponent {
    constructor() {
        super(`<div class="task-queue"></div>`);
        this.tasks = {};
        this.order = [];
        this.dragging;
        this.dragTarget;
        
        this.signals.listen('deleteTask');
        this.signals.listen('addTask');
        this.signals.listen('select');
        this.signals.listen('setDrag');
        this.signals.listen('setSelection');
        this.attach(document.body);
    }
    
    addTask(taskName) {
        const task = new Task(taskName);
        const id = task.UUID;
        task.attach(this.instance);
        this.tasks[id] = task;
        this.order.push(id);
    }
    
    deleteTask(taskUUID) {
        const index = this.order.indexOf(taskUUID);
        this.order.splice(index, 1);
        delete this.tasks[taskUUID];
    }
    
    select(UUID) {
        this.dragging = UUID;
    }
    
    setDrag(UUID) {
        this.dragTarget = UUID;
    }
    
    setSelection() {
        const targetIndex = this.order.indexOf(this.dragTarget);
        const sourceIndex = this.order.indexOf(this.dragging);
        this.order[targetIndex] = this.dragging;
        this.order[sourceIndex] = this.dragTarget;
        for(const id of this.order) {
            const element = this.tasks[id].instance;
            this.instance.appendChild(element);
        }
        
        this.dragging = undefined;
        this.dragTarget = undefined;
    }
}

class TaskInput extends SmellyComponent {
    constructor() {
        super(`<div pn="this" class="task-input">
             <input pn="box" class="input-box" value="Enter a task!"></input>
             <button pn="button" class="input-button">Add Task</button>
        </div>`);
        this.button.instance.addEventListener('click', () => {
            this.signals.send('addTask', this.box.value);
            this.box.instance.focus();
            this.box.value = '';
        });
        
        this.attach(document.body);
    }
}

const inputs = new TaskInput();
const queue = new TaskQueue();