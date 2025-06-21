import { ZodError } from 'zod'

export function logError(message: string, err?: unknown) {

    if (!err) {
        console.error(message)
        return
    }

    if (err instanceof ZodError) {
        console.error(formatZodError(message, err))
    } else if (err instanceof Error) {
        console.error(`${message}: ${err.message}`)
    } else {
        console.error(`${message}: ${err}`)
    }
}

export function formatZodError(message: string, err: ZodError): string {
    const errMessages = err.errors.map((issue) => {
        const path = issue.path.join('.') || '(root)'
        return `${path}: ${issue.message}`
    })
    return `${message}: Schema parsing: [ ${errMessages.join(' - ')} ]`
}
