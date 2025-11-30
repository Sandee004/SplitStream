import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Splash = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white relative overflow-hidden grid-bg-pattern grid-animate-scroll">
      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl"
        >
          {/* Logo Mark */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 flex justify-center"
          >
            <div className="w-20 h-20 border-[3px] border-[#064e3b] outline-none flex items-center justify-center bg-white rounded-xl shadow-sm">
              <Zap
                className="w-10 h-10 text-[#96e810] fill-[#96e810]"
                strokeWidth={0}
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold tracking-tight mb-6"
          >
            <span className="text-[#064e3b]">Split</span>
            <span className="text-[#96e810]">Stream</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg md:text-2xl text-[#064e3b]/80 mb-4 font-normal"
          >
            Programmable Revenue & Automated Collaboration
          </motion.p>

          {/* Tech Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="font-mono text-sm text-[#064e3b]/40 mb-12 tracking-[0.2em] uppercase"
          >
            [ REVENUE_PROTOCOL_v1.0 ]
          </motion.div>

          {/* CTA Button with enhanced animation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <motion.button
              onClick={() => navigate("/setup")}
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className="group relative inline-flex items-center gap-3 bg-[#a3e635] hover:bg-[#bef264] text-[#064e3b] font-bold text-lg px-10 py-5 rounded-lg transition-all duration-200 shadow-[0_0_40px_-10px_rgba(163,230,53,0.6)]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-20 text-xs text-[#064e3b]/50 font-mono tracking-wide"
          >
            Split payments automatically • No intermediaries • Instant
            settlement
          </motion.p>
        </motion.div>
      </div>

      {/* Corner Decorations - Thicker Borders + Fade-in */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 0.7 }}
        className="absolute top-10 left-10 w-10 h-10 border-l-[10px] border-t-[10px] border-[#064e3b]"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="absolute top-10 right-10 w-10 h-10 border-r-[6px] border-t-[6px] border-[#064e3b]"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="absolute bottom-10 left-10 w-10 h-10 border-l-[6px] border-b-[6px] border-[#064e3b]"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="absolute bottom-10 right-10 w-10 h-10 border-r-[6px] border-b-[6px] border-[#064e3b]"
      />
    </div>
  );
};

export default Splash;
