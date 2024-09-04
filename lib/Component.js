import {SignalUser} from './PubSub.js';

export class Component {
    constructor(data) {
        this.signals = new SignalUser(this);
        this.initialize(data, this);
    }
    
    initialize(data, component) {
        const comp = component === undefined ? {} : component;
        comp.instance = document.createElement(data.tag);
            
        //This loop creates setters and getters for every attribute 
        for(const attribute in data.attributes) {
            const value = data.attributes[attribute];
            comp.instance.setAttribute(attribute, value);
            
            if(data.name !== undefined) {
                switch (attribute) {
                    case 'value':
                        this.constructor.createElementSetter(comp, 'value');
                        break;
                    
                    default:
                        this.constructor.createAttributeSetter(comp, attribute);
                }
            }
        }
         
        //Checks if the data contains any text and creates setters and getters if it does   
        if(Object.hasOwn(data, "text")) {
            comp.instance.textContent = data.text;    
        }
        if(data.name !== undefined) {
            this.constructor.createElementSetter(this, 'textContent');
        }
        
        for(const child of data.children) {
            const childComponent = new Component(child);
            comp.instance.appendChild(childComponent.instance);
            if(child.name) {
                comp[child.name] = childComponent;
            }
        }
        
        return comp;
    }
    
    attach(target) {
        target.appendChild(this.instance);
        return this;
    }
    
    remove() {
        this.instance.remove();
    }
    
    static createElementSetter(object, property) {
        Object.defineProperty(object, property, {
            get() {
                return this.instance[property];
            },
            set(input) {
                this.instance[property] = input;
            }
        });
    }
    
    static createAttributeSetter(comp, attribute) {
        Object.defineProperty(comp, attribute, {
            get: () => {
                return this.instance.getAttribute(attribute);
            },
            set: (input) => {
                if(typeof input !== "string") {
                    return;
                }
                this.instance.setAttribute(attribute, input);
            }
        });
    }
}

