class Signals {
    constructor() {}
    
    check(signal) {
        const signalExists = this.hasOwnProperty(signal);
        if(!signalExists) {
            this[signal] = [];
        }
    }
    
    listen(signal, object) {
        this.check(signal);
        this[signal].push(object);
    }
    
    stopListening(signal, object) {
        const id = object.id;
        this.check(signal);
        this[signal] = this[signal].filter( sub => sub.signal.id !== id );
    }
    
    send() {
        const args = [...arguments];
        const signal = args.shift();
        const signalExists = Object.hasOwn(this, signal);
        
        if(!signalExists) {
            this[signal] = [];
        }
        
        for(const object of this[signal]) {
            const listening = (typeof object[signal] !== undefined);
            if(listening) {
                object[signal](...args);
            }
        }
    }
}

export class SignalUser {
    static signals = new Signals();
    
    constructor(parent) {
        this.id = self.crypto.randomUUID();
        this.parent = parent;
        this.listening = [];
    }
    
    listen(signal) {
        this.constructor.signals.listen(signal, this.parent);
        this.listening.push(signal);
    }
    
    stopListening(signal) {
        this.constructor.signals.stopListening(signal, this.parent);
        this.listening = this.listening.filter( element => element !== signal );
    }
    
    deafen() {      //Stops listening to all signals
        for(const signal of this.listening) {
            this.constructor.signals.stopListening(signal, this.parent);
        }
        this.listening = [];
    }
    
    send() {
        const args = [...arguments];
        this.constructor.signals.send(...args);
    }
}