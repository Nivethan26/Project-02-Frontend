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
  Database,
  Eye,
  Lock,
  Cookie,
  MapPin,
  CheckCircle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PrivacyPolicyPage() {
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
    { id: "introduction", title: "Introduction", icon: FileText },
    { id: "information", title: "Information We Collect", icon: Database },
    { id: "usage", title: "How We Use Your Information", icon: Eye },
    { id: "sharing", title: "How We Share Your Information", icon: Users },
    { id: "security", title: "Data Security & Retention", icon: Lock },
    { id: "cookies", title: "Cookies & Tracking", icon: Cookie },
    { id: "rights", title: "Your Rights", icon: Shield },
    { id: "changes", title: "Changes to This Policy", icon: Clock },
    { id: "contact", title: "Contact Us", icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
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
                        ? "bg-purple-100 text-purple-700 border-l-4 border-purple-600"
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
                href="/terms"
                className="flex items-center space-x-2 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Terms & Conditions</span>
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
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-800 bg-clip-text text-transparent mb-4">
                  Privacy Policy
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
                  For S K Medicals Pharmacy Management System
                </p>
                <div className="mt-6 inline-flex items-center px-4 py-2 bg-purple-50 rounded-full">
                  <Clock className="w-4 h-4 text-purple-600 mr-2" />
                  <span className="text-sm text-purple-700">Effective Date: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-12">
                  <section id="introduction" className="mb-12 scroll-mt-20">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">1. Introduction</h2>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-l-4 border-purple-500">
                      <p className="text-gray-700 leading-relaxed">
                        This Privacy Policy explains how S K Medicals collects, uses,
                        discloses, and protects your personal and health information when you use our Pharmacy Management System. By accessing or using the System, you consent to the practices described in this policy.
                      </p>
                    </div>
                  </section>
                  <section id="information" className="mb-12 scroll-mt-20">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <Database className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">2. Information We Collect</h2>
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">We collect the following types of information:</p>

                    <div className="space-y-6">
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <Users className="w-5 h-5 text-blue-600 mr-2" />
                          A. Personal Information
                        </h4>
                        <ul className="space-y-2">
                          {[
                            "Name, contact details (address, phone, email)",
                            "Payment information",
                          ].map((item, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-4 h-4 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <Shield className="w-5 h-5 text-green-600 mr-2" />
                          B. Health Information
                        </h4>
                        <ul className="space-y-2">
                          {[
                            "Prescription details (medication name, dosage, refills)",
                            "Medical history, allergies, and conditions (if provided)",
                            "Doctor's name and contact information",
                          ].map((item, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-3 mt-1 flex-shrink-0" />
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <Database className="w-5 h-5 text-orange-600 mr-2" />
                          C. Technical & Usage Data
                        </h4>
                        <ul className="space-y-2">
                          {[
                            "IP address, device type, browser information",
                            "System login times, activity logs",
                            "Cookies and analytics data",
                          ].map((item, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-4 h-4 text-orange-600 mr-3 mt-1 flex-shrink-0" />
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </section>
                  <section id="usage" className="mb-12 scroll-mt-20">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <Eye className="w-5 h-5 text-green-600" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">3. How We Use Your Information</h2>
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">We use your data for:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        "Processing prescriptions and medication orders",
                        "Verifying identities and preventing fraud",
                        "Billing processing",
                        "Improving System functionality and user experience",
                        "Complying with legal obligations (e.g., FDA, HIPAA, GDPR)",
                      ].map((item, index) => (
                        <div key={index} className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section id="sharing" className="mb-12 scroll-mt-20">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                        <Users className="w-5 h-5 text-red-600" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">4. How We Share Your Information</h2>
                    </div>
                    <div className="bg-red-50 rounded-xl p-6 border border-red-200 mb-6">
                      <p className="text-gray-700 font-semibold">
                        We do not sell your personal/health data. We may share it only with:
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-3">A. Healthcare Providers</h4>
                        <p className="text-gray-700">Doctors, pharmacists, and labs involved in your care</p>
                      </div>

                      <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                        <h4 className="font-semibold text-gray-900 mb-3">B. Third-Party Service Providers</h4>
                        <ul className="space-y-2">
                          {[
                            "Payment processors (PayHere)",
                            "Shipping carriers",
                            "IT/cloud storage providers (AWS, Google Cloud)",
                          ].map((item, index) => (
                            <li key={index} className="flex items-start">
                              <ChevronRight className="w-4 h-4 text-purple-600 mr-3 mt-1 flex-shrink-0" />
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                        <h4 className="font-semibold text-gray-900 mb-3">C. Legal & Regulatory Disclosures</h4>
                        <ul className="space-y-2">
                          {[
                            "If required by law (e.g., public health emergencies)",
                            "To prevent illegal activities (e.g., prescription fraud)",
                          ].map((item, index) => (
                            <li key={index} className="flex items-start">
                              <ChevronRight className="w-4 h-4 text-orange-600 mr-3 mt-1 flex-shrink-0" />
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </section>
                  <section id="security" className="mb-12 scroll-mt-20">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                        <Lock className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">5. Data Security & Retention</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
                        <div className="flex items-center mb-3">
                          <Lock className="w-5 h-5 text-indigo-600 mr-2" />
                          <h4 className="font-semibold text-gray-900">Encryption</h4>
                        </div>
                        <p className="text-gray-700">All sensitive data is encrypted (HIPAA/GDPR compliant).</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center mb-3">
                          <Shield className="w-5 h-5 text-green-600 mr-2" />
                          <h4 className="font-semibold text-gray-900">Access Controls</h4>
                        </div>
                        <p className="text-gray-700">Only authorized staff can view health records.</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center mb-3">
                          <Clock className="w-5 h-5 text-blue-600 mr-2" />
                          <h4 className="font-semibold text-gray-900">Retention Period</h4>
                        </div>
                        <p className="text-gray-700">We retain records as required by law (typically 5–10 years).</p>
                      </div>
                    </div>
                  </section>
                  <section id="cookies" className="mb-12 scroll-mt-20">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                        <Cookie className="w-5 h-5 text-yellow-600" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                        6. Cookies & Tracking Technologies
                      </h2>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-yellow-50 rounded-xl p-6 border-l-4 border-yellow-500">
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">We use essential cookies for System functionality.</span>
                          </li>
                          <li className="flex items-start">
                            <Eye className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">
                              Analytics cookies help improve performance (you can opt out).
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>
                  <section id="rights" className="mb-12 scroll-mt-20">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                        <Shield className="w-5 h-5 text-purple-600" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">7. Your Rights</h2>
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">Depending on your location, you may:</p>
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      {[
                        "Access, correct, or delete your personal data",
                        "Request a copy of your health records",
                        "Opt out of marketing communications",
                        "File a complaint if you believe your privacy was violated",
                      ].map((item, index) => (
                        <div key={index} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <div className="flex items-start">
                            <Shield className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-gray-700">
                        To exercise these rights, contact us at{" "}
                        <span className="font-semibold">skmedicals@info.com / 076 963 2748</span>.
                      </p>
                    </div>
                  </section>
                  <section id="changes" className="mb-12 scroll-mt-20">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">8. Changes to This Policy</h2>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
                      <p className="text-gray-700 leading-relaxed">
                        We may update this policy periodically. Changes will be posted on our website/System dashboard
                        with the new effective date.
                      </p>
                    </div>
                  </section>
                  <section id="contact" className="mb-8 scroll-mt-20">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <Mail className="w-5 h-5 text-green-600" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">9. Contact Us</h2>
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">For privacy-related questions or requests:</p>
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
                      href="/terms"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      <span>View Terms & Conditions</span>
                    </Link>
                    <Link
                      href="/"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
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