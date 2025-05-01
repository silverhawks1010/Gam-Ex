import Image from "next/image"
import gamexLogo from "../images/icon-gamex.png"

export function Logo() {
  return (
    <Image
      src={gamexLogo}
      alt="GAM'EX Logo"
      className="h-10 w-auto"
    />
  )
} 