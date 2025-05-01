import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background border-primary">
      <div className="container flex flex-col items-center justify-center gap-4 py-10 md:h-24 md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Copyright   {" "}             
            <Link
              href="/"
              className="font-medium text-primary underline underline-offset-4"
            >
              Gam&apos;Ex 
            </Link> 
            {" "} &copy;
            {" "} 2025
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/terms"
            className="text-sm font-medium underline underline-offset-4"
          >
            Conditions d&apos;utilisation
          </Link>
          <Link
            href="/privacy"
            className="text-sm font-medium underline underline-offset-4"
          >
            Politique de confidentialité
          </Link>
        </div>
      </div>
    </footer>
  )
} 