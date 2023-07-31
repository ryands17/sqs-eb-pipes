export type Writable<T> = { -readonly [K in keyof T]: T[K] };

export type AppStage = 'dev' | 'test' | 'prod' | (string & {});
