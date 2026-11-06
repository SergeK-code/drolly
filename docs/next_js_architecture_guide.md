# Next.js Architecture Guide: Validation, Error Handling, and Layers

This document outlines the architectural standards for validation, error handling, and separation of concerns in our Next.js App Router API (`src/app/api/...`). It maps our clean-architecture principles to Next.js Route Handlers.

---

## 1. Adapting Layers to Next.js App Router

While a vanilla Express app uses separate middleware and router files, Next.js uses Route Handlers (`route.ts` or `route.js`). We maintain the same strict layer separation inside each API endpoint:

1. **Route Handlers (`src/app/api/[resource]/route.ts`)**: 
   Acts as the **Route & Controller layer combined**. It extracts request data (body, query params, route parameters), invokes the validation helper, calls the service, and returns Next.js `NextResponse.json()` objects.
2. **Validation Layer (`src/lib/validation/`)**: 
   Uses **Zod** schemas to parse and clean untrusted input (`body`, query strings, dynamic route segments) before business logic runs.
3. **Services Layer (`src/services/` or `src/lib/services/`)**: 
   Contains pure business logic and state rules. Throws standard errors (`404`, `409`, `422`) when rules are violated. Completely unaware of Next.js or HTTP objects.
4. **Global Error Boundary / Response Wrapper**: 
   Catches errors thrown across API routes and standardizes them into **RFC 9457 Problem Details** JSON responses.

---

## 2. Validation Standard (Zod in Next.js)

### Rules:
* **Never** trust incoming client input (`req.json()`, query parameters, or dynamic segment `params`) in your services.
* Use **Zod** schemas with `.trim()`, type coercions (`z.coerce.number()`), and `.strict()` to reject unrecognized keys.
* Validate inputs explicitly at the top of your Route Handler before executing any business logic.

### Validation Helper Pattern (`src/lib/validate.ts`):
```ts
import { NextResponse } from 'next/server';
import { ZodSchema } from 'zod';

export class ValidationError extends Error {
  errors: any[];
  constructor(errors: any[]) {
    super('Validation failed');
    this.errors = errors;
  }
}

export function validateData<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const formattedErrors = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || '(root)',
      message: issue.message,
    }));
    throw new ValidationError(formattedErrors);
  }
  return result.data;
}
```

---

## 3. Error Handling Standard (RFC 9457 in Next.js)

### Rules:
* Use a shared error class (`HttpError`) to throw specific status codes from your service layer (`404`, `409`, `422`).
* Wrap your Route Handler logic in a standard try/catch block or a shared wrapper function that catches custom errors and formats them into **RFC 9457 `application/problem+json`**.

### Custom Error Classes (`src/lib/errors.ts`):
```ts
export class HttpError extends Error {
  status: number;
  errors?: any[];
  constructor(status: number, message: string, errors?: any[]) {
    super(message);
    this.status = status;
    if (errors) this.errors = errors;
  }
}

export const notFound = (msg: string) => new HttpError(404, msg);
export const conflict = (msg: string) => new HttpError(409, msg);
export const validationFailed = (errors: any[]) => new HttpError(422, 'Validation failed', errors);
```

### RFC 9457 Response Formatter (`src/lib/api-response.ts`):
```ts
import { NextResponse } from 'next/server';
import { ValidationError } from './validate';
import { HttpError } from './errors';

const TITLES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Content',
  500: 'Internal Server Error'
};

export function handleApiError(err: unknown, instance: string) {
  let status = 500;
  let message = 'Something went wrong on our side.';
  let fieldErrors: any = undefined;

  if (err instanceof HttpError) {
    status = err.status;
    message = err.message;
    if (err.errors) fieldErrors = err.errors;
  } else if (err instanceof ValidationError) {
    status = 422;
    message = 'Validation failed';
    fieldErrors = err.errors;
  } else if (err instanceof Error) {
    message = err.message;
  }

  return NextResponse.json(
    {
      type: 'about:blank',
      title: TITLES[status] ?? 'Error',
      status,
      detail: message,
      instance,
      ...(fieldErrors && { errors: fieldErrors }),
    },
    { 
      status, 
      headers: { 'Content-Type': 'application/problem+json' } 
    }
  );
}
```

---

## 4. Example Route Handler Implementation (`src/app/api/events/route.ts`)

```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateData } from '@/lib/validate';
import { handleApiError } from '@/lib/api-response';
import * as eventsService } from '@/services/events.service';

const createEventSchema = z.object({
  title: z.string().trim().min(3).max(80),
  capacity: z.number().int().positive().max(5000),
  category: z.string().trim(),
}).strict();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 1. Validate and clean input
    const cleanData = validateData(createEventSchema, body);
    
    // 2. Call service (state rules like conflict checks happen here)
    const event = eventsService.createEvent(cleanData);
    
    // 3. Return success
    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    return handleApiError(err, '/api/events');
  }
}
```

---

## 5. Instructions for Cursor

When generating or refactoring code in this Next.js project, Cursor must adhere to:
1. **Route Handlers Structure:** Wrap all `src/app/api/.../route.ts` logic inside try/catch blocks that pass errors to `handleApiError()`.
2. **No Business Logic in Routes:** Route handlers only parse inputs, call services, and return responses.
3. **Strict Validation:** Always run incoming request bodies and query strings through a Zod schema validation helper.
4. **Standard Errors:** Throw `conflict()`, `notFound()`, or `ValidationError` from services and helper functions rather than returning custom error response objects manually.