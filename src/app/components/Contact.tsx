import { motion, AnimatePresence } from "motion/react";
import { Mail, Github, Linkedin, Twitter, Send, MapPin, Phone } from "lucide-react";
import { useState } from "react";

const socialLinks = [
  { icon: Github, label: "GitHub", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" }
];

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [focused, setFocused] = useState({
    name: false,
    email: false,
    message: false
  });

  const handleFocus = (field: keyof typeof focused) => {
    setFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: keyof typeof focused) => {
    setFocused(prev => ({ ...prev, [field]: false }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isFocused = (field: keyof typeof focused) => {
    return focused[field] || formData[field as keyof typeof formData].length > 0;
  };

  return (
    <section id="contact" className="relative min-h-screen flex items-center justify-center overflow-hidden py-32 px-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 45, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 -right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -45, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 -left-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Left side - Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-4xl md:text-5xl mb-6 text-white/90 tracking-tight font-bold">
              Let's connect
            </h2>
            <p className="text-gray-400/70 leading-relaxed mb-12 text-lg">
              I'm always open to discussing new projects, creative ideas, or opportunities to collaborate.
            </p>

            {/* Contact Info */}
            <div className="space-y-6 mb-12">
              <motion.a
                href="mailto:gokul.a@example.com"
                whileHover={{ x: 5 }}
                className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.08] hover:border-blue-400/30 rounded-xl transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-white/90">gokul.a@example.com</p>
                </div>
              </motion.a>

              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.08] hover:border-blue-400/30 rounded-xl transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Location</p>
                  <p className="text-white/90">India</p>
                </div>
              </motion.div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    whileHover={{ y: -3, scale: 1.05 }}
                    className="p-3 bg-white/[0.02] border border-white/[0.08] hover:border-blue-400/30 rounded-xl transition-all duration-300 text-gray-400 hover:text-blue-200"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Right side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <form className="space-y-6">
              {/* Name Field */}
              <div className="relative">
                <motion.input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => handleFocus('name')}
                  onBlur={() => handleBlur('name')}
                  className="w-full px-5 py-4 bg-white/[0.02] border border-white/[0.08] focus:border-blue-400/50 rounded-xl text-white outline-none transition-all duration-300"
                  placeholder=" "
                />
                <motion.label
                  animate={{
                    y: isFocused('name') ? -28 : 0,
                    scale: isFocused('name') ? 0.85 : 1,
                  }}
                  className="absolute left-5 top-4 text-gray-500 pointer-events-none transition-all duration-300"
                >
                  Your Name
                </motion.label>
              </div>

              {/* Email Field */}
              <div className="relative">
                <motion.input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                  className="w-full px-5 py-4 bg-white/[0.02] border border-white/[0.08] focus:border-blue-400/50 rounded-xl text-white outline-none transition-all duration-300"
                  placeholder=" "
                />
                <motion.label
                  animate={{
                    y: isFocused('email') ? -28 : 0,
                    scale: isFocused('email') ? 0.85 : 1,
                  }}
                  className="absolute left-5 top-4 text-gray-500 pointer-events-none transition-all duration-300"
                >
                  Your Email
                </motion.label>
              </div>

              {/* Message Field */}
              <div className="relative">
                <motion.textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => handleFocus('message')}
                  onBlur={() => handleBlur('message')}
                  rows={5}
                  className="w-full px-5 py-4 bg-white/[0.02] border border-white/[0.08] focus:border-blue-400/50 rounded-xl text-white outline-none transition-all duration-300 resize-none"
                  placeholder=" "
                />
                <motion.label
                  animate={{
                    y: isFocused('message') ? -28 : 0,
                    scale: isFocused('message') ? 0.85 : 1,
                  }}
                  className="absolute left-5 top-4 text-gray-500 pointer-events-none transition-all duration-300"
                >
                  Your Message
                </motion.label>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600/50 to-purple-600/50 hover:from-blue-500/60 hover:to-purple-500/60 border border-blue-400/30 rounded-xl text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <Send className="w-4 h-4" />
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-20 text-gray-600 text-sm"
        >
          <p>© 2026 Gokul. A</p>
        </motion.div>
      </div>
    </section>
  );
}
