import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-8">
                Privacy Policy
            </h1>

            <div className="space-y-8 text-white/70 leading-relaxed">
                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
                    <p>
                        Welcome to Cinematic Voice AI ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                        This Privacy Policy describes how we collect, use, and share your personal information when you use our website and browser extension (collectively, the "Service").
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
                    <p className="mb-4">
                        We collect information that you provide directly to us when you create an account, subscribe to our services, or communicate with us.
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Account Information:</strong> When you sign up, we collect your email address and authentication details provided by third-party providers (e.g., Google, Discord).</li>
                        <li><strong>Usage Data:</strong> We collect anonymous data about how you use our extension, such as feature usage counts (e.g., number of characters voiced) to manage subscription limits.</li>
                        <li><strong>Payment Information:</strong> We do not store your payment information. All payments are processed by secure third-party payment processors (e.g., PayPal, Stripe).</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
                    <p>
                        We use the information we collect to:
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>Provide, maintain, and improve our Service.</li>
                        <li>Process transactions and manage your subscription.</li>
                        <li>Authenticate your identity and prevent fraud.</li>
                        <li>Monitor and analyze trends, usage, and activities in connection with our Service.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
                    <p>
                        We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.
                        All data is encrypted in transit and at rest using industry-standard security protocols.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">5. Third-Party Services</h2>
                    <p>
                        Our Service may utilize third-party AI voice generation providers (e.g., ElevenLabs, Unreal Speech).
                        When you generate audio, the text content is sent to these providers solely for the purpose of audio generation.
                        We do not retain the text content or the generated audio files on our servers.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">6. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy
                        and, in some cases, we may provide you with additional notice (such as adding a statement to our homepage or sending you a notification).
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">7. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at support@voicemybot.site.
                    </p>
                </section>

                <div className="pt-8 text-sm text-white/40 border-t border-white/10 mt-12">
                    Last updated: February 2026
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
