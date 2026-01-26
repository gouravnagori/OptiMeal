import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="w-full py-6 mt-auto border-t border-gray-800/50 bg-dark/50 backdrop-blur-sm">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">

                <div className="flex items-center gap-2">
                    <span>Created and Developed by</span>
                    <span className="text-white font-semibold">Gourav Nagori</span>
                </div>

                <div className="flex items-center gap-6">
                    <a
                        href="https://www.linkedin.com/in/gourav-nagori1/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-500 transition-colors"
                        title="LinkedIn"
                    >
                        <FaLinkedin size={20} />
                    </a>
                    <a
                        href="https://github.com/gouravnagori"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                        title="GitHub"
                    >
                        <FaGithub size={20} />
                    </a>
                    <a
                        href="https://www.instagram.com/gourav_nagori"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-pink-500 transition-colors"
                        title="Instagram"
                    >
                        <FaInstagram size={20} />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
