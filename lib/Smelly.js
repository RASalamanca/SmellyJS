import {Component} from './Component.js';

export class SmellyFactory {
    template = document.createElement('div');
    
    constructor(htmlString) {
        this.template.innerHTML = htmlString;
        this.defaultParent;
        return this;
    }
    
    parse(element) {
        const commandRegex = /(?<=&{).+(?=})/;
        const output = {
            tag: element.tagName.toLowerCase(),
            name: undefined,
            inputs: {},
            attributes: {},
            children: []
        };
        
        if(element.children.length === 0) {
            const command = element.textContent.match(commandRegex);
            if(command !== null) {
                output.inputs.text = command[0];
                output.text = '';
            }
            output.text = element.textContent;
        }
        
        const attributes = element.getAttributeNames();
        if(attributes.includes('pn')) {
            const index = attributes.indexOf('pn');
            output.name = element.getAttribute('pn');
            attributes.splice(index, 1);
        }
        for(const attribute of attributes) {
            const value = element.getAttribute(attribute);
            const command = value.match(commandRegex);
            
            if(command !== null) {
                output.inputs[attribute] = command[0];
                output.attributes[attribute] = '';
            } else {
                output.attributes[attribute] = value;
            }
        }
        
        for(const child of element.children) {
            const childElement = this.parse(child);
            output.children.push(childElement);
            
            if(typeof childElement.name === 'string') {
                output.inputs[childElement.name] = childElement.inputs;
            }
        }
        
        return output;
    }
    
    setParent(DOMNode) {
        this.defaultParent = DOMNode;
        return this;
    }
    
    build() {
        const structure = this.parse(this.template.children[0]);
        const parent = this.defaultParent;
        
        function passArgs(inputs, component, args) {
            for(const input in inputs) {
                const value = inputs[input];
                if(typeof value === 'object') {
                    const comp = component[input];
                    passArgs(value, comp, args);
                    continue;
                }
                
                component[input] = args[value];
            }
        }
        
        function output() {
            const args = [...arguments];
            const comp = new Component(structure);
            passArgs(structure.inputs, comp, args);
            
            if(parent !== undefined) {
                parent.appendChild(comp.instance);
            }
            return comp;
        }
        
        return output;
    }
}

export class SmellyComponent extends Component {
    constructor(htmlString) {
        super({
            tag: 'div',
            name: undefined,
            inputs: {},
            attributes: {},
            children: []
        });
        
        if(htmlString !== undefined) {
            const template = new SmellyFactory(htmlString);
            const data = template.parse(template.template.children[0]);
            this.initialize(data, this);
        }
    }
    
    addSmell(htmlString) {
        return new SmellyFactory(htmlString).build();
    }
}