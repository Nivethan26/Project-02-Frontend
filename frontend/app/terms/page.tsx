"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ChevronRight,
  Mail,
  Phone,
  Shield,
  FileText,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function TermsPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      const scrollPosition = window.scrollY + 100;

      sections.forEach((section) => {
        const element = section as HTMLElement;
        if (
          scrollPosition >= element.offsetTop &&
          scrollPosition < element.offsetTop + element.offsetHeight
        ) {
          setActiveSection(element.id);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sections = [
    { id: "acceptance", title: "Acceptance of Terms", icon: FileText },
    { id: "eligibility", title: "User Eligibility & Registration", icon: Users },
    { id: "prescriptions", title: "Prescription & Medication Orders", icon: Shield },
    { id: "prohibited", title: "Prohibited Activities", icon: XCircle },
    { id: "privacy", title: "Data Privacy & Security", icon: Shield },
    { id: "intellectual", title: "Intellectual Property", icon: FileText },
    { id: "liability", title: "Limitation of Liability", icon: AlertTriangle },
    { id: "termination", title: "Termination of Access", icon: XCircle },
    { id: "changes", title: "Changes to Terms", icon: Clock },
    { id: "governing", title: "Governing Law", icon: Shield },
    { id: "contact", title: "Contact Information", icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="hidden lg:block w-80 sticky top-16 h-screen overflow-y-auto bg-white/50 backdrop-blur-sm border-r border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h3>
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                      activeSection === section.id
                        ? "bg-blue-100 text-blue-700 border-l-4 border-blue-600"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Links */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Related Documents</h4>
              <Link
                href="/privacy"
                className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>Privacy Policy</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div
              className={`transform transition-all duration-1000 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              {/* Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
                  Terms and Conditions
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
                  For S K Medicals Pharmacy Management System
                </p>
                <div className="mt-6 inline-flex items-center px-4 py-2 bg-blue-50 rounded-full">
                  <Clock className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-700">Effective Date: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-12">
                  <section id="acceptance" className="mb-12 scroll-mt-20">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">1. Acceptance of Terms</h2>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 border-blue-500">
                      <p className="text-gray-700 leading-relaxed">
                        By accessing or using the S K Medicals Pharmacy Management System , you agree
                        to comply with these Terms and Conditions , our Privacy Policy, and all applicable
                        laws. If you do not agree, you must not use the System.
                      </p>
                    </div>
                  </section>
                  <section id="eligibility" className="mb-12 scroll-mt-20">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                        2. User Eligibility & Account Registration
                      </h2>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          Healthcare Providers & Pharmacists
                        </h4>
                        <p className="text-gray-700">
                          Must have a valid professional license to use prescription-related features.
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                          Patients & Customers
                        </h4>
                        <p className="text-gray-700">Must be 18+ years old (or have parental consent).</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Additional Requirements:</h4>
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <ChevronRight className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">
                              You must provide accurate and up-to-date personal and medical information.
                            </span>
                          </li>
                          <li className="flex items-start">
                            <ChevronRight className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">
                              Immediately report unauthorized account access to [Your Contact Email].
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>
                  <section id="prescriptions" className="mb-12 scroll-mt-20">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                        <Shield className="w-5 h-5 text-purple-600" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                        3. Prescription & Medication Orders
                      </h2>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-purple-50 rounded-xl p-6 border-l-4 border-purple-500">
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">
                              Valid prescriptions are required for restricted medications.
                            </span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">
                              We verify prescriptions with prescribing doctors when necessary.
                            </span>
                          </li>
                          <li className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">
                              No refunds on dispensed prescription drugs (except for defects).
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>
                  <section id="prohibited" className="mb-12 scroll-mt-20">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">4. Prohibited Activities</h2>
                    </div>
                    <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                      <p className="text-gray-700 mb-4 font-semibold">You must NOT:</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          "Submit fake or altered prescriptions",
                          "Use the System for illegal resale of medications",
                          "Attempt to hack, disrupt, or reverse-engineer the software",
                          "Violate HIPAA, GDPR, or local pharmacy regulations",
                        ].map((item, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 border border-red-200">
                            <div className="flex items-start">
                              <XCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{item}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                  <section id="privacy" className="mb-12 scroll-mt-20">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                        <Shield className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">5. Data Privacy & Security</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-indigo-50 rounded-xl p-6 border-l-4 border-indigo-500">
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <Shield className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">
                              We comply with HIPAA (US) / GDPR (EU) / [Local Data Protection Law].
                            </span>
                          </li>
                          <li className="flex items-start">
                            <Shield className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">
                              Patient health records are confidential and accessed only by authorized personnel.
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-gray-700">
                          See our{" "}
                          <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-800 font-semibold">
                            Privacy Policy
                          </Link>{" "}
                          for details on data collection and usage.
                        </p>
                      </div>
                    </div>
                  </section>
                  <section id="intellectual" className="mb-12 scroll-mt-20">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                        <FileText className="w-5 h-5 text-orange-600" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">6. Intellectual Property</h2>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-6 border-l-4 border-orange-500">
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">
                            The software, database, and content are owned by S K Medicals.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <XCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">
                            Unauthorized copying, distribution, or modification is prohibited.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </section>
                  <section id="liability" className="mb-12 scroll-mt-20">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">7. Limitation of Liability</h2>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                      <p className="text-gray-700 mb-4">We do not guarantee uninterrupted or error-free service.</p>
                      <p className="text-gray-700 mb-4 font-semibold">We are not liable for:</p>
                      <ul className="space-y-2 mb-4">
                        {[
                          "Incorrect self-diagnosis or medication misuse",
                          "Third-party errors (e.g., shipping delays, payment failures)",
                          "Data breaches caused by user negligence",
                        ].map((item, index) => (
                          <li key={index} className="flex items-start">
                            <ChevronRight className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="bg-white rounded-lg p-4 border border-yellow-300">
                        <p className="text-gray-700 font-semibold">
                          Maximum liability = total fees paid in the last 6 months (if applicable).
                        </p>
                      </div>
                    </div>
                  </section>
                  <section id="termination" className="mb-12 scroll-mt-20">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">8. Termination of Access</h2>
                    </div>
                    <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                      <p className="text-gray-700 mb-4">We may suspend or terminate accounts for:</p>
                      <div className="space-y-3">
                        {["Violation of these Terms", "Suspected fraud or illegal activity"].map((item, index) => (
                          <div key={index} className="flex items-start bg-white rounded-lg p-3 border border-red-200">
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                              <span className="text-red-600 text-sm font-bold">🔴</span>
                            </div>
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                  <section id="changes" className="mb-12 scroll-mt-20">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">9. Changes to These Terms</h2>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <Clock className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">
                            We may update these Terms.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Continued use = acceptance of changes.</span>
                        </li>
                      </ul>
                    </div>
                  </section>
                  <section id="governing" className="mb-12 scroll-mt-20">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                        <Shield className="w-5 h-5 text-gray-600" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                        10. Governing Law & Dispute Resolution
                      </h2>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <Shield className="w-5 h-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Governed by the laws of SriLanka.</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">
                            Disputes will first attempt mediation; unresolved issues may proceed to court.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </section>
                  <section id="contact" className="mb-8 scroll-mt-20">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <Mail className="w-5 h-5 text-green-600" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">11. Contact Information</h2>
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">For questions or concerns:</p>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center mb-3">
                          <Mail className="w-5 h-5 text-blue-600 mr-3" />
                          <span className="font-semibold text-gray-900">Email</span>
                        </div>
                        <p className="text-gray-700">skmedicals@info.com</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center mb-3">
                          <Phone className="w-5 h-5 text-green-600 mr-3" />
                          <span className="font-semibold text-gray-900">Phone</span>
                        </div>
                        <p className="text-gray-700">076 963 2748</p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-center mb-3">
                          <MapPin className="w-5 h-5 text-purple-600 mr-3" />
                          <span className="font-semibold text-gray-900">Address</span>
                        </div>
                        <p className="text-gray-700">Semnthankulam Road, Ilavalai, Jaffna.</p>
                      </div>
                    </div>
                  </section>
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 border-t border-gray-200">
                    <Link
                      href="/privacy"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <Shield className="w-5 h-5 mr-2" />
                      <span>View Privacy Policy</span>
                    </Link>
                    <Link
                      href="/"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <span>Back to Home</span>
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 