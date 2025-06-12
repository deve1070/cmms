import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Welcome: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-purple-700 to-indigo-800 flex flex-col justify-center items-center p-4 sm:p-8 relative overflow-hidden">
      <div 
        className="absolute inset-0 z-0 opacity-10 animate-background-pattern" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zm0 18v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zm0 18v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM54 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zm0 18v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM0 60h58v-2H0zm0-4h58v-2H0zm0-4h58v-2H0zm0-4h58v-2H0zm0-4h58v-2H0zm0-4h58v-2H0zm0-4h58v-2H0zm0-4h58v-2H0zm0-4h58v-2H0zm0-4h58v-2H0zm0-4h58v-2H0zm0-4h58v-2H0zm0-4h58v-2H0zm0-4h58v-2H0zM24 2c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm0 18c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm0 18c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm0 18c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm24 0c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm0-18c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm0-18c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm0-18c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zM0 2c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm0 18c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm0 18c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm0 18c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2z'%3E%3C/path%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <motion.div
        animate={{
          y: [0, -40, 0],
          rotate: [0, 8, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-10 left-10 w-48 h-48 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-60"
      />
      <motion.div
        animate={{
          y: [0, 40, 0],
          rotate: [0, -8, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-10 right-10 w-56 h-56 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-60"
      />
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, 30, 0],
          rotate: [0, 6, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-40 h-40 bg-indigo-400 rounded-full mix-blend-multiply filter blur-2xl opacity-60"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          x: [0, -20, 0],
          rotate: [0, -4, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-teal-400 rounded-full mix-blend-multiply filter blur-2xl opacity-60"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-3xl w-full p-12 bg-white/85 backdrop-blur-xl rounded-3xl shadow-3xl z-10 text-center border border-white/30 relative overflow-hidden transform transition-all duration-300 hover:scale-[1.02]"
      >
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-400/40 to-purple-400/40 rounded-full filter blur-3xl"
        />
        <motion.div 
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-indigo-400/40 to-purple-400/40 rounded-full filter blur-3xl"
        />

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-6xl md:text-8xl font-extrabold text-gray-900 leading-tight mb-8 tracking-tighter drop-shadow-lg"
        >
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 animate-gradient-x">
            CMMS
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-xl md:text-2xl text-gray-700 font-medium mb-16 leading-relaxed max-w-lg mx-auto"
        >
          Your advanced Computerized Maintenance Management System for seamless operations.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        >
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-12 py-6 border border-transparent text-2xl font-bold rounded-full shadow-xl text-white bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-500 ease-in-out transform hover:-translate-y-2 hover:scale-110 group relative overflow-hidden bg-[length:200%_auto] hover:bg-[position:right_center]"
          >
            <span className="relative z-10">Get Started</span>
            <motion.svg
              animate={{
                x: [0, 8, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="ml-5 -mr-2 w-8 h-8 transform group-hover:translate-x-2 transition duration-500 ease-in-out relative z-10" 
              fill="currentColor" 
              viewBox="0 0 20 20" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </motion.svg>
            <motion.div 
              initial={{ width: 0, opacity: 0.5 }}
              whileHover={{ width: "100%", opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-indigo-500/30"
            />
          </Link>
        </motion.div>
      </motion.div>

      <section className="w-full max-w-7xl mt-20 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-5xl md:text-6xl font-extrabold mb-16 drop-shadow-lg text-white"
        >
          Discover Powerful Features
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-white/15 backdrop-blur-md p-8 rounded-3xl border border-white/25 shadow-2xl flex flex-col items-center text-center transform transition-all duration-300 hover:scale-[1.05] hover:bg-white/20"
          >
            <div className="text-6xl text-blue-300 mb-6">⚙️</div>
            <h3 className="text-3xl font-bold mb-4 text-white">Advanced Asset Tracking</h3>
            <p className="text-white/90 text-lg">Keep a detailed history of all your assets, their maintenance schedules, and performance metrics.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white/15 backdrop-blur-md p-8 rounded-3xl border border-white/25 shadow-2xl flex flex-col items-center text-center transform transition-all duration-300 hover:scale-[1.05] hover:bg-white/20"
          >
            <div className="text-6xl text-purple-300 mb-6">📊</div>
            <h3 className="text-3xl font-bold mb-4 text-white">Intelligent Analytics & Reporting</h3>
            <p className="text-white/90 text-lg">Gain actionable insights with comprehensive reports and data visualization tools.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="bg-white/15 backdrop-blur-md p-8 rounded-3xl border border-white/25 shadow-2xl flex flex-col items-center text-center transform transition-all duration-300 hover:scale-[1.05] hover:bg-white/20"
          >
            <div className="text-6xl text-indigo-300 mb-6">🛠️</div>
            <h3 className="text-3xl font-bold mb-4 text-white">Streamlined Work Orders</h3>
            <p className="text-white/90 text-lg">Automate and manage work orders from creation to completion, ensuring timely maintenance.</p>
          </motion.div>
        </div>
      </section>

      <footer className="w-full max-w-5xl mt-20 pb-10 text-center text-white text-md opacity-80 z-10">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          &copy; {new Date().getFullYear()} CMMS. All rights reserved.
        </motion.p>
      </footer>
    </div>
  );
};

export default Welcome;