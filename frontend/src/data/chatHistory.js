export const CHAT_HISTORY = [
  {
    role: "ai",
    content:
      "Hello! I'm your AI learning assistant. I've analyzed **Deep Learning** by Goodfellow et al. Ask me anything — from explaining concepts to generating practice questions. 🚀",
  },
  {
    role: "user",
    content: "Explain backpropagation like I'm 5 years old",
  },
  {
    role: "ai",
    content:
      "Great question! Imagine you're learning to throw darts 🎯\n\n**Forward pass**: You throw the dart (make a guess). It misses.\n\n**The error**: You see how far off you were — too high, too right.\n\n**Backpropagation**: You work backwards through your arm movement to figure out *which muscle* caused the miss. Then you adjust each muscle a tiny bit.\n\n**Gradient Descent**: After thousands of throws, each adjustment is so small (learning rate) that you get better without overcompensating.\n\nIn neural networks, the 'muscles' are weights, and 'how wrong you were' is the loss function. The chain rule lets us mathematically trace blame back through every layer.\n\n*Source: Chapter 6, pages 200-214*",
  },
];

export const CHAT_RESPONSES = {
  "Explain Chapter 4 simply":
    "Chapter 4 covers **Numerical Computation** — the practical math that makes neural networks work on real computers.\n\n🔢 **Key ideas:**\n- **Overflow/Underflow**: How computers lose precision with very large or small numbers. Softmax is carefully designed to avoid this.\n- **Poor Conditioning**: When tiny input changes cause huge output changes — like dividing by near-zero.\n- **Gradient-Based Optimization**: Finding the lowest point of our loss function by following the slope downhill.\n\n*Source: Pages 78-103, Chapter 4*",
};
