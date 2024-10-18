export declare type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
export declare type Common<A, B> = {
    [P in keyof A & keyof B]: A[P] | B[P];
};
export declare type ConsistentWith<T, U> = Pick<U, keyof T & keyof U>;
export declare type Overwrite<T, U> = (U extends ConsistentWith<U, T> ? T : Omit<T, keyof U>) & U;
export declare type PartialMember<T, K extends keyof any> = Omit<T, Extract<keyof T, K>> & Partial<Omit<T, Exclude<keyof T, K>>>;
export declare type ValueOf<T> = T[keyof T];
export declare type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
