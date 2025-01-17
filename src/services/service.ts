export abstract class Service {
    abstract start(): void | Promise<void>;
    abstract stop(): void | Promise<void>;
}
