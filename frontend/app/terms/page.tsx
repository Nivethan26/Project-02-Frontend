"use client";
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
            
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-600 mb-4">
                  Welcome to our Pharmacy Management System. These terms and conditions outline the rules and regulations for the use of our service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Account Registration</h2>
                <p className="text-gray-600 mb-4">
                  To use our service, you must register for an account. You agree to provide accurate and complete information during the registration process.
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>You must be at least 18 years old to register</li>
                  <li>You are responsible for maintaining the security of your account</li>
                  <li>You must notify us immediately of any unauthorized access</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Privacy Policy</h2>
                <p className="text-gray-600 mb-4">
                  Your use of our service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Medical Information</h2>
                <p className="text-gray-600 mb-4">
                  The information provided through our service is for general informational purposes only and is not intended to be a substitute for professional medical advice.
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Always consult with a healthcare professional before taking any medication</li>
                  <li>Do not disregard professional medical advice</li>
                  <li>Seek immediate medical attention for medical emergencies</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Prescription Requirements</h2>
                <p className="text-gray-600 mb-4">
                  Some medications require a valid prescription from a licensed healthcare provider. You agree to provide valid prescriptions when required.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. User Responsibilities</h2>
                <p className="text-gray-600 mb-4">
                  As a user of our service, you agree to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account</li>
                  <li>Use the service in compliance with all applicable laws</li>
                  <li>Not misuse or abuse the service</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
                <p className="text-gray-600 mb-4">
                  We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to Terms</h2>
                <p className="text-gray-600 mb-4">
                  We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about these Terms and Conditions, please contact us at:
                </p>
                <p className="text-gray-600">
                  Email: support@pharmacy.com<br />
                  Phone: (555) 123-4567
                </p>
              </section>
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                href="/register"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Registration
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 