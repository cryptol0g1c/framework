/**
 * 
 */
export interface ContextBase {
  readonly platform: string;
  myId: string;
  attach(): Promise<this>;
  detach(): Promise<this>;
  sign(data: string): Promise<string>;
}

/**
 * 
 */
export interface Query<T> {
  result: T;
}

/**
 * 
 */
export interface Mutation {
  hash: string;
}
