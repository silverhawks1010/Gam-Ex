import Image from 'next/image';

interface PegiRatingProps {
  rating: number;
  country?: string;
  className?: string;
}

const PEGI_IMAGES: Record<string, string> = {
  '3': '/images/pegi/pegi-3.png',
  '7': '/images/pegi/pegi-7.png',
  '12': '/images/pegi/pegi-12.png',
  '16': '/images/pegi/pegi-16.png',
  '18': '/images/pegi/pegi-18.png',
};

// Mapping des pays vers leurs systèmes de classification
const COUNTRY_RATINGS: Record<string, string> = {
  FR: 'PEGI',
  US: 'ESRB',
  JP: 'CERO',
  DE: 'USK',
  AU: 'ACB',
  // Ajoutez d'autres pays selon vos besoins
};

export const PegiRating: React.FC<PegiRatingProps> = ({ 
  rating, 
  country = 'FR',
  className = ''
}) => {
  // Si le pays n'est pas la France, on pourrait afficher un message
  // ou un logo différent selon le pays
  if (country !== 'FR') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-gray-600">
          {COUNTRY_RATINGS[country] || 'PEGI'} {rating}+
        </span>
      </div>
    );
  }

  // Pour la France, on affiche le logo PEGI
  const pegiImage = PEGI_IMAGES[rating.toString()];
  
  if (!pegiImage) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={pegiImage}
        alt={`PEGI ${rating}`}
        width={40}
        height={40}
        className="object-contain"
      />
    </div>
  );
}; 