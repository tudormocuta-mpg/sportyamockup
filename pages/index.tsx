import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [showPicard, setShowPicard] = useState(false)
  const [showEngage, setShowEngage] = useState(false)
  const [showFinaleEnterprise, setShowFinaleEnterprise] = useState(false)

  useEffect(() => {
    // Show Picard after 1.5 seconds
    const picardTimer = setTimeout(() => {
      setShowPicard(true)
    }, 1500)

    // Show ENGAGE text after 2.5 seconds
    const engageTimer = setTimeout(() => {
      setShowEngage(true)
    }, 2500)

    // Show finale Enterprise after 3.2 seconds
    const finaleTimer = setTimeout(() => {
      setShowFinaleEnterprise(true)
    }, 3200)

    // Redirect to tournament scheduler after 5 seconds
    const redirectTimer = setTimeout(() => {
      router.push('/tournament-scheduler')
    }, 5000)

    return () => {
      clearTimeout(picardTimer)
      clearTimeout(engageTimer)
      clearTimeout(finaleTimer)
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
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
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
            SportyaOS
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

        {/* Finale Enterprise - Massive flyby with SPORTYA */}
        {showFinaleEnterprise && (
          <div className="finale-enterprise-container">
            <div className="finale-enterprise">
              <div className="finale-enterprise-body">
                <div className="finale-saucer-section">
                </div>
                <div className="finale-engineering-section"></div>
                <div className="finale-nacelle finale-left-nacelle"></div>
                <div className="finale-nacelle finale-right-nacelle"></div>
              </div>
            </div>
          </div>
        )}

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

          /* Finale Enterprise - MASSIVE */
          .finale-enterprise-container {
            position: fixed;
            top: 50%;
            right: -800px;
            transform: translateY(-50%);
            z-index: 1000;
            animation: finale-enterprise-swoosh 1.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) both;
          }

          .finale-enterprise {
            width: 800px;
            height: 400px;
            position: relative;
            filter: drop-shadow(0 0 50px rgba(255, 255, 255, 0.8));
          }

          .finale-enterprise-body {
            width: 100%;
            height: 100%;
            position: relative;
          }

          .finale-saucer-section {
            width: 400px;
            height: 400px;
            background: linear-gradient(135deg, #888, #ccc, #fff);
            border-radius: 50%;
            position: absolute;
            top: 0;
            left: 0;
            box-shadow: 
              0 0 150px rgba(255, 255, 255, 0.8),
              0 0 200px rgba(0, 170, 255, 0.5),
              inset 0 0 100px rgba(255, 255, 255, 0.4),
              inset 0 0 50px rgba(0, 170, 255, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 5px solid #bbb;
          }

          .sportya-text {
            font-family: 'Arial Black', Arial, sans-serif;
            font-size: 3rem;
            font-weight: 900;
            color: #003366;
            text-shadow: 
              0 0 20px rgba(255, 255, 255, 0.8),
              2px 2px 4px rgba(0, 0, 0, 0.5);
            letter-spacing: 0.1em;
            transform: perspective(200px) rotateX(20deg);
          }

          .finale-engineering-section {
            width: 300px;
            height: 80px;
            background: linear-gradient(135deg, #666, #999, #ccc);
            border-radius: 40px;
            position: absolute;
            top: 200px;
            left: 350px;
            box-shadow: 0 0 40px rgba(255, 255, 255, 0.4);
            border: 3px solid #777;
          }

          .finale-nacelle {
            width: 200px;
            height: 40px;
            background: linear-gradient(135deg, #444, #777, #aaa);
            border-radius: 20px;
            position: absolute;
            left: 500px;
            border: 2px solid #555;
          }

          .finale-left-nacelle {
            top: 120px;
            box-shadow: 
              0 0 50px #00aaff,
              0 0 100px #00aaff;
            animation: nacelle-pulse 0.2s ease-in-out infinite alternate;
          }

          .finale-right-nacelle {
            top: 280px;
            box-shadow: 
              0 0 50px #00aaff,
              0 0 100px #00aaff;
            animation: nacelle-pulse 0.2s ease-in-out infinite alternate 0.1s;
          }

          @keyframes finale-enterprise-swoosh {
            0% { 
              right: -1000px; 
              transform: translateY(-50%) scale(0.5) rotate(15deg);
              opacity: 0;
              filter: blur(5px);
            }
            15% { 
              right: 40%; 
              transform: translateY(-50%) scale(1.5) rotate(-2deg);
              opacity: 1;
              filter: blur(0px) brightness(1.2);
            }
            30% { 
              right: 50%; 
              transform: translateY(-50%) scale(1.3) rotate(0deg);
              opacity: 1;
              filter: blur(0px) brightness(1.3);
            }
            100% { 
              right: calc(100% + 1000px); 
              transform: translateY(-50%) scale(0.3) rotate(-20deg);
              opacity: 0;
              filter: blur(10px);
            }
          }

          @keyframes nacelle-pulse {
            0% { 
              box-shadow: 
                0 0 50px #00aaff,
                0 0 100px #00aaff;
            }
            100% { 
              box-shadow: 
                0 0 80px #00aaff,
                0 0 150px #00aaff,
                0 0 200px rgba(0, 170, 255, 0.5);
            }
          }

          /* Federation Logo */
          .federation-logo {
            position: absolute;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            animation: logo-appear 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s both;
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
            animation: title-emerge 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s both;
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
              transform: translateX(-50%) translateY(100px) scale(0.3) rotateX(90deg);
            }
            50% { 
              opacity: 1; 
              transform: translateX(-50%) translateY(-10px) scale(1.1) rotateX(0deg);
            }
            100% { 
              opacity: 1; 
              transform: translateX(-50%) translateY(0) scale(1) rotateX(0deg);
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
            animation: picard-materialize 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) both;
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
            animation: engage-boom 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) both;
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
            animation: engage-pulse 0.2s ease-in-out infinite alternate;
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
              transform: translateX(-50%) scale(3) rotateZ(180deg);
              filter: blur(20px);
            }
            40% { 
              opacity: 1; 
              transform: translateX(-50%) scale(0.7) rotateZ(-10deg);
              filter: blur(0px);
            }
            70% { 
              transform: translateX(-50%) scale(1.2) rotateZ(5deg);
            }
            100% { 
              opacity: 1; 
              transform: translateX(-50%) scale(1) rotateZ(0deg);
              filter: blur(0px) brightness(1.2);
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
            animation: warp-activate 1.2s ease-in-out 3.5s both;
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