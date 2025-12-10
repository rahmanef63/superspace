export default function FAQs() {
    return (
        <section className="scroll-py-16 py-16 md:scroll-py-32 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-y-12 px-2 lg:[grid-template-columns:1fr_auto]">
                    <div className="text-center lg:text-left">
                        <h2 className="mb-4 text-3xl font-semibold md:text-4xl">
                            Frequently <br className="hidden lg:block" /> Asked <br className="hidden lg:block" />
                            Questions
                        </h2>
                        <p>Everything you need to know about SuperSpace.</p>
                    </div>

                    <div className="divide-y divide-dashed sm:mx-auto sm:max-w-lg lg:mx-0">
                        <div className="pb-6">
                            <h3 className="font-medium">What is SuperSpace?</h3>
                            <p className="text-muted-foreground mt-4">SuperSpace is a modular, feature-based SaaS platform built with Next.js 15, Convex, and Clerk. It allows you to build scalable applications with ease.</p>
                        </div>
                        <div className="py-6">
                            <h3 className="font-medium">How does the modular architecture work?</h3>
                            <p className="text-muted-foreground mt-4">Every feature is a self-contained module with its own UI, backend, and tests. This ensures that your codebase remains clean and maintainable as your application grows.</p>
                        </div>
                        <div className="py-6">
                            <h3 className="font-medium">Is it open source?</h3>
                            <p className="text-muted-foreground my-4">SuperSpace is a commercial product, but we offer a free tier for developers to get started.</p>
                        </div>
                        <div className="py-6">
                            <h3 className="font-medium">Can I integrate with other tools?</h3>
                            <p className="text-muted-foreground mt-4">Yes, SuperSpace is designed to be extensible. You can easily integrate with third-party tools and services using our API.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
