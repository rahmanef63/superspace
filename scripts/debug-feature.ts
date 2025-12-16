
import { z } from 'zod'

console.log('Testing Zod schema with z.any()...');

try {
    const S = z.object({
        patterns: z.any().optional()
    })

    const data = {
        patterns: { 'a': 'b' }
    }

    S.parse(data)
    console.log('Schema valid')
} catch (e) {
    console.error('Schema error:', e)
}
