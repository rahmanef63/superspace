
import { z } from 'zod'



try {
    const S = z.object({
        patterns: z.any().optional()
    })

    const data = {
        patterns: { 'a': 'b' }
    }

    S.parse(data)

} catch (e) {
    console.error('Schema error:', e)
}
