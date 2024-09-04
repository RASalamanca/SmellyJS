# Smelly UI
Smelly UI is a pseudo-framework simplify working with HTML elements. It's really only a wrapper for the Element class with a slightly
less verbose syntax and pub/sub signals. The codebase itself is fairly smelly thus the name. 

## Instalation
To install, copy the contents of the lib folder to your project, and import the `SmellyComponent` class from `Smelly.js` into your app or UI component classes. Using ES6 imports like this:
`import {SmellyComponent} from './lib/Smelly.js';`

## How to Use
Smelly UI assumes that each component has it's own class that extends
SmellyComponent. Making a new component is as easy as declaring a
new class extenging SmellyComponent and passing the component's HTML
markup to the `super()` method. 
Here's how a generic button component would look like:

    class Button extends SmellyComponent {
        constructor(text, DOMParent = document.body) {
            super(`<button cn="this">${text}</button>`);
            this.intance.addEventListener('click', () => {
                this.signals.send('buttonClick');
            });
            
            this.attach(DOMParent);
        }
    }

### Passing Signals
Components communicate with each other using the `signals` API
which is just an implementation of the Pub/Sub pattern.
the `listen()` method subscribes objects to an type event, and the `send()` method publishes an event of the given type. 
To send a signal, call the `send()` method which takes in any number of arguments, the first being the signal name, and the rest data passed to whatever component is listening.

For a component to then react to said signal, it needs to:
- subscribe to it by passing the signal name to the `listen()` method
- implement a method with the signal name

For example, a component that reacts to the button from the previous
example would look like this:

    class ClickCounter extends SmellyComponent {
        constructor(DOMParent = document.body) {
            super(`<p cn="this">0</p>`);
            this.counter = 0;
            this.signals.listen('buttonClick');
        }
        
        buttonClick() {
            this.counter += 1;
            this.textContent = this.counter; 
        }
    }

### Accessing Properties of Sub-Components
You may have noticed the `cn="this"` attribute in the markup of the previous example.
In order to let Smelly know which subcomponents should be accesible properties in the component object, we use the `cn` attribute.
For example: 

    class LabelValue extends SmellyComponent {
        constructor(labelText) {
            super(`<p cn="this">
                <span class="label-text">${labelText}</span>
                <span cn="value" class="label-value"></span>
            </p>`);
        }
    }
    const hpLabel = new LabelValue('HP: ');
    hpLabel.value.textContent = 1000;
    
### Templating Sub-Components
Not all of the Sub-Components need to be in the initial markup we pass to `super()`. We can use the `addSmell()` inside the class
to create a sub-compoenent. For example:

    class List extends SmellyComponent {
        constructor() {
            super(`<ul cn="this"></ul>`);
            this.newItem = this.addSmell(`<li cn="this">&{0}</li>`);
        }
        
        addItem(itemName) {
            const item = this.newItem(itemName);
            this[itemName] = item;
            this.instance.appendChild(item.instance);
        }
    }
    const guestList = new List();
    guestList.addItem('Jeff');
    guestList.addItem('Bob');
    guestList.addItem('Steve');

`addSmell()` will take an html string and output a factory function for our sub-compoenent.
Note the `&{0}` in the markup for the `<li>` component. That's a special sintax that allows us to indicate that string should be taken from
the argument list of the factory function. The number inside indicate which argument should be used, in this case number 0. 


## FAQ
 - **What does Smelly offer that other Frameworks don't?**
    Nothing, don't use it. Specially not on a serious project. 

 - **Why make this then?**
    I like working with the Element class, but I hate how verbose it gets when I make components with very nested markup, so I made this to
    slightly aleviate that specific pain-point. But I'm the only one that has to deal with the shitty code on my personal projects.

 - **Why publish it then?**
    I need to pad my github. Plus I spend way too long working on this to not upload it.

 - **Are there any plans to upgrade it in the future?**
    No. I might decide that my current way of doing things is too verbose still and simplify it further, but I don't really plan to add any features.

 - **I really like it and want to extend it, or fix a bug!**
    Said no one ever, but feel free to suggest changes.