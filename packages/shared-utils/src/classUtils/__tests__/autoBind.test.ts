import {autoBind} from "../autoBind";

describe('autoBind', () => {
    it('should automatically bind all public methods to the instance', () => {
        @autoBind
        class TestController {
            private readonly name: string;

            constructor(name: string) {
                this.name = name;
            }

            public sayHello() {
                return `Hello, ${this.name}`;
            }

            public sayGoodbye() {
                return `Goodbye, ${this.name}`;
            }
        }

        const controller = new TestController('Rider');

        // On extrait les méthodes
        const hello = controller.sayHello;
        const goodbye = controller.sayGoodbye;

        // ✅ Même extraites, elles doivent avoir le bon `this`
        expect(hello()).toBe('Hello, Rider');
        expect(goodbye()).toBe('Goodbye, Rider');
    });

    it('should not bind the constructor itself', () => {
        @autoBind
        class AnotherController {
            constructor(public id: number) {}

            public getId() {
                return this.id;
            }
        }

        const controller = new AnotherController(42);
        expect(controller.getId()).toBe(42);
    });
});
