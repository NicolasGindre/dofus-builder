declare module "*?worker&module" {
    const WorkerFactory: new () => Worker;
    export default WorkerFactory;
}
declare module "*.wasm?url" {
    const url: string;
    export default url;
}
