import { motion } from "framer-motion";
import { FileText, Folder, Image, File, Database, Cloud } from "lucide-react";

// eslint-disable-next-line no-unused-vars
const FloatingIcon = ({ Icon, delay, x, y, size, color }) => (
  <motion.div
    className={`absolute ${color}`}
    style={{ left: x, top: y }}
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{
      y: [-15, 15, -15],
      opacity: [0.1, 0.25, 0.1],
      rotate: [0, 10, -10, 0],
      scale: [1, 1.05, 1],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut",
    }}
  >
    <Icon size={size} />
  </motion.div>
);

const AuthBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#09090b]">
      {/* Abstract Gradients - More Vibrant and Layered */}
      <div className="absolute -top-[15%] -right-[15%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] animate-pulse duration-[10s]"></div>
      <div className="absolute -bottom-[20%] -left-[15%] w-[900px] h-[900px] bg-primary/10 rounded-full blur-[180px] animate-pulse duration-[15s]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[200px]"></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* Floating Document Icons - More Subtle and Refined */}
      <FloatingIcon Icon={FileText} delay={0} x="12%" y="18%" size={56} color="text-primary/10" />
      <FloatingIcon
        Icon={Folder}
        delay={1.2}
        x="85%"
        y="12%"
        size={72}
        color="text-indigo-400/10"
      />
      <FloatingIcon Icon={Image} delay={2.5} x="18%" y="75%" size={48} color="text-purple-400/10" />
      <FloatingIcon Icon={File} delay={1.8} x="75%" y="65%" size={64} color="text-sky-400/10" />
      <FloatingIcon
        Icon={Database}
        delay={0.8}
        x="88%"
        y="85%"
        size={42}
        color="text-emerald-400/10"
      />
      <FloatingIcon Icon={Cloud} delay={3} x="45%" y="12%" size={88} color="text-primary/10" />

      {/* Scattered micro-points */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

export default AuthBackground;
