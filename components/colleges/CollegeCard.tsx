import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, ExternalLink } from 'lucide-react'
import type { College } from '@/types'
import Badge from '@/components/ui/Badge'

interface CollegeCardProps {
  college: College & { avg_rating?: number; review_count?: number }
}

export default function CollegeCard({ college }: CollegeCardProps) {
  return (
    <Link href={`/colleges/${college.slug}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-200">
        {/* Cover */}
        <div className="relative h-36 bg-gradient-to-br from-blue-100 to-blue-200">
          {college.cover_url ? (
            <Image
              src={college.cover_url}
              alt={college.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl font-bold text-blue-300 opacity-50">
                {college.name.charAt(0)}
              </span>
            </div>
          )}
          {college.is_featured && (
            <div className="absolute top-2 right-2">
              <Badge variant="orange">Featured</Badge>
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Logo + Name */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm flex-shrink-0 -mt-8 relative z-10">
              {college.logo_url ? (
                <Image
                  src={college.logo_url}
                  alt={`${college.name} logo`}
                  width={48}
                  height={48}
                  className="rounded-lg object-contain"
                />
              ) : (
                <span className="text-xl font-bold text-blue-600">
                  {college.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="pt-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                {college.name}
              </h3>
              {college.affiliation && (
                <p className="text-xs text-gray-500 mt-0.5">{college.affiliation}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{college.location}</span>
          </div>

          {/* Rating */}
          {college.avg_rating && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${star <= Math.round(college.avg_rating!) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600 font-medium">{college.avg_rating.toFixed(1)}</span>
              {college.review_count && (
                <span className="text-xs text-gray-400">({college.review_count})</span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            {college.established_year && (
              <span className="text-xs text-gray-500">Est. {college.established_year}</span>
            )}
            <span className="text-xs text-blue-600 font-medium flex items-center gap-1 ml-auto group-hover:gap-2 transition-all">
              View Profile <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
