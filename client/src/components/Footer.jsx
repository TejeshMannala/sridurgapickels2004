import { Facebook, Instagram, Youtube } from 'lucide-react'

const links = {
  instagram: import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com',
  facebook: import.meta.env.VITE_FACEBOOK_URL || 'https://www.facebook.com',
  youtube: import.meta.env.VITE_YOUTUBE_URL || 'https://www.youtube.com',
  whatsapp: import.meta.env.VITE_WHATSAPP_URL || 'https://wa.me/919999999999'
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <p className="text-center text-sm text-gray-600">Sri Kanaka Durga Pickles - Fresh taste, trusted quality.</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <a href={links.instagram} target="_blank" rel="noreferrer" className="rounded-full border p-2 text-pink-600">
            <Instagram size={16} />
          </a>
          <a href={links.facebook} target="_blank" rel="noreferrer" className="rounded-full border p-2 text-blue-600">
            <Facebook size={16} />
          </a>
          <a href={links.youtube} target="_blank" rel="noreferrer" className="rounded-full border p-2 text-red-600">
            <Youtube size={16} />
          </a>
          <a href={links.whatsapp} target="_blank" rel="noreferrer" className="rounded-full border p-2 text-green-600">
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
