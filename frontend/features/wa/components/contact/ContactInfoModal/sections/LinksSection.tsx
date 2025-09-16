interface LinksSectionProps {
  isMobile: boolean;
}

export function LinksSection({ isMobile }: LinksSectionProps) {
  const links = [
    { 
      title: 'Marcos Souza on Instagram: "...',
      url: 'www.instagram.com',
      icon: '🔗'
    },
    { 
      title: 'Vidio alumni angkatan 03 -...',
      url: 'drive.google.com',
      icon: '🔗'
    },
    { 
      title: 'dr. Tompi: ini Cara Cegah...',
      url: 'youtu.be',
      icon: '🎥',
      thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=100&h=60&fit=crop'
    },
    { 
      title: 'Mess mahasiswa pelalawan · Ko...',
      url: 'maps.app.goo.gl',
      icon: '📍',
      thumbnail: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100&h=60&fit=crop'
    },
    { 
      title: '10 Tablet 4 Jutaan Terbaik untu...',
      url: 'www.tokopedia.com',
      icon: '🔗',
      thumbnail: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100&h=60&fit=crop'
    },
  ];

  return (
    <div className="space-y-3">
      {links.map((link, index) => (
        <div 
          key={index} 
          className="flex items-start gap-3 p-3 rounded-wa-lg bg-wa-surface hover:bg-wa-hover cursor-pointer transition-colors border border-wa-border"
        >
          <div className={`flex-shrink-0 bg-primary rounded-wa-lg flex items-center justify-center overflow-hidden ${
            isMobile ? 'w-12 h-10' : 'w-16 h-12'
          }`}>
            {link.thumbnail ? (
              <img src={link.thumbnail} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className={isMobile ? 'text-lg' : 'text-2xl'}>{link.icon}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-wa-text font-medium line-clamp-2">{link.title}</p>
            <p className="text-wa-muted text-sm">{link.url}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
