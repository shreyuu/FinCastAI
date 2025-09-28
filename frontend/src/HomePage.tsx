import {BarChart2} from 'lucide-react'
import stockVideo from "./assets/video/Pinterest media.mp4";
import imageLogo from "./assets/photo/reliance.logo.webp";
import { useNavigate } from 'react-router-dom';
function HomePage() {
    const navigate = useNavigate();
    return(
        <div className="mt-20 relative z-10 flex w-screen h-screen">
            <div>
            <input
                type="text"
                placeholder="Search for various stocks........"
                className="absolute z-20 left-1/5 top-5 h-2.5 w-2/5 px-5 py-5 rounded-2xl bg-white transition-all duration-200 focus:shadow-lg focus:shadow-black/10"
              />
              <button className="absolute z-20 left-3/5 top-5 h-11 w-36 rounded-2xl overflow-hidden transition-all duration-200">Search</button>
            </div>
            <div className="animate-fade-slide-up relative top-0 h-screen w-screen bg-gray-50 text-black z-10">
                <div className="absolute left-0 h-screen w-1/2 bg-white">
                    <div className="h-24 flex flex-row items-end pl-24">
                        <BarChart2 className="text-3xl w-15 h-15" />
                        <span className="text-3xl font-bold font-calibri ml-3">GoStock</span>
                     </div>
                     <div className="absolute left-1/5 top-1/4 text-7xl font-bold text-gray-800 font-calibri animate-text-fade-in opacity-0" style={{animationDelay: '0.2s', animationFillMode: 'forwards'}}>Make Better</div>
                     <div className="absolute left-1/5 top-1/3 text-7xl font-bold text-gray-800 font-calibri animate-text-fade-in opacity-0" style={{animationDelay: '0.4s', animationFillMode: 'forwards'}}>Investment</div>
                     <div className="absolute left-1/5 top-2/5 text-7xl font-bold text-gray-800 font-calibri animate-text-fade-in opacity-0" style={{animationDelay: '0.6s', animationFillMode: 'forwards'}}>Make Better</div>
                     <div className="absolute left-1/5 top-1/2 text-7xl font-bold text-gray-800 font-calibri animate-text-fade-in opacity-0" style={{animationDelay: '0.8s', animationFillMode: 'forwards'}}>Decisions With</div>
                     <div className="absolute left-1/5 top-3/5 text-7xl font-bold text-gray-800 font-calibri animate-text-fade-in opacity-0" style={{animationDelay: '1s', animationFillMode: 'forwards'}}>Alternative</div>
                     <div className="absolute left-1/5 top-3/4 text-7xl font-bold text-gray-800 font-calibri animate-text-fade-in opacity-0" style={{animationDelay: '1.2s', animationFillMode: 'forwards'}}>Data.</div>
                     <div className="absolute left-1/5 top-4/5 text-3xl font-bold text-gray-500 font-calibri animate-text-fade-in opacity-0" style={{animationDelay: '1.4s', animationFillMode: 'forwards'}}>Get the inside scoop on companies like</div>
                     <div className="absolute left-1/5 top-5/6 text-3xl font-bold text-gray-500 font-calibri animate-text-fade-in opacity-0" style={{animationDelay: '1.6s', animationFillMode: 'forwards'}}>nerver before.</div>
                </div>

                <div className="flex absolute overflow-hidden w-1/5 h-1/4 bg-white rounded-2xl border border-black/10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex-col justify-around items-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/20">
                    <div className="flex flex-row items-end overflow-hidden">
                        <img className="absolute left-0 top-6 pr-0 pl-4 pb-20" src={imageLogo} width="100"></img>
                        <span className="absolute top-14 text-xl font-bold pb-18 pr-0">Reliance -1.03%</span>
                    </div>
                    <div className="flex flex-row items-end overflow-y-hidden">
                        <span className="text-xl font-bold absolute bottom-16 left-4">₹1,253</span>
                        <span className="text-sm font-bold absolute bottom-16 left-18 text-gray-500">.65</span>
                        <div className="absolute top-44 left-28 border-2 border-red-100 shadow-2xl shadow-red-100 rounded-2xl p-2.5"> 🔻-13.05 </div>
                    </div>
                    
                </div>

                <div className="absolute z-10 top-0 left-1/2 h-screen w-1/2 bg-gray-50">
                    <button className="absolute right-28 font-bold font-calibri text-2xl w-36 top-10 rounded-2xl transition-all duration-200 cursor-pointer hover:bg-gray-800 hover:text-white hover:scale-105" onClick={() => navigate('/login')}>
                    Log in
                    </button>
                    <div className="absolute top-15 w-96 h-auto right-24 rounded-3xl overflow-hidden opacity-0 transform scale-90 animate-fade-slide-up" style={{animationDelay: '2s', animationFillMode: 'forwards'}}>
                        <video width="600" height="750" autoPlay loop muted >
                            <source src={stockVideo} type="video/mp4" />
                        </video>
                    </div>
                    
                </div>
            </div>
            <div className="absolute top-screen h-20 w-screen bg-black z-10">
            </div>
        </div>
    )



}

export default HomePage;