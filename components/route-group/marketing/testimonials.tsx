import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

type Testimonial = {
    name: string
    role: string
    image: string
    quote: string
}

const testimonials: Testimonial[] = [
    {
        name: 'Sarah Jenkins',
        role: 'CTO at TechFlow',
        image: 'https://randomuser.me/api/portraits/women/1.jpg',
        quote: 'SuperSpace\'s modular system saved us months of development time. The ability to plug and play features is incredible.',
    },
    {
        name: 'Michael Chang',
        role: 'Lead Developer',
        image: 'https://randomuser.me/api/portraits/men/6.jpg',
        quote: 'The integration with Convex and Clerk is seamless. It\'s the perfect stack for building modern SaaS applications.',
    },
    {
        name: 'Jessica Lee',
        role: 'Product Manager',
        image: 'https://randomuser.me/api/portraits/women/7.jpg',
        quote: 'I love how easy it is to manage permissions and roles. The RBAC system is robust and easy to configure.',
    },
    {
        name: 'David Wilson',
        role: 'Fullstack Engineer',
        image: 'https://randomuser.me/api/portraits/men/4.jpg',
        quote: 'The auto-discovery feature is a lifesaver. No more manual wiring of components and routes. It just works.',
    },
    {
        name: 'Emily Chen',
        role: 'Frontend Developer',
        image: 'https://randomuser.me/api/portraits/women/2.jpg',
        quote: 'The UI components are beautiful and accessible. Building a consistent design system has never been easier.',
    },
    {
        name: 'Robert Taylor',
        role: 'DevOps Engineer',
        image: 'https://randomuser.me/api/portraits/men/8.jpg',
        quote: 'Deploying and scaling with SuperSpace is a breeze. The architecture is designed for performance and reliability.',
    },
]

const chunkArray = (array: Testimonial[], chunkSize: number): Testimonial[][] => {
    const result: Testimonial[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize))
    }
    return result
}

const testimonialChunks = chunkArray(testimonials, Math.ceil(testimonials.length / 3))

export default function WallOfLoveSection() {
    return (
        <section>
            <div className="py-16 md:py-32">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center">
                        <h2 className="text-foreground text-4xl font-semibold">Loved by the Community</h2>
                        <p className="text-muted-foreground mb-12 mt-4 text-balance text-lg">Harum quae dolore orrupti aut temporibus ariatur.</p>
                    </div>
                    <div className="mt-8 grid gap-3 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
                        {testimonialChunks.map((chunk, chunkIndex) => (
                            <div
                                key={chunkIndex}
                                className="space-y-3">
                                {chunk.map(({ name, role, quote, image }, index) => (
                                    <Card key={index}>
                                        <CardContent className="grid grid-cols-[auto_1fr] gap-3 pt-6">
                                            <Avatar className="size-9">
                                                <AvatarImage
                                                    alt={name}
                                                    src={image}
                                                    loading="lazy"
                                                    width="120"
                                                    height="120"
                                                />
                                                <AvatarFallback>ST</AvatarFallback>
                                            </Avatar>

                                            <div>
                                                <h3 className="font-medium">{name}</h3>

                                                <span className="text-muted-foreground block text-sm tracking-wide">{role}</span>

                                                <blockquote className="mt-3">
                                                    <p className="text-gray-700 dark:text-gray-300">{quote}</p>
                                                </blockquote>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
