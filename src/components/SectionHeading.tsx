import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion';

interface SectionHeadingProps {
  title: string;
  description: string;
}

// Centered title + description block used at the top of the Projects and Skills sections.
const SectionHeading = ({ title, description }: SectionHeadingProps) => (
  <motion.div {...fadeInUp()} className="text-center mb-16">
    <h2 className="text-3xl md:text-4xl font-bold text-gradient-vibrant mb-4">{title}</h2>
    <p className="text-lg text-white/90 dark:text-blue-50 max-w-2xl mx-auto">{description}</p>
  </motion.div>
);

export default SectionHeading;
