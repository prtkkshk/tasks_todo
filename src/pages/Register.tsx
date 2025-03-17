
import AuthForm from "@/components/auth/AuthForm";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";

const Register = () => {
  return (
    <Layout requireAuth={false}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="w-full max-w-md p-6 bg-card rounded-xl shadow-lg border border-border">
          <AuthForm type="register" />
        </div>
      </motion.div>
    </Layout>
  );
};

export default Register;
