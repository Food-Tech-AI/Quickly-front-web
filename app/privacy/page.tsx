import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FDF9F2' }}>
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold mb-2 text-[#2D2D2D]">Privacy Policy for Wajed</h1>
            <p className="text-sm text-gray-600 mb-8">
              <strong>Last Updated:</strong> {currentDate}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#2D2D2D]">Introduction</h2>
              <p className="text-[#2D2D2D] leading-relaxed mb-4">
                Wajed ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#2D2D2D]">Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-3 text-[#2D2D2D]">Personal Information</h3>
              <p className="text-[#2D2D2D] leading-relaxed mb-4">
                When you register for an account, we collect:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-[#2D2D2D]">
                <li>Email address</li>
                <li>Name</li>
                <li>Profile information</li>
                <li>Authentication credentials (securely stored)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-[#2D2D2D]">Usage Data</h3>
              <p className="text-[#2D2D2D] leading-relaxed mb-4">
                We automatically collect:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-[#2D2D2D]">
                <li>Recipes you view, save, and create</li>
                <li>Meal plans you create</li>
                <li>Grocery lists</li>
                <li>App usage statistics and preferences</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-[#2D2D2D]">Photos and Camera</h3>
              <p className="text-[#2D2D2D] leading-relaxed mb-4">
                With your permission, we access:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-[#2D2D2D]">
                <li>Camera to take photos of recipes and ingredients</li>
                <li>Photo library to select and upload recipe images</li>
                <li>All images are securely stored on our servers</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#2D2D2D]">How We Use Your Information</h2>
              <p className="text-[#2D2D2D] leading-relaxed mb-4">
                We use your information to:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-[#2D2D2D]">
                <li>Provide and maintain the Wajed service</li>
                <li>Create and manage your account</li>
                <li>Enable meal planning and recipe discovery features</li>
                <li>Store your recipes, meal plans, and grocery lists</li>
                <li>Improve our AI recommendations</li>
                <li>Send you updates and notifications (with your consent)</li>
                <li>Provide customer support</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#2D2D2D]">Data Storage and Security</h2>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-[#2D2D2D]">
                <li>Your data is stored on secure cloud servers (AWS)</li>
                <li>We use industry-standard encryption for data transmission</li>
                <li>Images are stored securely on AWS S3</li>
                <li>Authentication is handled securely via OAuth 2.0 for third-party logins</li>
                <li>We implement appropriate technical and organizational measures to protect your data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#2D2D2D]">Third-Party Services</h2>
              <p className="text-[#2D2D2D] leading-relaxed mb-4">
                We use the following third-party services:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-[#2D2D2D]">
                <li><strong>Google Sign-In</strong>: For authentication (optional)</li>
                <li><strong>AWS S3</strong>: For image storage</li>
                <li><strong>Backend API</strong>: For data processing and storage</li>
              </ul>
              <p className="text-[#2D2D2D] leading-relaxed">
                These services have their own privacy policies governing their use of your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#2D2D2D]">Your Rights</h2>
              <p className="text-[#2D2D2D] leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-[#2D2D2D]">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your account and data</li>
                <li>Opt-out of promotional communications</li>
                <li>Export your data</li>
              </ul>
              <p className="text-[#2D2D2D] leading-relaxed">
                To exercise these rights, contact us at [your-email@example.com]
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#2D2D2D]">Data Retention</h2>
              <p className="text-[#2D2D2D] leading-relaxed mb-4">
                We retain your data:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-[#2D2D2D]">
                <li>As long as your account is active</li>
                <li>As necessary to provide our services</li>
                <li>As required by law</li>
              </ul>
              <p className="text-[#2D2D2D] leading-relaxed">
                When you delete your account, we will delete your personal data within 30 days, except where we are required to retain it by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#2D2D2D]">Children's Privacy</h2>
              <p className="text-[#2D2D2D] leading-relaxed">
                Wajed is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#2D2D2D]">International Data Transfers</h2>
              <p className="text-[#2D2D2D] leading-relaxed">
                Your information may be transferred to and stored on servers located outside of your country. We ensure appropriate safeguards are in place for such transfers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#2D2D2D]">Changes to This Privacy Policy</h2>
              <p className="text-[#2D2D2D] leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-[#2D2D2D]">
                <li>Posting the new Privacy Policy in the app</li>
                <li>Updating the "Last Updated" date</li>
                <li>Sending you an email notification (for material changes)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#2D2D2D]">Contact Us</h2>
              <p className="text-[#2D2D2D] leading-relaxed mb-4">
                If you have questions about this Privacy Policy, please contact us:
              </p>
              <ul className="list-none space-y-2 text-[#2D2D2D]">
                <li><strong>Email</strong>: [your-email@example.com]</li>
                <li><strong>Website</strong>: [your-website.com]</li>
                <li><strong>Support</strong>: [your-website.com/support]</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#2D2D2D]">Consent</h2>
              <p className="text-[#2D2D2D] leading-relaxed">
                By using Wajed, you consent to this Privacy Policy and agree to its terms.
              </p>
            </section>

            <hr className="my-8 border-gray-300" />

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#2D2D2D]">Data Collection Summary (for App Store Connect)</h2>
              
              <h3 className="text-xl font-semibold mb-3 text-[#2D2D2D]">Data Types Collected:</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-[#2D2D2D]">
                <li>Contact Information (Email, Name)</li>
                <li>User Content (Recipes, Meal Plans, Photos)</li>
                <li>Usage Data (App interactions, preferences)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-[#2D2D2D]">Data Uses:</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-[#2D2D2D]">
                <li>App Functionality</li>
                <li>Product Personalization</li>
                <li>Analytics</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-[#2D2D2D]">Data Linked to User:</h3>
              <p className="text-[#2D2D2D] leading-relaxed mb-4">
                Yes - All data is linked to your account
              </p>

              <h3 className="text-xl font-semibold mb-3 text-[#2D2D2D]">Data Tracking:</h3>
              <p className="text-[#2D2D2D] leading-relaxed mb-4">
                We do not track you across other companies' apps or websites
              </p>

              <h3 className="text-xl font-semibold mb-3 text-[#2D2D2D]">Camera/Photo Library:</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-[#2D2D2D]">
                <li>Used only for recipe image capture and upload</li>
                <li>Images are stored in your account</li>
                <li>You can delete images at any time</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}







