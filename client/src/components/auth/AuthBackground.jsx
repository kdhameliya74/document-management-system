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
    <div className="absolute inset-0 z-0 overflow-hidden bg-bg-main">
      {/* Abstract Gradients */}
      <div className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] bg-linear-to-br from-primary/10 to-secondary/10 rounded-full blur-[100px]"></div>
      <div className="absolute -bottom-[10%] -left-[10%] w-[600px] h-[600px] bg-linear-to-br from-secondary/10 to-purple-500/10 rounded-full blur-[120px]"></div>

      {/* Floating Document Icons */}
      <FloatingIcon Icon={FileText} delay={0} x="10%" y="20%" size={64} color="text-primary/20" />
      <FloatingIcon Icon={Folder} delay={1} x="80%" y="15%" size={80} color="text-secondary/20" />
      <FloatingIcon Icon={Image} delay={2} x="15%" y="70%" size={56} color="text-purple-500/20" />
      <FloatingIcon Icon={File} delay={1.5} x="70%" y="60%" size={72} color="text-sky-500/20" />
      <FloatingIcon
        Icon={Database}
        delay={0.5}
        x="85%"
        y="80%"
        size={48}
        color="text-emerald-500/20"
      />
      <FloatingIcon Icon={Cloud} delay={2.5} x="40%" y="10%" size={96} color="text-primary/20" />

      {/* Additional scattered small icons */}
      <FloatingIcon
        Icon={FileText}
        delay={3}
        x="30%"
        y="85%"
        size={32}
        color="text-text-muted/10"
      />
      <FloatingIcon
        Icon={Folder}
        delay={1.2}
        x="60%"
        y="30%"
        size={40}
        color="text-text-muted/10"
      />
      <FloatingIcon Icon={File} delay={4} x="50%" y="50%" size={48} color="text-primary/10" />
      <FloatingIcon Icon={Image} delay={2.2} x="5%" y="40%" size={36} color="text-secondary/10" />
    </div>
  );
};

export default AuthBackground;
