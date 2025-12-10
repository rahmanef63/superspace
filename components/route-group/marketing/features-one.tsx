export default function FeaturesOne() {
    return (
        <section className="py-16 md:py-32" id="features">
            <div className="mx-auto w-full max-w-7xl px-6">
                <div className="text-center mb-16">
                    <h2 className="text-foreground text-4xl font-semibold">Experience the Workspace</h2>
                    <p className="text-muted-foreground mt-4 text-balance text-lg max-w-2xl mx-auto">
                        Explore our powerful features directly from this page. 
                        Interact with the dashboard to see how SuperSpace can streamline your workflow.
                    </p>
                </div>


                <div className="mt-24 grid gap-12 md:grid-cols-3 text-center">
                    <div>
                        <h3 className="text-foreground text-xl font-semibold">Real-time Collaboration</h3>
                        <p className="text-muted-foreground mt-2">
                            Built on Convex for instant updates across all clients. No refresh needed.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-foreground text-xl font-semibold">Role-Based Access</h3>
                        <p className="text-muted-foreground mt-2">
                            Granular permission controls integrated into every feature.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-foreground text-xl font-semibold">Modular Design</h3>
                        <p className="text-muted-foreground mt-2">
                            Enable only the features you need. Keep your workspace clean and fast.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
