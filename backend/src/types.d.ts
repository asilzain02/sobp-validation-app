declare module 'node:fs' {
  const fs: {
    mkdirSync(path: string, options?: { recursive?: boolean }): void;
  };
  export default fs;
}

declare module 'node:path' {
  const path: {
    join(...parts: string[]): string;
    dirname(filePath: string): string;
  };
  export default path;
}

declare module 'dotenv' {
  export function config(): void;
  const dotenv: { config: typeof config };
  export default dotenv;
}

declare module 'sqlite' {
  export function open(options: unknown): Promise<any>;
}

declare module 'sqlite3' {
  const sqlite3: { Database: unknown };
  export default sqlite3;
}

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
}

declare const process: {
  cwd(): string;
  env: NodeJS.ProcessEnv;
  exit(code?: number): never;
};

declare const Buffer: {
  alloc(size: number, fill?: string): Buffer;
};

interface Buffer {}

declare function setImmediate(callback: () => void): unknown;

declare function setInterval(callback: () => void, ms?: number): { unref(): void };

declare function setTimeout(callback: () => void, ms?: number): { unref(): void };

declare module 'express' {
  interface Request {}

  interface Response {
    status(code: number): Response;
    json(body: unknown): Response;
    accepted(): Response;
  }

  type NextFunction = (error?: unknown) => void;
  type RequestHandler = (request: Request, response: Response, next: NextFunction) => void | Promise<void>;
  type ErrorRequestHandler = (error: unknown, request: Request, response: Response, next: NextFunction) => void;

  interface Router {
    get(path: string, handler: RequestHandler): void;
    post(path: string, handler: RequestHandler): void;
  }

  interface Express {
    use(...handlers: unknown[]): void;
    listen(port: number, hostname: string, callback?: () => void): unknown;
  }

  interface ExpressFactory {
    (): Express;
    json(): RequestHandler;
    static(root: string): RequestHandler;
  }

  const express: ExpressFactory;
  export function Router(): Router;
  export type { ErrorRequestHandler, Request, Response, NextFunction };
  export default express;
}
