import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function GenreCardSkeleton() {
  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="text-center">
        <Skeleton className="h-12 w-12 mx-auto mb-2" />
        <Skeleton className="h-6 w-24 mx-auto" />
      </CardHeader>
      <CardContent className="text-center">
        <Skeleton className="h-4 w-16 mx-auto" />
      </CardContent>
    </Card>
  );
}

export function GameCardSkeleton() {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full pt-0">
      <Skeleton className="h-48 w-full" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-20" />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-6 rounded-full" />
            ))}
          </div>
        </div>
      </CardContent>
      <CardContent>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export function GenreSectionSkeleton() {
  return (
    <section className="py-12 md:py-16">
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <GenreCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function UpcomingGamesSectionSkeleton() {
  return (
    <section className="py-12 md:py-16">
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
} 