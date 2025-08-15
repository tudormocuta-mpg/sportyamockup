import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [showPicard, setShowPicard] = useState(false)
  const [showEngage, setShowEngage] = useState(false)

  useEffect(() => {
    // Show Picard after 3 seconds
    const picardTimer = setTimeout(() => {
      setShowPicard(true)
    }, 3000)

    // Show ENGAGE text after 4.5 seconds
    const engageTimer = setTimeout(() => {
      setShowEngage(true)
    }, 4500)

    // Redirect to tournament scheduler after 6 seconds
    const redirectTimer = setTimeout(() => {
      router.push('/tournament-scheduler')
    }, 6000)

    return () => {
      clearTimeout(picardTimer)
      clearTimeout(engageTimer)
      clearTimeout(redirectTimer)
    }
  }, [router])

  return (
    <>
      <Head>
        <title>Sportya Tournament Scheduler - ENGAGE!</title>
        <meta name="description" content="Professional tournament scheduling and management platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-black overflow-hidden relative">
        {/* Starfield Animation */}
        <div className="starfield">
          {Array.from({ length: 200 }, (_, i) => (
            <div 
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        {/* USS Enterprise Flyby */}
        <div className="enterprise-container">
          <div className="enterprise">
            <div className="enterprise-body">
              <div className="saucer-section"></div>
              <div className="engineering-section"></div>
              <div className="nacelle left-nacelle"></div>
              <div className="nacelle right-nacelle"></div>
            </div>
          </div>
        </div>

        {/* Federation Logo */}
        <div className="federation-logo">
          <div className="logo-circle">
            <div className="logo-star">★</div>
          </div>
        </div>

        {/* Title Animation */}
        <div className="title-container">
          <h1 className="star-trek-title">
            SPORTYA
          </h1>
          <h2 className="subtitle">
            TOURNAMENT SCHEDULER
          </h2>
          <div className="subtitle-line"></div>
        </div>

        {/* Picard Character */}
        {showPicard && (
          <div className="picard-container">
            <div className="picard-silhouette">
              <div className="picard-head"></div>
              <div className="picard-uniform"></div>
              <div className="captain-pips"></div>
            </div>
          </div>
        )}

        {/* ENGAGE Text */}
        {showEngage && (
          <div className="engage-container">
            <div className="engage-text">
              ENGAGE
            </div>
            <div className="engage-glow"></div>
          </div>
        )}

        {/* Warp Effect */}
        <div className="warp-lines">
          {Array.from({ length: 50 }, (_, i) => (
            <div 
              key={i}
              className="warp-line"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <style jsx>{`
          /* Starfield */
          .starfield {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }

          .star {
            position: absolute;
            width: 2px;
            height: 2px;
            background: white;
            border-radius: 50%;
            animation: twinkle infinite ease-in-out;
          }

          @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
          }

          /* Enterprise */
          .enterprise-container {
            position: absolute;
            top: 30%;
            left: -200px;
            animation: enterprise-flyby 4s ease-in-out;
          }

          .enterprise {
            width: 150px;
            height: 80px;
            position: relative;
          }

          .saucer-section {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #888, #ccc);
            border-radius: 50%;
            position: absolute;
            top: 0;
            left: 0;
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
          }

          .engineering-section {
            width: 60px;
            height: 20px;
            background: linear-gradient(135deg, #666, #999);
            border-radius: 10px;
            position: absolute;
            top: 50px;
            left: 70px;
          }

          .nacelle {
            width: 40px;
            height: 8px;
            background: linear-gradient(135deg, #444, #777);
            border-radius: 4px;
            position: absolute;
            left: 90px;
          }

          .left-nacelle {
            top: 35px;
            box-shadow: 0 0 10px #00aaff;
          }

          .right-nacelle {
            top: 65px;
            box-shadow: 0 0 10px #00aaff;
          }

          @keyframes enterprise-flyby {
            0% { left: -200px; transform: scale(0.5) rotate(-5deg); }
            50% { left: 50%; transform: scale(1) rotate(0deg); }
            100% { left: calc(100% + 200px); transform: scale(0.5) rotate(5deg); }
          }

          /* Federation Logo */
          .federation-logo {
            position: absolute;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            animation: logo-appear 2s ease-in-out 1s both;
          }

          .logo-circle {
            width: 100px;
            height: 100px;
            border: 3px solid #ffd700;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
          }

          .logo-star {
            color: #ffd700;
            font-size: 40px;
            text-shadow: 0 0 20px #ffd700;
          }

          @keyframes logo-appear {
            0% { opacity: 0; transform: translateX(-50%) scale(0); }
            100% { opacity: 1; transform: translateX(-50%) scale(1); }
          }

          /* Title */
          .title-container {
            position: absolute;
            top: 35%;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            animation: title-emerge 2s ease-out 1.5s both;
          }

          .star-trek-title {
            font-family: 'Arial Black', Arial, sans-serif;
            font-size: 4rem;
            font-weight: 900;
            color: #ffd700;
            text-shadow: 
              0 0 10px #ffd700,
              0 0 20px #ffd700,
              0 0 30px #ffd700;
            letter-spacing: 0.3em;
            margin-bottom: 10px;
          }

          .subtitle {
            font-family: 'Arial', sans-serif;
            font-size: 1.5rem;
            font-weight: 300;
            color: #00aaff;
            letter-spacing: 0.5em;
            text-shadow: 0 0 10px #00aaff;
          }

          .subtitle-line {
            width: 300px;
            height: 2px;
            background: linear-gradient(90deg, transparent 0%, #00aaff 50%, transparent 100%);
            margin: 20px auto;
            animation: line-glow 2s ease-in-out infinite alternate;
          }

          @keyframes title-emerge {
            0% { 
              opacity: 0; 
              transform: translateX(-50%) translateY(50px) scale(0.8);
            }
            100% { 
              opacity: 1; 
              transform: translateX(-50%) translateY(0) scale(1);
            }
          }

          @keyframes line-glow {
            0% { box-shadow: 0 0 5px #00aaff; }
            100% { box-shadow: 0 0 20px #00aaff, 0 0 30px #00aaff; }
          }

          /* Picard */
          .picard-container {
            position: absolute;
            bottom: 20%;
            right: 10%;
            animation: picard-materialize 1s ease-out both;
          }

          .picard-silhouette {
            width: 120px;
            height: 160px;
            position: relative;
          }

          .picard-head {
            width: 60px;
            height: 80px;
            background: linear-gradient(135deg, #d4a574, #b8956a);
            border-radius: 30px 30px 25px 25px;
            position: absolute;
            top: 0;
            left: 30px;
            border: 2px solid #a0845a;
          }

          .picard-head::before {
            content: '';
            position: absolute;
            width: 40px;
            height: 20px;
            background: #8b7355;
            border-radius: 20px;
            top: 60px;
            left: 10px;
          }

          .picard-uniform {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #cc0000, #990000);
            border-radius: 40px 40px 0 0;
            position: absolute;
            bottom: 0;
            left: 20px;
            border: 2px solid #660000;
          }

          .captain-pips {
            position: absolute;
            top: 85px;
            left: 35px;
            display: flex;
            gap: 3px;
          }

          .captain-pips::before,
          .captain-pips::after {
            content: '';
            width: 8px;
            height: 8px;
            background: #ffd700;
            border-radius: 2px;
            box-shadow: 0 0 5px #ffd700;
          }

          @keyframes picard-materialize {
            0% { 
              opacity: 0; 
              transform: scale(0.5);
              filter: blur(10px);
            }
            100% { 
              opacity: 1; 
              transform: scale(1);
              filter: blur(0px);
            }
          }

          /* ENGAGE Text */
          .engage-container {
            position: absolute;
            bottom: 30%;
            left: 50%;
            transform: translateX(-50%);
            animation: engage-boom 1.5s ease-out both;
          }

          .engage-text {
            font-family: 'Arial Black', Arial, sans-serif;
            font-size: 3rem;
            font-weight: 900;
            color: #ff6600;
            text-shadow: 
              0 0 10px #ff6600,
              0 0 20px #ff6600,
              0 0 30px #ff6600,
              0 0 40px #ff6600;
            letter-spacing: 0.2em;
            animation: engage-pulse 0.5s ease-in-out infinite alternate;
          }

          .engage-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 200px;
            height: 80px;
            background: radial-gradient(ellipse, rgba(255, 102, 0, 0.3) 0%, transparent 70%);
            animation: glow-expand 1.5s ease-out both;
          }

          @keyframes engage-boom {
            0% { 
              opacity: 0; 
              transform: translateX(-50%) scale(2);
            }
            50% { 
              opacity: 1; 
              transform: translateX(-50%) scale(0.8);
            }
            100% { 
              opacity: 1; 
              transform: translateX(-50%) scale(1);
            }
          }

          @keyframes engage-pulse {
            0% { transform: scale(1); }
            100% { transform: scale(1.05); }
          }

          @keyframes glow-expand {
            0% { transform: translate(-50%, -50%) scale(0); }
            100% { transform: translate(-50%, -50%) scale(1); }
          }

          /* Warp Lines */
          .warp-lines {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            opacity: 0;
            animation: warp-activate 2s ease-in-out 5s both;
          }

          .warp-line {
            position: absolute;
            width: 2px;
            height: 100%;
            background: linear-gradient(to bottom, transparent 0%, #00aaff 50%, transparent 100%);
            animation: warp-streak 0.5s linear infinite;
          }

          @keyframes warp-activate {
            0% { opacity: 0; }
            100% { opacity: 0.8; }
          }

          @keyframes warp-streak {
            0% { 
              transform: translateX(-50px) scaleY(0.1);
              opacity: 0;
            }
            50% { 
              transform: translateX(0) scaleY(1);
              opacity: 1;
            }
            100% { 
              transform: translateX(50px) scaleY(0.1);
              opacity: 0;
            }
          }

          /* Responsive */
          @media (max-width: 768px) {
            .star-trek-title {
              font-size: 2.5rem;
            }
            
            .subtitle {
              font-size: 1rem;
            }
            
            .engage-text {
              font-size: 2rem;
            }
            
            .enterprise {
              width: 100px;
              height: 60px;
            }
            
            .picard-container {
              right: 5%;
              transform: scale(0.8);
            }
          }
        `}</style>
      </main>
    </>
  )
}