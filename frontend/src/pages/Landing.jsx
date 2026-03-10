import { useState } from "react";
import { authAPI } from "../api/api";

const FEATURES = [
  {
    icon: "🧠",
    title: "Ask-The-Book AI",
    desc: "RAG-powered chatbot answers questions using the actual content of your uploaded books.",
    accent: "var(--cyan)",
  },
  {
    icon: "⚡",
    title: "AI Summarization",
    desc: "Generate summaries, key points, important concepts, and exam questions automatically.",
    accent: "var(--amber)",
  },
  {
    icon: "🔮",
    title: "Semantic Search",
    desc: "Search by concept, not keyword. FAISS vector similarity finds what you actually mean.",
    accent: "var(--violet)",
  },
  {
    icon: "🎯",
    title: "Career Roadmaps",
    desc: "Select your goal. Get a personalized, book-backed study path from novice to expert.",
    accent: "var(--emerald)",
  },
  {
    icon: "✨",
    title: "Smart Recommendations",
    desc: "AI learns your interests, reading habits, and career goals to surface the right books.",
    accent: "#ff6b6b",
  },
  {
    icon: "📈",
    title: "Learning Analytics",
    desc: "Track reading time, concept coverage, streak data, and your growth trajectory.",
    accent: "var(--amber)",
  },
];

const HERO_STATS = [
  ["10K+", "Books Processed"],
  ["2M+", "AI Queries Answered"],
  ["98%", "User Satisfaction"],
  ["< 2s", "Avg Response Time"],
];

export default function Landing({ onEnterApp }) {

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [name,setName]=useState("");
  const [mode,setMode]=useState("login");
  const [loading,setLoading]=useState(false);
  const [showAuth,setShowAuth]=useState(false);

  const handleAuth = async () => {
    try{
      setLoading(true);

      if(mode==="login"){
        await authAPI.login({email,password});
      }else{
        await authAPI.register({
          name,
          email,
          password,
          career_goal:"general"
        });
      }

      onEnterApp();

    }catch(err){
      alert(err.message);
    }finally{
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:"100vh",background:"var(--void)",position:"relative"}}>

      <div className="grid-overlay"/>

      {/* NAVBAR */}
      <div className="landing-nav">

        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div className="logo-icon">⬡</div>
          <span style={{fontWeight:800,fontSize:18}}>
            Knowledge<span style={{color:"var(--cyan)"}}>AI</span>
          </span>
        </div>

        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span className="badge badge-emerald">🟢 System Online</span>

          <button
            className="btn-ghost"
            onClick={()=>setShowAuth(true)}
          >
            Log In
          </button>

        </div>
      </div>


      {/* AUTH MODAL */}
      {showAuth && (

        <div className="glass"
          style={{
            position:"fixed",
            top:"50%",
            left:"50%",
            transform:"translate(-50%,-50%)",
            width:340,
            padding:30,
            zIndex:10
          }}
        >

          <h3 style={{marginBottom:20}}>
            {mode==="login" ? "Login" : "Create Account"}
          </h3>

          {mode==="register" && (
            <input
              placeholder="Name"
              value={name}
              onChange={(e)=>setName(e.target.value)}
              style={{width:"100%",marginBottom:10}}
            />
          )}

          <input
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            style={{width:"100%",marginBottom:10}}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            style={{width:"100%",marginBottom:16}}
          />

          <button
            className="btn-primary"
            style={{width:"100%"}}
            onClick={handleAuth}
          >
            {loading ? "Please wait..." : (mode==="login"?"Login":"Register")}
          </button>

          <div style={{marginTop:14,fontSize:13}}>

            {mode==="login" ? (
              <span onClick={()=>setMode("register")} style={{cursor:"pointer"}}>
                Create account
              </span>
            ) : (
              <span onClick={()=>setMode("login")} style={{cursor:"pointer"}}>
                Already have account?
              </span>
            )}

          </div>

        </div>
      )}


      {/* HERO SECTION */}
      <div className="hero">

        <div className="hero-content fade-up">

          <div className="hero-eyebrow">AI-Powered Learning Platform</div>

          <h1 className="hero-title">
            Read Smarter.<br/>
            <span className="gradient-text">Learn Faster.</span><br/>
            Go Further.
          </h1>

          <p className="hero-desc">
            Upload any book or PDF. Ask questions, get AI summaries,
            discover your personalized learning path.
          </p>

          <div className="hero-actions">

            <button
              className="btn-primary"
              style={{padding:"16px 36px"}}
              onClick={()=>setShowAuth(true)}
            >
              🚀 Launch the App
            </button>

          </div>

          <div className="hero-stats">
            {HERO_STATS.map(([value,label])=>(
              <div key={label}>
                <div className="hero-stat-value">{value}</div>
                <div className="hero-stat-label">{label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>


      {/* FEATURES */}
      <div className="feature-grid">

        {FEATURES.map((f,i)=>(
          <div key={i} className="glass feature-card">

            <div
              className="feature-icon"
              style={{
                background:`${f.accent}15`,
                border:`1px solid ${f.accent}33`
              }}
            >
              {f.icon}
            </div>

            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>

          </div>
        ))}

      </div>

    </div>
  );
}